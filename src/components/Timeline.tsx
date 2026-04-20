import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/FirebaseContext';
import LegalFooter from './LegalFooter';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Image as ImageIcon, 
  Video, 
  Send, 
  Heart, 
  MessageSquare, 
  Share2, 
  MoreHorizontal, 
  X, 
  TrendingUp,
  Camera,
  Maximize2,
  BookOpen,
  Zap
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import ChartMarkupTool from './ChartMarkupTool';
import { InterfaceProfile } from '../types';

const ASSET_LIST = [
  { id: "XAUUSD", symbol: "OANDA:XAUUSD", name: "Gold" },
  { id: "WTICOUSD", symbol: "OANDA:WTICOUSD", name: "Crude oil" },
  { id: "SNP500", symbol: "CAPITALCOM:US500", name: "S&P 500" },
  { id: "DXY", symbol: "DXY", name: "DXY" },
];

const ChartWidget = ({ asset, profile }: { asset: typeof ASSET_LIST[0], profile: InterfaceProfile }) => {
  const containerId = `chart_home_${asset.id}`;

  useEffect(() => {
    const scriptId = 'tradingview-widget-script';
    const loadWidget = () => {
      if ((window as any).TradingView) {
        new (window as any).TradingView.widget({
          "width": "100%",
          "height": "100%",
          "symbol": asset.symbol,
          "interval": asset.id === 'DXY' ? "D" : "60",
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
  }, [containerId, asset.symbol]);

  return (
    <div className="individual-chart-wrapper !h-[350px]" id={`wrapper_home_${asset.id}`}>
      <div className="absolute top-2 left-4 z-50 text-[10px] font-bold text-white bg-black/50 px-2 py-1 rounded border border-indigo-500/30 backdrop-blur-md">
        {asset.name}
      </div>
      <div id={containerId} style={{ height: '100%', width: '100%' }}></div>
      <div className="brand-mask-forced">
        <i className="fas fa-chart-line mr-2"></i> CLEAR PATH
      </div>
    </div>
  );
};

interface TimelineProps {
  profile: InterfaceProfile;
}

export default function Timeline({ profile }: TimelineProps) {
  const { user, posts, createPost, toggleLike, userProfile } = useAuth();
  const [newPost, setNewPost] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<{ url: string; type: 'image' | 'video' } | null>(null);
  const [showMarkupTool, setShowMarkupTool] = useState(false);
  const [markupDataUrl, setMarkupDataUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const liveInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedMedia({ url: reader.result as string, type });
        setMarkupDataUrl(null);
      };
      
      // If video, we might want to warn about size, but for now we'll just read it
      // as base64 to persist it reliably for this demo PWA context.
      if (file.size > 1024 * 1024 && type === 'video') {
         // Optionally warn, but let's just proceed
         console.warn("Video is large, might fail Firestore 1MB document limit");
      }
      
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.trim() && !selectedMedia) return;

    setIsSubmitting(true);
    try {
      await createPost(newPost, selectedMedia ? { url: markupDataUrl || selectedMedia.url, type: selectedMedia.type } : undefined, 'GLOBAL');
      setNewPost('');
      setSelectedMedia(null);
      setMarkupDataUrl(null);
    } catch (error) {
      console.error('Error creating post:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-2 md:p-4 space-y-8">
      {/* Market Pulse Header */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-indigo-500/20 pb-4">
          <div className="flex items-center space-x-3">
            <Zap size={20} className="text-indigo-500" />
            <h2 className="text-xl font-black tracking-tighter uppercase italic" style={{ color: profile.ui.text }}>
              CLEAR PATH <span style={{ color: profile.ui.accent }}>CHART VISUALS</span>
            </h2>
          </div>
          <div className="timeframe-bar mb-0 p-1 flex items-center space-x-1 overflow-x-auto whitespace-nowrap custom-scrollbar">
            {['1S', '5S', '15S', '30S', '1m', '5m', '15m', '30m', '1H', '4H', '1D', '1W', '1M', '3M', '6M', 'YTD', '1Y', '5Y', 'ALL'].map((tf, idx) => (
              <div key={`${tf}-${idx}`} className={`time-unit py-1 px-2 text-[10px] md:text-xs ${tf === '1H' ? 'active' : ''}`}>
                {tf}
              </div>
            ))}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ASSET_LIST.map((asset) => (
            <ChartWidget key={asset.id} asset={asset} profile={profile} />
          ))}
        </div>
      </div>

      <div className="max-w-4xl mx-auto space-y-8">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Create Post */}
          <div className="border p-4 shadow-xl rounded-3xl glass" style={{ background: `${profile.ui.bgBottom}33`, borderColor: `${profile.ui.accent}22` }}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex space-x-4">
            <div className="surfboard-profile-outline border-4 border-[#FF4500] shadow-[0_0_30px_#FF4500]">
              <img
                src={user?.photoURL || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'}
                alt="User"
                className="surfboard-img"
              />
            </div>
            <textarea
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              placeholder="Post market intelligence or institutional chart analysis..."
              className="w-full bg-transparent border-none focus:ring-0 placeholder-gray-500 resize-none h-24 font-sans text-lg"
              style={{ color: profile.ui.text }}
            />
          </div>

          {selectedMedia && (
            <div className="relative rounded-xl overflow-hidden border bg-black/40 group" style={{ borderColor: `${profile.ui.accent}22` }}>
              {selectedMedia.type === 'image' ? (
                <img 
                  src={markupDataUrl || selectedMedia.url} 
                  className="w-full max-h-[400px] object-contain" 
                  alt="Selected" 
                />
              ) : (
                <video 
                  src={selectedMedia.url} 
                  className="w-full max-h-[400px] object-contain" 
                  controls 
                  playsInline
                  preload="metadata"
                  onError={(e) => {
                    console.error('Post creation preview video error', e);
                    // Fallback to trying to play without controls or different attributes if needed
                  }}
                />
              )}
              <div className="absolute top-2 right-2 flex space-x-2">
                <button 
                  type="button"
                  onClick={() => setShowMarkupTool(true)}
                  className="p-2 text-black rounded-full shadow-lg hover:scale-110 transition-all"
                  style={{ backgroundColor: profile.ui.accent }}
                  title="Mark up Chart"
                >
                  <TrendingUp size={16} />
                </button>
                <button 
                  type="button"
                  onClick={() => { setSelectedMedia(null); setMarkupDataUrl(null); }}
                  className="p-2 bg-black/60 text-white rounded-full hover:bg-red-500 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: `${profile.ui.accent}11` }}>
            <div className="flex space-x-4">
              <button 
                type="button" 
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center space-x-2 transition-colors text-xs font-bold uppercase tracking-wider"
                style={{ color: `${profile.ui.accent}88` }}
              >
                <i className="fas fa-image text-xl" style={{ color: profile.ui.accent }} aria-hidden="true"></i>
                <span className="hidden sm:inline lava-hot-text">Photo</span>
              </button>
              <button 
                type="button" 
                onClick={() => videoInputRef.current?.click()}
                className="flex items-center space-x-2 transition-colors text-xs font-bold uppercase tracking-wider"
                style={{ color: `${profile.ui.accent}88` }}
              >
                <i className="fas fa-video text-xl" style={{ color: profile.ui.accent }} aria-hidden="true"></i>
                <span className="hidden sm:inline lava-hot-text">Video</span>
              </button>
              <button 
                type="button"
                onClick={() => liveInputRef.current?.click()}
                className="flex items-center space-x-2 transition-colors text-xs font-bold uppercase tracking-wider"
                style={{ color: `${profile.ui.accent}88` }}
              >
                <i className="fas fa-camera text-xl" style={{ color: profile.ui.accent }} aria-hidden="true"></i>
                <span className="hidden sm:inline lava-hot-text">Live</span>
              </button>
              
              <input 
                type="file" 
                ref={fileInputRef} 
                accept="image/*" 
                className="hidden" 
                onChange={(e) => handleFileSelect(e, 'image')} 
              />
              <input 
                type="file" 
                ref={videoInputRef} 
                accept="video/*" 
                className="hidden" 
                onChange={(e) => handleFileSelect(e, 'video')} 
              />
              <input 
                type="file" 
                ref={liveInputRef} 
                accept="image/*,video/*" 
                capture="environment"
                className="hidden" 
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleFileSelect(e, file.type.startsWith('video') ? 'video' : 'image');
                  }
                }} 
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting || (!newPost.trim() && !selectedMedia)}
              className="text-black px-8 py-2 rounded-full uppercase tracking-widest hover:brightness-110 transition-all disabled:opacity-50"
              style={{ 
                backgroundColor: profile.ui.accent, 
                boxShadow: `0 0 20px ${profile.ui.accent}44`,
                fontWeight: 'bold',
                fontSize: '14px',
                borderColor: '#f00ce1',
                borderStyle: 'outset',
                borderWidth: '4px'
              }}
            >
              <span className="lava-hot-text">{isSubmitting ? 'Syncing...' : 'Broadcast'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    {/* Posts Feed */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {posts.map((post) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="border overflow-hidden shadow-xl rounded-3xl glass"
              style={{ background: `${profile.ui.bgBottom}33`, borderColor: `${profile.ui.accent}22` }}
            >
              {/* Post Header */}
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="surfboard-profile-outline border-4 border-[#FF4500] shadow-[0_0_30px_#FF4500]" style={{ width: '36px', height: '60px' }}>
                    <img
                      src={post.authorPhoto || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'}
                      alt={post.authorName}
                      className="surfboard-img"
                    />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold" style={{ color: profile.ui.text }}>{post.authorName}</h4>
                    <p className="text-[10px] uppercase tracking-widest flex items-center space-x-2" style={{ color: `${profile.ui.text}66` }}>
                      <span>{post.createdAt?.seconds ? formatDistanceToNow(post.createdAt.seconds * 1000) : 'Just now'} ago</span>
                      {post.market_layer && post.market_layer !== 'GLOBAL' && (
                        <>
                          <span className="opacity-30">•</span>
                          <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-indigo-400 font-black">
                            {post.market_layer}
                          </span>
                        </>
                      )}
                    </p>
                  </div>
                </div>
                <button className="hover:opacity-70 transition-opacity" style={{ color: profile.ui.accent }}>
                  <MoreHorizontal size={20} />
                </button>
              </div>

              {/* Post Content */}
              <div className="px-4 pb-4">
                <p className="leading-relaxed whitespace-pre-wrap text-[15px]" style={{ color: `${profile.ui.text}dd` }}>{post.content}</p>
              </div>

              {/* Media Display */}
              {post.mediaUrl && (
                <div className="bg-black/50 relative overflow-hidden border-y" style={{ borderColor: `${profile.ui.accent}11` }}>
                  {post.mediaType === 'video' ? (
                    <video 
                      src={post.mediaUrl} 
                      className="w-full max-h-[500px] object-contain" 
                      controls 
                      playsInline
                      preload="metadata"
                      onError={(e) => console.error('Video playback error: post media', e)}
                    />
                  ) : (
                    <img
                      src={post.mediaUrl}
                      alt="Post media"
                      className="w-full max-h-[500px] object-contain"
                    />
                  )}
                </div>
              )}

              {/* Post Actions */}
              <div className="p-4 border-t flex items-center justify-between" style={{ borderColor: `${profile.ui.accent}11` }}>
                <div className="flex space-x-6">
                  <button
                    onClick={() => toggleLike(post.id!, post.likesCount || 0)}
                    className="flex items-center space-x-2 transition-colors"
                    style={{ color: post.likesCount ? '#FF007F' : `${profile.ui.accent}88` }}
                  >
                    <Heart size={18} className={post.likesCount ? 'fill-current' : ''} />
                    <span className="text-xs font-mono">{post.likesCount || 0}</span>
                  </button>
                  <button className="flex items-center space-x-2 transition-colors" style={{ color: `${profile.ui.accent}88` }}>
                    <MessageSquare size={18} />
                    <span className="text-xs font-mono">0</span>
                  </button>
                </div>
                <button className="transition-colors hover:opacity-70" style={{ color: profile.ui.accent }}>
                  <Share2 size={18} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Trending Sidebar */}
        <div className="hidden lg:block space-y-6">
          <div className="border p-6 rounded-3xl glass sticky top-24" style={{ background: `${profile.ui.bgBottom}33`, borderColor: `${profile.ui.accent}22` }}>
            <h3 className="text-lg font-black tracking-tighter uppercase italic mb-6" style={{ color: profile.ui.text }}>
              Trending <span style={{ color: profile.ui.accent }}>Insights</span>
            </h3>
            <div className="space-y-4">
              {[
                { tag: '#XAUUSD', count: '12.4k', trend: 'up' },
                { tag: '#ClearPathAlpha', count: '8.2k', trend: 'up' },
                { tag: '#ZeroGreyArea', count: '5.1k', trend: 'down' },
                { tag: '#InstitutionalFeed', count: '3.9k', trend: 'up' },
                { tag: '#ClearPath', count: '2.8k', trend: 'up' },
              ].map((item) => (
                <div key={item.tag} className="flex items-center justify-between group cursor-pointer">
                  <div>
                    <p className="text-sm font-bold group-hover:text-indigo-400 transition-colors" style={{ color: profile.ui.text }}>{item.tag}</p>
                    <p className="text-[10px] uppercase tracking-widest opacity-50" style={{ color: profile.ui.text }}>{item.count} broadcasts</p>
                  </div>
                  <TrendingUp size={14} className={item.trend === 'up' ? 'text-green-500' : 'text-red-500'} />
                </div>
              ))}
            </div>
            <button className="w-full mt-8 py-3 rounded-xl border border-indigo-500/30 text-[10px] font-black uppercase tracking-widest hover:bg-indigo-500/10 transition-all" style={{ color: profile.ui.accent }}>
              View All Trends
            </button>
          </div>
        </div>
      </div>

      </div>

      {/* Markup Tool Overlay */}
      <AnimatePresence>
        {showMarkupTool && selectedMedia && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <ChartMarkupTool 
              mediaUrl={selectedMedia.url}
              mediaType={selectedMedia.type}
              onSave={(dataUrl) => {
                setMarkupDataUrl(dataUrl);
                setShowMarkupTool(false);
              }}
              onCancel={() => setShowMarkupTool(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>
      <div className="mt-12">
        <LegalFooter profile={profile} />
      </div>
    </div>
  );
}
