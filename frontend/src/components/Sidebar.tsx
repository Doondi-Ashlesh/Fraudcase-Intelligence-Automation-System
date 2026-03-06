import React from 'react';
import { Shield, Settings, LayoutDashboard, Zap } from 'lucide-react';

interface NavItemProps {
    icon: React.ReactNode;
    label: string;
    active: boolean;
    onClick: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, active, onClick }) => (
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

interface SidebarProps {
    activeView: 'dashboard' | 'hub';
    setActiveView: (view: 'dashboard' | 'hub') => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView }) => {
    return (
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
    );
};

export default Sidebar;
