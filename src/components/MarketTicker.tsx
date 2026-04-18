
import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { InterfaceProfile } from '../types';
import { DataStreamService } from '../services/dataStreamService';

interface MarketTickerProps {
  profile: InterfaceProfile;
}

const TICKER_ASSETS = [
  { symbol: 'BTCUSDT', label: 'BTC' },
  { symbol: 'ETHUSDT', label: 'ETH' },
  { symbol: 'SOLUSDT', label: 'SOL' },
  { symbol: 'BNBUSDT', label: 'BNB' },
  { symbol: 'XRPUSDT', label: 'XRP' },
  { symbol: 'ADAUSDT', label: 'ADA' },
  { symbol: 'DOGEUSDT', label: 'DOGE' },
  { symbol: 'MATICUSDT', label: 'MATIC' },
];

export default function MarketTicker({ profile }: MarketTickerProps) {
  const [prices, setPrices] = useState<Record<string, { price: string; change: number }>>({});

  const assets = useMemo(() => TICKER_ASSETS, []);

  useEffect(() => {
    // Connect to Binance WebSocket
    DataStreamService.connectMarketStream(assets.map(a => a.symbol));

    // Subscribe to each asset
    assets.forEach(asset => {
      DataStreamService.subscribeToPrice(asset.symbol, (price) => {
        setPrices(prev => {
          const currentPrice = parseFloat(price);
          const prevData = prev[asset.symbol];
          const prevPrice = prevData ? parseFloat(prevData.price.replace(/,/g, '')) : currentPrice;
          
          if (prevData && prevData.price === currentPrice.toLocaleString()) return prev;

          return {
            ...prev,
            [asset.symbol]: {
              price: currentPrice.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              }),
              change: currentPrice - prevPrice
            }
          };
        });
      });
    });

    return () => {
      assets.forEach(asset => {
        DataStreamService.unsubscribeFromPrice(asset.symbol);
      });
    };
  }, [assets]);

  const tickerItems = useMemo(() => [...assets, ...assets], [assets]);

  return (
    <div 
      className="h-10 border-b flex items-center overflow-hidden glass relative z-20"
      style={{ borderColor: `${profile.ui.accent}11`, background: `${profile.ui.bgBottom}44` }}
    >
      <div className="flex items-center px-4 border-r h-full bg-black/40 z-10" style={{ borderColor: `${profile.ui.accent}22` }}>
        <Activity size={14} className="mr-2" style={{ color: profile.ui.accent }} />
        <span className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap" style={{ color: profile.ui.accent }}>Live Market Feed</span>
      </div>

      <div className="flex-1 relative overflow-hidden h-full">
        <motion.div 
          className="flex items-center space-x-12 px-6 h-full absolute whitespace-nowrap"
          animate={{ x: [0, -1000] }}
          transition={{ 
            duration: 30, 
            repeat: Infinity, 
            ease: "linear" 
          }}
        >
          {tickerItems.map((asset, idx) => {
            const data = prices[asset.symbol];
            const isUp = data ? data.change >= 0 : true;
            
            return (
              <div key={`${asset.symbol}-${idx}`} className="flex items-center space-x-2">
                <span className="text-[10px] font-bold opacity-50 uppercase tracking-tighter" style={{ color: profile.ui.text }}>{asset.label}</span>
                <span className="text-xs font-mono font-bold" style={{ color: profile.ui.text }}>
                  {data ? `$${data.price}` : '---'}
                </span>
                {data && (
                  <span className={`text-[10px] flex items-center ${isUp ? 'text-green-500' : 'text-red-500'}`}>
                    {isUp ? <TrendingUp size={10} className="mr-0.5" /> : <TrendingDown size={10} className="mr-0.5" />}
                    {Math.abs(data.change).toFixed(2)}
                  </span>
                )}
              </div>
            );
          })}
        </motion.div>
      </div>

      <div className="px-4 border-l h-full flex items-center bg-black/40 z-10" style={{ borderColor: `${profile.ui.accent}22` }}>
        <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: profile.ui.accent }} />
        <span className="text-[9px] font-mono uppercase tracking-widest ml-2 opacity-50" style={{ color: profile.ui.text }}>Syncing</span>
      </div>
    </div>
  );
}
