import React, { useState } from 'react';
import axios from 'axios';
import {
  Shield,
  CheckCircle, AlertTriangle, Loader2, LayoutDashboard,
  ShieldAlert, Settings, Activity,
  Search,
  Zap, Globe, Cpu, BarChart3,
  Lock, ThumbsUp, ThumbsDown, ChevronRight
} from 'lucide-react';

// API Configuration
const API_BASE_URL = 'http://localhost:8000/api/v1';

interface QueryResponse {
  answer: string;
  sources: string[];
  confidence: number;
}

interface Incident {
  id: string;
  type: string;
  severity: 'Low' | 'Medium' | 'High';
  time: string;
  location: string;
}

interface VerificationResult {
  report_id: string;
  account_id: string;
  status: string;
  matching_sop: string;
  flagged_transactions: any[];
  actions_taken: string[];
  confidence_score: number;
  analysis: string;
}

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<'dashboard' | 'hub'>('dashboard');
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState<QueryResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedbackGiven, setFeedbackGiven] = useState(false);
  const [selectedVerification, setSelectedVerification] = useState<VerificationResult | null>(null);

  // Updated incidents to match backend transaction data for acc_001 and acc_002
  const [incidents] = useState<Incident[]>([
    { id: 'FRD-ATO-001', type: 'Account Takeover Attempt', severity: 'High', time: '2m ago', location: 'Lagos, NG' },
    { id: 'FRD-AML-002', type: 'Potential Structuring Wave', severity: 'High', time: '5m ago', location: 'London, UK' },
    { id: 'FIS-8741', type: 'Suspicious IP Cluster', severity: 'Medium', time: '12m ago', location: 'Singapore, SG' },
  ]);

  const handleQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setResponse(null);
    setError(null);
    setFeedbackGiven(false);
    setActiveView('hub'); // Switch to hub when querying

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

    // Map incident to fraud payload
    const payload = {
      event: "fraud_case_created",
      case_id: incident.id,
      customer_id: incident.id.includes('ATO') ? 'acc_001' : 'acc_002', // Direct mapping for demo
      priority: incident.severity.toUpperCase(),
      timestamp: new Date().toISOString()
    };

    try {
      const { data } = await axios.post(`${API_BASE_URL}/verify`, payload);
      setSelectedVerification(data);
    } catch (err: any) {
      setError('Verification Engine Fault');
    } finally {
      setVerifying(false);
    }
  };

  const NavItem = ({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) => (
    <button
      onClick={onClick}
      className={`relative w-14 h-14 flex items-center justify-center rounded-2xl transition-all duration-300 group ${active ? 'bg-blue-600/10 text-blue-500 border border-blue-500/20 shadow-[0_0_20px_rgba(59,130,246,0.15)]' : 'text-slate-700 hover:text-white hover:bg-white/5'
        }`}>
      {active && <div className="absolute left-[-15px] w-1.5 h-8 bg-blue-500 rounded-full blur-sm"></div>}
      {icon}
      <div className="absolute left-24 px-4 py-2 bg-blue-600 text-[10px] font-black uppercase tracking-widest text-white rounded-lg opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all pointer-events-none z-50 whitespace-nowrap">
        {label}
      </div>
    </button>
  );

  return (
    <div className="flex h-screen w-full overflow-hidden text-slate-100 font-sans selection:bg-blue-500/30">

      {/* Background Effects */}
      <div className="mesh-gradient">
        <div className="mesh-ball w-[600px] h-[600px] bg-blue-600/10 top-[-10%] left-[-5%]"></div>
        <div className="mesh-ball w-[500px] h-[500px] bg-indigo-600/10 bottom-[10%] right-[0%]"></div>
      </div>
      <div className="scan-line" />

      {/* 1. SIDEBAR (Focused) */}
      <aside className="w-20 lg:w-24 flex flex-col items-center py-10 border-r border-white/5 glass z-30">
        <div className="relative mb-14 group cursor-pointer" onClick={() => setActiveView('dashboard')}>
          <div className="absolute -inset-2 bg-blue-600/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.5)] transform group-hover:scale-110 transition-transform">
            <Shield className="w-7 h-7 text-white" />
          </div>
        </div>

        <nav className="flex flex-col gap-10">
          <NavItem
            label="Command Center"
            icon={<LayoutDashboard size={22} />}
            active={activeView === 'dashboard'}
            onClick={() => setActiveView('dashboard')}
          />
          <NavItem
            label="Intelligence Hub"
            icon={<Zap size={22} />}
            active={activeView === 'hub'}
            onClick={() => setActiveView('hub')}
          />
        </nav>

        <div className="mt-auto flex flex-col gap-8">
          <NavItem
            label="Settings"
            icon={<Settings size={22} />}
            active={false}
            onClick={() => { }}
          />
        </div>
      </aside>

      {/* MAIN VIEWPORT */}
      <main className="flex-1 flex flex-col overflow-hidden relative">

        {/* 2. TOP NAV / SEARCH AREA */}
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

        {/* 3. SCROLLABLE DASHBOARD */}
        <div className="flex-1 overflow-y-auto p-12 custom-scrollbar">

          <div className="max-w-[1600px] mx-auto space-y-12">

            {activeView === 'dashboard' ? (
              <>
                {/* HERO STAT ROW */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  <MetricBox label="Live Cases" value="482" trend="+12%" color="blue" />
                  <MetricBox label="Blocked Value" value="$1.4M" trend="+24%" color="green" icon={<BarChart3 size={18} />} />
                  <MetricBox label="Threat Intensity" value="CRITICAL" trend="98%" color="red" icon={<ShieldAlert size={18} />} />
                  <MetricBox label="Engine Health" value="OPTIMAL" trend="0.03ms" color="indigo" icon={<Cpu size={18} />} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                  {/* LIVE MONITORING SIDEBAR */}
                  <div className="lg:col-span-5 space-y-10">
                    <div className="glass-card rounded-[40px] p-10 h-full flex flex-col relative z-20">
                      <div className="flex items-center justify-between mb-10">
                        <div>
                          <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-blue-400">Threat Matrix</h3>
                          <p className="text-sm font-bold text-slate-500 mt-1">Real-time Interference</p>
                        </div>
                      </div>

                      <div className="flex-1 space-y-6 overflow-y-auto custom-scrollbar pr-2 h-[500px]">
                        {incidents.map((inc) => (
                          <div
                            key={inc.id}
                            onClick={() => handleVerifyIncident(inc)}
                            className="group relative glass p-6 rounded-3xl border-l-4 border-l-transparent hover:border-l-blue-500 transition-all hover:translate-x-1 duration-300 cursor-pointer active:scale-[0.98]"
                          >
                            <div className="flex items-center justify-between mb-4">
                              <span className="font-mono text-[10px] font-black text-blue-500 tracking-tighter shadow-blue-500/20">{inc.id}</span>
                              <span className={`text-[9px] px-3 py-1 rounded-full font-black uppercase tracking-widest leading-none ${inc.severity === 'High' ? 'bg-red-500/10 text-red-500 border border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.1)]' :
                                'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                }`}>{inc.severity}</span>
                            </div>
                            <h5 className="text-base font-black text-white leading-tight mb-2 uppercase tracking-tight italic">{inc.type}</h5>
                            <div className="flex items-center gap-2 text-slate-500 mb-4">
                              <Globe size={12} className="text-blue-500" />
                              <span className="text-[10px] font-bold tracking-widest uppercase">{inc.location}</span>
                            </div>
                            <div className="flex items-center justify-between text-[10px] font-black text-slate-600 uppercase tracking-widest border-t border-white/5 pt-4">
                              <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div> Tracking</span>
                              <span className="font-mono">{inc.time}</span>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="mt-10 pt-10 border-t border-white/5 space-y-8">
                        <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em] text-center">Neural Grid Integrity</p>
                        <div className="flex justify-around items-end">
                          <HealthStat label="Neural" percent={98} />
                          <HealthStat label="Latency" percent={100} />
                          <HealthStat label="Uptime" percent={99} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* INVESTIGATION PANEL */}
                  <div className="lg:col-span-7">
                    <div className="glass-card rounded-[40px] p-12 min-h-[600px] flex flex-col">
                      {!selectedVerification && !verifying && (
                        <div className="flex-1 flex flex-col items-center justify-center text-center opacity-40">
                          <div className="w-24 h-24 rounded-full border-2 border-dashed border-white/20 flex items-center justify-center mb-6">
                            <ShieldAlert size={40} />
                          </div>
                          <h3 className="text-xl font-black uppercase tracking-widest">Awaiting Selection</h3>
                          <p className="max-w-xs mt-2 text-sm font-light leading-relaxed">Select a threat from the matrix to trigger autonomous verification and deep transaction audit.</p>
                        </div>
                      )}

                      {verifying && (
                        <div className="flex-1 flex flex-col items-center justify-center py-24 space-y-6">
                          <div className="relative">
                            <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
                            <Shield className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-500 w-6 h-6 animate-pulse" />
                          </div>
                          <div className="text-center">
                            <p className="text-xl font-black text-white tracking-widest italic uppercase">Auditing Transactions</p>
                            <p className="text-slate-500 font-mono text-[10px] mt-2">PARSING_BEHAVIORAL_MAPS...</p>
                          </div>
                        </div>
                      )}

                      {selectedVerification && (
                        <div className="animate-in fade-in slide-in-from-right-10 duration-500">
                          <div className="flex items-center justify-between mb-10 pb-10 border-b border-white/5">
                            <div className="flex gap-4 items-center">
                              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${selectedVerification.status === 'Verified' ? 'bg-red-500/10 border-red-500/20' : 'bg-green-500/10 border-green-500/20'} border`}>
                                {selectedVerification.status === 'Verified' ? <ShieldAlert className="text-red-500" /> : <CheckCircle className="text-green-500" />}
                              </div>
                              <div>
                                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] leading-none">Verification Outcome</h4>
                                <p className={`text-xl font-black mt-2 uppercase italic ${selectedVerification.status === 'Verified' ? 'text-red-500' : 'text-green-500'}`}>
                                  {selectedVerification.status === 'Verified' ? 'FRAUD CONFIRMED' : 'REASONABLE SAFETY'}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Risk Score</span>
                              <p className="text-2xl font-mono font-bold text-white mt-1">{(selectedVerification.confidence_score * 100).toFixed(1)}%</p>
                            </div>
                          </div>

                          <div className="space-y-10">
                            <div>
                              <h5 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em] mb-6">Neural Analysis Breakdown</h5>
                              <div className="bg-white/5 rounded-3xl p-8 border border-white/5 text-slate-300 leading-relaxed font-light whitespace-pre-line">
                                {selectedVerification.analysis}
                              </div>
                            </div>

                            {selectedVerification.flagged_transactions.length > 0 && (
                              <div>
                                <h5 className="text-[10px] font-black text-red-400 uppercase tracking-[0.3em] mb-6">Flagged Anomalies</h5>
                                <div className="space-y-4">
                                  {selectedVerification.flagged_transactions.map((tx: any) => (
                                    <div key={tx.transaction_id} className="flex items-center justify-between p-6 bg-red-500/5 border border-red-500/10 rounded-2xl">
                                      <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center">
                                          <AlertTriangle className="text-red-500 w-5 h-5" />
                                        </div>
                                        <div>
                                          <p className="text-sm font-bold text-white">{tx.merchant}</p>
                                          <p className="text-[10px] font-medium text-slate-500 uppercase tracking-widest">{tx.geo_location} • {tx.ip_address}</p>
                                        </div>
                                      </div>
                                      <p className="text-lg font-black text-red-500">-${tx.amount}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            <div>
                              <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-6">Automated Response Sequence</h5>
                              <div className="flex flex-wrap gap-4">
                                {selectedVerification.actions_taken.map((action, idx) => (
                                  <div key={idx} className="px-6 py-3 bg-blue-600/10 border border-blue-600/20 rounded-xl text-[10px] font-black text-blue-400 uppercase tracking-widest">
                                    {action}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              /* HUB VIEW (SAME AS PREVIOUS QUERY AREA) */
              <div className="lg:col-span-12 flex flex-col gap-10 min-h-[800px]">
                <div className="glass-indigo rounded-[40px] p-12 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 rounded-full blur-3xl -mr-32 -mt-32"></div>

                  <div className="relative z-10">
                    <div className="mb-8 text-center max-w-2xl mx-auto">
                      <h2 className="text-4xl font-black text-white tracking-tight flex items-center justify-center gap-6 leading-none uppercase italic">
                        Neural Intelligence Hub
                        <Search className="text-blue-400" size={32} />
                      </h2>
                      <p className="text-slate-400 mt-6 text-xl font-light tracking-wide italic">
                        Search decentralized internal documents, compliance SOPs, and historical fraud patterns.
                        <span className="block mt-2 text-sm text-blue-500/60 font-mono tracking-widest">PROPRIETARY NETWORK ACCESS ONLY</span>
                      </p>
                    </div>

                    <form onSubmit={handleQuery} className="relative group max-w-4xl mx-auto mt-12">
                      <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/0 via-blue-600/30 to-blue-600/0 rounded-[30px] opacity-0 group-focus-within:opacity-100 transition-opacity blur-md"></div>
                      <div className="relative flex items-center bg-black/40 border border-white/10 group-focus-within:border-blue-500/50 rounded-[28px] p-3 transition-all">
                        <input
                          className="flex-1 bg-transparent px-8 py-6 text-xl focus:outline-none placeholder:text-slate-600 font-medium"
                          placeholder="Detect patterns in account takeover..."
                          value={query}
                          onChange={(e) => setQuery(e.target.value)}
                        />
                        <button
                          type="submit"
                          disabled={loading || !query.trim()}
                          className="px-12 py-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-30 text-white rounded-[22px] font-black uppercase tracking-widest text-xs transition-all shadow-[0_10px_40px_rgba(59,130,246,0.3)] active:scale-95"
                        >
                          {loading ? <Loader2 className="animate-spin" /> : 'Execute Retrieval'}
                        </button>
                      </div>
                    </form>

                    <div className="mt-12 flex items-center justify-center gap-8">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Hot Protocols</span>
                      <div className="flex gap-4">
                        {['TECH_SYNTH_012', 'SO_ATO_001', 'COMP_AML_004'].map(topic => (
                          <button key={topic} onClick={() => setQuery(topic)} className="px-6 py-2.5 bg-white/5 border border-white/5 rounded-full text-[10px] font-black text-slate-400 hover:text-blue-400 hover:border-blue-400/30 transition-all font-mono tracking-widest">
                            {topic}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* RESPONSE AREA IN HUB VIEW */}
                <div className="min-h-[400px]">
                  {loading && (
                    <div className="flex flex-col items-center justify-center py-24 space-y-6 animate-pulse">
                      <div className="relative">
                        <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
                      </div>
                      <div className="text-center">
                        <p className="text-xl font-black text-white tracking-widest italic uppercase">Syncing Neural Grid</p>
                      </div>
                    </div>
                  )}

                  {error && (
                    <div className="bg-red-500/5 border border-red-500/10 p-10 rounded-[40px] flex gap-8 items-center animate-in fade-in zoom-in duration-300 max-w-4xl mx-auto mb-10">
                      <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(239,68,68,0.2)]">
                        <AlertTriangle className="text-red-500 w-8 h-8" />
                      </div>
                      <div>
                        <h3 className="text-lg font-black text-red-400 uppercase tracking-widest italic">Core Failure</h3>
                        <p className="text-slate-400 mt-2 font-medium">{error}</p>
                      </div>
                    </div>
                  )}

                  {response && (
                    <div className="space-y-10 animate-in slide-in-from-bottom-10 duration-700 ease-out max-w-5xl mx-auto">
                      <div className="glass-card rounded-[40px] p-12 border border-white/5">
                        <div className="flex items-center justify-between mb-10 pb-10 border-b border-white/5">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center justify-center">
                              <CheckCircle className="text-green-500 w-5 h-5" />
                            </div>
                            <div>
                              <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] leading-none">Intelligence Packet Derived</h4>
                              <p className="text-sm font-bold text-blue-400 mt-1 uppercase italic tracking-widest">Confidence: {(response.confidence * 100).toFixed(1)}%</p>
                            </div>
                          </div>
                        </div>

                        <div className="text-slate-300 text-lg leading-relaxed font-light tracking-wide space-y-6">
                          {response.answer.split('\n').map((para, idx) => para.trim() ? (
                            para.startsWith('#') ? (
                              <h5 key={idx} className="text-blue-400 font-black uppercase tracking-widest mt-8 mb-4 border-b border-blue-500/10 pb-2 leading-none">{para.replace(/#/g, '')}</h5>
                            ) : para.startsWith('*') ? (
                              <li key={idx} className="ml-6 list-disc marker:text-blue-500 mb-2">{para.replace(/\*/g, '')}</li>
                            ) : (
                              <p key={idx} className="hover:text-white transition-colors duration-300">{para}</p>
                            )
                          ) : <br key={idx} />)}
                        </div>

                        <div className="flex items-center justify-between mt-12 pt-10 border-t border-white/5">
                          <div className="flex items-center gap-4">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Rate Intelligence</span>
                            <div className="flex gap-2">
                              <button onClick={() => handleFeedback('helpful')} className={`p-4 rounded-2xl glass hover:bg-green-500/10 hover:border-green-500/30 transition-all ${feedbackGiven ? 'opacity-20 translate-y-1' : 'hover:-translate-y-1'}`}>
                                <ThumbsUp size={20} className={feedbackGiven ? 'text-slate-600' : 'text-green-400'} />
                              </button>
                              <button onClick={() => handleFeedback('not helpful')} className={`p-4 rounded-2xl glass hover:bg-red-500/10 hover:border-red-500/30 transition-all ${feedbackGiven ? 'opacity-20 translate-y-1' : 'hover:-translate-y-1'}`}>
                                <ThumbsDown size={20} className={feedbackGiven ? 'text-slate-600' : 'text-red-400'} />
                              </button>
                            </div>
                          </div>
                          <button className="flex items-center gap-3 px-8 py-4 glass rounded-2xl text-xs font-black uppercase tracking-widest text-slate-300 hover:text-white hover:border-blue-500/30 transition-all">
                            Export PDF Briefing <ChevronRight size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 4. TERMINAL FOOTERBAR */}
        <footer className="h-12 border-t border-white/5 glass flex items-center justify-between px-12 text-[10px] font-bold font-mono tracking-widest z-30">
          <div className="flex gap-10">
            <span className="text-slate-600">CLUSTER: <span className="text-blue-500">FIS_PRIMARY_NODE_01</span></span>
            <span className="text-slate-600">ENCRYPTION: <span className="text-green-500">AES_256_GCM</span></span>
          </div>
          <div className="flex items-center gap-6">
            <span className="text-slate-400 flex items-center gap-2">
              <Lock className="w-3 h-3 text-blue-500" /> PROTECTED BY QUANTUM_FENCE
            </span>
          </div>
        </footer>
      </main>
    </div>
  );
};


const MetricBox = ({ label, value, trend, color, icon }: { label: string, value: string, trend: string, color: string, icon?: React.ReactNode }) => {
  const colorMap: any = {
    blue: 'text-blue-500 border-blue-500/20 bg-blue-500/5',
    green: 'text-green-500 border-green-500/20 bg-green-500/5',
    red: 'text-red-500 border-red-500/20 bg-red-500/5',
    indigo: 'text-indigo-500 border-indigo-500/20 bg-indigo-500/5',
  };

  return (
    <div className="glass p-8 rounded-[35px] border border-white/5 space-y-4 hover:border-white/10 transition-all cursor-default group relative overflow-hidden">
      <div className="absolute top-0 right-0 p-8 transform group-hover:scale-110 transition-transform opacity-10">
        {icon || <Activity size={40} />}
      </div>
      <div className="flex items-center justify-between">
        <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${colorMap[color]}`}>
          {label}
        </div>
        <span className={`text-[10px] font-black ${trend.startsWith('+') ? 'text-green-500' : 'text-blue-500'} font-mono`}>{trend}</span>
      </div>
      <div className="flex items-baseline gap-2">
        <p className="text-4xl font-black text-white tracking-widest uppercase italic">{value}</p>
      </div>
    </div>
  );
};

const HealthStat = ({ label, percent }: { label: string, percent: number }) => (
  <div className="flex flex-col items-center gap-3">
    <div className="relative w-12 h-12 flex items-center justify-center">
      <svg className="w-12 h-12 rotate-[-90deg]">
        <circle cx="24" cy="24" r="20" className="stroke-white/5 fill-none" strokeWidth="3" />
        <circle cx="24" cy="24" r="20" className={`stroke-blue-500 fill-none transition-all duration-1000`} strokeWidth="3" strokeDasharray={`${percent * 1.25} 125`} />
      </svg>
      <span className="absolute text-[8px] font-black font-mono text-white">{percent}%</span>
    </div>
    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">{label}</span>
  </div>
);

export default App;
