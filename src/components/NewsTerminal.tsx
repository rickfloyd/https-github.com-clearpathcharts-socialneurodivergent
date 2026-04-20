import React, { useEffect, useState } from 'react';
import { TrendingUp, Zap, Calendar, Book } from 'lucide-react';
import { InterfaceProfile, TraderProfile, EventObject, NewsItem as NewsItemType } from '../types';
import { DataStreamService } from '../services/dataStreamService';
import { RSSService, TerminalNewsItem } from '../services/rssService';

interface NewsTerminalProps {
  profile: InterfaceProfile;
}

const RSS_FEEDS = [
  { name: 'CNBC Finance', url: 'https://www.cnbc.com/id/100003114/device/rss/rss.html', category: 'Financial' },
  { name: 'MarketWatch', url: 'https://www.marketwatch.com/rss/topstories', category: 'Financial' },
  { name: 'BBC World News', url: 'http://feeds.bbci.co.uk/news/world/rss.xml', category: 'World' },
  { name: 'CNN World News', url: 'http://rss.cnn.com/rss/edition_world.rss', category: 'World' },
  { name: 'Yahoo Finance', url: 'https://finance.yahoo.com/rss/', category: 'Financial' },
  { name: 'Investing.com Markets', url: 'https://www.investing.com/rss/market_overview.rss', category: 'Market' },
  { name: 'ET Markets', url: 'https://economictimes.indiatimes.com/markets/rssfeeds/1977021501.cms', category: 'Financial' },
  { name: 'Livemint Markets', url: 'https://www.livemint.com/rss/markets', category: 'Financial' },
  { name: 'NYT World', url: 'https://rss.nytimes.com/services/xml/rss/nyt/World.xml', category: 'World' },
  { name: 'LA Times (Local/West)', url: 'https://www.latimes.com/world-nation/rss2.0.xml', category: 'Local' }
];

const DEFAULT_TRADER_PROFILE: TraderProfile = {
  universe: {
    tickers: ['AAPL', 'TSLA', 'BTC', 'ETH', 'EURUSD'],
    industries: ['Technology', 'Artificial Intelligence', 'Energy'],
    countries: ['USA', 'China', 'EU'],
    commodities: ['Gold', 'Oil'],
  },
  exposures: {
    factor: ['Growth', 'Momentum'],
    sector: ['Tech', 'Finance'],
    region: ['North America'],
    rates: 0.8,
    fx: ['USD', 'EUR'],
  },
  constraints: {
    holdingPeriod: 'Medium Term',
    maxDrawdown: 15,
    leverage: 2,
    liquidityNeeds: 'High',
    eventRiskTolerance: 'medium',
  },
  catalystCalendar: {
    earningsWindows: ['Q1', 'Q2'],
    rollDates: [],
    fomcCpiSensitivity: 0.9,
    electionRegulatorySensitivity: 0.7,
  },
  preferredSources: ['SEC', 'FED', 'Congress'],
};

function calculateImpactScore(event: any, profile: TraderProfile): { score: number; explanation: string } {
  let score = 0;
  let matches: string[] = [];

  const eventText = (event.title + ' ' + (event.description || '') + ' ' + (event.detail || '')).toLowerCase();
  
  profile.universe.tickers.forEach(ticker => {
    if (eventText.includes(ticker.toLowerCase())) {
      score += 30;
      matches.push(`Ticker: ${ticker}`);
    }
  });

  profile.universe.industries.forEach(industry => {
    if (eventText.includes(industry.toLowerCase())) {
      score += 20;
      matches.push(`Industry: ${industry}`);
    }
  });

  if (event.source === 'FED_REG' || event.source === 'SEC_EDGAR' || event.source === 'CAISO_GRID') {
    score += 25;
    matches.push(`Verified Source: ${event.source}`);
  }

  score = Math.min(score, 100);

  return {
    score,
    explanation: matches.length > 0 ? `Matched ${matches.join(', ')}` : 'General market intelligence.'
  };
}

// TerminalNewsItem imported from rssService

interface RiskAlert {
  title: string;
  severity: 'low' | 'medium' | 'high';
  timestamp: string;
}

interface CivicData {
  status: string;
  source: string;
}

interface MasterUpdate {
  source: string;
  title: string;
  detail: string;
  color: string;
  id?: string;
}

interface GridStatus {
  demand: number;
  reserves: number;
  renewables: number;
  status: 'Normal' | 'Warning' | 'Critical';
}

export default function NewsTerminal({ profile }: NewsTerminalProps) {
  const [news, setNews] = useState<TerminalNewsItem[]>([
    {
      title: "DXY COMMANDER REACHES CRITICAL THRESHOLD: LIQUIDITY EVENT IMMINENT",
      link: "#",
      category: "Institutional",
      image: "https://picsum.photos/seed/dxy/800/600",
      timestamp: "LIVE",
      description: "Neural models track massive institutional repositioning in Dollar Index at 104.50 pivot.",
      author: "ClearPath Core",
      readTime: "1 min"
    },
    {
      title: "FED LIQUIDITY INJECTION DETECTED // JXY SECTOR REBALANCING",
      link: "#",
      category: "Market",
      image: "https://picsum.photos/seed/liquidity/800/600",
      timestamp: "LIVE",
      description: "Anomalous capital flows observed in Yen crosses. Institutional bias shifting to risk-off.",
      author: "Market Alpha",
      readTime: "3 min"
    },
    {
      title: "XAUUSD INSTITUTIONAL ACCUMULATION // NEURAL BIAS: BULLISH",
      link: "#",
      category: "Institutional",
      image: "https://picsum.photos/seed/gold/800/600",
      timestamp: "LIVE",
      description: "Sub-millisecond data confirms heavy buy-side order blocks at 2150 level.",
      author: "ClearPath Intel",
      readTime: "2 min"
    },
    {
      title: "QUANTUM DIVERGENCE DETECTED IN CRYPTO DOMINANCE",
      link: "#",
      category: "Market",
      image: "https://picsum.photos/seed/crypto/800/600",
      timestamp: "LIVE",
      description: "BTC dominance reaches multi-year highs as altcoin liquidity drains into digital gold.",
      author: "System Alpha",
      readTime: "5 min"
    }
  ]);
  const [riskAlerts, setRiskAlerts] = useState<RiskAlert[]>([]);
  const [civicData, setCivicData] = useState<CivicData>({ status: 'Monitoring...', source: 'Democracy Works' });
  const [masterUpdates, setMasterUpdates] = useState<EventObject[]>([]);
  const [gridStatus, setGridStatus] = useState<GridStatus>({ demand: 22430, reserves: 3419, renewables: 82, status: 'Normal' });
  const [tickerData, setTickerData] = useState<string[]>(['CME_FUTURES: LOADING...', 'IBKR_DATA: CONNECTING...']);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);

  const categories = ['All', 'World', 'Financial', 'Market', 'Tech', 'AI', 'Federal', 'Institutional', 'Local', 'Risk', 'Top Impact', 'RSS', 'Journal / Calendars', 'Sentiment'];

  useEffect(() => {
    async function fetchNews() {
      try {
        const response = await fetch('/api/news');
        const data = await response.json();
        if (Array.isArray(data)) {
          const mappedNews = data.map((item: any, index: number) => ({
            title: item.title,
            link: item.link || '#',
            category: item.category || 'Market',
            image: item.image || `https://picsum.photos/seed/${index + 200}/800/600`,
            timestamp: item.timestamp || 'Just now',
            description: item.description || 'Institutional intelligence report.',
            author: item.author || 'System Intel',
            readTime: item.readTime || '5 min'
          }));
          setNews(mappedNews);
        }
      } catch (error) {
        console.warn('Warning fetching news:', error);
      } finally {
        setLoading(false);
      }
    }

    async function fetchRss() {
      try {
        for (const feed of RSS_FEEDS) {
          const enrichedItems = await RSSService.fetchAndAnalyze(feed.url);
          const mappedItems: TerminalNewsItem[] = enrichedItems.map(item => ({
            ...item,
            category: feed.category || item.category || 'RSS'
          }));
          setNews(prev => [...prev, ...mappedItems]);
          // Delay to stay within rate limits
          await new Promise(resolve => setTimeout(resolve, 800));
        }
      } catch (error) {
        console.warn('Warning fetching RSS feeds:', error);
      }
    }

    async function fetchRiskAndCivic() {
      // Synthetic data for Risk and Civic
      setRiskAlerts([
        { title: 'Level 4 Travel Advisory: Red Sea Region', severity: 'high', timestamp: '10m ago' },
        { title: 'LexisNexis: Financial Policy Shift in EU', severity: 'medium', timestamp: '1h ago' },
        { title: 'State Dept: Diplomatic Protocol Update', severity: 'low', timestamp: '3h ago' }
      ]);
      setCivicData({ status: 'Election Cycle: Active', source: 'Democracy Works' });
    }

    async function fetchMasterUpdates() {
      try {
        const response = await fetch('/api/master-updates');
        const data = await response.json();
        if (Array.isArray(data)) {
          const scoredUpdates = data.map((item: any) => {
            const { score, explanation } = calculateImpactScore(item, DEFAULT_TRADER_PROFILE);
            return {
              ...item,
              event_id: item.id || Math.random().toString(36).substr(2, 9),
              event_time: Date.now(),
              impactScore: score,
              impactExplanation: explanation
            };
          });
          setMasterUpdates(scoredUpdates);
        }
      } catch (error) {
        console.warn('Warning fetching master updates:', error);
      }
    }

    // Simulate Ticker WebSocket
    const tickerInterval = setInterval(() => {
      const symbols = ['ES=F', 'NQ=F', 'YM=F', 'GC=F', 'CL=F'];
      const newTicker = symbols.map(s => `${s}: ${(Math.random() * 1000 + 4000).toFixed(2)} (${(Math.random() * 2 - 1).toFixed(2)}%)`);
      setTickerData(newTicker);
    }, 3000);

    fetchNews();
    fetchRss();
    fetchRiskAndCivic();
    fetchMasterUpdates();

    // Subscribe to real-time institutional messages
    DataStreamService.subscribeToMessages((msg) => {
      if (msg.type === 'NEWS_UPDATE') {
        const newItem: TerminalNewsItem = {
          title: msg.data.title,
          link: '#',
          category: 'Institutional',
          image: `https://picsum.photos/seed/${msg.data.timestamp}/800/600`,
          timestamp: 'LIVE',
          description: msg.data.description || 'Institutional liquidity shift detected by ClearPath Engine.',
          author: msg.data.source,
          readTime: '1 min'
        };
        setNews(prev => [newItem, ...prev]);
      }
    });

    const interval = setInterval(fetchNews, 60000);
    return () => {
      clearInterval(interval);
      clearInterval(tickerInterval);
    };
  }, []);

  const filteredNews = activeCategory === 'All' 
    ? news 
    : news.filter(item => item.category.toLowerCase() === activeCategory.toLowerCase());

  const filteredMasterUpdates = activeCategory === 'All' || activeCategory === 'Institutional' || activeCategory === 'Local' || activeCategory === 'Top Impact'
    ? (activeCategory === 'Top Impact' ? masterUpdates.filter(u => (u.impactScore || 0) > 50).sort((a, b) => (b.impactScore || 0) - (a.impactScore || 0)) : masterUpdates)
    : [];

  const getCategoryIcon = (cat: string) => {
    switch (cat.toLowerCase()) {
      case 'market': return 'fa-solid fa-chart-line';
      case 'financial': return 'fa-solid fa-sack-dollar';
      case 'world': return 'fa-solid fa-earth-americas';
      case 'ai': return 'fa-solid fa-brain';
      case 'tech': return 'fa-solid fa-microchip';
      case 'federal': return 'fa-solid fa-building-columns';
      case 'institutional': return 'fa-solid fa-shield-halved';
      case 'local': return 'fa-solid fa-map-location-dot';
      case 'top impact': return 'fa-solid fa-fire-flame-curved';
      case 'rss': return 'fa-solid fa-rss';
      case 'journal / calendars': return 'fa-solid fa-calendar-days';
      case 'sentiment': return 'fa-solid fa-face-smile-beam';
      default: return 'fa-solid fa-globe';
    }
  };

  return (
    <div className="flex flex-col h-full space-y-8">
      {/* Real-Time Market Ticker */}
      <div className="glass border-y border-white/10 py-2 overflow-hidden -mx-8">
        <div className="flex space-x-8 text-[10px] font-mono px-8 whitespace-nowrap">
          {tickerData.map((tick, i) => (
            <span key={i} className="text-indigo-400">{tick}</span>
          ))}
        </div>
      </div>

      {/* Header & Hero Section */}
      <div className="text-left space-y-4">
        <h1 className="text-2xl md:text-3xl font-black tracking-tighter uppercase italic">
          <span style={{ color: '#FF4500' }}>MARKET NEWS //</span>
          <span className="text-white ml-2">CLEARPATH STREAM</span>
        </h1>
        <div className="h-[2px] w-full bg-gradient-to-r from-[#FF4500] to-transparent opacity-50" />
      </div>

      {/* Navigation Filters */}
      <div className="flex flex-col md:flex-row items-center justify-center gap-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all border glass ${
                activeCategory === cat 
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-transparent shadow-lg shadow-indigo-500/20' 
                  : 'bg-white/5 text-white/50 border-white/10 hover:bg-white/10'
              }`}
            >
              <span>{cat}</span>
            </button>
          ))}
        </div>
        
        <a 
          href="/api/institutional-feed.xml" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center space-x-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/30 rounded-lg hover:bg-indigo-500/20 transition-all group"
        >
          <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest group-hover:text-indigo-200">RSS Export</span>
          <TrendingUp size={12} className="text-indigo-400" />
        </a>
      </div>

      {/* Bento Grid */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-4 auto-rows-[200px]">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="glass rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-4 auto-rows-[200px]">
            {filteredNews.map((item, i) => (
              <a 
                key={i}
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className={`bento-card glass rounded-2xl p-6 group flex flex-col ${
                  i === 0 ? 'md:col-span-4 lg:col-span-4 lg:row-span-2' : 'md:col-span-2 lg:col-span-2'
                }`}
              >
                {/* INSTITUTIONAL NEURAL PATTERN */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
                     style={{ backgroundImage: `radial-gradient(${profile.ui.accent} 0.5px, transparent 0.5px)`, backgroundSize: '10px 10px' }} />
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-black/20 to-black/40 pointer-events-none" />
                
                {/* Content */}
                <div className="relative z-10 h-full flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="inline-block px-3 py-1 bg-indigo-500/20 rounded-full text-[9px] font-black uppercase tracking-widest text-indigo-300 border border-indigo-500/20">
                        <i className={`${getCategoryIcon(item.category)} mr-1.5`}></i>
                        {item.category}
                      </span>
                      <span className="text-[9px] font-mono text-gray-500 uppercase">{item.timestamp}</span>
                    </div>
                    
                    <h2 className={`font-bold leading-tight transition-colors ${
                      i === 0 ? 'text-2xl md:text-3xl mb-3' : 'text-lg mb-2 line-clamp-2'
                    }`} style={{ color: '#E0115F' }}>
                      {item.title}
                    </h2>
                    
                    <p className={`text-gray-400 font-medium ${
                      i === 0 ? 'text-sm mb-4 line-clamp-3' : 'text-xs line-clamp-2'
                    }`}>
                      {item.description}
                    </p>

                    <div className="mt-4 flex justify-between text-[9px] font-bold uppercase tracking-widest text-gray-500">
                      <span>{item.author}</span>
                      <span>{item.readTime}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 pt-4 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0 duration-300">
                    <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Access Intel</span>
                    <i className="fa-solid fa-arrow-right text-[10px] text-indigo-400" />
                  </div>
                </div>
              </a>
            ))}

            {/* Master Institutional Updates */}
            {filteredMasterUpdates.map((item, i) => {
              if (activeCategory === 'Local' && item.source !== 'CA_LOCAL') return null;
              return (
                <div key={`master-${i}`} className="bento-card md:col-span-2 glass rounded-2xl p-6 relative overflow-hidden group">
                  {/* INSTITUTIONAL NEURAL PATTERN */}
                  <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
                       style={{ backgroundImage: `radial-gradient(${profile.ui.accent} 0.5px, transparent 0.5px)`, backgroundSize: '10px 10px' }} />
                  <div className="relative z-10 h-full flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <span className={`${item.color || 'text-indigo-400'} text-[10px] font-black uppercase tracking-widest`}>{item.source}</span>
                        <div className="flex items-center space-x-2">
                          {item.impactScore && (
                            <div className="flex items-center space-x-1 px-1.5 py-0.5 bg-red-500/20 rounded border border-red-500/30">
                              <span className="text-[8px] font-black text-red-400">{item.impactScore}% IMPACT</span>
                            </div>
                          )}
                          <span className="text-gray-600 text-[8px] font-mono">ID: {item.event_id || 'N/A'}</span>
                        </div>
                      </div>
                      <h3 className="text-sm font-bold leading-tight transition-colors" style={{ color: '#E0115F' }}>{item.title}</h3>
                      <p className="text-[10px] text-gray-500 mt-3 font-medium leading-relaxed">{item.detail}</p>
                      
                      {item.impactExplanation && (
                        <div className="mt-4 p-2 bg-indigo-500/5 rounded border border-indigo-500/10">
                          <p className="text-[8px] text-indigo-300/70 font-mono uppercase tracking-tighter">
                            <span className="text-indigo-500 font-bold mr-1">WHY YOU'RE SEEING THIS:</span>
                            {item.impactExplanation}
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                      <span className="text-[8px] font-bold text-gray-600 uppercase tracking-widest">Institutional Layer</span>
                      <i className="fa-solid fa-link text-[8px] text-gray-700" />
                    </div>
                  </div>
                </div>
              );
            })}

            {/* State Infrastructure Stability Dashboard */}
            {(activeCategory === 'All' || activeCategory === 'Local') && (
              <div className={`bento-card md:col-span-4 glass rounded-2xl p-6 border-l-4 ${gridStatus.status === 'Normal' ? 'border-green-500' : 'border-red-500'} relative overflow-hidden`}>
                {/* INSTITUTIONAL NEURAL PATTERN */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
                     style={{ backgroundImage: `radial-gradient(${profile.ui.accent} 0.5px, transparent 0.5px)`, backgroundSize: '10px 10px' }} />
                <div className="relative z-10">
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center space-x-3">
                      <div className={`w-2 h-2 rounded-full ${gridStatus.status === 'Normal' ? 'bg-green-500' : 'bg-red-500'}`} />
                      <h3 className="text-lg font-bold uppercase tracking-tighter" style={{ color: '#E0115F' }}>State Infrastructure Stability</h3>
                    </div>
                    <span className={`px-2 py-1 ${gridStatus.status === 'Normal' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'} text-[10px] font-black rounded uppercase tracking-widest`}>
                      LIVE MONITOR // {gridStatus.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-8">
                    <div className="space-y-1">
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">System Demand</p>
                      <p className="text-3xl font-black font-mono tracking-tighter">{gridStatus.demand.toLocaleString()} <span className="text-xs text-gray-600">MW</span></p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Available Reserves</p>
                      <p className={`text-3xl font-black font-mono tracking-tighter ${gridStatus.reserves < 2000 ? 'text-red-500' : 'text-gray-300'}`}>
                        {gridStatus.reserves.toLocaleString()} <span className="text-xs text-gray-600">MW</span>
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Renewable Mix</p>
                      <p className="text-3xl font-black font-mono tracking-tighter text-green-400">{gridStatus.renewables}%</p>
                    </div>
                  </div>
                  <div className="mt-6 pt-6 border-t border-white/5 flex justify-between items-center">
                    <p className="text-[9px] text-gray-500 font-medium uppercase tracking-widest">Source: CAISO GridStatus.io // Real-Time 5m Feed</p>
                    <button 
                      onClick={() => setGridStatus(prev => ({ ...prev, reserves: 1850, status: 'Critical' }))}
                      className="text-[9px] font-bold transition-colors uppercase tracking-widest"
                      style={{ color: '#FF4500' }}
                    >
                      <span>Simulate Critical Event</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* California Intelligence Card */}
            {(activeCategory === 'All' || activeCategory === 'Local') && (
              <div className="bento-card md:col-span-2 lg:col-span-2 glass rounded-2xl p-6 flex flex-col">
                {/* INSTITUTIONAL NEURAL PATTERN */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
                     style={{ backgroundImage: `radial-gradient(${profile.ui.accent} 0.5px, transparent 0.5px)`, backgroundSize: '10px 10px' }} />
                <div className="relative z-10">
                  <h3 className="text-xs font-bold mb-4 flex items-center uppercase tracking-widest" style={{ color: '#E0115F' }}>
                    <i className="fas fa-map-marker-alt mr-2"></i>
                    California Intelligence
                  </h3>
                  <div className="space-y-4">
                    {masterUpdates.filter(u => u.source === 'CA_LOCAL').map((update, i) => (
                      <div key={i} className="border-l-2 border-yellow-500/30 pl-4 py-1">
                        <p className="text-xs font-bold text-gray-300 leading-tight">{update.title}</p>
                        <p className="text-[10px] text-gray-500 mt-1 leading-relaxed">{update.detail}</p>
                      </div>
                    ))}
                    <div className="pt-2">
                      <span className="text-[9px] font-bold text-indigo-400 uppercase cursor-pointer hover:underline">Access SODA API Portal</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Market Velocity Card (Static/Dynamic Data) */}
            <div className="bento-card md:col-span-2 lg:col-span-2 glass rounded-2xl p-6 flex flex-col justify-between">
              {/* INSTITUTIONAL NEURAL PATTERN */}
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
                   style={{ backgroundImage: `radial-gradient(${profile.ui.accent} 0.5px, transparent 0.5px)`, backgroundSize: '10px 10px' }} />
              <div className="relative z-10">
                <h3 className="text-lg font-bold mb-4 flex items-center" style={{ color: '#E0115F' }}>
                  <i className="fas fa-bolt mr-2 text-purple-400"></i>
                  Market Velocity
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">High-Frequency Nodes</span>
                    <span className="text-xs font-bold text-green-400">+42%</span>
                  </div>
                  <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Market Liquidity</span>
                    <span className="text-xs font-bold text-green-400">+12%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Execution Latency</span>
                    <span className="text-xs font-bold text-indigo-400">0.8ms</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Global Risk Alert Card */}
            <div className="bento-card md:col-span-2 lg:col-span-2 glass rounded-2xl p-6 flex flex-col" data-category="risk">
              {/* INSTITUTIONAL NEURAL PATTERN */}
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
                   style={{ backgroundImage: `radial-gradient(${profile.ui.accent} 0.5px, transparent 0.5px)`, backgroundSize: '10px 10px' }} />
              <div className="relative z-10">
                <h3 className="text-sm font-bold mb-4 flex items-center uppercase tracking-widest" style={{ color: '#E0115F' }}>
                  <i className="fas fa-exclamation-triangle mr-2"></i>
                  Global Risk Alert
                </h3>
                <div className="space-y-3">
                  {riskAlerts.map((alert, i) => (
                    <div key={i} className="flex flex-col border-l-2 border-orange-500/30 pl-3 py-1">
                      <span className="text-[11px] font-bold text-gray-300 leading-tight">{alert.title}</span>
                      <span className="text-[9px] text-gray-500 uppercase mt-1">{alert.timestamp} // {alert.severity}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Civic Intelligence Card */}
            <div className="bento-card md:col-span-2 lg:col-span-2 glass rounded-2xl p-6 flex flex-col justify-center items-center text-center">
              {/* INSTITUTIONAL NEURAL PATTERN */}
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
                   style={{ backgroundImage: `radial-gradient(${profile.ui.accent} 0.5px, transparent 0.5px)`, backgroundSize: '10px 10px' }} />
              <div className="relative z-10">
                <h3 className="text-sm font-bold mb-4 flex items-center uppercase tracking-widest justify-center" style={{ color: '#E0115F' }}>
                  <i className="fas fa-vote-yea mr-2"></i>
                  Civic Intelligence
                </h3>
                <div className="py-4">
                  <p className="text-2xl font-black text-gray-300 uppercase tracking-tighter italic">{civicData.status}</p>
                  <p className="text-[9px] text-gray-500 uppercase mt-2 tracking-widest">Source: {civicData.source}</p>
                </div>
                <div className="mt-4 pt-4 border-t border-white/5">
                  <span className="text-[10px] font-bold text-indigo-400 uppercase cursor-pointer hover:underline">View Civic Dashboard</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Branding */}
      <div className="flex items-center justify-between pt-6 border-t border-white/5">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-[#292929] rounded flex items-center justify-center">
            <i className="fas fa-chart-line text-[10px] text-gray-400"></i>
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest opacity-50">INSTITUTIONAL ADAPTIVE INSIGHTS // 2026</span>
        </div>
        <div className="flex space-x-6 opacity-30">
          <i className="fa-brands fa-twitter cursor-pointer hover:text-indigo-400 transition-colors" />
          <i className="fa-brands fa-linkedin cursor-pointer hover:text-indigo-400 transition-colors" />
          <i className="fa-brands fa-github cursor-pointer hover:text-indigo-400 transition-colors" />
        </div>
      </div>

      {/* Emergency Response Modal */}
      {gridStatus.reserves < 2000 && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="glass max-w-md w-full rounded-3xl p-8 border-2 border-red-500 shadow-2xl shadow-red-500/20 animate-in zoom-in duration-300">
            <div className="flex items-center justify-center w-16 h-16 bg-red-500/20 rounded-full mx-auto mb-6">
              <i className="fas fa-triangle-exclamation text-2xl text-red-500"></i>
            </div>
            <h2 className="text-2xl font-black text-center text-white uppercase tracking-tighter mb-2">Critical Grid Alert</h2>
            <p className="text-gray-400 text-center text-sm mb-8">
              CAISO Operating Reserves have dropped below the <span className="text-red-500 font-bold">2,000 MW</span> critical threshold. System stability is compromised.
            </p>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl">
                <span className="text-[10px] font-bold text-gray-500 uppercase">Current Reserves</span>
                <span className="text-xl font-mono font-black text-red-500">{gridStatus.reserves} MW</span>
              </div>
              <button 
                onClick={() => setGridStatus(prev => ({ ...prev, reserves: 3419, status: 'Normal' }))}
                className="w-full py-4 bg-red-600 stroke-transparent hover:bg-red-700 text-white font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-red-600/20"
              >
                <span>Acknowledge & Monitor</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
