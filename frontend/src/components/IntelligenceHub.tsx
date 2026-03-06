import React from 'react';
import { Search, Loader2, AlertTriangle, CheckCircle, ThumbsUp, ThumbsDown, ChevronRight } from 'lucide-react';
import type { QueryResponse } from '../types';

interface IntelligenceHubProps {
    query: string;
    setQuery: (q: string) => void;
    loading: boolean;
    error: string | null;
    response: QueryResponse | null;
    feedbackGiven: boolean;
    onQuery: (e: React.FormEvent) => void;
    onFeedback: (rating: 'helpful' | 'not helpful') => void;
}

const IntelligenceHub: React.FC<IntelligenceHubProps> = ({
    query,
    setQuery,
    loading,
    error,
    response,
    feedbackGiven,
    onQuery,
    onFeedback
}) => {
    return (
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

                    <form onSubmit={onQuery} className="relative group max-w-4xl mx-auto mt-12">
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
                                        <button onClick={() => onFeedback('helpful')} className={`p-4 rounded-2xl glass hover:bg-green-500/10 hover:border-green-500/30 transition-all ${feedbackGiven ? 'opacity-20 translate-y-1' : 'hover:-translate-y-1'}`}>
                                            <ThumbsUp size={20} className={feedbackGiven ? 'text-slate-600' : 'text-green-400'} />
                                        </button>
                                        <button onClick={() => onFeedback('not helpful')} className={`p-4 rounded-2xl glass hover:bg-red-500/10 hover:border-red-500/30 transition-all ${feedbackGiven ? 'opacity-20 translate-y-1' : 'hover:-translate-y-1'}`}>
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
    );
};

export default IntelligenceHub;
