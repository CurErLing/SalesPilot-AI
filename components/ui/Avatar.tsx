
import React from 'react';

interface AvatarProps {
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  highlight?: boolean; // If true, uses theme color (e.g. indigo)
}

export const Avatar: React.FC<AvatarProps> = ({ name, size = 'md', className = '', highlight = false }) => {
  const initial = name ? name.charAt(0).toUpperCase() : '?';
  
  const sizeClasses = {
    xs: "w-6 h-6 text-[10px]",
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-16 h-16 text-xl",
    xl: "w-20 h-20 text-3xl",
  };

  const colorClass = highlight 
    ? "bg-indigo-600 text-white shadow-md shadow-indigo-200" 
    : "bg-slate-100 text-slate-600 border border-white shadow-sm";

  return (
    <div 
      className={`
        rounded-full flex items-center justify-center font-bold shrink-0
        ${sizeClasses[size]} 
        ${colorClass}
        ${className}
      `}
    >
      {initial}
    </div>
  );
};
