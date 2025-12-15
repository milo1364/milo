import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { Spell } from '../types';
import { ICON_MAP } from '../constants';

interface SpellModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (spell: Spell) => void;
  editingSpell?: Spell | null;
}

export const SpellModal: React.FC<SpellModalProps> = ({ isOpen, onClose, onSave, editingSpell }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [promptTemplate, setPromptTemplate] = useState('');
  const [iconName, setIconName] = useState('Sparkles');

  useEffect(() => {
    if (editingSpell) {
      setTitle(editingSpell.title);
      setDescription(editingSpell.description);
      setPromptTemplate(editingSpell.promptTemplate);
      setIconName(editingSpell.iconName);
    } else {
      setTitle('');
      setDescription('');
      setPromptTemplate('');
      setIconName('Zap');
    }
  }, [editingSpell, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: editingSpell ? editingSpell.id : crypto.randomUUID(),
      title,
      description,
      promptTemplate,
      iconName,
      isCustom: true
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
      <div className="bg-alchemy-surface border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-slate-700 bg-alchemy-dark/50">
          <h2 className="text-lg font-bold text-white">
            {editingSpell ? 'ویرایش قالب' : 'افزودن قالب جدید'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">عنوان قالب</label>
            <input
              required
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 text-white focus:border-alchemy-primary focus:outline-none"
              placeholder="مثلاً: ساده‌سازی"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">توضیح کوتاه</label>
            <input
              required
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 text-white focus:border-alchemy-primary focus:outline-none"
              placeholder="توضیحی که زیر دکمه نمایش داده می‌شود"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">آیکون</label>
            <div className="grid grid-cols-6 gap-2 bg-slate-800 p-3 rounded-lg border border-slate-600">
              {Object.keys(ICON_MAP).map((name) => {
                const Icon = ICON_MAP[name];
                return (
                  <button
                    key={name}
                    type="button"
                    onClick={() => setIconName(name)}
                    className={`p-2 rounded-lg flex items-center justify-center transition-all ${
                      iconName === name ? 'bg-alchemy-primary text-white shadow-lg scale-110' : 'text-slate-400 hover:bg-slate-700'
                    }`}
                  >
                    <Icon size={20} />
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              دستور هوش مصنوعی (Prompt)
              <span className="text-xs text-alchemy-accent mr-2 block mt-1 font-normal">
                از <code>{'{{text}}'}</code> برای مشخص کردن جایگاه متن ورودی استفاده کنید.
              </span>
            </label>
            <textarea
              required
              value={promptTemplate}
              onChange={(e) => setPromptTemplate(e.target.value)}
              className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 text-white h-32 focus:border-alchemy-primary focus:outline-none font-mono text-sm"
              placeholder="مثلاً: متن زیر را به زبان ساده بازنویسی کن:&#10;&#10;{{text}}"
              dir="ltr"
            />
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-slate-300 hover:bg-slate-800 transition-colors"
            >
              انصراف
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2 bg-alchemy-primary hover:bg-indigo-600 text-white rounded-lg font-medium transition-colors shadow-lg shadow-indigo-500/20"
            >
              <Save size={18} />
              {editingSpell ? 'ذخیره تغییرات' : 'ایجاد قالب'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};