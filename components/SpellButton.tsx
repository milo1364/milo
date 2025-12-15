import React from 'react';
import { Edit2, Trash2 } from 'lucide-react';
import { Spell } from '../types';
import { getIcon } from '../constants';

interface SpellButtonProps {
  spell: Spell;
  isSelected: boolean;
  onClick: () => void;
  onEdit?: (spell: Spell) => void;
  onDelete?: (spellId: string) => void;
  disabled: boolean;
}

export const SpellButton: React.FC<SpellButtonProps> = ({ 
  spell, 
  isSelected, 
  onClick, 
  onEdit, 
  onDelete, 
  disabled 
}) => {
  const Icon = getIcon(spell.iconName);
  
  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) onEdit(spell);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) onDelete(spell.id);
  };

  return (
    <div className="relative group w-full h-full">
      <button
        onClick={onClick}
        disabled={disabled}
        className={`
          relative flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-300 w-full h-full
          ${disabled ? 'opacity-50 cursor-not-allowed grayscale' : 'cursor-pointer hover:-translate-y-1'}
          ${isSelected 
            ? 'bg-alchemy-primary/20 border-alchemy-primary shadow-[0_0_15px_rgba(99,102,241,0.5)]' 
            : 'bg-alchemy-surface border-slate-700 hover:border-slate-500 hover:bg-slate-800'
          }
        `}
      >
        <div className={`mb-3 p-3 rounded-full ${isSelected ? 'bg-alchemy-primary text-white' : 'bg-slate-700 text-slate-300'}`}>
          <Icon size={24} />
        </div>
        <h3 className="font-bold text-sm mb-1 text-center">{spell.title}</h3>
        <p className="text-xs text-slate-400 text-center line-clamp-2">{spell.description}</p>
      </button>

      {/* Edit/Delete Actions for Custom Spells */}
      {spell.isCustom && !disabled && (
        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={handleEdit}
            className="p-1.5 bg-slate-700 rounded-full text-slate-300 hover:text-white hover:bg-slate-600 shadow-md"
            title="ویرایش"
          >
            <Edit2 size={12} />
          </button>
          <button 
            onClick={handleDelete}
            className="p-1.5 bg-slate-700 rounded-full text-red-400 hover:text-red-300 hover:bg-slate-600 shadow-md"
            title="حذف"
          >
            <Trash2 size={12} />
          </button>
        </div>
      )}
    </div>
  );
};