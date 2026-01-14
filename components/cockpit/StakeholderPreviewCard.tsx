
import React from 'react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Avatar } from '../ui/Avatar';
import { ViewState, Stakeholder } from '../../types';
import { getStanceColor, getRoleLabel } from '../../utils/formatters';

interface Props {
    stakeholders: Stakeholder[];
    onChangeView: (view: ViewState) => void;
    onSelect: (stakeholder: Stakeholder) => void;
}

export const StakeholderPreviewCard: React.FC<Props> = ({ stakeholders, onChangeView, onSelect }) => {
    
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
