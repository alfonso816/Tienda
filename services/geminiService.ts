
import { GoogleGenAI, Type, GenerateContentResponse, Modality } from "@google/genai";

const getAI = () => new GoogleGenAI({ apiKey: import.meta.env.VITE_API_KEY });

export const getMarketInsights = async (query: string): Promise<{ text: string; sources: any[] }> => {
  const ai = getAI();
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ parts: [{ text: `Provide a professional, concise market analysis for: ${query}. Focus on current trends and data. Format with markdown.` }] }],
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    return {
      text: response.text || "No analysis available.",
      sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks || [],
    };
  } catch (error) {
    console.error("Error fetching market insights:", error);
    throw error;
  }
};

export const analyzeData = async (data: any): Promise<string> => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: [{ parts: [{ text: `Analyze this dashboard data and provide 3 actionable business insights: ${JSON.stringify(data)}` }] }],
      config: {
        systemInstruction: "You are a senior business analyst. Be concise, professional, and data-driven.",
        thinkingConfig: { thinkingBudget: 1000 }
      }
    });
    return response.text || "Analysis failed.";
  } catch (error) {
    console.error("Error analyzing data:", error);
    return "Error generating analysis.";
  }
};

export const streamAIChat = async (message: string, history: any[]) => {
  const ai = getAI();
  const chat = ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: "You are Aura, an elite AI business assistant. You help users manage their enterprise dashboard and provide market intel.",
    },
  });
  
  // Note: Simple wrapper for demonstration, usually history would be passed to ai.chats.create
  return chat.sendMessageStream({ message });
};
