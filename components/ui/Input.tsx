
import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ElementType;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', label, error, icon: Icon, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
            {label}
          </label>
        )}
        <div className="relative">
          {Icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
              <Icon className="w-4 h-4" />
            </div>
          )}
          <input
            ref={ref}
            className={`
              w-full rounded-lg border border-slate-200 bg-white 
              text-sm text-slate-800 placeholder:text-slate-300
              focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 
              outline-none transition-all duration-200
              disabled:opacity-50 disabled:bg-slate-50 disabled:cursor-not-allowed
              ${Icon ? 'pl-9 pr-3 py-2.5' : 'px-3 py-2.5'}
              ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : ''}
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
