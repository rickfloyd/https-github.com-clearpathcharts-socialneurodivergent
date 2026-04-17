import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Bot, 
  User, 
  Image as ImageIcon, 
  Video, 
  Sparkles, 
  Search, 
  Brain, 
  History, 
  Trash2, 
  Download, 
  Loader2,
  Settings,
  Maximize2,
  ChevronRight,
  Plus
} from 'lucide-react';
import { GoogleGenAI, ThinkingLevel } from "@google/genai";
import { useAuth } from '../contexts/FirebaseContext';
import { db } from '../firebase';
import { collection, addDoc, query, where, orderBy, onSnapshot, serverTimestamp, deleteDoc, doc, getDocs } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { ChatMessage, AIAsset } from '../types';
import { AnarchyScanner } from './AnarchyScanner';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export default function AILab() {
  const { user } = useAuth();
  const [activeMode, setActiveMode] = useState<'chat' | 'image' | 'video' | 'scanner'>('chat');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [chatModel, setChatModel] = useState<'gemini-3.1-pro-preview' | 'gemini-3-flash-preview' | 'gemini-3.1-flash-lite-preview'>('gemini-3-flash-preview');
  const [useSearch, setUseSearch] = useState(false);
  const [highThinking, setHighThinking] = useState(false);
  const [useTradingAgent, setUseTradingAgent] = useState(false);
  
  const [imagePrompt, setImagePrompt] = useState('');
  const [imageSize, setImageSize] = useState<'1K' | '2K' | '4K'>('1K');
  const [generatedImages, setGeneratedImages] = useState<AIAsset[]>([]);
  
  const [videoPrompt, setVideoPrompt] = useState('');
  const [videoAspect, setVideoAspect] = useState<'16:9' | '9:16'>('16:9');
  const [generatedVideos, setGeneratedVideos] = useState<AIAsset[]>([]);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'chats'), where('uid', '==', user.uid), orderBy('timestamp', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as ChatMessage[];
      setMessages(msgs);
    });
    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'ai_assets'), where('uid', '==', user.uid), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const assets = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as AIAsset[];
      setGeneratedImages(assets.filter(a => a.type === 'image'));
      setGeneratedVideos(assets.filter(a => a.type === 'video'));
    });
    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || !user || isGenerating) return;
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: input, timestamp: Date.now() };
    setInput('');
    setIsGenerating(true);

    if (input.toUpperCase().includes('FIND 4-3 CYCLES')) {
      setTimeout(() => {
        setActiveMode('scanner');
        setIsGenerating(false);
      }, 1000);
      return;
    }

    try {
      await addDoc(collection(db, 'chats'), { ...userMsg, uid: user.uid, timestamp: serverTimestamp() });
      if (useTradingAgent) {
        const history = messages.map(m => ({ role: m.role, parts: [{ text: m.text }] }));
        const response = await ai.models.generateContent({
          model: 'gemini-3.1-pro-preview',
          contents: [...history, { role: 'user', parts: [{ text: input }] }],
          config: { systemInstruction: "You are the ClearPath Forex Anarchy AI Trading Bot. The user has trained you on their specific '4x3 method' (4 up, 3 down). Analyze structure and provide direct insights." }
        });
        await addDoc(collection(db, 'chats'), { uid: user.uid, role: 'model', text: response.text || "No response", timestamp: serverTimestamp() });
      } else {
        const history = messages.map(m => ({ role: m.role, parts: [{ text: m.text }] }));
        const config: any = { systemInstruction: "Advanced AI assistant in the ClearPath Neural Lab." };
        if (useSearch) config.tools = [{ googleSearch: {} }];
        if (highThinking && chatModel === 'gemini-3.1-pro-preview') config.thinkingConfig = { thinkingLevel: ThinkingLevel.HIGH };
        const response = await ai.models.generateContent({ model: chatModel, contents: [...history, { role: 'user', parts: [{ text: input }] }], config });
        await addDoc(collection(db, 'chats'), { uid: user.uid, role: 'model', text: response.text || "No response", timestamp: serverTimestamp() });
      }
    } catch (error) {
      console.error("Chat error:", error);
    } finally { setIsGenerating(false); }
  };

  const handleGenerateImage = async () => {
    if (!imagePrompt.trim() || !user || isGenerating) return;
    setIsGenerating(true);
    try {
      const resp = await ai.models.generateContent({ model: 'gemini-3.1-flash-image-preview', contents: { parts: [{ text: imagePrompt }] }, config: { imageConfig: { aspectRatio: "1:1", imageSize } } });
      const part = resp.candidates[0].content.parts.find(p => p.inlineData);
      if (part?.inlineData) {
        await addDoc(collection(db, 'ai_assets'), { uid: user.uid, type: 'image', url: `data:image/png;base64,${part.inlineData.data}`, prompt: imagePrompt, model: 'gemini-3.1-flash-image-preview', createdAt: serverTimestamp() });
        setImagePrompt('');
      }
    } catch (error) { console.error("Image error:", error); } finally { setIsGenerating(false); }
  };

  const handleGenerateVideo = async () => {
    if (!videoPrompt.trim() || !user || isGenerating) return;
    setIsGenerating(true);
    try {
      const mockUrl = "https://www.w3schools.com/html/mov_bbb.mp4";
      await addDoc(collection(db, 'ai_assets'), { uid: user.uid, type: 'video', url: mockUrl, prompt: videoPrompt, model: 'veo-3.1-fast-generate-preview', createdAt: serverTimestamp() });
      setVideoPrompt('');
    } catch (error) { console.error("Video error:", error); } finally { setIsGenerating(false); }
  };

  const clearChat = async () => {
    if (!user) return;
    const q = query(collection(db, 'chats'), where('uid', '==', user.uid));
    const snap = await getDocs(q);
    await Promise.all(snap.docs.map(d => deleteDoc(doc(db, 'chats', d.id))));
  };

  return (
    <div className="flex h-full bg-black/95 overflow-hidden font-mono border border-[#ff4500]/20 rounded-xl">
      {/* Institutional Nodes Sidebar */}
      <div className="w-1/3 border-r border-[#ff4500]/20 bg-black/40 flex flex-col p-3 space-y-4">
        <div className="flex items-center gap-2 mb-2 p-1 border-b border-white/5 pb-3">
          <div className="w-8 h-8 rounded-lg border border-[#ff4500] p-0.5 overflow-hidden">
             <img src="https://i.postimg.cc/vZjBsKfY/Chat-GPT-Image-Feb-26-2026-02-21-28-PM.png" alt="LAVA" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          </div>
          <div>
            <p className="text-[10px] text-[#ff4500] font-black leading-tight">LAVA AI</p>
            <p className="text-[7px] text-white/40 uppercase tracking-widest">ClearPath Agent</p>
          </div>
        </div>

        <div className="space-y-1">
          <p className="text-[9px] text-[#ff4500]/60 uppercase tracking-[0.2em] mb-2 font-black">Institutional Nodes</p>
          {[
            { name: 'Market Step Counter', status: 'online', color: '#22c55e' },
            { name: 'Price Match Finder', status: 'online', color: '#22c55e' },
            { name: 'Energy Meter', status: 'idle', color: '#eab308' },
            { name: 'Safety Check', status: 'online', color: '#22c55e' },
            { name: 'Live Pattern Scan', status: activeMode === 'scanner' ? 'online' : 'offline', color: activeMode === 'scanner' ? '#22c55e' : '#6b7280' }
          ].map((node) => (
            <button 
              key={node.name} 
              onClick={() => node.name === 'Live Pattern Scan' ? setActiveMode('scanner') : null}
              className={`w-full flex items-center space-x-2 p-1.5 rounded transition-all ${
                activeMode === 'scanner' && node.name === 'Live Pattern Scan' 
                  ? 'bg-[#ff4500]/20 border border-[#ff4500]/40' 
                  : 'bg-white/[0.02] border border-white/[0.03] hover:bg-white/[0.05]'
              }`}
            >
              <div className="relative">
                <div className="w-5 h-5 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                   <div className="w-0.5 h-0.5 bg-white/40 rounded-full" />
                </div>
                <div className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-black ${
                  node.status === 'online' ? 'bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.5)]' : 
                  node.status === 'idle' ? 'bg-yellow-500' : 'bg-gray-500'
                }`} />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-[9px] text-white/70 leading-none truncate w-20">{node.name}</span>
                <span className="text-[7px] uppercase tracking-tighter" style={{ color: node.color }}>{node.status}</span>
              </div>
            </button>
          ))}
        </div>

        <div className="flex-1" />

        <div className="p-2 border border-red-500/20 rounded bg-red-500/5">
           <p className="text-[7px] text-red-500/80 uppercase font-black tracking-tighter leading-tight">
             EDUCATIONAL ONLY. NO FINANCIAL ADVICE. NO TRADING CAPABILITIES.
           </p>
        </div>
      </div>

      <div className="flex-1 flex flex-col relative overflow-hidden">
        {activeMode === 'chat' && (
          <div className="flex flex-col h-full bg-[#050505]">
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
              {messages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
                  <motion.div 
                    animate={{ boxShadow: ["0 0 10px rgba(255, 69, 0, 0.4)", "0 0 30px rgba(255, 69, 0, 0.8)", "0 0 10px rgba(255, 69, 0, 0.4)"] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-16 h-16 rounded-2xl border-2 border-[#ff4500] p-1 bg-black overflow-hidden"
                  >
                    <img src="https://i.postimg.cc/vZjBsKfY/Chat-GPT-Image-Feb-26-2026-02-21-28-PM.png" alt="LAVA" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </motion.div>
                  <div className="max-w-[80%]">
                    <p className="text-xs text-[#ff4500] uppercase tracking-[0.3em] font-black drop-shadow-[0_0_5px_rgba(255,69,0,0.5)]">TERMINAL ONLINE</p>
                    <p className="text-[10px] text-white/40 mt-2 leading-relaxed uppercase">Neural Synchronization achieved. Ready to scan the charts for you, Rick.</p>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-2 w-full pt-4">
                    {['CHECK MARKET ENERGY', 'FIND 4-3 CYCLES', 'SHOW THE BIG PICTURE'].map((suggestion) => (
                      <button 
                         key={suggestion}
                         onClick={() => setInput(suggestion)}
                         className="p-2 text-[9px] text-white/40 border border-white/5 rounded hover:border-[#ff4500]/30 hover:text-white transition-all bg-white/[0.02]"
                      >
                         {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {messages.map((msg) => (
                <motion.div key={msg.id} initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col space-y-1">
                  <div className={`flex items-center space-x-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                     <span className={`text-[8px] uppercase tracking-widest font-black ${msg.role === 'user' ? 'text-indigo-400' : 'text-[#ff4500]'}`}>
                       {msg.role === 'user' ? 'Signal Received' : 'LAVA OUTPUT'}
                     </span>
                  </div>
                  <div className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[90%] px-3 py-2 rounded border ${
                      msg.role === 'user' 
                        ? 'bg-indigo-950/20 border-indigo-500/30 text-white' 
                        : 'bg-black border-[#ff4500]/20 text-white/90 font-light shadow-[0_0_15px_rgba(255,69,0,0.05)]'
                    } text-[11px] leading-relaxed`}>
                      {msg.text}
                    </div>
                  </div>
                </motion.div>
              ))}
              {isGenerating && (
                <div className="flex justify-start">
                  <div className="flex items-center space-x-2 text-[#ff4500] animate-pulse">
                     <Loader2 size={12} className="animate-spin" />
                     <span className="text-[9px] uppercase font-black tracking-widest">INGESTING LIVE MAGMA...</span>
                  </div>
                </div>
              )}
            </div>
            <div className="p-4 border-t border-white/5 bg-black">
              <div className="mb-2 flex items-center justify-between">
                 <span className="text-[8px] text-white/20 uppercase tracking-widest">System Integrity: 98.4%</span>
                 <div className="flex gap-1">
                   <div className="w-8 h-1 bg-[#ff4500]/40 rounded-full overflow-hidden">
                     <div className="h-full bg-[#ff4500] w-3/4 animate-pulse" />
                   </div>
                 </div>
              </div>
              <form onSubmit={handleSendMessage} className="relative">
                <input 
                  value={input} 
                  onChange={(e) => setInput(e.target.value)} 
                  placeholder="INPUT COMMAND SEQUENCE..." 
                  className="w-full bg-[#080808] border border-white/10 rounded px-4 py-3 pr-12 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-[#ff4500]/50 transition-all uppercase tracking-wider" 
                />
                <button type="submit" disabled={isGenerating || !input.trim()} className="absolute right-2 top-2 p-1.5 text-[#ff4500] hover:scale-110 active:scale-95 transition-all">
                  <Send size={18} />
                </button>
              </form>
              <div className="mt-3 flex items-center justify-between">
                <button 
                  onClick={() => setUseTradingAgent(!useTradingAgent)} 
                  className={`flex items-center space-x-1.5 text-[9px] uppercase tracking-[0.2em] font-black transition-all ${useTradingAgent ? 'text-[#ff4500]' : 'text-white/20'}`}
                >
                  <Bot size={12} />
                  <span>4x3 Matrix Core</span>
                </button>
                <p className="text-[8px] text-white/10 uppercase tracking-widest font-bold">Data Stream: 2026.4.17</p>
              </div>
            </div>
          </div>
        )}

        {activeMode === 'scanner' && (
          <div className="flex flex-col h-full bg-[#050505] p-4 overflow-y-auto scrollbar-hide relative">
            <button 
              onClick={() => setActiveMode('chat')}
              className="absolute top-4 right-4 text-white/20 hover:text-[#ff4500] transition-colors"
            >
              <ChevronRight size={20} className="rotate-180" />
            </button>
            <AnarchyScanner />
          </div>
        )}
      </div>
    </div>
  );
}
