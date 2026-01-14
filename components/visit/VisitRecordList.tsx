
import React, { useState, useMemo } from 'react';
import { VisitRecord, Customer } from '../../types';
import { Phone, Mail, MessageSquare, Briefcase, Calendar, Mic, Image as ImageIcon, Target, ArrowRight, Clock, Filter } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { EmptyState } from '../ui/EmptyState';
import { Avatar } from '../ui/Avatar';
import { Plus } from 'lucide-react';
import { getSentimentColor, getSentimentLabel } from '../../utils/formatters';
import { SearchInput } from '../ui/SearchInput';

interface Props {
    visits: VisitRecord[];
    onSelect: (record: VisitRecord) => void;
    onAdd: () => void;
    customer: Customer;
}

export const VisitRecordList: React.FC<Props> = ({ visits, onSelect, onAdd, customer }) => {
    // Filter State
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState<string>('ALL');
    const [sentimentFilter, setSentimentFilter] = useState<string>('ALL');

    // --- Filtering Logic ---
    const filteredVisits = useMemo(() => {
        return visits.filter(v => {
            // Search
            const q = searchQuery.toLowerCase();
            if (q) {
                const match = (v.title || '').toLowerCase().includes(q) || 
                              (v.content || '').toLowerCase().includes(q) ||
                              (v.transcript || '').toLowerCase().includes(q) ||
                              (v.visitGoal || '').toLowerCase().includes(q);
                if (!match) return false;
            }
            
            // Type Filter
            if (typeFilter !== 'ALL' && v.type !== typeFilter) return false;
            
            // Sentiment Filter
            if (sentimentFilter !== 'ALL' && v.sentiment !== sentimentFilter) return false;

            return true;
        });
    }, [visits, searchQuery, typeFilter, sentimentFilter]);

    const plannedVisits = filteredVisits.filter(v => v.status === 'Planned');
    const completedVisits = filteredVisits.filter(v => v.status !== 'Planned');

    const getIcon = (type: string) => {
        switch (type) {
            case 'Call': return Phone;
            case 'Email': return Mail;
            case 'Meeting': return Briefcase;
            default: return MessageSquare;
        }
    };

    return (
        <div className="h-full flex flex-col p-1 gap-6 relative animate-in fade-in duration-300">
            
            {/* Header Action Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h2 className="text-xl font-bold text-slate-800">互动时间轴</h2>
                    <p className="text-sm text-slate-500">管理未来的作战计划，复盘历史的沟通轨迹。</p>
                </div>
                <Button onClick={onAdd} icon={Plus} className="shadow-lg shadow-indigo-200">
                    策划新拜访
                </Button>
            </div>

            {/* Filter Toolbar */}
            <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3">
                <SearchInput 
                    containerClassName="flex-1"
                    placeholder="搜索纪要、逐字稿或计划..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onClear={() => setSearchQuery('')}
                />
                
                <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-hide">
                     <select 
                        className="bg-slate-50 border border-slate-200 text-slate-600 text-xs font-bold rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                    >
                        <option value="ALL">所有类型</option>
                        <option value="Meeting">实地拜访</option>
                        <option value="Call">电话</option>
                        <option value="Email">邮件</option>
                    </select>

                    <select 
                        className="bg-slate-50 border border-slate-200 text-slate-600 text-xs font-bold rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                        value={sentimentFilter}
                        onChange={(e) => setSentimentFilter(e.target.value)}
                    >
                        <option value="ALL">所有状态</option>
                        <option value="Positive">推进顺利</option>
                        <option value="Negative">客户消极</option>
                        <option value="Risk">存在风险</option>
                        <option value="Neutral">一般</option>
                    </select>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-10 pb-10 pr-2">
                
                {/* 1. UPCOMING MISSIONS (Planned) */}
                {plannedVisits.length > 0 && (
                    <section>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="p-1 bg-indigo-100 rounded text-indigo-600">
                                <Target className="w-4 h-4" />
                            </div>
                            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide">待执行任务 ({plannedVisits.length})</h3>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {plannedVisits.map(visit => (
                                <div 
                                    key={visit.id} 
                                    onClick={() => onSelect(visit)}
                                    className="group bg-white rounded-xl border border-indigo-100 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer relative overflow-hidden flex flex-col"
                                >
                                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-indigo-500 group-hover:bg-indigo-600 transition-colors"></div>
                                    
                                    <div className="p-5 flex flex-col h-full">
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
                                                <Calendar className="w-3.5 h-3.5" />
                                                {visit.date}
                                            </div>
                                            <Badge variant="neutral">计划中</Badge>
                                        </div>

                                        <h4 className="font-bold text-slate-800 text-lg mb-2 group-hover:text-indigo-600 transition-colors">
                                            {visit.title || '未命名拜访'}
                                        </h4>
                                        
                                        <div className="mb-4 flex-1">
                                            {visit.visitGoal ? (
                                                <p className="text-sm text-slate-600 line-clamp-2">
                                                    <span className="font-semibold text-slate-400 mr-1">目标:</span>
                                                    {visit.visitGoal}
                                                </p>
                                            ) : (
                                                <p className="text-sm text-slate-400 italic">尚未设定拜访目标...</p>
                                            )}
                                        </div>

                                        <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-50">
                                            <div className="flex -space-x-2">
                                                {visit.stakeholderIds?.slice(0, 4).map(id => {
                                                     const person = customer.persona.decisionMakers.find(dm => dm.id === id);
                                                     if (!person) return null;
                                                     return (
                                                        <Avatar key={id} name={person.name} size="xs" className="border-slate-200 w-7 h-7 text-[10px]" />
                                                     );
                                                })}
                                                {(!visit.stakeholderIds || visit.stakeholderIds.length === 0) && (
                                                    <span className="text-[10px] text-slate-400">未指定人选</span>
                                                )}
                                            </div>
                                            <div className="text-xs font-bold text-indigo-500 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                                                准备执行 <ArrowRight className="w-3.5 h-3.5" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* 2. INTERACTION TIMELINE (Completed) */}
                <section>
                     <div className="flex items-center gap-2 mb-6">
                            <div className="p-1 bg-slate-100 rounded text-slate-500">
                                <Clock className="w-4 h-4" />
                            </div>
                            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide">历史足迹 ({completedVisits.length})</h3>
                    </div>

                    {completedVisits.length === 0 ? (
                        <div className="bg-white rounded-xl border border-dashed border-slate-200 p-8">
                            <EmptyState 
                                icon={Filter}
                                title="未找到匹配的互动记录"
                                description="请尝试调整筛选条件，或者创建一个新的拜访记录。"
                            />
                        </div>
                    ) : (
                        <div className="relative pl-4 space-y-8">
                            <div className="absolute left-[27px] top-2 bottom-4 w-0.5 bg-slate-200"></div>

                            {completedVisits.map((visit) => {
                                const Icon = getIcon(visit.type);
                                
                                return (
                                    <div key={visit.id} onClick={() => onSelect(visit)} className="relative pl-20 group cursor-pointer">
                                        
                                        <div className={`absolute left-0 top-0 w-14 h-14 rounded-full border-4 border-slate-50 bg-white shadow-sm flex items-center justify-center z-10 transition-colors group-hover:border-indigo-100`}>
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${visit.type === 'Meeting' ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-500'} group-hover:bg-indigo-600 group-hover:text-white transition-colors`}>
                                                <Icon className="w-5 h-5" />
                                            </div>
                                        </div>

                                        <div className="mb-1 pl-1">
                                            <span className="text-xs font-bold text-slate-400">{visit.date}</span>
                                        </div>

                                        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all">
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="font-bold text-slate-800 text-base group-hover:text-indigo-600 transition-colors">{visit.title}</h3>
                                                <div className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getSentimentColor(visit.sentiment)}`}>
                                                    {getSentimentLabel(visit.sentiment)}
                                                </div>
                                            </div>

                                            <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed mb-4">
                                                {visit.content || <span className="italic text-slate-400">暂无详细纪要...</span>}
                                            </p>

                                            <div className="flex items-center justify-between border-t border-slate-50 pt-3">
                                                <div className="flex items-center gap-2">
                                                    {visit.stakeholderIds?.slice(0, 3).map(id => {
                                                        const person = customer.persona.decisionMakers.find(dm => dm.id === id);
                                                        return person ? (
                                                            <div key={id} className="text-xs text-slate-500 font-medium bg-slate-50 px-2 py-1 rounded">
                                                                {person.name}
                                                            </div>
                                                        ) : null;
                                                    })}
                                                </div>
                                                <div className="flex gap-3 text-slate-400">
                                                     {visit.transcript && (
                                                         <div className="flex items-center gap-1 text-[10px]" title="含 AI 逐字稿">
                                                             <Mic className="w-3.5 h-3.5" />
                                                             <span>逐字稿</span>
                                                         </div>
                                                     )}
                                                     {visit.images && visit.images.length > 0 && (
                                                         <div className="flex items-center gap-1 text-[10px]">
                                                             <ImageIcon className="w-3.5 h-3.5" />
                                                             <span>附件</span>
                                                         </div>
                                                     )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
};
