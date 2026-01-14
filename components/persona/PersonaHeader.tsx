
import React, { useMemo } from 'react';
import { Target, Sparkles, AlertTriangle, Lightbulb, ArrowRight } from 'lucide-react';
import { Customer } from '../../types';

interface Props {
    customer: Customer;
    completeness: number;
}

export const PersonaHeader: React.FC<Props> = ({ customer, completeness }) => {
    const hasRisk = customer.visits.some(v => v.sentiment === 'Risk');
    
    // PM 逻辑：根据当前商机阶段，计算最紧迫的任务
    const focusAdvice = useMemo(() => {
        const { status, persona } = customer;
        if (status === '谈判' && !persona.decisionMakers.some(dm => dm.role === 'Economic Buyer')) {
            return {
                title: "关键缺口预警",
                desc: "当前处于谈判阶段，但尚未识别出【经济决策人(EB)】，建议通过刘经理挖掘高层态度。",
                color: "text-red-600 bg-red-50 border-red-100"
            };
        }
        if (persona.keyPainPoints.length === 0) {
            return {
                title: "画像补齐建议",
                desc: "痛点库为空。建议在下次会议中询问客户：'如果现状不改变，半年后会对业务产生什么后果？'",
                color: "text-indigo-600 bg-indigo-50 border-indigo-100"
            };
        }
        return {
            title: "下一步行动",
            desc: "画像基础信息已完备。建议运行【价值评估】来验证赢单概率。",
            color: "text-emerald-600 bg-emerald-50 border-emerald-100"
        };
    }, [customer]);

    return (
        <div className={`bg-white p-6 rounded-2xl border shadow-sm flex flex-col gap-6 relative overflow-hidden transition-all duration-300 ${hasRisk ? 'border-red-200' : 'border-slate-200'}`}>
            
            <div className="flex flex-col lg:flex-row justify-between items-start gap-6">
                {/* Left: Title & Mission */}
                <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">全景客户画像</h1>
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 text-[10px] font-bold border border-slate-200 uppercase tracking-widest">
                            Project Intelligence
                        </span>
                    </div>
                    <p className="text-slate-500 text-sm font-medium">通过结构化画像，将碎片情报转化为赢单确定性。</p>
                </div>

                {/* Right: Progress */}
                <div className="w-full lg:w-64 shrink-0">
                    <div className="flex justify-between items-end mb-2">
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-1">
                            资料完整度
                        </span>
                        <span className={`text-xl font-black ${completeness === 100 ? 'text-emerald-500' : 'text-indigo-600'}`}>{completeness}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden shadow-inner">
                        <div
                            className={`h-full rounded-full transition-all duration-1000 ease-out ${completeness === 100 ? 'bg-emerald-500' : 'bg-gradient-to-r from-indigo-500 to-purple-500'}`}
                            style={{ width: `${completeness}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* PM Insight Bar: 动态指引卡片 */}
            <div className={`flex items-start gap-4 p-4 rounded-xl border animate-in slide-in-from-top-2 duration-500 ${focusAdvice.color}`}>
                <div className="p-2 bg-white rounded-lg shadow-sm">
                    <Lightbulb className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold flex items-center gap-2">
                        {focusAdvice.title}
                        {hasRisk && <AlertTriangle className="w-4 h-4 text-red-500 animate-pulse" />}
                    </h4>
                    <p className="text-xs mt-1 leading-relaxed opacity-90 font-medium">
                        {focusAdvice.desc}
                    </p>
                </div>
                <button className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-3 py-2 bg-white/50 hover:bg-white rounded-lg transition-colors border border-current shrink-0">
                    去补齐 <ArrowRight className="w-3 h-3" />
                </button>
            </div>
        </div>
    );
};
