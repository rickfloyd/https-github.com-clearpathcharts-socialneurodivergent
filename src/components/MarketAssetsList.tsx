import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MarketGroup, InterfaceProfile } from '../types';
import { fetchPopularAssets } from '../services/marketService';
import { TrendingUp, Activity, DollarSign, Globe, BarChart3, Coins, Maximize2 } from 'lucide-react';

interface MarketAssetsListProps {
  profile: InterfaceProfile;
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
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await fetchPopularAssets();
      setGroups(data);
      // Initialize some as collapsed if there are many
      const initialCollapsed: Record<string, boolean> = {};
      data.forEach((g, i) => {
        if (i > 2) initialCollapsed[g.name] = true;
      });
      setCollapsedGroups(initialCollapsed);
      setLoading(false);
    }
    load();
  }, []);

  const toggleGroup = (name: string) => {
    setCollapsedGroups(prev => ({
      ...prev,
      [name]: !prev[name]
    }));
  };

  useEffect(() => {
    if (groups.length === 0) return;

    const fetchPrices = async () => {
      const allAssets = groups.flatMap(g => g.assets);
      const symbols = allAssets.map(asset => {
        let binanceSymbol = asset.symbol;
        if (!binanceSymbol.endsWith('USDT') && !binanceSymbol.includes(':') && !binanceSymbol.includes('/')) {
          binanceSymbol = `${binanceSymbol}USDT`;
        }
        return binanceSymbol;
      }).join(',');

      try {
        const res = await fetch(`/api/market/prices?symbols=${symbols}`);
        if (res.ok) {
          const data = await res.json();
          const newPrices: Record<string, string> = {};
          
          allAssets.forEach(asset => {
            let binanceSymbol = asset.symbol;
            if (!binanceSymbol.endsWith('USDT') && !binanceSymbol.includes(':') && !binanceSymbol.includes('/')) {
              binanceSymbol = `${binanceSymbol}USDT`;
            }
            if (data[binanceSymbol.toUpperCase()]) {
              newPrices[asset.symbol] = parseFloat(data[binanceSymbol.toUpperCase()]).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 4
              });
            }
          });
          
          setPrices(newPrices);
        }
      } catch (e) {
        console.error('[MarketAssetsList] Price fetch error:', e);
      }
    };

    fetchPrices();
    const interval = setInterval(fetchPrices, 10000); // Batch update every 10s
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
    <div className="flex flex-col space-y-6 p-5 max-w-6xl mx-auto w-full font-mono uppercase">
      {groups.map((group, idx) => {
        const Icon = GROUP_ICONS[group.name] || Activity;
        const isCollapsed = collapsedGroups[group.name];

        return (
          <motion.div
            key={group.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="border rounded-2xl overflow-hidden shadow-xl glass transition-all duration-300"
            style={{ 
              background: `${profile.ui.bgBottom}44`, 
              borderColor: isCollapsed ? `${profile.ui.accent}11` : `${profile.ui.accent}33`,
              maxHeight: isCollapsed ? '70px' : '1000px'
            }}
          >
            <button 
              onClick={() => toggleGroup(group.name)}
              className="w-full flex items-center justify-between p-5 hover:bg-white/[0.03] transition-colors group/header"
            >
              <div className="flex items-center space-x-4">
                <div 
                  className="p-2 rounded-lg transition-all group-hover/header:scale-110"
                  style={{ background: `${profile.ui.accent}11`, color: profile.ui.accent }}
                >
                  <Icon size={20} />
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-black tracking-tight" style={{ color: profile.ui.text }}>{group.name}</h3>
                  <p className="text-[10px] opacity-40 leading-none mt-1">{group.assets.length} TRADING ASSETS DETECTED</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-6">
                {!isCollapsed && <span className="text-[10px] opacity-30 hidden sm:inline">Top Performers // Live Feed</span>}
                <div 
                  className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all duration-500 ${isCollapsed ? 'rotate-0' : 'rotate-180'}`}
                  style={{ borderColor: `${profile.ui.accent}22`, color: profile.ui.accent }}
                >
                   <TrendingUp size={16} />
                </div>
              </div>
            </button>

            <AnimatePresence>
              {!isCollapsed && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="border-t border-white/5 bg-black/20"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-5">
                    {group.assets.map((asset) => (
                      <div 
                        key={asset.symbol} 
                        className="flex items-center justify-between p-4 rounded-xl transition-all group/asset border hover:scale-[1.02]"
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
                            className="w-10 h-10 rounded-lg flex items-center justify-center font-black text-xs shadow-inner"
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
                            <div className="text-[9px] truncate max-w-[100px] font-bold opacity-50" style={{ color: profile.ui.text }}>{asset.name}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-mono flex items-center justify-end font-bold" style={{ color: profile.ui.accent }}>
                            {prices[asset.symbol] ? (
                              <span>${prices[asset.symbol]}</span>
                            ) : (
                              <>
                                <Activity size={10} className="mr-1 animate-pulse" />
                                WATCH
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
}
