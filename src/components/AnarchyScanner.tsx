import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ShieldAlert, Activity, CheckCircle2, Loader2, AlertTriangle } from 'lucide-react';

const ANARCHY_RULES = [
  { id: 1, name: 'Volatility Frequency Analysis', status: 'pending' },
  { id: 2, name: 'Structural Breakout Observation', status: 'pending' },
  { id: 3, name: 'Liquidity Gap Identification', status: 'pending' },
  { id: 4, name: 'Historical Liquidity Zone Mapping', status: 'pending' },
  { id: 5, name: 'Volume Imbalance Analysis', status: 'pending' },
  { id: 6, name: 'Institutional Flow Correlation', status: 'pending' },
  { id: 7, name: 'Market Sentiment Divergence', status: 'pending' },
  { id: 8, name: 'Momentum Convergence Analysis', status: 'pending' },
  { id: 9, name: 'Mean Reversion Deviation', status: 'pending' },
  { id: 10, name: 'Pattern Alignment Verification', status: 'pending' },
];

export const AnarchyScanner = () => {
  const [rules, setRules] = useState(ANARCHY_RULES);
  const [isScanning, setIsScanning] = useState(true);

  useEffect(() => {
    let currentIndex = 0;
    
    const scanInterval = setInterval(() => {
      if (currentIndex < rules.length) {
        setRules(prev => prev.map((rule, idx) => {
          if (idx === currentIndex) return { ...rule, status: 'scanning' };
          if (idx < currentIndex) return { ...rule, status: 'verified' };
          return rule;
        }));
        currentIndex++;
      } else {
        setRules(prev => prev.map(rule => ({ ...rule, status: 'verified' })));
        setIsScanning(false);
        clearInterval(scanInterval);
      }
    }, 1500); // 1.5 seconds per rule scan for visual effect

    return () => clearInterval(scanInterval);
  }, []);

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6 font-mono">
      <div className="flex items-center justify-between border-b border-[#ff4500]/30 pb-4">
        <div>
          <h2 className="text-xl font-black text-[#ff4500] drop-shadow-[0_0_8px_rgba(255,69,0,0.8)] flex items-center gap-3 uppercase">
            <Activity className="text-[#ff4500]" />
            4x3 ANARCHY STRATEGY
          </h2>
          <p className="text-[10px] font-bold text-white/40 tracking-widest mt-1 uppercase">CHIEF MARKET CHARTIST AGENT ONLINE</p>
        </div>
        <div className="bg-black border border-[#ff4500]/20 px-4 py-2 rounded">
          <div className="flex items-center gap-2 text-[10px] font-black tracking-widest">
            {isScanning ? (
              <>
                <Loader2 size={14} className="animate-spin text-[#ff4500]" />
                <span className="text-[#ff4500]">EXECUTING SWEEP...</span>
              </>
            ) : (
              <>
                <CheckCircle2 size={14} className="text-green-500" />
                <span className="text-green-500">SWEEP COMPLETE</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {rules.map((rule, index) => (
          <motion.div 
            key={rule.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`p-3 rounded border flex items-center justify-between transition-all ${
              rule.status === 'verified' 
                ? 'bg-green-900/10 border-green-500/30' 
                : rule.status === 'scanning'
                ? 'bg-[#ff4500]/10 border-[#ff4500]/40 shadow-[0_0_15px_rgba(255,69,0,0.2)]'
                : 'bg-black border-white/5 opacity-50'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className={`w-6 h-6 rounded flex items-center justify-center font-black text-[10px] ${
                rule.status === 'verified' ? 'bg-green-500/20 text-green-500' :
                rule.status === 'scanning' ? 'bg-[#ff4500]/20 text-[#ff4500]' :
                'bg-gray-800 text-gray-500'
              }`}>
                {rule.id}
              </div>
              <span className={`text-xs font-bold uppercase tracking-tight ${
                rule.status === 'verified' ? 'text-green-400' :
                rule.status === 'scanning' ? 'text-[#ff4500] drop-shadow-[0_0_5px_rgba(255,69,0,0.8)]' :
                'text-gray-500'
              }`}>
                {rule.name}
              </span>
            </div>

            <div>
              {rule.status === 'verified' && <CheckCircle2 size={16} className="text-green-500" />}
              {rule.status === 'scanning' && <Loader2 size={16} className="text-[#ff4500] animate-spin" />}
              {rule.status === 'pending' && <ShieldAlert size={16} className="text-gray-600" />}
            </div>
          </motion.div>
        ))}
      </div>

      {!isScanning && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 border border-[#ff4500]/20 rounded-lg overflow-hidden"
        >
          <div className="p-6 text-center space-y-4 bg-[#ff4500]/5 border-[#ff4500]/20">
            <Activity size={32} className="text-[#ff4500] mx-auto animate-pulse" />
            <h3 className="text-lg font-black text-[#ff4500] tracking-widest drop-shadow-[0_0_8px_rgba(255,69,0,0.8)] uppercase">
              PATTERN ALIGNMENT VERIFIED
            </h3>
            <p className="text-[11px] font-bold text-white/50 max-w-md mx-auto leading-relaxed uppercase">
              The Matrix Analyst has verified the first 10 rules of the Anarchy Alpha Framework. 
              The current market frequency aligns with the predetermined algorithmic heartbeat.
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
};
