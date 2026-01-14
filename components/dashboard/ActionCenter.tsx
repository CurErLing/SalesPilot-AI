
import React from 'react';
import { Customer } from '../../types';
import { CheckSquare, Calendar, AlertTriangle, ChevronRight, Clock, TrendingUp } from 'lucide-react';

interface TaskItem {
    type: 'meeting' | 'todo';
    date: string;
    content: string;
    customer: Customer;
}

interface RiskItem {
    customer: Customer;
    daysInactive: number;
}

interface Props {
    tasks: TaskItem[];
    risks: RiskItem[];
    onSelectCustomer: (id: string) => void;
    getStatusColor: (status: string) => string;
}

export const ActionCenter: React.FC<Props> = ({ tasks, risks, onSelectCustomer, getStatusColor }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            
            {/* 1. Next Steps / Tasks */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col h-72">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <CheckSquare className="w-5 h-5 text-indigo-500" />
                        今日待办
                    </h3>
                    <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-full">{tasks.length}</span>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-2">
                    {tasks.length > 0 ? (
                        tasks.map((task, idx) => (
                            <div 
                                key={idx} 
                                onClick={() => onSelectCustomer(task.customer.id)}
                                className="group p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-indigo-50 hover:border-indigo-100 transition-all cursor-pointer"
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <span className="text-xs font-bold text-indigo-600 truncate max-w-[150px]">{task.customer.name}</span>
                                    {task.type === 'meeting' ? (
                                        <span className="text-[10px] font-bold text-white bg-indigo-500 px-1.5 py-0.5 rounded flex items-center gap-1">
                                            <Calendar className="w-3 h-3" /> {task.date}
                                        </span>
                                    ) : (
                                        <span className="text-[10px] text-slate-400">{task.date}</span>
                                    )}
                                </div>
                                <div className="text-sm text-slate-700 font-medium line-clamp-2 leading-snug group-hover:text-indigo-900">
                                    {task.content}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-slate-400">
                            <CheckSquare className="w-8 h-8 mb-2 opacity-20" />
                            <p className="text-xs">太棒了！所有待办已完成</p>
                        </div>
                    )}
                </div>
            </div>

            {/* 2. Risks / Stalled Deals */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col h-72">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-amber-500" />
                        失联预警
                    </h3>
                    <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-full">{risks.length}</span>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-2">
                    {risks.length > 0 ? (
                        risks.map((item, idx) => (
                            <div 
                                key={idx} 
                                onClick={() => onSelectCustomer(item.customer.id)}
                                className="group p-3 rounded-xl border border-slate-100 bg-red-50/20 hover:bg-red-50 hover:border-red-200 transition-all cursor-pointer flex items-center justify-between"
                            >
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h4 className="text-sm font-bold text-slate-700 truncate">{item.customer.name}</h4>
                                        <span className={`text-[10px] px-1.5 py-0.5 rounded border ${getStatusColor(item.customer.status)} opacity-80`}>
                                            {item.customer.status}
                                        </span>
                                    </div>
                                    <div className="text-xs text-slate-500 flex items-center gap-1">
                                        <Clock className="w-3 h-3" /> 最后跟进: {item.customer.lastContact}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="block text-xl font-black text-red-500 group-hover:scale-110 transition-transform">{item.daysInactive}</span>
                                    <span className="text-[10px] text-red-400 font-medium">天失联</span>
                                </div>
                                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-red-400 ml-2" />
                            </div>
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-slate-400">
                            <TrendingUp className="w-8 h-8 mb-2 opacity-20" />
                            <p className="text-xs">客户跟进状况良好</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
