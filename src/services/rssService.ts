import { NewsItem } from '../types';
import { GoogleGenAI, Type } from "@google/genai";

// Lazy AI initialization to prevent top-level module errors
let aiInstance: any = null;
const getAI = () => {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY || '';
    aiInstance = new GoogleGenAI({ apiKey });
  }
  return aiInstance;
};

export interface TerminalNewsItem {
  id?: string;
  title: string;
  link: string;
  category: string;
  image: string;
  timestamp: string;
  description: string;
  author: string;
  readTime: string;
  impactScore?: number;
}

/**
 * RSSService handles institutional-grade RSS feed ingestion and intelligence.
 */
export class RSSService {
  /**
   * Fetches and analyzes an RSS feed.
   */
  static async fetchAndAnalyze(feedUrl: string): Promise<any[]> {
    try {
      const response = await fetch(`/api/rss?url=${encodeURIComponent(feedUrl)}`);
      if (!response.ok) throw new Error('Failed to fetch RSS feed');
      const rawItems = await response.json();

      // Limit to top 5 items for intelligence analysis to save tokens/time
      const topItems = rawItems.slice(0, 5);
      
      return await this.enrichWithIntelligence(topItems);
    } catch (error: any) {
      console.warn(`[RSS Service] Failed to fetch feed ${feedUrl}:`, error.message || error);
      return [];
    }
  }

  /**
   * Uses Gemini to enrich RSS items with institutional-grade analysis.
   */
  private static async enrichWithIntelligence(items: any[]): Promise<any[]> {
    if (items.length === 0) return [];

    try {
      const response = await getAI().models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ role: 'user', parts: [{ text: `
          Analyze the following financial and world news items. 
          For each item, provide:
          1. A concise "Institutional Summary" (max 20 words).
          2. An "Impact Score" (0-100) based on market significance.
          3. A "Category" (strictly one of: World, Financial, Local, Market, Policy, Tech, AI).

          Return the results as a JSON array matching the input order.
          
          Items:
          ${JSON.stringify(items.map(i => ({ title: i.text, description: i.description })))}
        ` }] }],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                summary: { type: Type.STRING },
                impactScore: { type: Type.NUMBER },
                category: { type: Type.STRING }
              },
              required: ["summary", "impactScore", "category"]
            }
          }
        }
      });

      const analysis = JSON.parse(response.text);

      return items.map((item, idx) => ({
        title: item.text,
        link: item.link || '#',
        category: analysis[idx]?.category || 'Market',
        image: item.image || `https://picsum.photos/seed/${item.id}/800/600`,
        timestamp: new Date(item.timestamp).toLocaleTimeString(),
        description: analysis[idx]?.summary || item.description || 'Live intelligence stream.',
        author: 'Institutional AI',
        readTime: '3 min',
        impactScore: analysis[idx]?.impactScore || 0
      }));
    } catch (error: any) {
      if (error.message?.includes('429') || error.message?.includes('RESOURCE_EXHAUSTED')) {
        console.warn('Gemini Quota Exceeded (429). Falling back to non-AI intelligence headers.');
      } else {
        console.error('Gemini Enrichment Error:', error);
      }
      // Fallback to raw items if AI fails
      return items.map(item => ({
        title: item.text,
        link: item.link || '#',
        category: 'RSS',
        image: item.image || `https://picsum.photos/seed/${item.id}/800/600`,
        timestamp: new Date(item.timestamp).toLocaleTimeString(),
        description: item.description || 'Live RSS intelligence stream.',
        author: 'System Intel',
        readTime: '3 min'
      }));
    }
  }
}
