import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Globe, 
  TrendingUp, 
  MapPin, 
  Zap, 
  ExternalLink, 
  Search, 
  Filter,
  Newspaper,
  LayoutGrid,
  List,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { RSSService, TerminalNewsItem } from '../services/rssService';
import { InterfaceProfile } from '../types';

interface NewsHubProps {
  profile: InterfaceProfile;
}

const CATEGORIES = [
  { id: 'all', label: 'All Intelligence', icon: Newspaper },
  { id: 'world', label: 'World Affairs', icon: Globe },
  { id: 'financial', label: 'Financial Markets', icon: TrendingUp },
  { id: 'local', label: 'Local Updates', icon: MapPin },
  { id: 'tech', label: 'Technology / AI', icon: Zap },
];

export default function NewsHub({ profile }: NewsHubProps) {
  const [news, setNews] = useState<TerminalNewsItem[]>([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchIntelligence();
  }, []);

  const fetchIntelligence = async () => {
    setLoading(true);
    try {
      // Fetch from API first
      const apiRes = await fetch('/api/news');
      const apiData = await apiRes.json();
      
      let allNews: TerminalNewsItem[] = [];
      if (Array.isArray(apiData)) {
        allNews = apiData.map(item => ({
          ...item,
          category: item.category || 'Market'
        }));
      }

      // Add major news feeds
      const rssFeeds = [
        'https://feeds.bbci.co.uk/news/world/rss.xml',
        'https://rss.nytimes.com/services/xml/rss/nyt/World.xml',
        'https://www.cnbc.com/id/100727362/device/rss/rss.html', // World economy
        'https://www.marketwatch.com/rss/topstories'
      ];

      for (const url of rssFeeds) {
        try {
          const items = await RSSService.fetchAndAnalyze(url);
          allNews = [...allNews, ...items];
        } catch (e) {
          console.warn('Feed warning:', url, e);
        }
      }

      setNews(allNews.sort((a, b) => b.impactScore - a.impactScore));
    } catch (error) {
      console.warn('NewsHub fetch warning:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredNews = news.filter(item => {
    const matchesCategory = activeCategory === 'all' || item.category?.toLowerCase().includes(activeCategory.toLowerCase());
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-8 min-h-screen pb-20">
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 px-4 md:px-0">
        <div className="space-y-1">
          <h2 className="text-4xl font-black tracking-tighter uppercase italic" style={{ color: profile.text }}>
            <span style={{ color: profile.borderA }}>ClearPath</span> <span className="neon-indigo-text">Stream</span>
          </h2>
          <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.4em] ml-1">Real-Time Institutional Intelligence Convergence</p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          {/* Search */}
          <div className="relative group">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-indigo-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Search Intelligence..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-6 text-xs text-white focus:outline-none focus:border-indigo-500/50 w-full md:w-64 transition-all"
            />
          </div>

          <div className="flex items-center space-x-2 bg-white/5 p-1.5 rounded-2xl border border-white/10">
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-indigo-500 text-black shadow-lg shadow-indigo-500/20' : 'text-gray-500 hover:text-white'}`}
            >
              <LayoutGrid size={16} />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-xl transition-all ${viewMode === 'list' ? 'bg-indigo-500 text-black shadow-lg shadow-indigo-500/20' : 'text-gray-500 hover:text-white'}`}
            >
              <List size={16} />
            </button>
          </div>

          <button 
            onClick={fetchIntelligence}
            disabled={loading}
            className="p-3 rounded-2xl bg-white/5 border border-white/10 text-indigo-500 hover:bg-white/10 transition-all disabled:opacity-50"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-4 custom-scrollbar px-4 md:px-0">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`flex items-center space-x-3 px-6 py-3 rounded-2xl border font-black uppercase tracking-widest text-[10px] transition-all whitespace-nowrap ${
              activeCategory === cat.id 
                ? 'text-black shadow-xl active:scale-95' 
                : 'bg-white/5 border-white/10 text-gray-500 hover:border-white/20'
            }`}
            style={{ 
              backgroundColor: activeCategory === cat.id ? profile.borderA : undefined,
              borderColor: activeCategory === cat.id ? profile.borderA : undefined,
              boxShadow: activeCategory === cat.id ? `0 20px 50px ${profile.borderA}33` : undefined
            }}
          >
            <cat.icon size={14} />
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Live Signal Stream (Media Webhooks) */}
      <section className="px-4 md:px-0 space-y-4">
        <div className="flex items-center space-x-3">
          <Zap size={20} style={{ color: profile.borderA }} />
          <h3 className="text-sm font-black uppercase tracking-[0.3em] italic">Live Signal Stream // Media Webhooks</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { msg: 'REUTERS: Fed Minutes indicate persistent hawkish bias', time: '12s ago', type: 'FLASH' },
            { msg: 'BLOOMBERG: Institutional rotation into EM equities detected', time: '45s ago', type: 'SIGNAL' },
            { msg: 'LOCAL: Regional infrastructure bill passes final reading', time: '2m ago', type: 'NEWS' }
          ].map((signal, i) => (
            <div 
              key={i} 
              className="p-4 rounded-3xl border flex flex-col justify-between group transition-all"
              style={{ 
                borderColor: `${profile.borderA}22`,
                backgroundColor: `${profile.borderA}05`
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded border"
                      style={{ 
                        color: profile.borderA,
                        backgroundColor: `${profile.borderA}11`,
                        borderColor: `${profile.borderA}22`
                      }}>
                  {signal.type}
                </span>
                <span className="text-[8px] font-mono opacity-40">{signal.time}</span>
              </div>
              <p className="text-[11px] font-bold tracking-tight uppercase leading-relaxed text-white">
                {signal.msg}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Main Content Area */}
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div 
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-40 space-y-6"
          >
            <div className="relative">
              <RefreshCw size={48} className="text-indigo-500 animate-spin" />
              <div className="absolute inset-0 bg-indigo-500 blur-2xl opacity-20 animate-pulse" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-indigo-500/60">Decrypting Encrypted Feeds...</p>
          </motion.div>
        ) : filteredNews.length === 0 ? (
          <motion.div 
             key="empty"
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             className="text-center py-40 space-y-4"
          >
             <AlertCircle size={40} className="mx-auto text-gray-700" />
             <p className="text-gray-500 uppercase font-black text-xs tracking-widest">No matching intelligence found.</p>
          </motion.div>
        ) : (
          <motion.div
            key="news-content"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={viewMode === 'grid' 
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 px-4 md:px-0" 
              : "space-y-4 px-4 md:px-0"}
          >
            {filteredNews.map((item, idx) => (
              <motion.a
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                key={idx}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                className={`group flex flex-col glass border border-white/5 rounded-[32px] overflow-hidden hover:border-indigo-500/30 transition-all hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)] ${viewMode === 'list' ? 'flex-row items-center h-32' : ''}`}
              >
                {/* Image Section */}
                <div className={`relative overflow-hidden ${viewMode === 'grid' ? 'h-48' : 'w-48 h-full'}`}>
                  <img 
                    src={item.image} 
                    alt={item.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
                  
                  {/* Category Tag */}
                  <div className="absolute top-4 left-4 px-4 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10">
                    <span className="text-[8px] font-black uppercase tracking-widest text-indigo-400">
                      {item.category}
                    </span>
                  </div>

                  {/* Impact Indicator */}
                  {item.impactScore > 70 && (
                    <div className="absolute top-4 right-4 bg-red-500 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest text-black flex items-center space-x-1 animate-pulse">
                      <Zap size={10} fill="currentColor" />
                      <span>Critical</span>
                    </div>
                  )}
                </div>

                {/* Content Section */}
                <div className={`p-6 flex flex-col justify-between flex-1 ${viewMode === 'list' ? 'py-4 h-full' : ''}`}>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                       <span className="text-[9px] font-mono text-gray-500 uppercase">{item.timestamp}</span>
                       <button className="text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity">
                         <ExternalLink size={14} />
                       </button>
                    </div>
                    <h3 className={`font-black tracking-tight leading-[1.1] uppercase italic ${viewMode === 'grid' ? 'text-lg line-clamp-2' : 'text-xl'}`} style={{ color: profile.text }}>
                      {item.title}
                    </h3>
                    <p className={`text-gray-400 text-xs font-medium leading-relaxed ${viewMode === 'grid' ? 'line-clamp-2' : 'line-clamp-1 opacity-60'}`}>
                      {item.description}
                    </p>
                  </div>

                  <div className={`flex items-center justify-between mt-6 ${viewMode === 'list' ? 'mt-2' : ''}`}>
                    <div className="flex items-center space-x-2">
                       <div className="w-5 h-5 rounded-full bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                         <TrendingUp size={10} className="text-indigo-400" />
                       </div>
                       <span className="text-[9px] font-black uppercase tracking-widest text-gray-500">{item.impactScore}/100 Alpha</span>
                    </div>
                    <div className="h-1 w-12 bg-white/5 rounded-full overflow-hidden">
                       <motion.div 
                         initial={{ width: 0 }}
                         animate={{ width: `${item.impactScore}%` }}
                         className="h-full bg-indigo-500"
                       />
                    </div>
                  </div>
                </div>
              </motion.a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
