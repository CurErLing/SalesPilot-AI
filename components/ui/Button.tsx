import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'gradient';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
  icon?: React.ElementType;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  isLoading = false, 
  icon: Icon,
  className = '', 
  disabled,
  ...props 
}) => {
  // Added active:scale-95 for click feedback and transition-all for smoothness
  const baseStyles = "inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 active:scale-[0.97]";
  
  const variants = {
    // Replaced flat color with subtle gradient or shadow
    primary: "bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-200 hover:shadow-lg hover:shadow-indigo-500/30 focus:ring-indigo-500 border border-transparent",
    // Special AI variant
    gradient: "bg-gradient-ai text-white hover:bg-gradient-ai-hover shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 border border-transparent",
    secondary: "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 shadow-sm focus:ring-slate-200",
    outline: "border border-slate-300 bg-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900 focus:ring-slate-400",
    ghost: "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 focus:ring-slate-200",
    danger: "bg-white text-red-600 border border-red-100 hover:bg-red-50 hover:border-red-200 focus:ring-red-500 shadow-sm",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-5 py-2.5 text-sm",
    lg: "px-8 py-3.5 text-base",
    icon: "p-2.5",
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
      {!isLoading && Icon && <Icon className={`w-4 h-4 ${children ? 'mr-2' : ''}`} />}
      {children}
    </button>
  );
};