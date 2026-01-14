
import { Type } from "@google/genai";
import { Customer } from "../../types";
import { cleanAndParseJSON } from "../../utils/jsonHelper";
import { ai, MODEL_FAST, MODEL_REASONING } from "./client";
import { 
  getAssessmentPrompt, 
  getStrategyPrompt, 
  getSalesPitchPrompt, 
  getIceBreakerPrompt, 
  getVisitPlanPrompt 
} from "../../prompts/index";

// 2. Customer Value Assessment (Scoring)
export const generateAssessment = async (customer: Customer): Promise<{ 
    score: number; 
    deal_health: 'Healthy' | 'At Risk' | 'Critical';
    summary: string;
    categories: {
        name: string; 
        score: number;
        status: 'Good' | 'Gap';
        evidence: string[]; 
        missing: string[]; 
        coaching_tip: string; 
    }[] 
}> => {
  try {
    const response = await ai.models.generateContent({
      model: MODEL_FAST,
      contents: getAssessmentPrompt(customer),
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.INTEGER },
            deal_health: { type: Type.STRING, enum: ['Healthy', 'At Risk', 'Critical'] },
            summary: { type: Type.STRING },
            categories: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  score: { type: Type.INTEGER },
                  status: { type: Type.STRING, enum: ['Good', 'Gap'] },
                  evidence: { type: Type.ARRAY, items: { type: Type.STRING } },
                  missing: { type: Type.ARRAY, items: { type: Type.STRING } },
                  coaching_tip: { type: Type.STRING }
                }
              }
            }
          }
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response");
    return cleanAndParseJSON(text);
  } catch (error) {
    console.error("Error assessing customer:", error);
    return { 
        score: 0, 
        deal_health: 'Critical', 
        summary: "无法生成评估报告（解析失败或服务错误）。", 
        categories: [] 
    };
  }
};

// 3. Generate Strategy & Action Plan
export const generateStrategy = async (customer: Customer): Promise<{
    immediate_action: string;
    email_draft: { subject: string; body: string };
    call_script: string;
    objections: { objection: string; response: string }[];
    proposal_focus?: { value_prop: string; case_study: string; pricing_strategy: string };
}> => {
  try {
    const response = await ai.models.generateContent({
      model: MODEL_REASONING,
      contents: getStrategyPrompt(customer),
      config: {
          responseMimeType: "application/json",
          responseSchema: {
              type: Type.OBJECT,
              properties: {
                  immediate_action: { type: Type.STRING },
                  email_draft: {
                      type: Type.OBJECT,
                      properties: {
                          subject: { type: Type.STRING },
                          body: { type: Type.STRING }
                      }
                  },
                  call_script: { type: Type.STRING },
                  objections: {
                      type: Type.ARRAY,
                      items: {
                          type: Type.OBJECT,
                          properties: {
                              objection: { type: Type.STRING },
                              response: { type: Type.STRING }
                          }
                      }
                  },
                  proposal_focus: {
                      type: Type.OBJECT,
                      properties: {
                          value_prop: { type: Type.STRING },
                          case_study: { type: Type.STRING },
                          pricing_strategy: { type: Type.STRING }
                      }
                  }
              }
          }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response");
    return cleanAndParseJSON(text);
  } catch (error) {
    console.error("Error generating strategy:", error);
    return {
        immediate_action: "生成策略失败，请重试。",
        email_draft: { subject: "", body: "" },
        call_script: "",
        objections: []
    };
  }
};

// 7. Generate Sales Pitch
export const generateSalesPitch = async (painPoint: string, customer: Customer): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: MODEL_FAST,
            contents: getSalesPitchPrompt(painPoint, customer),
        });
        return response.text || "";
    } catch (e) {
        console.error("Error generating pitch:", e);
        return "";
    }
};

// 8. Generate Ice Breaker
export const generateIceBreaker = async (noteContent: string, customer: Customer): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: MODEL_FAST,
            contents: getIceBreakerPrompt(noteContent, customer),
        });
        return response.text || "";
    } catch (e) {
        console.error(e);
        return "";
    }
};

// 11. NEW: Generate Visit Plan (Agenda & Questions)
export const generateVisitPlan = async (customer: Customer, goal: string, stakeholders: any[]): Promise<{
    agendaItems: string[];
    targetQuestions: string[];
    requiredMaterials: string[];
}> => {
    try {
        const response = await ai.models.generateContent({
            model: MODEL_REASONING,
            contents: getVisitPlanPrompt(customer, goal, stakeholders),
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        agendaItems: { type: Type.ARRAY, items: { type: Type.STRING } },
                        targetQuestions: { type: Type.ARRAY, items: { type: Type.STRING } },
                        requiredMaterials: { type: Type.ARRAY, items: { type: Type.STRING } }
                    }
                }
            }
        });

        const text = response.text;
        if (!text) throw new Error("No response");
        return cleanAndParseJSON(text);
    } catch (e) {
        console.error("Error generating visit plan:", e);
        return { agendaItems: [], targetQuestions: [], requiredMaterials: [] };
    }
};
