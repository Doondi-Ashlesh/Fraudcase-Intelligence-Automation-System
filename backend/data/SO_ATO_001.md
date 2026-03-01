# SOP: Account Takeover (ATO)
**CODE**: SO_ATO_001
**CATEGORY**: Account Security / Unauthorized Access

## Overview
ATO occurs when a fraudster gains unauthorized access to a customer's account, usually via credential stuffing, phishing, or SIM swapping.

## Detection Signals
- **Login Anomaly**: Successful login from a new device/location previously unseen.
- **PII Change**: Immediate change of email, phone number, or password followed by a transfer request.
- **Security Bypass**: Sudden disablement of MFA or multiple failed MFA attempts.
- **Session Hijacking**: Change in browser fingerprint mid-session.

## Investigation Workflow
1. **Login Audit**: Review IP reputation and ISP consistency.
2. **Contact Change History**: Verify if the recent PII changes were authorized via secondary channels.
3. **Transaction Linkage**: Detect if newly added beneficiaries are linked to known mule accounts.

## Resolution Actions
- **Confirmed ATO**: Immediate session termination, account lockdown, and mandatory password/MFA reset.
- **Suspicious Activity**: Step-up authentication (Bio-ID or physical token) required.