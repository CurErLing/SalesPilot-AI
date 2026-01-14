
import React from 'react';
import { Target, Sparkles, AlertTriangle } from 'lucide-react';

interface Props {
    completeness: number;
    hasRisk?: boolean;
}

export const PersonaHeader: React.FC<Props> = ({ completeness, hasRisk }) => {
    return (
        <div className={`bg-white p-6 rounded-xl border shadow-sm flex flex-col lg:flex-row gap-8 items-start relative overflow-hidden transition-all duration-300 ${hasRisk ? 'border-red-200 ring-2 ring-red-50' : 'border-slate-200'}`}>
            
            {hasRisk && (
                <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
            )}

            {/* Left: Title & Mission */}
            <div className="flex-1 space-y-4">
                <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    全景客户画像
                    {hasRisk && (
                        <span className="flex items-center gap-1.5 bg-red-50 text-red-600 text-xs px-2.5 py-1 rounded-full border border-red-100 animate-pulse">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span className="font-bold">检测到风险记录</span>
                        </span>
                    )}
                </h1>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Sales Task */}
                    <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                        <div className="flex items-center gap-2 mb-2 text-slate-800 font-bold text-xs uppercase tracking-wide">
                            <Target className="w-4 h-4 text-indigo-600" />
                            销售核心任务
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">
                            通过<span className="font-bold text-indigo-600 mx-1">拜访</span>、
                            <span className="font-bold text-indigo-600 mx-1">电话</span>及
                            <span className="font-bold text-indigo-600 mx-1">互联网检索</span>
                            等方式，持续补齐和完善客户画像。
                        </p>
                    </div>

                    {/* AI Value */}
                    <div className="bg-indigo-50 rounded-lg p-3 border border-indigo-100">
                        <div className="flex items-center gap-2 mb-2 text-indigo-900 font-bold text-xs uppercase tracking-wide">
                            <Sparkles className="w-4 h-4 text-indigo-600" />
                            AI 能做什么？
                        </div>
                        <ul className="text-xs text-indigo-700/80 leading-relaxed space-y-1 list-disc list-inside">
                            <li>提供沟通话术与黄金提问</li>
                            <li>从交流中提取信息，<span className="font-bold">自动填充画像格子</span></li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Right: Progress */}
            <div className="w-full lg:w-48 shrink-0 pt-1">
                 <div className="flex justify-between items-end mb-2">
                    <span className="text-xs font-bold uppercase text-slate-500 tracking-wider">资料完整度</span>
                    <span className={`text-xl font-black ${completeness === 100 ? 'text-emerald-500' : 'text-indigo-600'}`}>{completeness}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div
                        className={`h-full rounded-full transition-all duration-1000 ${completeness === 100 ? 'bg-emerald-500' : 'bg-gradient-to-r from-indigo-500 to-purple-500'}`}
                        style={{ width: `${completeness}%` }}
                    />
                </div>
            </div>
        </div>
    );
};
