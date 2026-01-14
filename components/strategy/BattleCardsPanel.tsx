
import React, { useState } from 'react';
import { Customer } from '../../types';
import { generateSalesPitch } from '../../services/geminiService';
import { Shield, Target, Sparkles, AlertCircle, AlertTriangle } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { EmptyState } from '../ui/EmptyState';

interface Props {
    customer: Customer;
    onUpdate: (updatedCustomer: Customer) => void;
    objections: { objection: string; response: string }[] | undefined;
}

export const BattleCardsPanel: React.FC<Props> = ({ customer, onUpdate, objections }) => {
    const [loadingPitchFor, setLoadingPitchFor] = useState<string | null>(null);

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

    return (
        <div className="flex flex-col h-full gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm shrink-0">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-indigo-500" />
                    谈判弹药库
                </h2>
                <p className="text-sm text-slate-500">进攻卖点与防御话术。</p>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-6 pb-6">
                
                {/* Section 1: Core Pitch (Offense) */}
                <div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1">
                        <Target className="w-3.5 h-3.5" /> 核心卖点 (针对痛点)
                    </h3>
                    {customer.persona.keyPainPoints && customer.persona.keyPainPoints.length > 0 ? (
                        <div className="space-y-4">
                            {customer.persona.keyPainPoints.map((pp, i) => (
                                <Card key={pp.id || i} className="p-4 group border-slate-200 hover:border-indigo-300 transition-colors">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-2 h-2 rounded-full bg-red-500"></div>
                                        <h4 className="font-semibold text-slate-800 text-sm">{pp.description}</h4>
                                    </div>
                                    {customer.persona.painPointPitches?.[pp.description] ? (
                                        <div className="relative">
                                            <textarea
                                                value={customer.persona.painPointPitches[pp.description]}
                                                onChange={(e) => handlePitchChange(pp.description, e.target.value)}
                                                className="w-full text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none resize-none leading-relaxed"
                                                rows={3}
                                            />
                                            <div className="flex justify-end mt-1">
                                                <button 
                                                    onClick={() => handleGeneratePitch(pp.description)}
                                                    className="text-[10px] text-indigo-400 hover:text-indigo-600 flex items-center gap-1"
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
                                            生成进攻话术
                                        </Button>
                                    )}
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                            <EmptyState 
                                icon={AlertTriangle}
                                title="暂无痛点数据"
                                description="请先在“客户画像”中添加痛点，以便生成针对性话术。"
                            />
                        </div>
                    )}
                </div>

                {/* Section 2: Objection Handling (Defense) */}
                {objections && objections.length > 0 && (
                    <div>
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1">
                            <Shield className="w-3.5 h-3.5" /> 异议处理 (AI 预测)
                        </h3>
                        <div className="space-y-4">
                            {objections.map((obj, idx) => (
                                <Card key={idx} className="p-4 bg-amber-50/40 border-amber-100 hover:border-amber-300 transition-colors">
                                    <div className="flex items-start gap-3 mb-2">
                                        <div className="mt-1 shrink-0 p-1 bg-amber-100 text-amber-600 rounded-full">
                                            <AlertCircle className="w-3 h-3" />
                                        </div>
                                        <p className="text-sm font-bold text-slate-800 italic">"{obj.objection}"</p>
                                    </div>
                                    <div className="pl-8">
                                        <div className="bg-white p-3 rounded-lg border border-amber-100 text-xs text-slate-600 leading-relaxed shadow-sm">
                                            <span className="font-bold text-emerald-600 block mb-1">应对策略:</span>
                                            {obj.response}
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};
