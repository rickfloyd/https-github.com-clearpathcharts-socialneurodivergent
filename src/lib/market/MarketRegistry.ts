
export interface MarketLayer {
  id: string;
  name: string;
  color: string;
  desc: string;
}

export const MARKET_LAYERS: MarketLayer[] = [
  { id: 'STK', name: 'Stocks', color: '#ffffff', desc: 'Equities' },
  { id: 'CRY', name: 'Crypto', color: '#00f2ff', desc: 'Digital Assets' },
  { id: 'FRX', name: 'Forex', color: '#ff00ff', desc: 'Currencies' },
  { id: 'IND', name: 'Indices', color: '#7000ff', desc: 'The Composite' },
  { id: 'FUT', name: 'Futures', color: '#ffae00', desc: 'Commodities' },
  { id: 'BND', name: 'Bonds', color: '#00ff88', desc: 'Debt Stability' },
  { id: 'ECO', name: 'Economy', color: '#ff0055', desc: 'Macro Noise' },
  { id: 'INDICATORS', name: 'Indicators', color: '#bbbbbb', desc: 'The Decoration' },
  { id: 'ETF', name: 'ETFs', color: '#4ecca3', desc: 'The Herd' },
  { id: 'AGR', name: 'Ag', color: '#ffcc00', desc: 'Survival' },
];
