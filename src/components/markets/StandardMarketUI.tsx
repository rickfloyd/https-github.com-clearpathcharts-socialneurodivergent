
import React, { useState, useEffect } from 'react';
import { INTERFACE_PROFILES } from '../../lib/interface/profiles';
import { BackToDashboard } from '../nav/BackToDashboard';

const ASSETS = [
  { label: 'EUR/USD', value: 'OANDA:EURUSD' },
  { label: 'GBP/USD', value: 'OANDA:GBPUSD' },
  { label: 'USD/JPY', value: 'OANDA:USDJPY' },
  { label: 'AUD/USD', value: 'OANDA:AUDUSD' },
  { label: 'USD/CAD', value: 'OANDA:USDCAD' },
  { label: 'NZD/USD', value: 'OANDA:NZDUSD' },
];

const ChartWidget = ({ asset, profile }: { asset: typeof ASSETS[0], profile: any }) => {
  const containerId = `chart_std_${asset.value.replace(':', '_')}`;

  useEffect(() => {
    const scriptId = 'tradingview-widget-script';
    const loadWidget = () => {
      if ((window as any).TradingView) {
        new (window as any).TradingView.widget({
          "width": "100%",
          "height": "100%",
          "symbol": asset.value,
          "interval": "60",
          "timezone": "Etc/UTC",
          "theme": "dark",
          "style": "1",
          "locale": "en",
          "container_id": containerId,
          "hide_top_toolbar": false,
          "hide_legend": false,
          "save_image": false,
          "backgroundColor": "#131722",
          "gridColor": "rgba(255, 255, 255, 0.05)",
          "overrides": {
            "mainSeriesProperties.candleStyle.upColor": profile.candles.upColor,
            "mainSeriesProperties.candleStyle.downColor": profile.candles.downColor,
            "mainSeriesProperties.candleStyle.borderUpColor": profile.candles.borderUpColor,
            "mainSeriesProperties.candleStyle.borderDownColor": profile.candles.borderDownColor,
            "mainSeriesProperties.candleStyle.wickUpColor": profile.candles.wickUpColor,
            "mainSeriesProperties.candleStyle.wickDownColor": profile.candles.wickDownColor,
          }
        });
      } else {
        setTimeout(loadWidget, 100);
      }
    };

    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://s3.tradingview.com/tv.js';
      script.async = true;
      script.onload = loadWidget;
      document.head.appendChild(script);
    } else {
      loadWidget();
    }
  }, [containerId, asset.value]);

  return (
    <div className="individual-chart-wrapper" id={`wrapper_std_${asset.value.replace(':', '_')}`}>
      <div className="absolute top-2 left-4 z-50 text-[10px] font-bold text-white bg-black/50 px-2 py-1 rounded border border-indigo-500/30 backdrop-blur-md">
        {asset.label} | INSTITUTIONAL FEED
      </div>
      <div id={containerId} style={{ height: '100%', width: '100%' }}></div>
      <div className="brand-mask-forced">
        <i className="fas fa-chart-line mr-2"></i> CLEAR PATH TRADER
      </div>
    </div>
  );
};

interface StandardMarketUIProps {
  onBack: () => void;
  profile: any;
}

export const StandardMarketUI: React.FC<StandardMarketUIProps> = ({ onBack, profile }) => {
  const [searchSymbol, setSearchSymbol] = useState('');
  const [mainAsset, setMainAsset] = useState({ label: 'EUR/USD', value: 'OANDA:EURUSD' });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchSymbol.trim()) {
      const formattedSymbol = searchSymbol.includes(':') ? searchSymbol : `OANDA:${searchSymbol.toUpperCase()}`;
      setMainAsset({ label: searchSymbol.toUpperCase(), value: formattedSymbol });
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
            STANDARD <span style={{ color: profile.ui.accent }}>EXCHANGE</span>
          </h1>
        </div>

        <form onSubmit={handleSearch} className="flex items-center space-x-4">
          <div className="relative">
            <input 
              type="text"
              value={searchSymbol}
              onChange={(e) => setSearchSymbol(e.target.value)}
              placeholder="SEARCH SYMBOL"
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
            <h1 className="text-3xl font-black tracking-tighter uppercase italic" style={{ color: profile.ui.text }}>
              EXCHANGE <span style={{ color: profile.ui.accent }}>COMMAND CENTER</span>
            </h1>
            <div className="flex items-center space-x-4">
              <div className="flex space-x-2 mr-4">
                {ASSETS.slice(0, 4).map(asset => (
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

          <div className="timeframe-bar">
            {['1m', '5m', '15m', '1H', '4H', '1D', '1W'].map((tf, idx) => (
              <div key={`${tf}-${idx}`} className={`time-unit ${tf === '1H' ? 'active' : ''}`}>
                {tf}
              </div>
            ))}
          </div>
          
          <div id="master-chart-stack-std" className="multi-chart-container">
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

