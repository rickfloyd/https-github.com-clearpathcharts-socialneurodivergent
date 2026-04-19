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
  Bot,
  AlertTriangle,
  LogOut,
  Zap,
  Edit3,
  Link as LinkIcon,
  Book,
  Layout
} from 'lucide-react';
import { getFriendlyLocation } from '../services/locationService';
import { motion, AnimatePresence } from 'motion/react';
import { InterfaceProfile, UserProfile } from '../types';

interface DashboardProps {
  profile: InterfaceProfile;
  onProfileChange: (profileId: string) => void;
}

import { INTERFACE_PROFILES } from '../lib/interface/profiles';
import { useAuth } from '../contexts/FirebaseContext';
import { DailyLegalModal } from './DailyLegalModal';
import SEO from './SEO';

// Lazy load sub-components
const NewsTerminal = lazy(() => import('./NewsTerminal'));
const TradingJournal = lazy(() => import('./TradingJournal'));
const MarketAssetsList = lazy(() => import('./MarketAssetsList'));
const LegalFooter = lazy(() => import('./LegalFooter'));
const Timeline = lazy(() => import('./Timeline'));
const LiveChart = lazy(() => import('./LiveChart'));
const About = lazy(() => import('./About'));
const InterfaceOptimizationHub = lazy(() => import('./InterfaceOptimizationHub'));
const SentinelContainer = lazy(() => import('./SentinelContainer'));
const CptBible = lazy(() => import('./CptBible'));
const AILab = lazy(() => import('./AILab'));
const Photos = lazy(() => import('./Photos'));
const TodoList = lazy(() => import('./TodoList'));
const TerminalSettings = lazy(() => import('./Settings'));
const ExecutivePerformance = lazy(() => import('./ExecutivePerformance').then(m => ({ default: m.ExecutivePerformance })));
const IntelligenceGateway = lazy(() => import('./dashboard/IntelligenceGateway').then(m => ({ default: m.IntelligenceGateway })));
const LightweightMarketUI = lazy(() => import('./markets/LightweightMarketUI').then(m => ({ default: m.LightweightMarketUI })));
const StandardMarketUI = lazy(() => import('./markets/StandardMarketUI').then(m => ({ default: m.StandardMarketUI })));
const VoiceAssistant = lazy(() => import('./VoiceAssistant').then(m => ({ default: m.VoiceAssistant })));

function TabLoading() {
  return (
    <div className="w-full h-full flex items-center justify-center p-12">
      <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export default function Dashboard({ profile: initialProfile, onProfileChange }: DashboardProps) {
  const profile = initialProfile || INTERFACE_PROFILES.standard_trader;
  const { 
    user: authUser, 
    userProfile, 
    updateUserImages, 
    updateIntro, 
    createPost, 
    posts, 
    toggleLike, 
    quotaExceeded, 
    retryConnection,
    logout
  } = useAuth();
  const [leftSide, setLeftSide] = useState(false);
  const [rightSide, setRightSide] = useState(false);
  const [activeTab, setActiveTab] = useState('Home');
  const [isAiWidgetOpen, setIsAiWidgetOpen] = useState(false);
  const [isEditingIntro, setIsEditingIntro] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [showMarketPulse, setShowMarketPulse] = useState(true);
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
          'market': 'Market',
          'standard': 'Standard',
          'interface hub': 'InterfaceHub',
          'clear path hub': 'InterfaceHub',
          'neurodivergent': 'InterfaceHub',
          'journal': 'Journal',
          'news': 'news',
          'photos': 'Photos',
          'settings': 'Settings',
          'biography': 'Biography',
          'ai lab': 'AI Lab',
          'intelligence lab': 'AI Lab'
        };
        const mappedTarget = targetMap[target.toLowerCase()] || target;
        setActiveTab(mappedTarget);
      }
    };
    window.addEventListener('app-command', handleCommand);
    return () => window.removeEventListener('app-command', handleCommand);
  }, []);
  
  const user = {
    name: userProfile?.displayName || authUser?.displayName || 'TRADES USER',
    avatar: userProfile?.photoURL || authUser?.photoURL || 'https://picsum.photos/seed/profile/150/150',
    cover: userProfile?.coverURL || 'https://images.unsplash.com/photo-1508247967583-7d982ea01526?ixlib=rb-1.2.1&auto=format&fit=crop&w=2250&q=80',
    email: authUser?.email,
    intro: userProfile?.intro || { bio: '', location: '', company: '' }
  };

  const handleLogout = async () => {
    await logout();
  };

  const compressImage = (base64: string, maxWidth = 800, quality = 0.7): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = (maxWidth / width) * height;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        } else {
          resolve(base64);
        }
      };
      img.onerror = () => resolve(base64);
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'cover') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      let base64 = reader.result as string;
      // Auto-compress high-res uploads to fit within Firestore limits
      if (base64.length > 300000) { 
        console.log('[Dashboard] Compressing high-res upload...');
        base64 = await compressImage(base64);
      }
      await updateUserImages({ [type]: base64 });
    };
    reader.readAsDataURL(file);
  };

  const handleImageUrlPrompt = async (type: 'avatar' | 'cover') => {
    const promptMsg = type === 'avatar' ? 'Enter Avatar URL (Direct Image or GIF Link):' : 'Enter Banner URL (Direct Image or GIF Link):';
    const currentUrl = type === 'avatar' ? user.avatar : user.cover;
    const url = window.prompt(promptMsg, currentUrl || '');
    
    if (url !== null && url.trim() !== '') {
      await updateUserImages({ [type]: url });
    }
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
    { id: 'Home', icon: TrendingUp, label: 'MARKET HUB' },
    { id: 'InterfaceHub', icon: Brain, label: 'NEURODIVERGENCE HUB' },
    { id: 'Intelligence', icon: MessageSquare, label: 'INTELLECTUAL FEED' },
    { id: 'Biography', icon: Bot, label: 'NEURAL IDENTITY' },
    { id: 'Sentinel', icon: Shield, label: 'NEURAL ASSAILLANT' },
    { id: 'Journal', icon: BookOpen, label: 'TRADING JOURNAL' },
    { id: 'Tasks', icon: Layout, label: 'TACTICAL TASKS' },
    { id: 'AILab', icon: Zap, label: 'LAVA INTERNATIONAL LAB' },
    { id: 'CptBible', icon: Book, label: 'THE CPT BIBLE' },
    { id: 'Settings', icon: SettingsIcon, label: 'SYSTEM SETTINGS' },
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

  const getSeoData = () => {
    switch (activeTab) {
      case 'Home':
        return { title: 'Market Hub', description: 'Institutional market data terminal and live trading charts.' };
      case 'Sentinel':
        return { title: 'Neural Sentinel', description: 'Advanced trading safety systems and security protocols.' };
      case 'Intelligence':
        return { title: 'Intelligence Feed', description: 'Curated institutional financial intelligence and news.' };
      case 'Journal':
        return { title: 'Trading Journal', description: 'Comprehensive trade logging and performance analysis.' };
      case 'AILab':
        return { title: 'Intelligence Lab', description: 'LLM-powered financial extraction and AI market research.' };
      case 'CptBible':
        return { title: 'The CPT Bible', description: 'ClearPath Trader core pillars and regulatory boundaries.' };
      case 'Settings':
        return { title: 'System Settings', description: 'Configure your institutional interface and profile.' };
      default:
        return { title: activeTab };
    }
  };

  const seoData = getSeoData();

  return (
    <div 
      className="flex w-full h-[100dvh] overflow-hidden text-[#ccc8db] font-sans selection:bg-indigo-500 selection:lava-hot-text transition-colors duration-1000"
      style={{ background: profile.ui.bgTop }}
    >
      <SEO title={seoData.title} description={seoData.description} />
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
          className="flex items-center px-6 h-[80px] border-b border-[#ffffff08] sticky top-0 z-10 cursor-pointer hover:opacity-80 transition-opacity" 
          onClick={() => setActiveTab('Home')}
        >
          <div className="flex items-center space-x-3">
            <div className={`w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30 transition-all duration-300 ${!leftSide && 'lg:scale-0 lg:opacity-0'}`}>
              <Brain className="text-indigo-400" size={18} />
            </div>
            <div className={`transition-all duration-300 ${!leftSide && 'lg:rotate-180 lg:[writing-mode:vertical-lr] lg:ml-[-5px]'}`}>
              <div className="font-black tracking-tighter text-[11px] leading-tight text-white uppercase italic">
                CLEARPATH TRADER
              </div>
              <div className="text-[7px] font-bold tracking-[0.3em] text-[#5c5e6e] uppercase mt-0.5">
                INSTITUTIONAL
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Toggle button removed per user request to avoid covering other buttons */}

        <div className={`flex-1 overflow-y-auto custom-scrollbar px-4 py-8 transition-opacity duration-300 ${!leftSide && 'lg:opacity-0 lg:pointer-events-none'}`}>
          <div className="text-[#5c5e6e] text-[8px] font-black mb-6 uppercase tracking-[0.3em] px-4">
            Institutional Navigation
          </div>
          <nav className="flex flex-col space-y-2">
            {menuItems.map((item) => (
              <button 
                key={item.id} 
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center px-4 py-3 rounded-xl transition-all group relative overflow-hidden ${
                  activeTab === item.id 
                    ? 'bg-indigo-500/10 text-white' 
                    : 'text-[#9c9cab] hover:text-white hover:bg-white/5'
                }`}
              >
                {activeTab === item.id && (
                  <motion.div 
                    layoutId="sidebar-accent"
                    className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-indigo-500 rounded-r-full shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                  />
                )}
                <item.icon size={16} className={`mr-4 transition-transform duration-300 group-hover:scale-110 ${activeTab === item.id ? 'text-indigo-400' : ''}`} />
                <span className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap">{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="mt-auto pt-10">
            <div className="space-y-3">
              <button 
                onClick={() => logout()}
                className="w-full flex items-center px-4 py-4 rounded-xl border border-red-500/10 bg-red-500/5 text-red-500/80 hover:bg-red-500 hover:text-black transition-all group"
              >
                <LogOut size={16} className="mr-3 transition-transform group-hover:-translate-x-1" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Logout Session</span>
              </button>

              <button 
                onClick={() => setShowMarketPulse(!showMarketPulse)}
                className="w-full flex items-center justify-between px-4 py-3 rounded-lg border border-[#ffffff10] bg-[#ffffff05] hover:bg-[#ffffff08] group transition-all"
              >
                <div className="flex items-center">
                  <Activity size={12} className="mr-3 text-indigo-500" />
                  <span className="text-[8px] font-bold uppercase tracking-widest text-[#5c5e6e]">Modulate Stream</span>
                </div>
                <div className={`w-8 h-4 rounded-full border border-[#ffffff20] relative transition-colors duration-300 ${showMarketPulse ? 'bg-indigo-500/20' : 'bg-black'}`}>
                  <motion.div 
                    animate={{ x: showMarketPulse ? 16 : 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    className={`absolute left-1 top-1 w-2 h-2 rounded-full shadow-lg ${showMarketPulse ? 'bg-indigo-400 shadow-indigo-500/50' : 'bg-gray-600'}`} 
                  />
                </div>
              </button>

              <div className="px-4 py-6 space-y-2">
                <div className="flex justify-between items-center text-[7px] font-black uppercase tracking-[0.3em] text-[#5c5e6e]">
                  <span>System Utilization</span>
                  <span className="text-orange-500">Performance: 67%</span>
                </div>
                <div className="h-1 bg-black rounded-full overflow-hidden border border-[#ffffff10]">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '67%' }}
                    className="h-full bg-gradient-to-r from-orange-500 to-red-600 shadow-[0_0_10px_rgba(249,115,22,0.3)]"
                  />
                </div>
              </div>

              <div className="px-4 pb-4">
                <div className="flex items-center space-x-2 text-[6px] font-black uppercase tracking-[0.4em] text-indigo-500/50">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse shadow-[0_0_5px_rgba(99,102,241,0.8)]" />
                  <span>Institutional Bridge: Cloud-Sync Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <a href="#" className="flex items-center h-[52px] px-5 border-t border-[#ffffff08] text-[#9c9cab] text-sm relative group overflow-hidden">
          <div className="flex items-center transition-transform duration-300 group-hover:translate-y-full">
            <Share2 size={16} className="mr-2" />
            ClearPath Protocol Access
          </div>
          <div className="absolute inset-0 bg-[#ffffff05] lava-hot-text flex items-center px-5 translate-y-[-100%] group-hover:translate-y-0 transition-transform duration-300">
            <img src={userProfile?.photoURL || authUser?.photoURL || ''} className="w-[26px] h-[26px] rounded-full mr-2 object-cover border border-[#ffffff20]" />
            <span className="text-[10px] font-black uppercase tracking-widest">{userProfile?.displayName || authUser?.displayName || 'EXECUTIVE'}</span>
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
                  onClick={() => setLeftSide(!leftSide)}
                  className="p-2 mr-2 rounded-lg transition-all hover:bg-white/5"
                  style={{ color: profile.ui.accent }}
                  title={leftSide ? "Collapse Sidebar" : "Expand Sidebar"}
                >
                  <Menu size={20} />
                </button>
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
              
              <div className="absolute top-4 right-4 z-20 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => handleImageUrlPrompt('cover')}
                  className="flex items-center space-x-2 bg-black/40 hover:bg-black/60 backdrop-blur-md px-3 py-2 rounded-lg cursor-pointer transition-all border border-indigo-500/20 text-white"
                >
                  <LinkIcon size={14} className="text-white" />
                  <span className="text-[10px] font-black uppercase tracking-widest">URL/GIF</span>
                </button>
                <label className="flex items-center space-x-2 bg-black/40 hover:bg-black/60 backdrop-blur-md px-3 py-2 rounded-lg cursor-pointer transition-all border"
                       style={{ color: profile.ui.accent, borderColor: `${profile.ui.accent}33` }}>
                  <ImageIcon size={14} />
                  <span className="text-[10px] font-black uppercase tracking-widest lava-hot-text">Upload</span>
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
                   <div className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30 px-4">
                     Identity Header Active // Use Sidebar for Navigation
                   </div>
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
                  
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 surfboard-profile-outline opacity-0 group-hover/avatar:opacity-100 transition-opacity flex-col space-y-2 z-20" style={{ width: '100%', height: '100%', padding: 0 }}>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleImageUrlPrompt('avatar'); }}
                      className="p-2 bg-indigo-500 rounded-full text-white hover:scale-110 transition-all shadow-lg"
                      title="Link GIF/Photo"
                    >
                      <LinkIcon size={16} />
                    </button>
                    <label 
                      className="p-2 bg-white rounded-full text-black cursor-pointer hover:scale-110 transition-all shadow-lg"
                      title="Upload Photo"
                    >
                      <ImageIcon size={16} />
                      <input 
                        type="file" 
                        className="hidden" 
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, 'avatar')}
                      />
                    </label>
                  </div>
                </div>
                <div className="ml-6 mb-8">
                  <h2 className="text-4xl font-black tracking-tighter uppercase italic flex items-center gap-2" style={{ color: profile.ui.accent }}>
                    {user.name} <CheckCircle2 size={24} className="fill-indigo-500/20 text-indigo-500" />
                  </h2>
                  <p className="text-xs font-mono uppercase tracking-[0.3em] opacity-50" style={{ color: profile.ui.text }}>
                    Institutional Executive // ClearPath Bridge Active
                  </p>
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
                        System <span style={{ color: profile.ui.accent }}>Inventory</span>
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

            {activeTab === 'InterfaceHub' && (
              <motion.div 
                key="interface-hub"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <InterfaceOptimizationHub 
                  profile={profile} 
                  onProfileChange={onProfileChange} 
                  onNavigate={(tab) => {
                    const mapped = tab === 'interface-hub' || tab === 'neurodivergent' ? 'InterfaceHub' : tab;
                    setActiveTab(mapped);
                  }}
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
                <TradingJournal profile={profile} onBackToDashboard={() => setActiveTab('Home')} />
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

            {activeTab === 'CptBible' && (
              <motion.div 
                key="cpt-bible"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <CptBible profile={profile} />
              </motion.div>
            )}

            {activeTab === 'Intelligence' && (
              <motion.div 
                key="intelligence"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <IntelligenceGateway onNavigate={(tab) => setActiveTab(tab)} />
              </motion.div>
            )}

            {activeTab === 'AILab' && (
              <motion.div 
                key="ai-lab"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <AILab />
              </motion.div>
            )}

            {activeTab === 'Tasks' && (
              <motion.div 
                key="tasks"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <TodoList profile={profile} />
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

      {/* Daily Legal Acknowledgment */}
      <DailyLegalModal />

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
