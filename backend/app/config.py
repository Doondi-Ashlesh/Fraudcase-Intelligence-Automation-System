import os
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

load_dotenv()

# Get the absolute path of the 'backend' directory
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

class Settings(BaseSettings):
    PROJECT_NAME: str = "FraudSight AI"
    API_V1_STR: str = "/api/v1"
    
    # LLM Settings
    LLM_MODE: str = os.getenv("LLM_MODE", "Mock") # Ollama, HuggingFace, or Mock
    OLLAMA_BASE_URL: str = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
    OLLAMA_MODEL: str = os.getenv("OLLAMA_MODEL", "llama3")
    HF_API_KEY: str = os.getenv("HF_API_KEY", "")
    HF_MODEL: str = os.getenv("HF_MODEL", "meta-llama/Llama-3-8b-instruct")

    # Vector Storage
    VECTOR_DB_PATH: str = os.path.join(BASE_DIR, "vector_store", "faiss_index")
    DATA_PATH: str = os.path.join(BASE_DIR, "data")
    EMBEDDING_MODEL: str = "all-MiniLM-L6-v2"
    
    # Transaction Datasets
    TRANSACTIONS_DATA_PATH: str = os.path.join(BASE_DIR, "data", "transactions.json")
    
    # DB Settings
    DATABASE_URL: str = f"sqlite:///{os.path.join(BASE_DIR, 'app', 'db', 'feedback.db')}"
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key-here")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    LOG_LEVEL: str = "INFO"

settings = Settings()
