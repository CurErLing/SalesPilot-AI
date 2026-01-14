
import React, { forwardRef } from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = '', label, error, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={`
            w-full rounded-lg border border-slate-200 bg-white 
            text-sm text-slate-800 placeholder:text-slate-300 leading-relaxed
            focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 
            outline-none transition-all duration-200 resize-none
            disabled:opacity-50 disabled:bg-slate-50
            p-3
            ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : ''}
            ${className}
          `}
          {...props}
        />
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
