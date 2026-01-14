
import React, { useState } from 'react';
import { PlayCircle, Zap, Mail, Phone, Check, Copy, Swords, Target, FileText, Briefcase, DollarSign } from 'lucide-react';
import { Button } from '../ui/Button';
import { LoadingState } from '../ui/LoadingState';

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
    const [activeTab, setActiveTab] = useState<'plan' | 'email' | 'call' | 'proposal'>('plan');
    const [copied, setCopied] = useState(false);

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const renderContent = () => {
        if (loading) {
            return (
                <LoadingState 
                    title="AI 军师正在制定作战计划..."
                    subtitle="基于客户画像、MEDDIC 模型与历史交互数据"
                />
            );
        }

        if (!strategy) {
            return (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-400 opacity-60 p-8 text-center">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                        <Target className="w-10 h-10 text-slate-300" />
                    </div>
                    <h3 className="text-lg font-medium text-slate-600 mb-2">准备制定策略</h3>
                    <p className="max-w-xs mx-auto mb-6">点击右上角“生成策略”，AI 将基于画像和历史记录为您生成具体的行动计划。</p>
                </div>
            );
        }

        return (
            <div className="flex-1 flex flex-col overflow-hidden animate-in fade-in">
                {/* Tab Navigation */}
                <div className="flex border-b border-slate-100 bg-slate-50/50">
                    <button 
                        onClick={() => setActiveTab('plan')}
                        className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors flex items-center justify-center gap-2 ${activeTab === 'plan' ? 'border-indigo-500 text-indigo-700 bg-white' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
                    >
                        <Zap className="w-4 h-4" /> 行动指南
                    </button>
                    <button 
                        onClick={() => setActiveTab('email')}
                        className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors flex items-center justify-center gap-2 ${activeTab === 'email' ? 'border-indigo-500 text-indigo-700 bg-white' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
                    >
                        <Mail className="w-4 h-4" /> 邮件草稿
                    </button>
                    <button 
                        onClick={() => setActiveTab('call')}
                        className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors flex items-center justify-center gap-2 ${activeTab === 'call' ? 'border-indigo-500 text-indigo-700 bg-white' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
                    >
                        <Phone className="w-4 h-4" /> 通话脚本
                    </button>
                    <button 
                        onClick={() => setActiveTab('proposal')}
                        className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors flex items-center justify-center gap-2 ${activeTab === 'proposal' ? 'border-indigo-500 text-indigo-700 bg-white' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
                    >
                        <FileText className="w-4 h-4" /> 方案建议
                    </button>
                </div>

                {/* Tab Content */}
                <div className="flex-1 overflow-y-auto p-6 bg-white relative custom-scrollbar">
                    {activeTab === 'plan' && (
                        <div className="space-y-6">
                            <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-5">
                                <h4 className="text-xs font-bold text-indigo-500 uppercase tracking-wider mb-2">下一步行动建议</h4>
                                <p className="text-indigo-900 font-bold text-lg leading-relaxed">
                                    {strategy.immediate_action}
                                </p>
                            </div>
                            <div className="text-sm text-slate-500 leading-relaxed">
                                <p>此建议基于 MEDDIC 模型与客户当前状态（{customerStatus}）生成。建议优先执行上述动作，以推进至下一阶段。</p>
                            </div>
                        </div>
                    )}

                    {activeTab === 'email' && (
                        <div className="space-y-4">
                            <div className="border border-slate-200 rounded-lg overflow-hidden">
                                <div className="bg-slate-50 p-3 border-b border-slate-200 flex flex-col gap-2">
                                    <div className="flex gap-2 text-sm">
                                        <span className="text-slate-500 w-12 text-right">Subject:</span>
                                        <span className="font-medium text-slate-800">{strategy.email_draft.subject}</span>
                                    </div>
                                </div>
                                <div className="p-4 bg-white text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                                    {strategy.email_draft.body}
                                </div>
                            </div>
                            <div className="flex justify-end">
                                <Button 
                                    size="sm" 
                                    variant="outline" 
                                    icon={copied ? Check : Copy} 
                                    onClick={() => handleCopy(`Subject: ${strategy.email_draft.subject}\n\n${strategy.email_draft.body}`)}
                                >
                                    {copied ? "已复制" : "复制邮件内容"}
                                </Button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'call' && (
                        <div className="space-y-4">
                            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 text-sm text-slate-700 whitespace-pre-wrap leading-relaxed relative font-mono">
                                {strategy.call_script}
                            </div>
                            <div className="flex justify-between items-center">
                                <Button 
                                    size="sm"
                                    variant="secondary"
                                    icon={Swords}
                                    onClick={onStartRolePlay}
                                    className="text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border-indigo-200"
                                >
                                    与 AI 陪练演习此脚本
                                </Button>
                                <Button 
                                    size="sm" 
                                    variant="outline" 
                                    icon={copied ? Check : Copy} 
                                    onClick={() => handleCopy(strategy.call_script)}
                                >
                                    {copied ? "已复制" : "复制脚本"}
                                </Button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'proposal' && strategy.proposal_focus && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 gap-4">
                                <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl">
                                    <h4 className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-2 flex items-center gap-2">
                                        <Target className="w-4 h-4" /> 核心价值主张 (Value Prop)
                                    </h4>
                                    <p className="text-sm text-slate-800 font-medium">
                                        {strategy.proposal_focus.value_prop}
                                    </p>
                                </div>

                                <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl">
                                    <h4 className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-2 flex items-center gap-2">
                                        <Briefcase className="w-4 h-4" /> 推荐引用案例
                                    </h4>
                                    <p className="text-sm text-slate-800 font-medium">
                                        {strategy.proposal_focus.case_study}
                                    </p>
                                </div>

                                <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl">
                                    <h4 className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-2 flex items-center gap-2">
                                        <DollarSign className="w-4 h-4" /> 报价策略建议
                                    </h4>
                                    <p className="text-sm text-slate-800 font-medium">
                                        {strategy.proposal_focus.pricing_strategy}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                    {activeTab === 'proposal' && !strategy.proposal_focus && (
                         <div className="text-center py-10 text-slate-400">
                             <p>暂无具体方案建议，请尝试重新生成策略。</p>
                         </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="flex flex-col h-full gap-4 min-h-[500px]">
            <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-sm shrink-0">
                <div>
                    <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <Swords className="w-5 h-5 text-indigo-500" /> 
                        AI 作战指挥部
                    </h2>
                    <p className="text-sm text-slate-500">基于画像洞察的跟进策略、方案建议与话术支持。</p>
                </div>
                <Button 
                    onClick={onGenerate}
                    isLoading={loading}
                    icon={PlayCircle}
                    size="sm"
                >
                    {strategy ? "重新生成" : "生成策略"}
                </Button>
            </div>

            <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
                {renderContent()}
            </div>
        </div>
    );
};
