import React from 'react';
import { Activity } from 'lucide-react';

interface MetricBoxProps {
    label: string;
    value: string;
    trend: string;
    color: 'blue' | 'green' | 'red' | 'indigo';
    icon?: React.ReactNode;
}

const MetricBox: React.FC<MetricBoxProps> = ({ label, value, trend, color, icon }) => {
    const colorMap: Record<string, string> = {
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

export default MetricBox;
