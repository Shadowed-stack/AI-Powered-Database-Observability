# csv_corrector_wrapper.py
import os, pandas as pd, numpy as np, matplotlib.pyplot as plt
from sklearn.cluster import KMeans, DBSCAN
from sklearn.preprocessing import StandardScaler

def run_csv_cleanup(input_folder="db_extract", output_folder="output", graph_folder="graph_output"):
    os.makedirs(output_folder, exist_ok=True)
    os.makedirs(graph_folder, exist_ok=True)

    file_path = os.path.join(input_folder, "db_extract.csv")
    df = pd.read_csv(file_path)
    df = df[df.columns[df.isnull().mean() <= 0.5]]

    numeric_cols = df.select_dtypes(include=[np.number]).columns
    scaler = StandardScaler()
    scaled = scaler.fit_transform(df[numeric_cols].fillna(0))

    kmeans = KMeans(n_clusters=min(10, len(df)), random_state=42)
    clusters = kmeans.fit_predict(scaled)

    for col_idx, col in enumerate(numeric_cols):
        for i in range(len(df)):
            if pd.isnull(df.loc[i, col]):
                df.loc[i, col] = kmeans.cluster_centers_[clusters[i]][col_idx]

    if len(numeric_cols) >= 2:
        plt.scatter(df[numeric_cols[0]], df[numeric_cols[1]], c=clusters, s=50)
        plt.savefig(os.path.join(graph_folder, "clustering_plot.png"))
    df.to_csv(os.path.join(output_folder, "formatted_db.csv"), index=False)
    return os.path.join(output_folder, "formatted_db.csv")
