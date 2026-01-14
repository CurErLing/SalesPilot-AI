
import { ai, MODEL_FAST } from "./client";
import { getWebResearchPrompt } from "../../prompts/index";

// 4. Web Research
export const performWebResearch = async (query: string): Promise<{ text: string; sources: { title: string; uri: string }[] }> => {
  try {
    const response = await ai.models.generateContent({
      model: MODEL_FAST,
      contents: getWebResearchPrompt(query),
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text || "未找到相关信息。";
    
    // Extract grounding metadata safely
    const sources: { title: string; uri: string }[] = [];
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    
    if (chunks) {
      chunks.forEach((chunk: any) => {
        if (chunk.web) {
          sources.push({ title: chunk.web.title, uri: chunk.web.uri });
        }
      });
    }

    return { text, sources };
  } catch (error) {
    console.error("Error performing research:", error);
    return { text: "调研请求失败，请稍后重试。", sources: [] };
  }
};
