
import React from 'react';
import { Target, AlertCircle, X, Flag, AlertTriangle } from 'lucide-react';
import { Card, CardTitle, CardDescription } from '../ui/Card';

interface Props {
    keyPainPoints: string[];
    currentSolution: string;
    customerExpectations?: string;
    onChange: (field: 'keyPainPoints' | 'currentSolution' | 'customerExpectations', value: any) => void;
}

export const NeedsCard: React.FC<Props> = ({ keyPainPoints, currentSolution, customerExpectations, onChange }) => {
    
    const removeItem = (index: number) => {
        const newList = [...(keyPainPoints || [])];
        newList.splice(index, 1);
        onChange('keyPainPoints', newList);
    };

    const addItem = (value: string) => {
        if (!value.trim()) return;
        const newList = [...(keyPainPoints || []), value.trim()];
        onChange('keyPainPoints', newList);
    };

    return (
        <Card className="p-6 h-full flex flex-col">
            <CardTitle icon={Target}><span className="text-base">需求与痛点分析</span></CardTitle>
            <CardDescription>定义客户当前的痛苦程度（Pain）与未来的成功图景（Gain）。</CardDescription>

            <div className="mt-6 space-y-8 flex-1">
                
                {/* 1. Pain Points Section */}
                <div>
                    <label className="text-xs font-bold text-red-500 uppercase tracking-wide mb-3 flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" /> 核心痛点 (Pain Points)
                    </label>
                    <div className="space-y-2">
                        {keyPainPoints?.map((pp, idx) => (
                            <div key={idx} className="group flex items-start gap-3 p-3 bg-red-50/50 border border-red-100/60 rounded-xl hover:border-red-200 hover:shadow-sm transition-all duration-200">
                                <div className="mt-0.5 p-1 bg-red-100 rounded-full text-red-500 shrink-0">
                                    <AlertCircle className="w-3.5 h-3.5" />
                                </div>
                                <span className="flex-1 text-sm text-slate-700 font-medium leading-relaxed">{pp}</span>
                                <button 
                                    onClick={() => removeItem(idx)} 
                                    className="text-red-300 hover:text-red-500 hover:bg-red-100 rounded p-1 opacity-0 group-hover:opacity-100 transition-all"
                                    title="删除痛点"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        ))}
                    </div>
                    <div className="mt-3 relative">
                        <input
                            type="text"
                            className="w-full p-3 pl-4 text-sm bg-white border border-dashed border-slate-300 rounded-xl hover:border-indigo-400 focus:border-indigo-500 outline-none transition-colors"
                            placeholder="+ 添加新痛点 (输入后按回车)"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    addItem(e.currentTarget.value);
                                    e.currentTarget.value = '';
                                }
                            }}
                        />
                    </div>
                </div>

                {/* 2. Gain / Expectations Section */}
                <div>
                    <label className="text-xs font-bold text-indigo-600 uppercase tracking-wide flex items-center gap-1 mb-2">
                        <Flag className="w-3.5 h-3.5" /> 客户预期 (Gain)
                    </label>
                    <textarea
                        value={customerExpectations || ''}
                        onChange={(e) => onChange('customerExpectations', e.target.value)}
                        className="w-full p-4 bg-indigo-50/30 border border-indigo-100 rounded-xl text-sm text-slate-700 leading-relaxed focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all resize-none shadow-inner"
                        rows={3}
                        placeholder="客户心中的成功是什么样子？例如：希望提升30%的并发处理能力..."
                    />
                </div>

                {/* 3. Current Situation */}
                <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2 block">当前现状 / 竞品方案</label>
                    <textarea
                        value={currentSolution}
                        onChange={(e) => onChange('currentSolution', e.target.value)}
                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-600 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all resize-none"
                        rows={3}
                        placeholder="目前客户是如何解决这个问题的？例如：使用 Excel 手工管理..."
                    />
                </div>
            </div>
        </Card>
    );
};
