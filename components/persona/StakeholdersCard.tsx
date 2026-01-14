
import React, { useState } from 'react';
import { Users, Plus, Edit2, Network, List } from 'lucide-react';
import { Card, CardTitle, CardDescription } from '../ui/Card';
import { Button } from '../ui/Button';
import { Stakeholder } from '../../types';
import { StakeholderOrgChart } from './StakeholderOrgChart';

interface Props {
    stakeholders: Stakeholder[];
    onAdd: () => void;
    onView: (s: Stakeholder) => void;
}

export const StakeholdersCard: React.FC<Props> = ({ stakeholders, onAdd, onView }) => {
    const [viewMode, setViewMode] = useState<'LIST' | 'CHART'>('LIST');
    
    const getStanceColor = (stance: string) => {
        switch (stance) {
            case 'Champion': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'Positive': return 'bg-green-50 text-green-600 border-green-200';
            case 'Negative': return 'bg-red-50 text-red-600 border-red-200';
            case 'Blocker': return 'bg-red-100 text-red-700 border-red-300';
            default: return 'bg-slate-100 text-slate-600 border-slate-200';
        }
    };

    const getRoleColor = (role: string) => {
        switch (role) {
            case 'Economic Buyer': return 'bg-purple-100 text-purple-700 border-purple-200';
            case 'Technical Buyer': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'Coach': return 'bg-amber-100 text-amber-700 border-amber-200';
            default: return 'bg-slate-50 text-slate-500 border-slate-200';
        }
    };

    const getRoleLabel = (role: string) => {
        switch (role) {
            case 'Economic Buyer': return '经济决策人 (EB)';
            case 'Technical Buyer': return '技术把关人 (TB)';
            case 'User Buyer': return '最终用户 (UB)';
            case 'Coach': return '内线教练 (Coach)';
            case 'Gatekeeper': return '把关人 (Gatekeeper)';
            case 'Influencer': return '影响者 (Influencer)';
            case 'Unknown': return '角色未知';
            default: return role;
        }
    };

    return (
        <Card className="p-6 h-full flex flex-col">
            <div className="flex items-center justify-between mb-2">
                <CardTitle icon={Users}><span className="text-base">决策链图谱</span></CardTitle>
                <div className="flex gap-2">
                    <div className="flex bg-slate-100 rounded-lg p-0.5 border border-slate-200">
                        <button 
                            onClick={() => setViewMode('LIST')}
                            className={`p-1.5 rounded-md transition-all ${viewMode === 'LIST' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                            title="列表视图"
                        >
                            <List className="w-4 h-4" />
                        </button>
                        <button 
                            onClick={() => setViewMode('CHART')}
                            className={`p-1.5 rounded-md transition-all ${viewMode === 'CHART' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                            title="架构图视图"
                        >
                            <Network className="w-4 h-4" />
                        </button>
                    </div>
                    <Button size="sm" variant="secondary" icon={Plus} onClick={onAdd}>添加</Button>
                </div>
            </div>
            <CardDescription>
                {viewMode === 'LIST' ? '关键决策人、角色与支持度清单。' : '基于汇报关系生成的权力地图 (Power Map)。'}
            </CardDescription>

            <div className="mt-6 flex-1 overflow-auto">
                {viewMode === 'CHART' ? (
                     <StakeholderOrgChart stakeholders={stakeholders} onView={onView} />
                ) : (
                    <div className="space-y-3">
                        {stakeholders && stakeholders.length > 0 ? (
                            stakeholders.map((dm) => (
                                <div
                                    key={dm.id}
                                    onClick={() => onView(dm)}
                                    className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-100 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer group"
                                >
                                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-sm text-slate-500 border border-white shadow-sm shrink-0">
                                        {dm.name.charAt(0)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <span className="text-sm font-bold text-slate-800 truncate">{dm.name}</span>
                                            <span className={`text-[10px] px-1.5 py-0.5 rounded border ${getRoleColor(dm.role)} truncate`}>
                                                {getRoleLabel(dm.role)}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-slate-500">
                                            <span className="truncate max-w-[120px]">{dm.title || '职位未知'}</span>
                                            {dm.reportsTo && (
                                                <span className="text-[10px] text-slate-400 flex items-center gap-0.5 bg-slate-50 px-1 rounded">
                                                    <Network className="w-2.5 h-2.5" /> 汇报给: {stakeholders.find(s => s.id === dm.reportsTo)?.name || '未知'}
                                                </span>
                                            )}
                                            {dm.stance && (
                                                <span className={`w-2 h-2 rounded-full ${getStanceColor(dm.stance).split(' ')[0]}`} title={`立场: ${dm.stance}`}></span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Edit2 className="w-4 h-4 text-slate-400" />
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-6 text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                <p className="text-xs mb-2">暂无决策人信息</p>
                                <Button variant="secondary" size="sm" onClick={onAdd}>手动添加</Button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </Card>
    );
};
