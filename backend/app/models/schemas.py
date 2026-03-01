from pydantic import BaseModel
from typing import List, Optional, Dict, Any

class DocumentChunk(BaseModel):
    id: str
    content: str
    metadata: Dict[str, Any]

class Transaction(BaseModel):
    transaction_id: str
    account_id: str
    amount: float
    currency: str = "USD"
    timestamp: str
    merchant: str
    category: str
    ip_address: str
    device_id: str
    geo_location: str
    is_flagged: bool = False

class FraudReport(BaseModel):
    report_id: str
    account_id: str
    reason: str
    reported_by: str  # "User", "Agent", or "System"
    timestamp: str

class FraudEvent(BaseModel):
    event: str
    case_id: str
    customer_id: str
    priority: str
    timestamp: str

class VerificationResult(BaseModel):
    report_id: str
    account_id: str
    status: str  # "Verified", "Safe", "Escalated"
    matching_sop: str
    flagged_transactions: List[Transaction]
    actions_taken: List[str]
    confidence_score: float
    analysis: str

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
