import os
from app.config import settings

class IngestionService:
    def __init__(self, data_path: str):
        self.data_path = data_path

    def process_all(self):
        """
        Vectorless Architecture: No longer generates embeddings.
        Simply validates the data directory exists.
        """
        if not os.path.exists(self.data_path):
            print(f"Error: Data path {self.data_path} does not exist.")
            return 0
            
        files = [f for f in os.listdir(self.data_path) if f.endswith((".txt", ".md", ".pdf"))]
        print(f"Knowledge Base active with {len(files)} source documents.")
        return len(files)

ingestion_service = IngestionService(data_path=settings.DATA_PATH)
