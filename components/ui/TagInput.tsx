
import React from 'react';
import { X, Plus } from 'lucide-react';

interface TagInputProps {
  label?: React.ReactNode;
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  variant?: 'neutral' | 'red' | 'amber'; // For coloring logic
}

export const TagInput: React.FC<TagInputProps> = ({ 
  label, 
  tags, 
  onChange, 
  placeholder = "+ 添加 (按回车)",
  variant = 'neutral'
}) => {
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const val = e.currentTarget.value.trim();
      if (val && !tags.includes(val)) {
        onChange([...tags, val]);
        e.currentTarget.value = '';
      }
    }
  };

  const removeTag = (index: number) => {
    const newTags = [...tags];
    newTags.splice(index, 1);
    onChange(newTags);
  };

  const styles = {
    neutral: {
      bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200', 
      inputBorder: 'border-slate-300 focus:border-indigo-500' 
    },
    red: {
      bg: 'bg-white', text: 'text-red-600', border: 'border-red-100', 
      inputBorder: 'border-red-200 focus:ring-red-200'
    },
    amber: {
      bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-100',
      inputBorder: 'border-amber-200 focus:ring-amber-200'
    }
  };

  const s = styles[variant];

  return (
    <div>
      {label && <div className="mb-2">{label}</div>}
      
      <div className="flex flex-wrap gap-2 mb-2">
        {tags && tags.map((tag, idx) => (
          <span key={idx} className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs border shadow-sm ${s.bg} ${s.text} ${s.border}`}>
            {tag}
            <button 
              onClick={() => removeTag(idx)} 
              className="hover:opacity-70 p-0.5 rounded-full transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
        {(!tags || tags.length === 0) && (
            <span className="text-xs text-slate-300 italic py-1">暂无内容</span>
        )}
      </div>

      <div className="relative">
        <input
          type="text"
          className={`w-full p-2.5 text-xs bg-white border border-dashed rounded-lg outline-none transition-all ${s.inputBorder}`}
          placeholder={placeholder}
          onKeyDown={handleKeyDown}
        />
        <Plus className="absolute right-3 top-2.5 w-4 h-4 text-slate-300 pointer-events-none" />
      </div>
    </div>
  );
};
