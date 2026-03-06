# FraudSight AI: Intelligent Fraud Intelligence Automation System 

**FraudSight AI** is a high-performance fraud detection and investigation platform. It leverages a **Neural Reasoning Architecture** to automate the analysis of complex fraud typologies, combining real-time database audits with intelligent SOP (Standard Operating Procedure) matching.

Built for modern cybersecurity teams, it replaces traditional "black box" detection with an explainable, LLM-driven verification engine that provides deep forensic insights into every decision.

---

## System Architecture

### Pre-configured Reasoning Engine (Vectorless RAG)
Unlike traditional search systems, FraudSight uses a **Vectorless Architecture**:
- **Semantic Routing**: The LLM analyzes query intent to dynamically select the most relevant SOP from the `backend/data/` library.
- **Contextual Injection**: The selected protocol is injected into a specialized reasoning window alongside live customer and transaction data.
- **Logic-Based Decisioning**: Every result includes a "Confidence Score" and a "Logical Analysis" rooted in actual internal protocols.

### Core Infrastructure
- **Backend**: FastAPI (Python 3.12) with Pydantic v2 validation.
- **Frontend**: React 18 + Vite with a Premium "Cyber-Security" Glassmorphism UI.
- **Large Language Model**: **Groq Cloud** (Llama 3.1 8B Instant) for ultra-fast, hardware-accelerated reasoning (<500ms latency).
- **Storage**: 
  - **PostgreSQL**: Primary relational store for Incidents, Customers, and Transactions.
  - **SQLite**: Local audit store for support agent feedback and engine calibration.

---

## Intelligent Flow
1. **Trigger**: A fraud report is submitted (via UI or JSON API).
2. **Retrieve**: The system scans the Knowledge Base (Markdown/JSON SOPs) to find the matching protocol.
3. **Audit**: The **Verification Service** queries PostgreSQL for the customer's historical profile and recent transaction velocity.
4. **Reason**: The LLM compares the live data against the SOP detection signals.
5. **Act**: The system executes defensive measures (e.g., specific transaction flagging or account lock) and generates a detailed briefing.

---
## Key Functionalities

### 1. Intelligence Hub (Neural Search)
- Query any internal SOP or regulation in natural language.
- Receive grounded answers with direct citations to source documents.
- Automatic feedback loop for continuous engine improvement.

### 2. Forensic Dashboard (Command Center)
- Real-time monitoring of live incidents.
- Interactive investigation cards with automated AI verification.
- **One-Click Actions**: Execute security protocols directly from the UI.

### 3. Batch Verification Engine
- Command-line tool for high-volume audit processing.
- Input: JSON files containing fraud reports.
- Output: Full forensic analysis and risk classification.

---

## Build & Installation

### Prerequisites
- Python 3.12+
- Node.js 18+
- Docker (for PostgreSQL)

### Step 1: Backend Setup
1. Inside `/backend`, create a `.env` file from `.env.example`:
   ```bash
   GROQ_API_KEY=your_key_here
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/fraudsight
   ```
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Initialize the database:
   ```bash
   python scripts/check_db.py
   ```
4. Run the server:
   ```bash
   python -m uvicorn app.main:app --reload
   ```

### Step 2: Frontend Setup
1. Navigate to `/frontend`.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the application:
   ```bash
   npm run dev
   ```

---

## Run Demo (Batch Testing)

To see the Neural Engine in action without using the UI, you can run a batch verification for any JSON case file:

```powershell
# From the project root
python scripts/batch_verify.py backend/data/test_case_4.json
```

---

## Knowledge Base
The system includes high-fidelity SOPs for:
- `SO_ATO_001.md`: **Account Takeover**
- `APP_SCAM_008.md`: **Authorized Push Payment Scams**
- `CNP_FRAUD_005.md`: **Card-Not-Present Fraud**
- `TECH_SYNTH_012.md`: **Synthetic Identity Fraud**
- `COMP_AML_004.md`: **AML & Regulatory Reporting**

---

## License
Proprietary Cybersecurity Intelligence System – All Rights Reserved.
