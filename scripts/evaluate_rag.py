import json
import time
import os
import sys

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), "backend"))

from app.services.retrieval_service import retrieval_service
from app.services.vector_store_service import vector_store

def run_evaluation():
    # Ensure index is loaded
    vector_store.load()
    
    with open("scripts/test_queries.json", "r") as f:
        test_cases = json.load(f)
    
    results = []
    total_latency = 0
    correct_retrievals = 0
    
    print(f"Running evaluation on {len(test_cases)} queries...\n")
    
    for case in test_cases:
        query = case["query"]
        expected = case["expected_source"]
        
        start_time = time.time()
        retrieval_res = retrieval_service.retrieve(query)
        latency = time.time() - start_time
        
        total_latency += latency
        
        # Check if expected source is in top K
        sources = [c["chunk"].metadata["source"] for c in retrieval_res["chunks"]]
        is_correct = expected in sources
        if is_correct:
            correct_retrievals += 1
            
        results.append({
            "query": query,
            "expected_source": expected,
            "top_source": sources[0] if sources else None,
            "latency_sec": round(latency, 4),
            "score": retrieval_res["top_score"],
            "correct": is_correct
        })
        
        print(f"Query: {query}")
        print(f"  Score: {retrieval_res['top_score']:.4f} | Latency: {latency:.4f}s | Correct: {is_correct}")

    summary = {
        "total_queries": len(test_cases),
        "retrieval_accuracy": correct_retrievals / len(test_cases),
        "avg_latency_sec": total_latency / len(test_cases),
        "timestamp": time.time(),
        "details": results
    }
    
    with open("scripts/evaluation_report.json", "w") as f:
        json.dump(summary, f, indent=2)
        
    print(f"\nEvaluation complete. Accuracy: {summary['retrieval_accuracy']*100}%")
    print("Report saved to scripts/evaluation_report.json")

if __name__ == "__main__":
    run_evaluation()
