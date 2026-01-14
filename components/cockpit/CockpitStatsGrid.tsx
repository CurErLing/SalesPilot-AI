
import React from 'react';
import { TrendingUp, Clock, Target, Activity } from 'lucide-react';
import { Card } from '../ui/Card';
import { Customer } from '../../types';

interface Props {
    customer: Customer;
    daysSinceContact: number;
}

export const CockpitStatsGrid: React.FC<Props> = ({ customer, daysSinceContact }) => {
    
    const getScoreColor = (score?: number) => {
        if (!score) return 'text-slate-400';
        if (score >= 80) return 'text-emerald-500';
        if (score >= 60) return 'text-amber-500';
        return 'text-red-500';
    };

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Win Probability */}
            <Card className="p-4 flex flex-col justify-between border-l-4 border-l-indigo-500">
                <div className="flex justify-between items-start">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">AI 赢面分</span>
                    <TrendingUp className={`w-4 h-4 ${getScoreColor(customer.assessmentScore)}`} />
                </div>
                <div>
                    <div className={`text-2xl font-black ${getScoreColor(customer.assessmentScore)}`}>
                        {customer.assessmentScore || '-'}
                        <span className="text-sm font-medium text-slate-400 ml-1">/ 100</span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1">
                        {customer.assessmentScore ? '基于 MEDDIC 模型' : '尚未评估'}
                    </div>
                </div>
            </Card>

            {/* Last Contact */}
            <Card className={`p-4 flex flex-col justify-between border-l-4 ${daysSinceContact > 7 ? 'border-l-red-400' : 'border-l-emerald-400'}`}>
                <div className="flex justify-between items-start">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">失联天数</span>
                    <Clock className="w-4 h-4 text-slate-400" />
                </div>
                <div>
                    <div className="text-2xl font-black text-slate-800">
                        {daysSinceContact} <span className="text-sm font-medium text-slate-400">天</span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1">
                        {daysSinceContact > 7 ? '⚠️ 需立即跟进' : '保持接触中'}
                    </div>
                </div>
            </Card>

            {/* Stage */}
            <Card className="p-4 flex flex-col justify-between border-l-4 border-l-blue-400">
                <div className="flex justify-between items-start">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">当前阶段</span>
                    <Target className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                    <div className="text-xl font-bold text-slate-800 truncate">
                        {customer.status}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1">
                        更新于 {customer.updatedAt}
                    </div>
                </div>
            </Card>

            {/* Key Metric / Deal Size */}
            <Card className="p-4 flex flex-col justify-between border-l-4 border-l-purple-400">
                <div className="flex justify-between items-start">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">预计金额</span>
                    <Activity className="w-4 h-4 text-purple-400" />
                </div>
                <div>
                    <div className="text-xl font-bold text-slate-800 truncate font-mono">
                        {customer.persona.budget || '待定'}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1">
                        {customer.persona.projectTimeline || '时间表未定'}
                    </div>
                </div>
            </Card>
        </div>
    );
};
