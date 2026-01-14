import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className = '', onClick, hoverable = false }) => {
  return (
    <div 
      onClick={onClick}
      className={`
        bg-white rounded-2xl border border-slate-100/80 shadow-soft
        ${hoverable ? 'hover:shadow-medium hover:-translate-y-1 cursor-pointer transition-all duration-300 ease-out' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`flex items-center justify-between mb-5 ${className}`}>
    {children}
  </div>
);

export const CardTitle: React.FC<{ children: React.ReactNode; icon?: React.ElementType }> = ({ children, icon: Icon }) => (
  <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2.5">
    {Icon && (
      <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
        <Icon className="w-5 h-5" />
      </div>
    )}
    {children}
  </h3>
);

export const CardDescription: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">{children}</p>
);