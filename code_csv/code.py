import os
import pandas as pd
import sqlite3, pymysql, psycopg2
from pymongo import MongoClient
import requests
from urllib.parse import quote_plus

def export_database(db_type, conn_string, output_folder, db_name=None):
    """
    Universal function to export SQL, MongoDB, or JSON API to CSV.
    
    Args:
        db_type (str): "sqlite", "mysql", "postgres", "mongo", or "json"
        conn_string (str): Connection string / link to DB or API
        output_folder (str): Folder to save CSV files
        db_name (str, optional): MongoDB database name (optional for Atlas or remote)
    """
    os.makedirs(output_folder, exist_ok=True)

    # ==================== SQL ====================
    if db_type in ["sqlite", "mysql", "postgres"]:
        if db_type == "sqlite":
            conn = sqlite3.connect(conn_string)

        elif db_type == "mysql":
            host, user, password, db = conn_string.split(",")
            conn = pymysql.connect(host=host, user=user, password=password, database=db)

        elif db_type == "postgres":
            host, user, password, db = conn_string.split(",")
            conn = psycopg2.connect(host=host, user=user, password=password, dbname=db)

        cursor = conn.cursor()
        if db_type == "mysql":
            cursor.execute("SHOW TABLES;")
        else:  # postgres & sqlite
            cursor.execute(
                "SELECT name FROM sqlite_master WHERE type='table';"
                if db_type == "sqlite"
                else "SELECT table_name FROM information_schema.tables WHERE table_schema='public';"
            )

        tables = [row[0] for row in cursor.fetchall()]

        for table in tables:
            df = pd.read_sql(f"SELECT * FROM {table}", conn)
            df.to_csv(f"{output_folder}/{table}.csv", index=False)
            print(f"✅ Exported table {table} to {output_folder}/{table}.csv")

        conn.close()

    # ==================== MongoDB ====================
    elif db_type == "mongo":
        client = MongoClient(conn_string)

        # Auto-detect MongoDB database if not provided
        if not db_name:
            db_list = client.list_database_names()
            db_list = [d for d in db_list if d not in ("admin", "local", "config")]
            if not db_list:
                raise ValueError("No user databases found in this MongoDB instance.")
            db_name = db_list[0]
            print(f"ℹ️ Auto-detected database: {db_name}")

        db = client[db_name]

        for coll_name in db.list_collection_names():
            data = list(db[coll_name].find({}, {"_id": 0}))
            if data:
                df = pd.DataFrame(data)
                df.to_csv(f"{output_folder}/{coll_name}.csv", index=False)
                print(f"✅ Exported collection '{coll_name}' to {output_folder}/{coll_name}.csv")

    # ==================== JSON / API ====================
    elif db_type == "json":
        response = requests.get(conn_string)
        response.raise_for_status()
        data = response.json()
        df = pd.json_normalize(data)
        df.to_csv(f"{output_folder}/api_data.csv", index=False)
        print(f"✅ Exported JSON API to {output_folder}/api_data.csv")

    else:
        raise ValueError("Unsupported db_type. Use sqlite/mysql/postgres/mongo/json.")


# ==================== EXAMPLES ====================

# ---------- Example 1: MongoDB Atlas ----------
# Replace with your actual Atlas URI (from "Connect → Connect your application")
atlas_uri = "mongodb+srv://akshat:akshat123@cluster0.nfpd6xw.mongodb.net/"
export_database("mongo", atlas_uri, "output_mongo")

# ---------- Example 2: Local/Remote MongoDB ----------
# Replace FRIEND_IP with your friend's laptop IP
# local_conn = f"mongodb://akshat:{quote_plus('akshat123')}@172.20.9.31:27017/videotube"
# export_database("mongo", local_conn, "output_remote_mongo")

# ---------- Example 3: JSON API ----------
# export_database("json", "https://api.example.com/data", "output_api")

# ---------- Example 4: SQLite ----------
# export_database("sqlite", "mydb.sqlite", "output_sqlite")

# ---------- Example 5: MySQL ----------
# mysql_conn = "host,user,password,dbname"
# export_database("mysql", mysql_conn, "output_mysql")

# ---------- Example 6: PostgreSQL ----------
# postgres_conn = "host,user,password,dbname"
# export_database("postgres", postgres_conn, "output_postgres")