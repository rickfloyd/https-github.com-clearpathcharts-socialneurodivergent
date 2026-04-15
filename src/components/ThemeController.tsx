import React, { useState, useEffect } from 'react';

export const ThemeController = () => {
  const [mode, setMode] = useState('focus'); // Default to your Neon Emerald

  useEffect(() => {
    // This physically injects the theme into the "Command Stack"
    document.documentElement.setAttribute('data-theme', mode);
  }, [mode]);

  return (
    <div className="flex gap-2 p-2 bg-black/50 rounded-lg border border-white/10">
      <button onClick={() => setMode('grayscale')} className="px-3 py-1 text-[10px] font-bold uppercase border border-white text-white rounded hover:bg-white hover:text-black transition-all">GRAY</button>
      <button onClick={() => setMode('low-stim')} className="px-3 py-1 text-[10px] font-bold uppercase border border-[#7a8c7d] text-[#7a8c7d] rounded hover:bg-[#7a8c7d] hover:text-black transition-all">LOW-STIM</button>
      <button onClick={() => setMode('focus')} className="px-3 py-1 text-[10px] font-bold uppercase border border-[#00ff88] text-[#00ff88] rounded hover:bg-[#00ff88] hover:text-black transition-all">FOCUS</button>
    </div>
  );
};
