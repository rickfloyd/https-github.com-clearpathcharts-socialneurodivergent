import { GoogleGenAI, Type } from "@google/genai";
import { MarketGroup } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function fetchPopularAssets(): Promise<MarketGroup[]> {
  const CACHE_KEY = 'popular_assets_cache';
  const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_TTL) {
        console.log('[MarketService] Using cached popular assets');
        return data;
      }
    }

    let response;
    let retries = 2;
    while (retries > 0) {
      try {
        response = await ai.models.generateContent({
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
