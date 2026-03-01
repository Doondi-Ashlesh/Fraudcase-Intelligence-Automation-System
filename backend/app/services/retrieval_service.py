import os
from app.services.llm_service import llm_service
from app.config import settings

class RetrievalService:
    def __init__(self):
        self.data_path = settings.DATA_PATH

    def _get_available_docs(self):
        """
        List all markdown/text files in the data directory and extract their titles/summaries.
        """
        docs = []
        for filename in os.listdir(self.data_path):
            if filename.endswith(".md") or filename.endswith(".txt"):
                file_path = os.path.join(self.data_path, filename)
                with open(file_path, "r", encoding="utf-8") as f:
                    content = f.read()
                    # Extract title (first line)
                    title = content.split('\n')[0].replace('#', '').strip()
                    docs.append({
                        "filename": filename,
                        "title": title,
                        "content": content
                    })
        return docs

    def retrieve(self, query: str) -> dict:
        """
        Reasoning-based retrieval:
        1. List available documents.
        2. Use LLM to reason which document is most relevant.
        3. Return that document as a chunk.
        """
        docs = self._get_available_docs()
        doc_summaries = "\n".join([f"- {d['filename']}: {d['title']}" for d in docs])
        
        reasoning_prompt = f"""
You are a routing expert for a fraud intelligence system.
Given the user query, identify which of the following standard operating procedures (SOPs) is most relevant.

Available SOPs:
{doc_summaries}

User Query: "{query}"

Respond with ONLY the filename of the most relevant SOP. If none are relevant, respond with "NONE".
"""
        # We use a simplified llm call for routing
        best_doc_name = llm_service.generate_answer(reasoning_prompt, "Select the best SOP filename.").strip()
        
        # Cleanup response in case LLM adds extra text
        best_doc_name = best_doc_name.split('\n')[0].strip()
        
        selected_doc = next((d for d in docs if d['filename'] in best_doc_name), None)
        
        if not selected_doc:
            return {
                "chunks": [],
                "low_confidence_warning": True,
                "top_score": 0.0
            }

        # Mock a chunk structure to keep compatibility with the routes/frontend
        from app.models.schemas import DocumentChunk
        chunk = DocumentChunk(
            content=selected_doc["content"],
            metadata={"source": selected_doc["filename"]}
        )

        return {
            "chunks": [{"chunk": chunk, "score": 1.0}],
            "low_confidence_warning": False,
            "top_score": 1.0
        }

retrieval_service = RetrievalService()
