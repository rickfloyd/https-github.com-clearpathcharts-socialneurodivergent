import React from 'react';

/* EXECUTIVE TRACK RECORD COMPONENT */
export const ExecutivePerformance = () => {
  return (
    <div className="performance-card p-4 bg-black/40 border border-white/10 rounded-xl">
      <div className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">30-Year Cumulative Alpha</div>
      <div className="text-3xl font-black italic lava-hot-text">+1,420.65%</div>
      
      <div className="flex justify-between items-center mt-4">
        <span className="text-[9px] text-gray-500 uppercase font-black">Institutional Grade</span>
        <span className="text-[9px] text-green-500 uppercase font-black">Tier 1 Verified</span>
      </div>
      
      <div className="flex justify-between items-center mt-2">
        <span className="text-[9px] text-gray-400 uppercase font-bold">Drawdown Recovery</span>
        <span className="text-[9px] text-white font-mono tracking-widest">&lt; 14 Days</span>
      </div>
      
      <div className="flex justify-between items-center mt-2">
        <span className="text-[9px] text-gray-400 uppercase font-bold">Sharpe Ratio</span>
        <span className="text-[9px] text-white font-mono tracking-widest">3.21</span>
      </div>

      <div className="mt-6 pt-4 border-t border-white/5 text-[8px] text-gray-600 uppercase tracking-tighter">
        CLEARPATH PROPRIETARY DATA ENGINE v4.0 - SEC COMPLIANT
      </div>
    </div>
  );
};
