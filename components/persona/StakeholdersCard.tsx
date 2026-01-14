
import React, { useState } from 'react';
import { Users, Plus, Edit2, Network, List, UserPlus } from 'lucide-react';
import { Card, CardTitle, CardDescription } from '../ui/Card';
import { Button } from '../ui/Button';
import { EmptyState } from '../ui/EmptyState';
import { Stakeholder, Relationship } from '../../types';
import { StakeholderOrgChart } from './StakeholderOrgChart';
import { getStanceColor, getRoleColor, getRoleLabel } from '../../utils/formatters';
import { Avatar } from '../ui/Avatar';

interface Props {
    stakeholders: Stakeholder[];
    relationships?: Relationship[]; // New prop
    onAdd: () => void;
    onView: (s: Stakeholder) => void;
    onDataChange?: (updates: { decisionMakers?: Stakeholder[]; relationships?: Relationship[] }) => void;
}

export const StakeholdersCard: React.FC<Props> = ({ stakeholders, relationships = [], onAdd, onView, onDataChange }) => {
    const [viewMode, setViewMode] = useState<'LIST' | 'CHART'>('LIST');
    
    // --- Handlers for Org Chart ---
    const handleUpdateStakeholder = (updated: Stakeholder) => {
        if (!onDataChange) return;
        const newStakeholders = stakeholders.map(s => s.id === updated.id ? updated : s);
        onDataChange({ decisionMakers: newStakeholders });
    };

    const handleUpdateRelationships = (newRelationships: Relationship[]) => {
        if (!onDataChange) return;
        onDataChange({ relationships: newRelationships });
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
                {viewMode === 'LIST' ? '关键决策人、角色与支持度清单。' : '基于汇报关系(实线)与影响力(虚线)生成的权力地图。'}
            </CardDescription>

            <div className="mt-6 flex-1 overflow-auto">
                {viewMode === 'CHART' ? (
                     <StakeholderOrgChart 
                        stakeholders={stakeholders} 
                        relationships={relationships}
                        onView={onView} 
                        onUpdateStakeholder={handleUpdateStakeholder}
                        onUpdateRelationships={handleUpdateRelationships}
                     />
                ) : (
                    <div className="space-y-3">
                        {stakeholders && stakeholders.length > 0 ? (
                            stakeholders.map((dm) => (
                                <div
                                    key={dm.id}
                                    onClick={() => onView(dm)}
                                    className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-100 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer group"
                                >
                                    <Avatar name={dm.name} size="md" className="border-white shadow-sm shrink-0 bg-slate-100 text-slate-500" />
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
                            <div className="py-6 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                <EmptyState 
                                    icon={UserPlus}
                                    title="暂无决策人"
                                    description="添加关键决策人，构建权力地图。"
                                    action={<Button variant="secondary" size="sm" onClick={onAdd}>手动添加</Button>}
                                />
                            </div>
                        )}
                    </div>
                )}
            </div>
        </Card>
    );
};
