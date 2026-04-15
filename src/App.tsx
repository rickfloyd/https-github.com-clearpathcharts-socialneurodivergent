import React, { useState, useEffect, Suspense, lazy } from 'react';
import { NEURO_PROFILES } from './lib/neuro/profiles';
import { NeuroProfile } from './types';
import { FirebaseProvider, useAuth } from './contexts/FirebaseContext';
import { loginWithGoogle } from './firebase';
import { motion } from 'motion/react';
import { TrendingUp, ShieldCheck, Zap } from 'lucide-react';
import ErrorBoundary from './components/ErrorBoundary';
import { DataStreamService } from './services/dataStreamService';
import { IntelligenceService } from './services/intelligenceService';

import { SurfBackground } from './components/SurfBackground';
import { VoiceAssistant } from './components/VoiceAssistant';

// Lazy load heavy components
const Dashboard = lazy(() => import('./components/Dashboard'));

function LoadingScreen({ message }: { message: string }) {
  return (
    <div className="h-[100dvh] w-full bg-[#050505] flex items-center justify-center relative overflow-hidden">
      <SurfBackground />
      <div className="flex flex-col items-center space-y-4 relative z-10">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin shadow-[0_0_20px_rgba(79,70,229,0.4)]" />
        <div className="text-indigo-500 font-mono text-sm tracking-widest uppercase">
          {message}
        </div>
      </div>
    </div>
  );
}

function AppContent() {
  console.log('AppContent: Starting render');
  const { user, loading, userProfile, updateProfile } = useAuth();
  const [activeProfile, setActiveProfile] = useState<NeuroProfile>(NEURO_PROFILES.standard_trader);

  console.log('AppContent: Auth state:', { user: !!user, loading, userProfile: !!userProfile });

  useEffect(() => {
    // Initialize global institutional data stream
    DataStreamService.connectInstitutionalStream();
  }, []);

  useEffect(() => {
    // Run intelligence cycle only when authenticated
    if (user && !loading) {
      IntelligenceService.runCycle();
    }
  }, [user, loading]);

  useEffect(() => {
    if (userProfile?.neuroType) {
      const profile = Object.values(NEURO_PROFILES).find(p => p.id === userProfile.neuroType);
      if (profile) {
        setActiveProfile(profile);
      }
    }
  }, [userProfile]);

  const handleProfileChange = async (profileId: string) => {
    const profile = NEURO_PROFILES[profileId as keyof typeof NEURO_PROFILES];
    if (profile) {
      setActiveProfile(profile);
      if (user) {
        await updateProfile({ neuroType: profileId as any });
      }
    }
  };

  useEffect(() => {
    const handleCommand = (e: any) => {
      const { action, target } = e.detail;
      if (action === 'change-profile') {
        handleProfileChange(target);
      }
    };
    window.addEventListener('app-command', handleCommand);
    return () => window.removeEventListener('app-command', handleCommand);
  }, [user]);

  if (loading) {
    return <LoadingScreen message="Synchronizing NEURO ADAPTIVE INSIGHTS..." />;
  }

  if (!user) {
    return (
      <div className="h-[100dvh] w-full bg-[#050505] flex flex-col items-center justify-center p-6 relative overflow-hidden">
        <SurfBackground />
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 max-w-md w-full text-center space-y-12 glass p-10 rounded-3xl"
        >
          <div className="space-y-4">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-indigo-500/20 rounded-2xl flex items-center justify-center border border-indigo-500/30">
                <TrendingUp className="text-indigo-500" size={32} />
              </div>
            </div>
            <h1 className="text-2xl font-black lava-hot-text tracking-tighter uppercase italic leading-none">
              NEURO<br />ADAPTIVE<br />INSIGHTS
            </h1>
            <p className="text-gray-500 font-mono text-sm uppercase tracking-widest">
              Institutional Intelligence
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 text-left">
            <div className="flex items-start space-x-4 p-4 rounded-xl bg-lava-red/5 border border-lava-red/10">
              <Zap className="text-yellow-500 mt-1" size={20} />
              <div>
                <h3 className="lava-hot-text font-bold text-sm">Cognitive Optimization</h3>
                <p className="text-gray-500 text-xs">Dynamic UI adaptation based on neuro-divergent profiles.</p>
              </div>
            </div>
            <div className="flex items-start space-x-4 p-4 rounded-xl bg-lava-red/5 border border-lava-red/10">
              <ShieldCheck className="lava-hot-text mt-1" size={20} />
              <div>
                <h3 className="lava-hot-text font-bold text-sm">Secure Cloud Sync</h3>
                <p className="text-gray-500 text-xs">Your neuro-profile and trading data synced across all devices.</p>
              </div>
            </div>
          </div>

          <button 
            onClick={() => loginWithGoogle()}
            className="w-full py-4 lava-hot-gradient text-black font-black uppercase tracking-widest rounded-xl hover:bg-indigo-500 hover:lava-hot-text transition-all duration-300 shadow-[0_0_30px_rgba(255,0,0,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.4)]"
          >
            Authenticate via Google
          </button>

          <p className="text-[10px] text-gray-600 uppercase tracking-widest leading-relaxed">
            By authenticating, you agree to the neuro-link protocols and data privacy standards.
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <SurfBackground />
      <Suspense fallback={<LoadingScreen message="Initializing Neural Interface..." />}>
        <Dashboard profile={activeProfile} onProfileChange={handleProfileChange} />
      </Suspense>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <FirebaseProvider>
        <AppContent />
      </FirebaseProvider>
    </ErrorBoundary>
  );
}
