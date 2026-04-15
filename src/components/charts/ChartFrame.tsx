
import React, { useState } from 'react';
import { NEURO_PROFILES } from '../../lib/neuro/profiles';

interface ChartFrameProps {
  profileId: string;
  symbol: string;
  children: React.ReactNode;
  onTimeframeChange?: (timeframe: string) => void;
}

const TIMEFRAMES = ['1m', '5m', '10m', '15m', '30m', '1h', '4h', '1d', '1w', '1M', 'YTD'];

export const ChartFrame: React.FC<ChartFrameProps> = ({
  profileId,
  symbol,
  children,
  onTimeframeChange,
}) => {
  const [activeTimeframe, setActiveTimeframe] = useState('1h');
  const profile = NEURO_PROFILES[profileId] || NEURO_PROFILES.standard_trader;

  const handleTimeframeChange = (tf: string) => {
    setActiveTimeframe(tf);
    if (onTimeframeChange) onTimeframeChange(tf);
  };

  return (
    <div 
      className="flex flex-col w-full h-full border-2 rounded-2xl overflow-hidden shadow-2xl transition-all duration-500 glass"
      style={{ 
        backgroundColor: `${profile.ui.bgBottom}33`,
        borderColor: profile.ui.borderA,
      }}
    >
      {/* Header / Timeframe Controls */}
      <div 
        className="flex items-center justify-between px-4 py-2 border-b"
        style={{ 
          backgroundColor: profile.ui.panel,
          borderColor: profile.ui.borderB,
        }}
      >
        <div className="flex items-center space-x-4">
          <span className="text-sm font-black tracking-tighter uppercase" style={{ color: profile.ui.text }}>
            {symbol}
          </span>
          <div className="h-4 w-[1px]" style={{ backgroundColor: profile.ui.borderB }} />
          <div className="flex items-center space-x-1">
            {TIMEFRAMES.map((tf, idx) => (
              <button
                key={`${tf}-${idx}`}
                onClick={() => handleTimeframeChange(tf)}
                className={`px-2 py-1 text-[9px] font-bold uppercase tracking-widest rounded transition-all ${
                  activeTimeframe === tf ? 'bg-opacity-100' : 'bg-opacity-0 hover:bg-opacity-10'
                }`}
                style={{
                  backgroundColor: activeTimeframe === tf ? profile.ui.accent : profile.ui.text,
                  color: activeTimeframe === tf ? profile.ui.bgBottom : profile.ui.text,
                }}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: profile.ui.accent }} />
          <span className="text-[9px] font-mono uppercase tracking-widest opacity-50" style={{ color: profile.ui.text }}>
            Live Feed
          </span>
        </div>
      </div>

      {/* Chart Viewport */}
      <div className="flex-1 relative">
        {children}
      </div>

      {/* Footer / Legal Positioning */}
      <div 
        className="px-4 py-2 border-t text-[8px] font-mono uppercase tracking-widest opacity-50 text-center"
        style={{ 
          backgroundColor: profile.ui.panel,
          borderColor: profile.ui.borderB,
          color: profile.ui.text,
        }}
      >
        ⚖ Legal Positioning — “Provides financial data visualization with optional user-controlled presentation adjustments for accessibility and cognitive comfort. The system does not evaluate, alter, or advise on financial decisions.”
      </div>
    </div>
  );
};
