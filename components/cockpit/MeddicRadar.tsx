
import React from 'react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip } from 'recharts';
import { AssessmentResult, ViewState } from '../../types';
import { Button } from '../ui/Button';
import { Sparkles, AlertCircle } from 'lucide-react';

interface Props {
    assessment?: AssessmentResult;
    onChangeView: (view: ViewState) => void;
}

export const MeddicRadar: React.FC<Props> = ({ assessment, onChangeView }) => {
    if (!assessment) {
        return (
            <div className="h-full flex flex-col items-center justify-center p-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-center">
                <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center mb-3">
                    <Sparkles className="w-6 h-6 text-indigo-400" />
                </div>
                <h3 className="text-sm font-bold text-slate-700 mb-1">暂无评估数据</h3>
                <p className="text-xs text-slate-500 mb-4 max-w-[200px]">运行 MEDDIC 模型评估，生成可视化的赢单雷达图。</p>
                <Button size="sm" onClick={() => onChangeView(ViewState.ASSESSMENT)}>开始评估</Button>
            </div>
        );
    }

    // Transform categories to chart data
    // Normalize scores to ensure the chart looks balanced
    const data = assessment.categories.map(cat => ({
        subject: cat.name.split(' ')[0], // Take first word (e.g. "需求" from "需求与痛点")
        A: cat.score,
        fullMark: 100,
    }));

    return (
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col h-full relative overflow-hidden">
            <div className="flex justify-between items-start mb-2 relative z-10">
                <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                    <div className="w-2 h-6 bg-indigo-500 rounded-full"></div>
                    赢单六维模型
                </h3>
                <span className={`text-xs font-bold px-2 py-1 rounded ${assessment.score >= 70 ? 'bg-emerald-100 text-emerald-700' : assessment.score >= 50 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                    {assessment.score}分
                </span>
            </div>

            <div className="flex-1 min-h-[220px] -ml-6">
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
                        <PolarGrid stroke="#e2e8f0" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10, fontWeight: 600 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                        <Radar
                            name="本次评估"
                            dataKey="A"
                            stroke="#6366f1"
                            strokeWidth={2}
                            fill="#818cf8"
                            fillOpacity={0.4}
                        />
                        <Tooltip 
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            itemStyle={{ color: '#4f46e5', fontSize: '12px', fontWeight: 'bold' }}
                        />
                    </RadarChart>
                </ResponsiveContainer>
            </div>

            {/* Gap Insight Overlay */}
            {assessment.categories.some(c => c.status === 'Gap') && (
                <div className="bg-red-50 rounded-lg p-3 border border-red-100 mt-2">
                    <div className="flex items-start gap-2">
                        <AlertCircle className="w-3.5 h-3.5 text-red-500 mt-0.5 shrink-0" />
                        <div className="text-xs text-red-800">
                            <span className="font-bold block mb-0.5">短板预警:</span>
                            {assessment.categories.find(c => c.status === 'Gap')?.missing[0] || "存在关键信息缺失"}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
