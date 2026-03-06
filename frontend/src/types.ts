export interface QueryResponse {
    answer: string;
    sources: string[];
    confidence: number;
}

export interface Incident {
    id: string;
    type: string;
    severity: 'Low' | 'Medium' | 'High';
    time: string;
    location: string;
    accountId?: string;
}

export interface VerificationResult {
    report_id: string;
    account_id: string;
    status: string;
    matching_sop: string;
    flagged_transactions: any[];
    actions_taken: string[];
    confidence_score: number;
    analysis: string;
}

export interface Customer {
    id: string;
    full_name: string;
    email: string;
    risk_score: number;
}

export interface Stats {
    blocked_value: string;
    threat_intensity: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
    live_cases: string;
    engine_health: string;
}
