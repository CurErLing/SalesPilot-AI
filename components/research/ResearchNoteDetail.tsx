
import React from 'react';
import { ResearchNote } from '../../types';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { BookOpen, ExternalLink, FileText, UserPlus, MessageCircle, Sparkles, Copy } from 'lucide-react';

interface Props {
    note: ResearchNote | null;
    onClose: () => void;
    onExtractPersona: (note: ResearchNote) => void;
    onGenerateIceBreaker: (note: ResearchNote) => void;
    processingNoteId: string | null;
    setActionSuccessMsg: (msg: string | null) => void;
}

export const ResearchNoteDetail: React.FC<Props> = ({
    note,
    onClose,
    onExtractPersona,
    onGenerateIceBreaker,
    processingNoteId,
    setActionSuccessMsg
}) => {
    if (!note) return null;

    const handleCopyIceBreaker = () => {
        navigator.clipboard.writeText(note.iceBreaker || "");
        setActionSuccessMsg("话术已复制");
        setTimeout(() => setActionSuccessMsg(null), 2000);
    };

    return (
        <Modal
          isOpen={!!note}
          onClose={onClose}
          title={note.title || "情报详情"}
          description="情报全文及 AI 衍生的销售行动建议。"
          footer={
              <Button onClick={onClose}>关闭</Button>
          }
       >
           <div className="space-y-6">
               {/* Meta Header */}
               <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pb-4 border-b border-slate-100">
                   <span className="flex items-center gap-1"><BookOpen className="w-3.5 h-3.5" /> {new Date(note.timestamp).toLocaleString()}</span>
                   {note.url && (
                       <a href={note.url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-indigo-600 hover:underline">
                           <ExternalLink className="w-3.5 h-3.5" /> 访问原始来源
                       </a>
                   )}
               </div>

               {/* Main Content */}
               <div>
                   <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-2 flex items-center gap-2">
                       <FileText className="w-4 h-4 text-slate-400" /> 情报内容
                   </h4>
                   <div className="bg-white p-4 rounded-xl border border-slate-200 text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                       {note.content}
                   </div>
               </div>

                {/* Actions Row */}
                <div className="flex gap-2">
                    <Button 
                        variant="secondary"
                        size="sm" 
                        icon={UserPlus}
                        className="text-xs"
                        onClick={() => onExtractPersona(note)}
                        isLoading={processingNoteId === note.id}
                    >
                        提取至客户画像
                    </Button>
                </div>

               {/* Ice Breaker Section */}
               <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl p-5 border border-indigo-100 relative overflow-hidden">
                   <div className="flex items-center justify-between mb-3">
                       <h4 className="text-sm font-bold text-indigo-800 uppercase tracking-wide flex items-center gap-2">
                           <MessageCircle className="w-4 h-4" /> 销售破冰话术
                       </h4>
                       {!note.iceBreaker && (
                           <Button 
                                size="sm" 
                                icon={Sparkles} 
                                onClick={() => onGenerateIceBreaker(note)}
                                isLoading={processingNoteId === note.id}
                           >
                               立即生成
                           </Button>
                       )}
                   </div>
                   
                   {note.iceBreaker ? (
                       <div className="bg-white/80 p-4 rounded-lg border border-indigo-100 text-indigo-900 text-sm leading-relaxed relative shadow-sm">
                           {note.iceBreaker}
                           <button 
                              onClick={handleCopyIceBreaker}
                              className="absolute top-2 right-2 p-1.5 text-indigo-300 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                              title="复制话术"
                           >
                               <Copy className="w-4 h-4" />
                           </button>
                           <div className="mt-2 flex justify-end">
                                <button 
                                    onClick={() => onGenerateIceBreaker(note)}
                                    className="text-[10px] text-indigo-400 hover:text-indigo-600 flex items-center gap-1"
                                    disabled={processingNoteId === note.id}
                                >
                                    <Sparkles className="w-3 h-3" /> {processingNoteId === note.id ? '重新生成中...' : '不满意？重新生成'}
                                </button>
                           </div>
                       </div>
                   ) : (
                       <p className="text-xs text-indigo-600/70 italic">
                           点击上方按钮，AI 将根据此情报自动撰写一段用于微信或邮件的开场白，帮助你与客户建立联系。
                       </p>
                   )}
               </div>
           </div>
       </Modal>
    );
};
