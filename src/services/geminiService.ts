import { GoogleGenAI, Type } from "@google/genai";

// We need to instantiate GoogleGenAI dynamically to ensure we get the latest API key
// if the user selects one via the UI.
const getAi = () => new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface DreamAnalysisResult {
  transcription: string;
  interpretation: string;
}

export async function analyzeDreamAudio(base64Audio: string, mimeType: string): Promise<DreamAnalysisResult> {
  const ai = getAi();
  
  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: {
      parts: [
        {
          inlineData: {
            data: base64Audio,
            mimeType: mimeType,
          },
        },
        {
          text: "Transcribe this dream from the audio. Then, provide a structured psychological interpretation of its core emotional themes and symbols based on recognized archetypes (e.g., Jungian). Return the response in JSON format with two fields: 'transcription' (the exact text of the dream) and 'interpretation' (the structured psychological analysis in Markdown format).",
        },
      ],
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          transcription: {
            type: Type.STRING,
            description: "The transcription of the dream audio.",
          },
          interpretation: {
            type: Type.STRING,
            description: "The structured psychological interpretation in Markdown format.",
          },
        },
        required: ["transcription", "interpretation"],
      },
    },
  });

  const jsonStr = response.text?.trim() || "{}";
  try {
    return JSON.parse(jsonStr) as DreamAnalysisResult;
  } catch (e) {
    console.error("Failed to parse JSON response:", e);
    throw new Error("Failed to parse dream analysis.");
  }
}

export async function generateDreamImage(transcription: string, size: "1K" | "2K" | "4K"): Promise<string> {
  const ai = getAi();
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview',
    contents: {
      parts: [
        {
          text: `A surrealist painting representing the core emotional theme of this dream: ${transcription}`,
        },
      ],
    },
    config: {
      imageConfig: {
        aspectRatio: "16:9",
        imageSize: size
      },
    },
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
  }
  
  throw new Error("No image generated.");
}

export function createDreamChatSession(transcription: string, interpretation: string) {
  const ai = getAi();
  
  return ai.chats.create({
    model: "gemini-3.1-pro-preview",
    config: {
      systemInstruction: `You are a Jungian dream analyst. The user recently had the following dream:\n\nTranscription: ${transcription}\n\nInterpretation: ${interpretation}\n\nAnswer the user's follow-up questions about specific symbols or themes in their dream. Be insightful, empathetic, and focus on psychological archetypes.`,
    },
  });
}

