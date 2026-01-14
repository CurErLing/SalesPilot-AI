
import React from 'react';
import { Wallet, TrendingUp } from 'lucide-react';
import { Card, CardTitle, CardDescription } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { TagInput } from '../ui/TagInput';

interface Props {
    budget: string;
    projectTimeline: string;
    competitors: string[];
    onChange: (field: 'budget' | 'projectTimeline' | 'competitors', value: any) => void;
    onAnalyze: () => void;
}

export const CommercialsCard: React.FC<Props> = ({ budget, projectTimeline, competitors, onChange, onAnalyze }) => {
    return (
        <Card className="p-6">
            <CardTitle icon={Wallet}><span className="text-base">商务条件</span></CardTitle>
            <CardDescription>预算、时间表与竞争态势。</CardDescription>
            <div className="space-y-4 mt-6">
                <div className="grid grid-cols-2 gap-4">
                    <Input 
                        label="项目预算"
                        value={budget}
                        onChange={(e) => onChange('budget', e.target.value)}
                        placeholder="-- 未填写 --"
                        className="bg-slate-50 font-bold text-emerald-600 focus:bg-white"
                    />
                    <Input 
                        label="预计时间表"
                        value={projectTimeline}
                        onChange={(e) => onChange('projectTimeline', e.target.value)}
                        placeholder="-- 未填写 --"
                        className="bg-slate-50 focus:bg-white"
                    />
                </div>

                <TagInput 
                    label={
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">主要竞争对手</label>
                            {competitors && competitors.length > 0 && (
                                <Button 
                                    size="sm" 
                                    variant="ghost" 
                                    className="h-5 text-[10px] px-2 text-indigo-600 bg-indigo-50 hover:bg-indigo-100"
                                    icon={TrendingUp}
                                    onClick={onAnalyze}
                                >
                                    深度竞品分析
                                </Button>
                            )}
                        </div>
                    }
                    tags={competitors || []}
                    onChange={(newTags) => onChange('competitors', newTags)}
                    variant="red"
                    placeholder="+ 添加竞品 (按回车)"
                />
            </div>
        </Card>
    );
};
