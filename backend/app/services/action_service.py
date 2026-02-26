import logging
import datetime
from app.models.schemas import VerificationResult
from app.db.feedback_db import save_feedback

class ActionService:
    def __init__(self):
        self.logger = logging.getLogger("fraud_actions")
        logging.basicConfig(level=logging.INFO)

    def execute_and_log(self, result: VerificationResult):
        """
        Logs the outcome of a fraud verification to the audit log (and simulating account actions).
        """
        timestamp = datetime.datetime.now().isoformat()
        log_msg = f"[{timestamp}] ACTION EXECUTED: Account {result.account_id} status set to {result.status}. Actions: {', '.join(result.actions_taken)}"
        self.logger.info(log_msg)
        
        # Feedback Loop: Save to DB so the RAG knows about this verified case
        # (Overloading feedback_db for audit purposes in this prototype)
        save_feedback(
            query=f"Fraud Report for {result.account_id}",
            answer=f"Verified via SOP {result.matching_sop}. Outcome: {result.status}",
            rating="Verified"
        )
        return True

action_service = ActionService()
