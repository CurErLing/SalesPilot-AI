
import React, { useState } from 'react';
import { Customer } from '../../types';
import { generateSalesPitch } from '../../services/geminiService';
import { Shield, Target, Sparkles, AlertCircle, AlertTriangle, Swords, Crosshair } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { EmptyState } from '../ui/EmptyState';
import { Tabs } from '../ui/Tabs';
import { CompetitorBattleCardModal } from '../persona/CompetitorBattleCardModal';

interface Props {
    customer: Customer;
    onUpdate: (updatedCustomer: Customer) => void;
    objections: { objection: string; response: string }[] | undefined;
}

export const BattleCardsPanel: React.FC<Props> = ({ customer, onUpdate, objections }) => {
    const [activeTab, setActiveTab] = useState<'defense' | 'offense' | 'value'>('defense');
    const [loadingPitchFor, setLoadingPitchFor] = useState<string | null>(null);
    const [selectedCompetitor, setSelectedCompetitor] = useState<string | null>(null);

    const handleGeneratePitch = async (painPointDesc: string) => {
        setLoadingPitchFor(painPointDesc);
        try {
            const pitch = await generateSalesPitch(painPointDesc, customer);
            const currentPitches = customer.persona.painPointPitches || {};
            onUpdate({
                ...customer,
                persona: {
                    ...customer.persona,
                    painPointPitches: { ...currentPitches, [painPointDesc]: pitch }
                }
            });
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingPitchFor(null);
        }
    };

    const handlePitchChange = (painPointDesc: string, newPitch: string) => {
        const currentPitches = customer.persona.painPointPitches || {};
        onUpdate({
            ...customer,
            persona: {
                ...customer.persona,
                painPointPitches: { ...currentPitches, [painPointDesc]: newPitch }
            }
        });
    };

    const TAB_ITEMS = [
        { id: 'defense', label: '防御 (异议)', icon: Shield },
        { id: 'offense', label: '进攻 (竞品)', icon: Swords },
        { id: 'value', label: '价值 (痛点)', icon: Target },
    ];

    return (
        <div className="flex flex-col h-full bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between shrink-0">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <Crosshair className="w-5 h-5 text-indigo-500" /> 
                    攻防军火库
                </h3>
            </div>

            <div className="px-4 border-b border-slate-100">
                <Tabs 
                    items={TAB_ITEMS}
                    activeId={activeTab}
                    onChange={(id) => setActiveTab(id as any)}
                    variant="underline"
                    className="border-none bg-transparent"
                />
            </div>

            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-slate-50/30">
                
                {/* 1. DEFENSE: OBJECTIONS */}
                {activeTab === 'defense' && (
                    <div className="space-y-4 animate-in fade-in">
                        {objections && objections.length > 0 ? (
                            objections.map((obj, idx) => (
                                <div key={idx} className="bg-white rounded-xl border border-amber-100 overflow-hidden shadow-sm hover:shadow-md transition-all group">
                                    <div className="bg-amber-50/50 p-3 border-b border-amber-50 flex gap-3 items-start">
                                        <div className="bg-amber-100 text-amber-600 rounded-full p-1 mt-0.5 shrink-0">
                                            <AlertCircle className="w-3 h-3" />
                                        </div>
                                        <p className="text-xs font-bold text-slate-800 leading-snug pt-0.5">"{obj.objection}"</p>
                                    </div>
                                    <div className="p-3 bg-white text-xs text-slate-600 leading-relaxed">
                                        <span className="font-bold text-emerald-600 block mb-1">应对策略:</span>
                                        {obj.response}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="py-10 text-center">
                                <EmptyState 
                                    icon={Shield}
                                    title="暂无异议预测"
                                    description="请先点击左上角“生成策略”以获取 AI 预测的异议。"
                                />
                            </div>
                        )}
                    </div>
                )}

                {/* 2. OFFENSE: COMPETITORS */}
                {activeTab === 'offense' && (
                    <div className="space-y-4 animate-in fade-in">
                        {customer.persona.competitors && customer.persona.competitors.length > 0 ? (
                            customer.persona.competitors.map((comp, idx) => (
                                <button 
                                    key={idx}
                                    onClick={() => setSelectedCompetitor(comp)}
                                    className="w-full text-left bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:border-red-300 hover:shadow-md transition-all group relative overflow-hidden"
                                >
                                    <div className="absolute right-0 top-0 w-16 h-16 bg-red-500/5 rounded-full blur-xl -translate-y-1/2 translate-x-1/2 group-hover:bg-red-500/10 transition-colors"></div>
                                    <div className="flex items-center justify-between relative z-10">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center font-bold border border-red-100 group-hover:bg-red-600 group-hover:text-white transition-colors">
                                                {comp.charAt(0)}
                                            </div>
                                            <span className="font-bold text-slate-700 group-hover:text-red-700 transition-colors">{comp}</span>
                                        </div>
                                        <div className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded group-hover:bg-red-50 group-hover:text-red-600 transition-colors">
                                            点击查看狙击卡
                                        </div>
                                    </div>
                                </button>
                            ))
                        ) : (
                            <div className="py-10 text-center">
                                <EmptyState 
                                    icon={Swords}
                                    title="暂无竞品"
                                    description="请在“全景画像”中添加竞争对手，以生成针对性打击策略。"
                                />
                            </div>
                        )}
                    </div>
                )}

                {/* 3. VALUE: PAIN POINTS */}
                {activeTab === 'value' && (
                    <div className="space-y-4 animate-in fade-in">
                        {customer.persona.keyPainPoints && customer.persona.keyPainPoints.length > 0 ? (
                            customer.persona.keyPainPoints.map((pp, i) => (
                                <div key={pp.id || i} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm group hover:border-indigo-300 transition-colors">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                                        <h4 className="font-bold text-slate-800 text-xs">{pp.description}</h4>
                                    </div>
                                    
                                    {customer.persona.painPointPitches?.[pp.description] ? (
                                        <div className="relative">
                                            <textarea
                                                value={customer.persona.painPointPitches[pp.description]}
                                                onChange={(e) => handlePitchChange(pp.description, e.target.value)}
                                                className="w-full text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none resize-none leading-relaxed"
                                                rows={4}
                                            />
                                            <div className="flex justify-end mt-2">
                                                <button 
                                                    onClick={() => handleGeneratePitch(pp.description)}
                                                    className="text-[10px] text-indigo-400 hover:text-indigo-600 flex items-center gap-1 bg-white border border-slate-200 px-2 py-1 rounded-md hover:bg-slate-50"
                                                    disabled={loadingPitchFor === pp.description}
                                                >
                                                    <Sparkles className="w-3 h-3" /> 优化话术
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <Button 
                                            onClick={() => handleGeneratePitch(pp.description)}
                                            disabled={loadingPitchFor === pp.description}
                                            variant="secondary"
                                            size="sm"
                                            icon={Sparkles}
                                            isLoading={loadingPitchFor === pp.description}
                                            className="w-full text-xs"
                                        >
                                            生成进攻卖点
                                        </Button>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="py-10 text-center">
                                <EmptyState 
                                    icon={Target}
                                    title="暂无痛点"
                                    description="请先完善客户画像中的痛点信息。"
                                />
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Competitor Modal */}
            <CompetitorBattleCardModal 
                isOpen={!!selectedCompetitor}
                competitorName={selectedCompetitor}
                onClose={() => setSelectedCompetitor(null)}
                customer={customer}
            />
        </div>
    );
};
