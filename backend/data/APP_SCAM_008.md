# SOP: Authorized Push Payment (APP) Scam
**CODE**: APP_SCAM_008
**CATEGORY**: Social Engineering / Push Payment

## Overview
In an APP scam, the victim is tricked (via phishing, spoofing, or impersonation) into authorizing a real-time payment to an account controlled by the fraudster. Often involves "Safe Account" or "Investment" scripts.

## Detection Signals
- **Payment Urgency**: High-value transfer requested immediately after a phone call or SMS.
- **New Payee High-Value**: First-time transfer to a new domestic or international beneficiary for a large amount.
- **Behavioral Indicators**: User staying on a call while performing the transfer (detected via app session metadata if available).
- **Social Engineering Clues**: Terms like "Safe Account", "HMRC", or "Lottery" in transaction notes.

## Investigation Workflow
1. **Beneficiary Audit**: Check if the receiving account has been flagged by other institutions.
2. **Conversation Review**: If alerted by the user, audit communication logs for spoofing indicators.
3. **Inbound/Outbound Match**: Check for recent inbound small "test" payments followed by the large outbound.

## Resolution Actions
- **Intervention**: Call the customer immediately to break the "spell" of the scammer.
- **Recovery**: Attempt "Recall of Funds" via the receiving bank (time-critical).
- **Education**: Provide mandatory fraud awareness module to the user.
