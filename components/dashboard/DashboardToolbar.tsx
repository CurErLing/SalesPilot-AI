
import React from 'react';
import { Search, X } from 'lucide-react';

interface Props {
    searchQuery: string;
    setSearchQuery: (q: string) => void;
    statusFilter: string;
    setStatusFilter: (status: string) => void;
    sortBy: 'recent' | 'score' | 'budget';
    setSortBy: (sort: 'recent' | 'score' | 'budget') => void;
}

const STATUS_OPTIONS = ['ALL', '线索', '合格', '提案', '谈判', '赢单', '输单'];

export const DashboardToolbar: React.FC<Props> = ({ 
    searchQuery, setSearchQuery, 
    statusFilter, setStatusFilter, 
    sortBy, setSortBy 
}) => {
    return (
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm mb-8 space-y-4 lg:space-y-0 lg:flex lg:items-center lg:justify-between sticky top-0 z-10 shadow-md">
            {/* Search */}
            <div className="relative flex-1 max-w-lg">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                    type="text"
                    placeholder="搜索客户、项目、行业或拜访记录..."
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                    <button 
                        onClick={() => setSearchQuery('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                        <X className="w-3.5 h-3.5" />
                    </button>
                )}
            </div>

            {/* Filters & Sort */}
            <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1 overflow-x-auto pb-1 lg:pb-0 scrollbar-hide">
                    {STATUS_OPTIONS.map(status => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={`
                                px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap
                                ${statusFilter === status 
                                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' 
                                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                                }
                            `}
                        >
                            {status === 'ALL' ? '全部' : status}
                        </button>
                    ))}
                </div>

                <div className="h-6 w-px bg-slate-200 hidden lg:block"></div>

                <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-400 uppercase">排序</span>
                    <select 
                        className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                    >
                        <option value="recent">最近更新</option>
                        <option value="score">赢面评分 (高→低)</option>
                        <option value="budget">项目金额 (高→低)</option>
                    </select>
                </div>
            </div>
        </div>
    );
};
