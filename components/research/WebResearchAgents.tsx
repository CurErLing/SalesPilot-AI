
import React from 'react';
import { Newspaper, TrendingUp, Users, Target, Loader2, ArrowRight } from 'lucide-react';
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
          title: '近期战略与动态',
          color: 'bg-blue-50 text-blue-600 border-blue-200',
          prompt: `搜索 "${customer.name}" 过去 6 个月的最新商业新闻、战略公告和财务报告。总结其关键的战略举措。`
        },
        {
          id: 'competitors',
          icon: TrendingUp,
          title: '竞品与市场分析',
          color: 'bg-orange-50 text-orange-600 border-orange-200',
          prompt: `"${customer.name}" 的主要竞争对手是谁？相比 ${customer.name}，他们最近有哪些产品发布或市场动作？`
        },
        {
          id: 'executives',
          icon: Users,
          title: '高管与组织架构',
          color: 'bg-purple-50 text-purple-600 border-purple-200',
          prompt: `查找关于 "${customer.name}" 的关键决策人、CIO/CTO/CEO 以及近期高管变动的信息。`
        },
        {
          id: 'painpoints',
          icon: Target,
          title: '行业痛点扫描',
          color: 'bg-red-50 text-red-600 border-red-200',
          prompt: `目前 "${customer.persona.industry || '该'}" 行业有哪些普遍的运营挑战、数字化转型痛点和 IT 趋势？`
        }
    ];

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {scenarios.map((agent) => (
                <button
                    key={agent.id}
                    onClick={() => onSelectScenario(agent.prompt, agent.id)}
                    disabled={loading}
                    className={`
                        relative text-left p-3 rounded-xl border transition-all duration-200 group flex flex-col justify-between min-h-[100px]
                        ${activeScenarioId === agent.id 
                            ? 'ring-2 ring-indigo-500 bg-indigo-50/20 border-indigo-500 shadow-sm' 
                            : 'hover:shadow-md bg-white border-slate-200 hover:border-indigo-300'
                        }
                    `}
                >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${agent.color} mb-2`}>
                        {loading && activeScenarioId === agent.id ? <Loader2 className="w-4 h-4 animate-spin"/> : <agent.icon className="w-4 h-4" />}
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-700 text-xs mb-0.5">{agent.title}</h3>
                        <div className={`flex items-center text-[10px] font-medium transition-colors ${activeScenarioId === agent.id ? 'text-indigo-600' : 'text-slate-400 group-hover:text-indigo-500'}`}>
                            {activeScenarioId === agent.id ? '已选中' : '点击选中'} <ArrowRight className="w-2.5 h-2.5 ml-1" />
                        </div>
                    </div>
                </button>
            ))}
        </div>
    );
};
