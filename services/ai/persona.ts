
import { Type } from "@google/genai";
import { PersonaData } from "../../types";
import { cleanAndParseJSON } from "../../utils/jsonHelper";
import { ai, MODEL_FAST } from "./client";
import { getExtractPersonaPrompt, getFirmographicsPrompt } from "../../prompts/index";

// 1. Extract Persona Data from Unstructured Text (Context Aware)
export const extractPersonaData = async (rawText: string, currentPersona?: Partial<PersonaData>): Promise<Partial<PersonaData>> => {
  if (!rawText) return {};

  try {
    const response = await ai.models.generateContent({
      model: MODEL_FAST,
      contents: getExtractPersonaPrompt(rawText, currentPersona),
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            industry: { type: Type.STRING, description: "行业" },
            companySize: { type: Type.STRING, description: "公司规模" },
            scenario: { type: Type.STRING, description: "业务场景" },
            projectBackground: { type: Type.STRING, description: "项目背景与核心需求（摘要）" }, // NEW
            keyPainPoints: { type: Type.ARRAY, items: { type: Type.STRING }, description: "关键痛点" },
            customerExpectations: { type: Type.STRING, description: "客户预期/成功标准" },
            currentSolution: { type: Type.STRING, description: "当前方案" },
            decisionMakers: { 
                type: Type.ARRAY, 
                items: { 
                    type: Type.OBJECT,
                    properties: {
                        name: { type: Type.STRING },
                        title: { type: Type.STRING },
                        role: { type: Type.STRING, enum: ['Economic Buyer', 'Technical Buyer', 'User Buyer', 'Coach', 'Gatekeeper', 'Influencer', 'Unknown'] },
                        stance: { type: Type.STRING, enum: ['Champion', 'Positive', 'Neutral', 'Negative', 'Blocker'] }
                    }
                }, 
                description: "决策人列表" 
            },
            budget: { type: Type.STRING, description: "预算" },
            projectTimeline: { type: Type.STRING, description: "项目时间表" },
            competitors: { type: Type.ARRAY, items: { type: Type.STRING }, description: "竞争对手" },
          },
        },
      },
    });

    const text = response.text;
    if (!text) return {};
    
    // Post-process to add IDs if AI doesn't generate them
    const parsed = cleanAndParseJSON<Partial<PersonaData>>(text);
    if (parsed.decisionMakers) {
        parsed.decisionMakers = parsed.decisionMakers.map((dm: any) => ({
            ...dm,
            id: dm.id || Date.now().toString() + Math.random().toString(36).substr(2, 5)
        }));
    }
    return parsed;

  } catch (error) {
    console.error("Error extracting persona:", error);
    return {};
  }
};

// 9. Enrich Firmographics
export const enrichFirmographics = async (companyName: string): Promise<{ industry: string; companySize: string }> => {
    try {
        const response = await ai.models.generateContent({
            model: MODEL_FAST,
            contents: getFirmographicsPrompt(companyName),
            config: {
                tools: [{ googleSearch: {} }],
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        industry: { type: Type.STRING },
                        companySize: { type: Type.STRING }
                    }
                }
            }
        });

        const text = response.text;
        if (!text) return { industry: '', companySize: '' };
        return cleanAndParseJSON(text);
    } catch (e) {
        console.error("Error enriching firmographics:", e);
        return { industry: '', companySize: '' };
    }
};
