import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Info, CheckCircle2, AlertTriangle, Scale } from 'lucide-react';
import { useAuth } from '../contexts/FirebaseContext';

export const DailyLegalModal = () => {
  const { userProfile, updateProfile } = useAuth();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (userProfile) {
      const lastAck = userProfile.lastLegalAck;
      const today = new Date().toISOString().split('T')[0];
      
      if (!lastAck || lastAck.split('T')[0] !== today) {
        setShow(true);
      }
    }
  }, [userProfile]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAgree = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      await updateProfile({
        lastLegalAck: new Date().toISOString()
      });
      setShow(false);
    } catch (err: any) {
      console.error("[DailyLegalModal] Failed to log acknowledgement:", err);
      setError("Compliance log failure. Please retry or contact system admin.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!show) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/90 backdrop-blur-2xl"
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-lg bg-[#050505] border border-white/10 rounded-[32px] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.8)] my-auto"
        >
          <div className="p-8 space-y-6">
            <div className="flex items-center space-x-3 text-white">
              <UsersIcon size={20} className="text-white/60" />
              <h2 className="text-sm font-black uppercase tracking-widest italic">Daily Confirmation Required - Clear Path Understanding</h2>
            </div>

            <div className="space-y-4">
              <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-gray-400 leading-relaxed bg-white/[0.02] p-4 rounded-2xl border border-white/[0.05]">
                ClearPath is a <span className="text-white font-bold">data visualization</span>, <span className="text-white font-bold">education</span>, and <span className="text-white font-bold">community</span> platform.
              </p>

              <div className="space-y-2">
                {[
                  { icon: Shield, text: "No trade execution / routing / custody." },
                  { icon: Info, text: "No personalized recommendations." },
                  { icon: Scale, text: "Jurisdiction varies. Verify eligibility in your region." }
                ].map((item, i) => (
                  <div key={i} className="flex items-center space-x-3 bg-white/[0.01] border border-white/[0.03] p-3 rounded-2xl hover:bg-white/[0.03] transition-colors">
                    <item.icon size={14} className="text-indigo-500 shrink-0" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-gray-300">{item.text}</span>
                  </div>
                ))}
              </div>

              {error ? (
                <div className="flex items-center space-x-2 text-red-500 bg-red-500/10 p-3 rounded-xl border border-red-500/20 animate-pulse">
                  <AlertTriangle size={14} />
                  <span className="text-[9px] font-black uppercase tracking-widest">{error}</span>
                </div>
              ) : (
                <p className="text-[9px] font-mono italic text-gray-500 uppercase tracking-widest text-center pt-2">
                  By clicking Agree, you acknowledge this disclosure for today.
                </p>
              )}
            </div>

            <div className="flex items-center justify-between pt-4">
              <div className="flex space-x-2">
                <button className="px-4 py-2 rounded-full border border-white/10 text-[9px] font-black uppercase tracking-widest text-gray-500 hover:text-white hover:bg-white/5 transition-all">
                  Compliance
                </button>
                <button className="px-4 py-2 rounded-full border border-white/10 text-[9px] font-black uppercase tracking-widest text-gray-500 hover:text-white hover:bg-white/5 transition-all">
                  Risk
                </button>
              </div>

              <button 
                onClick={handleAgree}
                disabled={isSubmitting}
                className="px-8 py-3 rounded-full bg-indigo-500 text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-[0_0_30px_rgba(99,102,241,0.4)] hover:scale-105 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={12} className="animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <span>I Agree (Today)</span>
                )}
              </button>
            </div>
          </div>
          
          <div className="h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

const UsersIcon = ({ size, className }: any) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const Loader2 = ({ size, className }: any) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);
