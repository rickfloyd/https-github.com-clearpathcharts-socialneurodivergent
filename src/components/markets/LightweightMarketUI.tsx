
import React, { useState, useEffect } from 'react';
import { INTERFACE_PROFILES } from '../../lib/interface/profiles';
import { LightweightCandles } from '../charts/LightweightCandles';
import { BackToDashboard } from '../nav/BackToDashboard';

const ASSETS = [
  { label: 'XAU/USD', value: 'XAU/USD' },
  { label: 'BTC/USD', value: 'BTC/USD' },
  { label: 'ETH/USD', value: 'ETH/USD' },
];

const ChartWidget = ({ asset, profile }: { asset: typeof ASSETS[0], profile: any }) => {
  return (
    <div className="individual-chart-wrapper !h-[450px] relative overflow-hidden rounded-2xl border border-white/5 shadow-2xl glass" id={`wrapper_${asset.value.replace('/', '_')}`}>
      <div className="absolute top-2 left-4 z-50 text-[10px] font-bold text-white bg-black/50 px-2 py-1 rounded border border-indigo-500/30 backdrop-blur-md">
        {asset.label} | INSTITUTIONAL FEED
      </div>
      <div className="w-full h-full">
        <LightweightCandles profileId={profile.id} symbol={asset.label} timeframe="1h" />
      </div>
      <div className="brand-mask-forced">
        <i className="fas fa-chart-line mr-2"></i> CLEAR PATH TRADER
      </div>
    </div>
  );
};

interface LightweightMarketUIProps {
  onBack: () => void;
  profile: any;
}

export const LightweightMarketUI: React.FC<LightweightMarketUIProps> = ({ onBack, profile }) => {
  const [searchSymbol, setSearchSymbol] = useState('');
  const [mainAsset, setMainAsset] = useState({ label: 'XAU/USD', value: 'XAU/USD' });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchSymbol.trim()) {
      setMainAsset({ label: searchSymbol.toUpperCase(), value: searchSymbol.toUpperCase() });
      setSearchSymbol('');
    }
  };

  return (
    <div 
      className="flex flex-col h-full w-full overflow-hidden transition-all duration-1000"
      style={{ background: '#000000' }}
    >
      {/* Top Navigation */}
      <div 
        className="flex items-center justify-between px-8 py-4 border-b glass"
        style={{ 
          backgroundColor: 'rgba(0,0,0,0.5)',
          borderColor: `${profile.ui.accent}22`,
        }}
      >
        <div className="flex items-center space-x-6">
          <BackToDashboard onBack={onBack} color={profile.ui.text} />
          <div className="h-6 w-[1px]" style={{ backgroundColor: `${profile.ui.accent}22` }} />
          <h1 className="text-2xl font-black tracking-tighter uppercase italic" style={{ color: profile.ui.text }}>
            MARKET <span style={{ color: profile.ui.accent }}>TERMINAL</span>
          </h1>
        </div>

        <form onSubmit={handleSearch} className="flex items-center space-x-4">
          <div className="relative">
            <input 
              type="text"
              value={searchSymbol}
              onChange={(e) => setSearchSymbol(e.target.value)}
              placeholder="SEARCH SYMBOL (e.g. BTCUSD)"
              className="bg-black/50 border-2 px-6 py-2 text-[10px] font-black uppercase tracking-widest rounded-full focus:outline-none focus:ring-2 transition-all w-64"
              style={{ 
                color: profile.ui.text,
                borderColor: `${profile.ui.accent}44`,
                boxShadow: `0 0 10px ${profile.ui.accent}11`
              }}
            />
            <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2">
              <i className="fas fa-search" style={{ color: profile.ui.accent }}></i>
            </button>
          </div>
        </form>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-8" style={{ background: '#000000' }}>
        <div className="max-w-7xl mx-auto w-full space-y-8">
          <div className="flex items-center justify-between border-b border-indigo-500/20 pb-6">
            <h1 className="text-3xl font-black tracking-tighter uppercase italic border-2 border-[#FF4500] shadow-[0_0_15px_#FF4500] px-4 py-2 rounded-lg" style={{ color: profile.ui.text }}>
              CLEAR PATH <span style={{ color: profile.ui.accent }}>COMMAND TERMINAL</span>
            </h1>
            <div className="flex items-center space-x-4">
              <div className="flex space-x-2 mr-4">
                {ASSETS.map(asset => (
                  <button
                    key={asset.value}
                    onClick={() => setMainAsset(asset)}
                    className={`px-3 py-1 rounded text-[9px] font-black uppercase tracking-widest border transition-all ${
                      mainAsset.value === asset.value ? 'bg-indigo-500 text-white border-indigo-500' : 'bg-transparent text-gray-500 border-gray-800 hover:border-gray-600'
                    }`}
                  >
                    {asset.label}
                  </button>
                ))}
              </div>
              <div className="px-4 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-[10px] font-black uppercase tracking-widest text-indigo-400">
                System Active // Zero Grey Area
              </div>
            </div>
          </div>

          <div className="timeframe-bar overflow-x-auto whitespace-nowrap custom-scrollbar">
            {['1S', '5S', '15S', '30S', '1M', '5M', '15M', '30M', '1H', '4H', '1D', '1W', '1M', '3M', '6M', 'YTD', '1Y', '5Y', 'ALL'].map((tf, idx) => (
              <div key={`${tf}-${idx}`} className={`time-unit !py-1 !px-2 text-[10px] md:text-xs ${tf === '1H' ? 'active' : ''}`}>
                {tf}
              </div>
            ))}
          </div>
          
          <div id="master-chart-stack" className="multi-chart-container">
            <ChartWidget key={mainAsset.value} asset={mainAsset} profile={profile} />
            {ASSETS.filter(a => a.value !== mainAsset.value).map((asset) => (
              <ChartWidget key={asset.value} asset={asset} profile={profile} />
            ))}
          </div>
        </div>
      </div>

      {/* Global Legal Positioning Footer */}
      <div 
        className="px-8 py-4 border-t text-[10px] font-mono uppercase tracking-widest opacity-50 text-center glass"
        style={{ 
          backgroundColor: 'rgba(0,0,0,0.5)',
          borderColor: `${profile.ui.accent}22`,
          color: profile.ui.text,
        }}
      >
        ⚖ Legal Positioning — “Provides financial data visualization with optional user-controlled presentation adjustments for accessibility and visual clarity. The system does not evaluate, alter, or advise on financial decisions.”
      </div>
    </div>
  );
};
