import os
import json
import pickle
import numpy as np
import time
import psutil
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from sentence_transformers import SentenceTransformer
import faiss
import PyPDF2
import requests
from query_optimizer_wrapper import run_query_optimizer
from csv_corrector_wrapper import run_csv_cleanup

# ----------------- CONFIG -----------------
LLM_API_KEY = os.environ.get("LLM_API_KEY")
LLM_API_URL = os.environ.get("LLM_API_URL")
EMB_MODEL = os.environ.get("EMB_MODEL", "all-MiniLM-L6-v2")
FAISS_PATH = os.environ.get("FAISS_PATH", "index.faiss")
EMB_PATH = os.environ.get("EMB_PATH", "embeddings.npy")
DOCS_PATH = os.environ.get("DOCS_PATH", "docs.pkl")
PDF_PATH = os.environ.get("PDF_PATH", "dbms.pdf")
REINDEX_SECRET = os.environ.get("REINDEX_SECRET", "change-me")

RAW_DATA_PATH = "db_extract/db_extract/db_extract.csv"
CSV_OUTPUT_PATH = "output/output/formatted_db.csv"
PLOT_PATH = "output/output/clustering_plot.png"
QUERY_LOG_PATH = "query_log/query_log"  # fixed nested path
START_TIME = time.time()

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

embedder = None
index = None
docs = None
embeddings = None


# ----------------- PDF TEXT & INDEX -----------------
def extract_texts_from_pdf(path):
    texts = []
    with open(path, "rb") as f:
        reader = PyPDF2.PdfReader(f)
        for page in reader.pages:
            txt = page.extract_text()
            if txt:
                texts.append(txt.strip())
    return texts


def build_index(pdf_path=PDF_PATH, emb_model=EMB_MODEL):
    global embedder, index, docs, embeddings
    print("Building index from PDF:", pdf_path)
    docs = extract_texts_from_pdf(pdf_path)
    embedder = SentenceTransformer(emb_model)
    embeddings = embedder.encode(docs, show_progress_bar=True, convert_to_numpy=True)
    d = embeddings.shape[1]
    index = faiss.IndexFlatL2(d)
    index.add(np.array(embeddings).astype("float32"))
    faiss.write_index(index, FAISS_PATH)
    np.save(EMB_PATH, embeddings)
    with open(DOCS_PATH, "wb") as f:
        pickle.dump(docs, f)
    print("Index built and saved.")
    return True


def load_index():
    global embedder, index, docs, embeddings
    embedder = SentenceTransformer(EMB_MODEL)
    if os.path.exists(FAISS_PATH) and os.path.exists(EMB_PATH) and os.path.exists(DOCS_PATH):
        index = faiss.read_index(FAISS_PATH)
        embeddings = np.load(EMB_PATH)
        with open(DOCS_PATH, "rb") as f:
            docs = pickle.load(f)
        print("Index and docs loaded from disk.")
        return True
    return build_index()


# ----------------- HEALTH CHECK -----------------
@app.route("/health")
def health():
    return jsonify({"status": "ok"})


# ----------------- REINDEX -----------------
@app.route("/reindex", methods=["POST"])
def reindex():
    secret = request.headers.get("X-REINDEX-SECRET") or (request.json or {}).get("secret")
    if secret != REINDEX_SECRET:
        return jsonify({"error": "forbidden"}), 403
    build_index()
    return jsonify({"status": "reindexed"})


# ----------------- QUERY -----------------
@app.route("/query", methods=["POST"])
def query():
    data = request.json or {}
    q = data.get("query")
    history = data.get("history", [])
    k = int(data.get("k", 3))

    if not q:
        return jsonify({"error": "no query provided"}), 400

    q_emb = embedder.encode([q], convert_to_numpy=True).astype("float32")
    D, I = index.search(q_emb, k)
    retrieved = [docs[i] for i in I[0] if i < len(docs)]
    context = "\n\n".join(retrieved)

    conversation = "\n".join([f"{m['from']}: {m['text']}" for m in history])
    prompt = f"Conversation so far:\n{conversation}\nUser: {q}\nContext:\n{context}\nAnswer concisely:"

    if not LLM_API_KEY or not LLM_API_URL:
        answer = f"(Local mode) Based on the PDF:\n\n{context[:800]}..."
        return jsonify({"answer": answer, "retrieved": retrieved})

    headers = {
        "Authorization": f"Bearer {LLM_API_KEY}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": os.environ.get("LLM_MODEL", "gpt-4o-mini"),
        "messages": [{"role": "user", "content": prompt}],
        "max_tokens": int(os.environ.get("MAX_TOKENS", 300)),
    }

    try:
        resp = requests.post(LLM_API_URL, headers=headers, json=payload, timeout=30)
    except Exception as e:
        return jsonify({"error": "LLM connection failed", "details": str(e)}), 502

    if resp.status_code != 200:
        return jsonify({"error": "LLM error", "details": resp.text}), 502

    j = resp.json()
    answer = j.get("choices", [{}])[0].get("message", {}).get("content") or j.get("result") or ""

    return jsonify({"answer": answer, "retrieved": retrieved})


# ----------------- OPTIMIZE QUERIES -----------------
@app.route("/optimize_queries", methods=["POST"])
def optimize_queries():
    if not os.path.exists(RAW_DATA_PATH):
        return jsonify({"error": "Raw data file not found"}), 404

    os.makedirs(QUERY_LOG_PATH, exist_ok=True)

    try:
        run_query_optimizer(
            log_path=RAW_DATA_PATH,
            txt_out=os.path.join(QUERY_LOG_PATH, "optimized_queries.txt"),
            json_out=os.path.join(QUERY_LOG_PATH, "optimized_queries.json")
        )
        return jsonify({"status": "optimization complete"})
    except Exception as e:
        return jsonify({"error": "optimization failed", "details": str(e)}), 500


# ----------------- CSV CLEANUP -----------------
@app.route("/csv_cleanup", methods=["POST"])
def csv_cleanup():
    os.makedirs(QUERY_LOG_PATH, exist_ok=True)
    run_csv_cleanup(input_folder="db_extract/db_extract", output_folder=QUERY_LOG_PATH)
    return jsonify({"status": "CSV cleanup complete"})


# ----------------- GET CSV DB -----------------
@app.route("/get_csv_db", methods=["GET"])
def get_csv_db():
    if os.path.exists(CSV_OUTPUT_PATH):
        return send_file(CSV_OUTPUT_PATH, mimetype="text/csv", as_attachment=True)
    return jsonify({"error": "CSV not found"}), 404


# ----------------- SERVE CLUSTERING PLOT -----------------
@app.route("/clustering_plot", methods=["GET"])
def clustering_plot():
    if os.path.exists(PLOT_PATH):
        return send_file(PLOT_PATH, mimetype="image/png")
    return jsonify({"error": "Clustering plot not found"}), 404


# ----------------- SYSTEM METRICS -----------------
@app.route("/system_metrics", methods=["GET"])
def system_metrics():
    mem = psutil.virtual_memory()
    disk = psutil.disk_usage('/')
    db_file_size = os.path.getsize(CSV_OUTPUT_PATH) / (1024 * 1024) if os.path.exists(CSV_OUTPUT_PATH) else 0
    uptime = int(time.time() - START_TIME)

    return jsonify({
        "memory_percent": mem.percent,
        "disk_percent": disk.percent,
        "db_file_size_mb": round(db_file_size, 2),
        "uptime_seconds": uptime
    })


if __name__ == "__main__":
    print(">>> Starting backend...")
    load_index()
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000)), debug=True)
