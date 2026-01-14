
import React, { forwardRef, useMemo } from 'react';
import { FieldMetadata } from '../../types';
import { Sparkles, Info } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ElementType;
  metadata?: FieldMetadata; // NEW: Pass metadata for lineage
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', label, error, icon: Icon, metadata, ...props }, ref) => {
    
    // Check if updated within the last 60 seconds (simulating "Just now" / Session update)
    const isRecentlyUpdated = useMemo(() => {
        if (!metadata) return false;
        const now = Date.now();
        return (now - metadata.timestamp) < 60000; 
    }, [metadata]);

    const formattedDate = useMemo(() => {
        if (!metadata) return '';
        return new Date(metadata.timestamp).toLocaleString();
    }, [metadata]);

    return (
      <div className="w-full">
        <div className="flex justify-between items-end mb-1.5">
            {label && (
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide">
                {label}
            </label>
            )}
            
            {/* Metadata Indicator */}
            {metadata && (
                <div className="group relative flex items-center">
                    <span className={`text-[10px] flex items-center gap-1 cursor-help transition-colors ${isRecentlyUpdated ? 'text-emerald-600 font-bold' : 'text-slate-400'}`}>
                        {isRecentlyUpdated ? (
                            <>
                                <Sparkles className="w-3 h-3 animate-pulse" />
                                <span>AI 更新</span>
                            </>
                        ) : (
                            <span className="flex items-center gap-1 hover:text-indigo-500">
                                <Info className="w-3 h-3" /> 来源
                            </span>
                        )}
                    </span>
                    
                    {/* Tooltip */}
                    <div className="absolute right-0 bottom-full mb-2 w-48 bg-slate-800 text-white text-[10px] p-2 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                        <p className="font-bold text-slate-200 mb-0.5">数据来源:</p>
                        <p className="mb-1">{metadata.source}</p>
                        <p className="text-slate-400">{formattedDate}</p>
                    </div>
                </div>
            )}
        </div>

        <div className="relative">
          {Icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
              <Icon className="w-4 h-4" />
            </div>
          )}
          <input
            ref={ref}
            className={`
              w-full rounded-lg border bg-white 
              text-sm text-slate-800 placeholder:text-slate-300
              focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 
              outline-none transition-all duration-500
              disabled:opacity-50 disabled:bg-slate-50 disabled:cursor-not-allowed
              ${Icon ? 'pl-9 pr-3 py-2.5' : 'px-3 py-2.5'}
              ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : ''}
              ${isRecentlyUpdated ? 'border-emerald-400 ring-2 ring-emerald-500/10 bg-emerald-50/10' : 'border-slate-200'}
              ${className}
            `}
            {...props}
          />
        </div>
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
