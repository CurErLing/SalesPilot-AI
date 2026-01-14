
import React from 'react';
import { Customer, ViewState } from '../../types';
import { Card } from '../ui/Card';
import { AlertCircle, Search, Calendar, Swords, ArrowRight, CheckCircle2 } from 'lucide-react';

interface Props {
    customer: Customer;
    onChangeView?: (view: ViewState, params?: any) => void;
}

export const PersonaGapTracer: React.FC<Props> = ({ customer, onChangeView }) => {
    const { persona } = customer;

    // 逻辑：计算关键情报缺口
    const gaps = React.useMemo(() => {
        const list = [];
        
        if (!persona.budget || persona.budget === '--') {
            list.push({
                id: 'budget',
                label: '预算金额不明确',
                desc: '尚未确认该项目的确切预算范围。',
                action: 'WEB_RESEARCH',
                query: `${customer.name} 2024 IT 采购 预算 计划`
            });
        }

        if (!persona.decisionMakers.some(dm => dm.role === 'Economic Buyer')) {
            list.push({
                id: 'eb',
                label: '缺失 EB (经济决策人)',
                desc: '未识别谁拥有最终签字权，建议通过 Coach 挖掘。',
                action: 'VISIT_RECORDS',
                tip: '询问刘经理：如果方案通过，最终审批流程需要经过哪位领导？'
            });
        }

        if (persona.keyPainPoints.length === 0) {
            list.push({
                id: 'pain',
                label: '痛点未量化',
                desc: '客户尚未表达明确的业务痛点带来的财务损失。',
                action: 'ROLE_PLAY',
                tip: '练习提问：如果不解决目前的系统响应问题，每天会造成多少订单流失？'
            });
        }

        if (persona.competitors.length === 0) {
            list.push({
                id: 'comp',
                label: '竞争态势未知',
                desc: '不清楚哪些友商在参与投标。',
                action: 'WEB_RESEARCH',
                query: `${customer.name} 数字化转型 供应商 合作伙伴`
            });
        }

        return list;
    }, [customer]);

    return (
        <Card className="p-0 border-indigo-100 overflow-hidden shadow-md">
            <div className="bg-indigo-600 p-4 text-white">
                <div className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    <h3 className="font-bold text-sm">情报缺口诊断 (Gap Tracer)</h3>
                </div>
                <p className="text-[10px] text-indigo-100 mt-1">
                    当前画像完整度：{Math.round((8 - gaps.length) / 8 * 100)}%。补齐以下缺口以提升赢单概率。
                </p>
            </div>

            <div className="p-4 space-y-4">
                {gaps.length > 0 ? gaps.map((gap) => (
                    <div key={gap.id} className="p-3 rounded-xl border border-slate-100 bg-slate-50 hover:bg-white hover:border-indigo-200 transition-all group">
                        <h4 className="text-xs font-bold text-slate-800 mb-1 flex items-center justify-between">
                            {gap.label}
                            <span className="text-[10px] text-red-500 font-normal">必填</span>
                        </h4>
                        <p className="text-[11px] text-slate-500 mb-3 leading-relaxed">
                            {gap.desc}
                        </p>
                        
                        <div className="flex gap-2">
                            {gap.action === 'WEB_RESEARCH' && (
                                <button 
                                    onClick={() => onChangeView?.(ViewState.WEB_RESEARCH)}
                                    className="flex-1 py-1.5 rounded-lg bg-white border border-indigo-200 text-indigo-600 text-[10px] font-bold flex items-center justify-center gap-1 hover:bg-indigo-50"
                                >
                                    <Search className="w-3 h-3" /> 互联网检索
                                </button>
                            )}
                            {gap.action === 'VISIT_RECORDS' && (
                                <button 
                                    onClick={() => onChangeView?.(ViewState.VISIT_RECORDS)}
                                    className="flex-1 py-1.5 rounded-lg bg-white border border-emerald-200 text-emerald-600 text-[10px] font-bold flex items-center justify-center gap-1 hover:bg-emerald-50"
                                >
                                    <Calendar className="w-3 h-3" /> 设为访谈议程
                                </button>
                            )}
                            {gap.action === 'ROLE_PLAY' && (
                                <button 
                                    onClick={() => onChangeView?.(ViewState.ROLE_PLAY)}
                                    className="flex-1 py-1.5 rounded-lg bg-white border border-purple-200 text-purple-600 text-[10px] font-bold flex items-center justify-center gap-1 hover:bg-purple-50"
                                >
                                    <Swords className="w-3 h-3" /> 模拟演练
                                </button>
                            )}
                        </div>
                        
                        {gap.tip && (
                            <div className="mt-2 text-[10px] text-slate-400 italic flex gap-1 items-start">
                                <ArrowRight className="w-2.5 h-2.5 mt-0.5 shrink-0" />
                                <span>建议：{gap.tip}</span>
                            </div>
                        )}
                    </div>
                )) : (
                    <div className="py-8 text-center">
                        <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-3">
                            <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                        </div>
                        <h4 className="text-sm font-bold text-slate-700">情报已就绪</h4>
                        <p className="text-xs text-slate-400 mt-1">当前维度的关键情报已补齐。</p>
                    </div>
                )}
            </div>
            
            <div className="p-3 bg-indigo-50/50 border-t border-indigo-50 text-center">
                <button 
                   onClick={() => onChangeView?.(ViewState.ASSESSMENT)}
                   className="text-[10px] font-bold text-indigo-600 hover:underline flex items-center justify-center gap-1 mx-auto"
                >
                    运行全量价值评估 <ArrowRight className="w-3 h-3" />
                </button>
            </div>
        </Card>
    );
};
