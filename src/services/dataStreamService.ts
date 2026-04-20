import { NewsItem } from '../types';

/**
 * DataStreamService handles real-time data ingestion via WebSockets and RSS feeds.
 * This is the central hub for institutional-grade data streaming.
 */
export class DataStreamService {
  private static institutionalWs: WebSocket | null = null;
  private static priceListeners: Map<string, (price: string) => void> = new Map();
  private static messageListeners: ((msg: any) => void)[] = [];

  /**
   * Connects to the internal institutional WebSocket stream.
   */
  static connectInstitutionalStream() {
    if (this.institutionalWs) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    this.institutionalWs = new WebSocket(`${protocol}//${host}`);

    this.institutionalWs.onmessage = (event) => {
      const data = JSON.parse(event.data);
      // console.log('Institutional Data Received:', data);
      
      // Notify all generic message listeners
      this.messageListeners.forEach(listener => listener(data));
    };

    this.institutionalWs.onclose = () => {
      // console.log('Institutional WebSocket Closed. Reconnecting in 5s...');
      this.institutionalWs = null;
      setTimeout(() => this.connectInstitutionalStream(), 5000);
    };

    this.institutionalWs.onerror = (error) => {
      console.error('Institutional WebSocket Error:', error);
    };
  }

  /**
   * Subscribes to generic institutional messages.
   */
  static subscribeToMessages(callback: (msg: any) => void) {
    this.messageListeners.push(callback);
    return () => {
      this.messageListeners = this.messageListeners.filter(l => l !== callback);
    };
  }

  private static lastPrices: Map<string, number> = new Map();

  /**
   * Connects to a simulated institutional market feed.
   * @param symbols Array of symbols (e.g., ['btcusdt', 'ethusdt'])
   */
  static connectMarketStream(symbols: string[]) {
    // Binance link severed. Initializing Local Institutional Simulator.
    const simulationInterval = setInterval(() => {
      symbols.forEach(s => {
        const symbol = s.toUpperCase();
        
        // Base prices for simulation if not tracked yet
        if (!this.lastPrices.has(symbol)) {
          const basePrices: Record<string, number> = {
            'BTCUSDT': 68500, 'ETHUSDT': 3450, 'SOLUSDT': 145, 
            'BNBUSDT': 580, 'XRPUSDT': 0.62, 'ADAUSDT': 0.45, 
            'DOGEUSDT': 0.15, 'MATICUSDT': 0.75
          };
          this.lastPrices.set(symbol, basePrices[symbol] || 100);
        }

        const currentPrice = this.lastPrices.get(symbol)!;
        const drift = (Math.random() - 0.5) * (currentPrice * 0.0005); // 0.05% max drift
        const nextPrice = currentPrice + drift;
        this.lastPrices.set(symbol, nextPrice);

        if (this.priceListeners.has(symbol)) {
          this.priceListeners.get(symbol)!(nextPrice.toFixed(symbol.includes('USDT') ? 2 : 4));
        }
      });
    }, 1500);

    return () => clearInterval(simulationInterval);
  }

  /**
   * Subscribes to price updates for a specific symbol.
   */
  static subscribeToPrice(symbol: string, callback: (price: string) => void) {
    this.priceListeners.set(symbol.toUpperCase(), callback);
  }

  /**
   * Unsubscribes from price updates.
   */
  static unsubscribeFromPrice(symbol: string) {
    this.priceListeners.delete(symbol.toUpperCase());
  }
}
