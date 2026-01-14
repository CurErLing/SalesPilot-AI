
import React from 'react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Avatar } from '../ui/Avatar';
import { ViewState, Stakeholder } from '../../types';
import { getStanceColor, getRoleLabel, getStanceShortLabel } from '../../utils/formatters';

interface Props {
    stakeholders: Stakeholder[];
    onChangeView: (view: ViewState) => void;
    onSelect: (stakeholder: Stakeholder) => void;
}

export const StakeholderPreviewCard: React.FC<Props> = ({ stakeholders, onChangeView, onSelect }) => {
    
    return (
        <Card className="p-5 h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">决策链 (Power Map)</h3>
                <Button variant="ghost" size="sm" onClick={() => onChangeView(ViewState.PERSONA)} className="h-6 text-[10px] hover:text-indigo-600">管理</Button>
            </div>
            
            <div className="space-y-3 flex-1">
                {stakeholders && stakeholders.length > 0 ? (
                    stakeholders.slice(0, 6).map((dm, i) => {
                        const stanceStyle = getStanceColor(dm.stance);
                        const borderColor = stanceStyle.split(' ')[0].replace('border-', 'bg-');

                        return (
                            <div 
                              key={dm.id || i} 
                              onClick={() => onSelect(dm)}
                              className="group relative flex items-center gap-4 p-3 bg-white rounded-xl border border-slate-100 hover:border-indigo-200 hover:shadow-md transition-all cursor-pointer overflow-hidden"
                            >
                                {/* Stance Indicator Bar */}
                                <div className={`absolute left-0 top-0 bottom-0 w-1 ${borderColor}`}></div>

                                <Avatar name={dm.name} size="md" className="border-white shadow-sm shrink-0 bg-slate-50 text-slate-600" />
                                
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="text-sm font-bold text-slate-800 truncate">{dm.name}</div>
                                        <div className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${stanceStyle}`}>
                                            {getStanceShortLabel(dm.stance)}
                                        </div>
                                    </div>
                                    <div className="text-[11px] text-slate-500 truncate mt-0.5">
                                        {dm.title} <span className="mx-1 text-slate-200">|</span> {getRoleLabel(dm.role)}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="text-center py-10 flex flex-col items-center justify-center">
                        <p className="text-xs text-slate-400 mb-4">暂无决策人数据，请先补齐画像</p>
                        <Button variant="outline" size="sm" onClick={() => onChangeView(ViewState.PERSONA)}>添加决策人</Button>
                    </div>
                )}
            </div>

            {stakeholders.length > 6 && (
                <div className="mt-4 pt-3 border-t border-slate-50 text-center">
                    <button 
                        onClick={() => onChangeView(ViewState.PERSONA)}
                        className="text-[10px] font-bold text-slate-400 hover:text-indigo-600 transition-colors"
                    >
                        查看全部 {stakeholders.length} 位决策人
                    </button>
                </div>
            )}
        </Card>
    );
};
