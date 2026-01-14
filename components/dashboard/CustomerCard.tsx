
import React from 'react';
import { Customer } from '../../types';
import { Building2, Briefcase, ArrowDownUp, TrendingUp, ArrowRight } from 'lucide-react';

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

    return (
        <div 
            onClick={onClick}
            className="group bg-white rounded-2xl p-6 border border-slate-200 hover:border-indigo-300 hover:shadow-xl hover:shadow-indigo-100/50 transition-all cursor-pointer relative overflow-hidden flex flex-col h-full"
        >
            {/* Top Row: Tag & Score */}
            <div className="flex justify-between items-start mb-6">
            <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide ${getStatusColor(customer.status)}`}>
                {getStatusLabel(customer.status)}
            </span>
            {customer.assessmentScore && (
                <div className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg text-xs font-bold">
                    <TrendingUp className="w-3 h-3" />
                    {customer.assessmentScore}分
                </div>
            )}
            </div>

            {/* Content */}
            <div className="mb-8 flex-1">
                <h3 className="text-xl font-bold text-slate-900 mb-2 leading-snug group-hover:text-indigo-600 transition-colors line-clamp-2">
                    {customer.projectName || `${customer.name} 项目`}
                </h3>
                <div className="flex items-center gap-2 text-slate-500 font-medium mb-4">
                    <Building2 className="w-4 h-4" />
                    {customer.name}
                </div>

                <div className="flex flex-wrap gap-4 text-xs text-slate-400">
                    <div className="flex items-center gap-1.5">
                        <Briefcase className="w-3.5 h-3.5" />
                        {customer.persona.industry || '行业未知'}
                    </div>
                    <div className="flex items-center gap-1.5">
                        <ArrowDownUp className="w-3.5 h-3.5" />
                        {customer.persona.budget || '预算未知'}
                    </div>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-auto">
                <div className="w-full bg-slate-100 rounded-full h-2 mb-4 overflow-hidden">
                    <div 
                        className="bg-indigo-500 h-2 rounded-full transition-all duration-500" 
                        style={{ width: `${progress}%` }}
                    />
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-xs text-slate-400">
                    <span>更新于 {customer.updatedAt || customer.lastContact}</span>
                    <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 text-indigo-500 -translate-x-2 group-hover:translate-x-0 transition-all" />
                </div>
            </div>
        </div>
    );
};
