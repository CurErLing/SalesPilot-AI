
import React from 'react';
import { Swords, TrendingUp, AlertTriangle } from 'lucide-react';
import { Card, CardTitle, CardDescription } from '../ui/Card';
import { Button } from '../ui/Button';
import { TagInput } from '../ui/TagInput';

interface Props {
    competitors: string[];
    onChange: (field: 'competitors', value: string[]) => void;
    onAnalyze: () => void;
}

export const CompetitiveLandscapeCard: React.FC<Props> = ({ competitors, onChange, onAnalyze }) => {
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
            <CardDescription>识别主要竞争对手，制定差异化打法。</CardDescription>

            <div className="mt-6">
                <div className="bg-red-50 rounded-xl p-4 border border-red-100">
                    <TagInput 
                        label={
                            <label className="text-xs font-bold text-red-500 uppercase tracking-wide flex items-center gap-2 mb-1">
                                <AlertTriangle className="w-4 h-4" /> 谁在抢这单生意？
                            </label>
                        }
                        tags={competitors || []}
                        onChange={(newTags) => onChange('competitors', newTags)}
                        variant="red"
                        placeholder="+ 添加竞争对手 (输入后回车)"
                    />
                </div>
            </div>
        </Card>
    );
};
