import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  isReloading: boolean;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    isReloading: false
  };

  public static getDerivedStateFromError(error: Error): State {
    const isChunkError = error?.name === 'ChunkLoadError' ||
                         error?.message?.includes('Failed to fetch dynamically imported module') ||
                         error?.message?.includes('Importing a module script failed');
                         
    if (isChunkError) {
      // Prevent infinite reload loops if somehow the chunk is truly 404'd forever
      const lastReload = sessionStorage.getItem('cpt_chunk_reload');
      if (!lastReload || (Date.now() - parseInt(lastReload)) > 10000) {
        return { hasError: true, error, isReloading: true };
      }
    }
    
    return { hasError: true, error, isReloading: false };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    
    if (this.state.isReloading) {
      sessionStorage.setItem('cpt_chunk_reload', Date.now().toString());
      window.location.reload();
    }
  }

  public render() {
    if (this.state.isReloading) {
      return (
        <div className="h-[100dvh] w-full bg-[#050505] text-[#ccc8db] flex flex-col items-center justify-center font-mono">
           <div className="w-8 h-8 rounded-full border-t-2 border-b-2 border-indigo-500 animate-spin" />
           <p className="mt-4 text-xs opacity-50 uppercase tracking-widest text-indigo-400">Verifying Institutional Protocols...</p>
        </div>
      );
    }

    if (this.state.hasError) {
      return (
        <div className="h-[100dvh] w-full bg-black text-white flex flex-col items-center justify-center p-10 font-mono">
          <h1 className="text-2xl text-red-500 mb-4 tracking-tighter uppercase">ClearPath System Failure</h1>
          <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-lg max-w-2xl w-full overflow-auto">
            <p className="text-red-400 mb-4">A critical error has occurred in the institutional data stream.</p>
            <pre className="text-xs text-red-300/70 whitespace-pre-wrap">
              {this.state.error?.toString()}
              {"\n\n"}
              {this.state.error?.stack}
            </pre>
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="mt-8 px-6 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors uppercase text-xs tracking-widest"
          >
            Reboot System
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
