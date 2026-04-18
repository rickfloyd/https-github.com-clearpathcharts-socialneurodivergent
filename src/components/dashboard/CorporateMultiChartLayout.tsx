
import React, { useEffect, useState } from 'react';
import { INTERFACE_PROFILES } from '../../lib/interface/profiles';

const ASSET_LIST = [
  { id: "XAUUSD", symbol: "OANDA:XAUUSD", name: "XAU/USD" },
  { id: "AUDUSD", symbol: "OANDA:AUDUSD", name: "AUD/USD" },
  { id: "USDJPY", symbol: "OANDA:USDJPY", name: "USD/JPY" },
];

const ChartWidget = React.memo(({ asset, profile }: { asset: typeof ASSET_LIST[0], profile: any }) => {
  const containerId = `chart_${asset.id}`;

  useEffect(() => {
    const scriptId = 'tradingview-widget-script';
    let isMounted = true;

    const loadWidget = () => {
      if (!isMounted) return;
      if ((window as any).TradingView) {
        new (window as any).TradingView.widget({
          "width": "100%",
          "height": "100%",
          "symbol": asset.symbol,
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

    return () => {
      isMounted = false;
    };
  }, [containerId, asset.symbol, profile.candles]);

  return (
    <div className="individual-chart-wrapper" id={`wrapper_${asset.id}`}>
      <div className="absolute top-2 left-4 z-50 text-[10px] font-bold text-white bg-black/50 px-2 py-1 rounded border border-indigo-500/30 backdrop-blur-md">
        {asset.name} | INSTITUTIONAL FEED
      </div>
      <div id={containerId} style={{ height: '100%', width: '100%' }}></div>
      <div className="brand-mask-forced">
        <i className="fas fa-chart-line mr-2"></i> CLEAR PATH TRADER
      </div>
    </div>
  );
});

export const CorporateMultiChartLayout: React.FC<{ profile: any }> = ({ profile }) => {
  const [searchSymbol, setSearchSymbol] = useState('');
  const [mainAsset, setMainAsset] = useState(ASSET_LIST[0]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchSymbol.trim()) {
      const formattedSymbol = searchSymbol.includes(':') ? searchSymbol : `OANDA:${searchSymbol.toUpperCase()}`;
      setMainAsset({ id: searchSymbol.toUpperCase(), symbol: formattedSymbol, name: searchSymbol.toUpperCase() });
      setSearchSymbol('');
    }
  };

  return (
    <div 
      className="flex flex-col h-full w-full overflow-y-auto custom-scrollbar transition-all duration-1000 p-6"
      style={{ background: profile.ui.bgTop }}
    >
      <div className="max-w-7xl mx-auto w-full space-y-8">
        <div className="flex items-center justify-between border-b border-indigo-500/20 pb-6">
          <div className="flex items-center space-x-6">
            <h1 className="text-3xl font-black tracking-tighter uppercase italic border-2 border-[#FF4500] shadow-[0_0_15px_#FF4500] px-4 py-2 rounded-lg" style={{ color: profile.ui.text }}>
              COGNITIVE <span style={{ color: profile.ui.accent }}>SUITE TERMINAL</span>
            </h1>
            
            <form onSubmit={handleSearch} className="hidden md:flex items-center relative">
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
            </form>
          </div>

          <div className="flex items-center space-x-4">
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
        
        <div className="multi-chart-container">
          <ChartWidget key={mainAsset.symbol} asset={mainAsset} profile={profile} />
          {ASSET_LIST.filter(a => a.symbol !== mainAsset.symbol).map((asset) => (
            <ChartWidget key={asset.id} asset={asset} profile={profile} />
          ))}
        </div>

        {/* Global Legal Positioning Footer */}
        <div 
          className="py-12 border-t text-[10px] font-mono uppercase tracking-widest opacity-50 text-center"
          style={{ 
            borderColor: `${profile.ui.accent}22`,
            color: profile.ui.text,
          }}
        >
          ⚖ Legal Positioning — “Provides financial data visualization with optional user-controlled presentation adjustments for accessibility and visual clarity. The system does not evaluate, alter, or advise on financial decisions.”
        </div>
      </div>
    </div>
  );
};
