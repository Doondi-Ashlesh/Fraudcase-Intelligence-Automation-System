from pydantic import BaseModel
from typing import List, Optional, Dict, Any

class DocumentChunk(BaseModel):
    id: str
    content: str
    metadata: Dict[str, Any]

class QueryRequest(BaseModel):
    query: str
    role: Optional[str] = "Tier 1 Agent"

class QueryResponse(BaseModel):
    answer: str
    sources: List[str]
    confidence: float

class FeedbackRequest(BaseModel):
    query: str
    answer: str
    rating: str # "helpful" or "not helpful"
