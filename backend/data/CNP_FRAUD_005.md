# SOP: Card-Not-Present (CNP) Fraud
**CODE**: CNP_FRAUD_005
**CATEGORY**: Card Fraud / E-commerce

## Overview
CNP fraud occurs when a criminal uses stolen card details (Card Number, Expiry, CVV) to make purchases online or over the phone without the physical card.

## Detection Signals
- **Velocity Spikes**: Multiple high-value orders in a short timeframe.
- **Geo-Mismatch**: Shipping address significantly different from cardholder's historical location.
- **IP Anomaly**: Orders placed via known VPN/Proxy or from high-risk jurisdictions.
- **Card Testing**: Sequential small transactions followed by a large purchase.

## Investigation Workflow
1. **Transaction Audit**: Review merchant category codes (MCC) for high-liquidity goods (electronics, gift cards).
2. **Device Fingerprint**: Check if the device ID matches previously known cardholder devices.
3. **Customer Outreach**: Trigger automated SMS/App notification for transaction confirmation.

## Resolution Actions
- **Verified Fraud**: Block card immediately, initiate chargeback, and issue replacement.
- **Suspicious**: Temporary block and require MFA for the next transaction.
