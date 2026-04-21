import React from 'react';
import { InterfaceProfile } from '../types';

interface LegalFooterProps {
  profile?: InterfaceProfile;
}

export default function LegalFooter({ profile }: LegalFooterProps) {
  return (
    <footer className="mt-auto py-4 px-6 border-t text-[10px] font-mono text-center opacity-50 glass" 
            style={{ borderColor: profile ? `${profile.borderA}22` : '#272a3a', color: profile ? profile.text : '#5c5e6e' }}>
      <div className="flex flex-col space-y-2">
        <div>
          <span className="mr-2" style={{ color: profile?.borderA }}>⚖</span>
          <span style={{ color: profile?.borderA }}>Legal Positioning</span> — “Provides financial data visualization with optional user-controlled presentation adjustments for accessibility and visual clarity. The system does not evaluate, alter, or advise on financial decisions.”
        </div>
        <div className="flex justify-center space-x-4">
          <button className="hover:underline" style={{ color: profile?.borderA }}>CPT Bible</button>
          <span>•</span>
          <span>© 2026 Clear Path Trader</span>
        </div>
      </div>
    </footer>
  );
}
