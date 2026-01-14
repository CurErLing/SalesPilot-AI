
import React from 'react';

interface TabItem {
  id: string;
  label: string;
  icon?: React.ElementType;
}

interface TabsProps {
  items: TabItem[];
  activeId: string;
  onChange: (id: any) => void;
  variant?: 'pills' | 'underline';
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({ 
  items, 
  activeId, 
  onChange, 
  variant = 'underline',
  className = ''
}) => {
  
  if (variant === 'pills') {
    return (
      <div className={`flex p-1 bg-slate-100 rounded-xl border border-slate-200/60 ${className}`}>
        {items.map((item) => {
          const isActive = activeId === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onChange(item.id)}
              className={`
                flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200
                ${isActive 
                  ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200' 
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}
              `}
            >
              {Icon && <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />}
              {item.label}
            </button>
          );
        })}
      </div>
    );
  }

  // Underline variant (Default)
  return (
    <div className={`flex border-b border-slate-100 bg-slate-50/50 ${className}`}>
      {items.map((item) => {
        const isActive = activeId === item.id;
        const Icon = item.icon;
        return (
          <button 
            key={item.id}
            onClick={() => onChange(item.id)}
            className={`
              flex-1 py-3 text-sm font-medium border-b-2 transition-colors flex items-center justify-center gap-2
              ${isActive 
                ? 'border-indigo-500 text-indigo-700 bg-white' 
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'}
            `}
          >
            {Icon && <Icon className="w-4 h-4" />}
            {item.label}
          </button>
        );
      })}
    </div>
  );
};
