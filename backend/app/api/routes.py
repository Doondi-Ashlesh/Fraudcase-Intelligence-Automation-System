from typing import Union, List
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.models.schemas import QueryRequest, QueryResponse, FeedbackRequest, FraudReport, VerificationResult, FraudEvent
from app.services.retrieval_service import retrieval_service
from app.services.llm_service import llm_service
from app.services.verification_service import verification_service
from app.services.action_service import action_service
from app.db.feedback_db import save_feedback
from app.db.database import get_db

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

@router.post("/verify", response_model=VerificationResult)
async def verify_fraud_endpoint(report: Union[FraudReport, FraudEvent], db: Session = Depends(get_db)):
    """
    Triggers the Fraud Verification Workflow for a specific report.
    """
    try:
        # Convert FraudEvent to FraudReport if necessary for the service
        if hasattr(report, "case_id"):
            report = FraudReport(
                report_id=report.case_id,
                account_id=report.customer_id,
                reason=f"{report.priority} Security Review",
                reported_by="System"
            )

        # Execute verification with contextual DB access
        result = verification_service.verify_report(report, db)
        
        if result.status == "Verified":
            action_service.execute_and_log(result)
            
        return result
    except Exception as e:
        import traceback
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Verification Workflow Failed: {str(e)}")

@router.post("/incidents")
async def create_incident(report: FraudReport, db: Session = Depends(get_db)):
    from app.db.database import FraudEvent
    import uuid
    from datetime import datetime
    
    existing_event = db.query(FraudEvent).filter(FraudEvent.id == report.report_id).first()
    
    if existing_event:
        existing_event.customer_id = report.account_id
        existing_event.reason = report.reason
        existing_event.status = "Pending"
        db.commit()
        db.refresh(existing_event)
        return existing_event

    new_event = FraudEvent(
        id=report.report_id if report.report_id != "manual" else f"FRD-{uuid.uuid4().hex[:6].upper()}",
        customer_id=report.account_id,
        reason=report.reason,
        status="Pending",
        priority="HIGH",
        timestamp=datetime.utcnow()
    )
    db.add(new_event)
    db.commit()
    db.refresh(new_event)
    return new_event

@router.get("/incidents")
async def list_incidents(db: Session = Depends(get_db)):
    from app.db.database import FraudEvent
    return db.query(FraudEvent).order_by(FraudEvent.timestamp.desc()).all()

@router.get("/customers")
async def list_customers(db: Session = Depends(get_db)):
    from app.services.data_service import data_service
    return data_service.get_all_customers(db)

@router.post("/feedback")
async def feedback_endpoint(request: FeedbackRequest):
    try:
        save_feedback(request.query, request.answer, request.rating)
        return {"status": "success", "message": "Feedback saved"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/stats")
async def get_stats(db: Session = Depends(get_db)):
    from app.services.data_service import data_service
    return data_service.get_dashboard_stats(db)
