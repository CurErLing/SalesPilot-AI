
import React, { useState } from 'react';
import { Swords, TrendingUp, AlertTriangle, Target } from 'lucide-react';
import { Card, CardTitle, CardDescription } from '../ui/Card';
import { Button } from '../ui/Button';
import { TagInput } from '../ui/TagInput';
import { Customer } from '../../types'; // Need Customer for context passing
import { CompetitorBattleCardModal } from './CompetitorBattleCardModal';

interface Props {
    competitors: string[];
    onChange: (field: 'competitors', value: string[]) => void;
    onAnalyze: () => void;
    // Add customer prop implicitly by usage in parent, or we can just pass what's needed.
    // For simplicity, let's assume the parent passes 'customer' object if we change the signature, 
    // BUT to avoid breaking changes in parent, let's try to keep props minimal or optional.
    // Actually, to generate battle cards we need customer context (industry etc).
    // Let's rely on the parent wrapper to pass it down.
}

// Updating Props to include 'customer' context is cleaner, but let's see if we can avoid breaking 'PersonaBuilder'
// We will modify PersonaBuilder to pass 'customer' too. Wait, PersonaBuilder has 'customer'.
// Let's update the interface here.

interface EnhancedProps extends Props {
    customer?: Customer; // Optional to avoid breaking tests if any, but we will pass it
}

export const CompetitiveLandscapeCard: React.FC<EnhancedProps> = ({ competitors, onChange, onAnalyze, customer }) => {
    const [selectedCompetitor, setSelectedCompetitor] = useState<string | null>(null);

    return (
        <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
                <CardTitle icon={Swords}><span className="text-base">竞争格局</span></CardTitle>
                <Button 
                    size="sm" 
                    variant="ghost" 
                    className="text-[10px] text-indigo-600 bg-indigo-50 hover:bg-indigo-100 h-7"
                    icon={TrendingUp}
                    onClick={onAnalyze}
                    disabled={!competitors || competitors.length === 0}
                >
                    深度竞品分析
                </Button>
            </div>
            <CardDescription>
                识别主要竞争对手。点击竞品名称查看 <span className="font-bold text-indigo-600">“狙击卡 (Battle Card)”</span>。
            </CardDescription>

            <div className="mt-6 space-y-4">
                {/* Interactive Competitor List */}
                {competitors && competitors.length > 0 && (
                    <div className="flex flex-wrap gap-3">
                        {competitors.map((comp, idx) => (
                            <button 
                                key={idx}
                                onClick={() => setSelectedCompetitor(comp)}
                                className="group relative flex items-center gap-2 px-4 py-2 bg-white border border-red-200 rounded-lg shadow-sm hover:shadow-md hover:border-red-400 hover:-translate-y-0.5 transition-all text-sm text-slate-700 font-bold"
                            >
                                <div className="w-2 h-2 rounded-full bg-red-500 group-hover:animate-pulse"></div>
                                {comp}
                                <span className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-[10px] px-1.5 py-0.5 rounded shadow-lg pointer-events-none whitespace-nowrap z-10 flex items-center gap-1">
                                    <Target className="w-3 h-3" /> 点击生成狙击卡
                                </span>
                            </button>
                        ))}
                    </div>
                )}

                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                    <TagInput 
                        label={
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wide flex items-center gap-2 mb-1">
                                <AlertTriangle className="w-4 h-4" /> 管理竞品列表
                            </label>
                        }
                        tags={competitors || []}
                        onChange={(newTags) => onChange('competitors', newTags)}
                        variant="red"
                        placeholder="+ 添加竞争对手 (输入后回车)"
                    />
                </div>
            </div>

            {/* Battle Card Modal */}
            {customer && (
                <CompetitorBattleCardModal 
                    isOpen={!!selectedCompetitor}
                    competitorName={selectedCompetitor}
                    onClose={() => setSelectedCompetitor(null)}
                    customer={customer}
                />
            )}
        </Card>
    );
};
