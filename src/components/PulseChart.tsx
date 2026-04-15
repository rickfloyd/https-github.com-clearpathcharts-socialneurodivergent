
import React from 'react';
import LiveChart from './LiveChart';
import { NeuroProfile } from '../types';

interface PulseChartProps {
  marketId: string;
  profile: NeuroProfile;
}

const MARKET_MAP: Record<string, string> = {
  'STK': 'AAPL',
  'CRY': 'BTCUSDT',
  'FRX': 'EURUSD',
  'IND': 'SPX',
  'FUT': 'OIL',
  'BND': 'BOND',
  'ECO': 'US10Y',
  'INDICATORS': 'DXY',
  'ETF': 'SPY',
  'AGR': 'CORN'
};

export default function PulseChart({ marketId, profile }: PulseChartProps) {
  const symbol = MARKET_MAP[marketId] || 'BTCUSDT';
  
  return (
    <div className="w-full h-full min-h-[500px]">
      <LiveChart 
        symbol={symbol} 
        theme={{ 
          upColor: profile.candles.upColor, 
          downColor: profile.candles.downColor, 
          accent: profile.ui.accent 
        }} 
      />
    </div>
  );
}
