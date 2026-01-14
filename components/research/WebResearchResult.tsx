
import React from 'react';
import ReactMarkdown from 'react-markdown';
import { ExternalLink, Sparkles, Plus, Globe, Layout } from 'lucide-react';
import { Button } from '../ui/Button';
import { LoadingState } from '../ui/LoadingState';

interface ResearchResultData {
    text: string;
    sources: { title: string; uri: string }[];
}

interface Props {
    loading: boolean;
    result: ResearchResultData | null;
    onSave: () => void;
}

export const WebResearchResult: React.FC<Props> = ({ loading, result, onSave }) => {
    
    if (loading) {
        return (
            <LoadingState 
                icon={Globe}
                title="AI 正在全网检索..."
                subtitle="正在阅读相关网页、财报及新闻资讯"
            />
        );
    }

    if (result) {
        return (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 flex flex-col h-full">
                 <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between shrink-0">
                     <div className="flex items-center gap-2">
                         <Sparkles className="w-4 h-4 text-indigo-500" />
                         <h3 className="font-bold text-slate-800 text-sm">调研洞察</h3>
                     </div>
                     <Button onClick={onSave} variant="secondary" size="sm" icon={Plus}>
                         存入金库
                     </Button>
                 </div>

                 <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                     <div className="prose prose-sm prose-indigo max-w-none text-slate-700 leading-relaxed">
                         <ReactMarkdown>{result.text}</ReactMarkdown>
                     </div>
                     
                     {result.sources.length > 0 && (
                       <div className="mt-8 pt-6 border-t border-slate-100">
                           <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">参考来源</h4>
                           <div className="flex flex-wrap gap-2">
                               {result.sources.map((source, idx) => (
                                   <a 
                                       key={idx} 
                                       href={source.uri} 
                                       target="_blank" 
                                       rel="noreferrer"
                                       className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 hover:border-indigo-300 hover:text-indigo-600 transition-all text-xs text-slate-500 truncate max-w-[200px]"
                                   >
                                       <ExternalLink className="w-3 h-3 shrink-0" />
                                       <span className="truncate">{source.title || '网页链接'}</span>
                                   </a>
                               ))}
                           </div>
                       </div>
                     )}
                 </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col items-center justify-center text-slate-400/50 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50 p-10 text-center">
            <Layout className="w-16 h-16 mb-4 stroke-1" />
            <h3 className="text-lg font-medium text-slate-600 mb-1">准备就绪</h3>
            <p className="max-w-md">选择上方的探测器场景，或直接输入问题，开始对客户进行深度背景调查。</p>
        </div>
    );
};
