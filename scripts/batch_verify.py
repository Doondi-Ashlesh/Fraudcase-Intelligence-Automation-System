import json
import requests
import sys
import os
import time

def run_batch_verify(file_path):
    url = "http://localhost:8000/api/v1/verify"
    
    if not os.path.exists(file_path):
        print(f"Error: File {file_path} not found.")
        return

    with open(file_path, "r") as f:
        try:
            cases = json.load(f)
        except json.JSONDecodeError:
            print(f"Error: Failed to decode JSON from {file_path}")
            return

    if not isinstance(cases, list):
        cases = [cases]

    print(f"--- Starting Batch Verification for {len(cases)} cases ---\n")

    for i, case in enumerate(cases):
        print(f"[{i+1}/{len(cases)}] Processing Report: {case.get('report_id')}")
        try:
            # Register the incident in the database so it shows up on the Frontend Dashboard
            incidents_url = "http://localhost:8000/api/v1/incidents"
            requests.post(incidents_url, json=case)
            print(f"  Incident Registered in Dashboard. Analyzing...")
            time.sleep(2) # Demo Delay: Let the user see it on the dashboard first

            # Proceed with verification
            response = requests.post(url, json=case)
            if response.status_code == 200:
                result = response.json()
                print(f"  Status: {result.get('status')}")
                print(f"  SOP Matched: {result.get('matching_sop')}")
                print(f"  Confidence: {result.get('confidence_score')}")
                print(f"  Analysis: {result.get('analysis')}")
            else:
                print(f"  Error: API returned status {response.status_code}")
                print(f"  Detail: {response.text}")
        except Exception as e:
            print(f"  Error connecting to API: {e}")
        print("-" * 40)

    print("\nBatch Verification Complete.")

if __name__ == "__main__":
    target_file = sys.argv[1] if len(sys.argv) > 1 else "data/example_cases.json"
    run_batch_verify(target_file)
