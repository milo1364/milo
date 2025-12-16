
import React, { useState, useEffect } from 'react';
import { X, Key, Save, ExternalLink } from 'lucide-react';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (key: string) => void;
  initialKey?: string;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose, onSave, initialKey = '' }) => {
  const [key, setKey] = useState(initialKey);

  useEffect(() => {
    setKey(initialKey);
  }, [initialKey, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(key.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-alchemy-surface border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
        
        <div className="flex items-center justify-between p-4 border-b border-slate-700 bg-alchemy-dark/50">
          <div className="flex items-center gap-2">
            <Key className="text-alchemy-accent" size={24} />
            <h2 className="text-lg font-bold text-white">تنظیم کلید API</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 dir-rtl" dir="rtl">
          <div className="space-y-2">
             <p className="text-sm text-slate-300 leading-relaxed">
               برای استفاده از برنامه در این محیط، نیاز به کلید Gemini API دارید. این کلید فقط در مرورگر شما ذخیره می‌شود.
             </p>
             <a 
               href="https://aistudio.google.com/app/apikey" 
               target="_blank" 
               rel="noopener noreferrer"
               className="inline-flex items-center gap-1 text-xs text-alchemy-primary hover:text-indigo-400 transition-colors"
             >
               دریافت کلید رایگان از Google AI Studio
               <ExternalLink size={12} />
             </a>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">کلید API شما</label>
            <input
              type="password"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full bg-slate-900 border border-slate-600 rounded-xl p-3 text-white focus:border-alchemy-primary focus:outline-none font-mono text-sm text-center tracking-wider"
              dir="ltr"
              autoFocus
            />
          </div>

          <button
            type="submit"
            disabled={!key.trim()}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-alchemy-primary hover:bg-indigo-600 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save size={18} />
            ذخیره و ادامه
          </button>
        </form>
      </div>
    </div>
  );
};
