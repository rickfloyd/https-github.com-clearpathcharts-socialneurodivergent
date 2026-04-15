import React from 'react';
import { NeuroProfile } from '../types';

interface LegalFooterProps {
  profile?: NeuroProfile;
}

export default function LegalFooter({ profile }: LegalFooterProps) {
  return (
    <footer className="mt-auto py-4 px-6 border-t text-[10px] font-mono text-center opacity-50 glass" 
            style={{ borderColor: profile ? `${profile.ui.accent}22` : '#272a3a', color: profile ? profile.ui.text : '#5c5e6e' }}>
      <span className="mr-2" style={{ color: profile?.ui.accent }}>⚖</span>
      <span className="lava-hot-text">Legal Positioning</span> — “Provides financial data visualization with optional user-controlled presentation adjustments for accessibility and cognitive comfort. The system does not evaluate, alter, or advise on financial decisions.”
    </footer>
  );
}
