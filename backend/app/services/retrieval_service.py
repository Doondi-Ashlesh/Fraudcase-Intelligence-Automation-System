from app.services.embedding_service import embedding_service
from app.services.vector_store_service import vector_store

class RetrievalService:
    def __init__(self):
        self.confidence_threshold = 0.6

    def retrieve(self, query: str, k: int = 5) -> dict:
        """
        Full retrieval flow: query -> embedding -> search -> processing.
        """
        query_embedding = embedding_service.generate_query_embedding(query)
        search_results = vector_store.search(query_embedding, k=k)
        
        relevant_chunks = []
        is_low_confidence = True
        
        for res in search_results:
            if res["score"] >= self.confidence_threshold:
                is_low_confidence = False
            relevant_chunks.append(res)
            
        return {
            "chunks": relevant_chunks,
            "low_confidence_warning": is_low_confidence,
            "top_score": search_results[0]["score"] if search_results else 0.0
        }

retrieval_service = RetrievalService()
