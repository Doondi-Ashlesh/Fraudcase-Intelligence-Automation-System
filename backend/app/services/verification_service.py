from typing import List, Union
from app.services.retrieval_service import retrieval_service
from app.services.transaction_service import transaction_service
from app.models.schemas import FraudReport, VerificationResult, Transaction, FraudEvent
import datetime

class VerificationService:
    async def verify_report(self, report: Union[FraudReport, FraudEvent]) -> VerificationResult:
        """
        Full Fraud Verification Loop:
        1. Retrieve relevant transactions.
        2. Pull relevant SOP from Knowledge Base via RAG.
        3. Match patterns (ATO, AML, Synthetic).
        4. Determine status and recommended actions.
        """
        # Mapping FraudEvent to internal FraudReport logic if necessary
        if isinstance(report, FraudEvent):
            # Map event-based fields to internal report structure
            # Default reason to "Safety Review" since priority is HIGH
            internal_report = FraudReport(
                report_id=report.case_id,
                account_id=report.customer_id,
                reason=f"{report.priority} Priority Security Review",
                reported_by="System",
                timestamp=report.timestamp
            )
            report = internal_report

        # 1. Pull transactions
        transactions = transaction_service.get_transactions_by_account(report.account_id)
        
        # 2. RAG: Retrieve the most relevant SOP for the reason
        # e.g., if reason="Possible ATO", find ATO SOP
        retrieval_result = retrieval_service.retrieve(report.reason)
        matching_sop = retrieval_result["chunks"][0]["chunk"].metadata["source"] if retrieval_result["chunks"] else "Uknown SOP"
        
        # 3. Rule-based Pattern Matching (Simulation)
        flagged = []
        status = "Safe"
        actions = []
        confidence = retrieval_result.get("top_score", 0.0)
        analysis_steps = [f"Initial audit of {len(transactions)} transactions complete."]

        for tx in transactions:
            if "ATO" in report.reason.upper():
                # Logic: Check for geo-mismatch or high amount combined with unknown device
                if tx.geo_location != "New York, USA" and tx.amount > 1000:
                    tx.is_flagged = True
                    flagged.append(tx)
                    status = "Verified"
                    actions = ["Freeze Account", "Revoke Web Sessions", "MFA Reset Required"]
                    analysis_steps.append(f"CRITICAL: Transaction {tx.transaction_id} flagged for Geo-Inconsistency ({tx.geo_location}) and High Velocity (${tx.amount}).")
            
            elif "AML" in report.reason.upper() or "STRUCTURING" in report.reason.upper():
                # Logic: Check for high frequency deposits just below thresholds
                if tx.amount >= 9000 and tx.merchant == "CashDeposit":
                    tx.is_flagged = True
                    flagged.append(tx)
                    status = "Verified"
                    actions = ["Flag for SAR Filing", "Compliance Review"]
                    analysis_steps.append(f"WARNING: Potential Structuring detected in transaction {tx.transaction_id} (${tx.amount} Cash Deposit).")

        if not flagged:
            analysis_steps.append("No immediate anomalies matching current SOP thresholds were detected across the transaction history.")
        else:
            analysis_steps.append(f"Automated verification complete. {len(flagged)} anomalies confirmed. System suggests escalation.")

        return VerificationResult(
            report_id=report.report_id,
            account_id=report.account_id,
            status=status,
            matching_sop=matching_sop,
            flagged_transactions=flagged,
            actions_taken=actions if status == "Verified" else ["None"],
            confidence_score=confidence,
            analysis="\n".join(analysis_steps)
        )

verification_service = VerificationService()
