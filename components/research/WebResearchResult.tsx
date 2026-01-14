
import React from 'react';
import ReactMarkdown from 'react-markdown';
import { ExternalLink, Sparkles, Plus, Globe, Layout, Copy, Check, FileText } from 'lucide-react';
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
            <div className="h-full bg-white rounded-2xl border border-slate-200 p-8 flex flex-col items-center justify-center shadow-sm">
                <LoadingState 
                    icon={Globe}
                    title="AI 情报员正在全网侦察..."
                    subtitle="正在交叉验证新闻源、财报数据与行业分析..."
                />
            </div>
        );
    }

    if (result) {
        return (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 flex flex-col h-full relative group">
                 {/* Header Bar */}
                 <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white flex items-center justify-between shrink-0 sticky top-0 z-10">
                     <div className="flex items-center gap-2">
                         <div className="bg-indigo-100 text-indigo-600 p-1.5 rounded-lg">
                            <Sparkles className="w-4 h-4" />
                         </div>
                         <div>
                             <h3 className="font-bold text-slate-800 text-sm">情报分析报告</h3>
                             <p className="text-[10px] text-slate-400">AI Generated • {new Date().toLocaleDateString()}</p>
                         </div>
                     </div>
                     <Button onClick={onSave} variant="primary" size="sm" icon={Plus} className="shadow-none">
                         存入金库
                     </Button>
                 </div>

                 <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                     {/* Content Container */}
                     <div className="max-w-3xl mx-auto space-y-8">
                         
                         {/* Main AI Analysis */}
                         <div className="prose prose-sm prose-indigo max-w-none text-slate-700 leading-7">
                             <div className="flex items-center gap-2 mb-4 text-xs font-bold text-indigo-500 uppercase tracking-wider border-b border-indigo-50 pb-2">
                                 <FileText className="w-4 h-4" /> 核心洞察 (Executive Summary)
                             </div>
                             <ReactMarkdown>{result.text}</ReactMarkdown>
                         </div>
                         
                         {/* Sources Section */}
                         {result.sources.length > 0 && (
                           <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
                               <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                                   <Globe className="w-3.5 h-3.5" /> 信息来源验证
                               </h4>
                               <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                   {result.sources.map((source, idx) => (
                                       <a 
                                           key={idx} 
                                           href={source.uri} 
                                           target="_blank" 
                                           rel="noreferrer"
                                           className="flex items-center gap-2 p-2 rounded-lg bg-white border border-slate-200 hover:border-indigo-300 hover:shadow-sm transition-all text-xs text-slate-600 group/link"
                                       >
                                           <div className="bg-slate-100 p-1.5 rounded text-slate-400 group-hover/link:text-indigo-500 group-hover/link:bg-indigo-50 transition-colors">
                                                <ExternalLink className="w-3 h-3 shrink-0" />
                                           </div>
                                           <span className="truncate flex-1 font-medium">{source.title || '网页链接'}</span>
                                       </a>
                                   ))}
                               </div>
                           </div>
                         )}
                     </div>
                 </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col items-center justify-center text-slate-400/60 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/30 p-10 text-center">
            <div className="w-20 h-20 bg-white rounded-full shadow-sm flex items-center justify-center mb-6">
                <Layout className="w-8 h-8 text-indigo-200 stroke-1" />
            </div>
            <h3 className="text-lg font-bold text-slate-600 mb-2">情报控制台就绪</h3>
            <p className="max-w-sm text-sm leading-relaxed">
                请在上方选择一项 <span className="font-bold text-indigo-500">“侦察任务”</span>，或在下方直接下达搜索指令。<br/>
                AI 将为您生成结构化的分析简报。
            </p>
        </div>
    );
};
