import React, { useState, useEffect, useRef } from 'react';
import { InterfaceProfile, TradeEntry as Trade, JournalSettings as Settings } from '../types';
import { useAuth } from '../contexts/FirebaseContext';

interface TradingJournalProps {
  profile: InterfaceProfile;
  onBackToDashboard?: () => void;
}

import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement, 
  ArcElement, 
  Title, 
  Tooltip, 
  Legend, 
  Filler 
} from 'chart.js';
import { Line, Bar, Doughnut, Pie } from 'react-chartjs-2';
import { 
  TrendingUp, 
  DollarSign, 
  Filter, 
  Plus, 
  X, 
  Save, 
  Download, 
  Copy, 
  Trash2, 
  Calendar as CalendarIcon, 
  BarChart3, 
  Flame, 
  Clock, 
  Table as TableIcon, 
  Zap,
  ChevronLeft,
  ChevronRight,
  Maximize2
} from 'lucide-react';
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, getDay, addMonths, subMonths } from 'date-fns';
import LegalFooter from './LegalFooter';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'zh', name: 'Mandarin Chinese' },
  { code: 'hi', name: 'Hindi' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'ar', name: 'Arabic' },
  { code: 'bn', name: 'Bengali' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ru', name: 'Russian' },
  { code: 'ur', name: 'Urdu' },
  { code: 'id', name: 'Indonesian' },
  { code: 'de', name: 'German' },
  { code: 'ja', name: 'Japanese' },
  { code: 'pcm', name: 'Nigerian Pidgin' },
  { code: 'mr', name: 'Marathi' },
  { code: 'te', name: 'Telugu' },
  { code: 'tr', name: 'Turkish' },
  { code: 'ta', name: 'Tamil' },
  { code: 'yue', name: 'Yue Chinese' },
  { code: 'vi', name: 'Vietnamese' },
  { code: 'tl', name: 'Tagalog' },
  { code: 'wuu', name: 'Wu Chinese' },
  { code: 'ko', name: 'Korean' },
  { code: 'fa', name: 'Iranian Persian' },
  { code: 'ha', name: 'Hausa' },
];

const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'CHF', symbol: 'Fr', name: 'Swiss Franc' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  { code: 'HKD', symbol: 'HK$', name: 'Hong Kong Dollar' },
  { code: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar' },
  { code: 'SEK', symbol: 'kr', name: 'Swedish Krona' },
  { code: 'KRW', symbol: '₩', name: 'South Korean Won' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
  { code: 'NOK', symbol: 'kr', name: 'Norwegian Krone' },
  { code: 'MXN', symbol: '$', name: 'Mexican Peso' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'RUB', symbol: '₽', name: 'Russian Ruble' },
  { code: 'ZAR', symbol: 'R', name: 'South African Rand' },
  { code: 'TRY', symbol: '₺', name: 'Turkish Lira' },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real' },
  { code: 'TWD', symbol: 'NT$', name: 'New Taiwan Dollar' },
  { code: 'DKK', symbol: 'kr', name: 'Danish Krone' },
  { code: 'PLN', symbol: 'zł', name: 'Polish Zloty' },
  { code: 'THB', symbol: '฿', name: 'Thai Baht' },
  { code: 'IDR', symbol: 'Rp', name: 'Indonesian Rupiah' },
  { code: 'HUF', symbol: 'Ft', name: 'Hungarian Forint' },
  { code: 'CZK', symbol: 'Kč', name: 'Czech Koruna' },
  { code: 'ILS', symbol: '₪', name: 'Israeli New Shekel' },
  { code: 'CLP', symbol: '$', name: 'Chilean Peso' },
  { code: 'PHP', symbol: '₱', name: 'Philippine Peso' },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham' },
  { code: 'COP', symbol: '$', name: 'Colombian Peso' },
  { code: 'SAR', symbol: '﷼', name: 'Saudi Riyal' },
  { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit' },
  { code: 'RON', symbol: 'lei', name: 'Romanian Leu' },
];

export default function TradingJournal({ profile, onBackToDashboard }: TradingJournalProps) {
  const { user, trades, journalSettings, addTrade, updateTrade, deleteTrade, updateJournalSettings } = useAuth();

  const settings = journalSettings || {
    startingCapital: 10000,
    riskPercent: 1,
    currencySymbol: "$",
    currencyCode: "USD",
    language: "en",
  };

  const setSettings = (newSettings: Partial<Settings>) => {
    updateJournalSettings(newSettings);
  };

  const [activeView, setActiveView] = useState('overview');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    pair: '',
    timeframe: '',
    direction: '',
    outcome: '',
    session: ''
  });
  const [calDate, setCalDate] = useState(new Date());
  const [selectedDayTrades, setSelectedDayTrades] = useState<Trade[] | null>(null);
  const [selectedDayKey, setSelectedDayKey] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    pair: '',
    direction: 'long' as 'long' | 'short',
    timeframe: 'H1',
    entry: '',
    sl: '',
    tp: '',
    rr: '',
    resultR: '',
    screenshot: '',
    emotion: 'Calm',
    outcome: 'good' as 'good' | 'bad',
    notes: ''
  });

  // Helpers
  const getSession = (dateStr: any) => {
    const d = dateStr?.toDate ? dateStr.toDate() : (typeof dateStr === 'string' ? new Date(dateStr) : new Date());
    const h = d.getHours();
    if (h >= 0 && h < 8) return "Asian";
    if (h >= 8 && h < 13) return "London";
    if (h >= 13 && h < 22) return "New York";
    return "Off-hours";
  };

  const getFilteredTrades = () => {
    return trades.filter(t => {
      const createdAt = t.createdAt?.toDate ? t.createdAt.toDate().toISOString() : t.createdAt;
      if (filters.pair && t.pair.toUpperCase() !== filters.pair.toUpperCase()) return false;
      if (filters.timeframe && t.timeframe !== filters.timeframe) return false;
      if (filters.direction && t.direction !== filters.direction) return false;
      if (filters.outcome && t.outcome !== filters.outcome) return false;
      if (filters.session && getSession(t.createdAt) !== filters.session) return false;
      return true;
    });
  };

  const getResultR = (t: Trade) => {
    if (t.resultR !== null) return t.resultR;
    if (t.outcome === 'good') return t.rr || 1;
    return -1;
  };

  const filteredTrades = getFilteredTrades();

  // Stats Calculation
  const metrics = (() => {
    const sorted = [...filteredTrades].sort((a, b) => {
      const da = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : new Date(a.createdAt).getTime();
      const db = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : new Date(b.createdAt).getTime();
      return da - db;
    });
    let equity = settings.startingCapital;
    let peak = settings.startingCapital;
    let maxDD = 0;
    const equitySeries: number[] = [equity];
    const ddSeries: number[] = [0];
    const labels: string[] = ['Start'];

    sorted.forEach((t, i) => {
      const r = getResultR(t);
      const tradeReturnPct = r * settings.riskPercent;
      const change = equity * (tradeReturnPct / 100);
      equity += change;
      if (equity > peak) peak = equity;
      const dd = peak > 0 ? ((equity - peak) / peak) * 100 : 0;
      if (dd < maxDD) maxDD = dd;
      equitySeries.push(equity);
      ddSeries.push(dd);
      labels.push((i + 1).toString());
    });

    return {
      equitySeries,
      ddSeries,
      labels,
      currentEquity: equity,
      totalReturnPct: settings.startingCapital > 0 ? ((equity - settings.startingCapital) / settings.startingCapital) * 100 : 0,
      maxDD
    };
  })();

  // Handlers
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const entry = parseFloat(formData.entry);
    const sl = parseFloat(formData.sl);
    const tp = parseFloat(formData.tp);
    
    let rr = parseFloat(formData.rr);
    if (isNaN(rr)) {
      const risk = Math.abs(entry - sl);
      const reward = Math.abs(tp - entry);
      rr = risk > 0 ? +(reward / risk).toFixed(2) : 1;
    }

    const newTrade: Trade = {
      id: editingId || crypto.randomUUID(),
      uid: user?.uid || '',
      createdAt: editingId ? (trades.find(t => t.id === editingId)?.createdAt || new Date().toISOString()) : new Date().toISOString(),
      pair: formData.pair.toUpperCase(),
      direction: formData.direction,
      timeframe: formData.timeframe,
      entry,
      sl,
      tp,
      rr,
      resultR: formData.resultR ? parseFloat(formData.resultR) : null,
      outcome: formData.outcome,
      emotion: formData.emotion,
      screenshot: formData.screenshot,
      notes: formData.notes
    };

    if (editingId) {
      updateTrade(editingId, newTrade);
      setEditingId(null);
    } else {
      addTrade(newTrade);
    }

    setFormData({
      pair: '',
      direction: 'long',
      timeframe: 'H1',
      entry: '',
      sl: '',
      tp: '',
      rr: '',
      resultR: '',
      screenshot: '',
      emotion: 'Calm',
      outcome: 'good',
      notes: ''
    });
  };

  const handleEdit = (trade: Trade) => {
    setEditingId(trade.id);
    setFormData({
      pair: trade.pair,
      direction: trade.direction,
      timeframe: trade.timeframe,
      entry: trade.entry.toString(),
      sl: trade.sl.toString(),
      tp: trade.tp.toString(),
      rr: trade.rr?.toString() || '',
      resultR: trade.resultR?.toString() || '',
      screenshot: trade.screenshot,
      emotion: trade.emotion,
      outcome: trade.outcome,
      notes: trade.notes
    });
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this trade?')) {
      deleteTrade(id);
    }
  };

  const handleClearAll = () => {
    if (confirm('DELETE ALL TRADES? This cannot be undone.')) {
      trades.forEach(t => deleteTrade(t.id!));
    }
  };

  const exportCSV = () => {
    if (trades.length === 0) return;
    const headers = Object.keys(trades[0]).join(',');
    const rows = trades.map(t => Object.values(t).map(v => `"${v}"`).join(',')).join('\n');
    const csv = `${headers}\n${rows}`;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'fxsika_journal.csv';
    a.click();
  };

  const syncToCalendar = () => {
    if (trades.length === 0) {
      alert("No trades to sync.");
      return;
    }
    
    let icsContent = "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//ClearPath//TradeJournal//EN\n";
    
    trades.forEach(t => {
      const date = t.createdAt?.toDate ? t.createdAt.toDate() : parseISO(t.createdAt);
      const startStr = format(date, "yyyyMMdd'T'HHmmss'Z'");
      const endStr = format(new Date(date.getTime() + 3600000), "yyyyMMdd'T'HHmmss'Z'"); // 1 hour duration
      
      icsContent += "BEGIN:VEVENT\n";
      icsContent += `SUMMARY:Trade: ${t.pair} (${t.direction.toUpperCase()})\n`;
      icsContent += `DTSTART:${startStr}\n`;
      icsContent += `DTEND:${endStr}\n`;
      icsContent += `DESCRIPTION:Entry: ${t.entry}\\nSL: ${t.sl}\\nTP: ${t.tp}\\nResult: ${getResultR(t)}R\\nNotes: ${t.notes.replace(/\n/g, '\\n')}\n`;
      icsContent += "END:VEVENT\n";
    });
    
    icsContent += "END:VCALENDAR";
    
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'trading_journal_sync.ics');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Charts Config
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#000',
        titleColor: '#4D00FF',
        bodyColor: '#fff',
        borderColor: '#4D00FF',
        borderWidth: 1
      }
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#666', font: { size: 10 } } },
      y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#666', font: { size: 10 } } }
    }
  };

  const equityData = {
    labels: metrics.labels,
    datasets: [{
      label: 'Equity',
      data: metrics.equitySeries,
      borderColor: '#39FF14',
      backgroundColor: 'rgba(57, 255, 20, 0.1)',
      fill: true,
      tension: 0.4,
      pointRadius: 2
    }]
  };

  const ddData = {
    labels: metrics.labels,
    datasets: [{
      label: 'Drawdown %',
      data: metrics.ddSeries,
      borderColor: '#FF3131',
      backgroundColor: 'rgba(255, 49, 49, 0.1)',
      fill: true,
      tension: 0.4,
      pointRadius: 0
    }]
  };

  const winLossData = {
    labels: ['Good Setup', 'Bad Setup'],
    datasets: [{
      data: [
        filteredTrades.filter(t => t.outcome === 'good').length,
        filteredTrades.filter(t => t.outcome === 'bad').length
      ],
      backgroundColor: ['#39FF14', '#FF3131'],
      borderWidth: 0
    }]
  };

  // Calendar Logic
  const monthStart = startOfMonth(calDate);
  const monthEnd = endOfMonth(calDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDay = getDay(monthStart); // 0 = Sunday
  const padding = Array(startDay === 0 ? 6 : startDay - 1).fill(null);

  const getDayStats = (day: Date) => {
    const dayKey = format(day, 'yyyy-MM-dd');
    const dayTrades = trades.filter(t => {
      const d = t.createdAt?.toDate ? t.createdAt.toDate() : parseISO(t.createdAt);
      return format(d, 'yyyy-MM-dd') === dayKey;
    });
    if (dayTrades.length === 0) return null;
    const sumR = dayTrades.reduce((acc, t) => acc + getResultR(t), 0);
    return { trades: dayTrades, sumR };
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        {onBackToDashboard && (
          <button 
            onClick={onBackToDashboard}
            className="p-2 hover:bg-white/5 rounded-full transition-colors"
            style={{ color: profile.ui.accent }}
          >
            <ChevronLeft size={24} />
          </button>
        )}
        <div className="flex-1 text-center space-y-2">
          <h1 className="text-2xl md:text-4xl font-black tracking-tighter uppercase italic text-[rgb(72,0,238)]">
            CLEAR PATH TRADE JOURNAL
          </h1>
          <p className="text-[rgb(72,0,238)] font-mono text-xs uppercase tracking-[0.3em] font-bold">
            Strategy Tester & Performance Analytics Protocol
          </p>
        </div>
        {onBackToDashboard && <div className="w-10" />} {/* Spacer to keep title centered */}
      </div>

      {/* Settings Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="small-component-card p-6 rounded-2xl bg-[#0a0a0a]">
          <div className="flex items-center space-x-3 mb-6">
            <DollarSign size={20} className="text-lava-magma" />
            <h3 className="font-bold uppercase tracking-tight text-[rgb(72,0,238)]">Account & Risk</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] text-[#FF4500] uppercase font-black tracking-widest">Capital</label>
              <input 
                type="number" 
                value={settings.startingCapital}
                onChange={e => setSettings({...settings, startingCapital: parseFloat(e.target.value) || 0})}
                className="w-full bg-black border-4 border-[rgb(77,0,255)] rounded-lg px-3 py-2 text-base font-black text-[#00FFFF] drop-shadow-[0_0_10px_rgba(255,105,180,0.8)] focus:ring-4 focus:ring-[rgb(77,0,255)] outline-none transition-all"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-[#FF4500] uppercase font-black tracking-widest">Risk %</label>
              <input 
                type="number" 
                value={settings.riskPercent}
                onChange={e => setSettings({...settings, riskPercent: parseFloat(e.target.value) || 0})}
                className="w-full bg-black border-4 border-[rgb(77,0,255)] rounded-lg px-3 py-2 text-base font-black text-[#00FFFF] drop-shadow-[0_0_10px_rgba(255,105,180,0.8)] focus:ring-4 focus:ring-[rgb(77,0,255)] outline-none transition-all"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-[#FF4500] uppercase font-black tracking-widest">Currency</label>
              <select 
                value={settings.currencyCode}
                onChange={e => {
                  const curr = CURRENCIES.find(c => c.code === e.target.value);
                  if (curr) {
                    setSettings({...settings, currencyCode: curr.code, currencySymbol: curr.symbol});
                  }
                }}
                className="w-full bg-black border-4 border-[rgb(77,0,255)] rounded-lg px-3 py-2 text-base font-black text-[#00FFFF] drop-shadow-[0_0_10px_rgba(255,105,180,0.8)] focus:ring-4 focus:ring-[rgb(77,0,255)] outline-none transition-all appearance-none"
              >
                {CURRENCIES.map(c => <option key={c.code} value={c.code} className="bg-black text-[#00FFFF]">{c.code} ({c.symbol})</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-[#FF4500] uppercase font-black tracking-widest">Language</label>
              <select 
                value={settings.language}
                onChange={e => setSettings({...settings, language: e.target.value})}
                className="w-full bg-black border-4 border-[rgb(77,0,255)] rounded-lg px-3 py-2 text-base font-black text-[#00FFFF] drop-shadow-[0_0_10px_rgba(255,105,180,0.8)] focus:ring-4 focus:ring-[rgb(77,0,255)] outline-none transition-all appearance-none"
              >
                {LANGUAGES.map(l => <option key={l.code} value={l.code} className="bg-black text-[#00FFFF]">{l.name}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-[#FF4500] uppercase font-black tracking-widest">Symbol Override</label>
              <input 
                type="text" 
                value={settings.currencySymbol}
                onChange={e => setSettings({...settings, currencySymbol: e.target.value})}
                className="w-full bg-black border-4 border-[rgb(77,0,255)] rounded-lg px-3 py-2 text-base font-black text-[#00FFFF] drop-shadow-[0_0_10px_rgba(255,105,180,0.8)] focus:ring-4 focus:ring-[rgb(77,0,255)] outline-none transition-all"
              />
            </div>
          </div>
        </div>

        <div className="small-component-card p-6 rounded-2xl bg-[#0a0a0a]">
          <div className="flex items-center space-x-3 mb-6">
            <Filter size={20} className="text-lava-magma" />
            <h3 className="font-bold uppercase tracking-tight text-[rgb(72,0,238)]">Data Filters</h3>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <select 
              value={filters.pair}
              onChange={e => setFilters({...filters, pair: e.target.value})}
              className="w-full bg-black border-4 border-[rgb(77,0,255)] rounded-lg px-3 py-2 text-sm font-black text-[#00FFFF] drop-shadow-[0_0_10px_rgba(255,105,180,0.8)] focus:ring-4 focus:ring-[rgb(77,0,255)] outline-none transition-all appearance-none uppercase"
            >
              <option value="" className="bg-black text-[#00FFFF]">All Pairs</option>
              {Array.from(new Set(trades.map(t => t.pair))).map(p => <option key={p} value={p} className="bg-black text-[#00FFFF]">{p}</option>)}
            </select>
            <select 
              value={filters.timeframe}
              onChange={e => setFilters({...filters, timeframe: e.target.value})}
              className="w-full bg-black border-4 border-[rgb(77,0,255)] rounded-lg px-3 py-2 text-sm font-black text-[#00FFFF] drop-shadow-[0_0_10px_rgba(255,105,180,0.8)] focus:ring-4 focus:ring-[rgb(77,0,255)] outline-none transition-all appearance-none uppercase"
            >
              <option value="" className="bg-black text-[#00FFFF]">All TF</option>
              {['M1', 'M5', 'M15', 'M30', 'H1', 'H4', 'D1', 'W1'].map(tf => <option key={tf} value={tf} className="bg-black text-[#00FFFF]">{tf}</option>)}
            </select>
            <select 
              value={filters.outcome}
              onChange={e => setFilters({...filters, outcome: e.target.value})}
              className="w-full bg-black border-4 border-[rgb(77,0,255)] rounded-lg px-3 py-2 text-sm font-black text-[#00FFFF] drop-shadow-[0_0_10px_rgba(255,105,180,0.8)] focus:ring-4 focus:ring-[rgb(77,0,255)] outline-none transition-all appearance-none uppercase"
            >
              <option value="" className="bg-black text-[#00FFFF]">All Outcomes</option>
              <option value="good" className="bg-black text-[#00FFFF]">Good Setup</option>
              <option value="bad" className="bg-black text-[#00FFFF]">Bad Setup</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Left Column: Form & Entries */}
        <div className="xl:col-span-5 space-y-8">
          <div className="neon-indigo-card p-6 rounded-3xl bg-[#0a0a0a]">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <Plus size={20} className="text-lava-magma" />
                <h3 className="font-bold uppercase tracking-tight text-[rgb(72,0,238)]">{editingId ? 'Edit Trade' : 'New Entry'}</h3>
              </div>
              {editingId && (
                <button onClick={() => setEditingId(null)} className="text-xs text-gray-500 hover:text-white">Cancel</button>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-[#FF4500] uppercase font-black tracking-widest">Pair</label>
                  <input 
                    required
                    value={formData.pair}
                    onChange={e => setFormData({...formData, pair: e.target.value})}
                    placeholder="e.g. EURUSD"
                    className="w-full bg-black border-4 border-[rgb(77,0,255)] rounded-lg px-3 py-2 text-base font-black text-[#00FFFF] drop-shadow-[0_0_10px_rgba(255,105,180,0.8)] focus:ring-4 focus:ring-[rgb(77,0,255)] outline-none transition-all uppercase placeholder:text-[#00FFFF]/50"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-[#FF4500] uppercase font-black tracking-widest">Direction</label>
                  <select 
                    value={formData.direction}
                    onChange={e => setFormData({...formData, direction: e.target.value as 'long' | 'short'})}
                    className="w-full bg-black border-4 border-[rgb(77,0,255)] rounded-lg px-3 py-2 text-base font-black text-[#00FFFF] drop-shadow-[0_0_10px_rgba(255,105,180,0.8)] focus:ring-4 focus:ring-[rgb(77,0,255)] outline-none transition-all appearance-none uppercase"
                  >
                    <option value="long" className="bg-black text-[#00FFFF]">Long (Buy)</option>
                    <option value="short" className="bg-black text-[#00FFFF]">Short (Sell)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-[#FF4500] uppercase font-black tracking-widest">Entry</label>
                  <input 
                    type="number" step="0.00001" required
                    value={formData.entry}
                    onChange={e => setFormData({...formData, entry: e.target.value})}
                    className="w-full bg-black border-4 border-[rgb(77,0,255)] rounded-lg px-3 py-2 text-base font-black text-[#00FFFF] drop-shadow-[0_0_10px_rgba(255,105,180,0.8)] focus:ring-4 focus:ring-[rgb(77,0,255)] outline-none transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-[#FF4500] uppercase font-black tracking-widest">SL</label>
                  <input 
                    type="number" step="0.00001" required
                    value={formData.sl}
                    onChange={e => setFormData({...formData, sl: e.target.value})}
                    className="w-full bg-black border-4 border-[rgb(77,0,255)] rounded-lg px-3 py-2 text-base font-black text-[#00FFFF] drop-shadow-[0_0_10px_rgba(255,105,180,0.8)] focus:ring-4 focus:ring-[rgb(77,0,255)] outline-none transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-[#FF4500] uppercase font-black tracking-widest">TP</label>
                  <input 
                    type="number" step="0.00001" required
                    value={formData.tp}
                    onChange={e => setFormData({...formData, tp: e.target.value})}
                    className="w-full bg-black border-4 border-[rgb(77,0,255)] rounded-lg px-3 py-2 text-base font-black text-[#00FFFF] drop-shadow-[0_0_10px_rgba(255,105,180,0.8)] focus:ring-4 focus:ring-[rgb(77,0,255)] outline-none transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-[#FF4500] uppercase font-black tracking-widest">Result R (Optional)</label>
                  <input 
                    type="number" step="0.1"
                    value={formData.resultR}
                    onChange={e => setFormData({...formData, resultR: e.target.value})}
                    placeholder="+2.5 or -1"
                    className="w-full bg-black border-4 border-[rgb(77,0,255)] rounded-lg px-3 py-2 text-base font-black text-[#00FFFF] drop-shadow-[0_0_10px_rgba(255,105,180,0.8)] focus:ring-4 focus:ring-[rgb(77,0,255)] outline-none transition-all placeholder:text-[#00FFFF]/50"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-[#FF4500] uppercase font-black tracking-widest">Outcome</label>
                  <select 
                    value={formData.outcome}
                    onChange={e => setFormData({...formData, outcome: e.target.value as 'good' | 'bad'})}
                    className="w-full bg-black border-4 border-[rgb(77,0,255)] rounded-lg px-3 py-2 text-base font-black text-[#00FFFF] drop-shadow-[0_0_10px_rgba(255,105,180,0.8)] focus:ring-4 focus:ring-[rgb(77,0,255)] outline-none transition-all appearance-none uppercase"
                  >
                    <option value="good" className="bg-black text-[#00FFFF]">Good (Followed Plan)</option>
                    <option value="bad" className="bg-black text-[#00FFFF]">Bad (Rule Break)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-[#FF4500] uppercase font-black tracking-widest">Notes</label>
                <textarea 
                  value={formData.notes}
                  onChange={e => setFormData({...formData, notes: e.target.value})}
                  className="w-full bg-black border-4 border-[#FF4500] rounded-lg px-3 py-2 text-base font-black text-[#00FFFF] drop-shadow-[0_0_10px_#00FFFF] focus:ring-4 focus:ring-[#00FFFF] outline-none transition-all h-20 resize-none placeholder:text-[#00FFFF]/50"
                  placeholder="Confluence, mistakes, insights..."
                />
              </div>

              <button 
                type="submit"
                className="w-full py-3 rounded-xl font-bold uppercase tracking-widest text-xs transition-all bg-[#4D00FF] text-white shadow-[0_0_20px_rgba(77,0,255,0.3)] hover:bg-[rgb(72,0,238)] hover:shadow-[0_0_20px_rgba(72,0,238,0.3)]"
              >
                <span className="lava-hot-text">{editingId ? 'Save Protocol' : 'Initialize Entry'}</span>
              </button>
            </form>
          </div>

          <div className="neon-indigo-card rounded-3xl bg-[#0a0a0a] overflow-hidden">
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <h3 className="font-bold uppercase tracking-tight text-[rgb(72,0,238)]">Recent Entries</h3>
              <div className="flex space-x-2">
                <button onClick={exportCSV} className="p-2 hover:bg-[#4D00FF]/20 rounded-lg transition-colors text-[#4D00FF]"><Download size={16} /></button>
                <button onClick={handleClearAll} className="p-2 hover:bg-[rgb(72,0,238)]/20 rounded-lg transition-colors text-[rgb(72,0,238)]"><Trash2 size={16} /></button>
              </div>
            </div>
            <div className="overflow-x-auto custom-scrollbar max-h-[600px]">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-black sticky top-0 z-10">
                  <tr className="text-gray-500 uppercase">
                    <th className="p-4 text-[#FF4500]">Date</th>
                    <th className="p-4 text-[#FF4500]">Pair</th>
                    <th className="p-4 text-[#FF4500]">Dir</th>
                    <th className="p-4 text-[#FF4500]">R</th>
                    <th className="p-4 text-[#FF4500]">Outcome</th>
                    <th className="p-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredTrades.slice().reverse().map(t => (
                    <tr key={t.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-4 text-gray-500">
                        {(() => {
                          const d = t.createdAt?.toDate ? t.createdAt.toDate() : parseISO(t.createdAt);
                          return format(d, 'MM/dd');
                        })()}
                      </td>
                      <td className="p-4 font-bold symbol-text">{t.pair}</td>
                      <td className={`p-4 font-bold ${t.direction === 'long' ? 'text-green-500' : 'text-red-500'}`}>
                        {t.direction.toUpperCase()}
                      </td>
                      <td className={`p-4 font-bold ${getResultR(t) >= 0 ? 'price-text' : 'text-red-500'}`}>
                        {getResultR(t) > 0 ? '+' : ''}{getResultR(t)}
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded-full text-[8px] uppercase font-black ${t.outcome === 'good' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                          {t.outcome}
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <button onClick={() => handleEdit(t)} className="text-[#4D00FF] hover:text-[rgb(72,0,238)] transition-colors font-bold">Edit</button>
                        <button onClick={() => handleDelete(t.id)} className="text-[rgb(72,0,238)]/50 hover:text-[rgb(72,0,238)] transition-colors font-bold">Del</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Dashboard Tabs */}
        <div className="xl:col-span-7 space-y-8">
          <div className="flex space-x-2 bg-black p-1 rounded-full border border-white/5 w-fit">
            {['overview', 'calendar', 'heatmap', 'insights'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveView(tab)}
                className={`px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${
                  activeView === tab 
                    ? 'bg-[rgb(72,0,238)] text-white shadow-[0_0_15px_rgba(72,0,238,0.5)]' 
                    : 'text-[#4D00FF] hover:text-[rgb(72,0,238)] hover:bg-[rgb(72,0,238)]/10'
                }`}
              >
                <span className="lava-hot-text">{tab}</span>
              </button>
            ))}
          </div>

          {activeView === 'overview' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="small-component-card p-6 rounded-2xl bg-[#0a0a0a] space-y-2">
                  <p className="text-[10px] text-[#FF4500] uppercase font-bold">Total Trades</p>
                  <p className="text-3xl font-black italic">{filteredTrades.length}</p>
                </div>
                <div className="small-component-card p-6 rounded-2xl bg-[#0a0a0a] space-y-2">
                  <p className="text-[10px] text-[#FF4500] uppercase font-bold">Strike Rate</p>
                  <p className="text-3xl font-black italic price-text">
                    {filteredTrades.length ? ((filteredTrades.filter(t => getResultR(t) > 0).length / filteredTrades.length) * 100).toFixed(1) : 0}%
                  </p>
                </div>
                <div className="small-component-card p-6 rounded-2xl bg-[#0a0a0a] space-y-2">
                  <p className="text-[10px] text-[#FF4500] uppercase font-bold">Total Return</p>
                  <p className={`text-3xl font-black italic ${metrics.totalReturnPct >= 0 ? 'price-text' : 'text-red-500'}`}>
                    {metrics.totalReturnPct.toFixed(2)}%
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="small-component-card p-6 rounded-3xl bg-[#0a0a0a] h-[300px]">
                  <h4 className="text-xs font-bold uppercase tracking-widest mb-4 text-[rgb(72,0,238)]">Equity Curve</h4>
                  <div className="h-full pb-8">
                    <Line data={equityData} options={chartOptions} />
                  </div>
                </div>
                <div className="small-component-card p-6 rounded-3xl bg-[#0a0a0a] h-[300px]">
                  <h4 className="text-xs font-bold uppercase tracking-widest mb-4 text-[rgb(72,0,238)]">Drawdown %</h4>
                  <div className="h-full pb-8">
                    <Line data={ddData} options={chartOptions} />
                  </div>
                </div>
                <div className="small-component-card p-6 rounded-3xl bg-[#0a0a0a] h-[300px]">
                  <h4 className="text-xs font-bold uppercase tracking-widest mb-4 text-[rgb(72,0,238)]">Win vs Loss</h4>
                  <div className="h-full pb-8 flex items-center justify-center">
                    <Doughnut data={winLossData} options={{ ...chartOptions, cutout: '70%' }} />
                  </div>
                </div>
                <div className="small-component-card p-6 rounded-3xl bg-[#0a0a0a] h-[300px]">
                  <h4 className="text-xs font-bold uppercase tracking-widest mb-4 text-[rgb(72,0,238)]">Pair Performance</h4>
                  <div className="h-full pb-8">
                    <Bar 
                      data={{
                        labels: Array.from(new Set(filteredTrades.map(t => t.pair))),
                        datasets: [{
                          data: Array.from(new Set(filteredTrades.map(t => t.pair))).map(p => 
                            filteredTrades.filter(t => t.pair === p).reduce((acc, t) => acc + getResultR(t), 0)
                          ),
                          backgroundColor: '#4D00FF'
                        }]
                      }} 
                      options={chartOptions} 
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeView === 'calendar' && (
            <div className="space-y-6">
              <div className="text-center mb-4">
                <h2 className="text-xl font-black uppercase italic tracking-tighter text-[rgb(72,0,238)]">
                  Institutional Trade Calendar
                </h2>
              </div>
              <div className="neon-indigo-card p-6 rounded-3xl bg-gray-900/40 glass">
                <div className="flex items-center justify-between mb-8">
                  <button onClick={() => setCalDate(subMonths(calDate, 1))} className="p-2 hover:bg-white/5 rounded-full"><ChevronLeft size={20} /></button>
                  <div className="text-center">
                    <h3 className="text-xl font-black uppercase italic tracking-tighter text-[rgb(72,0,238)]">{format(calDate, 'MMMM yyyy')}</h3>
                    <button 
                      onClick={syncToCalendar}
                      className="mt-2 text-[10px] font-black uppercase tracking-widest text-indigo-400 hover:text-indigo-300 flex items-center justify-center space-x-1 mx-auto"
                    >
                      <CalendarIcon size={12} />
                      <span>Sync to Google/Outlook</span>
                    </button>
                  </div>
                  <button onClick={() => setCalDate(addMonths(calDate, 1))} className="p-2 hover:bg-white/5 rounded-full"><ChevronRight size={20} /></button>
                </div>

                <div className="grid grid-cols-7 gap-2 mb-8">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
                    <div key={d} className="text-center text-[10px] font-bold text-gray-600 uppercase mb-2">{d}</div>
                  ))}
                  {padding.map((_, i) => <div key={`pad-${i}`} />)}
                  {days.map(day => {
                    const stats = getDayStats(day);
                    const isToday = isSameDay(day, new Date());
                    return (
                      <div 
                        key={day.toISOString()}
                        onClick={() => {
                          if (stats) {
                            setSelectedDayTrades(stats.trades);
                            setSelectedDayKey(format(day, 'MMMM dd, yyyy'));
                          }
                        }}
                        className={`aspect-square rounded-xl border-2 p-2 flex flex-col justify-between transition-all cursor-pointer ${
                          stats ? 'border-[#FF4500]' : 'border-[#FF4500]/20 opacity-40'
                        } ${isToday ? 'ring-4 ring-[#FF4500] shadow-[0_0_20px_#FF4500]' : ''}`}
                        style={{ borderColor: stats ? '#FF4500' : undefined }}
                      >
                        <span className="text-2xl font-black text-[#00FFFF] drop-shadow-[0_0_8px_#00FFFF]">{format(day, 'd')}</span>
                        {stats && (
                          <div className="text-center">
                            <p className={`text-xs font-black ${stats.sumR >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                              {stats.sumR > 0 ? '+' : ''}{stats.sumR.toFixed(1)}R
                            </p>
                            <p className="text-[10px] text-gray-400 font-bold">{stats.trades.length} Trades</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Economic Calendar Widget Integrated */}
                <div className="border-t border-white/5 pt-8">
                  <h4 className="text-xs font-bold uppercase tracking-widest mb-6 text-[rgb(72,0,238)] flex items-center">
                    <div className="w-1 h-4 bg-lava-magma mr-2" />
                    Economic Calendar (Myfxbook)
                  </h4>
                  <div className="w-full h-[600px] bg-black/20 rounded-2xl overflow-hidden">
                    <iframe 
                      src="https://widget.myfxbook.com/widget/calendar.html?lang=en&impacts=0,1,2,3&countries=Afghanistan,Albania,Algeria,American%20Samoa,Andorra,Angola,Anguilla,Antarctica,Antigua%20and%20Barbuda,Argentina,Armenia,Aruba,Australia,Austria,Azerbaijan,Bahamas,Bahrain,Bangladesh,Barbados,Belarus,Belgium,Belize,Benin,Bermuda,Bhutan,Bolivia,Bonaire,Bosnia%20And%20Herzegovina,Botswana,Bouvet%20Island,Brazil,British%20Indian%20Ocean%20Territory,British%20Virgin%20Islands,Brunei,Bulgaria,Burkina%20Faso,Burundi,Cambodia,Cameroon,Canada,Cape%20Verde,Cayman%20Islands,Central%20African%20Republic,Chad,Chile,China,Christmas%20Island,Cocos%20Keeling%20Islands,Colombia,Comoros,Congo,Cook%20Islands,Costa%20Rica,Croatia,Cuba,Curacao,Cyprus,Czech%20Republic,Denmark,Djibouti,Dominica,Dominican%20Republic,East%20Timor,Ecuador,Egypt,El%20Salvador,Equatorial%20Guinea,Eritrea,Estonia,Ethiopia,Euro%20Area,European%20Union,FS%20Micronesia,Falkland%20Islands,Faroe%20Islands,Fiji,Finland,France,French%20Guiana,French%20Polynesia,French%20Southern%20and%20Antarctic%20Lands,Gabon,Gambia,Georgia,Germany,Ghana,Gibraltar,Greece,Greenland,Grenada,Guadeloupe,Guam,Guatemala,Guernsey,Guinea,Guinea%20Bissau,Guyana,Haiti,Heard%20Island%20and%20McDonald%20Islands,Honduras,Hong%20Kong,Hungary,Iceland,India,Indonesia,Iran,Iraq,Ireland,Isle%20of%20Man,Israel,Italy,Ivory%20Coast,Jamaica,Japan,Jersey,Jordan,Kazakhstan,Kenya,Kiribati,Kuwait,Kyrgyzstan,Laos,Latvia,Lebanon,Lesotho,Liberia,Libya,Liechtenstein,Lithuania,Luxembourg,Macau,Macedonia,Madagascar,Malawi,Malaysia,Maldives,Mali,Malta,Marshall%20Islands,Martinique,Mauritania,Mauritius,Mayotte,Mexico,Micronesia,Moldova,Monaco,Mongolia,Montenegro,Montserrat,Morocco,Mozambique,Myanmar,Namibia,Nauru,Nepal,Netherlands,New%20Caledonia,New%20Zealand,Nicaragua,Niger,Nigeria,Niue,Norfolk%20Island,North%20Korea,Northern%20Mariana%20Islands,Norway,Oman,Pakistan,Palau,Palestine,Panama,Papua%20New%20Guinea,Paraguay,Peru,Philippines,Pitcairn%20Islands,Poland,Portugal,Puerto%20Rico,Qatar,Republic%20of%20Kosovo,Republic%20of%20the%20Congo,Reunion,Romania,Russia,Rwanda,Saint%20Barth%C3%A9lemy,Saint%20Lucia,Saint%20Maarten,Saint%20Martin%20(French%20part),Samoa,San%20Marino,Sao%20Tome%20And%20Principe,Saudi%20Arabia,Senegal,Serbia,Seychelles,Sierra%20Leone,Singapore,Slovakia,Slovenia,Solomon%20Islands,Somalia,South%20Africa,South%20Georgia%20and%20the%20South%20Sandwich%20Islands,South%20Korea,South%20Sudan,Spain,Sri%20Lanka,St%20Helena,St%20Kitts%20and%20Nevis,St%20Lucia,St%20Pierre%20and%20Miquelon,St%20Vincent%20and%20the%20Grenadines,Sudan,Suriname,Svalbard%20and%20Jan%20Mayen,Swaziland,Sweden,Switzerland,Syria,Taiwan,Tajikistan,Tanzania,Thailand,Togo,Tokelau,Tonga,Trinidad%20And%20Tobago,Tunisia,Turkey,Turkmenistan,Turks%20and%20Caicos%20Isds,Tuvalu,Uganda,Ukraine,United%20Arab%20Emirates,United%20Kingdom,United%20States,United%20States%20Minor%20Outlying%20Islands,Uruguay,Uzbekistan,Vanuatu,Vatican%20City%20State,Venezuela,Vietnam,Virgin%20Islands,Wallis%20and%20Futuna,Western%20Sahara,Yemen,Zambia,Zimbabwe,%C3%85land%20Islands" 
                      style={{ border: 0, width: '100%', height: '100%' }} 
                    />
                  </div>
                </div>
              </div>

              {selectedDayTrades && (
                <div className="small-component-card p-6 rounded-3xl bg-[#0a0a0a] animate-in fade-in slide-in-from-bottom-4 glass">
                  <div className="flex items-center justify-between mb-6">
                    <h4 className="font-bold uppercase tracking-tight">Trades for {selectedDayKey}</h4>
                    <button onClick={() => setSelectedDayTrades(null)}><X size={16} /></button>
                  </div>
                  <div className="space-y-4">
                    {selectedDayTrades.map(t => (
                      <div key={t.id} className="flex items-center justify-between p-4 bg-black rounded-xl border border-white/5">
                        <div className="flex items-center space-x-4">
                          <div className={`w-2 h-2 rounded-full ${t.direction === 'long' ? 'bg-green-500' : 'bg-red-500'}`} />
                          <div>
                            <p className="font-bold symbol-text">{t.pair}</p>
                            <p className="text-[10px] text-gray-500 uppercase">{t.timeframe} // {getSession(t.createdAt)}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-black ${getResultR(t) >= 0 ? 'price-text' : 'text-red-500'}`}>
                            {getResultR(t) > 0 ? '+' : ''}{getResultR(t)}R
                          </p>
                          <p className="text-[10px] text-gray-500 uppercase">{t.outcome}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeView === 'heatmap' && (
            <div className="neon-indigo-card p-6 rounded-3xl bg-[#0a0a0a] h-[500px] glass">
              <h4 className="text-xs font-bold uppercase tracking-widest mb-8 text-gray-500">Daily P&L Heatmap</h4>
              <div className="h-full pb-12">
                <Bar 
                  data={{
                    labels: Array.from(new Set(filteredTrades.map(t => format(parseISO(t.createdAt), 'MMM dd')))),
                    datasets: [{
                      label: 'Daily Return %',
                      data: Array.from(new Set(filteredTrades.map(t => format(parseISO(t.createdAt), 'MMM dd')))).map(date => {
                        const dayTrades = filteredTrades.filter(t => format(parseISO(t.createdAt), 'MMM dd') === date);
                        return dayTrades.reduce((acc, t) => acc + (getResultR(t) * settings.riskPercent), 0);
                      }),
                      backgroundColor: (context) => {
                        const val = context.raw as number;
                        return val >= 0 ? `rgba(57, 255, 20, ${Math.min(1, 0.2 + val/5)})` : `rgba(255, 49, 49, ${Math.min(1, 0.2 + Math.abs(val)/5)})`;
                      }
                    }]
                  }} 
                  options={chartOptions} 
                />
              </div>
            </div>
          )}

          {activeView === 'insights' && (
            <div className="space-y-6">
              <div className="neon-indigo-card p-8 rounded-3xl bg-[#0a0a0a] space-y-6 glass">
                <div className="flex items-center space-x-3">
                  <Zap size={24} className="text-lava-magma" />
                  <h3 className="text-2xl font-black uppercase italic tracking-tighter">Mentor Insights</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="small-component-card p-6 rounded-2xl bg-[#0a0a0a] space-y-2">
                    <p className="text-[10px] text-gray-500 uppercase font-bold">Top Performing Pair</p>
                    <p className="text-xl font-bold symbol-text">
                      {(() => {
                        const pairs = Array.from(new Set(filteredTrades.map(t => t.pair)));
                        const perf = pairs.map(p => ({
                          p,
                          r: filteredTrades.filter(t => t.pair === p).reduce((acc, t) => acc + getResultR(t), 0)
                        })).sort((a, b) => b.r - a.r);
                        return perf[0]?.p || 'N/A';
                      })()}
                    </p>
                  </div>

                  <div className="small-component-card p-6 rounded-2xl bg-[#0a0a0a] space-y-2">
                    <p className="text-[10px] text-gray-500 uppercase font-bold">Psychological Edge</p>
                    <p className="text-gray-300 text-sm leading-relaxed">
                      {filteredTrades.length < 5 ? 
                        "Insufficient data for psychological profiling. Log more trades to unlock insights." :
                        `You have a ${((filteredTrades.filter(t => t.outcome === 'good').length / filteredTrades.length) * 100).toFixed(0)}% discipline rate. Your average win is ${
                          (filteredTrades.filter(t => getResultR(t) > 0).reduce((acc, t) => acc + getResultR(t), 0) / (filteredTrades.filter(t => getResultR(t) > 0).length || 1)).toFixed(2)
                        }R.`
                      }
                    </p>
                  </div>

                  <div className="small-component-card p-6 rounded-2xl bg-[#0a0a0a] space-y-2">
                    <p className="text-[10px] text-gray-500 uppercase font-bold">Session Edge</p>
                    <p className="text-gray-300 text-sm">
                      Your best performance is during the <span className="text-indigo-500 font-bold">
                        {(() => {
                          const sessions = ['Asian', 'London', 'New York', 'Off-hours'];
                          const perf = sessions.map(s => ({
                            s,
                            r: filteredTrades.filter(t => getSession(t.createdAt) === s).reduce((acc, t) => acc + getResultR(t), 0)
                          })).sort((a, b) => b.r - a.r);
                          return perf[0]?.s || 'N/A';
                        })()}
                      </span> session.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
