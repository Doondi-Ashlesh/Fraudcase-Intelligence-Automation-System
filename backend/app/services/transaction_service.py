import json
import os
from typing import List
from app.config import settings
from app.models.schemas import Transaction

class TransactionService:
    def __init__(self):
        self.data_path = settings.TRANSACTIONS_DATA_PATH

    def get_transactions_by_account(self, account_id: str) -> List[Transaction]:
        """
        Retrieves all transactions associated with a specific account.
        In production, this would be a database query.
        """
        if not os.path.exists(self.data_path):
            return []
            
        with open(self.data_path, "r", encoding="utf-8") as f:
            data = json.load(f)
            
        transactions = [Transaction(**tx) for tx in data if tx["account_id"] == account_id]
        return sorted(transactions, key=lambda x: x.timestamp, reverse=True)

transaction_service = TransactionService()
