import React from 'react';
import { ResearchNote } from '../../types';
import { BookOpen, Badge as BadgeIcon, Trash2, ExternalLink, MessageCircle } from 'lucide-react'; // Renamed Badge import to avoid conflict
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
        <div className="w-full lg:w-96 border-l border-slate-200 bg-white flex flex-col h-full shadow-lg z-10">
            <div className="p-4 border-b border-slate-100 bg-slate-50/30 shrink-0 flex items-center justify-between">
                 <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm">
                    <BookOpen className="w-4 h-4 text-indigo-500" />
                    情报金库
                    <Badge variant="neutral">{notes?.length || 0}</Badge>
                </h3>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar bg-slate-50/30">
                {(!notes || notes.length === 0) ? (
                    <div className="text-center py-10 text-slate-400">
                        <p className="text-xs">暂无收藏的情报</p>
                    </div>
                ) : (
                    notes.map((note) => (
                        <Card 
                             key={note.id} 
                             className="p-3 hoverable group relative flex flex-col gap-2 cursor-pointer border-slate-200 hover:border-indigo-300 transition-all bg-white"
                             onClick={() => onView(note)}
                        >
                            <div className="flex justify-between items-start">
                                <h4 className="font-bold text-slate-700 text-xs line-clamp-2 leading-snug pr-6">{note.title}</h4>
                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDelete(note.id);
                                    }}
                                    className="text-slate-300 hover:text-red-500 p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            </div>
                            
                            <p className="text-[10px] text-slate-500 leading-relaxed line-clamp-3">
                                {note.content}
                            </p>
                            
                            <div className="flex items-center justify-between mt-1 pt-2 border-t border-slate-50">
                                <span className="text-[10px] text-slate-400">
                                    {new Date(note.timestamp).toLocaleDateString()}
                                </span>
                                <div className="flex gap-1">
                                   {note.iceBreaker && (
                                      <span title="已生成话术">
                                         <MessageCircle className="w-3.5 h-3.5 text-emerald-500" />
                                      </span>
                                   )}
                                   {note.url && (
                                      <ExternalLink className="w-3.5 h-3.5 text-indigo-400" />
                                   )}
                                </div>
                            </div>

                            {/* Quick Actions overlay on hover */}
                            <div className="absolute bottom-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 pl-2">
                                 <Button 
                                     size="sm" 
                                     variant="ghost" 
                                     className="h-6 px-2 text-[10px] bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
                                     onClick={(e) => onGenerateIceBreaker(note, e)}
                                     disabled={processingNoteId !== null}
                                 >
                                     话术
                                 </Button>
                            </div>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
};
