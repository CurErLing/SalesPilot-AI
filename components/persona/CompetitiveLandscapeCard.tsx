
import React, { useState } from 'react';
import { Swords, TrendingUp, AlertTriangle, Target, Search } from 'lucide-react';
import { Card, CardTitle, CardDescription } from '../ui/Card';
import { Button } from '../ui/Button';
import { TagInput } from '../ui/TagInput';
import { Customer, ViewState } from '../../types';
import { CompetitorBattleCardModal } from './CompetitorBattleCardModal';

interface Props {
    competitors: string[];
    onChange: (field: 'competitors', value: string[]) => void;
    onAnalyze: () => void;
    customer?: Customer;
    onChangeView?: (view: ViewState) => void;
}

export const CompetitiveLandscapeCard: React.FC<Props> = ({ competitors, onChange, onAnalyze, customer, onChangeView }) => {
    const [selectedCompetitor, setSelectedCompetitor] = useState<string | null>(null);

    return (
        <Card className="p-6 h-full flex flex-col">
            <div className="flex items-center justify-between mb-2">
                <CardTitle icon={Swords}><span className="text-base">竞争格局</span></CardTitle>
                <div className="flex gap-2">
                     <Button 
                        size="sm" 
                        variant="ghost" 
                        className="text-[10px] text-indigo-600 bg-indigo-50 hover:bg-indigo-100 h-7"
                        icon={Search}
                        onClick={() => onChangeView?.(ViewState.WEB_RESEARCH)}
                    >
                        搜情报
                    </Button>
                </div>
            </div>
            <CardDescription>
                补齐竞品信息是画像核心。点击竞品查看 AI 生成的 <span className="font-bold text-red-600">“狙击卡”</span>。
            </CardDescription>

            <div className="mt-6 space-y-4 flex-1">
                {competitors && competitors.length > 0 ? (
                    <div className="flex flex-wrap gap-3">
                        {competitors.map((comp, idx) => (
                            <button 
                                key={idx}
                                onClick={() => setSelectedCompetitor(comp)}
                                className="group relative flex items-center gap-2 px-4 py-2.5 bg-white border border-red-100 rounded-xl shadow-sm hover:shadow-md hover:border-red-400 transition-all text-sm text-slate-700 font-bold"
                            >
                                <div className="w-2 h-2 rounded-full bg-red-500 group-hover:animate-ping"></div>
                                {comp}
                                <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-[10px] px-2 py-0.5 rounded shadow-lg pointer-events-none z-10">
                                    生成狙击卡
                                </div>
                            </button>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-6 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                        <p className="text-xs text-slate-400">暂无竞品信息。建议调研对手招标记录。</p>
                    </div>
                )}

                <div className="bg-slate-50/50 rounded-xl p-4 border border-slate-200 mt-auto">
                    <TagInput 
                        label={
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-2">
                                <AlertTriangle className="w-3.5 h-3.5" /> 录入竞争对手
                            </label>
                        }
                        tags={competitors || []}
                        onChange={(newTags) => onChange('competitors', newTags)}
                        variant="red"
                        placeholder="+ 按回车添加"
                    />
                </div>
            </div>

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
