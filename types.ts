
export enum AlchemyMode {
  SUMMARIZE = 'SUMMARIZE',
  TRANSLATE_EN = 'TRANSLATE_EN',
  TRANSLATE_FA = 'TRANSLATE_FA',
  FORMALIZE = 'FORMALIZE',
  POETRY = 'POETRY',
  GRAMMAR = 'GRAMMAR',
  Custom = 'CUSTOM'
}

export interface Spell {
  id: string;
  title: string;
  description: string;
  iconName: string;
  promptTemplate: string;
  isCustom?: boolean;
}

export interface TransformationResult {
  id: string;
  original: string;
  transformed: string;
  mode: string;
  timestamp: number;
}

export interface AIModelConfig {
  id: string;
  name: string;
  description: string;
  modelName: string; // The actual Google model string
  isPro?: boolean;
}

export const AI_MODELS: AIModelConfig[] = [
  {
    id: 'gemini',
    name: 'Gemini',
    description: 'سریع و استاندارد (Flash 2.5)',
    modelName: 'gemini-2.5-flash',
    isPro: false
  },
  {
    id: 'copilot',
    name: 'Copilot',
    description: 'خلاق و مکالمه‌محور (Creative)',
    modelName: 'gemini-2.5-flash',
    isPro: false
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    description: 'استدلال عمیق (Thinking)',
    modelName: 'gemini-2.5-flash',
    isPro: true
  }
];
