
import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  icon?: React.ElementType; // Optional override icon
  title?: string;
  subtitle?: string;
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ 
  icon: Icon, 
  title = "加载中...", 
  subtitle,
  className = ""
}) => {
  return (
    <div className={`h-full flex flex-col items-center justify-center text-slate-400 gap-4 p-8 opacity-80 animate-in fade-in ${className}`}>
        <div className="relative w-16 h-16">
            <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            {Icon ? (
                <Icon className="absolute inset-0 m-auto w-6 h-6 text-indigo-500" />
            ) : (
                <Loader2 className="absolute inset-0 m-auto w-6 h-6 text-indigo-500 animate-spin" />
            )}
        </div>
        <div className="text-center space-y-1">
           {title && <p className="font-medium text-slate-700 text-sm animate-pulse">{title}</p>}
           {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
        </div>
    </div>
  );
};
