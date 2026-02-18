import os
import requests
from app.services.ingestion_service import ingestion_service

def trigger_ingestion():
    """
    Manually triggers the ingestion process for the data/ directory.
    """
    print("Starting ingestion...")
    count = ingestion_service.process_all()
    print(f"Ingested {count} chunks into the vector store.")

if __name__ == "__main__":
    trigger_ingestion()
