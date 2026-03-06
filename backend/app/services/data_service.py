from sqlalchemy.orm import Session
from app.db.database import Customer, Transaction
from typing import List, Optional

class DataService:
    # Customer methods
    def get_customer(self, db: Session, customer_id: str) -> Optional[Customer]:
        return db.query(Customer).filter(Customer.id == customer_id).first()

    def get_all_customers(self, db: Session, skip: int = 0, limit: int = 100) -> List[Customer]:
        return db.query(Customer).offset(skip).limit(limit).all()

    # Transaction methods
    def get_transactions_by_account(self, db: Session, account_id: str, limit: int = 100) -> List[Transaction]:
        return db.query(Transaction).filter(Transaction.account_id == account_id).order_by(Transaction.timestamp.desc()).limit(limit).all()

    def get_all_transactions(self, db: Session, skip: int = 0, limit: int = 100) -> List[Transaction]:
        return db.query(Transaction).offset(skip).limit(limit).all()

    def get_dashboard_stats(self, db: Session):
        from app.db.database import FraudEvent, Transaction
        from sqlalchemy import func

        # 1. Blocked Value: Total amount of transactions belonging to 'Verified' fraud events
        # We join FraudEvent with Transaction on account_id
        # Note: This is a simplification for the demo - typically we'd link specific transactions
        verified_events = db.query(FraudEvent).filter(FraudEvent.status == "Verified").all()
        blocked_value = 0.0
        for event in verified_events:
            # Sum last 5 transactions for each verified event as "blocked"
            txs = db.query(Transaction).filter(Transaction.account_id == event.customer_id).order_by(Transaction.timestamp.desc()).limit(5).all()
            blocked_value += sum(tx.amount for tx in txs)

        # 2. Threat Intensity: Based on percentage of High Priority incidents that are Verified
        total_high = db.query(FraudEvent).filter(FraudEvent.priority == "HIGH").count()
        verified_high = db.query(FraudEvent).filter(FraudEvent.priority == "HIGH", FraudEvent.status == "Verified").count()
        
        intensity = "LOW"
        if total_high > 0:
            ratio = verified_high / total_high
            if ratio > 0.7: intensity = "CRITICAL"
            elif ratio > 0.4: intensity = "HIGH"
            elif ratio > 0.1: intensity = "MODERATE"
        
        # 3. Live Cases
        live_cases = db.query(FraudEvent).count()

        return {
            "blocked_value": f"${blocked_value/1000:.1f}K" if blocked_value < 1000000 else f"${blocked_value/1000000:.1f}M",
            "threat_intensity": intensity,
            "live_cases": str(live_cases),
            "engine_health": "OPTIMAL"
        }

data_service = DataService()
