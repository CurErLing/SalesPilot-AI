
import { Type } from "@google/genai";
import { cleanAndParseJSON } from "../../utils/jsonHelper";
import { ai, MODEL_FAST } from "./client";
import { 
  getAudioAnalysisPrompt, 
  getTranscriptionPrompt, 
  getInsightsFromTranscriptPrompt 
} from "../../prompts/index";

// 6a. Process Meeting Audio (Legacy/Direct)
export const processMeetingAudio = async (base64Audio: string, mimeType: string): Promise<{
    title: string;
    type: 'Meeting' | 'Call';
    summary: string;
    nextSteps: string;
    sentiment: 'Positive' | 'Neutral' | 'Negative' | 'Risk';
    transcript: string;
}> => {
    try {
        const response = await ai.models.generateContent({
            model: MODEL_FAST,
            contents: {
                parts: [
                    {
                        inlineData: {
                            mimeType: mimeType,
                            data: base64Audio
                        }
                    },
                    {
                        text: getAudioAnalysisPrompt()
                    }
                ]
            },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        type: { type: Type.STRING, enum: ['Meeting', 'Call'] },
                        title: { type: Type.STRING },
                        summary: { type: Type.STRING },
                        nextSteps: { type: Type.STRING },
                        sentiment: { type: Type.STRING, enum: ['Positive', 'Neutral', 'Negative', 'Risk'] },
                        transcript: { type: Type.STRING }
                    }
                }
            }
        });
        
        const text = response.text;
        if(!text) throw new Error("No transcription generated");
        return cleanAndParseJSON(text);

    } catch (error) {
        console.error("Error processing audio:", error);
        throw error;
    }
};

// 6b. Generate Transcript ONLY (Step 1)
export const generateMeetingTranscript = async (base64Audio: string, mimeType: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: MODEL_FAST,
            contents: {
                parts: [
                    {
                        inlineData: {
                            mimeType: mimeType,
                            data: base64Audio
                        }
                    },
                    {
                        text: getTranscriptionPrompt()
                    }
                ]
            }
        });
        
        return response.text || "";
    } catch (error) {
        console.error("Error generating transcript:", error);
        throw error;
    }
};

// 6c. Generate Insights from Transcript (Step 2)
export const generateMeetingInsights = async (transcript: string): Promise<{
    title: string;
    type: 'Meeting' | 'Call';
    summary: string;
    nextSteps: string;
    sentiment: 'Positive' | 'Neutral' | 'Negative' | 'Risk';
}> => {
    try {
        const response = await ai.models.generateContent({
            model: MODEL_FAST,
            contents: getInsightsFromTranscriptPrompt(transcript),
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        type: { type: Type.STRING, enum: ['Meeting', 'Call'] },
                        title: { type: Type.STRING },
                        summary: { type: Type.STRING },
                        nextSteps: { type: Type.STRING },
                        sentiment: { type: Type.STRING, enum: ['Positive', 'Neutral', 'Negative', 'Risk'] }
                    }
                }
            }
        });

        const text = response.text;
        if(!text) throw new Error("No insights generated");
        return cleanAndParseJSON(text);
    } catch (error) {
        console.error("Error generating insights:", error);
        throw error;
    }
};
