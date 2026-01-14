
import React, { useState } from 'react';
import { Target, AlertCircle, X, Flag, CheckCircle2, Circle, ChevronDown, ChevronRight, Mic, Globe, User, RotateCcw } from 'lucide-react';
import { Card, CardTitle, CardDescription } from '../ui/Card';
import { PainPoint } from '../../types';
import { Badge } from '../ui/Badge';

interface Props {
    keyPainPoints: PainPoint[];
    currentSolution: string;
    customerExpectations?: string;
    onChange: (field: 'keyPainPoints' | 'currentSolution' | 'customerExpectations', value: any) => void;
}

export const NeedsCard: React.FC<Props> = ({ keyPainPoints, currentSolution, customerExpectations, onChange }) => {
    const [showSolved, setShowSolved] = useState(false);

    // Sort by date desc (newest first)
    const sortedPoints = [...(keyPainPoints || [])].sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    const activePoints = sortedPoints.filter(p => !p.isSolved);
    const solvedPoints = sortedPoints.filter(p => p.isSolved);

    const toggleSolved = (id: string) => {
        const newList = keyPainPoints.map(pp => 
            pp.id === id ? { ...pp, isSolved: !pp.isSolved } : pp
        );
        onChange('keyPainPoints', newList);
    };

    const removeItem = (id: string) => {
        const newList = keyPainPoints.filter(pp => pp.id !== id);
        onChange('keyPainPoints', newList);
    };

    const addItem = (value: string) => {
        if (!value.trim()) return;
        const newPoint: PainPoint = {
            id: Date.now().toString(),
            description: value.trim(),
            createdAt: new Date().toISOString().split('T')[0],
            source: '手动录入',
            isSolved: false
        };
        const newList = [newPoint, ...(keyPainPoints || [])];
        onChange('keyPainPoints', newList);
    };

    const getSourceIcon = (source?: string) => {
        const s = (source || '').toLowerCase();
        if (s.includes('visit') || s.includes('meeting') || s.includes('call')) return <Mic className="w-3 h-3" />;
        if (s.includes('research') || s.includes('web')) return <Globe className="w-3 h-3" />;
        return <User className="w-3 h-3" />;
    };

    return (
        <Card className="p-6 h-full flex flex-col">
            <CardTitle icon={Target}><span className="text-base">需求与痛点分析</span></CardTitle>
            <CardDescription>定义客户当前的痛苦程度（Pain）与未来的成功图景（Gain）。</CardDescription>

            <div className="mt-6 space-y-8 flex-1 overflow-y-auto custom-scrollbar pr-2">
                
                {/* 1. Pain Points Section */}
                <div>
                    <div className="flex items-center justify-between mb-3">
                        <label className="text-xs font-bold text-red-500 uppercase tracking-wide flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5" /> 核心痛点 (Pain Points)
                        </label>
                        <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                            {activePoints.length} 待解决
                        </span>
                    </div>
                    
                    {/* Input Field */}
                    <div className="mb-4">
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

                    {/* Active List */}
                    <div className="space-y-3">
                        {activePoints.map((pp) => (
                            <div key={pp.id} className="group flex items-start gap-3 p-3 bg-white border border-slate-200 rounded-xl hover:border-red-200 hover:shadow-sm transition-all duration-200">
                                {/* Toggle Checkbox */}
                                <button 
                                    onClick={() => toggleSolved(pp.id)}
                                    className="mt-0.5 text-slate-300 hover:text-emerald-500 transition-colors shrink-0"
                                    title="标记为已解决"
                                >
                                    <Circle className="w-5 h-5" />
                                </button>

                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-slate-800 font-medium leading-relaxed break-words">
                                        {pp.description}
                                    </p>
                                    <div className="flex items-center gap-2 mt-1.5">
                                        <Badge variant="neutral" className="text-[10px] px-1.5 py-0 flex items-center gap-1 bg-slate-50 border-slate-100 text-slate-400">
                                            {getSourceIcon(pp.source)}
                                            <span className="truncate max-w-[150px]">{pp.source || '手动录入'}</span>
                                        </Badge>
                                        <span className="text-[10px] text-slate-300">|</span>
                                        <span className="text-[10px] text-slate-400">{pp.createdAt}</span>
                                    </div>
                                </div>

                                <button 
                                    onClick={() => removeItem(pp.id)} 
                                    className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all shrink-0"
                                    title="删除"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                        {activePoints.length === 0 && (
                            <div className="text-center py-6 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                <p className="text-xs text-slate-400">暂无待解决的痛点</p>
                            </div>
                        )}
                    </div>

                    {/* Solved List (Collapsible) */}
                    {solvedPoints.length > 0 && (
                        <div className="mt-6">
                            <button 
                                onClick={() => setShowSolved(!showSolved)}
                                className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wide hover:text-slate-600 transition-colors mb-3"
                            >
                                {showSolved ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                                已解决痛点 ({solvedPoints.length})
                            </button>
                            
                            {showSolved && (
                                <div className="space-y-2 animate-in slide-in-from-top-2 duration-200">
                                    {solvedPoints.map((pp) => (
                                        <div key={pp.id} className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-100 rounded-xl opacity-70 hover:opacity-100 transition-opacity">
                                            <button 
                                                onClick={() => toggleSolved(pp.id)}
                                                className="text-emerald-500 hover:text-slate-400 transition-colors shrink-0"
                                                title="恢复为未解决"
                                            >
                                                <CheckCircle2 className="w-5 h-5" />
                                            </button>
                                            
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm text-slate-500 line-through decoration-slate-300">
                                                    {pp.description}
                                                </p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-[10px] text-slate-400">{pp.source || '未知来源'}</span>
                                                </div>
                                            </div>

                                            <button 
                                                onClick={() => toggleSolved(pp.id)}
                                                className="text-slate-400 hover:text-indigo-500 shrink-0"
                                                title="恢复"
                                            >
                                                <RotateCcw className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
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
