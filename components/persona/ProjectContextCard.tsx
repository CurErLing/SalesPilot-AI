
import React, { useState } from 'react';
import { Building2, Sparkles, Loader2, Wallet, Clock, Map, Target, FileText, ChevronDown, Info, CheckCircle2, RotateCcw } from 'lucide-react';
import { Card, CardTitle, CardDescription } from '../ui/Card';
import { Button } from '../ui/Button';
import { enrichFirmographics } from '../../services/geminiService';
import { FieldMetadata } from '../../types';

interface Props {
    projectName?: string;
    projectBackground?: string;
    status: string;
    industry: string;
    companySize: string;
    scenario?: string;
    companyName?: string;
    budget: string;
    projectTimeline: string;
    metadata?: Record<string, FieldMetadata>;
    onChange: (field: any, value: string, isVerified?: boolean) => void;
    onStatusChange: (status: any) => void;
}

const STAGES = ['线索', '合格', '提案', '谈判', '赢单', '输单'];

// Fix: Changed signature to receive 'props' object so it can be referenced in handleVerify (line 38)
export const ProjectContextCard: React.FC<Props> = (props) => {
    const { 
        projectName, projectBackground, status, industry, companySize, scenario, 
        budget, projectTimeline, companyName, metadata, onChange, onStatusChange
    } = props;
    const [loading, setLoading] = useState(false);

    // 辅助函数：判断字段是否需要审核（AI 提取且未确认）
    const needsVerification = (field: string) => {
        return metadata?.[field] && !metadata[field].isVerified;
    };

    const handleVerify = (field: string) => {
        // Fix: 'props' is now defined and accessible here
        onChange(field, (props as any)[field] || '', true);
    };

    const handleRollback = (field: string) => {
        const prev = metadata?.[field]?.previousValue;
        if (prev !== undefined) {
            onChange(field, prev, true);
        }
    };

    // Fix: Implemented handleAutoFill which was referenced on line 173 but missing
    const handleAutoFill = async () => {
        if (!companyName) return;
        setLoading(true);
        try {
            const result = await enrichFirmographics(companyName);
            if (result.industry) onChange('industry', result.industry, false);
            if (result.companySize) onChange('companySize', result.companySize, false);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const VerificationBadge = ({ field }: { field: string }) => {
        if (!needsVerification(field)) return null;
        return (
            <div className="flex items-center gap-1.5 animate-in fade-in zoom-in duration-300">
                <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-md flex items-center gap-1 border border-amber-200">
                    <Sparkles className="w-2.5 h-2.5" /> AI 建议更新
                </span>
                <button onClick={() => handleVerify(field)} className="p-1 hover:bg-emerald-100 text-emerald-600 rounded-md transition-colors" title="采纳 AI 建议">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => handleRollback(field)} className="p-1 hover:bg-slate-200 text-slate-500 rounded-md transition-colors" title="忽略并回滚">
                    <RotateCcw className="w-3.5 h-3.5" />
                </button>
            </div>
        );
    };

    return (
        <Card className="p-0 overflow-hidden border-slate-200 shadow-md">
            <div className="bg-slate-50/80 p-6 border-b border-slate-200 flex justify-between items-start">
                <div className="flex-1 mr-4">
                    <div className="flex items-center gap-2 mb-2">
                        <CardTitle icon={FileText}><span className="text-lg">项目概况</span></CardTitle>
                        <div className="text-[10px] text-slate-400 font-medium bg-white px-2 py-0.5 rounded-full border border-slate-200">
                            单一事实来源 (SSoT)
                        </div>
                    </div>
                    <input
                        type="text"
                        value={projectName || ''}
                        onChange={(e) => onChange('projectName', e.target.value, true)}
                        className="text-2xl font-extrabold text-slate-900 bg-transparent border-none focus:ring-0 p-0 placeholder:text-slate-300 w-full"
                        placeholder="输入项目名称..."
                    />
                    <CardDescription>
                        核心项目数据由销售代表维护，AI 仅提供提取建议。
                    </CardDescription>
                </div>
            </div>

            <div className="p-6 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                     <div className={`rounded-xl p-4 border flex flex-col justify-between h-full group transition-all ${needsVerification('budget') ? 'bg-amber-50/30 border-amber-300 ring-2 ring-amber-500/10' : 'bg-emerald-50/50 border-emerald-100 hover:border-emerald-200'}`}>
                        <label className="text-xs font-bold text-emerald-600 uppercase tracking-wide flex items-center justify-between gap-1.5 mb-2">
                            <div className="flex items-center gap-1.5"><Wallet className="w-4 h-4" /> 预算规划</div>
                            <VerificationBadge field="budget" />
                        </label>
                        <input
                            type="text"
                            value={budget}
                            onChange={(e) => onChange('budget', e.target.value, true)}
                            className={`w-full bg-transparent border-none p-0 text-xl font-black focus:ring-0 ${needsVerification('budget') ? 'text-amber-700' : 'text-slate-800'}`}
                        />
                     </div>

                     <div className={`rounded-xl p-4 border flex flex-col justify-between h-full group transition-all ${needsVerification('projectTimeline') ? 'bg-amber-50/30 border-amber-300 ring-2 ring-amber-500/10' : 'bg-blue-50/50 border-blue-100 hover:border-blue-200'}`}>
                        <label className="text-xs font-bold text-blue-600 uppercase tracking-wide flex items-center justify-between gap-1.5 mb-2">
                            <div className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> 预计上线</div>
                            <VerificationBadge field="projectTimeline" />
                        </label>
                        <input
                            type="text"
                            value={projectTimeline}
                            onChange={(e) => onChange('projectTimeline', e.target.value, true)}
                            className={`w-full bg-transparent border-none p-0 text-xl font-black focus:ring-0 ${needsVerification('projectTimeline') ? 'text-amber-700' : 'text-slate-800'}`}
                        />
                     </div>

                     <div className="bg-indigo-50/50 rounded-xl p-4 border border-indigo-100 flex flex-col justify-between h-full group hover:border-indigo-200 transition-colors relative">
                        <label className="text-xs font-bold text-indigo-600 uppercase tracking-wide flex items-center gap-1.5 mb-2">
                            <Target className="w-4 h-4" /> 当前阶段
                        </label>
                        <div className="relative">
                            <select 
                                value={status} 
                                onChange={(e) => onStatusChange(e.target.value)}
                                className="w-full bg-transparent border-none p-0 text-xl font-black text-slate-800 focus:ring-0 appearance-none cursor-pointer relative z-10 pr-6"
                            >
                                {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                            <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-300 pointer-events-none" />
                        </div>
                     </div>
                </div>

                <div className="space-y-4">
                    <div className="relative">
                        <div className="flex justify-between items-center mb-2">
                            <label className="text-sm font-bold text-slate-700 block flex items-center gap-2">
                                项目背景与核心需求
                            </label>
                            <VerificationBadge field="projectBackground" />
                        </div>
                        <textarea
                            value={projectBackground || ''}
                            onChange={(e) => onChange('projectBackground', e.target.value, true)}
                            className={`w-full p-4 border rounded-xl text-sm leading-relaxed focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all resize-none shadow-inner ${needsVerification('projectBackground') ? 'bg-amber-50/20 border-amber-300 text-amber-900' : 'bg-slate-50 border-slate-200 text-slate-700'}`}
                            rows={4}
                        />
                    </div>

                    <div className="relative">
                         <div className="flex justify-between items-center mb-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block flex items-center gap-1">
                                <Map className="w-3.5 h-3.5" /> 具体业务场景 (Scenario)
                            </label>
                            <VerificationBadge field="scenario" />
                         </div>
                        <input
                            type="text"
                            value={scenario || ''}
                            onChange={(e) => onChange('scenario', e.target.value, true)}
                            className={`w-full p-3 border rounded-lg text-sm outline-none transition-all ${needsVerification('scenario') ? 'bg-amber-50/20 border-amber-300 text-amber-900' : 'bg-white border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500'}`}
                        />
                    </div>
                </div>

                <div className="pt-6 border-t border-slate-100">
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">客户基本面</h4>
                        <Button 
                            size="sm" 
                            variant="ghost" 
                            className="text-[10px] text-indigo-600 bg-indigo-50 h-6 px-2"
                            icon={loading ? Loader2 : Sparkles}
                            onClick={handleAutoFill}
                            isLoading={loading}
                        >
                            AI 智能填充
                        </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <div className="flex justify-between mb-1.5">
                                <label className="text-xs font-semibold text-slate-500 block">所属行业</label>
                                <VerificationBadge field="industry" />
                            </div>
                            <input
                                type="text"
                                value={industry}
                                onChange={(e) => onChange('industry', e.target.value, true)}
                                className={`w-full p-2.5 border rounded-lg text-sm outline-none transition-all ${needsVerification('industry') ? 'bg-amber-50/20 border-amber-300' : 'bg-slate-50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-indigo-500'}`}
                            />
                        </div>
                        <div>
                            <div className="flex justify-between mb-1.5">
                                <label className="text-xs font-semibold text-slate-500 block">人员规模</label>
                                <VerificationBadge field="companySize" />
                            </div>
                            <input
                                type="text"
                                value={companySize}
                                onChange={(e) => onChange('companySize', e.target.value, true)}
                                className={`w-full p-2.5 border rounded-lg text-sm outline-none transition-all ${needsVerification('companySize') ? 'bg-amber-50/20 border-amber-300' : 'bg-slate-50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-indigo-500'}`}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
};
