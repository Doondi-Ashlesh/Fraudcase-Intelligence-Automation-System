import asyncio
import httpx
import json
import uuid
import datetime

BASE_URL = "http://localhost:8000/api/v1"

async def simulate_fraud_workload():
    async with httpx.AsyncClient(timeout=30.0) as client:
        print("--- STARTING FRAUD VERIFICATION SIMULATION ---")
        
        # Case 1: Account Takeover (ATO)
        print("\n[SIMULATION] Case 1: Reporting suspicious login activity for acc_001...")
        ato_report = {
            "report_id": str(uuid.uuid4()),
            "account_id": "acc_001",
            "reason": "Possible ATO: User reports they cannot log in and see odd Nigerian login attempts.",
            "reported_by": "User",
            "timestamp": datetime.datetime.now().isoformat()
        }
        
        try:
            resp = await client.post(f"{BASE_URL}/verify", json=ato_report)
            result = resp.json()
            print(f"Outcome: {result['status']}")
            print(f"SOP Used: {result['matching_sop']}")
            print(f"Actions Taken: {result['actions_taken']}")
            print(f"Flagged Txs: {len(result['flagged_transactions'])}")
        except Exception as e:
            print(f"Error: {e}. Is the server running?")

        # Case 2: AML Structuring
        print("\n[SIMULATION] Case 2: System-alert for structuring on acc_002...")
        aml_report = {
            "report_id": str(uuid.uuid4()),
            "account_id": "acc_002",
            "reason": "Compliance Alert: Systematic structuring detected via multiple $9k cash deposits.",
            "reported_by": "System",
            "timestamp": datetime.datetime.now().isoformat()
        }
        
        try:
            resp = await client.post(f"{BASE_URL}/verify", json=aml_report)
            result = resp.json()
            print(f"Outcome: {result['status']}")
            print(f"SOP Used: {result['matching_sop']}")
            print(f"Actions Taken: {result['actions_taken']}")
        except Exception as e:
            print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(simulate_fraud_workload())
