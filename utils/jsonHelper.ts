
/**
 * Helper to clean and parse JSON from LLM responses.
 * LLMs often wrap JSON in markdown code blocks (```json ... ```) or include conversational text.
 */
export const cleanAndParseJSON = <T>(text: string): T => {
  try {
    // 1. Try direct parse (Best case)
    return JSON.parse(text);
  } catch (e) {
    // 2. Try removing markdown code blocks (Common case)
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch && jsonMatch[1]) {
      try {
        return JSON.parse(jsonMatch[1]);
      } catch (e2) {
        console.error("Failed to parse cleaned JSON:", e2);
        throw new Error("Invalid JSON format from AI");
      }
    }
    
    // 3. Fallback: try to find the first '{' and last '}' (Messy case)
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1) {
       try {
        return JSON.parse(text.substring(firstBrace, lastBrace + 1));
       } catch (e3) {
         throw new Error("Invalid JSON format from AI");
       }
    }
    
    // If all else fails
    throw e;
  }
};
