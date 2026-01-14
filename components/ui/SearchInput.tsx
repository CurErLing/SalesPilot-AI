
import React from 'react';
import { Search, X } from 'lucide-react';

interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    onClear?: () => void;
    containerClassName?: string;
}

export const SearchInput: React.FC<SearchInputProps> = ({ 
    value, 
    onChange, 
    onClear, 
    className = '', 
    containerClassName = '',
    placeholder = "搜索...",
    ...props 
}) => {
    return (
        <div className={`relative ${containerClassName}`}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input 
                type="text"
                placeholder={placeholder}
                className={`w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all ${className}`}
                value={value}
                onChange={onChange}
                {...props}
            />
            {value && onClear && (
                <button 
                    onClick={onClear}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-200/50 transition-colors"
                    type="button"
                >
                    <X className="w-3.5 h-3.5" />
                </button>
            )}
        </div>
    );
};
