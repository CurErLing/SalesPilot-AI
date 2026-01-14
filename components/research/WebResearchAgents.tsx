
import React from 'react';
import { Newspaper, TrendingUp, Users, Target, Loader2, ArrowRight, Building, SearchCheck } from 'lucide-react';
import { Customer } from '../../types';

interface Props {
    customer: Customer;
    loading: boolean;
    activeScenarioId: string | null;
    onSelectScenario: (prompt: string, id: string) => void;
}

export const WebResearchAgents: React.FC<Props> = ({ customer, loading, activeScenarioId, onSelectScenario }) => {
    
    const scenarios = [
        {
          id: 'news',
          icon: Newspaper,
          title: '近期动态侦察',
          desc: '财报、并购、战略发布',
          color: 'bg-blue-50 text-blue-600 border-blue-100',
          hover: 'hover:border-blue-300 hover:shadow-blue-100',
          prompt: `搜索 "${customer.name}" 过去 6 个月的最新商业新闻、战略公告和财务报告。总结其关键的战略举措。`
        },
        {
          id: 'competitors',
          icon: TrendingUp,
          title: '竞品攻防分析',
          desc: '市场份额、产品对比',
          color: 'bg-orange-50 text-orange-600 border-orange-100',
          hover: 'hover:border-orange-300 hover:shadow-orange-100',
          prompt: `"${customer.name}" 的主要竞争对手是谁？相比 ${customer.name}，他们最近有哪些产品发布或市场动作？`
        },
        {
          id: 'executives',
          icon: Users,
          title: '关键人画像',
          desc: '高管背景、近期言论',
          color: 'bg-purple-50 text-purple-600 border-purple-100',
          hover: 'hover:border-purple-300 hover:shadow-purple-100',
          prompt: `查找关于 "${customer.name}" 的关键决策人、CIO/CTO/CEO 以及近期高管变动的信息。`
        },
        {
          id: 'painpoints',
          icon: Target,
          title: '痛点雷达扫描',
          desc: '行业挑战、IT需求',
          color: 'bg-red-50 text-red-600 border-red-100',
          hover: 'hover:border-red-300 hover:shadow-red-100',
          prompt: `目前 "${customer.persona.industry || '该'}" 行业有哪些普遍的运营挑战、数字化转型痛点和 IT 趋势？`
        }
    ];

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {scenarios.map((agent) => {
                const isActive = activeScenarioId === agent.id;
                return (
                    <button
                        key={agent.id}
                        onClick={() => onSelectScenario(agent.prompt, agent.id)}
                        disabled={loading}
                        className={`
                            relative text-left p-4 rounded-2xl border transition-all duration-300 group flex flex-col justify-between h-32
                            ${isActive 
                                ? 'ring-2 ring-indigo-500 bg-white border-transparent shadow-lg transform -translate-y-1' 
                                : `bg-white border-slate-200 shadow-sm ${agent.hover} hover:-translate-y-1`
                            }
                        `}
                    >
                        <div className="flex justify-between items-start w-full">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${agent.color} transition-colors`}>
                                {loading && isActive ? <Loader2 className="w-5 h-5 animate-spin"/> : <agent.icon className="w-5 h-5" />}
                            </div>
                            {isActive && <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>}
                        </div>
                        
                        <div>
                            <h3 className={`font-bold text-sm mb-1 ${isActive ? 'text-indigo-700' : 'text-slate-700'}`}>{agent.title}</h3>
                            <p className="text-xs text-slate-400 font-medium">{agent.desc}</p>
                        </div>

                        {/* Hover Effect Icon */}
                        <div className={`absolute bottom-3 right-3 transition-all duration-300 ${isActive ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0'}`}>
                            <ArrowRight className={`w-4 h-4 ${isActive ? 'text-indigo-500' : 'text-slate-300'}`} />
                        </div>
                    </button>
                );
            })}
        </div>
    );
};
