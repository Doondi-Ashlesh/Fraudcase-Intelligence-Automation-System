import os
import json

def generate_synthetic_data():
    data_dir = "backend/data"
    os.makedirs(data_dir, exist_ok=True)

    # 1. Policy Documents (Simulated)
    policies = [
        {
            "filename": "refund_policy_v2.txt",
            "content": "All refunds must be requested within 30 days of purchase. Digital products are only eligible for refund if they have not been accessed or downloaded. To initiate a refund, agents must verify the order ID and customer email."
        },
        {
            "filename": "security_protocol.txt",
            "content": "Agents should never ask customers for their full password. Multi-factor authentication (MFA) is required for all account changes. If a customer loses access to their MFA device, escalate to Tier 2 Support."
        }
    ]

    for p in policies:
        with open(os.path.join(data_dir, p["filename"]), "w", encoding="utf-8") as f:
            f.write(p["content"])

    # 2. FAQ Style Documentation
    faqs = """
    Q: How do I reset a password?
    A: Instruct the customer to click 'Forgot Password' on the login screen. They will receive an email with a secure link valid for 60 minutes.
    
    Q: What is the turnaround time for support tickets?
    A: Standard turnaround is 24-48 business hours. Priority customers receive a response within 4 hours.
    
    Q: How do I escalate to Compliance?
    A: For all legal or data privacy concerns, use the 'Escalate to Compliance' button in the CRM. This is required for GDPR requests.
    """
    with open(os.path.join(data_dir, "general_faqs.txt"), "w", encoding="utf-8") as f:
        f.write(faqs)

    print(f"Synthetic dataset generated in {data_dir}")

if __name__ == "__main__":
    generate_synthetic_data()
