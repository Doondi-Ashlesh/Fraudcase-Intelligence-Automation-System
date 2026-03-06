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
            if filename.endswith(".md") or filename.endswith(".txt") or filename.endswith(".json"):
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
You are a highly specialized fraud routing agent.
Your task is to select the most appropriate Standard Operating Procedure (SOP) for a given fraud report reason.

AVAILABLE SOPs:
{doc_summaries}

USER REPORT REASON: "{query}"

ROUTING GUIDELINES:
- If 'card testing', 'sequential small amounts', or 'velocity spikes' are mentioned, prioritize 'CNP_FRAUD_005.md'.
- If 'safe account', 'impersonation', or 'phone call from bank' are mentioned, prioritize 'APP_SCAM_008.md'.
- If 'device change', 'unauthorized wire', or 'session takeover' are mentioned, prioritize 'SO_ATO_001.md'.
- If 'SSN discrepancy', 'synthetic account', or 'credit bust-out' are mentioned, prioritize 'TECH_SYNTH_012.md'.

Respond with ONLY the filename (e.g., 'SOP_NAME.md') of the most relevant SOP. If absolutely no match is found, respond 'NONE'.
"""
        # We use a simplified llm call for routing
        best_doc_name = llm_service.generate_answer(reasoning_prompt, "Select the best SOP filename.").strip()
        
        # Hyper-robust matching: Check for filename or title in the response
        selected_doc = None
        best_doc_name_lower = best_doc_name.lower()
        
        # 1. Try Filename match
        for d in docs:
            if d['filename'].lower() in best_doc_name_lower:
                selected_doc = d
                break
        
        # 2. Try Title match (if no filename match)
        if not selected_doc:
            for d in docs:
                if d['title'].lower() in best_doc_name_lower:
                    selected_doc = d
                    break
        
        if not selected_doc:
            return {
                "chunks": [],
                "low_confidence_warning": True,
                "top_score": 0.0
            }

        # Mock a chunk structure to keep compatibility with the routes/frontend
        from app.models.schemas import DocumentChunk
        chunk = DocumentChunk(
            id=selected_doc["filename"],
            content=selected_doc["content"],
            metadata={"source": selected_doc["filename"]}
        )

        return {
            "chunks": [{"chunk": chunk, "score": 1.0}],
            "low_confidence_warning": False,
            "top_score": 1.0
        }

retrieval_service = RetrievalService()
