import faiss
import os
import pickle
import numpy as np
from app.config import settings
from app.models.schemas import DocumentChunk

class VectorStore:
    def __init__(self):
        self.dimension = 384  # Dimension for all-MiniLM-L6-v2
        self.index = faiss.IndexFlatIP(self.dimension) # Inner Product for cosine similarity (normalized vectors)
        self.chunks: list[DocumentChunk] = []
        self.index_path = settings.VECTOR_DB_PATH

    def add_chunks(self, chunks: list[DocumentChunk], embeddings: np.ndarray):
        """
        Adds chunks and their embeddings to the FAISS index.
        """
        self.index.add(embeddings.astype("float32"))
        self.chunks.extend(chunks)

    def search(self, query_embedding: np.ndarray, k: int = 5) -> list[dict]:
        """
        Performs similarity search.
        Returns list of results with scores and metadata.
        """
        if self.index.ntotal == 0:
            return []
            
        distances, indices = self.index.search(query_embedding.reshape(1, -1).astype("float32"), k)
        
        results = []
        for i, idx in enumerate(indices[0]):
            if idx != -1:
                results.append({
                    "chunk": self.chunks[idx],
                    "score": float(distances[0][i])
                })
        return results

    def save(self):
        """
        Persists index and chunk metadata locally.
        """
        os.makedirs(os.path.dirname(self.index_path), exist_ok=True)
        faiss.write_index(self.index, self.index_path + ".index")
        with open(self.index_path + ".chunks", "wb") as f:
            pickle.dump(self.chunks, f)

    def load(self):
        """
        Loads index and chunk metadata.
        """
        if os.path.exists(self.index_path + ".index"):
            self.index = faiss.read_index(self.index_path + ".index")
            with open(self.index_path + ".chunks", "rb") as f:
                self.chunks = pickle.load(f)

vector_store = VectorStore()
