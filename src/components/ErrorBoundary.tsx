import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="h-[100dvh] w-full bg-black text-white flex flex-col items-center justify-center p-10 font-mono">
          <h1 className="text-2xl text-red-500 mb-4 tracking-tighter uppercase">Quantum System Failure</h1>
          <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-lg max-w-2xl w-full overflow-auto">
            <p className="text-red-400 mb-4">A critical error has occurred in the neuro-adaptive stream.</p>
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
