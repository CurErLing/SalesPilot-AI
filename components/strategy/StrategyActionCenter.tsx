
import React, { useState } from 'react';
import { PlayCircle, Zap, Mail, Phone, Check, Copy, Swords, Target, FileText, Briefcase, DollarSign, Megaphone, PenTool } from 'lucide-react';
import { Button } from '../ui/Button';
import { ThinkingState } from '../ui/ThinkingState';
import { Tabs } from '../ui/Tabs';

export interface StrategyResult {
    immediate_action: string;
    email_draft: { subject: string; body: string };
    call_script: string;
    objections: { objection: string; response: string }[];
    proposal_focus?: { value_prop: string; case_study: string; pricing_strategy: string };
}

interface Props {
    strategy: StrategyResult | null;
    loading: boolean;
    onGenerate: () => void;
    customerStatus: string;
    onStartRolePlay?: () => void;
}

export const StrategyActionCenter: React.FC<Props> = ({ strategy, loading, onGenerate, customerStatus, onStartRolePlay }) => {
    const [activeTab, setActiveTab] = useState<'email' | 'call' | 'proposal'>('email');
    const [copied, setCopied] = useState(false);

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const TAB_ITEMS = [
        { id: 'email', label: '外联邮件', icon: Mail },
        { id: 'call', label: '沟通脚本', icon: Phone },
        { id: 'proposal', label: '方案建议', icon: FileText },
    ];

    if (loading) {
        return (
            <div className="h-full bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <ThinkingState 
                    title="AI 军师正在制定作战计划..."
                    steps={[
                        `审视当前战局 (${customerStatus})...`,
                        "推演决策人心理与潜在阻力...",
                        "构建差异化价值主张...",
                        "生成精准打击战术与话术..."
                    ]}
                />
            </div>
        );
    }

    if (!strategy) {
        return (
            <div className="h-full bg-white rounded-2xl border border-slate-200 border-dashed shadow-sm flex flex-col items-center justify-center text-slate-400 p-8 text-center opacity-70">
                <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6 border border-slate-100">
                    <Target className="w-10 h-10 text-slate-300" />
                </div>
                <h3 className="text-xl font-bold text-slate-600 mb-2">等待指令</h3>
                <p className="max-w-xs mx-auto mb-8 text-sm">点击上方“AI 生成致胜策略”，获取基于画像的定制化作战方案。</p>
                <Button onClick={onGenerate} icon={Zap} size="lg" className="shadow-lg">生成策略</Button>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6">
            
            {/* 1. The North Star (Immediate Action) */}
            <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-2xl p-6 shadow-xl text-white relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 rounded-full blur-[80px] opacity-20 -translate-y-1/2 translate-x-1/3 group-hover:opacity-30 transition-opacity"></div>
                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="bg-indigo-500/20 p-1.5 rounded border border-indigo-400/30">
                            <Zap className="w-4 h-4 text-indigo-300" />
                        </div>
                        <h3 className="text-xs font-bold text-indigo-200 uppercase tracking-widest">北极星指令 (Next Best Action)</h3>
                    </div>
                    <p className="text-xl md:text-2xl font-bold leading-relaxed text-indigo-50 tracking-tight">
                        "{strategy.immediate_action}"
                    </p>
                </div>
            </div>

            {/* 2. Tactical Execution Tabs */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col min-h-[500px]">
                <div className="border-b border-slate-100 px-6 pt-2 bg-slate-50/50">
                    <Tabs 
                        items={TAB_ITEMS}
                        activeId={activeTab}
                        onChange={(id) => setActiveTab(id as any)}
                        variant="underline"
                        className="bg-transparent border-none"
                    />
                </div>

                <div className="p-6 flex-1 bg-white relative">
                    {activeTab === 'email' && (
                        <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2">
                            <div className="flex items-center justify-between">
                                <h4 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                    <Mail className="w-4 h-4 text-indigo-500" /> 邮件草稿
                                </h4>
                                <Button 
                                    size="sm" 
                                    variant="secondary" 
                                    icon={copied ? Check : Copy} 
                                    onClick={() => handleCopy(`Subject: ${strategy.email_draft?.subject || ''}\n\n${strategy.email_draft?.body || ''}`)}
                                >
                                    复制内容
                                </Button>
                            </div>
                            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                                <div className="bg-slate-50 p-4 border-b border-slate-200">
                                    <div className="text-sm font-medium text-slate-600">
                                        <span className="text-slate-400 mr-2">主题:</span> 
                                        {strategy.email_draft?.subject || '未生成主题'}
                                    </div>
                                </div>
                                <div className="p-6 bg-white text-sm text-slate-700 whitespace-pre-wrap leading-7 font-sans">
                                    {strategy.email_draft?.body || 'AI 未能生成邮件内容。请尝试重新生成。'}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'call' && (
                        <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2">
                            <div className="flex items-center justify-between">
                                <h4 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                    <Megaphone className="w-4 h-4 text-indigo-500" /> 沟通话术
                                </h4>
                                <div className="flex gap-2">
                                    <Button 
                                        size="sm"
                                        variant="gradient"
                                        icon={Swords}
                                        onClick={onStartRolePlay}
                                        className="shadow-sm"
                                    >
                                        进入演练模式
                                    </Button>
                                    <Button 
                                        size="sm" 
                                        variant="secondary" 
                                        icon={copied ? Check : Copy} 
                                        onClick={() => handleCopy(strategy.call_script || '')}
                                    >
                                        复制
                                    </Button>
                                </div>
                            </div>
                            <div className="bg-indigo-50/30 p-6 rounded-xl border border-indigo-100 text-sm text-slate-700 whitespace-pre-wrap leading-7 font-medium relative">
                                <div className="absolute top-4 right-4 opacity-10">
                                    <Phone className="w-24 h-24 text-indigo-900" />
                                </div>
                                {strategy.call_script || 'AI 未能生成沟通话术。请尝试重新生成。'}
                            </div>
                        </div>
                    )}

                    {activeTab === 'proposal' && (
                        <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2">
                             <div className="flex items-center justify-between mb-2">
                                <h4 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                    <PenTool className="w-4 h-4 text-indigo-500" /> 方案编写指引
                                </h4>
                            </div>
                            
                            {strategy.proposal_focus ? (
                                <div className="grid grid-cols-1 gap-4">
                                    <div className="bg-white border border-l-4 border-l-emerald-500 border-slate-200 p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                                        <h4 className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-2 flex items-center gap-2">
                                            <Target className="w-4 h-4" /> 核心价值主张 (Value Prop)
                                        </h4>
                                        <p className="text-sm text-slate-800 font-medium leading-relaxed">
                                            {strategy.proposal_focus.value_prop}
                                        </p>
                                    </div>

                                    <div className="bg-white border border-l-4 border-l-blue-500 border-slate-200 p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                                        <h4 className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-2 flex items-center gap-2">
                                            <Briefcase className="w-4 h-4" /> 推荐引用案例
                                        </h4>
                                        <p className="text-sm text-slate-800 font-medium leading-relaxed">
                                            {strategy.proposal_focus.case_study}
                                        </p>
                                    </div>

                                    <div className="bg-white border border-l-4 border-l-amber-500 border-slate-200 p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                                        <h4 className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-2 flex items-center gap-2">
                                            <DollarSign className="w-4 h-4" /> 报价策略建议
                                        </h4>
                                        <p className="text-sm text-slate-800 font-medium leading-relaxed">
                                            {strategy.proposal_focus.pricing_strategy}
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-10 text-slate-400">
                                    <p>AI 未生成具体的方案建议，请尝试完善画像后重试。</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
