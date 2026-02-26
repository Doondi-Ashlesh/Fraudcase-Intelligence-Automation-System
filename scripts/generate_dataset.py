import os
import json

def generate_fraud_intelligence_dataset():
    data_dir = "backend/data"
    os.makedirs(data_dir, exist_ok=True)

    # 1. SOP: Account Takeover (ATO) Investigation
    ato_sop = """
# SOP-FIN-001: Account Takeover (ATO) Investigation Protocol

## 1. Overview
Account Takeover occurs when a malicious actor gains unauthorized access to a customer's account credentials to perform fraudulent transactions or data exfiltration.

## 2. Detection Signals
- **Device Fingerprint Mismatch**: Drastic change in OS, browser, or hardware ID.
- **Velocity Anomalies**: Multiple login attempts from diverse geolocations within < 1 hour (Impossible Travel).
- **Sensitive Change Trigger**: Modification of MFA settings, email address, or payout methods followed by immediate large withdrawal.

## 3. Mandatory Steps
1. **Immediate Lockdown**: Freeze all debit/credit activity and API keys for the UID.
2. **Session Termination**: Revoke all active OAuth tokens and web sessions.
3. **MFA Reset**: Reset MFA seeds and require hardware-token re-verification for Tier 2 restoration.
    """

    # 2. Compliance: AML Reporting Thresholds
    aml_guideline = """
# REG-COMP-004: Anti-Money Laundering (AML) Reporting Standards

## 1. SAR Filing Thresholds
Pursuant to the Bank Secrecy Act (BSA), Suspicious Activity Reports (SARs) must be filed for:
- **Structuring**: Transactions totaling >$10,000 designed to evade reporting requirements.
- **Layering**: Rapid movement of funds across multiple shell accounts with no clear economic purpose.
- **Insider Fraud**: Any suspicious activity involving employees, regardless of the amount.

## 2. CTR Requirements
Currency Transaction Reports (CTRs) are mandatory for any physical cash transaction exceeding $10,000 in a single business day.
    """

    # 3. Fraud Pattern: Synthetic Identity Detection
    synthetic_id = """
# TECH-FRD-012: Synthetic Identity Fraud Patterns

## 1. Definition
Synthetic Identity Fraud involves the use of a combination of real (stolen) and fake information to create a new, non-existent identity for credit bust-outs.

## 2. Detection Metrics
- **Non-Standard Credit History**: A "perfect" credit score on a relatively new Social Security Number (SSN).
- **Address Linkage**: The same physical address linked to 5+ distinct SSNs within a 90-day window.
- **Email Aging**: Use of disposable email domains or emails created < 30 days before high-value applications.
    """

    docs = {
        "SO_ATO_001.md": ato_sop,
        "COMP_AML_004.md": aml_guideline,
        "TECH_SYNTH_012.md": synthetic_id
    }

    for filename, content in docs.items():
        with open(os.path.join(data_dir, filename), "w", encoding="utf-8") as f:
            f.write(content.strip())

    # 4. Generate Synthetic Transactions
    transactions = [
        # Normal Activity
        {
            "transaction_id": "tx_001",
            "account_id": "acc_001",
            "amount": 45.50,
            "timestamp": "2024-05-20T10:00:00Z",
            "merchant": "Starbucks",
            "category": "Food & Drink",
            "ip_address": "192.168.1.5",
            "device_id": "dev_mac_789",
            "geo_location": "New York, USA"
        },
        # ATO Pattern: Velocity & IP Change (Impossible Travel)
        {
            "transaction_id": "tx_002",
            "account_id": "acc_001",
            "amount": 2500.00,
            "timestamp": "2024-05-20T10:05:00Z",
            "merchant": "CryptoExchange",
            "category": "Finance",
            "ip_address": "45.72.11.90",
            "device_id": "dev_linux_unknown",
            "geo_location": "Lagos, Nigeria"
        },
        # AML Pattern: Structuring (Multiple small transfers to evade $10k SAR)
        {
            "transaction_id": "tx_003",
            "account_id": "acc_002",
            "amount": 9500.00,
            "timestamp": "2024-05-21T09:00:00Z",
            "merchant": "CashDeposit",
            "category": "Transfer",
            "ip_address": "10.0.0.1",
            "device_id": "dev_mobile_123",
            "geo_location": "London, UK"
        },
        {
            "transaction_id": "tx_004",
            "account_id": "acc_002",
            "amount": 9500.00,
            "timestamp": "2024-05-21T09:15:00Z",
            "merchant": "CashDeposit",
            "category": "Transfer",
            "ip_address": "10.0.0.1",
            "device_id": "dev_mobile_122",
            "geo_location": "London, UK"
        }
    ]

    with open(os.path.join(data_dir, "transactions.json"), "w", encoding="utf-8") as f:
        json.dump(transactions, f, indent=4)

    print(f"Professional Fraud Intelligence dataset and Transactions generated in {data_dir}")

if __name__ == "__main__":
    generate_fraud_intelligence_dataset()
