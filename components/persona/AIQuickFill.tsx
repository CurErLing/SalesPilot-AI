
import React, { useState } from 'react';
import { Sparkles, ClipboardPaste, X, Zap } from 'lucide-react';
import { Button } from '../ui/Button';

interface Props {
    onAnalyze: (text: string) => Promise<void>;
    isAnalyzing: boolean;
}

export const AIQuickFill: React.FC<Props> = ({ onAnalyze, isAnalyzing }) => {
    const [rawInput, setRawInput] = useState('');
    const [isExpanded, setIsExpanded] = useState(false);

    const handleAnalyzeClick = async () => {
        if (!rawInput.trim()) return;
        await onAnalyze(rawInput);
        setRawInput(''); 
        setIsExpanded(false);
    };

    if (!isExpanded) {
        return (
            <div className="flex justify-center">
                <button 
                    onClick={() => setIsExpanded(true)}
                    className="flex items-center gap-3 px-6 py-3 bg-white border border-indigo-200 rounded-full shadow-lg shadow-indigo-100 hover:shadow-indigo-200 hover:-translate-y-0.5 transition-all group"
                >
                    <div className="p-1.5 bg-indigo-600 text-white rounded-full group-hover:rotate-12 transition-transform">
                        <Sparkles className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-bold text-indigo-900">使用 AI 快速完善画像...</span>
                    <div className="text-[10px] text-indigo-400 bg-indigo-50 px-2 py-0.5 rounded-full font-mono">粘贴纪要/邮件</div>
                </button>
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-1 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="bg-white rounded-xl p-5">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
                            <Zap className="w-4 h-4" />
                        </div>
                        <h3 className="font-bold text-slate-800 text-sm">情报解析中心</h3>
                    </div>
                    <button onClick={() => setIsExpanded(false)} className="p-1 hover:bg-slate-100 rounded-full text-slate-400">
                        <X className="w-4 h-4" />
                    </button>
                </div>
                <textarea
                    autoFocus
                    value={rawInput}
                    onChange={(e) => setRawInput(e.target.value)}
                    placeholder="在此粘贴会议纪要、邮件片段或微信聊天记录... AI 将自动识别决策人、痛点、预算等信息并归档。"
                    className="w-full h-32 p-4 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-700 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all resize-none placeholder:text-slate-400 leading-relaxed"
                />
                <div className="flex justify-end mt-4 gap-3">
                    <Button variant="ghost" size="sm" onClick={() => setIsExpanded(false)}>稍后补齐</Button>
                    <Button
                        onClick={handleAnalyzeClick}
                        isLoading={isAnalyzing}
                        disabled={!rawInput.trim()}
                        icon={ClipboardPaste}
                        size="sm"
                        variant="gradient"
                        className="px-8 shadow-md shadow-indigo-200"
                    >
                        {isAnalyzing ? '正在深度提取情报...' : '智能补齐画像'}
                    </Button>
                </div>
            </div>
        </div>
    );
};
