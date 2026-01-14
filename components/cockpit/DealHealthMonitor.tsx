
import React from 'react';
import { Customer } from '../../types';
import { Activity, Clock, Calendar, AlertTriangle, CheckCircle2, TrendingUp } from 'lucide-react';
import { getHealthColor } from '../../utils/formatters';

interface Props {
    customer: Customer;
    daysSinceContact: number;
}

export const DealHealthMonitor: React.FC<Props> = ({ customer, daysSinceContact }) => {
    const health = customer.assessmentResult?.deal_health || 'Critical';
    const colorClass = getHealthColor(health);
    // Extract just the color part for text (e.g. text-emerald-500)
    const textColor = colorClass.split(' ').find(c => c.startsWith('text-')) || 'text-slate-500';
    const bgColor = colorClass.split(' ').find(c => c.startsWith('bg-')) || 'bg-slate-50';

    return (
        <div className="bg-white rounded-2xl p-1 border border-slate-200 shadow-sm flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-slate-100">
            
            {/* 1. Health Pulse */}
            <div className="flex-1 p-4 flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${bgColor} ${textColor}`}>
                    <Activity className="w-6 h-6" />
                </div>
                <div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">项目健康度</div>
                    <div className={`text-lg font-black flex items-center gap-2 ${textColor}`}>
                        {health === 'Healthy' ? '健康推进中' : health === 'At Risk' ? '存在风险' : '高危预警'}
                        {health === 'Healthy' && <TrendingUp className="w-4 h-4" />}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                        基于 MEDDIC 模型实时诊断
                    </div>
                </div>
            </div>

            {/* 2. Rhythm & Frequency */}
            <div className="flex-1 p-4 flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${daysSinceContact > 7 ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'}`}>
                    <Clock className="w-6 h-6" />
                </div>
                <div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">跟进节奏</div>
                    <div className="text-lg font-bold text-slate-800">
                        {daysSinceContact === 0 ? '今日已跟进' : `${daysSinceContact} 天前`}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                        上次: {customer.lastContact}
                    </div>
                </div>
            </div>

            {/* 3. Prediction */}
            <div className="flex-1 p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                    <Calendar className="w-6 h-6" />
                </div>
                <div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">预计结单</div>
                    <div className="text-lg font-bold text-slate-800">
                        {customer.persona.projectTimeline || '未设定'}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                        预算: {customer.persona.budget || '-'}
                    </div>
                </div>
            </div>

            {/* 4. Action Signal */}
            <div className="flex-1 p-4 bg-slate-50/50 rounded-r-xl flex items-center justify-between group cursor-help relative overflow-hidden">
                <div className="relative z-10">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">当前信号</div>
                    <div className="flex items-center gap-1.5 font-bold text-sm text-slate-700">
                        {customer.status === '赢单' ? (
                            <><CheckCircle2 className="w-4 h-4 text-emerald-500" /> 赢单关闭</>
                        ) : customer.visits.some(v => v.sentiment === 'Risk') ? (
                            <><AlertTriangle className="w-4 h-4 text-red-500 animate-pulse" /> 风险需处理</>
                        ) : (
                            <><CheckCircle2 className="w-4 h-4 text-indigo-500" /> 正常推进</>
                        )}
                    </div>
                </div>
                {/* Decorative background element */}
                <div className="absolute right-[-10px] bottom-[-10px] text-slate-200/50 transform -rotate-12 pointer-events-none">
                    <Activity className="w-24 h-24" />
                </div>
            </div>
        </div>
    );
};
