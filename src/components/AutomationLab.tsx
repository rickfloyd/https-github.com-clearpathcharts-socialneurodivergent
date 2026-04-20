import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bot, 
  Cpu, 
  ShieldCheck, 
  Zap, 
  BarChart3, 
  Share2, 
  Target, 
  Settings,
  ChevronRight,
  Loader2,
  CheckCircle2,
  Clock,
  Briefcase
} from 'lucide-react';
import { InterfaceProfile } from '../types';

interface AutomationLabProps {
  profile: InterfaceProfile;
}

const CREW_ROLES = [
  {
    id: 'market_analyst',
    name: 'Market Intelligence Agent',
    role: 'Scans global feeds for 4x3 alignment and institutional gaps.',
    frequency: 'Every 5 Minutes',
    status: 'Monitoring',
    tasks: [
      'Analyze DXY/XAU Correlation',
      'Identify Liquidity Clusters',
      'Track Central Bank Keywords'
    ]
  },
  {
    id: 'content_creator',
    name: 'Social Media Strategist',
    role: 'Generates daily insights for Twitter/Discord/Instagram.',
    frequency: 'Daily (08:00 EST)',
    status: 'Standby',
    tasks: [
      'Generate Daily Market Wrap Image',
      'Draft Alpha Insights Thread',
      'Schedule Discord Briefing'
    ]
  },
  {
    id: 'marketing_bot',
    name: 'Growth Engineer',
    role: 'Manages automated ad performance and community scale.',
    frequency: 'Weekly',
    status: 'Online',
    tasks: [
      'Analyze Ad Conversion Rates',
      'Optimize Retargeting Pixels',
      'Engagement Velocity Report'
    ]
  }
];

export default function AutomationLab({ profile }: AutomationLabProps) {
  const [activeCrew, setActiveCrew] = useState(CREW_ROLES[0].id);
  const [isExecuting, setIsExecuting] = useState(false);

  const handleExecute = () => {
    setIsExecuting(true);
    setTimeout(() => setIsExecuting(false), 3000);
  };

  const selectedCrew = CREW_ROLES.find(c => c.id === activeCrew) || CREW_ROLES[0];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
              <Cpu size={24} className="text-indigo-500" />
            </div>
            <h2 className="text-3xl font-black tracking-tighter uppercase italic" style={{ color: profile.ui.text }}>
              Automation <span style={{ color: profile.ui.accent }}>Nexus</span>
            </h2>
          </div>
          <p className="text-gray-500 text-xs font-medium uppercase tracking-[0.2em] ml-1">Autonomous Crew Orchestration // v1.0.2</p>
        </div>

        <div className="flex items-center space-x-4">
           <div className="px-4 py-2 rounded-2xl bg-white/5 border border-white/10 flex items-center space-x-3">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Total Automations: 12 Active</span>
           </div>
           <button className="p-2 rounded-full border border-white/10 text-gray-400 hover:text-white transition-all">
             <Settings size={20} />
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Column: Navigation */}
        <div className="lg:col-span-1 space-y-4">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 ml-2">Active Intelligence Crew</p>
          <div className="space-y-2">
            {CREW_ROLES.map((crew) => (
              <button
                key={crew.id}
                onClick={() => setActiveCrew(crew.id)}
                className={`w-full p-4 rounded-3xl border transition-all flex flex-col items-start gap-2 relative overflow-hidden group ${
                  activeCrew === crew.id 
                    ? 'glass border-indigo-500/50 shadow-lg shadow-indigo-500/10' 
                    : 'border-white/5 hover:border-white/10 hover:bg-white/[0.02]'
                }`}
              >
                {activeCrew === crew.id && (
                  <motion.div 
                    layoutId="active-bg"
                    className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-600/5 -z-10"
                  />
                )}
                <div className="flex items-center justify-between w-full">
                  <span className={`text-[10px] font-black uppercase tracking-widest ${activeCrew === crew.id ? 'text-indigo-400' : 'text-gray-500 dark:text-gray-400'}`}>
                    {crew.id.replace('_', ' ')}
                  </span>
                  {activeCrew === crew.id && <ChevronRight size={14} className="text-indigo-400" />}
                </div>
                <span className={`text-xs font-extrabold text-left ${activeCrew === crew.id ? 'text-white' : 'text-gray-600 dark:text-gray-400'}`}>
                  {crew.name}
                </span>
              </button>
            ))}
          </div>

          <div className="p-6 rounded-[32px] border border-dashed border-white/10 bg-white/[0.01] flex flex-col items-center justify-center text-center space-y-3 mt-8">
            <Bot size={32} className="text-gray-700" />
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-600">Forge New Agent</p>
            <button className="text-[9px] font-black uppercase tracking-widest text-indigo-500/80 hover:text-indigo-400 hover:underline">Access Blueprint Lab</button>
          </div>
        </div>

        {/* Center: Management Console */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass rounded-[40px] border border-white/10 overflow-hidden min-h-[600px] flex flex-col">
            <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                  <Cpu size={24} className="text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-xl font-black tracking-tighter uppercase italic text-white">{selectedCrew.name}</h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-green-500">{selectedCrew.status}</span>
                    <span className="text-gray-700 text-[10px]">•</span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/40">{selectedCrew.frequency}</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={handleExecute}
                disabled={isExecuting}
                className="px-8 py-3 rounded-full bg-indigo-500 text-black font-black uppercase tracking-widest text-xs hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 flex items-center space-x-2 shadow-[0_0_20px_rgba(79,70,229,0.3)]"
              >
                {isExecuting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Synchronizing...</span>
                  </>
                ) : (
                  <>
                    <Zap size={14} />
                    <span>Execute Task</span>
                  </>
                )}
              </button>
            </div>

            <div className="p-8 flex-1 space-y-8">
              <div className="space-y-4">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Core Directive</p>
                <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5">
                  <p className="text-sm font-medium leading-relaxed italic text-gray-300">
                    "{selectedCrew.role}"
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Active Task Stack</p>
                </div>
                <div className="space-y-3">
                  {selectedCrew.tasks.map((task, idx) => (
                    <motion.div 
                      key={task}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="p-4 rounded-2xl border border-white/5 bg-white/[0.01] flex items-center justify-between group hover:border-indigo-500/20 transition-all"
                    >
                      <div className="flex items-center space-x-4">
                         <div className="w-8 h-8 rounded-lg bg-black flex items-center justify-center border border-white/10 group-hover:border-indigo-500/30 transition-all font-mono text-[10px] font-bold text-gray-500">
                           0{idx+1}
                         </div>
                         <span className="text-xs font-bold text-gray-300 group-hover:text-white transition-colors">{task}</span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="text-[9px] font-black uppercase tracking-widest text-green-500/60 flex items-center gap-1.5">
                          <ShieldCheck size={12} />
                          Secure
                        </span>
                        <div className="w-1.5 h-1.5 rounded-full bg-white/5" />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-8 border-t border-white/5 bg-white/[0.01]">
               <div className="flex items-center justify-between">
                 <div className="flex items-center space-x-4">
                   <div className="flex flex-col">
                     <span className="text-[9px] text-gray-500 uppercase font-black mb-1">Last Execution Result</span>
                     <span className="text-xs font-bold text-indigo-400">SUCCESS // LOGS_APPENDED_T0_JOURNAL</span>
                   </div>
                 </div>
                 <button className="text-[9px] font-black uppercase tracking-widest text-white/40 hover:text-white underline">Inspect Logs</button>
               </div>
            </div>
          </div>
        </div>

        {/* Right Column: Insights */}
        <div className="lg:col-span-1 space-y-6">
          <section className="glass rounded-[32px] border border-white/10 p-6 space-y-6">
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Strategic Performance</h4>
            <div className="space-y-6">
              {[
                { label: 'Time Saved (Weekly)', value: '42.5 hrs', icon: Clock, color: 'text-indigo-400' },
                { label: 'Market Ops Efficiency', value: '+18.4%', icon: BarChart3, color: 'text-green-500' },
                { label: 'Ad Performance Delta', value: '+3.2x', icon: Target, color: 'text-purple-400' }
              ].map((metric) => (
                <div key={metric.label} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{metric.label}</span>
                    <metric.icon size={14} className={metric.color} />
                  </div>
                  <p className="text-2xl font-black text-white">{metric.value}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="glass rounded-[32px] border border-white/10 p-6 space-y-4">
             <div className="flex items-center space-x-2 text-indigo-500">
               <Share2 size={16} />
               <h4 className="text-[10px] font-black uppercase tracking-[0.3em]">Channel Broadcasts</h4>
             </div>
             <div className="grid grid-cols-2 gap-2">
               {['Twitter', 'Discord', 'Instagram', 'Telegram'].map(channel => (
                 <div key={channel} className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col items-center justify-center text-center">
                   <span className="text-[9px] font-bold text-white mb-1 uppercase tracking-tighter">{channel}</span>
                   <span className="text-[8px] font-black text-green-500 uppercase tracking-widest">Active</span>
                 </div>
               ))}
             </div>
          </section>

          <div className="p-6 rounded-[32px] bg-gradient-to-br from-indigo-600 to-purple-700 shadow-xl shadow-indigo-500/20 relative overflow-hidden group cursor-pointer">
             <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
               <Briefcase size={80} className="text-white" />
             </div>
             <div className="relative z-10 space-y-4">
                <h4 className="text-white font-black text-lg leading-tight uppercase italic">Strategic <br />Briefing Lab</h4>
                <p className="text-white/70 text-[10px] font-medium leading-relaxed uppercase pr-8">
                  The Matrix Analyst is ready to draft your next weekly institutional report.
                </p>
                <div className="flex items-center space-x-2 text-white font-black text-[9px] uppercase tracking-widest pt-2">
                   <span>Begin Draft</span>
                   <ChevronRight size={12} />
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
