
import React from 'react';
import { TrendingUp } from 'lucide-react';

interface ScoreGaugeProps {
  score: number;
  trend?: number;
  size?: number; // width/height in px
  strokeWidth?: number;
}

export const ScoreGauge: React.FC<ScoreGaugeProps> = ({ 
  score, 
  trend = 0, 
  size = 128, 
  strokeWidth = 8 
}) => {
  const radius = size / 2 - strokeWidth;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (circumference * score) / 100;
  
  // Color Logic
  const getColor = (s: number) => {
      if (s >= 70) return 'text-emerald-500';
      if (s >= 50) return 'text-amber-500';
      return 'text-red-500';
  };

  const colorClass = getColor(score);

  return (
    <div className="relative inline-flex flex-col items-center">
        <div className="relative" style={{ width: size, height: size }}>
            <svg className="w-full h-full transform -rotate-90" viewBox={`0 0 ${size} ${size}`}>
                {/* Background Circle */}
                <circle 
                    cx={size / 2} 
                    cy={size / 2} 
                    r={radius} 
                    stroke="currentColor" 
                    strokeWidth={strokeWidth} 
                    fill="transparent" 
                    className="text-slate-100" 
                />
                {/* Progress Circle */}
                <circle 
                    cx={size / 2} 
                    cy={size / 2} 
                    r={radius} 
                    stroke="currentColor" 
                    strokeWidth={strokeWidth} 
                    fill="transparent" 
                    strokeDasharray={circumference} 
                    strokeDashoffset={offset} 
                    strokeLinecap="round"
                    className={`${colorClass} transition-all duration-1000 ease-out`} 
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-black text-slate-800">{score}</span>
                {trend !== 0 && (
                    <span className={`text-[10px] font-bold flex items-center ${trend > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                        {trend > 0 ? '+' : ''}{trend} 
                        <TrendingUp className={`w-3 h-3 ml-0.5 ${trend < 0 ? 'rotate-180' : ''}`} />
                    </span>
                )}
            </div>
        </div>
    </div>
  );
};
