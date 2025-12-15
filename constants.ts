
import { 
  FileText, 
  Languages, 
  ScrollText, 
  Sparkles, 
  PenTool, 
  Feather,
  Wand2,
  Zap,
  BookOpen,
  Ghost,
  MessageCircle,
  Briefcase
} from 'lucide-react';
import { AlchemyMode, Spell } from './types';

export const ICON_MAP: Record<string, any> = {
  FileText,
  Languages,
  ScrollText,
  PenTool,
  Feather,
  Wand2,
  Zap,
  BookOpen,
  Ghost,
  MessageCircle,
  Briefcase,
  Sparkles
};

export const getIcon = (name: string) => {
  return ICON_MAP[name] || Sparkles;
};

export const DEFAULT_SPELLS: Spell[] = [
  {
    id: AlchemyMode.SUMMARIZE,
    title: "خلاصه‌سازی",
    description: "متن را کوتاه و چکیده کنید",
    iconName: "FileText",
    promptTemplate: "Summarize the following text in Persian (Farsi). Keep the summary concise but informative:\n\n{{text}}",
  },
  {
    id: AlchemyMode.FORMALIZE,
    title: "رسمی‌سازی",
    description: "تبدیل متن به زبان اداری و رسمی",
    iconName: "ScrollText",
    promptTemplate: "Rewrite the following Persian text to be formal, polite, and professional (Official/Edari tone):\n\n{{text}}",
  },
  {
    id: AlchemyMode.GRAMMAR,
    title: "ویراستاری",
    description: "اصلاح غلط‌های املایی و نگارشی",
    iconName: "PenTool",
    promptTemplate: "Correct any grammatical errors and improve the fluency of the following Persian text without changing its meaning:\n\n{{text}}",
  },
  {
    id: AlchemyMode.TRANSLATE_FA,
    title: "ترجمه به فارسی",
    description: "متن انگلیسی را به فارسی برگردانید",
    iconName: "Languages",
    promptTemplate: "Translate the following text to Persian (Farsi):\n\n{{text}}",
  },
  {
    id: AlchemyMode.TRANSLATE_EN,
    title: "ترجمه به انگلیسی",
    description: "متن فارسی را به انگلیسی برگردانید",
    iconName: "Languages",
    promptTemplate: "Translate the following Persian text to English:\n\n{{text}}",
  },
  {
    id: AlchemyMode.POETRY,
    title: "شعرگونه",
    description: "تبدیل مفهوم متن به شعر",
    iconName: "Feather",
    promptTemplate: "Turn the concepts in the following text into a short Persian poem (Sher-e-Farsi) in the style of classical poets if suitable, or modern poetry:\n\n{{text}}",
  },
  {
    id: AlchemyMode.Custom,
    title: "جادوی آزاد",
    description: "دستور دلخواه خود را بنویسید",
    iconName: "Wand2",
    promptTemplate: "{{prompt}}:\n\n{{text}}",
  },
];
