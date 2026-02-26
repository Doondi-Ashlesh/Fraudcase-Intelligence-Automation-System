import React, { useState } from 'react';
import axios from 'axios';
import {
  Send, ThumbsUp, ThumbsDown, Shield,
  CheckCircle, AlertTriangle, Loader2, LayoutDashboard,
  ShieldAlert, Database, Settings, Activity, Terminal,
  TrendingUp, Users, Lock, MoreVertical
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
}

const App: React.FC = () => {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState<QueryResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedbackGiven, setFeedbackGiven] = useState(false);

  // Mock live incidents for the dashboard feel
  const [incidents] = useState<Incident[]>([
    { id: 'TX-9021', type: 'Potential ATO', severity: 'High', time: '2m ago' },
    { id: 'TX-8832', type: 'Synthetic ID Check', severity: 'Medium', time: '5m ago' },
    { id: 'TX-8741', type: 'Velocity Limit Peak', severity: 'Low', time: '12m ago' },
  ]);

  const handleQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setResponse(null);
    setError(null);
    setFeedbackGiven(false);

    try {
      const { data } = await axios.post(`${API_BASE_URL}/query`, { query });
      setResponse(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'FIS Engine Retrieval Failure');
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

  return (
    <div className="flex h-screen w-full overflow-hidden text-slate-200">

      {/* 1. SIDEBAR (Minimalist Navigation) */}
      <aside className="w-20 flex flex-col items-center py-8 border-r border-white/5 glass">
        <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center mb-12 shadow-lg shadow-blue-500/20">
          <Shield className="w-7 h-7 text-white" />
        </div>
        <nav className="flex flex-col gap-8">
          <NavItem icon={<LayoutDashboard className="w-6 h-6" />} active />
          <NavItem icon={<ShieldAlert className="w-6 h-6" />} />
          <NavItem icon={<Database className="w-6 h-6" />} />
          <NavItem icon={<Activity className="w-6 h-6" />} />
        </nav>
        <div className="mt-auto">
          <NavItem icon={<Settings className="w-6 h-6" />} />
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <div className="scan-line" />

        {/* 2. HEADER (Search & Status) */}
        <header className="h-20 flex items-center justify-between px-10 border-b border-white/5 backdrop-blur-md z-10">
          <div className="flex flex-col">
            <h1 className="text-xl font-bold tracking-tight flex items-center gap-3">
              FIS <span className="text-blue-500 font-normal">| Intelligence Center</span>
            </h1>
            <div className="flex items-center gap-2 mt-0.5">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-green-500/80">Engine v2.4.1 Online</span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-xs">
              <Terminal className="w-4 h-4 text-blue-400" />
              <span className="font-mono text-slate-400">SESSION_TOKEN: FIS_7721_X</span>
            </div>
          </div>
        </header>

        {/* 3. DASHBOARD GRID */}
        <div className="flex-1 overflow-y-auto p-10 space-y-8 custom-scrollbar relative z-10">

          {/* Top Row: Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <MetricCard label="Active Fraud Cases" value="482" change="+12.5%" icon={<ShieldAlert className="text-red-400" />} />
            <MetricCard label="Identities Verified" value="1.2k" change="+3%" icon={<CheckCircle className="text-green-400" />} />
            <MetricCard label="Blocked Loss (EST)" value="$142k" change="+18%" icon={<TrendingUp className="text-blue-400" />} />
            <MetricCard label="Intelligence Accuracy" value="98.2%" change="+0.4%" icon={<Users className="text-indigo-400" />} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-fit">

            {/* Left Box: RAG Intelligence Search */}
            <div className="lg:col-span-8 flex flex-col space-y-6">
              <div className="glass-indigo rounded-3xl p-8 border border-white/10 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5">
                  <Database className="w-32 h-32" />
                </div>

                <div className="relative z-10 space-y-6">
                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                      Intelligence Query
                      <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded border border-blue-500/30 uppercase tracking-[0.2em]">FAISS</span>
                    </h2>
                    <p className="text-slate-400 text-sm max-w-lg">Retrieve technical blueprints, SOPs, and fraud patterns from the global knowledge base.</p>
                  </div>

                  <form onSubmit={handleQuery} className="group flex items-center gap-4 bg-black/40 border border-white/10 focus-within:border-blue-500/50 p-2 rounded-2xl transition-all shadow-inner">
                    <input
                      className="flex-1 bg-transparent px-4 py-3 text-sm focus:outline-none placeholder:text-slate-600"
                      placeholder="Identify patterns in Synthetic ID Fraud..."
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                    />
                    <button
                      type="submit"
                      disabled={loading || !query.trim()}
                      className="p-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl transition-all shadow-lg shadow-blue-900/40"
                    >
                      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                    </button>
                  </form>

                  <div className="flex gap-2">
                    {['Synthetic ID Patterns', 'ATO Verification', 'SAR Filing SOP'].map(tag => (
                      <button key={tag} onClick={() => setQuery(tag)} className="text-[10px] font-bold uppercase tracking-wider text-slate-500 hover:text-blue-400 transition-colors">
                        [ {tag} ]
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Response Section */}
              <div className="min-h-[300px]">
                {loading && (
                  <div className="flex flex-col items-center justify-center h-full py-12 space-y-4 animate-pulse">
                    <Activity className="w-12 h-12 text-blue-500" />
                    <p className="font-mono text-xs text-blue-400 uppercase tracking-widest">Scanning encrypted volumes...</p>
                  </div>
                )}

                {error && (
                  <div className="bg-red-500/5 border border-red-500/20 p-6 rounded-2xl flex items-start gap-4">
                    <AlertTriangle className="w-5 h-5 text-red-500 mt-1" />
                    <div>
                      <h3 className="text-sm font-bold text-red-400 uppercase tracking-wider">Engine Error</h3>
                      <p className="text-xs text-red-300/60 mt-1">{error}</p>
                    </div>
                  </div>
                )}

                {response && (
                  <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                    <div className="glass p-8 rounded-3xl border border-white/5 space-y-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-400" />
                          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">Intelligence Briefing</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-[10px] text-slate-500 font-mono tracking-tighter">CONFIDENCE_SCORE // {(response.confidence * 100).toFixed(2)}%</span>
                          <div className="w-32 h-1 bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 rounded-full" style={{ width: `${response.confidence * 100}%` }} />
                          </div>
                        </div>
                      </div>

                      <div className="text-slate-300 text-sm leading-relaxed space-y-4">
                        {response.answer.split('\n').map((para, i) => para.trim() && (
                          <p key={i}>{para}</p>
                        ))}
                      </div>

                      <div className="flex items-center gap-6 pt-6 border-t border-white/5">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => !feedbackGiven && handleFeedback('helpful')}
                            className={`p-2 rounded-lg transition-colors ${feedbackGiven ? 'opacity-30' : 'hover:bg-green-500/20 text-slate-500 hover:text-green-500'}`}
                          >
                            <ThumbsUp className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => !feedbackGiven && handleFeedback('not helpful')}
                            className={`p-2 rounded-lg transition-colors ${feedbackGiven ? 'opacity-30' : 'hover:bg-red-500/20 text-slate-500 hover:text-red-500'}`}
                          >
                            <ThumbsDown className="w-4 h-4" />
                          </button>
                        </div>
                        {feedbackGiven && <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Feedback Logged</span>}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 px-1">Verified Sources</h4>
                      <div className="flex flex-wrap gap-2">
                        {response.sources.map(s => (
                          <div key={s} className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg flex items-center gap-2 text-[10px] font-medium text-slate-400 hover:text-white transition-colors cursor-pointer capitalize">
                            <Database className="w-3 h-3 text-blue-500" />
                            {s.split(/[\\/]/).pop()}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Box: Live Feed & Stats */}
            <div className="lg:col-span-4 space-y-6">
              <div className="glass p-6 rounded-2xl border border-white/5 flex flex-col h-full space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Live Incident Feed</h3>
                  <MoreVertical className="w-4 h-4 text-slate-600" />
                </div>

                <div className="space-y-4">
                  {incidents.map(inc => (
                    <div key={inc.id} className="group relative bg-black/20 border border-white/5 p-4 rounded-xl hover:border-blue-500/30 transition-all cursor-pointer">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-mono text-blue-500">{inc.id}</span>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded uppercase font-bold ${inc.severity === 'High' ? 'bg-red-500/20 text-red-500' :
                            inc.severity === 'Medium' ? 'bg-amber-500/20 text-amber-500' :
                              'bg-blue-500/20 text-blue-500'
                          }`}>{inc.severity}</span>
                      </div>
                      <p className="text-xs font-semibold text-slate-300">{inc.type}</p>
                      <div className="flex items-center justify-between mt-3 text-[10px] text-slate-600">
                        <span className="flex items-center gap-1"><Activity className="w-3 h-3" /> Monitoring</span>
                        <span>{inc.time}</span>
                      </div>
                    </div>
                  ))}
                  <button className="w-full py-3 border border-dashed border-white/10 rounded-xl text-[10px] uppercase font-bold tracking-widest text-slate-500 hover:bg-white/5 transition-all">
                    View Full Audit Log
                  </button>
                </div>

                <div className="pt-6 border-t border-white/5 mt-auto text-center">
                  <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest mb-3">System Health</p>
                  <div className="flex justify-around">
                    <HealthStat label="API" ok />
                    <HealthStat label="DB" ok />
                    <HealthStat label="AI" ok />
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Footer info bar */}
        <footer className="h-10 border-t border-white/5 glass flex items-center justify-between px-10 text-[9px] font-mono text-slate-500">
          <div className="flex gap-6">
            <span>UPTIME: 99.999%</span>
            <span>REGION: US-EAST-1</span>
          </div>
          <div className="flex items-center gap-2">
            <Lock className="w-3 h-3 text-blue-500" />
            <span>ENCRYPTION ACTIVE</span>
          </div>
        </footer>
      </main>
    </div>
  );
};

// UI Components
const NavItem = ({ icon, active = false }: { icon: React.ReactNode, active?: boolean }) => (
  <button className={`w-12 h-12 flex items-center justify-center rounded-xl transition-all ${active ? 'bg-blue-600/10 text-blue-500 border border-blue-500/20' : 'text-slate-600 hover:text-slate-300'
    }`}>
    {icon}
  </button>
);

const MetricCard = ({ label, value, change, icon }: { label: string, value: string, change: string, icon: React.ReactNode }) => (
  <div className="glass p-5 rounded-2xl border border-white/5 space-y-1 hover:border-white/10 transition-all cursor-default group">
    <div className="flex items-center justify-between mb-2">
      <div className="p-2 bg-white/5 rounded-lg group-hover:bg-blue-500/10 transition-colors">
        {icon}
      </div>
      <span className={`text-[10px] font-bold ${change.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>{change}</span>
    </div>
    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 uppercase">{label}</p>
    <p className="text-xl font-bold text-white tracking-tight">{value}</p>
  </div>
);

const HealthStat = ({ label, ok }: { label: string, ok: boolean }) => (
  <div className="flex flex-col items-center gap-1">
    <div className={`w-2 h-2 rounded-full ${ok ? 'bg-green-500' : 'bg-red-500'} shadow-[0_0_8px_rgba(34,197,94,0.4)]`}></div>
    <span className="text-[8px] font-black">{label}</span>
  </div>
);

export default App;
