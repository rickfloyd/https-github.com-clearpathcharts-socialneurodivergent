import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useAuth } from '../contexts/FirebaseContext';
import { 
  BarChart3, Zap, Shield, Heart, Activity, Users, Star, 
  Eye, Ear, ListChecks, AlertCircle, CloudRain, 
  Sun, UserPlus, VolumeX, Target, Layout, Brain
} from 'lucide-react';
import { INTERFACE_PROFILES } from '../lib/interface/profiles';
import { InterfaceProfile } from '../types';
import LegalFooter from './LegalFooter';

interface InterfaceOptimizationHubProps {
  profile: InterfaceProfile;
  onProfileChange: (profileId: string) => void;
  onNavigate: (tab: string) => void;
}

const CATEGORIES = [
  { id: 'analytical', label: 'NEURO-ANALYTICAL' },
  { id: 'tactical', label: 'NEURO-TACTICAL' },
  { id: 'standard', label: 'BASE PROTOCOL' }
];

const PROFILE_ICONS: Record<string, any> = {
  dynamic_balance: Zap,
  focused_analysis: Shield,
  readable_terminal: Eye,
  numeric_precision: Activity,
  interface_friendly: Target,
  stable_rhythm: Activity,
  order_system: ListChecks,
  calm_concentration: Heart,
  low_stim_focus: AlertCircle,
  consistency_matrix: Sun,
  low_glare_mode: CloudRain,
  standard_trader: Layout,
  high_intensity: Users
};

export default function InterfaceOptimizationHub({ profile, onProfileChange, onNavigate }: InterfaceOptimizationHubProps) {
  const [activeCategory, setActiveCategory] = useState('analytical');

  const handleSelect = (p: InterfaceProfile) => {
    onProfileChange(p.id);
  };

  const handleGoToCharts = (e: React.MouseEvent, p: InterfaceProfile) => {
    e.stopPropagation(); // Prevent card selection
    onProfileChange(p.id); // Apply profile first
    onNavigate('Home'); // Then go to charts
  };

  const filteredProfiles = (Object.values(INTERFACE_PROFILES) as InterfaceProfile[]).filter(p => {
    if (activeCategory === 'analytical') {
      return p.id !== 'high_intensity' && p.id !== 'standard_trader';
    }
    if (activeCategory === 'tactical') {
      return p.id === 'high_intensity';
    }
    return p.id === 'standard_trader';
  });

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-12">
      <div className="text-center space-y-4">
        <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter italic">
          <span className="lava-hot-text">NEURODIVERGENT</span> <span className="neon-indigo-text">INTERFACE</span> <span className="lava-hot-text">PROTOCOLS</span>
        </h2>
        <p className="lava-hot-text font-mono uppercase tracking-widest text-sm">
          Calibrate visual sensory input for peak neuro-cognitive market performance
        </p>
      </div>

      {/* Category Tabs */}
      <div className="flex justify-center space-x-4">
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-8 py-3 rounded-full font-black uppercase tracking-widest text-xs transition-all border-2 ${
              activeCategory === cat.id 
                ? 'bg-white text-black border-white' 
                : 'text-gray-500 border-white/10 hover:border-white/30'
            }`}
            style={{ 
              backgroundColor: activeCategory === cat.id ? profile.ui.accent : 'transparent',
              borderColor: activeCategory === cat.id ? profile.ui.accent : undefined,
              color: activeCategory === cat.id ? '#000' : undefined
            }}
          >
            <span className="lava-hot-text">{cat.label}</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProfiles.map((p) => {
          const Icon = PROFILE_ICONS[p.id] || Layout;
          const isActive = profile.id === p.id;

          return (
            <motion.div
              key={p.id}
              whileHover={{ scale: 1.02 }}
              onClick={() => handleSelect(p)}
              className={`p-8 rounded-3xl text-left transition-all duration-500 space-y-4 relative overflow-hidden group border-2 glass cursor-pointer ${
                isActive 
                  ? 'bg-white/5 shadow-[0_0_50px_rgba(255,255,255,0.05)]' 
                  : 'bg-[#0a0a0a] border-white/5 hover:border-white/20'
              }`}
              style={{ 
                borderColor: isActive ? p.ui.accent : undefined,
                background: isActive ? `linear-gradient(to bottom right, ${p.ui.bgTop}, ${p.ui.bgBottom})` : undefined
              }}
            >
              {/* Active Glow */}
              {isActive && (
                <div 
                  className="absolute top-0 right-0 w-40 h-40 blur-[80px] opacity-30"
                  style={{ backgroundColor: p.ui.accent }}
                />
              )}

              <div 
                className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                  isActive ? 'text-black scale-110' : 'bg-white/5 text-gray-500 group-hover:text-white'
                }`}
                style={{ 
                  backgroundColor: isActive ? p.ui.accent : 'rgba(255,255,255,0.05)',
                  boxShadow: isActive ? `0 0 20px ${p.ui.accent}` : 'none'
                }}
              >
                <Icon size={28} />
              </div>

              <div className="space-y-2 relative z-10">
                <h3 className={`text-2xl font-black uppercase tracking-tight transition-colors duration-500 ${isActive ? 'lava-hot-text' : 'text-gray-400'}`}>
                  {p.name}
                </h3>
                <p className={`text-xs leading-relaxed font-sans group-hover:text-gray-400 transition-colors ${isActive ? 'lava-hot-text' : 'text-gray-500'}`}>
                  {p.description}
                </p>
              </div>

              <div className="pt-4 flex items-center justify-between relative z-10">
                {isActive ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.ui.accent }} />
                    <span className="text-[10px] font-mono uppercase tracking-widest font-bold" style={{ color: p.ui.accent }}>
                      <span className="lava-hot-text">Adaptation Protocol Active</span>
                    </span>
                  </div>
                ) : (
                  <div />
                )}
                
                <button
                  onClick={(e) => handleGoToCharts(e, p)}
                  className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all group/btn"
                >
                  <BarChart3 size={14} className="text-gray-400 group-hover/btn:text-white" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 group-hover/btn:text-white">
                    Go to workspace
                  </span>
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Profile Preview Info */}
      <div className="bg-[#0a0a0a] border border-white/5 p-10 rounded-3xl text-center space-y-6 max-w-3xl mx-auto glass">
        <div className="flex justify-center">
          <Brain className="text-indigo-500" size={40} />
        </div>
        <p className="text-gray-400 text-sm leading-relaxed font-sans">
          The <span className="neon-indigo-text">Neurodivergence Hub</span> regulates terminal atmospheric sensory physics—refresh rates, saturation, and data density profiles—to provide a high-performance cognitive environment specifically built for neurodivergent institutional operators. Purge all noise. Retain all clarity.
        </p>
        <div className="pt-4">
          <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-white/5 border border-white/10">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-gray-500"><span className="neon-indigo-text">Neural</span> Sync Online</span>
          </div>
        </div>
      </div>
      <div className="mt-12">
        <LegalFooter profile={profile} />
      </div>
    </div>
  );
}
