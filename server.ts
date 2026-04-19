import express from 'express';
import path from 'path';
import axios from 'axios';
import cookieParser from 'cookie-parser';
import fs from 'fs';

import Parser from 'rss-parser';
import { Feed } from 'feed';

const rssParser = new Parser();

// Institutional Feed Store
let institutionalItems: any[] = [];
const MAX_FEED_ITEMS = 50;

import { setupWebSockets, broadcastToAll } from './websockets.ts';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(cookieParser());

  // Institutional Feed Generation
  app.get('/api/institutional-feed.xml', (req, res) => {
    const feed = new Feed({
      title: "ClearPath Institutional Intelligence",
      description: "AI-Analyzed Financial Intelligence Stream",
      id: `${req.protocol}://${req.get('host')}/`,
      link: `${req.protocol}://${req.get('host')}/`,
      language: "en",
      image: "https://picsum.photos/seed/clearpath/800/600",
      favicon: `${req.protocol}://${req.get('host')}/favicon.ico`,
      copyright: "All rights reserved 2026, ClearPath Data Intelligence",
      updated: new Date(),
      generator: "ClearPath AI Engine",
      author: {
        name: "ClearPath Institutional AI",
        link: "https://forexanarchy.com"
      }
    });

    institutionalItems.forEach(item => {
      feed.addItem({
        title: item.title,
        id: item.id,
        link: item.link,
        description: item.summary,
        content: item.description,
        date: new Date(item.timestamp),
        image: item.image,
        category: [{ name: item.category }]
      });
    });

    res.set('Content-Type', 'text/xml');
    res.send(feed.rss2());
  });

  // API to update institutional items from frontend
  app.post('/api/institutional-feed/sync', (req, res) => {
    const { items } = req.body;
    if (Array.isArray(items)) {
      institutionalItems = items.slice(0, MAX_FEED_ITEMS);
      res.json({ status: 'ok', count: institutionalItems.length });
    } else {
      res.status(400).json({ error: 'Invalid items format' });
    }
  });

  // API to broadcast sentiment insight from frontend
  app.post('/api/sentiment/broadcast', (req, res) => {
    const { insight } = req.body;
    if (insight) {
      broadcastToAll({
        type: 'SENTIMENT_INSIGHT',
        data: insight
      });
      res.json({ status: 'ok' });
    } else {
      res.status(400).json({ error: 'Invalid insight format' });
    }
  });

  // RSS Proxy
  app.get('/api/rss', async (req, res) => {
    const { url } = req.query;
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'URL is required' });
    }

    try {
      const USER_AGENTS = [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:123.0) Gecko/20100101 Firefox/123.0',
        'Mozilla/5.0 (iPhone; CPU iPhone OS 17_3_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.3.1 Mobile/15E148 Safari/604.1'
      ];
      const randomUA = USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];

      // Use axios to fetch with a real User-Agent to avoid 403s
      const response = await axios.get(url, {
        headers: {
          'User-Agent': randomUA,
          'Accept': 'application/rss+xml, application/xml, text/xml, */*',
          'Accept-Language': 'en-US,en;q=0.9',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'Referer': 'https://www.google.com/',
          'Upgrade-Insecure-Requests': '1'
        },
        timeout: 15000,
        validateStatus: (status) => status === 200
      });

      const responseData = response.data.trim();
      if (!responseData.startsWith('<')) {
        throw new Error('Response is not valid XML/RSS');
      }

      const feed = await rssParser.parseString(responseData);
      const items = feed.items.map(item => ({
        id: item.guid || item.link || Math.random().toString(36).substr(2, 9),
        text: item.title || 'No Title',
        timestamp: item.pubDate ? new Date(item.pubDate).getTime() : Date.now(),
        link: item.link,
        description: item.contentSnippet || item.content || ''
      }));
      res.json(items);
    } catch (error: any) {
      const statusCode = error.response?.status || 500;
      const errorMessage = error.response?.statusText || error.message;
      console.error(`RSS Proxy Error [${url}]:`, errorMessage);
      
      // Return a more descriptive error but don't crash the frontend
      res.status(statusCode).json({ 
        error: 'Failed to fetch or parse RSS feed',
        details: errorMessage,
        url: url
      });
    }
  });

  // OAuth URLs
  app.get('/api/auth/google/url', (req, res) => {
    const redirectUri = `${req.protocol}://${req.get('host')}/auth/google/callback`;
    const params = new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID || '',
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'openid profile email',
      access_type: 'offline',
      prompt: 'consent'
    });
    res.json({ url: `https://accounts.google.com/o/oauth2/v2/auth?${params}` });
  });

  // Circuit Breaker & Cache State
  const circuitBreaker = {
    twelveData: { active: true, lastError: 0, retryAfter: 60000 }, // 1 min cooldown
    newsData: { active: true, lastError: 0, retryAfter: 300000 } // 5 min cooldown for 401s
  };

  const marketCache = new Map<string, { data: any, timestamp: number }>();
  const CACHE_TTL = 30000; // 30 seconds

  // Proxy for market historical data (PURE SYNTHETIC ENGINE)
  app.get('/api/market/history', async (req, res) => {
    let { symbol = 'BTC/USD', interval = '1min' } = req.query;
    const cacheKey = `history_${symbol}_${interval}`;
    
    const cached = marketCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
      return res.json(cached.data);
    }

    const data = generateSyntheticHistoryData(symbol as string, interval as string);
    marketCache.set(cacheKey, { data, timestamp: Date.now() });
    res.json(data);
  });

  function generateSyntheticHistoryData(symbol: string, interval: string) {
    const basePrices: Record<string, number> = {
      'AAPL': 175.45, 'TSLA': 170.20, 'MSFT': 415.10, 'NVDA': 890.50, 'AMZN': 178.15,
      'EUR/USD': 1.0850, 'GBP/USD': 1.2640, 'USD/JPY': 151.20, 'AUD/USD': 0.6540,
      'XAU': 2180.50, 'GOLD': 2180.50, 'XAG': 24.80, 'SILVER': 24.80, 'OIL': 81.20,
      'SPX': 5240.10, 'IXIC': 16420.50, 'DJI': 39470.20, 'UK100': 7930.50,
      'US10Y': 4.25, 'US02Y': 4.60, 'BOND': 105.20
    };

    const base = basePrices[symbol.toUpperCase()] || basePrices[symbol.toUpperCase().split('/')[0]] || 100.00;
    const data = [];
    const now = Date.now();
    const count = 100; // Number of candles

    let currentPrice = base;
    const stepMap: Record<string, number> = {
      '1min': 60000, '5min': 300000, '15min': 900000, '1h': 3600000, '1day': 86400000
    };
    const step = stepMap[interval] || 60000;

    for (let i = count; i >= 0; i--) {
      const time = now - (i * step);
      const volatility = 0.002;
      const change = currentPrice * (Math.random() * volatility - (volatility / 2));
      const open = currentPrice;
      const close = currentPrice + change;
      const high = Math.max(open, close) + (Math.random() * currentPrice * 0.001);
      const low = Math.min(open, close) - (Math.random() * currentPrice * 0.001);
      
      data.push([time, open, high, low, close, Math.random() * 1000]);
      currentPrice = close;
    }

    return data;
  }

  // Proxy for current prices (BATCH SUPPORTED)
  app.get('/api/market/prices', async (req, res) => {
    const { symbols = '' } = req.query;
    const symbolList = (symbols as string).split(',').filter(s => s).map(s => s.toUpperCase());
    
    if (symbolList.length === 0) {
      return res.status(400).json({ error: 'Symbols required' });
    }

    const results: Record<string, any> = {};
    symbolList.forEach(symbol => {
      const basePrices: Record<string, number> = {
        'AAPL': 175.45, 'TSLA': 170.20, 'MSFT': 415.10, 'NVDA': 890.50, 'AMZN': 178.15,
        'EUR/USD': 1.0850, 'GBP/USD': 1.2640, 'USD/JPY': 151.20, 'AUD/USD': 0.6540,
        'XAU': 2180.50, 'GOLD': 2180.50, 'XAG': 24.80, 'SILVER': 24.80, 'OIL': 81.20,
        'SPX': 5240.10, 'IXIC': 16420.50, 'DJI': 39470.20, 'UK100': 7930.50,
        'US10Y': 4.25, 'US02Y': 4.60, 'BOND': 105.20, 'BTC': 65000.00, 'ETH': 3500.00,
        'SOL': 145.00, 'XRP': 0.62, 'ADA': 0.45, 'DOGE': 0.16, 'DOT': 9.20,
        'MATIC': 1.05, 'LTC': 85.00, 'LINK': 18.50, 'BTCUSDT': 65000.00, 'ETHUSDT': 3500.00,
        'SOLUSDT': 145.00, 'XRPUSDT': 0.62
      };

      const base = basePrices[symbol] || basePrices[symbol.split('/')[0]] || 100.00;
      const jitter = 1 + (Math.random() * 0.001 - 0.0005);
      results[symbol] = (base * jitter).toFixed(symbol.includes('USD/') || symbol.includes('/') ? 4 : 2);
    });

    res.json(results);
  });

  // Keep single price for compatibility
  app.get('/api/market/price', async (req, res) => {
    const { symbol = 'BTC/USD' } = req.query;
    return generateSyntheticPrice((symbol as string).toUpperCase(), res);
  });

  // SYNTHETIC PRICE ENGINE: Generates realistic, high-fidelity price action
  // This ensures the VC demo is always "alive" even without institutional keys
  function generateSyntheticPrice(symbol: string, res: any) {
    const basePrices: Record<string, number> = {
      'AAPL': 175.45, 'TSLA': 170.20, 'MSFT': 415.10, 'NVDA': 890.50, 'AMZN': 178.15,
      'EUR/USD': 1.0850, 'GBP/USD': 1.2640, 'USD/JPY': 151.20, 'AUD/USD': 0.6540,
      'XAU': 2180.50, 'GOLD': 2180.50, 'XAG': 24.80, 'SILVER': 24.80, 'OIL': 81.20,
      'SPX': 5240.10, 'IXIC': 16420.50, 'DJI': 39470.20, 'UK100': 7930.50,
      'US10Y': 4.25, 'US02Y': 4.60, 'BOND': 105.20, 'BTC': 65000.00, 'ETH': 3500.00,
      'SOL': 145.00, 'XRP': 0.62, 'ADA': 0.45, 'DOGE': 0.16, 'DOT': 9.20,
      'MATIC': 1.05, 'LTC': 85.00, 'LINK': 18.50
    };

    const base = basePrices[symbol] || basePrices[symbol.split('/')[0]] || 100.00;
    
    // Generate a "Random Walk" jitter (0.01% to 0.05% movement)
    const jitter = 1 + (Math.random() * 0.001 - 0.0005);
    const syntheticPrice = (base * jitter).toFixed(symbol.includes('USD/') || symbol.includes('/') ? 4 : 2);

    res.json({ 
      price: syntheticPrice, 
      symbol, 
      source: 'synthetic_engine',
      note: 'High-fidelity simulation active'
    });
  }

  // Proxy for News
  app.get('/api/news', async (req, res) => {
    const apiKey = process.env.NEWSDATA_API_KEY;
    
    // Check circuit breaker
    const now = Date.now();
    if (!circuitBreaker.newsData.active && (now - circuitBreaker.newsData.lastError < circuitBreaker.newsData.retryAfter)) {
      return res.json(getFallbackNews());
    }

    if (!apiKey) {
      return res.json(getFallbackNews());
    }

    try {
      const response = await axios.get(`https://newsdata.io/api/1/news`, {
        params: {
          apikey: apiKey,
          q: 'forex OR crypto OR finance OR "stock market"',
          language: 'en',
          category: 'business,technology'
        },
        timeout: 5000 // 5 second timeout
      });

      // Reset circuit breaker on success
      circuitBreaker.newsData.active = true;

      if (response.data && response.data.results && response.data.results.length > 0) {
        const news = response.data.results.slice(0, 8).map((item: any) => ({
          title: item.title,
          link: item.link || '#',
          description: item.description || 'Institutional intelligence report.',
          author: item.creator ? item.creator[0] : 'System Intel',
          readTime: '5 min',
          category: 'market'
        }));
        return res.json(news);
      }
      
      res.json(getFallbackNews());
    } catch (error: any) {
      // If 401 Unauthorized, trip the circuit breaker
      if (error.response?.status === 401) {
        console.warn('NEWSDATA_API_KEY is invalid (401). Tripping circuit breaker for 5 minutes.');
        circuitBreaker.newsData.active = false;
        circuitBreaker.newsData.lastError = now;
      } else {
        console.error('Error fetching news from NewsData.io:', error.message);
      }
      
      res.json(getFallbackNews());
    }
  });

  // Proxy for Master Updates (Institutional Data Ingestion)
  app.get('/api/master-updates', async (req, res) => {
    try {
      const masterPath = path.join(process.cwd(), 'master_news.json');
      if (fs.existsSync(masterPath)) {
        const data = fs.readFileSync(masterPath, 'utf8');
        return res.json(JSON.parse(data));
      }
    } catch (error) {
      console.error('Error reading master_news.json:', error);
    }
    
    // Fallback if file missing
    res.json([
      {
        "source": "FED_REG",
        "title": "Clear Path Engine: 2026 Roadmap",
        "detail": "Sub-millisecond execution protocols for institutional trading.",
        "color": "text-blue-400",
        "id": "2026-001"
      }
    ]);
  });

  function getFallbackNews() {
    try {
      const newsPath = path.join(process.cwd(), 'news_data.json');
      if (fs.existsSync(newsPath)) {
        const data = fs.readFileSync(newsPath, 'utf8');
        return JSON.parse(data);
      }
    } catch (error) {
      console.error('Error reading news_data.json:', error);
    }
    
    return [
      {
        "category": "tech",
        "title": "Clear Path Engine: 2026 Roadmap",
        "description": "Sub-millisecond execution protocols for institutional trading.",
        "author": "Rick Floyd",
        "readTime": "4 min"
      },
      {
        "category": "ai",
        "title": "Neural Liquidity Models",
        "description": "How AI is redefining high-velocity market depth.",
        "author": "System Intel",
        "readTime": "2 min"
      }
    ];
  }

  // Google Callback
  app.get('/auth/google/callback', async (req, res) => {
    const { code } = req.query;
    const redirectUri = `${req.protocol}://${req.get('host')}/auth/google/callback`;

    try {
      // Exchange code for tokens
      const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', {
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code'
      });

      const { access_token } = tokenResponse.data;

      // Get user info
      const userResponse = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${access_token}` }
      });

      const userData = userResponse.data;

      // Send success message and data back to opener
      res.send(`
        <html>
          <body>
            <script>
              if (window.opener) {
                window.opener.postMessage({ 
                  type: 'OAUTH_AUTH_SUCCESS', 
                  provider: 'google',
                  user: ${JSON.stringify(userData)}
                }, '*');
                window.close();
              } else {
                window.location.href = '/';
              }
            </script>
            <p>Authentication successful. This window should close automatically.</p>
          </body>
        </html>
      `);
    } catch (error) {
      console.error('Google OAuth Error:', error);
      res.status(500).send('Authentication failed');
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });

  setupWebSockets(server);
}

startServer();
