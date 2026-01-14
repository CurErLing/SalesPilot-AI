
import React from 'react';
import { Phone, TrendingUp, Mail, Activity } from 'lucide-react';
import { Card } from '../ui/Card';
import { ViewState } from '../../types';

interface Props {
    onChangeView: (view: ViewState) => void;
}

export const QuickActionsCard: React.FC<Props> = ({ onChangeView }) => {
    return (
        <Card className="p-5">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">快速行动</h3>
            <div className="grid grid-cols-2 gap-3">
                <button onClick={() => onChangeView(ViewState.VISIT_RECORDS)} className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 transition-all group">
                    <Phone className="w-5 h-5 text-slate-500 group-hover:text-indigo-600 mb-1" />
                    <span className="text-xs font-medium text-slate-600 group-hover:text-indigo-700">记拜访</span>
                </button>
                <button onClick={() => onChangeView(ViewState.WEB_RESEARCH)} className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 transition-all group">
                    <TrendingUp className="w-5 h-5 text-slate-500 group-hover:text-indigo-600 mb-1" />
                    <span className="text-xs font-medium text-slate-600 group-hover:text-indigo-700">查情报</span>
                </button>
                <button onClick={() => onChangeView(ViewState.STRATEGY)} className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 transition-all group">
                    <Mail className="w-5 h-5 text-slate-500 group-hover:text-indigo-600 mb-1" />
                    <span className="text-xs font-medium text-slate-600 group-hover:text-indigo-700">写邮件</span>
                </button>
                 <button onClick={() => onChangeView(ViewState.ASSESSMENT)} className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 transition-all group">
                    <Activity className="w-5 h-5 text-slate-500 group-hover:text-indigo-600 mb-1" />
                    <span className="text-xs font-medium text-slate-600 group-hover:text-indigo-700">做评估</span>
                </button>
            </div>
        </Card>
    );
};
