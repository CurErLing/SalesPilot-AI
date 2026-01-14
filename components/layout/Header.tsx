
import React, { useState } from 'react';
import { Customer } from '../../types';
import { ChevronRight, TrendingUp, Wallet, Clock, Check, ChevronDown, LayoutDashboard } from 'lucide-react';
import { getScoreColor } from '../../utils/formatters';

interface HeaderProps {
  customer: Customer;
  onUpdate: (updated: Customer) => void;
  onBack: () => void; // New prop for navigation
}

const STAGES = ['线索', '合格', '提案', '谈判', '赢单'];

export const Header: React.FC<HeaderProps> = ({ customer, onUpdate, onBack }) => {
  const [isStageMenuOpen, setIsStageMenuOpen] = useState(false);

  const handleStageChange = (newStage: any) => {
      onUpdate({ ...customer, status: newStage });
      setIsStageMenuOpen(false);
  };

  // Helper to explain why we are in Negotiation
  const getStageTooltip = (stage: string) => {
    if (stage === '谈判') return '准入标准：方案已确认，进入合同法务审核或价格谈判阶段。';
    if (stage === '赢单') return '准入标准：合同已签署，PO 已下达。';
    return '';
  };

  return (
    <div className="bg-white border-b border-slate-200 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.05)] z-10 sticky top-0 h-16 flex flex-col justify-center">
      <div className="px-6 flex items-center justify-between">
          
          {/* Left: Standardized Breadcrumb Navigation */}
          <div className="flex items-center gap-2 text-sm flex-1 min-w-0">
              <button 
                onClick={onBack}
                className="flex items-center gap-1.5 text-slate-400 hover:text-slate-700 transition-colors font-medium"
              >
                  <LayoutDashboard className="w-4 h-4" />
                  商机管道
              </button>
              
              <ChevronRight className="w-4 h-4 text-slate-300" />
              
              <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-800 truncate max-w-[200px]" title={customer.projectName}>
                      {customer.projectName || '未命名项目'}
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 text-slate-500 border border-slate-200">
                      {customer.name}
                  </span>
              </div>
          </div>

          {/* Right: Key Deal Metrics & Pipeline Stepper */}
          <div className="flex items-center gap-6 shrink-0">
             
             {/* 1. High-Level Metrics (Clean Layout) */}
             <div className="hidden xl:flex items-center gap-6 border-r border-slate-100 pr-6">
                <div className="flex flex-col items-end">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                        <Wallet className="w-3 h-3" /> 预算
                    </span>
                    <span className="font-bold text-slate-700 font-mono text-sm leading-none mt-0.5">
                        {customer.persona.budget || '¥ --'}
                    </span>
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                        <Clock className="w-3 h-3" /> 结单
                    </span>
                    <span className="font-bold text-slate-700 text-sm leading-none mt-0.5">
                        {customer.persona.projectTimeline || '--'}
                    </span>
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" /> 赢面
                    </span>
                    <span className={`font-black text-sm leading-none mt-0.5 ${getScoreColor(customer.assessmentScore)}`}>
                        {customer.assessmentScore || '-'}分
                    </span>
                </div>
             </div>

             {/* 2. Interactive Pipeline Stepper */}
             <div className="relative">
                <button 
                    onClick={() => setIsStageMenuOpen(!isStageMenuOpen)}
                    className="flex items-center gap-1 px-1 py-1 rounded-lg hover:bg-slate-50 transition-colors group"
                >
                    <div className="flex items-center">
                        {STAGES.map((stage, idx) => {
                             const isActive = stage === customer.status;
                             const isPast = STAGES.indexOf(customer.status) > idx;
                             
                             return (
                                 <div key={stage} className="flex items-center relative group/step">
                                     <div 
                                        className={`
                                            px-3 py-1.5 text-xs font-bold transition-all relative z-10
                                            ${idx === 0 ? 'rounded-l-md pl-3' : 'pl-4'} 
                                            ${idx === STAGES.length - 1 ? 'rounded-r-md pr-3' : 'pr-6'}
                                            ${isActive 
                                                ? 'bg-slate-800 text-white shadow-md z-20 scale-105' 
                                                : isPast 
                                                    ? 'bg-slate-100 text-slate-600' 
                                                    : 'bg-slate-50 text-slate-300'
                                            }
                                        `}
                                        style={{
                                            clipPath: idx === STAGES.length - 1 
                                                ? 'none' 
                                                : 'polygon(0 0, calc(100% - 10px) 0, 100% 50%, calc(100% - 10px) 100%, 0 100%, 10px 50%)',
                                            marginLeft: idx === 0 ? 0 : '-10px'
                                        }}
                                     >
                                         {stage}
                                     </div>
                                     
                                     {/* Tooltip for Definition */}
                                     {isActive && getStageTooltip(stage) && (
                                         <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-48 bg-slate-800 text-white text-[10px] p-2 rounded shadow-lg pointer-events-none opacity-0 group-hover/step:opacity-100 transition-opacity z-50">
                                             {getStageTooltip(stage)}
                                         </div>
                                     )}
                                 </div>
                             );
                        })}
                    </div>
                    <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 ml-1" />
                </button>

                {/* Dropdown for Stage Selection */}
                {isStageMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 py-1 z-50 animate-in fade-in zoom-in-95">
                        <div className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-50 mb-1">
                            变更阶段
                        </div>
                        {STAGES.map((stage) => (
                            <button
                                key={stage}
                                onClick={() => handleStageChange(stage)}
                                className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-50 flex items-center justify-between ${stage === customer.status ? 'text-indigo-600 font-bold bg-indigo-50' : 'text-slate-600'}`}
                            >
                                {stage}
                                {stage === customer.status && <Check className="w-3.5 h-3.5" />}
                            </button>
                        ))}
                        <div className="border-t border-slate-50 mt-1 pt-1">
                             <button
                                onClick={() => handleStageChange('输单')}
                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                            >
                                输单
                            </button>
                        </div>
                    </div>
                )}
             </div>

          </div>
      </div>
    </div>
  );
};
