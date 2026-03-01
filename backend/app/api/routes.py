from fastapi import APIRouter, HTTPException, Depends
from app.models.schemas import QueryRequest, QueryResponse, FeedbackRequest, FraudReport, VerificationResult, FraudEvent
from app.services.retrieval_service import retrieval_service
from app.services.llm_service import llm_service
from app.services.verification_service import verification_service
from app.services.action_service import action_service
from app.db.feedback_db import save_feedback

router = APIRouter()

@router.post("/query", response_model=QueryResponse)
async def query_endpoint(request: QueryRequest):
    # 1. Retrieve relevant chunks
    retrieval_result = retrieval_service.retrieve(request.query)
    chunks = retrieval_result["chunks"]
    
    # 2. Format context
    context = "\n\n".join([c["chunk"].content for c in chunks])
    sources = list(set([c["chunk"].metadata["source"] for c in chunks]))
    
    # 3. Generate answer
    answer = llm_service.generate_answer(context, request.query)
    
    # 4. Handle low confidence
    if retrieval_result["low_confidence_warning"]:
        answer = f"[Note: Low retrieval confidence ({retrieval_result['top_score']:.2f})]\n\n" + answer

    return QueryResponse(
        answer=answer,
        sources=sources,
        confidence=retrieval_result["top_score"]
    )

from typing import Union

@router.post("/verify", response_model=VerificationResult)
async def verify_fraud_endpoint(report: Union[FraudReport, FraudEvent]):
    """
    Triggers the Fraud Verification Workflow for a specific report.
    """
    try:
        # Step 1 & 2: Verify against transactions and SOPs
        result = await verification_service.verify_report(report)
        
        # Step 3: Execute actions if verified
        if result.status == "Verified":
            action_service.execute_and_log(result)
            
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Verification Workflow Failed: {str(e)}")

@router.post("/feedback")
async def feedback_endpoint(request: FeedbackRequest):
    try:
        save_feedback(request.query, request.answer, request.rating)
        return {"status": "success", "message": "Feedback saved"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
