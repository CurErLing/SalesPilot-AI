
import React, { useState } from 'react';
import { Building2, Sparkles, Loader2, Wallet, Clock, Map, Target, FileText, ChevronDown } from 'lucide-react';
import { Card, CardTitle, CardDescription } from '../ui/Card';
import { Button } from '../ui/Button';
import { enrichFirmographics } from '../../services/geminiService';

interface Props {
    // Project Data
    projectName?: string;
    projectBackground?: string;
    status: string;
    
    // Firmographics
    industry: string;
    companySize: string;
    scenario?: string;
    companyName?: string;
    
    // Commercials
    budget: string;
    projectTimeline: string;
    
    // Actions
    onChange: (field: any, value: string) => void;
    onStatusChange: (status: any) => void;
}

const STAGES = ['线索', '合格', '提案', '谈判', '赢单', '输单'];

export const ProjectContextCard: React.FC<Props> = ({ 
    projectName,
    projectBackground,
    status,
    industry, 
    companySize, 
    scenario, 
    budget, 
    projectTimeline, 
    companyName, 
    onChange,
    onStatusChange
}) => {
    const [loading, setLoading] = useState(false);

    const handleAutoFill = async () => {
        if (!companyName) return;
        setLoading(true);
        try {
            const result = await enrichFirmographics(companyName);
            if (result.industry) onChange('industry', result.industry);
            if (result.companySize) onChange('companySize', result.companySize);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="p-0 overflow-hidden border-slate-200 shadow-md">
            {/* Header: Project Identity */}
            <div className="bg-slate-50/80 p-6 border-b border-slate-200 flex justify-between items-start">
                <div className="flex-1 mr-4">
                    <div className="flex items-center gap-2 mb-2">
                        <CardTitle icon={FileText}><span className="text-lg">项目概况</span></CardTitle>
                        {companyName && (
                            <Button 
                                size="sm" 
                                variant="ghost" 
                                className="text-[10px] text-indigo-600 bg-indigo-50 hover:bg-indigo-100 h-6 px-2"
                                icon={loading ? Loader2 : Sparkles}
                                onClick={handleAutoFill}
                                isLoading={loading}
                                disabled={loading}
                            >
                                AI 完善背景
                            </Button>
                        )}
                    </div>
                    <input
                        type="text"
                        value={projectName || ''}
                        onChange={(e) => onChange('projectName', e.target.value)}
                        className="text-2xl font-extrabold text-slate-900 bg-transparent border-none focus:ring-0 p-0 placeholder:text-slate-300 w-full"
                        placeholder="输入项目名称..."
                    />
                    <CardDescription>定义项目的核心背景、关键指标与当前状态。</CardDescription>
                </div>
            </div>

            <div className="p-6 space-y-8">
                {/* 1. Key Metrics Row (Budget, Time, Stage) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                     {/* Budget */}
                     <div className="bg-emerald-50/50 rounded-xl p-4 border border-emerald-100 flex flex-col justify-between h-full group hover:border-emerald-200 transition-colors">
                        <label className="text-xs font-bold text-emerald-600 uppercase tracking-wide flex items-center gap-1.5 mb-2">
                            <Wallet className="w-4 h-4" /> 预算规划
                        </label>
                        <input
                            type="text"
                            value={budget}
                            onChange={(e) => onChange('budget', e.target.value)}
                            className="w-full bg-transparent border-none p-0 text-xl font-black text-slate-800 focus:ring-0 placeholder:text-emerald-300/50 placeholder:font-normal"
                            placeholder="¥ --"
                        />
                     </div>

                     {/* Timeline */}
                     <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100 flex flex-col justify-between h-full group hover:border-blue-200 transition-colors">
                        <label className="text-xs font-bold text-blue-600 uppercase tracking-wide flex items-center gap-1.5 mb-2">
                            <Clock className="w-4 h-4" /> 预计上线
                        </label>
                        <input
                            type="text"
                            value={projectTimeline}
                            onChange={(e) => onChange('projectTimeline', e.target.value)}
                            className="w-full bg-transparent border-none p-0 text-xl font-black text-slate-800 focus:ring-0 placeholder:text-blue-300/50 placeholder:font-normal"
                            placeholder="例如: 2024 Q3"
                        />
                     </div>

                     {/* Stage */}
                     <div className="bg-indigo-50/50 rounded-xl p-4 border border-indigo-100 flex flex-col justify-between h-full group hover:border-indigo-200 transition-colors relative">
                        <label className="text-xs font-bold text-indigo-600 uppercase tracking-wide flex items-center gap-1.5 mb-2">
                            <Target className="w-4 h-4" /> 当前阶段
                        </label>
                        <div className="relative">
                            <select 
                                value={status} 
                                onChange={(e) => onStatusChange(e.target.value)}
                                className="w-full bg-transparent border-none p-0 text-xl font-black text-slate-800 focus:ring-0 appearance-none cursor-pointer relative z-10 pr-6"
                            >
                                {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                            <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-300 pointer-events-none" />
                        </div>
                     </div>
                </div>

                {/* 2. Deep Context Area (Background & Scenario) */}
                <div className="space-y-4">
                    <div>
                        <label className="text-sm font-bold text-slate-700 mb-2 block flex items-center gap-2">
                            项目背景与核心需求
                            <span className="text-[10px] font-normal text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">AI 自动提取重点</span>
                        </label>
                        <textarea
                            value={projectBackground || ''}
                            onChange={(e) => onChange('projectBackground', e.target.value)}
                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm leading-relaxed text-slate-700 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all resize-none shadow-inner"
                            rows={4}
                            placeholder="描述项目的发起缘由、业务痛点及核心建设目标。例如：由于现有系统无法支撑双11流量，急需进行微服务架构升级..."
                        />
                    </div>

                    <div>
                         <label className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2 block flex items-center gap-1">
                            <Map className="w-3.5 h-3.5" /> 具体业务场景 (Scenario)
                        </label>
                        <input
                            type="text"
                            value={scenario || ''}
                            onChange={(e) => onChange('scenario', e.target.value)}
                            className="w-full p-3 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                            placeholder="例如：门店数字化升级 / 供应链协同..."
                        />
                    </div>
                </div>

                {/* 3. Firmographics (Secondary Info) */}
                <div className="pt-6 border-t border-slate-100">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">客户基本面</h4>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-semibold text-slate-500 mb-1.5 block">所属行业</label>
                            <input
                                type="text"
                                value={industry}
                                onChange={(e) => onChange('industry', e.target.value)}
                                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                placeholder="-- 未填写 --"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-slate-500 mb-1.5 block">人员规模</label>
                            <input
                                type="text"
                                value={companySize}
                                onChange={(e) => onChange('companySize', e.target.value)}
                                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                placeholder="-- 未填写 --"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
};
