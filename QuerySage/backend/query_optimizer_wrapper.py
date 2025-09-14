# query_optimizer_wrapper.py
import os, json, requests, numpy as np, faiss
from sentence_transformers import SentenceTransformer

def run_query_optimizer(log_path="query_log/query_log.json",
                        txt_out="query_log/optimized_queries.txt",
                        json_out="query_log/optimized_queries.json"):
    with open(log_path) as f:
        raw_logs = json.load(f)

    normalized = []
    for log in raw_logs:
        if isinstance(log, str):
            normalized.append({"db_type": "sql", "query": log})
        elif isinstance(log, dict) and "query" in log and "db_type" in log:
            normalized.append(log)

    queries = [f"DB: {l['db_type']} | Query: {l['query']}" for l in normalized]
    embedder = SentenceTransformer("all-MiniLM-L6-v2")
    embeddings = embedder.encode(queries, convert_to_numpy=True)
    index = faiss.IndexFlatL2(embeddings.shape[1])
    index.add(embeddings)

    results = []
    for i, log in enumerate(normalized):
        q_emb = embedder.encode([queries[i]], convert_to_numpy=True)
        D, I = index.search(np.array(q_emb), 3)
        context = "\n".join([queries[j] for j in I[0] if j != i])
        prompt = f"Optimize: {log['query']}\nContext:\n{context}"
        results.append({"query": log["query"], "db_type": log["db_type"], "suggestions": prompt})

    # Save
    with open(txt_out, "w") as f:
        for r in results:
            f.write(f"{r['db_type']} | {r['query']}\n{r['suggestions']}\n{'='*40}\n")
    with open(json_out, "w") as f:
        json.dump(results, f, indent=2)
    return results
