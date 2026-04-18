import { GoogleGenAI, Type } from "@google/genai";
import { db, auth, handleFirestoreError, OperationType } from "../firebase";
import { collection, query, orderBy, limit, getDocs, addDoc, serverTimestamp, doc, getDoc, setDoc } from "firebase/firestore";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const SOURCES = [
  'https://www.cnbc.com/id/100003114/device/rss/rss.html',
  'https://www.marketwatch.com/rss/topstories',
  'https://finance.yahoo.com/rss/',
  'https://www.investing.com/rss/market_overview.rss',
  'https://economictimes.indiatimes.com/markets/rssfeeds/1977021501.cms',
  'https://www.livemint.com/rss/markets',
  'https://www.investing.com/rss/news_25.rss'
];

export class IntelligenceService {
  /**
   * Runs the intelligence cycle: fetches RSS, analyzes with Gemini, and syncs to Firestore/Server.
   */
  static async runCycle() {
    try {
      if (!auth.currentUser) {
        console.log('[IntelligenceService] Cycle skipped (not authenticated)');
        return;
      }
      console.log('[IntelligenceService] Starting cycle...');
      
      // 1. Primary local throttle (save quota by skipping firestore check if checked recently in this browser)
      const localLastRun = localStorage.getItem('intelligence_last_run_local');
      if (localLastRun && Date.now() - parseInt(localLastRun) < 15 * 60 * 1000) {
        console.log('[IntelligenceService] Cycle skipped (local throttle)');
        return;
      }
      localStorage.setItem('intelligence_last_run_local', Date.now().toString());

      // 2. Check if update is needed (throttle to once every 2 hours across all instances to conserve institutional quota)
      let statusDoc;
      try {
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 5000));
        statusDoc = await Promise.race([
          getDoc(doc(db, 'system', 'intelligence_status')),
          timeoutPromise
        ]) as any;
      } catch (e) {
        console.warn('[IntelligenceService] Skipping cycle due to access issues or timeout');
        return;
      }
      const lastRun = statusDoc.exists() ? statusDoc.data().lastRun?.toMillis() : 0;
      const now = Date.now();
      
      // Extended throttle: 2 hours
      if (now - lastRun < 120 * 60 * 1000) {
        console.log('[IntelligenceService] Cycle skipped (institutional throttle active)');
        return;
      }

      const allEnrichedItems: any[] = [];

      const allRawItems: any[] = [];
      for (const source of SOURCES) {
        try {
          const response = await fetch(`/api/rss?url=${encodeURIComponent(source)}`);
          if (!response.ok) continue;
          const rawItems = await response.json();
          const topItems = rawItems.slice(0, 3).map((item: any) => ({
            ...item,
            source
          }));
          allRawItems.push(...topItems);
        } catch (e) {
          console.error(`[IntelligenceService] Error fetching source ${source}:`, e);
        }
      }

      if (allRawItems.length === 0) {
        console.log('[IntelligenceService] No items to analyze');
        return;
      }

      // Batch analyze with Gemini to save quota
      let aiResponse;
      let retries = 3;
      while (retries > 0) {
        try {
          aiResponse = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: [{ 
              role: 'user', 
              parts: [{ 
                text: `Analyze the following ${allRawItems.length} news items. 
                For each item, provide:
                1. A 1-sentence institutional summary.
                2. A category (Macro, Policy, Tech, Market, Calendar, or Sentiment).
                3. A sentiment score from -1.0 (Very Bearish) to 1.0 (Very Bullish).
                
                Return the results as a JSON array of objects with keys: summary, category, sentimentScore.
                
                News Items:
                ${allRawItems.map((item, i) => `${i+1}. ${item.text}`).join('\n')}` 
              }] 
            }],
            config: {
              responseMimeType: "application/json"
            }
          });
          break; // Success
        } catch (e: any) {
          if (e.message?.includes('429') || e.message?.includes('RESOURCE_EXHAUSTED')) {
            console.warn(`[IntelligenceService] Quota hit, retrying in 10s... (${retries} left)`);
            await new Promise(r => setTimeout(r, 10000));
            retries--;
          } else {
            throw e;
          }
        }
      }

      if (!aiResponse) {
        throw new Error('Failed to get AI response after retries');
      }
      
      let analysis: any[] = [];
      try {
        const text = aiResponse.text;
        analysis = JSON.parse(text || '[]');
      } catch (e) {
        console.error('[IntelligenceService] Error parsing AI response:', e);
      }
      
      for (let i = 0; i < allRawItems.length; i++) {
        const item = allRawItems[i];
        const result = analysis[i];
        if (!result) continue;
        
        const isIndianFeed = item.source.includes('indiatimes') || item.source.includes('livemint') || item.source.includes('investing.com');
        const sentimentScore = typeof result.sentimentScore === 'number' ? result.sentimentScore : parseFloat(result.sentimentScore) || 0;

        const enrichedItem = {
          id: item.id || Math.random().toString(),
          title: item.text,
          link: item.link,
          summary: result.summary || item.description,
          description: item.description,
          category: isIndianFeed ? 'Sentiment' : (item.source.includes('dailyfx') ? 'Market' : (result.category || 'Market')),
          sentiment: sentimentScore,
          timestamp: item.timestamp || Date.now(),
          image: `https://picsum.photos/seed/${Math.random()}/800/600`
        };

        allEnrichedItems.push(enrichedItem);

        // Broadcast high impact sentiment
        if (Math.abs(sentimentScore) > 0.5) {
          await fetch('/api/sentiment/broadcast', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              insight: {
                title: item.text,
                sentiment: sentimentScore,
                source: isIndianFeed ? 'SentiTrade Pipeline' : 'ClearPath Engine',
                timestamp: Date.now()
              }
            })
          });
        }
      }

      // 2. Sync with Server
      await fetch('/api/institutional-feed/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: allEnrichedItems })
      });

      // 3. Update status in Firestore
      try {
        await setDoc(doc(db, 'system', 'intelligence_status'), {
          lastRun: serverTimestamp(),
          itemCount: allEnrichedItems.length
        });
      } catch (e) {
        handleFirestoreError(e, OperationType.WRITE, 'system/intelligence_status');
      }

      console.log('[IntelligenceService] Cycle complete');
    } catch (error) {
      console.error('[IntelligenceService] Cycle error:', error);
    }
  }
}
