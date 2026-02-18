from sentence_transformers import SentenceTransformer
from app.config import settings
import numpy as np

class EmbeddingService:
    def __init__(self):
        self.model = SentenceTransformer(settings.EMBEDDING_MODEL)

    def generate_embeddings(self, texts: list[str]) -> np.ndarray:
        """
        Generates normalized embeddings for a list of texts.
        """
        embeddings = self.model.encode(texts)
        # Normalize for cosine similarity matching
        norms = np.linalg.norm(embeddings, axis=1, keepdims=True)
        return embeddings / norms

    def generate_query_embedding(self, query: str) -> np.ndarray:
        """
        Generates normalized embedding for a single query.
        """
        embedding = self.model.encode([query])[0]
        return embedding / np.linalg.norm(embedding)

embedding_service = EmbeddingService()
