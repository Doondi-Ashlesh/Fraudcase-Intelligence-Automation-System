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