import { GoogleGenAI, Type } from "@google/genai";
import { MarketGroup } from "../types";

// Lazy AI initialization to prevent top-level module errors
let aiInstance: any = null;
const getAI = () => {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY || '';
    aiInstance = new GoogleGenAI({ apiKey });
  }
  return aiInstance;
};

export async function fetchPopularAssets(forceRefresh = false): Promise<MarketGroup[]> {
  const CACHE_KEY = 'popular_assets_cache';
  const CACHE_TTL = 7 * 24 * 60 * 60 * 1000; // Extend to 1 week for cost safety

  // STATIC INSTITUTIONAL DEFAULTS (Cost: $0)
  const INSTITUTIONAL_DEFAULTS: MarketGroup[] = [
    {
      name: 'Equities',
      assets: [
        { symbol: 'AAPL', name: 'Apple Inc.', group: 'Equities' },
        { symbol: 'NVDA', name: 'NVIDIA Corp.', group: 'Equities' },
        { symbol: 'TSLA', name: 'Tesla Inc.', group: 'Equities' },
        { symbol: 'MSFT', name: 'Microsoft Corp.', group: 'Equities' }
      ]
    },
    {
      name: 'Cryptocurrencies',
      assets: [
        { symbol: 'BTC', name: 'Bitcoin', group: 'Cryptocurrencies' },
        { symbol: 'ETH', name: 'Ethereum', group: 'Cryptocurrencies' },
        { symbol: 'SOL', name: 'Solana', group: 'Cryptocurrencies' },
        { symbol: 'XRP', name: 'Ripple', group: 'Cryptocurrencies' }
      ]
    },
    {
      name: 'Forex',
      assets: [
        { symbol: 'EUR/USD', name: 'Euro / US Dollar', group: 'Forex' },
        { symbol: 'GBP/USD', name: 'British Pound / US Dollar', group: 'Forex' },
        { symbol: 'USD/JPY', name: 'US Dollar / Japanese Yen', group: 'Forex' },
        { symbol: 'AUD/USD', name: 'Australian Dollar / US Dollar', group: 'Forex' }
      ]
    },
    {
      name: 'Commodities',
      assets: [
        { symbol: 'XAU/USD', name: 'Gold', group: 'Commodities' },
        { symbol: 'WTI', name: 'Crude Oil', group: 'Commodities' },
        { symbol: 'XAG/USD', name: 'Silver', group: 'Commodities' },
        { symbol: 'NG', name: 'Natural Gas', group: 'Commodities' }
      ]
    }
  ];

  try {
    if (!forceRefresh) {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_TTL) {
          return data;
        }
      }
      // Return static defaults if no cache instead of calling AI
      return INSTITUTIONAL_DEFAULTS;
    }

    let response;
    // ... rest of the AI fetch logic remains but only triggered if forceRefresh is true ...
    let retries = 2;
    while (retries > 0) {
      try {
        response = await getAI().models.generateContent({
          model: "gemini-3-flash-preview",
          contents: "Identify the top 12 most traded financial assets globally across all markets. Then, categorize them and other highly popular assets into these 8 specific groups: Equities, Cryptocurrencies, Forex, Commodities, Indices, Futures, Bonds, and Yields. For each group, provide the top 4 assets based on current monthly Google search trends and trading volume. For each asset, provide its ticker symbol and full name. Return the data as a JSON array of groups.",
          config: {
            tools: [{ googleSearch: {} }],
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING, description: "The name of the asset group (e.g., Equities)" },
                  assets: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        symbol: { type: Type.STRING, description: "The ticker symbol (e.g., AAPL, BTC)" },
                        name: { type: Type.STRING, description: "The full name of the asset" },
                        group: { type: Type.STRING, description: "The group name" }
                      },
                      required: ["symbol", "name", "group"]
                    }
                  }
                },
                required: ["name", "assets"]
              }
            }
          }
        });
        break;
      } catch (e: any) {
        if (e.message?.includes('429') || e.message?.includes('RESOURCE_EXHAUSTED')) {
          console.warn(`[MarketService] Quota hit, retrying in 10s... (${retries} left)`);
          await new Promise(r => setTimeout(r, 10000));
          retries--;
        } else {
          throw e;
        }
      }
    }

    if (!response) {
      throw new Error('Failed to fetch popular assets after retries');
    }

    const text = response.text;
    if (!text) return [];
    
    const data = JSON.parse(text);
    localStorage.setItem(CACHE_KEY, JSON.stringify({ data, timestamp: Date.now() }));
    return data;
  } catch (error) {
    console.error("Error fetching popular assets:", error);
    return [];
  }
}
