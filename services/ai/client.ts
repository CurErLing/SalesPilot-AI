
import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || '';

export const ai = new GoogleGenAI({ apiKey });

export const MODEL_FAST = 'gemini-3-flash-preview';
export const MODEL_REASONING = 'gemini-3-pro-preview';
