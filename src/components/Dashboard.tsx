import React, { useState, useEffect, useRef, Suspense, lazy } from 'react';
import { 
  Home, 
  Newspaper, 
  MapPin, 
  FileText, 
  Image as ImageIcon, 
  Calendar, 
  Search, 
  MessageSquare, 
  Bell, 
  Mail, 
  Plus, 
  Heart, 
  Share2, 
  MoreHorizontal,
  ChevronDown,
  Menu,
  ArrowLeft,
  User,
  CheckCircle2,
  Clock,
  LayoutDashboard,
  Settings as SettingsIcon,
  TrendingUp,
  Navigation,
  Brain,
  Activity,
  BookOpen,
  Building2,
  BarChart3,
  Shield,
  Bot
} from 'lucide-react';
import { getFriendlyLocation } from '../services/locationService';
import { motion, AnimatePresence } from 'motion/react';
import { NeuroProfile, UserProfile } from '../types';

interface DashboardProps {
  profile: NeuroProfile;
  onProfileChange: (profileId: string) => void;
}

import { NEURO_PROFILES } from '../lib/neuro/profiles';
import { useAuth } from '../contexts/FirebaseContext';
import { logout } from '../firebase';

// Lazy load sub-components
const NewsTerminal = lazy(() => import('./NewsTerminal'));
const FxSikaJournal = lazy(() => import('./FxSikaJournal'));
const TradingJournal = lazy(() => import('./TradingJournal'));
const MarketAssetsList = lazy(() => import('./MarketAssetsList'));
const LegalFooter = lazy(() => import('./LegalFooter'));
const Timeline = lazy(() => import('./Timeline'));
const LiveChart = lazy(() => import('./LiveChart'));
const About = lazy(() => import('./About'));
const NeuroDiversion = lazy(() => import('./NeuroDiversion'));
const SentinelContainer = lazy(() => import('./SentinelContainer'));
const Photos = lazy(() => import('./Photos'));
const ExecutivePerformance = lazy(() => import('./ExecutivePerformance').then(m => ({ default: m.ExecutivePerformance })));
const TerminalSettings = lazy(() => import('./Settings'));
const NeuroWelcomeDashboard = lazy(() => import('./dashboard/NeuroWelcomeDashboard').then(m => ({ default: m.NeuroWelcomeDashboard })));
const CorporateMultiChartLayout = lazy(() => import('./dashboard/CorporateMultiChartLayout').then(m => ({ default: m.CorporateMultiChartLayout })));
const LightweightMarketUI = lazy(() => import('./markets/LightweightMarketUI').then(m => ({ default: m.LightweightMarketUI })));
const StandardMarketUI = lazy(() => import('./markets/StandardMarketUI').then(m => ({ default: m.StandardMarketUI })));
const VoiceAssistant = lazy(() => import('./VoiceAssistant').then(m => ({ default: m.VoiceAssistant })));
const AILab = lazy(() => import('./AILab'));

function TabLoading() {
  return (
    <div className="w-full h-full flex items-center justify-center p-12">
      <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export default function Dashboard({ profile: initialProfile, onProfileChange }: DashboardProps) {
  const profile = initialProfile || NEURO_PROFILES.standard_trader;
  const { user: authUser, userProfile, updateUserImages, updateIntro, createPost, posts, toggleLike } = useAuth();
  const [leftSide, setLeftSide] = useState(false);
  const [rightSide, setRightSide] = useState(false);
  const [activeTab, setActiveTab] = useState('Home');
  const [isAiWidgetOpen, setIsAiWidgetOpen] = useState(false);
  const [isEditingIntro, setIsEditingIntro] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [introForm, setIntroForm] = useState({
    bio: '',
    location: '',
    company: ''
  });

  useEffect(() => {
    if (userProfile?.intro) {
      setIntroForm(userProfile.intro);
    }
  }, [userProfile]);

  useEffect(() => {
    const handleCommand = (e: any) => {
      const { action, target } = e.detail;
      if (action === 'navigate') {
        // Map common spoken words to tab IDs
        const targetMap: Record<string, string> = {
          'home': 'Home',
          'sentinel': 'Sentinel',
          'insights': 'Insights',
          'corporate': 'Corporate',
          'market': 'Market',
          'standard': 'Standard',
          'neurodivergent': 'neurodivergent',
          'clear path hub': 'neurodivergent',
          'journal': 'Journal',
          'news': 'news',
          'photos': 'Photos',
          'settings': 'Settings',
          'biography': 'Biography',
          'ai lab': 'AI Lab',
          'neural lab': 'AI Lab'
        };
        const mappedTarget = targetMap[target.toLowerCase()] || target;
        setActiveTab(mappedTarget);
      }
    };
    window.addEventListener('app-command', handleCommand);
    return () => window.removeEventListener('app-command', handleCommand);
  }, []);
  
  const user = {
    name: userProfile?.displayName || authUser?.displayName || 'NEURO USER',
    avatar: userProfile?.photoURL || authUser?.photoURL || 'https://picsum.photos/seed/profile/150/150',
    cover: userProfile?.coverURL || 'https://images.unsplash.com/photo-1508247967583-7d982ea01526?ixlib=rb-1.2.1&auto=format&fit=crop&w=2250&q=80',
    email: authUser?.email,
    intro: userProfile?.intro || { bio: '', location: '', company: '' }
  };

  const handleLogout = async () => {
    await logout();
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'cover') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      await updateUserImages({ [type]: base64 });
    };
    reader.readAsDataURL(file);
  };

  const handleSaveIntro = async () => {
    await updateIntro(introForm);
    setIsEditingIntro(false);
  };

  const handleDetectLocation = async () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;
      const friendlyName = await getFriendlyLocation(latitude, longitude);
      setIntroForm(prev => ({ ...prev, location: friendlyName }));
    }, (error) => {
      console.error('Geolocation error:', error);
      alert('Could not detect location. Please check your permissions.');
    });
  };

  const handlePost = async () => {
    if (!statusText.trim()) return;
    await createPost(statusText, undefined, 'GLOBAL');
    setStatusText('');
  };

  const menuItems = [
    { id: 'Home', icon: Home, label: 'Home' },
    { id: 'Sentinel', icon: Shield, label: 'The Sentinel' },
    { id: 'Insights', icon: LayoutDashboard, label: 'Insights' },
    { id: 'Corporate', icon: Building2, label: 'Corporate Mode' },
    { id: 'Market', icon: TrendingUp, label: 'Market Terminal' },
    { id: 'Standard', icon: BarChart3, label: 'Standard Exchange' },
    { id: 'neurodivergent', icon: Brain, label: 'Clear Path Hub' },
    { id: 'Journal', icon: BookOpen, label: 'Journal' },
    { id: 'news', icon: Newspaper, label: 'Latest News' },
  ];

  const stories = [
    { id: 1, name: 'Lisandro Matos', time: '12 hours ago', img: 'https://picsum.photos/seed/user1/100/100' },
    { id: 2, name: 'Gvozden Boskovsky', time: '29 minutes ago', img: 'https://picsum.photos/seed/user2/100/100' },
    { id: 3, name: 'Hnek Fortuin', time: '3 hours ago', img: 'https://picsum.photos/seed/user3/100/100' },
    { id: 4, name: 'Lubomir Dvorak', time: '18 hours ago', img: 'https://picsum.photos/seed/user4/100/100' },
  ];

  const contacts = [
    { id: 1, name: 'Andrei Mashrin', status: 'online', img: 'https://picsum.photos/seed/c1/100/100' },
    { id: 2, name: 'Aryn Jacobssen', status: 'offline', img: 'https://picsum.photos/seed/c2/100/100' },
    { id: 3, name: 'Carole Landu', status: 'offline', img: 'https://picsum.photos/seed/c3/100/100' },
    { id: 4, name: 'Chineze Afa', status: 'online', img: 'https://picsum.photos/seed/c4/100/100' },
    { id: 5, name: 'Mok Kwang', status: 'online', img: 'https://picsum.photos/seed/c5/100/100' },
    { id: 6, name: 'Naomi Yepes', status: 'online', img: 'https://picsum.photos/seed/c6/100/100' },
  ];

  return (
    <div 
      className="flex w-full h-[100dvh] overflow-hidden text-[#ccc8db] font-sans selection:bg-indigo-500 selection:lava-hot-text transition-colors duration-1000"
      style={{ background: profile.ui.bgTop }}
    >
      {/* Left Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-[260px] border-r flex flex-col transition-all duration-300 glass
        lg:relative lg:translate-x-0
        ${leftSide ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        ${!leftSide && 'lg:w-[56px]'}
      `}
      style={{ borderColor: `${profile.ui.accent}22` }}
      >
        <div 
          className="flex items-center justify-center h-[68px] sticky top-0 z-10 cursor-pointer hover:opacity-80 transition-opacity" 
          style={{ background: profile.ui.bgBottom }}
          onClick={() => setActiveTab('Home')}
        >
          <div className={`font-black tracking-tighter text-[10px] leading-none transition-all duration-300 ${!leftSide && 'lg:rotate-180 lg:[writing-mode:vertical-lr] lg:mt-[-10px]'}`}
               style={{ color: profile.ui.accent }}>
            NEURO<br />ADAPTIVE<br />INSIGHTS
          </div>
        </div>

        <button 
          onClick={() => setLeftSide(!leftSide)}
          className="absolute top-4 right-[-48px] w-12 h-12 flex items-center justify-center rounded-r shadow-lg z-[60]"
          style={{ background: `${profile.ui.accent}ee`, color: '#000' }}
        >
          {leftSide ? <ArrowLeft size={24} /> : <Menu size={24} />}
        </button>

        <div className={`flex-1 overflow-y-auto custom-scrollbar px-[30px] py-4 transition-opacity duration-300 ${!leftSide && 'lg:opacity-0 lg:pointer-events-none'}`}>
          <div className="text-[#5c5e6e] text-[15px] font-semibold mb-5 uppercase tracking-wider">Menu</div>
          <nav className="flex flex-col space-y-5">
            {menuItems.map((item) => (
              <button 
                key={item.id} 
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center transition-colors group ${activeTab === item.id ? 'text-white' : 'text-[#9c9cab] hover:text-white'}`}
                style={{ color: activeTab === item.id ? profile.ui.accent : undefined }}
              >
                <item.icon size={16} className="mr-4 group-hover:scale-110 transition-transform" />
                <span className="text-[15px] whitespace-nowrap">{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="text-[#5c5e6e] text-[15px] font-semibold mt-10 mb-5 uppercase tracking-wider">Your Favourite</div>
          <nav className="flex flex-col space-y-5">
            <a href="#" className="flex items-center text-[#9c9cab] hover:lava-hot-text transition-colors">
              <ImageIcon size={16} className="mr-4 text-[#88b337]" />
              <span className="text-[15px]">Foresto</span>
            </a>
            <a href="#" className="flex items-center text-[#9c9cab] hover:lava-hot-text transition-colors">
              <ImageIcon size={16} className="mr-4 text-[#f0c419]" />
              <span className="text-[15px]">Birds</span>
            </a>
            <a href="#" className="flex items-center text-[#9c9cab] hover:lava-hot-text transition-colors">
              <ImageIcon size={16} className="mr-4 text-[#ff9940]" />
              <span className="text-[15px]">Nature</span>
            </a>
          </nav>
        </div>

        <a href="#" className="flex items-center h-[52px] px-5 border-t border-[#272a3a] text-[#9c9cab] text-sm relative group overflow-hidden">
          <div className="flex items-center transition-transform duration-300 group-hover:translate-y-full">
            <Share2 size={16} className="mr-2" />
            Follow me on Twitter
          </div>
          <div className="absolute inset-0 bg-[#272a3a] lava-hot-text flex items-center px-5 translate-y-[-100%] group-hover:translate-y-0 transition-transform duration-300">
            <img src={user.avatar} className="w-[26px] h-[26px] rounded-full mr-2 object-cover" />
            <span className="name-text font-bold">{user.name}</span>
          </div>
        </a>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden relative" style={{ background: profile.ui.bgTop }}>
        {/* Search Bar */}
        {activeTab !== 'Insights' && (
          <>
            <div className="h-[60px] flex items-center px-6 relative z-30 border-b glass" style={{ borderColor: `${profile.ui.accent}11` }}>
              <div className="flex items-center space-x-4 mr-8">
                <button 
                  onClick={() => setActiveTab('Home')}
                  className="flex items-center space-x-2 px-4 py-1.5 rounded-full border transition-all hover:scale-105"
                  style={{ 
                    background: activeTab === 'Home' ? profile.ui.accent : 'transparent',
                    borderColor: profile.ui.accent,
                    color: activeTab === 'Home' ? profile.ui.bgTop : profile.ui.accent
                  }}
                >
                  <Home size={16} />
                  <span className="text-xs font-black uppercase tracking-widest">Home</span>
                </button>
              </div>
              
              <div className="relative flex-1 max-w-xl ml-4">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5c5d71]" />
                <input 
                  type="text" 
                  placeholder="Search" 
                  className="w-full h-10 bg-transparent border-none pl-12 pr-4 font-semibold placeholder:text-[#5c5d71] focus:outline-none"
                  style={{ color: profile.ui.accent }}
                />
              </div>
              <div className="flex items-center space-x-4">
                <button 
                  onClick={() => setRightSide(!rightSide)}
                  className="lg:hidden p-3 transition-colors rounded-full shadow-lg z-[60]"
                  style={{ background: `${profile.ui.accent}ee`, color: '#000' }}
                >
                  <MessageSquare size={24} />
                </button>
              </div>
            </div>
          </>
        )}

        {/* Scrollable Container */}
        <div className={`flex-1 overflow-y-auto custom-scrollbar ${activeTab === 'Insights' ? 'p-0' : 'p-3 md:p-5'}`} style={{ background: profile.ui.bgTop }}>
          {/* Profile Section */}
          {activeTab !== 'Insights' && (
            <div className="relative h-[40vh] min-h-[250px] max-h-[350px] rounded-lg overflow-hidden mb-5 group">
              <img 
                src={user.cover} 
                className="absolute inset-0 w-full h-full object-cover"
                alt="Cover"
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
              
              <div className="absolute top-4 right-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                <label className="flex items-center space-x-2 bg-black/40 hover:bg-black/60 backdrop-blur-md px-4 py-2 rounded-lg cursor-pointer transition-all border"
                       style={{ color: profile.ui.accent, borderColor: `${profile.ui.accent}33` }}>
                  <ImageIcon size={16} />
                  <span className="text-sm font-semibold lava-hot-text">Change Banner</span>
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, 'cover')}
                  />
                </label>
              </div>

              <div className="absolute bottom-0 left-0 w-full h-[60px] flex items-center glass"
                   style={{ borderTop: `1px solid ${profile.ui.accent}22` }}>
                <div className="flex items-center gap-4 px-6 w-full overflow-x-auto custom-scrollbar no-scrollbar scroll-smooth">
                  {/* Space for the surfboard avatar on desktop */}
                  <div className="hidden lg:block w-[160px] flex-shrink-0" />
                  
                  {['Home', 'Market', 'Journal', 'Biography', 'Clear Path Hub', 'Photos', 'Settings'].map((tab) => {
                    const tabKey = tab === 'Clear Path Hub' ? 'neurodivergent' : tab;
                    return (
                      <button 
                        key={tab}
                        onClick={() => setActiveTab(tabKey)}
                        className={`h-[36px] px-6 rounded-lg text-[10px] font-black tracking-[0.2em] uppercase transition-all whitespace-nowrap flex-shrink-0 shadow-lg border border-transparent hover:border-white/10 ${
                          tab === 'Settings' 
                            ? 'neon-indigo-tab' 
                            : ['Home', 'Market', 'Journal', 'Biography', 'Clear Path Hub', 'Photos'].includes(tab) 
                              ? 'lava-hot-tab' 
                              : activeTab === tabKey ? 'bg-white/5 border-white/20' : 'text-[#5c5e6e] hover:text-white hover:bg-white/5'
                        } ${activeTab === tabKey ? 'scale-105 border-white/20' : ''}`}
                        style={{ 
                          color: (tab !== 'Settings' && !['Home', 'Market', 'Journal', 'Biography', 'Clear Path Hub', 'Photos'].includes(tab) && activeTab === tabKey) ? profile.ui.accent : undefined,
                        }}
                      >
                        {tab}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="absolute bottom-4 left-6 flex items-center z-10">
                <div className="relative group/avatar surfboard-profile-outline border-4 border-[#FF4500] shadow-[0_0_30px_#FF4500] lava-gradient-bg" style={{ width: '120px', height: '200px' }}>
                  <img 
                    src={user.avatar} 
                    className="surfboard-img" 
                    alt="Avatar" 
                  />
                  <div className="absolute bottom-2 right-2 w-5 h-5 border-4 rounded-full" style={{ background: profile.ui.accent, borderColor: profile.ui.bgBottom }} />
                  
                  <label className="absolute inset-0 flex items-center justify-center bg-black/40 surfboard-profile-outline opacity-0 group-hover/avatar:opacity-100 cursor-pointer transition-opacity" style={{ width: '100%', height: '100%', padding: 0 }}>
                    <User size={24} style={{ color: profile.ui.accent }} />
                    <span className="lava-hot-text text-[10px] font-bold uppercase ml-1">Change</span>
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, 'avatar')}
                    />
                  </label>
                </div>
                <div className="ml-6 mb-6">
                  <h1 className="text-2xl font-bold tracking-tight" style={{ color: profile.ui.accent }}>{user.name}</h1>
                  <p className="text-sm opacity-70 font-mono" style={{ color: profile.ui.accent }}>@{user.name.toLowerCase().replace(/\s/g, '_')}</p>
                </div>
              </div>
            </div>
          )}

          {/* Content Views */}
          <Suspense fallback={<TabLoading />}>
            <AnimatePresence mode="wait">
            {activeTab === 'Home' && (
              <motion.div 
                key="home"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-12"
              >
                <div className="max-w-6xl mx-auto px-4 pt-8 space-y-8">
                  {/* Welcome section removed per user request */}
                </div>

                <div className="max-w-6xl mx-auto px-4">
                  <div className="flex items-center space-x-3 mb-6">
                    <TrendingUp size={20} className="text-indigo-500" />
                    <h3 className="text-xl font-black tracking-tighter uppercase italic" style={{ color: profile.ui.text }}>
                      Live <span style={{ color: profile.ui.accent }}>Market Feed</span>
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    <div className="lg:col-span-3 h-[500px] rounded-3xl overflow-hidden border border-white/5 shadow-2xl glass">
                      <LiveChart symbol="BTCUSDT" theme={{ upColor: profile.candles.upColor, downColor: profile.candles.downColor, accent: profile.ui.accent }} />
                    </div>
                    <div className="lg:col-span-1 space-y-6">
                      <ExecutivePerformance />
                    </div>
                  </div>
                </div>

                <div className="max-w-6xl mx-auto px-4">
                  <div className="flex items-center space-x-3 mb-6">
                    <Activity size={20} className="text-indigo-500" />
                    <h3 className="text-xl font-black tracking-tighter uppercase italic" style={{ color: profile.ui.text }}>
                      Live <span style={{ color: profile.ui.accent }}>Market Pulse</span>
                    </h3>
                  </div>
                  <MarketAssetsList profile={profile} onAddChart={(symbol) => {
                    // Navigate to market tab or update local chart
                  }} />
                </div>

                <Timeline profile={profile} />
              </motion.div>
            )}

            {activeTab === 'Sentinel' && (
              <motion.div 
                key="sentinel"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="h-full"
              >
                <SentinelContainer profile={profile} />
              </motion.div>
            )}

            {activeTab === 'Insights' && (
              <motion.div 
                key="insights"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-12"
              >
                <div className="max-w-4xl mx-auto px-4 pt-8">
                  {/* Welcome section removed per user request */}
                </div>
              </motion.div>
            )}

            {activeTab === 'Corporate' && (
              <motion.div 
                key="corporate"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <CorporateMultiChartLayout profile={profile} />
              </motion.div>
            )}

            {activeTab === 'Market' && (
              <motion.div 
                key="market"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="h-full flex flex-col"
              >
                <div className="flex-1">
                  <LightweightMarketUI profile={profile} onBack={() => setActiveTab('Home')} />
                </div>
                <div className="p-8 border-t glass" style={{ borderColor: `${profile.ui.accent}11` }}>
                  <div className="max-w-7xl mx-auto">
                    <div className="flex items-center space-x-3 mb-6">
                      <Activity size={20} className="text-indigo-500" />
                      <h3 className="text-xl font-black tracking-tighter uppercase italic" style={{ color: profile.ui.text }}>
                        Market <span style={{ color: profile.ui.accent }}>Pulse</span>
                      </h3>
                    </div>
                    <MarketAssetsList profile={profile} onAddChart={(symbol) => {
                      // Update chart symbol
                    }} />
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'Standard' && (
              <motion.div 
                key="standard"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <StandardMarketUI profile={profile} onBack={() => setActiveTab('Home')} />
              </motion.div>
            )}

            {activeTab === 'Biography' && (
              <motion.div 
                key="biography"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <About profile={profile} />
              </motion.div>
            )}

            {activeTab === 'neurodivergent' && (
              <motion.div 
                key="neurodivergent"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <NeuroDiversion 
                  profile={profile} 
                  onProfileChange={onProfileChange} 
                  onNavigate={(tab) => setActiveTab(tab)}
                />
              </motion.div>
            )}

            {activeTab === 'Journal' && (
              <motion.div 
                key="journal"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <FxSikaJournal profile={profile} onBackToDashboard={() => setActiveTab('Home')} />
              </motion.div>
            )}

            {activeTab === 'Photos' && (
              <motion.div 
                key="photos"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Photos profile={profile} />
              </motion.div>
            )}

            {activeTab === 'news' && (
              <motion.div 
                key="news"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="h-[600px]"
              >
                <NewsTerminal profile={profile} />
              </motion.div>
            )}

            {activeTab === 'Settings' && (
              <motion.div 
                key="settings"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <TerminalSettings profile={profile} />
              </motion.div>
            )}

            </AnimatePresence>
          </Suspense>
          
          <div className="mt-10">
            <LegalFooter profile={profile} />
          </div>
        </div>
      </div>

      {/* Right Sidebar */}
      <div className={`
        fixed inset-y-0 right-0 z-50 w-[280px] border-l flex flex-col transition-all duration-300 glass
        xl:relative xl:translate-x-0
        ${rightSide ? 'translate-x-0' : 'translate-x-full xl:translate-x-0'}
      `}
      style={{ borderColor: `${profile.ui.accent}22` }}
      >
        <div className="h-[60px] flex items-center justify-around px-4 sticky top-0 z-10" style={{ background: profile.ui.bgBottom }}>
          <VoiceAssistant />
          <button className="text-[#64677a] hover:text-white relative" style={{ color: `${profile.ui.accent}88` }}>
            <Mail size={20} />
            <div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full border-2" style={{ background: profile.ui.accent, borderColor: profile.ui.bgBottom }} />
          </button>
          <button className="text-[#64677a] hover:text-white relative" style={{ color: `${profile.ui.accent}88` }}>
            <Bell size={20} />
            <div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full border-2" style={{ background: profile.ui.accent, borderColor: profile.ui.bgBottom }} />
          </button>
          <div className="flex items-center text-[#64677a] font-semibold text-sm cursor-pointer hover:text-white transition-colors">
            <span className="name-text font-bold" style={{ color: profile.ui.accent }}>{user.name}</span>
            <div className="surfboard-profile-outline mx-2.5 border-2 border-[#FF4500] shadow-[0_0_15px_#FF4500]" style={{ width: '28px', height: '46px' }}>
              <img src={user.avatar} className="surfboard-img" />
            </div>
            <ChevronDown size={10} style={{ color: profile.ui.accent }} />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="px-6 py-8 border-b" style={{ borderColor: `${profile.ui.accent}11` }}>
            <div className="text-[#5c5e6e] text-[15px] font-semibold mb-5 uppercase tracking-wider">Stories</div>
            <div className="space-y-5">
              {stories.map((story) => (
                <div key={story.id} className="flex items-center cursor-pointer group">
                  <div className="surfboard-profile-outline mr-4 group-hover:scale-110 transition-transform border-2 border-[#FF4500] shadow-[0_0_15px_#FF4500]" style={{ width: '36px', height: '60px' }}>
                    <img src={story.img} className="surfboard-img" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[15px] font-bold name-text truncate" style={{ color: profile.ui.accent }}>{story.name}</div>
                    <div className="text-[#595c6c] text-xs mt-1">{story.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="px-6 py-8">
            <div className="text-[#5c5e6e] text-[15px] font-semibold mb-5 uppercase tracking-wider">Contacts</div>
            <div className="space-y-5">
              {contacts.map((contact) => (
                <div key={contact.id} className="flex items-center cursor-pointer group">
                  <div className="surfboard-profile-outline mr-4 group-hover:scale-110 transition-transform border-2 border-[#FF4500] shadow-[0_0_15px_#FF4500]" style={{ width: '36px', height: '60px' }}>
                    <img src={contact.img} className="surfboard-img" />
                  </div>
                  <div className="flex-1 flex items-center justify-between">
                    <span className="text-[15px] font-medium" style={{ color: profile.ui.accent }}>{contact.name}</span>
                    <div className={`w-2 h-2 rounded-full ${contact.status === 'online' ? '' : 'opacity-30'}`} 
                         style={{ background: contact.status === 'online' ? profile.ui.accent : '#606a8d' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="h-[60px] border-t flex items-center px-4 sticky bottom-0" style={{ background: profile.ui.bgBottom, borderColor: `${profile.ui.accent}22` }}>
          <div className="relative flex-1">
            <input 
              type="text" 
              placeholder="Search" 
              className="w-full h-8 bg-transparent border-none pr-10 text-sm placeholder:text-[#5c5d71] focus:outline-none"
              style={{ color: profile.ui.accent }}
            />
            <div className="absolute right-0 top-1/2 -translate-y-1/2 flex space-x-3" style={{ color: profile.ui.accent }}>
              <Plus size={16} className="cursor-pointer hover:opacity-70" />
              <MoreHorizontal size={16} className="cursor-pointer hover:opacity-70" />
            </div>
          </div>
        </div>
      </div>

      {/* Overlay */}
      <AnimatePresence>
        {(leftSide || rightSide) && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => { setLeftSide(false); setRightSide(false); }}
            className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Global Floating AI Chat Widget */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-auto">
        <button
          onClick={() => setIsAiWidgetOpen(!isAiWidgetOpen)}
          className="w-14 h-14 rounded-full shadow-[0_0_20px_rgba(77,0,255,0.4)] flex items-center justify-center transition-all hover:scale-105 active:scale-95 z-50 relative"
          style={{ background: isAiWidgetOpen ? '#FF4500' : profile.ui.accent, color: isAiWidgetOpen ? '#fff' : '#000' }}
        >
          {isAiWidgetOpen ? <span className="text-xl font-bold">×</span> : <Bot size={28} />}
        </button>

        <AnimatePresence>
          {isAiWidgetOpen && (
            <motion.div 
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="absolute bottom-20 right-0 w-[400px] h-[600px] z-[40] rounded-2xl overflow-hidden glass shadow-2xl border"
              style={{ borderColor: `${profile.ui.accent}33` }}
            >
              <div className="absolute top-0 w-full h-full bg-[#0a0a0a]/90 backdrop-blur-3xl overflow-y-auto flex flex-col">
                <div className="p-4 border-b flex justify-between items-center flex-shrink-0" style={{ borderColor: `${profile.ui.accent}22`, background: `${profile.ui.accent}11` }}>
                  <div className="flex items-center space-x-2">
                    <Bot size={20} style={{ color: profile.ui.accent }} />
                    <span className="font-bold uppercase tracking-widest text-sm" style={{ color: profile.ui.accent }}>Global Trading Assistant</span>
                  </div>
                </div>
                <div className="flex-1 overflow-hidden relative">
                  <AILab />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
}
