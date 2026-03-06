from typing import List, Union
import json
from sqlalchemy.orm import Session
from app.db.database import Customer, Transaction as DBTransaction, SessionLocal
from app.models.schemas import FraudReport, VerificationResult, Transaction as PydanticTransaction, FraudEvent
from app.services.retrieval_service import retrieval_service
from app.services.llm_service import llm_service
import datetime

class VerificationService:
    def verify_report(self, report: FraudReport, db: Session = None) -> VerificationResult:
        """
        Reasoning-based Verification with PostgreSQL context:
        1. Fetch Customer Profile & Transactions from DB.
        2. Contextualize the Reasoning Prompt.
        3. Match with SOP.
        """
        if not db:
            db = SessionLocal()

        # 1. Pull Customer & Transactions
        customer = db.query(Customer).filter(Customer.id == report.account_id).first()
        if not customer:
            return VerificationResult(
                report_id=report.report_id,
                account_id=report.account_id,
                status="Escalated",
                matching_sop="None",
                flagged_transactions=[],
                actions_taken=["Customer Not Found"],
                confidence_score=0.0,
                analysis=f"Verification failed: Customer {report.account_id} not found."
            )

        transactions = db.query(DBTransaction).filter(DBTransaction.account_id == report.account_id).order_by(DBTransaction.timestamp.desc()).limit(20).all()
        
        # 2. RAG: Retrieve the most relevant SOP for the reason
        retrieval_result = retrieval_service.retrieve(report.reason)
        matching_sop_data = retrieval_result["chunks"][0]["chunk"] if retrieval_result["chunks"] else None
        matching_sop_name = matching_sop_data.metadata["source"] if matching_sop_data else "Unknown SOP"
        sop_content = matching_sop_data.content if matching_sop_data else ""

        # 3. LLM Reasoning over Customer Context
        tx_summary = "\n".join([f"- {t.timestamp}: {t.amount} {t.currency} at {t.merchant} ({t.geo_location})" for t in transactions])
        
        verification_prompt = f"""
You are a senior fraud investigator.
Analyze the following customer profile and recent transactions against the provided Standard Operating Procedure (SOP).

CUSTOMER PROFILE:
Name: {customer.full_name}
Risk Score: {customer.risk_score}
Address: {customer.address}

RECENT TRANSACTIONS:
{tx_summary}

FRAUD REPORT REASON: "{report.reason}"
REFERENCE SOP:
{sop_content}

DETERMINE:
1. Status: "Verified" (Fraud confirmed), "Safe" (No fraud), or "Escalated" (Human review needed).
2. Flagged Transactions: List IDs of suspicious transactions.
3. Actions: Recommended immediate actions (e.g., Freeze Account).
4. Analysis: Detailed forensic analysis of your reasoning, citing specific detection signals from the SOP.

RESPONSE FORMAT (JSON):
{{
  "status": "...",
  "flagged_transaction_ids": ["..."],
  "actions": ["..."],
  "analysis": "..."
}}
"""
        verification_prompt += "\nRespond ONLY with a valid JSON object. Do not include any preamble or explanation."
        response_json = llm_service.generate_structured_json(verification_prompt)
        
        try:
            # Hyper-robust JSON extraction
            cleaned_json = response_json.strip()
            
            # Remove markdown blocks
            if "```" in cleaned_json:
                blocks = cleaned_json.split("```")
                # Look for a block that starts with json or just contains {
                for block in blocks:
                    block = block.strip()
                    if block.startswith("json"):
                        block = block[4:].strip()
                    if "{" in block and "}" in block:
                        cleaned_json = block
                        break
            
            # If still not pure JSON, find the first { and last }
            if not (cleaned_json.startswith("{") and cleaned_json.endswith("}")):
                start = cleaned_json.find("{")
                end = cleaned_json.rfind("}") + 1
                if start != -1 and end != 0:
                    cleaned_json = cleaned_json[start:end]
            
            # Final cleaning: remove common LLM trailing commas or comments
            cleaned_json = cleaned_json.strip()
            
            result_data = json.loads(cleaned_json)
        except Exception as e:
            # If it fails, capture the first 100 chars of response for debugging in the UI
            truncated_response = (response_json[:100] + "...") if len(response_json) > 100 else response_json
            result_data = {
                "status": "Escalated",
                "flagged_transaction_ids": [],
                "actions": ["Manual Review Required"],
                "analysis": f"Reasoning Format Error: {str(e)}. Response starts with: {truncated_response}"
            }

        # Convert DB transactions to Pydantic for the response
        flagged_pydantic_txs = []
        for t in transactions:
            if t.id in result_data.get("flagged_transaction_ids", []):
                flagged_pydantic_txs.append(PydanticTransaction(
                    transaction_id=t.id,
                    account_id=t.account_id,
                    amount=t.amount,
                    currency=t.currency,
                    timestamp=str(t.timestamp),
                    merchant=t.merchant,
                    category=t.category or "General",
                    ip_address=t.ip_address or "0.0.0.0",
                    device_id=t.device_id or "Unknown",
                    geo_location=t.geo_location or "Unknown",
                    is_flagged=True
                ))

        # 4. Persist the outcome in the database for dynamic stats
        try:
            from app.db.database import FraudEvent
            event = db.query(FraudEvent).filter(FraudEvent.id == report.report_id).first()
            if event:
                event.status = result_data.get("status", "Escalated")
                db.commit()
        except Exception as e:
            print(f"Failed to persist fraud event status: {e}")

        return VerificationResult(
            report_id=report.report_id,
            account_id=report.account_id,
            status=result_data.get("status", "Escalated"),
            matching_sop=matching_sop_name,
            flagged_transactions=flagged_pydantic_txs,
            actions_taken=result_data.get("actions", ["Manual Review Required"]),
            confidence_score=0.9 if result_data.get("status") != "Escalated" else 0.5,
            analysis=result_data.get("analysis", "Analysis completed.")
        )

verification_service = VerificationService()
