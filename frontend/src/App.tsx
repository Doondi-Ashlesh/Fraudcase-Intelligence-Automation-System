import React, { useState } from 'react';
import axios from 'axios';
import { Search, Send, ThumbsUp, ThumbsDown, Info, Shield, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';

// API Configuration
const API_BASE_URL = 'http://localhost:8000/api/v1';

interface QueryResponse {
  answer: string;
  sources: string[];
  confidence: number;
}

const App: React.FC = () => {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState<QueryResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedbackGiven, setFeedbackGiven] = useState(false);

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
      setError(err.response?.data?.detail || 'Failed to fetch response from SupportIQ');
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
    <div className="min-h-screen w-full bg-slate-900 text-slate-100 p-4 md:p-8 font-sans selection:bg-indigo-500/30">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Support<span className="text-indigo-400">IQ</span></h1>
              <p className="text-sm text-slate-400">AI Knowledge Assistant for Customer Care</p>
            </div>
          </div>
          <div className="flex items-center gap-4 bg-white/5 px-4 py-2 rounded-full border border-white/10 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-xs font-medium text-slate-300">System Online</span>
            </div>
            <div className="h-4 w-px bg-white/10"></div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Tier 1 Agent</span>
          </div>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Query Section */}
          <section className="lg:col-span-4 space-y-6 bg-white/5 p-6 rounded-2xl border border-white/10 backdrop-blur-md">
            <div className="space-y-2">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Search className="w-5 h-5 text-indigo-400" />
                Knowledge Query
              </h2>
              <p className="text-sm text-slate-400">Enter a natural language question based on internal documentation.</p>
            </div>

            <form onSubmit={handleQuery} className="space-y-4">
              <div className="relative group">
                <textarea
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="e.g., How do I reset a user password for v2 systems?"
                  className="w-full h-40 bg-slate-950 border border-white/10 rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all resize-none placeholder:text-slate-600"
                />
                <button
                  type="submit"
                  disabled={loading || !query.trim()}
                  className="absolute bottom-3 right-3 p-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:hover:bg-indigo-600 text-white rounded-lg transition-colors shadow-lg shadow-indigo-900/20"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                </button>
              </div>
            </form>

            <div className="pt-4 space-y-3 border-t border-white/5">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-500">Quick Actions</h3>
              <div className="flex flex-wrap gap-2 text-[10px]">
                {['Password Reset', 'Refund Policy', 'API Docs', 'Tier 2 Escalation'].map(tag => (
                  <button key={tag} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-colors uppercase tracking-wider font-bold text-slate-400 hover:text-indigo-300">
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Answer Section */}
          <section className="lg:col-span-8 space-y-8 min-h-[500px]">
            {loading && (
              <div className="h-full flex flex-col items-center justify-center space-y-4 animate-in fade-in zoom-in duration-300">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin"></div>
                  <Loader2 className="w-8 h-8 text-indigo-400 absolute inset-0 m-auto animate-pulse" />
                </div>
                <p className="text-indigo-300 font-medium animate-pulse">Consulting Knowledge Base...</p>
              </div>
            )}

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-2xl flex gap-4 items-start animate-in slide-in-from-top-4">
                <AlertTriangle className="w-6 h-6 text-red-500 shrink-0" />
                <div>
                  <h3 className="font-semibold text-red-400 text-lg">Retrieval Failed</h3>
                  <p className="text-sm text-red-300/80 leading-relaxed mt-1">{error}</p>
                </div>
              </div>
            )}

            {response && (
              <div className="space-y-6 animate-in slide-in-from-bottom-8 duration-500">

                {/* Answer Card */}
                <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-lg">
                  <div className="p-8 space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span className="text-xs font-bold uppercase tracking-widest text-indigo-400">Grounded Answer</span>
                      </div>
                      <div className={`px-4 py-1.5 rounded-full border flex items-center gap-2 ${response.confidence > 0.8 ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-amber-500/10 border-amber-500/20 text-amber-400'}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${response.confidence > 0.8 ? 'bg-green-500' : 'bg-amber-500'}`}></div>
                        <span className="text-[10px] font-bold uppercase tracking-widest">Confidence: {Math.round(response.confidence * 100)}%</span>
                      </div>
                    </div>

                    <div className="prose prose-invert max-w-none">
                      <p className="text-lg leading-relaxed text-slate-200">
                        {response.answer}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 pt-4 border-t border-white/5">
                      <span className="text-xs text-slate-500">Was this helpful?</span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleFeedback('helpful')}
                          disabled={feedbackGiven}
                          className={`p-2 rounded-lg transition-all ${feedbackGiven ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-500/20 hover:text-green-400'}`}
                        >
                          <ThumbsUp className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleFeedback('not helpful')}
                          disabled={feedbackGiven}
                          className={`p-2 rounded-lg transition-all ${feedbackGiven ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-500/20 hover:text-red-400'}`}
                        >
                          <ThumbsDown className="w-5 h-5" />
                        </button>
                        {feedbackGiven && <span className="text-xs text-indigo-400 font-medium self-center px-2">Thank you!</span>}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sources Card */}
                <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-2xl p-6">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-4 flex items-center gap-2">
                    <Info className="w-4 h-4" />
                    Source References
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {response.sources.map((source, i) => (
                      <div key={i} className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-xs font-medium text-slate-300">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                        {source}
                      </div>
                    ))}
                    {response.sources.length === 0 && <span className="text-xs text-slate-500 italic">No explicit sources referenced.</span>}
                  </div>
                </div>

              </div>
            )}

            {!response && !loading && !error && (
              <div className="h-full flex flex-col items-center justify-center opacity-40 space-y-6 grayscale contrast-[0.8]">
                <div className="relative">
                  <div className="w-32 h-32 rounded-full border-2 border-indigo-500/30 flex items-center justify-center">
                    <Shield className="w-16 h-16 text-indigo-500/50" />
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-indigo-500/20 rounded-2xl flex items-center justify-center rotate-12">
                    <Search className="w-6 h-6 text-indigo-500/50" />
                  </div>
                </div>
                <div className="text-center space-y-2">
                  <h3 className="text-xl font-semibold">Knowledge Insight</h3>
                  <p className="max-w-xs text-sm leading-relaxed">
                    I'm ready to assist. Ask a question about policies, reset procedures, or technical manuals.
                  </p>
                </div>
              </div>
            )}
          </section>
        </main>

        <footer className="pt-12 border-t border-white/5 text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-600">
            Powered by Modular RAG & FAISS · Built for Precision Support
          </p>
        </footer>
      </div>
    </div>
  );
};

export default App;
