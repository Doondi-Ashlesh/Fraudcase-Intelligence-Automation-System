# SOP: Synthetic Identity Fraud (SIF)
**CODE**: TECH_SYNTH_012
**CATEGORY**: Identity Theft / Credit Bust-out

## Overview
Synthetic Identity Fraud involves the creation of a "fake" person by combining real (often stolen SSNs of minors or deceased) and fabricated information. The goal is to build a credit profile over time before "busting out" with large uncollectible debts.

## Detection Signals
- **Identity Consistency**: Cross-reference SSN with issued date and applicant age.
- **Social Footprint**: Minimal or incoherent digital presence for an adult profile.
- **Credit Pattern**: Rapid building of credit with high-limit requests shortly after account opening.
- **Address Linkage**: Multiple distinct identities linked to the same physical address.

## Investigation Workflow
1. **PII Audit**: Validate SSN via third-party verification services.
2. **Behavioral Analysis**: Check for "piggybacking" on legitimate credit accounts.
3. **Internal Linkage**: Query database for other accounts using similar device fingerprints or IP clusters.

## Resolution Actions
- **High Risk**: Immediate account freeze and manual identity verification (Physical ID required).
- **Medium Risk**: Flag for enhanced monitoring and 48-hour transaction hold.