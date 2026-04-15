import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { MarketGroup, NeuroProfile } from '../types';
import { fetchPopularAssets } from '../services/marketService';
import { TrendingUp, Activity, DollarSign, Globe, BarChart3, Coins, Maximize2 } from 'lucide-react';

interface MarketAssetsListProps {
  profile: NeuroProfile;
  onAddChart: (symbol: string) => void;
}

const GROUP_ICONS: Record<string, any> = {
  'Equities': BarChart3,
  'Stocks': BarChart3,
  'Cryptocurrencies': Coins,
  'Crypto': Coins,
  'Forex': Globe,
  'Currencies': Globe,
  'Commodities': Activity,
  'Indices': TrendingUp,
  'Futures': Activity,
  'Bonds': Activity,
  'Yields': TrendingUp,
  'Metals': Activity,
  'Energy': Activity
};

export default function MarketAssetsList({ profile, onAddChart }: MarketAssetsListProps) {
  const [groups, setGroups] = useState<MarketGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [prices, setPrices] = useState<Record<string, string>>({});

  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await fetchPopularAssets();
      setGroups(data);
      setLoading(false);
    }
    load();
  }, []);

  useEffect(() => {
    if (groups.length === 0) return;

    const fetchPrices = async () => {
      const newPrices: Record<string, string> = { ...prices };
      let changed = false;

      const allAssets = groups.flatMap(g => g.assets);
      
      await Promise.all(allAssets.map(async (asset) => {
        try {
          let binanceSymbol = asset.symbol;
          if (!binanceSymbol.endsWith('USDT') && !binanceSymbol.includes(':')) {
            binanceSymbol = `${binanceSymbol}USDT`;
          }

          const res = await fetch(`/api/market/price?symbol=${binanceSymbol}`);
          if (res.ok) {
            const data = await res.json();
            if (data && data.price) {
              newPrices[asset.symbol] = parseFloat(data.price).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 4
              });
              changed = true;
            }
          }
        } catch (e) {
          // Silent fail
        }
      }));

      if (changed) {
        setPrices(newPrices);
      }
    };

    fetchPrices();
    const interval = setInterval(fetchPrices, 10000); // Update every 10s
    return () => clearInterval(interval);
  }, [groups]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-10 space-y-4">
        <div className="w-10 h-10 border-4 border-t-transparent animate-spin rounded-full" style={{ borderColor: `${profile.ui.accent} transparent ${profile.ui.accent} transparent` }} />
        <span className="text-xs font-mono uppercase tracking-widest opacity-50" style={{ color: profile.ui.accent }}>Scanning Global Markets...</span>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 p-5">
      {groups.map((group, idx) => {
        const Icon = GROUP_ICONS[group.name] || Activity;
        return (
          <motion.div
            key={group.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="border p-5 rounded-3xl h-full flex flex-col shadow-xl glass"
            style={{ background: `${profile.ui.bgBottom}33`, borderColor: `${profile.ui.accent}22` }}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div 
                  className="p-2 rounded-lg transition-colors"
                  style={{ background: `${profile.ui.accent}11`, color: profile.ui.accent }}
                >
                  <Icon size={20} />
                </div>
                <h3 className="text-lg font-black tracking-tight uppercase" style={{ color: profile.ui.text }}>{group.name}</h3>
              </div>
              <span className="text-[10px] font-mono uppercase tracking-widest opacity-50" style={{ color: profile.ui.text }}>Top 4 // Monthly</span>
            </div>

            <div className="space-y-3">
              {group.assets.slice(0, 4).map((asset) => (
                <div 
                  key={asset.symbol} 
                  className="flex items-center justify-between p-3 rounded-xl transition-colors group/asset border"
                  style={{ background: `${profile.ui.accent}05`, borderColor: 'transparent' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = `${profile.ui.accent}11`;
                    e.currentTarget.style.borderColor = `${profile.ui.accent}22`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = `${profile.ui.accent}05`;
                    e.currentTarget.style.borderColor = 'transparent';
                  }}
                >
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center font-black text-xs"
                      style={{ background: `${profile.ui.accent}22`, color: profile.ui.accent }}
                    >
                      {asset.symbol.substring(0, 3)}
                    </div>
                    <div>
                      <div 
                        onClick={() => onAddChart(asset.symbol)}
                        className="text-sm font-bold hover:opacity-80 cursor-pointer flex items-center group/title"
                        style={{ color: profile.ui.text }}
                      >
                        {asset.symbol}
                        <Maximize2 size={12} className="ml-2 opacity-0 group-hover/title:opacity-100 transition-opacity" style={{ color: profile.ui.accent }} />
                      </div>
                      <div className="text-[10px] truncate max-w-[120px] font-bold opacity-50" style={{ color: profile.ui.text }}>{asset.name}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-mono flex items-center justify-end font-bold" style={{ color: profile.ui.accent }}>
                      {prices[asset.symbol] ? (
                        <span>${prices[asset.symbol]}</span>
                      ) : (
                        <>
                          <TrendingUp size={12} className="mr-1" />
                          Popular
                        </>
                      )}
                    </div>
                    <div className="text-[10px] opacity-40" style={{ color: profile.ui.text }}>
                      {prices[asset.symbol] ? 'Live Feed' : 'Trending Now'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
