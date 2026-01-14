
import React from 'react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip } from 'recharts';
import { AssessmentResult, ViewState } from '../../types';
import { Button } from '../ui/Button';
import { Sparkles, AlertCircle, ArrowUpRight } from 'lucide-react';

interface Props {
    assessment?: AssessmentResult;
    onChangeView: (view: ViewState) => void;
}

export const MeddicRadar: React.FC<Props> = ({ assessment, onChangeView }) => {
    if (!assessment) {
        return (
            <div className="h-full flex flex-col items-center justify-center p-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-center min-h-[350px]">
                <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center mb-3">
                    <Sparkles className="w-6 h-6 text-indigo-400" />
                </div>
                <h3 className="text-sm font-bold text-slate-700 mb-1">画像待评估</h3>
                <p className="text-xs text-slate-500 mb-4 max-w-[200px]">运行 MEDDIC 诊断以识别画像缺口并生成雷达图。</p>
                <Button size="sm" onClick={() => onChangeView(ViewState.ASSESSMENT)}>开始评估</Button>
            </div>
        );
    }

    const data = assessment.categories.map(cat => ({
        subject: cat.name.split(' ')[0],
        A: cat.score,
        fullMark: 100,
    }));

    // 识别最严重的缺口
    const mainGap = assessment.categories.find(c => c.status === 'Gap');

    return (
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col h-full relative overflow-hidden min-h-[380px]">
            <div className="flex justify-between items-start mb-2 relative z-10">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-6 bg-indigo-500 rounded-full"></div>
                    <h3 className="font-bold text-slate-800 text-sm">赢单六维模型</h3>
                </div>
                <button 
                    onClick={() => onChangeView(ViewState.ASSESSMENT)}
                    className="group text-[10px] font-bold text-indigo-600 flex items-center gap-1 hover:underline"
                >
                    详细诊断 <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </button>
            </div>

            {/* 修复容器核心代码：显式高度 + 相对定位 */}
            <div className="relative w-full flex-1 min-h-[250px] flex items-center justify-center -ml-4">
                <ResponsiveContainer width="100%" height="250">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
                        <PolarGrid stroke="#e2e8f0" />
                        <PolarAngleAxis 
                            dataKey="subject" 
                            tick={{ fill: '#64748b', fontSize: 10, fontWeight: 600 }} 
                        />
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
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                            itemStyle={{ color: '#4f46e5', fontSize: '12px', fontWeight: 'bold' }}
                        />
                    </RadarChart>
                </ResponsiveContainer>
            </div>

            {/* 情报补齐指引 */}
            <div className="mt-4 pt-4 border-t border-slate-50">
                {mainGap ? (
                    <div className="bg-amber-50 rounded-xl p-3 border border-amber-100 flex items-start gap-2.5 animate-in slide-in-from-bottom-2 duration-500">
                        <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                        <div className="text-xs">
                            <span className="font-bold text-amber-800 block mb-0.5">情报缺口: {mainGap.name}</span>
                            <span className="text-amber-600 line-clamp-1">{mainGap.missing[0] || "关键信息待核实"}</span>
                        </div>
                    </div>
                ) : (
                    <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-100 flex items-center gap-2.5">
                        <div className="w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center">
                            <Sparkles className="w-2.5 h-2.5 text-white" />
                        </div>
                        <span className="text-xs font-bold text-emerald-700">画像已就绪，可启动致胜策略</span>
                    </div>
                )}
            </div>
        </div>
    );
};
