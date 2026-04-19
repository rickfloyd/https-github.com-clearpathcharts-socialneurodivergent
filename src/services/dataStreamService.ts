import { NewsItem } from '../types';

/**
 * DataStreamService handles real-time data ingestion via WebSockets and RSS feeds.
 * This is the central hub for institutional-grade data streaming.
 */
export class DataStreamService {
  private static binanceWs: WebSocket | null = null;
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

  /**
   * Connects to Binance WebSocket for live price updates.
   * @param symbols Array of symbols (e.g., ['btcusdt', 'ethusdt'])
   */
  static connectMarketStream(symbols: string[]) {
    if (this.binanceWs) {
      this.binanceWs.close();
    }

    const streams = symbols.map(s => `${s.toLowerCase()}@ticker`).join('/');
    this.binanceWs = new WebSocket(`wss://stream.binance.com:9443/ws/${streams}`);

    this.binanceWs.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const symbol = data.s; // Symbol
      const price = data.c; // Last price
      
      if (this.priceListeners.has(symbol)) {
        this.priceListeners.get(symbol)!(price);
      }
    };

    this.binanceWs.onerror = (error) => {
      console.error('Market WebSocket Error:', error);
    };

    this.binanceWs.onclose = () => {
      // console.log('Market WebSocket Closed. Reconnecting in 5s...');
      setTimeout(() => this.connectMarketStream(symbols), 5000);
    };
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
