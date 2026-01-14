
import React, { useState } from 'react';
import { Sparkles, ClipboardPaste } from 'lucide-react';
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
        setRawInput(''); 
    };

    return (
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-1 shadow-lg">
            <div className="bg-white rounded-xl p-4 flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="w-4 h-4 text-indigo-600" />
                        <h3 className="font-bold text-slate-800 text-sm">情报碎纸机 (AI Intelligence Inbox)</h3>
                    </div>
                    <textarea
                        value={rawInput}
                        onChange={(e) => setRawInput(e.target.value)}
                        placeholder="在此粘贴任何非结构化文本：会议纪要、邮件片段、微信聊天记录... AI 将自动识别决策人、痛点和竞品信息并归档。"
                        className="w-full h-20 p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all resize-none placeholder:text-slate-400"
                    />
                </div>
                <div className="flex flex-col justify-end md:w-32 shrink-0">
                    <Button
                        onClick={handleAnalyzeClick}
                        isLoading={isAnalyzing}
                        disabled={!rawInput.trim()}
                        icon={ClipboardPaste}
                        size="sm"
                        variant="gradient"
                        className="w-full h-full max-h-20 text-xs shadow-md"
                    >
                        {isAnalyzing ? '分析中...' : '智能归档'}
                    </Button>
                </div>
            </div>
        </div>
    );
};
