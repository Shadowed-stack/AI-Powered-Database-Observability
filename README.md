# QuerySage 🧙‍♂️  
**AI-Powered Database Observability & Optimization Tool**

QuerySage is a comprehensive tool to **monitor, analyze, and optimize database queries**. It captures query logs, analyzes patterns, and provides actionable suggestions to improve database performance and efficiency.

---

## 🚀 Features

- **Query Collection**  
  - Capture SQL queries in real-time  
  - Store logs in `query_log.json` for analysis  

- **Query Analysis & Optimization**  
  - Identify slow or inefficient queries  
  - Suggest indexing, restructuring, and optimization  
  - Estimate performance improvements  

- **Visualization**  
  - Graph query trends, frequency, and execution times (via Matplotlib)  

- **CSV Export**  
  - Export logs and analysis results to CSV for offline processing  

- **Modular & Extensible**  
  - Easily extend collectors, optimizers, or visualizers  

---

## 📂 Project Structure

```
QuerySage/
├── collectors/
│   ├── query_collector.py      # Capture queries from DB/log
│   └── csv_collector.py        # Export logs to CSV
├── optimizers/
│   └── query_optimizer.py      # Suggest query improvements
├── utils/
│   └── helpers.py              # Utility functions
├── query_log/
│   └── query_log.json          # Captured query logs
├── app.py                      # Main trigger
├── requirements.txt            # Python dependencies
└── README.md                   # Documentation
```

---

## ⚙️ Installation

```bash
git clone https://github.com/yourusername/QuerySage.git
cd QuerySage
pip install -r requirements.txt
```

---

## 🛠️ Usage

### 1. Run the Profiler
Provide a **database link, user ID, and password** as input:

```bash
python app.py --db_link "your_db_link" --user "username" --password "password"
```

This will:
- Process the database structure and contents  
- Generate a **CSV report**  
- Produce **visual graphs** for profiling insights  

### 2. Optimize Query Logs
If you already have query logs in JSON format (`query_log/query_log.json`):

```bash
python optimizers/query_optimizer.py --log query_log/query_log.json
```

This will:
- Analyze query execution patterns  
- Suggest **indexing, restructuring, and optimizations**  
- Output refined recommendations  

### 3. Export to CSV

```bash
python collectors/csv_collector.py --input query_log/query_log.json --output output/formatted_db.csv
```

---

## 📊 Example Output
- **CSV Report:** Comprehensive database profiling results  
- **Graphs:** Query trends, frequency, execution time distribution  
- **Optimized Suggestions:** Actionable steps for better performance  

---

## 🔧 Technical Approach
1. **Automated Database Profiling** – Connect to DB, extract schema & contents, generate CSV + graphs.  
2. **Query Log Optimization** – Parse JSON logs, analyze inefficiencies, recommend improvements.  
3. **Integrated Data Pipeline** – End-to-end workflow combining profiling, visualization, and optimization.  

---

## 📌 License
This project is licensed under the MIT License. Feel free to use and modify.

---

## 👨‍💻 Contributors
- Ashirwad Mishra
- Saptarshi Banerjee
- Soham Rastogi
- Akshat Bhatt
- IIT (BHU) Varanasi  
