
export interface MarketLayer {
  id: string;
  name: string;
  color: string;
  desc: string;
}

export const MARKET_LAYERS: MarketLayer[] = [
  { id: 'STK', name: 'Stocks', color: '#ffffff', desc: 'Equity Markets' },
  { id: 'CRY', name: 'Crypto', color: '#00f2ff', desc: 'Digital Assets' },
  { id: 'FRX', name: 'Forex', color: '#ff00ff', desc: 'Global Currencies' },
  { id: 'IND', name: 'Indices', color: '#7000ff', desc: 'Basket Performance' },
  { id: 'FUT', name: 'Futures', color: '#ffae00', desc: 'Derivative Assets' },
  { id: 'BND', name: 'Bonds', color: '#00ff88', desc: 'Debt Obligations' },
  { id: 'ECO', name: 'Economy', color: '#ff0055', desc: 'Macro Fundamentals' },
  { id: 'INDICATORS', name: 'Indicators', color: '#bbbbbb', desc: 'Technical Overlays' },
  { id: 'ETF', name: 'ETFs', color: '#4ecca3', desc: 'Managed Distributions' },
  { id: 'AGR', name: 'Ag', color: '#ffcc00', desc: 'Soft Commodities' },
];
