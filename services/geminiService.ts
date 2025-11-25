import { GoogleGenAI, Type } from "@google/genai";
import { ArtStyle, GeneratedData } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

interface AnalysisResult {
  imagePrompt: string;
  shortTitle: string;
  summary: string;
}

/**
 * Step 1: Analyze text to generate an image prompt and a short title.
 */
async function analyzeTextAndCreatePrompt(text: string, style: ArtStyle): Promise<AnalysisResult> {
  const model = "gemini-2.5-flash";
  
  const systemInstruction = `
    You are an expert creative director for WeChat Official Accounts (公众号). 
    Your task is to analyze the provided article content and generate:
    1. A highly descriptive, English image generation prompt suitable for a 2.35:1 aspect ratio cover image.
    2. A short, punchy Chinese title (under 15 chars) that captures the essence.
    3. A one-sentence summary.
    
    The image prompt must strictly adhere to the "${style}" art style.
    Ensure the image prompt describes a scene with NO TEXT, clear focal points, and good composition for a wide banner.

    SAFETY & AESTHETIC GUIDELINES (STRICT):
    - ABSOLUTELY NO EXPLOSIONS, DEBRIS, FRAGMENTATION, SHARDS, BROKEN GLASS, FIRE, SMOKE, or CHAOTIC BURSTS.
    - Avoid sharp, jagged, or aggressive shapes that look like a blast or destruction.
    - Do NOT use words like "burst", "explode", "shatter", "chaos", "collision", "impact" in the prompt.
    - If the topic suggests energy or technology, represent it with "smooth flows", "connected networks", "gentle waves", or "glowing paths" instead of chaotic particles.
    - The visual mood must be STABLE, CALM, HARMONIOUS, and PROFESSIONAL.
    - Focus on soft lighting, smooth gradients, and organized composition.
  `;

  const response = await ai.models.generateContent({
    model,
    contents: text,
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          imagePrompt: { type: Type.STRING, description: "Detailed English image generation prompt. No text. Safe and calm visuals." },
          shortTitle: { type: Type.STRING, description: "Short Chinese title for the article preview." },
          summary: { type: Type.STRING, description: "Brief summary of the article." }
        },
        required: ["imagePrompt", "shortTitle", "summary"]
      }
    }
  });

  const jsonText = response.text || "{}";
  try {
    return JSON.parse(jsonText) as AnalysisResult;
  } catch (e) {
    console.error("Failed to parse JSON from Gemini", e);
    throw new Error("Failed to analyze text. Please try again.");
  }
}

/**
 * Step 2: Generate the image using the prompt.
 */
async function generateImage(prompt: string): Promise<string> {
  // Using gemini-2.5-flash-image for standard generation. 
  const model = "gemini-2.5-flash-image"; 

  const response = await ai.models.generateContent({
    model,
    contents: {
      parts: [{ text: prompt }]
    },
    config: {
      imageConfig: {
        aspectRatio: "16:9", // Closest to WeChat's 2.35:1
      }
    }
  });

  // Extract image
  let base64Image = "";
  if (response.candidates && response.candidates[0].content && response.candidates[0].content.parts) {
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData && part.inlineData.data) {
        base64Image = part.inlineData.data;
        break; // Found the image
      }
    }
  }

  if (!base64Image) {
    throw new Error("No image generated.");
  }

  return `data:image/jpeg;base64,${base64Image}`;
}

/**
 * Main Orchestrator
 */
export async function generateWeChatCover(articleText: string, style: ArtStyle): Promise<GeneratedData> {
  // 1. Analyze
  const analysis = await analyzeTextAndCreatePrompt(articleText, style);
  
  // 2. Generate Image
  // We enhance the prompt with quality boosters and safety modifiers
  // Explicitly adding 'serene', 'smooth', 'stable' to override any potential chaotic interpretation
  const enhancedPrompt = `${analysis.imagePrompt}, masterpiece, high resolution, 8k, ${style} style, wide angle, cinematic lighting, harmonious composition, calm atmosphere, serene, smooth lines, organized structure, aesthetic, minimal clutter`;
  const imageUrl = await generateImage(enhancedPrompt);

  return {
    imageUrl,
    imagePrompt: enhancedPrompt,
    suggestedTitle: analysis.shortTitle,
    summary: analysis.summary
  };
}
