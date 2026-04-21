import React from 'react';
import { LightweightCandles } from '../charts/LightweightCandles';
import { ChartFrame } from '../charts/ChartFrame';
import { neuroProfiles } from '../../lib/neuro/profiles';
import { motion } from 'motion/react';
import { TrendingUp, Users, Activity, Zap, Heart, MessageSquare } from 'lucide-react';

interface IntelligenceGatewayProps {
  onNavigate?: (tab: string) => void;
}

const SHOWCASE_PROFILES: (keyof typeof neuroProfiles)[] = [
  'adhd_hyperfocus',
  'autism_predictable',
  'high_contrast',
  'dyslexia_readable'
];

const TRENDING_TOPICS = [
  { tag: '#InstitutionalAlpha', count: '1.2k' },
  { tag: '#PrecisionLogic', count: '850' },
  { tag: '#MarketPhysics', count: '2.4k' },
  { tag: '#ClearPath', count: '3.1k' },
];

const RECENT_ACTIVITY = [
  { user: 'Lisandro Matos', action: 'applied High Precision profile to XAU/USD', time: '2m ago', avatar: 'https://picsum.photos/seed/user1/100/100' },
  { user: 'Gvozden Boskovsky', action: 'shared a 15m BTC markup', time: '15m ago', avatar: 'https://picsum.photos/seed/user2/100/100' },
  { user: 'Hnek Fortuin', action: 'switched to Deep Analysis mode', time: '1h ago', avatar: 'https://picsum.photos/seed/user3/100/100' },
];

export const IntelligenceGateway: React.FC<IntelligenceGatewayProps> = ({ onNavigate }) => {

  return (
    <div className="space-y-12 pb-20 bg-black min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[70vh] min-h-[500px] rounded-b-[60px] overflow-hidden flex items-center px-6 md:px-12 border-b border-white/5 shadow-2xl glass">
        <div className="absolute inset-0 z-0">
          <LightweightCandles profileId="standard_trader" />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent" />
        </div>
        
        <div className="relative z-10 max-w-3xl space-y-10">
          <div className="flex items-center space-x-3 bg-indigo-500/10 border border-indigo-500/20 px-5 py-2 rounded-full w-fit backdrop-blur-md">
            <Zap size={16} className="text-indigo-500" />
            <span className="text-[11px] font-black uppercase tracking-[0.3em] text-indigo-500">System Live // Institutional v4.2.0</span>
          </div>

          <motion.h2 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-xl md:text-2xl font-black tracking-tighter uppercase italic leading-[0.8]"
          >
            ADAPTIVE <br />
            <span className="text-indigo-500">INSTITUTIONAL</span> <br />
            INSIGHTS
          </motion.h2>
          
          <p className="text-gray-400 font-mono text-sm md:text-base uppercase tracking-widest max-w-xl leading-relaxed">
            ClearPath regulates interface <span className="neon-indigo-text">physics</span> to optimize your market perception. 
            Pure analytical clarity for the sophisticated operator.
          </p>

          <div className="flex items-center space-x-8 pt-6">
            <button 
              onClick={() => onNavigate?.('InterfaceHub')}
              className="bg-indigo-500 text-black px-10 py-4 rounded-full font-black uppercase tracking-widest text-sm hover:scale-105 transition-all shadow-[0_0_40px_rgba(79,70,229,0.5)]"
            >
              <span className="lava-hot-text">Explore Interface Hub</span>
            </button>
            <div className="flex items-center space-x-4">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map(i => (
                  <img key={i} src={`https://picsum.photos/seed/u${i}/100/100`} className="w-12 h-12 rounded-full border-2 border-indigo-500/50 object-cover shadow-[0_0_20px_rgba(99,102,241,0.2)]" alt="User" />
                ))}
              </div>
              <div className="flex flex-col">
                <span className="text-white font-black text-sm tracking-tighter">2,400+</span>
                <span className="text-gray-500 text-[9px] uppercase tracking-widest font-mono">Active Nodes</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="px-6 md:px-12 grid grid-cols-1 lg:grid-cols-3 gap-16">
        {/* Main Showcase */}
        <div className="lg:col-span-2 space-y-12">
          <section className="space-y-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Activity size={20} className="text-indigo-500" />
                <h3 className="text-xl font-black tracking-tighter uppercase italic">Institutional Adaptations</h3>
              </div>
              <span className="text-[10px] font-mono uppercase tracking-widest opacity-50">Active Layouts</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {SHOWCASE_PROFILES.map((pid) => {
                const p = neuroProfiles[pid];
                if (!p) return null;
                return (
                  <div key={pid} className="space-y-4 group">
                    <div className="flex items-center justify-between px-2">
                      <span className="text-xs font-bold uppercase tracking-widest" style={{ color: p.text }}>
                        {p.label}
                      </span>
                      <div className="flex items-center space-x-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Heart size={14} className="cursor-pointer hover:text-red-500" />
                        <MessageSquare size={14} className="cursor-pointer hover:text-indigo-500" />
                      </div>
                    </div>
                    <div className="h-[280px] rounded-3xl overflow-hidden border border-white/5 shadow-xl transition-transform hover:scale-[1.02] glass">
                      <ChartFrame profileId={pid} title="BTC/USD">
                        <LightweightCandles profileId={pid} height={280} />
                      </ChartFrame>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        {/* Sidebar Feel */}
        <div className="space-y-12">
          {/* Trending Section */}
          <section className="glass border border-white/10 rounded-[32px] p-8 space-y-6">
            <div className="flex items-center space-x-3">
              <TrendingUp size={18} className="text-indigo-500" />
              <h4 className="text-sm font-black uppercase tracking-widest italic">Institutional Trending</h4>
            </div>
            <div className="space-y-4">
              {TRENDING_TOPICS.map((topic) => (
                <div key={topic.tag} className="flex items-center justify-between group cursor-pointer">
                  <span className="text-xs font-mono lava-hot-text group-hover:text-indigo-500 transition-colors">
                    {topic.tag.includes('Physics') ? (
                      <>
                        {topic.tag.split('Physics')[0]}
                        <span className="neon-indigo-text">Physics</span>
                        {topic.tag.split('Physics')[1]}
                      </>
                    ) : topic.tag}
                  </span>
                  <span className="text-[10px] font-mono opacity-40">{topic.count} nodes</span>
                </div>
              ))}
            </div>
          </section>

          {/* Recent Activity */}
          <section className="space-y-6">
            <div className="flex items-center space-x-3">
              <Users size={18} className="text-indigo-500" />
              <h4 className="text-sm font-black uppercase tracking-widest italic">Network activity</h4>
            </div>
            <div className="space-y-6">
              {RECENT_ACTIVITY.map((act, i) => (
                <div key={i} className="flex items-start space-x-4">
                  <img src={act.avatar} className="w-8 h-8 rounded-full border-2 border-indigo-500/20 object-cover shadow-[0_0_15px_rgba(99,102,241,0.2)]" alt={act.user} />
                  <div className="space-y-1">
                    <p className="text-[11px] leading-tight">
                      <span className="font-bold text-white">{act.user}</span>
                      <span className="text-gray-500 ml-1">{act.action}</span>
                    </p>
                    <span className="text-[9px] font-mono opacity-30 uppercase">{act.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

    </div>
  );
};
