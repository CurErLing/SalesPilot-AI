
import React, { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { label: string; value: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = '', label, error, options, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
            {label}
          </label>
        )}
        <div className="relative">
            <select
            ref={ref}
            className={`
                w-full rounded-lg border border-slate-200 bg-white 
                text-sm text-slate-800 font-medium
                focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 
                outline-none transition-all duration-200 appearance-none
                disabled:opacity-50 disabled:bg-slate-50 disabled:cursor-not-allowed
                pl-3 pr-8 py-2.5
                ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : ''}
                ${className}
            `}
            {...props}
            >
            {options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                {opt.label}
                </option>
            ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        </div>
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';
