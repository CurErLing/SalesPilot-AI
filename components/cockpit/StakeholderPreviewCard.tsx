
import React from 'react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Avatar } from '../ui/Avatar';
import { ViewState, Stakeholder } from '../../types';

interface Props {
    stakeholders: Stakeholder[];
    onChangeView: (view: ViewState) => void;
    onSelect: (stakeholder: Stakeholder) => void;
}

export const StakeholderPreviewCard: React.FC<Props> = ({ stakeholders, onChangeView, onSelect }) => {
    
    const getStanceColor = (stance: string) => {
        switch(stance) {
            case 'Champion': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'Positive': return 'bg-green-50 text-green-600 border-green-200';
            case 'Negative': return 'bg-red-50 text-red-600 border-red-200';
            case 'Blocker': return 'bg-red-100 text-red-700 border-red-300';
            default: return 'bg-slate-50 text-slate-500 border-slate-200';
        }
    };

    const getRoleLabel = (role: string) => {
        switch (role) {
            case 'Economic Buyer': return '经济决策人';
            case 'Technical Buyer': return '技术把关人';
            case 'User Buyer': return '最终用户';
            case 'Coach': return '内线教练';
            case 'Gatekeeper': return '把关人';
            case 'Influencer': return '影响者';
            case 'Unknown': return '未知';
            default: return role;
        }
    };

    return (
        <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">决策链</h3>
                <Button variant="ghost" size="sm" onClick={() => onChangeView(ViewState.PERSONA)} className="h-6 text-[10px]">管理</Button>
            </div>
            
            <div className="space-y-3">
                {stakeholders && stakeholders.length > 0 ? (
                    stakeholders.slice(0, 5).map((dm, i) => (
                        <div 
                          key={i} 
                          onClick={() => onSelect(dm)}
                          className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer group"
                        >
                            <Avatar name={dm.name} size="sm" className="border-white shadow-sm" />
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <div className="text-sm font-bold text-slate-700 truncate">{dm.name}</div>
                                  {dm.stance && (
                                      <span className={`w-2 h-2 rounded-full ${getStanceColor(dm.stance).split(' ')[0]}`} title={dm.stance}></span>
                                  )}
                                </div>
                                <div className="text-[10px] text-slate-400 truncate">
                                  {dm.title} • {getRoleLabel(dm.role)}
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-4">
                        <p className="text-xs text-slate-400 mb-2">暂无决策人信息</p>
                        <Button variant="outline" size="sm" onClick={() => onChangeView(ViewState.PERSONA)}>添加</Button>
                    </div>
                )}
            </div>
        </Card>
    );
};
