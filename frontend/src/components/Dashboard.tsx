import React from 'react';
import { BarChart3, ShieldAlert, Cpu, Zap, Globe, Shield, CheckCircle, AlertTriangle } from 'lucide-react';
import MetricBox from './MetricBox';
import type { Incident, VerificationResult, Customer, Stats } from '../types';
import axios from 'axios';

interface DashboardProps {
    incidents: Incident[];
    customers: Customer[];
    verifying: boolean;
    selectedVerification: VerificationResult | null;
    onVerifyIncident: (incident: Incident) => void;
    apiBaseUrl: string;
    stats: Stats;
}

const Dashboard: React.FC<DashboardProps> = ({
    incidents,
    customers,
    verifying,
    selectedVerification,
    onVerifyIncident,
    apiBaseUrl,
    stats
}) => {
    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <MetricBox label="Live Cases" value={stats.live_cases} trend="+12%" color="blue" />
                <MetricBox label="Blocked Value" value={stats.blocked_value} trend="+24%" color="green" icon={<BarChart3 size={18} />} />
                <MetricBox label="Threat Intensity" value={stats.threat_intensity} trend="98%" color="red" icon={<ShieldAlert size={18} />} />
                <MetricBox label="Engine Health" value={stats.engine_health} trend="0.03ms" color="indigo" icon={<Cpu size={18} />} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* LIVE MONITORING SIDEBAR */}
                <div className="lg:col-span-4 space-y-10">
                    <div className="glass-card rounded-[40px] p-10 h-full flex flex-col relative z-20">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-blue-400">Threat Matrix</h3>
                                <p className="text-sm font-bold text-slate-500 mt-1">Real-time Interface</p>
                            </div>
                            <button
                                onClick={() => {
                                    const reason = prompt("Enter Fraud Reason:");
                                    const customerId = customers.length > 0 ? customers[Math.floor(Math.random() * customers.length)].id : 'acc_001';
                                    if (reason) {
                                        axios.post(`${apiBaseUrl}/incidents`, { account_id: customerId, reason: reason, report_id: 'manual', reported_by: 'Admin' })
                                            .then(() => window.location.reload());
                                    }
                                }}
                                className="p-3 bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 rounded-2xl transition-all border border-blue-500/20">
                                <Zap size={18} />
                            </button>
                        </div>

                        <div className="flex-1 space-y-6 overflow-y-auto custom-scrollbar pr-2 h-[500px]">
                            {incidents.map((inc) => (
                                <div
                                    key={inc.id}
                                    onClick={() => onVerifyIncident(inc)}
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
                                        <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div> Live Sync</span>
                                        <span className="font-mono">{inc.time}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* INVESTIGATION PANEL */}
                <div className="lg:col-span-8">
                    <div className="glass-card rounded-[40px] p-12 min-h-[600px] flex flex-col relative overflow-hidden">
                        {/* Background branding */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/5 font-black text-9xl -rotate-12 pointer-events-none select-none">
                            DDS-7
                        </div>
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
    );
};

export default Dashboard;
