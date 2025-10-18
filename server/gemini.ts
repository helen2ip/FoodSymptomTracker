// DON'T DELETE THIS COMMENT
// Follow these instructions when using this blueprint:
// - Note that the newest Gemini model series is "gemini-2.5-flash" or gemini-2.5-pro"
//   - do not change this unless explicitly requested by the user

import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface FoodItem {
  name: string;
}

export interface FoodAnalysisResult {
  foods: FoodItem[];
}

export async function analyzeFoodImage(imageBase64: string, mimeType: string): Promise<FoodAnalysisResult> {
  try {
    const systemPrompt = `You are a food recognition expert. Analyze the image and identify ALL food items visible in the image.
    
Return ONLY the names of the foods, nothing else (no portions, no descriptions, no quantities).
For example:
- If you see grilled chicken, return "chicken"
- If you see 3 cookies, return "cookies"
- If you see spaghetti with meatballs, return "spaghetti" and "meatballs" as separate items

Return a JSON array of food names. Be comprehensive - include all foods, ingredients, sauces, and garnishes you can identify.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            foods: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" }
                },
                required: ["name"]
              }
            }
          },
          required: ["foods"]
        }
      },
      contents: [
        {
          inlineData: {
            data: imageBase64,
            mimeType: mimeType
          }
        },
        "Identify all food items in this image and return their names as a JSON array."
      ]
    });

    const rawJson = response.text;
    
    if (rawJson) {
      const data: FoodAnalysisResult = JSON.parse(rawJson);
      return data;
    } else {
      throw new Error("Empty response from Gemini API");
    }
  } catch (error) {
    console.error("Failed to analyze food image:", error);
    throw new Error(`Failed to analyze food image: ${error}`);
  }
}
