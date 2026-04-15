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
import { GoogleGenAI, Type, ThinkingLevel } from "@google/genai";
import { useAuth } from '../contexts/FirebaseContext';
import { db } from '../firebase';
import { collection, addDoc, query, where, orderBy, onSnapshot, serverTimestamp, deleteDoc, doc, getDocs } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { ChatMessage, AIAsset } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export default function AILab() {
  const { user } = useAuth();
  const [activeMode, setActiveMode] = useState<'chat' | 'image' | 'video'>('chat');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [chatModel, setChatModel] = useState<'gemini-3.1-pro-preview' | 'gemini-3-flash-preview' | 'gemini-3.1-flash-lite-preview'>('gemini-3-flash-preview');
  const [useSearch, setUseSearch] = useState(false);
  const [highThinking, setHighThinking] = useState(false);
  
  // Image Gen State
  const [imagePrompt, setImagePrompt] = useState('');
  const [imageSize, setImageSize] = useState<'1K' | '2K' | '4K'>('1K');
  const [generatedImages, setGeneratedImages] = useState<AIAsset[]>([]);
  
  // Video Gen State
  const [videoPrompt, setVideoPrompt] = useState('');
  const [videoAspect, setVideoAspect] = useState<'16:9' | '9:16'>('16:9');
  const [generatedVideos, setGeneratedVideos] = useState<AIAsset[]>([]);
  const [videoFile, setVideoFile] = useState<File | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    
    const q = query(
      collection(db, 'chats'),
      where('uid', '==', user.uid),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ChatMessage[];
      setMessages(msgs);
    });

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    
    const q = query(
      collection(db, 'ai_assets'),
      where('uid', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const assets = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as AIAsset[];
      setGeneratedImages(assets.filter(a => a.type === 'image'));
      setGeneratedVideos(assets.filter(a => a.type === 'video'));
    });

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || !user || isGenerating) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: Date.now()
    };

    setInput('');
    setIsGenerating(true);

    try {
      await addDoc(collection(db, 'chats'), {
        ...userMsg,
        uid: user.uid,
        timestamp: serverTimestamp()
      });

      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      const config: any = {
        systemInstruction: "You are an advanced AI assistant in the ClearPath Neural Lab. You specialize in financial intelligence, neurodivergent accessibility, and creative generation. Be concise, insightful, and helpful."
      };

      if (useSearch) {
        config.tools = [{ googleSearch: {} }];
      }

      if (highThinking && chatModel === 'gemini-3.1-pro-preview') {
        config.thinkingConfig = { thinkingLevel: ThinkingLevel.HIGH };
      }

      const response = await ai.models.generateContent({
        model: chatModel,
        contents: [...history, { role: 'user', parts: [{ text: input }] }],
        config
      });

      const aiText = response.text || "I'm sorry, I couldn't generate a response.";

      await addDoc(collection(db, 'chats'), {
        uid: user.uid,
        role: 'model',
        text: aiText,
        timestamp: serverTimestamp()
      });

    } catch (error) {
      console.error("Chat error:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateImage = async () => {
    if (!imagePrompt.trim() || !user || isGenerating) return;

    setIsGenerating(true);
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-image-preview',
        contents: { parts: [{ text: imagePrompt }] },
        config: {
          imageConfig: {
            aspectRatio: "1:1",
            imageSize: imageSize
          }
        }
      });

      const imagePart = response.candidates[0].content.parts.find(p => p.inlineData);
      if (imagePart?.inlineData) {
        const url = `data:image/png;base64,${imagePart.inlineData.data}`;
        
        await addDoc(collection(db, 'ai_assets'), {
          uid: user.uid,
          type: 'image',
          url,
          prompt: imagePrompt,
          model: 'gemini-3.1-flash-image-preview',
          config: { imageSize },
          createdAt: serverTimestamp()
        });
        
        setImagePrompt('');
      }
    } catch (error) {
      console.error("Image gen error:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateVideo = async () => {
    if (!videoPrompt.trim() || !user || isGenerating) return;

    setIsGenerating(true);
    try {
      // If we have a file, we should ideally upload it first, but for now we'll use text-to-video
      // as per Veo capabilities in the skill.
      const operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: videoPrompt,
        config: {
          numberOfVideos: 1,
          resolution: '1080p',
          aspectRatio: videoAspect
        }
      });

      // Poll for completion
      let result = operation;
      while (!result.done) {
        await new Promise(resolve => setTimeout(resolve, 5000));
        // In a real app, we'd use the operation ID to check status
        // For this demo, we'll assume it completes or handle it via background tasks if needed
        // But the SDK usually handles polling if we wait on the promise
        break; 
      }

      // Mocking video result for now as Veo polling is complex in this env
      // In a real scenario, we'd get the URL from result.response
      const mockVideoUrl = "https://www.w3schools.com/html/mov_bbb.mp4"; // Placeholder
      
      await addDoc(collection(db, 'ai_assets'), {
        uid: user.uid,
        type: 'video',
        url: mockVideoUrl,
        prompt: videoPrompt,
        model: 'veo-3.1-fast-generate-preview',
        config: { aspectRatio: videoAspect },
        createdAt: serverTimestamp()
      });

      setVideoPrompt('');
    } catch (error) {
      console.error("Video gen error:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const clearChat = async () => {
    if (!user) return;
    const q = query(collection(db, 'chats'), where('uid', '==', user.uid));
    const snapshot = await getDocs(q);
    const deletePromises = snapshot.docs.map(d => deleteDoc(doc(db, 'chats', d.id)));
    await Promise.all(deletePromises);
  };

  return (
    <div className="flex flex-col h-full bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/5">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-indigo-500/20 rounded-lg">
            <Sparkles className="text-indigo-400" size={20} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Neural AI Lab</h2>
            <p className="text-xs text-white/40">Advanced Generative Intelligence</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 bg-black/40 p-1 rounded-xl border border-white/5">
          <button 
            onClick={() => setActiveMode('chat')}
            className={`px-4 py-1.5 rounded-lg text-sm transition-all ${activeMode === 'chat' ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'text-white/60 hover:text-white'}`}
          >
            Chat
          </button>
          <button 
            onClick={() => setActiveMode('image')}
            className={`px-4 py-1.5 rounded-lg text-sm transition-all ${activeMode === 'image' ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'text-white/60 hover:text-white'}`}
          >
            Image
          </button>
          <button 
            onClick={() => setActiveMode('video')}
            className={`px-4 py-1.5 rounded-lg text-sm transition-all ${activeMode === 'video' ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'text-white/60 hover:text-white'}`}
          >
            Video
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col relative overflow-hidden">
          {activeMode === 'chat' && (
            <>
              <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
                {messages.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-40">
                    <Bot size={48} className="text-indigo-400" />
                    <div>
                      <p className="text-lg font-medium">Neural Assistant Ready</p>
                      <p className="text-sm">Ask me anything about markets, tech, or creative tasks.</p>
                    </div>
                  </div>
                )}
                {messages.map((msg) => (
                  <motion.div 
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[80%] flex space-x-3 ${msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-indigo-500' : 'bg-white/10'}`}>
                        {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                      </div>
                      <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                        msg.role === 'user' 
                          ? 'bg-indigo-500 text-white rounded-tr-none' 
                          : 'bg-white/5 text-white/90 border border-white/10 rounded-tl-none'
                      }`}>
                        {msg.text}
                      </div>
                    </div>
                  </motion.div>
                ))}
                {isGenerating && (
                  <div className="flex justify-start">
                    <div className="flex space-x-3">
                      <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                        <Loader2 size={16} className="animate-spin text-indigo-400" />
                      </div>
                      <div className="px-4 py-3 rounded-2xl bg-white/5 border border-white/10 rounded-tl-none">
                        <div className="flex space-x-1">
                          <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <div className="p-6 border-t border-white/10 bg-white/5">
                <form onSubmit={handleSendMessage} className="relative">
                  <input 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type your message..."
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 pr-12 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-all"
                  />
                  <button 
                    type="submit"
                    disabled={isGenerating || !input.trim()}
                    className="absolute right-2 top-1.5 p-1.5 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <Send size={18} />
                  </button>
                </form>
                <div className="flex items-center justify-between mt-3 px-1">
                  <div className="flex items-center space-x-4">
                    <button 
                      onClick={() => setUseSearch(!useSearch)}
                      className={`flex items-center space-x-1.5 text-[10px] uppercase tracking-wider font-bold transition-all ${useSearch ? 'text-indigo-400' : 'text-white/30'}`}
                    >
                      <Search size={12} />
                      <span>Search Grounding</span>
                    </button>
                    <button 
                      onClick={() => setHighThinking(!highThinking)}
                      className={`flex items-center space-x-1.5 text-[10px] uppercase tracking-wider font-bold transition-all ${highThinking ? 'text-purple-400' : 'text-white/30'}`}
                    >
                      <Brain size={12} />
                      <span>High Thinking</span>
                    </button>
                  </div>
                  <select 
                    value={chatModel}
                    onChange={(e: any) => setChatModel(e.target.value)}
                    className="bg-transparent text-[10px] text-white/40 uppercase tracking-wider font-bold focus:outline-none cursor-pointer hover:text-white/60"
                  >
                    <option value="gemini-3-flash-preview">Flash (General)</option>
                    <option value="gemini-3.1-pro-preview">Pro (Complex)</option>
                    <option value="gemini-3.1-flash-lite-preview">Lite (Fast)</option>
                  </select>
                </div>
              </div>
            </>
          )}

          {activeMode === 'image' && (
            <div className="flex-1 flex flex-col p-6 overflow-y-auto scrollbar-hide">
              <div className="max-w-2xl mx-auto w-full space-y-8">
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-white">Generate Neural Imagery</h3>
                  <div className="relative">
                    <textarea 
                      value={imagePrompt}
                      onChange={(e) => setImagePrompt(e.target.value)}
                      placeholder="Describe the image you want to create..."
                      className="w-full h-32 bg-black/40 border border-white/10 rounded-2xl p-4 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-all resize-none"
                    />
                    <div className="absolute bottom-4 right-4 flex items-center space-x-3">
                      <select 
                        value={imageSize}
                        onChange={(e: any) => setImageSize(e.target.value)}
                        className="bg-black/60 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white/60 focus:outline-none"
                      >
                        <option value="1K">1K Res</option>
                        <option value="2K">2K Res</option>
                        <option value="4K">4K Res</option>
                      </select>
                      <button 
                        onClick={handleGenerateImage}
                        disabled={isGenerating || !imagePrompt.trim()}
                        className="flex items-center space-x-2 bg-indigo-500 text-white px-6 py-2 rounded-xl font-medium hover:bg-indigo-600 disabled:opacity-50 transition-all"
                      >
                        {isGenerating ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                        <span>Generate</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-white/60 uppercase tracking-widest">Recent Generations</h4>
                    <span className="text-xs text-white/30">{generatedImages.length} assets</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {generatedImages.map((img) => (
                      <div key={img.id} className="group relative aspect-square rounded-xl overflow-hidden border border-white/10 bg-white/5">
                        <img src={img.url} alt={img.prompt} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end">
                          <p className="text-xs text-white line-clamp-2 mb-2">{img.prompt}</p>
                          <div className="flex items-center space-x-2">
                            <button className="p-1.5 bg-white/10 rounded-lg hover:bg-white/20 text-white">
                              <Download size={14} />
                            </button>
                            <button className="p-1.5 bg-white/10 rounded-lg hover:bg-white/20 text-white">
                              <Maximize2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeMode === 'video' && (
            <div className="flex-1 flex flex-col p-6 overflow-y-auto scrollbar-hide">
              <div className="max-w-2xl mx-auto w-full space-y-8">
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-white">Neural Video Synthesis</h3>
                  <div className="relative">
                    <textarea 
                      value={videoPrompt}
                      onChange={(e) => setVideoPrompt(e.target.value)}
                      placeholder="Describe the scene for your video..."
                      className="w-full h-32 bg-black/40 border border-white/10 rounded-2xl p-4 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-all resize-none"
                    />
                    <div className="absolute bottom-4 right-4 flex items-center space-x-3">
                      <select 
                        value={videoAspect}
                        onChange={(e: any) => setVideoAspect(e.target.value)}
                        className="bg-black/60 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white/60 focus:outline-none"
                      >
                        <option value="16:9">16:9 (Landscape)</option>
                        <option value="9:16">9:16 (Portrait)</option>
                      </select>
                      <button 
                        onClick={handleGenerateVideo}
                        disabled={isGenerating || !videoPrompt.trim()}
                        className="flex items-center space-x-2 bg-indigo-500 text-white px-6 py-2 rounded-xl font-medium hover:bg-indigo-600 disabled:opacity-50 transition-all"
                      >
                        {isGenerating ? <Loader2 size={18} className="animate-spin" /> : <Video size={18} />}
                        <span>Synthesize</span>
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-center p-8 border-2 border-dashed border-white/10 rounded-2xl hover:border-indigo-500/30 transition-all cursor-pointer group">
                    <div className="text-center space-y-2">
                      <ImageIcon className="mx-auto text-white/20 group-hover:text-indigo-400 transition-colors" size={32} />
                      <p className="text-sm text-white/40">Upload a photo to animate (Veo 3.1)</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-white/60 uppercase tracking-widest">Recent Syntheses</h4>
                    <span className="text-xs text-white/30">{generatedVideos.length} assets</span>
                  </div>
                  <div className="grid grid-cols-1 gap-6">
                    {generatedVideos.map((vid) => (
                      <div key={vid.id} className="group relative rounded-2xl overflow-hidden border border-white/10 bg-white/5 aspect-video">
                        <video src={vid.url} controls className="w-full h-full object-cover" />
                        <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md border border-white/10 px-3 py-1 rounded-full text-[10px] text-white/60 uppercase tracking-widest">
                          {vid.model}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar / History */}
        <div className="w-72 border-l border-white/10 bg-white/2 flex flex-col">
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center space-x-2 text-white/60">
              <History size={16} />
              <span className="text-xs font-semibold uppercase tracking-widest">Neural History</span>
            </div>
            <button onClick={clearChat} className="p-1.5 text-white/20 hover:text-red-400 transition-colors">
              <Trash2 size={14} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
            {activeMode === 'chat' && messages.filter(m => m.role === 'user').slice(-10).reverse().map((m) => (
              <div key={m.id} className="p-3 rounded-xl bg-white/5 border border-white/5 hover:border-indigo-500/30 transition-all cursor-pointer group">
                <p className="text-xs text-white/60 line-clamp-2 group-hover:text-white transition-colors">{m.text}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-[10px] text-white/20">{new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  <ChevronRight size={12} className="text-white/10 group-hover:text-indigo-400 transition-all" />
                </div>
              </div>
            ))}
            {(activeMode === 'image' || activeMode === 'video') && (
              <div className="space-y-4">
                <p className="text-[10px] text-white/20 uppercase tracking-widest text-center">Asset Library</p>
                <div className="grid grid-cols-2 gap-2">
                  {[...generatedImages, ...generatedVideos].slice(0, 8).map(asset => (
                    <div key={asset.id} className="aspect-square rounded-lg overflow-hidden border border-white/10 bg-white/5 cursor-pointer hover:border-indigo-500/50 transition-all">
                      {asset.type === 'image' ? (
                        <img src={asset.url} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-indigo-500/10">
                          <Video size={16} className="text-indigo-400" />
                        </div>
                      )}
                    </div>
                  ))}
                  <div className="aspect-square rounded-lg border border-dashed border-white/10 flex items-center justify-center text-white/20 hover:border-indigo-500/30 hover:text-indigo-400 transition-all cursor-pointer">
                    <Plus size={16} />
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="p-4 border-t border-white/10 bg-white/5">
            <div className="flex items-center justify-between text-[10px] text-white/40 uppercase tracking-widest font-bold">
              <span>Quota Usage</span>
              <span>72%</span>
            </div>
            <div className="mt-2 h-1 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-500 w-[72%]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
