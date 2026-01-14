
import React from 'react';
import { Calendar, Phone, Mail, Users } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { VisitRecord, ViewState } from '../../types';

interface Props {
    visits: VisitRecord[];
    onChangeView: (view: ViewState) => void;
}

export const ActivityTimelineCard: React.FC<Props> = ({ visits, onChangeView }) => {
    return (
        <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-indigo-500" />
                    近期动态
                </h3>
                <Button variant="ghost" size="sm" onClick={() => onChangeView(ViewState.VISIT_RECORDS)}>查看全部</Button>
            </div>

            <div className="space-y-6 relative">
                {/* Timeline Line - Centered relative to the w-8 (32px) circles. Center is 16px (left-4). */}
                <div className="absolute left-4 top-2 bottom-2 w-px bg-slate-100"></div>

                {visits.length > 0 ? visits.map((visit, idx) => (
                    <div key={idx} className="relative flex gap-4">
                        <div className="w-8 h-8 rounded-full bg-white border-2 border-slate-100 flex items-center justify-center shrink-0 z-10 text-slate-400">
                            {visit.type === 'Call' ? <Phone className="w-3.5 h-3.5"/> : visit.type === 'Email' ? <Mail className="w-3.5 h-3.5"/> : <Users className="w-3.5 h-3.5"/>}
                        </div>
                        <div className="flex-1 bg-slate-50/50 rounded-xl p-4 border border-slate-100 hover:border-indigo-200 transition-colors cursor-pointer" onClick={() => onChangeView(ViewState.VISIT_RECORDS)}>
                            <div className="flex justify-between items-start mb-1">
                                <h4 className="font-bold text-slate-700 text-sm">{visit.title}</h4>
                                <span className="text-xs text-slate-400">{visit.date}</span>
                            </div>
                            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{visit.content}</p>
                        </div>
                    </div>
                )) : (
                    <div className="text-center py-6 text-slate-400 text-sm">暂无互动记录</div>
                )}
            </div>
        </Card>
    );
};
