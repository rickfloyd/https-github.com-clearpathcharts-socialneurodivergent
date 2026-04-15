
import React, { useState, useEffect, Suspense, lazy } from 'react';
import { MARKET_LAYERS, MarketLayer } from '../lib/market/MarketRegistry';
import { NeuroProfile } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../contexts/FirebaseContext';
import { formatDistanceToNow } from 'date-fns';
import { MessageSquare, Users, Activity, Zap, BarChart3 } from 'lucide-react';
import { DataStreamService } from '../services/dataStreamService';

const PulseChart = lazy(() => import('./PulseChart'));

interface SentinelContainerProps {
  profile: NeuroProfile;
}

export default function SentinelContainer({ profile }: SentinelContainerProps) {
  const [activeMarket, setActiveMarket] = useState<MarketLayer>(MARKET_LAYERS[0]);
  const [isSlowMode, setIsSlowMode] = useState(false);
  const { posts, user, createPost } = useAuth();

  const [newSignal, setNewSignal] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sentimentSignals, setSentimentSignals] = useState<any[]>([]);

  useEffect(() => {
    // Subscribe to real-time sentiment signals
    const unsubscribe = DataStreamService.subscribeToMessages((msg) => {
      if (msg.type === 'SENTIMENT_SIGNAL') {
        setSentimentSignals(prev => [msg.data, ...prev].slice(0, 10));
      }
    });
    return () => unsubscribe();
  }, []);

  const handleBroadcast = async () => {
    if (!newSignal.trim() || !user) return;
    setIsSubmitting(true);
    try {
      await createPost(newSignal, undefined, activeMarket.id);
      setNewSignal('');
    } catch (error) {
      console.error('Error broadcasting signal:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMarketSwitch = (market: MarketLayer) => {
    if (market.id === activeMarket.id) return;
    setIsSlowMode(true);
    setActiveMarket(market);
    setTimeout(() => setIsSlowMode(false), 3000);
  };

  // Filter posts by market layer
  const filteredPosts = posts.filter(p => p.market_layer === activeMarket.id);

  return (
    <div className="flex flex-col lg:flex-row h-full w-full bg-black overflow-hidden rounded-3xl border border-white/5 shadow-2xl">
      {/* 10 UI LIST - THE SELECTOR */}
      <nav className="w-full lg:w-64 border-b lg:border-b-0 lg:border-r border-white/5 p-4 flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-y-auto custom-scrollbar glass">
        <div className="hidden lg:block mb-6 px-2">
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Market Layers</h3>
        </div>
        {MARKET_LAYERS.map(m => (
          <button 
            key={m.id} 
            onClick={() => handleMarketSwitch(m)}
            className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 text-left group whitespace-nowrap lg:whitespace-normal ${
              activeMarket.id === m.id 
                ? 'bg-white/10 text-white' 
                : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
            }`}
            style={{ borderLeft: `4px solid ${m.color}` }}
          >
            <div className="flex flex-col">
              <span className="text-xs font-black uppercase tracking-widest">{m.name}</span>
              <span className="text-[9px] opacity-40 font-mono">{m.desc}</span>
            </div>
          </button>
        ))}
      </nav>

      {/* THE CONTAINMENT UNIT */}
      <main className="flex-1 relative flex flex-col min-h-[400px] lg:min-h-0">
        <AnimatePresence>
          {isSlowMode && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xl"
            >
              <div className="text-center space-y-4">
                <div className="w-16 h-16 border-4 border-t-transparent animate-spin rounded-full mx-auto" style={{ borderColor: `${activeMarket.color} transparent ${activeMarket.color} transparent` }} />
                <div className="text-xl font-black uppercase tracking-[0.4em] italic animate-pulse" style={{ color: activeMarket.color }}>
                  BREATHE: SYNCING THE PULSE...
                </div>
                <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Calibrating {activeMarket.name} Data Stream</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex-1 p-4 relative">
          <Suspense fallback={
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-xs font-mono uppercase tracking-widest opacity-30">Loading Metal...</span>
            </div>
          }>
            <PulseChart marketId={activeMarket.id} profile={profile} />
          </Suspense>
        </div>

        {/* Market Status Bar */}
        <div className="h-12 border-t border-white/5 px-6 flex items-center justify-between glass">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Activity size={14} style={{ color: activeMarket.color }} />
              <span className="text-[10px] font-black uppercase tracking-widest">Pulse: <span style={{ color: activeMarket.color }}>Active</span></span>
            </div>
            <div className="h-4 w-[1px] bg-white/10" />
            <div className="flex items-center space-x-2">
              <Zap size={14} className="text-indigo-500" />
              <span className="text-[10px] font-black uppercase tracking-widest">Latency: <span className="text-indigo-400">0.4ms</span></span>
            </div>
          </div>
          <div className="text-[9px] font-mono text-gray-500 uppercase tracking-widest">
            {activeMarket.id} // SECURE_NODE_01
          </div>
        </div>
      </main>

      {/* THE SHEEP-BOX (SOCIAL FEED) */}
      <aside className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-white/5 flex flex-col glass">
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <MessageSquare size={18} style={{ color: activeMarket.color }} />
            <h3 className="text-sm font-black uppercase tracking-widest italic">Sheep Box</h3>
          </div>
          <div className="flex items-center space-x-2 bg-white/5 px-3 py-1 rounded-full">
            <Users size={12} className="text-gray-500" />
            <span className="text-[10px] font-mono text-gray-400">1.2k</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
          {/* SentiTrade Sentiment Stream */}
          {sentimentSignals.length > 0 && (
            <div className="space-y-2 mb-6">
              <div className="flex items-center space-x-2 px-2">
                <BarChart3 size={14} className="text-indigo-500" />
                <h4 className="text-[10px] font-black uppercase tracking-widest text-indigo-400">SentiTrade Stream</h4>
              </div>
              {sentimentSignals.map((signal, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-indigo-500/5 border border-indigo-500/10 space-y-1 group hover:bg-indigo-500/10 transition-all">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${signal.sentiment > 0 ? 'bg-green-500' : 'bg-red-500'}`} />
                      <span className="text-[9px] font-bold text-indigo-300 uppercase tracking-tighter">{signal.source}</span>
                    </div>
                    <span className={`text-[9px] font-black ${signal.sentiment > 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {signal.sentiment > 0 ? '+' : ''}{signal.sentiment.toFixed(2)}
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-400 line-clamp-2 leading-tight group-hover:text-gray-200 transition-colors">{signal.title}</p>
                </div>
              ))}
              <div className="h-[1px] bg-white/5 mx-2 my-4" />
            </div>
          )}

          {filteredPosts.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-30">
              <MessageSquare size={32} className="mb-4" />
              <p className="text-[10px] font-black uppercase tracking-widest">No signals in {activeMarket.name} room</p>
            </div>
          ) : (
            filteredPosts.map((post) => (
              <div key={post.id} className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-3 hover:bg-white/[0.07] transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${post.uid}`} className="w-6 h-6 rounded-full border border-white/10" />
                    <span className="text-[10px] font-bold text-white">Node_{post.uid.slice(0, 4)}</span>
                  </div>
                  <span className="text-[8px] font-mono text-gray-500 uppercase">
                    {post.createdAt?.seconds ? formatDistanceToNow(post.createdAt.seconds * 1000) : 'Just now'} ago
                  </span>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">{post.content}</p>
                {post.mediaUrl && (
                  <div className="rounded-lg overflow-hidden border border-white/10">
                    <img src={post.mediaUrl} className="w-full h-auto" />
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t border-white/5 space-y-3">
          <textarea
            value={newSignal}
            onChange={(e) => setNewSignal(e.target.value)}
            placeholder={`Broadcast to ${activeMarket.name}...`}
            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 resize-none h-20"
          />
          <button 
            onClick={handleBroadcast}
            disabled={isSubmitting || !newSignal.trim()}
            className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Syncing...' : 'Broadcast Signal'}
          </button>
        </div>
      </aside>
    </div>
  );
}
