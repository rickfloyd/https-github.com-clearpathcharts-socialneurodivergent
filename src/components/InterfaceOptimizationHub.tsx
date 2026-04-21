import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useAuth } from '../contexts/FirebaseContext';
import { 
  BarChart3, Zap, Shield, Heart, Activity, Users, Star, 
  Eye, Ear, ListChecks, AlertCircle, CloudRain, 
  Sun, UserPlus, VolumeX, Target, Layout, Brain
} from 'lucide-react';
import { neuroProfiles, type NeuroProfile } from '../lib/neuro/profiles';
import LegalFooter from './LegalFooter';
import LiveChart from './LiveChart';

interface InterfaceOptimizationHubProps {
  profile: NeuroProfile;
  onProfileChange: (profileId: string) => void;
  onNavigate: (tab: string) => void;
}

export default function InterfaceOptimizationHub({ profile, onProfileChange, onNavigate }: InterfaceOptimizationHubProps) {
  const handleSelect = (p: NeuroProfile) => {
    onProfileChange(p.id);
  };

  const handleGoToCharts = (e: React.MouseEvent, p: NeuroProfile) => {
    e.stopPropagation(); // Prevent card selection purely
    onProfileChange(p.id); // Apply profile first
    onNavigate('StrictlyCharts'); // Hide dashboard & open purely charts
  };

  const selectedKeys: (keyof typeof neuroProfiles)[] = [
    'autism_predictable',
    'calm_focus',
    'low_stim_emergency',
    'dyslexia_readable',
    'dyscalculia_numeric_relief',
    'visual_processing_safe',
    'apd_assist',
    'executive_function_support',
    'motor_friendly',
    'adhd_dopamine_balanced',
    'adhd_hyperfocus',
    'tourette_tic_friendly',
    'plain_language',
    'high_contrast',
    'retail_chaos' // Renamed to HFT Scanner
  ];

  const profilesArray = selectedKeys.map(k => neuroProfiles[k]);

  return (
    <div className="max-w-[1400px] mx-auto p-4 md:p-8 space-y-12">
      <div className="text-center space-y-4">
        <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter italic">
          <span style={{ color: profile.borderA }}>NEURODIVERGENT</span> <span className="neon-indigo-text">INTERFACE</span> <span style={{ color: profile.borderB }}>PROTOCOLS</span>
        </h2>
        <p className="font-mono uppercase tracking-widest text-sm" style={{ color: profile.text }}>
          Calibrate visual sensory input for peak neuro-cognitive market performance
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {profilesArray.map((p) => {
          const isActive = profile.id === p.id;

          return (
            <motion.div
              key={p.id}
              whileHover={{ scale: 1.02 }}
              onClick={() => handleSelect(p)}
              className={`p-6 rounded-3xl text-left transition-all duration-500 space-y-8 relative overflow-hidden group border-2 glass cursor-pointer ${
                isActive 
                  ? 'shadow-[0_0_50px_rgba(255,255,255,0.05)]' 
                  : 'hover:border-white/20'
              }`}
              style={{ 
                borderColor: isActive ? '#ffffff' : 'rgba(255,255,255,0.1)',
                background: 'linear-gradient(135deg, #FF4500 0%, #FF00FF 100%)'
              }}
            >
              {/* Active Glow */}
              {isActive && (
                <div 
                  className="absolute top-0 right-0 w-40 h-40 blur-[80px] opacity-30 bg-white"
                />
              )}

              <div className="space-y-1 relative z-10 flex-col flex flex-1">
                <h3 className={`text-xl font-black uppercase tracking-tight transition-colors duration-500 text-white`}>
                  {p.label}
                </h3>
                <div className="flex gap-2 text-[9px] font-mono uppercase opacity-90 text-white/80">
                  <span>DENSITY: {p.dataDensity}</span>
                  <span>GLOW: {p.glow}</span>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between relative z-10">
                {isActive ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full shadow-[0_0_10px_currentColor] bg-white text-white" />
                    <span className="text-[9px] font-mono uppercase tracking-widest font-bold text-white">
                      Active
                    </span>
                  </div>
                ) : (
                  <div />
                )}
                
                <button
                  onClick={(e) => handleGoToCharts(e, p)}
                  className="flex items-center space-x-2 px-6 py-3 rounded-xl bg-black/60 border border-white/20 hover:bg-black transition-all group/btn w-full justify-center mt-2"
                >
                  <BarChart3 size={16} className="text-white group-hover/btn:text-[#FF4500]" />
                  <span className="text-[12px] font-black uppercase tracking-widest text-white group-hover/btn:text-[#FF4500]">
                    GO TO CHART
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
        <LegalFooter profile={profile as any} />
      </div>
    </div>
  );
}
