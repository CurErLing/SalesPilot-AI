
import React from 'react';
import { Customer } from '../../types';
import { CheckSquare, Calendar, AlertTriangle, ChevronRight, Clock, TrendingUp, Zap, Target, AlertCircle } from 'lucide-react';

interface TaskItem {
    type: 'meeting' | 'todo';
    date: string;
    content: string;
    customer: Customer;
}

interface RiskItem {
    customer: Customer;
    daysInactive: number;
    reason: string;
}

interface OpportunityItem {
    customer: Customer;
    score: number;
    revenue: string;
}

interface Props {
    tasks: TaskItem[];
    risks: RiskItem[]; // We will adapt the parent data to match this or handle locally
    onSelectCustomer: (id: string) => void;
    getStatusColor: (status: string) => string;
}

export const ActionCenter: React.FC<Props> = ({ tasks, risks: rawRisks, onSelectCustomer, getStatusColor }) => {
    
    // --- Data Processing Layer (Simulating smarter aggregation) ---
    
    // 1. Process Risks (Stalled Deals + Low Health)
    // Note: The parent passes 'risks' based on inactivity. We can enhance display here.
    const criticalRisks = rawRisks.slice(0, 3); // Top 3 risks

    // 2. Process Opportunities (High Score + Active Stage)
    // We need to filter 'tasks' to find the associated customers, or ideally, the parent should pass opportunities.
    // For now, let's derive "High Potential" from the tasks list contexts or risk contexts that are actually healthy? 
    // Since we don't have full customer list here, we might need to rely on what's passed or visualize Tasks better.
    // Let's stick to optimizing the display of what we have, plus Tasks.

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 h-auto lg:h-80">
            
            {/* COLUMN 1: CRITICAL RISKS (Red/Amber) */}
            <div className="bg-white rounded-2xl border border-red-100 shadow-sm flex flex-col overflow-hidden relative group">
                <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
                
                {/* Header */}
                <div className="p-5 border-b border-red-50 bg-red-50/30 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-red-100 text-red-600 rounded-lg">
                            <AlertTriangle className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800 text-sm">风险阻断</h3>
                            <p className="text-[10px] text-red-500 font-medium">需立即干预 ({criticalRisks.length})</p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
                    {criticalRisks.length > 0 ? (
                        criticalRisks.map((item, idx) => (
                            <div 
                                key={idx} 
                                onClick={() => onSelectCustomer(item.customer.id)}
                                className="group/item p-3 rounded-xl border border-transparent hover:border-red-200 hover:bg-red-50 transition-all cursor-pointer flex flex-col gap-2"
                            >
                                <div className="flex justify-between items-start">
                                    <span className="text-xs font-bold text-slate-700 truncate max-w-[120px] group-hover/item:text-red-700">
                                        {item.customer.name}
                                    </span>
                                    <span className="text-[10px] text-red-500 bg-red-100 px-1.5 py-0.5 rounded flex items-center gap-1">
                                        <Clock className="w-3 h-3" /> {item.daysInactive}天未动
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 text-[10px] text-slate-400">
                                    <span className={`px-1.5 rounded border ${getStatusColor(item.customer.status)}`}>
                                        {item.customer.status}
                                    </span>
                                    <span>•</span>
                                    <span>赢面: {item.customer.assessmentScore || '-'}分</span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400">
                            <CheckSquare className="w-8 h-8 mb-2 opacity-20" />
                            <p className="text-xs">无高危商机</p>
                        </div>
                    )}
                </div>
            </div>

            {/* COLUMN 2: MOMENTUM TASKS (Blue/Indigo) - The "To-Do" */}
            <div className="bg-white rounded-2xl border border-indigo-100 shadow-sm flex flex-col overflow-hidden relative">
                <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
                
                <div className="p-5 border-b border-indigo-50 bg-indigo-50/30 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-indigo-100 text-indigo-600 rounded-lg">
                            <Zap className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800 text-sm">今日行动</h3>
                            <p className="text-[10px] text-indigo-500 font-medium">{tasks.length} 项待推进</p>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
                    {tasks.length > 0 ? (
                        tasks.map((task, idx) => (
                            <div 
                                key={idx} 
                                onClick={() => onSelectCustomer(task.customer.id)}
                                className="p-3 rounded-xl border border-slate-100 hover:border-indigo-300 hover:shadow-sm hover:bg-white transition-all cursor-pointer bg-slate-50/50"
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <span className="text-xs font-bold text-indigo-700 truncate max-w-[150px]">
                                        {task.customer.name}
                                    </span>
                                    {task.type === 'meeting' ? (
                                        <span className="text-[10px] font-bold text-white bg-indigo-500 px-1.5 py-0.5 rounded flex items-center gap-1">
                                            <Calendar className="w-3 h-3" /> {task.date.slice(5)}
                                        </span>
                                    ) : (
                                        <span className="text-[10px] text-slate-400">{task.date.slice(5)}</span>
                                    )}
                                </div>
                                <div className="text-xs text-slate-600 line-clamp-1 leading-relaxed flex items-center gap-1.5">
                                    <div className={`w-1.5 h-1.5 rounded-full ${task.type === 'meeting' ? 'bg-orange-400' : 'bg-blue-400'}`}></div>
                                    {task.content}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400">
                            <Calendar className="w-8 h-8 mb-2 opacity-20" />
                            <p className="text-xs">今日日程清空</p>
                        </div>
                    )}
                </div>
            </div>

            {/* COLUMN 3: AI INSIGHTS / STRATEGY (Purple/Gradient) - New Feature */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border border-slate-700 shadow-lg flex flex-col overflow-hidden text-white relative">
                {/* Background Decoration */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/20 blur-3xl rounded-full pointer-events-none"></div>
                
                <div className="p-5 border-b border-slate-700/50 flex justify-between items-center relative z-10">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-purple-500/20 border border-purple-500/30 text-purple-300 rounded-lg">
                            <Target className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-white text-sm">赢单指引</h3>
                            <p className="text-[10px] text-slate-400 font-medium">AI Coach</p>
                        </div>
                    </div>
                </div>

                <div className="flex-1 p-5 relative z-10 flex flex-col justify-center">
                    <div className="space-y-4">
                        <div className="flex gap-3">
                            <div className="w-1 h-auto bg-gradient-to-b from-purple-500 to-indigo-500 rounded-full"></div>
                            <div>
                                <h4 className="text-xs font-bold text-purple-300 uppercase tracking-wider mb-1">画像完善度</h4>
                                <p className="text-xs text-slate-300 leading-relaxed">
                                    本周已补充 <span className="text-white font-bold">12</span> 个关键画像字段。
                                    建议重点关注 <span className="text-white font-bold decoration-wavy underline decoration-purple-500">联想集团</span> 的 EB 态度。
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <div className="w-1 h-auto bg-gradient-to-b from-emerald-500 to-teal-500 rounded-full"></div>
                            <div>
                                <h4 className="text-xs font-bold text-emerald-300 uppercase tracking-wider mb-1">机会洞察</h4>
                                <p className="text-xs text-slate-300 leading-relaxed">
                                    <span className="text-white font-bold">TechFlow 科技</span> 的赢面评分上升至 65分。
                                    AI 建议发起一次高层汇报以锁定预算。
                                </p>
                            </div>
                        </div>
                    </div>
                    
                    <button className="mt-6 w-full py-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-lg text-xs font-bold text-white transition-all flex items-center justify-center gap-2">
                        查看完整周报 <ChevronRight className="w-3 h-3" />
                    </button>
                </div>
            </div>

        </div>
    );
};
