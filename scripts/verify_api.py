import requests
import json

def test_query():
    url = "http://localhost:8000/api/v1/query"
    payload = {"query": "How do I handle ATO?"}
    headers = {"Content-Type": "application/json"}
    
    try:
        response = requests.post(url, json=payload, headers=headers)
        print(f"Status: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        if response.status_code == 200:
            print("\nSUCCESS: Neural Retrieval is working perfectly!")
        else:
            print("\nFAILURE: Backend returned an error.")
    except Exception as e:
        print(f"ERROR: {e}")

if __name__ == "__main__":
    test_query()
