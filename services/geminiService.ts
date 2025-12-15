
import { GoogleGenAI } from "@google/genai";
import { Spell, AlchemyMode, AI_MODELS } from "../types";

const BASE_SYSTEM_INSTRUCTION = `
You are a highly intelligent Persian (Farsi) language assistant. 
Your goal is to process text accurately, maintaining the nuances of the Persian language and culture.
Always respond in the requested language. If the task is to fix grammar or formalize, keep the output in Persian.
If the task is translation, translate accurately.
Ensure the output is clean, formatted correctly, and ready for use.
`;

export const transformText = async (
  text: string, 
  spell: Spell, 
  customPrompt?: string,
  modelId: string = 'gemini'
): Promise<string> => {
  try {
    // Initialize inside the function to ensure process.env.API_KEY is available
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    // Find the selected model config to get the actual modelName
    const selectedModelConfig = AI_MODELS.find(m => m.id === modelId) || AI_MODELS[0];
    const actualModelName = selectedModelConfig.modelName;

    let finalPrompt = spell.promptTemplate;

    // Handle Custom Mode specifically where the prompt comes from user input at runtime
    if (spell.id === AlchemyMode.Custom) {
      if (!customPrompt) return "Please provide a custom prompt.";
      finalPrompt = finalPrompt.replace('{{prompt}}', customPrompt);
    }

    // Replace the text placeholder
    if (finalPrompt.includes('{{text}}')) {
      finalPrompt = finalPrompt.replace('{{text}}', text);
    } else {
      finalPrompt = `${finalPrompt}\n\n${text}`;
    }

    // Configure model behavior based on the selected persona (ID)
    const config: any = {
      systemInstruction: BASE_SYSTEM_INSTRUCTION,
    };

    if (modelId === 'deepseek') {
      // DeepSeek Style -> Uses Thinking Model via Gemini 2.5
      // 2048 is a reasonable budget for standard reasoning tasks
      config.thinkingConfig = { thinkingBudget: 2048 };
    } else if (modelId === 'copilot') {
      // Copilot Style -> More Creative/Conversational
      config.temperature = 0.9;
      config.topP = 0.95;
      config.systemInstruction += "\nAdopt a helpful, creative, and friendly tone similar to a creative co-pilot.";
    } else {
      // Default Gemini -> Balanced
      config.temperature = 0.7;
    }

    const response = await ai.models.generateContent({
      model: actualModelName,
      contents: finalPrompt,
      config: config
    });

    return response.text || "No output generated.";

  } catch (error) {
    console.error("Gemini API Error:", error);
    if (error instanceof Error) {
        return `Error: ${error.message}`;
    }
    // Handle JSON error objects that might be returned
    try {
        return `Error: ${JSON.stringify(error)}`;
    } catch {
        return "An unknown error occurred while processing the text.";
    }
  }
};
