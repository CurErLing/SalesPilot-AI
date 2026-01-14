
import React from 'react';
import { ResearchNote } from '../../types';
import { BookOpen, Trash2, ExternalLink, MessageCircle, Archive } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

interface Props {
    notes: ResearchNote[];
    onView: (note: ResearchNote) => void;
    onDelete: (id: string) => void;
    onGenerateIceBreaker: (note: ResearchNote, e: React.MouseEvent) => void;
    processingNoteId: string | null;
}

export const ResearchNoteList: React.FC<Props> = ({ 
    notes, 
    onView, 
    onDelete, 
    onGenerateIceBreaker,
    processingNoteId
}) => {
    return (
        <div className="w-full lg:w-80 bg-slate-50/50 flex flex-col h-full rounded-2xl border border-slate-200/60 overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-200 bg-white/50 shrink-0 flex items-center justify-between backdrop-blur-sm">
                 <h3 className="font-bold text-slate-700 flex items-center gap-2 text-sm">
                    <Archive className="w-4 h-4 text-indigo-500" />
                    情报金库
                </h3>
                <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                    {notes?.length || 0} 条
                </span>
            </div>
            
            <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
                {(!notes || notes.length === 0) ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-3 opacity-60">
                        <Archive className="w-8 h-8 stroke-1" />
                        <p className="text-xs text-center max-w-[150px]">暂无情报。点击“存入金库”保存关键信息。</p>
                    </div>
                ) : (
                    notes.map((note) => (
                        <div 
                             key={note.id} 
                             onClick={() => onView(note)}
                             className="group relative bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer flex flex-col gap-2"
                        >
                            <div className="flex justify-between items-start gap-2">
                                <h4 className="font-bold text-slate-700 text-xs line-clamp-2 leading-snug group-hover:text-indigo-700 transition-colors">
                                    {note.title}
                                </h4>
                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDelete(note.id);
                                    }}
                                    className="text-slate-300 hover:text-red-500 p-1 rounded-md hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all shrink-0"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            </div>
                            
                            <p className="text-[10px] text-slate-500 leading-relaxed line-clamp-3 opacity-80">
                                {note.content}
                            </p>
                            
                            <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-50">
                                <span className="text-[9px] text-slate-400 font-medium">
                                    {new Date(note.timestamp).toLocaleDateString()}
                                </span>
                                <div className="flex gap-2">
                                   {note.iceBreaker && (
                                      <span title="已生成话术" className="text-emerald-500 bg-emerald-50 p-0.5 rounded">
                                         <MessageCircle className="w-3 h-3" />
                                      </span>
                                   )}
                                   {note.url && (
                                      <span className="text-indigo-400">
                                         <ExternalLink className="w-3 h-3" />
                                      </span>
                                   )}
                                </div>
                            </div>

                            {/* Quick Actions overlay on hover */}
                            {!note.iceBreaker && (
                                <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                                     <Button 
                                         size="sm" 
                                         variant="secondary" 
                                         className="h-6 px-2 text-[10px] bg-white shadow-sm border-indigo-100 text-indigo-600 hover:bg-indigo-50"
                                         onClick={(e) => onGenerateIceBreaker(note, e)}
                                         disabled={processingNoteId !== null}
                                     >
                                         生成话术
                                     </Button>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
