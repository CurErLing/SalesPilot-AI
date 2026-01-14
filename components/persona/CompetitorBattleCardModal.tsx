
import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Customer } from '../../types';
import { generateCompetitorBattleCard } from '../../services/geminiService';
import { ThinkingState } from '../ui/ThinkingState';
import { Swords, AlertTriangle, Crosshair, HelpCircle, Shield, ThumbsDown, Zap } from 'lucide-react';
import { Button } from '../ui/Button';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    competitorName: string | null;
    customer: Customer;
}

interface BattleCardData {
    competitor_strength: string;
    competitor_weakness: string;
    our_kill_points: string[];
    trap_question: string;
}

export const CompetitorBattleCardModal: React.FC<Props> = ({ isOpen, onClose, competitorName, customer }) => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<BattleCardData | null>(null);

    useEffect(() => {
        if (isOpen && competitorName) {
            loadBattleCard(competitorName);
        } else {
            setData(null);
        }
    }, [isOpen, competitorName]);

    const loadBattleCard = async (name: string) => {
        setLoading(true);
        try {
            const result = await generateCompetitorBattleCard(name, customer);
            setData(result);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen || !competitorName) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={
                <div className="flex items-center gap-2">
                    <Swords className="w-6 h-6 text-red-600" />
                    <span className="text-xl">竞品狙击卡: {competitorName}</span>
                </div>
            }
            maxWidth="max-w-4xl"
            footer={<Button onClick={onClose} className="w-full">关闭战术板</Button>}
        >
            {loading ? (
                <ThinkingState 
                    title={`正在分析 ${competitorName} 的技术劣势...`}
                    steps={[
                        "扫描该竞品最新财报与市场评价...",
                        `结合客户行业 (${customer.persona.industry}) 进行 SWOT 分析...`,
                        "生成针对性的 Kill Points (必杀技)...",
                        "设计挖坑问题..."
                    ]}
                />
            ) : data ? (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                    
                    {/* Top: Their Strength vs Weakness */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Strengths (Defense) */}
                        <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
                            <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                                <Shield className="w-4 h-4" /> 对方优势 (承认客观事实)
                            </h4>
                            <p className="text-sm text-slate-700 leading-relaxed font-medium">
                                {data.competitor_strength}
                            </p>
                        </div>

                        {/* Weakness (Attack) */}
                        <div className="bg-red-50 rounded-xl p-5 border border-red-100 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-16 h-16 bg-red-100 rounded-full -translate-y-1/2 translate-x-1/2 blur-xl"></div>
                            <h4 className="text-sm font-bold text-red-600 uppercase tracking-wide mb-3 flex items-center gap-2">
                                <ThumbsDown className="w-4 h-4" /> 致命弱点 (攻击方向)
                            </h4>
                            <p className="text-sm text-red-800 leading-relaxed font-bold">
                                {data.competitor_weakness}
                            </p>
                        </div>
                    </div>

                    {/* Middle: Kill Points */}
                    <div className="bg-gradient-to-br from-indigo-50 to-white rounded-xl p-6 border border-indigo-100 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="p-1.5 bg-indigo-600 text-white rounded-lg shadow-sm">
                                <Crosshair className="w-5 h-5" />
                            </div>
                            <h3 className="text-lg font-bold text-indigo-900">Kill Points (必杀技)</h3>
                        </div>
                        
                        <div className="space-y-3">
                            {data.our_kill_points.map((point, idx) => (
                                <div key={idx} className="flex gap-3 items-start bg-white p-3 rounded-lg border border-indigo-50 shadow-sm">
                                    <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs shrink-0 mt-0.5">
                                        {idx + 1}
                                    </div>
                                    <p className="text-sm text-slate-700 leading-relaxed">
                                        {point}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Bottom: Trap Question */}
                    <div className="bg-amber-50 rounded-xl p-5 border border-amber-200 border-dashed flex items-start gap-4">
                        <div className="p-2 bg-amber-100 text-amber-600 rounded-full shrink-0">
                            <HelpCircle className="w-6 h-6" />
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-amber-700 uppercase tracking-wide mb-1">
                                挖坑问题 (Trap Question)
                            </h4>
                            <p className="text-xs text-amber-600/80 mb-2">
                                在合适的时机问这个问题，让客户自己意识到竞品的短板：
                            </p>
                            <p className="text-base font-bold text-slate-800 italic">
                                "{data.trap_question}"
                            </p>
                        </div>
                    </div>

                </div>
            ) : (
                <div className="text-center py-12 text-slate-400">
                    <AlertTriangle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>分析生成失败，请重试。</p>
                </div>
            )}
        </Modal>
    );
};
