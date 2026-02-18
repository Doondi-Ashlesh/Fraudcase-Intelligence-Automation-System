import os
from app.utils.chunking import get_text_chunks
from app.services.embedding_service import embedding_service
from app.services.vector_store_service import vector_store
from app.config import settings
import PyPDF2

class IngestionService:
    def __init__(self, data_path: str):
        self.data_path = data_path

    def process_all(self):
        """
        Walks through data directory, processes txt and pdf files,
        generates embeddings, and updates the vector store.
        """
        if not os.path.exists(self.data_path):
            print(f"Error: Data path {self.data_path} does not exist.")
            return 0
            
        all_chunks = []
        for filename in os.listdir(self.data_path):
            file_path = os.path.join(self.data_path, filename)
            if filename.endswith(".txt"):
                text = self._read_txt(file_path)
                chunks = get_text_chunks(text, source=filename, doc_type="txt")
                all_chunks.extend(chunks)
            elif filename.endswith(".pdf"):
                text = self._read_pdf(file_path)
                chunks = get_text_chunks(text, source=filename, doc_type="pdf")
                all_chunks.extend(chunks)

        if all_chunks:
            texts = [c.content for c in all_chunks]
            embeddings = embedding_service.generate_embeddings(texts)
            vector_store.add_chunks(all_chunks, embeddings)
            vector_store.save()
            return len(all_chunks)
        return 0

    def _read_txt(self, file_path: str) -> str:
        with open(file_path, "r", encoding="utf-8") as f:
            return f.read()

    def _read_pdf(self, file_path: str) -> str:
        text = ""
        with open(file_path, "rb") as f:
            reader = PyPDF2.PdfReader(f)
            for page in reader.pages:
                text += page.extract_text() or ""
        return text

ingestion_service = IngestionService(data_path=settings.DATA_PATH)
