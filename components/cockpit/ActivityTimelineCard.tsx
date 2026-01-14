
import React from 'react';
import { Phone, Mail, Users, ArrowRight } from 'lucide-react';
import { VisitRecord, ViewState } from '../../types';

interface Props {
    visits: VisitRecord[];
    onChangeView: (view: ViewState) => void;
}

export const ActivityTimelineCard: React.FC<Props> = ({ visits, onChangeView }) => {
    return (
        <div className="space-y-5 relative">
            {/* Timeline Line */}
            <div className="absolute left-3.5 top-2 bottom-2 w-px bg-indigo-100/50"></div>

            {visits.length > 0 ? visits.map((visit, idx) => (
                <div key={idx} className="relative flex gap-3 group">
                    {/* Icon Node */}
                    <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center shrink-0 z-10 shadow-sm transition-colors ${visit.sentiment === 'Risk' ? 'bg-red-50 border-red-100 text-red-500' : 'bg-white border-indigo-50 text-indigo-400 group-hover:border-indigo-200 group-hover:text-indigo-600'}`}>
                        {visit.type === 'Call' ? <Phone className="w-3 h-3"/> : visit.type === 'Email' ? <Mail className="w-3 h-3"/> : <Users className="w-3 h-3"/>}
                    </div>
                    
                    {/* Content */}
                    <div 
                        className="flex-1 bg-slate-50 rounded-xl p-3 border border-slate-100 hover:border-indigo-200 hover:bg-white hover:shadow-sm transition-all cursor-pointer" 
                        onClick={() => onChangeView(ViewState.VISIT_RECORDS)}
                    >
                        <div className="flex justify-between items-start mb-1.5">
                            <h4 className="font-bold text-slate-700 text-xs line-clamp-1">{visit.title || '未命名记录'}</h4>
                            <span className="text-[10px] text-slate-400 shrink-0 font-mono">{visit.date.slice(5)}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                            {visit.content || "暂无详细内容"}
                        </p>
                        {visit.nextSteps && (
                            <div className="mt-2 pt-2 border-t border-slate-100 flex items-center gap-1 text-[10px] text-indigo-600 font-medium">
                                <ArrowRight className="w-2.5 h-2.5" />
                                <span className="truncate">{visit.nextSteps}</span>
                            </div>
                        )}
                    </div>
                </div>
            )) : (
                <div className="text-center py-10 text-slate-400 text-xs">
                    暂无互动记录，点击上方快速行动添加。
                </div>
            )}
        </div>
    );
};
