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
    const systemPrompt = `You are a food recognition expert helping users track foods for allergy and intolerance detection. Analyze the image and identify ALL food items visible.

IMPORTANT: Use GENERIC food names since the user needs to track ingredients, not specific varieties or preparations.
- Pasta shapes (fusilli, penne, spaghetti) → "pasta"
- Chicken preparations (grilled, fried, baked) → "chicken"  
- Bread types (sourdough, white, whole wheat) → "bread"
- Rice varieties (basmati, jasmine, brown) → "rice"
- Cheese types (cheddar, mozzarella, parmesan) → "cheese"
- Sauces → break down to base ingredients (marinara → "tomatoes", pesto → "basil", "pine nuts", alfredo → "cream", "cheese")

Return ONLY the generic food names in a JSON array - no portions, descriptions, or quantities.

Examples:
- Grilled chicken breast → "chicken"
- Fusilli pasta with marinara sauce → "pasta", "tomatoes"
- Cheddar cheese sandwich on sourdough → "cheese", "bread"
- 3 chocolate chip cookies → "cookies", "chocolate"
- Pesto pasta → "pasta", "basil", "pine nuts"

Be comprehensive - include all foods, ingredients, sauces, and garnishes you can identify.`;

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
