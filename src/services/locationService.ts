import { GoogleGenAI } from "@google/genai";

// Lazy AI initialization to prevent top-level module errors
let aiInstance: any = null;
const getAI = () => {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY || '';
    aiInstance = new GoogleGenAI({ apiKey });
  }
  return aiInstance;
};

export async function getFriendlyLocation(lat: number, lng: number): Promise<string> {
  try {
    const response = await getAI().models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `What is the name of the city and country at latitude ${lat} and longitude ${lng}? Just give the city and country name.`,
      config: {
        tools: [{ googleMaps: {} }],
        toolConfig: {
          retrievalConfig: {
            latLng: {
              latitude: lat,
              longitude: lng
            }
          }
        }
      },
    });

    return response.text?.trim() || "Unknown Location";
  } catch (error) {
    console.error("Error getting friendly location:", error);
    return `${lat.toFixed(2)}, ${lng.toFixed(2)}`;
  }
}
