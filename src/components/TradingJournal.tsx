import React from 'react';
import { InterfaceProfile, Trade } from '../types';

interface TradingJournalProps {
  profile: InterfaceProfile;
}

export default function TradingJournal({ profile }: TradingJournalProps) {
  const trades: Trade[] = [
    { ticker: 'USDCAD', pos: 0.10, entry: 1.3450 },
    { ticker: 'XAUUSD', pos: 0.05, entry: 2350.10 },
    { ticker: 'BTCUSD', pos: 0.01, entry: 67200.00 },
  ];

  return (
    <div 
      className="border p-4 rounded-3xl h-full overflow-hidden flex flex-col shadow-xl"
      style={{ background: profile.ui.bgBottom, borderColor: `${profile.ui.accent}22` }}
    >
      <h2 className="text-[0.8rem] mb-4 border-b pb-2 font-mono uppercase tracking-widest opacity-50" style={{ color: profile.ui.text, borderColor: `${profile.ui.accent}22` }}>
        TRADING JOURNAL
      </h2>
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <table className="w-full text-left font-mono text-xs">
          <thead>
            <tr className="border-b opacity-50" style={{ color: profile.ui.text, borderColor: `${profile.ui.accent}22` }}>
              <th className="pb-2">TICKER</th>
              <th className="pb-2">POS</th>
              <th className="pb-2">ENTRY</th>
            </tr>
          </thead>
          <tbody className="divide-y" style={{ borderColor: `${profile.ui.accent}11` }}>
            {trades.map((trade, i) => (
              <tr key={i} className="hover:bg-white/5 transition-colors">
                <td className="py-2 font-bold" style={{ color: profile.ui.text }}>{trade.ticker}</td>
                <td className="py-2 opacity-70" style={{ color: profile.ui.text }}>{trade.pos.toFixed(2)}</td>
                <td className="py-2 font-bold" style={{ color: profile.ui.accent }}>{trade.entry.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
