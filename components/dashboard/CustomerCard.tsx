
import React from 'react';
import { Customer } from '../../types';
import { Building2, Briefcase, ArrowDownUp, TrendingUp, ArrowRight, AlertCircle, User, Zap } from 'lucide-react';

interface Props {
    customer: Customer;
    onClick: () => void;
    getStatusColor: (status: string) => string;
}

export const CustomerCard: React.FC<Props> = ({ customer, onClick, getStatusColor }) => {
    
    const getStatusProgress = (status: string) => {
        const map: Record<string, number> = {
          '线索': 10,
          '合格': 30,
          '提案': 50,
          '谈判': 80,
          '赢单': 100,
          '输单': 0
        };
        return map[status] || 0;
    };
    
    const getStatusLabel = (status: string) => {
        if (status === '合格') return '价值评估';
        if (status === '线索') return '画像澄清';
        if (status === '谈判') return '方案谈判';
        return status;
    };

    const progress = getStatusProgress(customer.status);

    // --- Persona Gap Logic ---
    const decisionMakers = customer.persona.decisionMakers || [];
    const hasEB = decisionMakers.some(dm => dm.role === 'Economic Buyer');
    const hasChampion = decisionMakers.some(dm => dm.stance === 'Champion');
    const hasPain = customer.persona.keyPainPoints && customer.persona.keyPainPoints.length > 0;

    const gaps = [];
    if (!hasEB) gaps.push('缺 EB');
    if (!hasChampion) gaps.push('缺 Champion');
    if (!hasPain) gaps.push('缺痛点');

    return (
        <div 
            onClick={onClick}
            className="group bg-white rounded-2xl border border-slate-200 hover:border-indigo-400 hover:shadow-xl hover:shadow-indigo-100/50 transition-all cursor-pointer relative overflow-hidden flex flex-col h-full"
        >
            {/* Header: Badge & Score */}
            <div className="p-6 pb-2 flex justify-between items-start">
                <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide border ${getStatusColor(customer.status)}`}>
                    {getStatusLabel(customer.status)}
                </span>
                
                {customer.assessmentScore ? (
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-black ${customer.assessmentScore >= 60 ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                        <TrendingUp className="w-3 h-3" />
                        {customer.assessmentScore}
                    </div>
                ) : (
                    <div className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium bg-slate-50 text-slate-400">
                        未评估
                    </div>
                )}
            </div>

            {/* Content: Main Info */}
            <div className="px-6 flex-1">
                <h3 className="text-lg font-bold text-slate-900 mb-1 leading-snug group-hover:text-indigo-600 transition-colors line-clamp-1" title={customer.projectName}>
                    {customer.projectName || `${customer.name} 项目`}
                </h3>
                <div className="flex items-center gap-2 text-slate-500 font-medium mb-4 text-xs">
                    <Building2 className="w-3.5 h-3.5" />
                    {customer.name}
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 gap-y-2 text-[11px] text-slate-500 mb-4">
                    <div className="flex items-center gap-1.5">
                        <Briefcase className="w-3 h-3 text-slate-400" />
                        <span className="truncate">{customer.persona.industry || '-'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <ArrowDownUp className="w-3 h-3 text-slate-400" />
                        <span className="truncate">{customer.persona.budget || '-'}</span>
                    </div>
                </div>

                {/* Persona Gaps (Visual Indicators) */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                    {!hasEB && (
                        <span className="text-[10px] px-1.5 py-0.5 bg-red-50 text-red-500 border border-red-100 rounded flex items-center gap-1">
                            <User className="w-3 h-3" /> 缺 EB
                        </span>
                    )}
                    {!hasChampion && (
                        <span className="text-[10px] px-1.5 py-0.5 bg-amber-50 text-amber-600 border border-amber-100 rounded flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> 缺支持者
                        </span>
                    )}
                    {!hasPain && (
                        <span className="text-[10px] px-1.5 py-0.5 bg-slate-50 text-slate-500 border border-slate-100 rounded">
                            痛点不明
                        </span>
                    )}
                    {gaps.length === 0 && (
                        <span className="text-[10px] px-1.5 py-0.5 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded flex items-center gap-1">
                            <Zap className="w-3 h-3" /> 画像完整
                        </span>
                    )}
                </div>
            </div>

            {/* Footer: Progress & Next Step Hint */}
            <div className="mt-auto bg-slate-50/50 border-t border-slate-100 p-4 relative">
                {/* Progress Bar background */}
                <div className="absolute top-[-1px] left-0 right-0 h-0.5 bg-slate-100">
                    <div 
                        className={`h-full transition-all duration-1000 ${customer.status === '赢单' ? 'bg-emerald-500' : 'bg-indigo-500'}`} 
                        style={{ width: `${progress}%` }}
                    />
                </div>

                <div className="flex items-center justify-between text-xs">
                    {/* Dynamic Next Step text based on state */}
                    <span className="font-medium text-slate-600 flex items-center gap-1.5">
                        {customer.visits.some(v => v.status === 'Planned') ? (
                            <>
                                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                                待执行拜访
                            </>
                        ) : (
                            <span className="text-slate-400 italic">需制定计划</span>
                        )}
                    </span>
                    
                    <div className="flex items-center gap-1 text-indigo-600 font-bold opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                        进入驾驶舱 <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                </div>
            </div>
        </div>
    );
};
