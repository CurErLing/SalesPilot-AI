
import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

interface Props {
    onAnalyze: (text: string) => Promise<void>;
    isAnalyzing: boolean;
}

export const AIQuickFill: React.FC<Props> = ({ onAnalyze, isAnalyzing }) => {
    const [rawInput, setRawInput] = useState('');

    const handleAnalyzeClick = async () => {
        if (!rawInput.trim()) return;
        await onAnalyze(rawInput);
        setRawInput(''); // Clear after successful analysis
    };

    return (
        <Card className="h-full flex flex-col p-5 bg-gradient-to-b from-indigo-50/50 to-white border-indigo-100/80 shadow-sm">
            
            {/* Header */}
            <div className="flex items-center gap-3 mb-4 shrink-0">
                <div className="p-2 bg-white rounded-lg shadow-sm text-indigo-600 border border-indigo-100">
                    <Sparkles className="w-5 h-5" />
                </div>
                <div>
                    <h3 className="font-bold text-slate-800 text-sm">AI 智能填充</h3>
                    <p className="text-[10px] text-slate-400">从沟通记录中提取信息，自动填补画像格子</p>
                </div>
            </div>

            {/* Input Area */}
            <div className="flex-1 flex flex-col relative">
                <textarea
                    value={rawInput}
                    onChange={(e) => setRawInput(e.target.value)}
                    placeholder="在此粘贴：&#10;• 拜访/会议纪要&#10;• 客户邮件内容&#10;• 电话录音转录&#10;• 网页调研片段...&#10;&#10;AI 将自动提取并填充：&#10;✅ 行业与场景&#10;✅ 关键痛点&#10;✅ 决策人与立场&#10;✅ 竞品信息"
                    className="w-full flex-1 p-4 rounded-xl border border-indigo-100 bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 outline-none text-sm resize-none leading-relaxed placeholder:text-slate-300 shadow-inner"
                />
            </div>

            {/* Action Button */}
            <div className="mt-4 shrink-0">
                <Button
                    onClick={handleAnalyzeClick}
                    isLoading={isAnalyzing}
                    disabled={!rawInput.trim()}
                    icon={Sparkles}
                    className="w-full shadow-lg shadow-indigo-200"
                    variant="gradient"
                >
                    {isAnalyzing ? '正在解析...' : '开始智能填充'}
                </Button>
                <p className="text-[10px] text-center text-slate-400 mt-2">
                    解析结果将自动更新至左侧表单
                </p>
            </div>
        </Card>
    );
};
