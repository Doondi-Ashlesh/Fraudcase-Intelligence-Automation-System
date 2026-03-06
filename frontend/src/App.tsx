import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Shield } from 'lucide-react';

// Components
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import IntelligenceHub from './components/IntelligenceHub';

// Types
import type { QueryResponse, Incident, VerificationResult, Customer } from './types';

// API Configuration
const API_BASE_URL = 'http://localhost:8000/api/v1';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<'dashboard' | 'hub'>('dashboard');
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState<QueryResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedbackGiven, setFeedbackGiven] = useState(false);
  const [selectedVerification, setSelectedVerification] = useState<VerificationResult | null>(null);

  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [stats, setStats] = useState<any>({
    blocked_value: '$0.0',
    threat_intensity: 'LOW',
    live_cases: '0',
    engine_health: 'OPTIMAL'
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [incRes, custRes, statsRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/incidents`),
          axios.get(`${API_BASE_URL}/customers`),
          axios.get(`${API_BASE_URL}/stats`)
        ]);

        const mappedIncidents: Incident[] = incRes.data.map((fe: any) => ({
          id: fe.id,
          type: fe.reason,
          severity: fe.priority === 'HIGH' ? 'High' : 'Medium',
          time: new Date(fe.timestamp).toLocaleTimeString(),
          location: 'Global (DB)',
          accountId: fe.customer_id
        }));

        setIncidents(mappedIncidents.length > 0 ? mappedIncidents : [
          { id: 'SYS-DB-001', type: 'Database Connection Active', severity: 'Low', time: 'Now', location: 'System' }
        ]);
        setCustomers(custRes.data);
        setStats(statsRes.data);
      } catch (err) {
        console.error("Failed to sync with PostgreSQL", err);
      }
    };
    fetchData();
  }, []);

  const handleQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setResponse(null);
    setError(null);
    setFeedbackGiven(false);
    setActiveView('hub');

    try {
      const { data } = await axios.post(`${API_BASE_URL}/query`, { query });
      setResponse(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Neural Engine Retrieval Failure');
    } finally {
      setLoading(false);
    }
  };

  const handleFeedback = async (rating: 'helpful' | 'not helpful') => {
    if (!response || feedbackGiven) return;

    try {
      await axios.post(`${API_BASE_URL}/feedback`, {
        query,
        answer: response.answer,
        rating
      });
      setFeedbackGiven(true);
    } catch (err) {
      console.error('Failed to save feedback', err);
    }
  };

  const handleVerifyIncident = async (incident: Incident) => {
    setVerifying(true);
    setSelectedVerification(null);
    setError(null);

    try {
      const customersRes = await axios.get(`${API_BASE_URL}/customers`);
      const dbCustomers = customersRes.data;
      const realAccountId = dbCustomers.length > 0 ? dbCustomers[0].id : (incident.accountId || 'acc_001');

      const payload = {
        report_id: incident.id,
        account_id: realAccountId,
        reason: incident.type,
        reported_by: "System",
        timestamp: new Date().toISOString()
      };

      const { data } = await axios.post(`${API_BASE_URL}/verify`, payload);
      setSelectedVerification(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Verification Engine Fault');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden text-slate-100 font-sans selection:bg-blue-500/30">

      {/* Background Effects */}
      <div className="mesh-gradient">
        <div className="mesh-ball w-[600px] h-[600px] bg-blue-600/10 top-[-10%] left-[-5%]"></div>
        <div className="mesh-ball w-[500px] h-[500px] bg-indigo-600/10 bottom-[10%] right-[0%]"></div>
      </div>
      <div className="scan-line" />

      {/* SIDEBAR Component */}
      <Sidebar activeView={activeView} setActiveView={setActiveView} />

      {/* MAIN VIEWPORT */}
      <main className="flex-1 flex flex-col overflow-hidden relative">

        {/* TOP NAV / HEADER */}
        <header className="h-24 flex items-center justify-between px-12 border-b border-white/5 backdrop-blur-xl z-20">
          <div className="flex flex-col">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-black tracking-tighter text-white uppercase italic">
                FraudSight<span className="text-blue-500">AI</span>
              </h1>
              <div className="px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-[10px] font-bold text-blue-400 tracking-widest leading-none">
                PREMIUM
              </div>
            </div>
            <div className="flex items-center gap-2 mt-1.5 overflow-hidden">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_#22c55e]"></div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Global Neural Grid Active • v3.8.0</span>
            </div>
          </div>

          <div className="flex items-center gap-8">
            <div className="flex items-center gap-4 border-l border-white/5 pl-8">
              <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-blue-400 font-mono text-sm hover:border-blue-500/50 transition-colors cursor-pointer">
                TH
              </div>
            </div>
          </div>
        </header>

        {/* SCROLLABLE VIEWPORT CONTENT */}
        <div className="flex-1 overflow-y-auto p-12 custom-scrollbar">
          <div className="max-w-[1600px] mx-auto space-y-12">
            {activeView === 'dashboard' ? (
              <Dashboard
                incidents={incidents}
                customers={customers}
                verifying={verifying}
                selectedVerification={selectedVerification}
                onVerifyIncident={handleVerifyIncident}
                apiBaseUrl={API_BASE_URL}
                stats={stats}
              />
            ) : (
              <IntelligenceHub
                query={query}
                setQuery={setQuery}
                loading={loading}
                error={error}
                response={response}
                feedbackGiven={feedbackGiven}
                onQuery={handleQuery}
                onFeedback={handleFeedback}
              />
            )}
          </div>
        </div>

        {/* TERMINAL FOOTER */}
        <footer className="h-12 border-t border-white/5 glass flex items-center justify-between px-12 text-[10px] font-bold font-mono tracking-widest z-30">
          <div className="flex gap-10">
            <span className="text-slate-600">CLUSTER: <span className="text-blue-500">FIS_PRIMARY_NODE_01</span></span>
            <span className="text-slate-600">ENCRYPTION: <span className="text-green-500">AES_256_GCM</span></span>
          </div>
          <div className="flex items-center gap-6">
            <span className="text-slate-400 flex items-center gap-2">
              <Shield className="w-3 h-3 text-blue-500" /> PROTECTED BY QUANTUM_FENCE
            </span>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default App;
