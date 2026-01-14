
import React, { useState, useMemo, useEffect } from 'react';
import { Badge } from '../ui/Badge';
import { UserCircle, Clock, Edit2, Check, X } from 'lucide-react';
import { Stakeholder } from '../../types';
import { Avatar } from '../ui/Avatar';
import { parseTranscript, stringifyTranscript, ParsedSegment } from '../../utils/transcriptHelper';

interface Props {
    transcript: string;
    speakerMapping: Record<string, string>;
    stakeholders: Stakeholder[];
    onMapSpeaker: (speakerKey: string, name: string) => void;
    onUpdateTranscript?: (newTranscript: string) => void;
}

export const TranscriptViewer: React.FC<Props> = ({ 
    transcript, 
    speakerMapping, 
    stakeholders, 
    onMapSpeaker,
    onUpdateTranscript
}) => {
    const [mappingMenuOpenIndex, setMappingMenuOpenIndex] = useState<number | null>(null);
    const [editingIdx, setEditingIdx] = useState<number | null>(null);
    const [editValue, setEditValue] = useState("");

    // --- Transcript Parsing Logic using Helper ---
    const parsedSegments = useMemo(() => {
        return parseTranscript(transcript);
    }, [transcript]);

    const handleSelectSpeaker = (originalSpeaker: string, name: string) => {
        onMapSpeaker(originalSpeaker, name);
        setMappingMenuOpenIndex(null);
    };

    const startEditing = (idx: number, text: string) => {
        setEditingIdx(idx);
        setEditValue(text);
    };

    const cancelEditing = () => {
        setEditingIdx(null);
        setEditValue("");
    };

    const saveEdit = (idx: number) => {
        if (!onUpdateTranscript) return;
        
        const updatedSegments = [...parsedSegments];
        updatedSegments[idx] = { ...updatedSegments[idx], text: editValue };
        
        const newTranscript = stringifyTranscript(updatedSegments);
        onUpdateTranscript(newTranscript);
        setEditingIdx(null);
        setEditValue("");
    };

    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm animate-in fade-in overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/50">
                <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-slate-700">智能剧本</h4>
                    <Badge variant="neutral" className="text-[10px]">AI Generated</Badge>
                </div>
                <div className="text-xs text-slate-400 flex items-center gap-1">
                    <UserCircle className="w-3 h-3" /> 点击发言人认领角色 • 悬浮内容可修改文字
                </div>
            </div>
            
            <div className="p-6 space-y-6 max-h-[800px] overflow-y-auto custom-scrollbar">
                {parsedSegments.map((segment, idx) => {
                    const originalSpeaker = segment.speaker;
                    const mappedName = speakerMapping[originalSpeaker] || originalSpeaker;
                    
                    // Check if mapped name matches a known stakeholder
                    const matchedStakeholder = stakeholders.find(dm => dm.name === mappedName);
                    const isMe = mappedName === '我' || mappedName === 'Me' || mappedName === '销售' || mappedName === 'Sales';
                    const hasTime = segment.time && segment.time !== '00:00';
                    const isEditing = editingIdx === idx;

                    return (
                        <div key={idx} className="flex gap-4 group relative">
                            {/* Speaker Avatar Column */}
                            <div className="flex-shrink-0 w-12 flex flex-col items-center gap-1">
                                <div 
                                    onClick={() => !isEditing && setMappingMenuOpenIndex(mappingMenuOpenIndex === idx ? null : idx)}
                                    className={`transition-all ${isEditing ? 'opacity-50 grayscale cursor-not-allowed' : 'cursor-pointer hover:scale-105 active:scale-95'}`}
                                    title={isEditing ? "" : "点击关联决策人"}
                                >
                                    <Avatar 
                                        name={matchedStakeholder ? matchedStakeholder.name : mappedName} 
                                        size="md"
                                        highlight={isMe || !!matchedStakeholder}
                                        className={!isMe && !matchedStakeholder ? "bg-slate-100 text-slate-500 border-transparent hover:border-indigo-300 border-2" : ""}
                                    />
                                </div>
                                
                                {/* Speaker Name / Label */}
                                <div className="relative">
                                    <button 
                                        disabled={isEditing}
                                        onClick={() => setMappingMenuOpenIndex(mappingMenuOpenIndex === idx ? null : idx)}
                                        className={`text-[10px] font-medium text-slate-500 truncate max-w-[60px] text-center block mx-auto ${isEditing ? '' : 'hover:text-indigo-600'}`}
                                    >
                                        {mappedName}
                                    </button>

                                    {/* Context Menu for Mapping */}
                                    {mappingMenuOpenIndex === idx && !isEditing && (
                                        <div className="absolute left-0 top-full mt-1 w-48 bg-white rounded-lg shadow-xl border border-slate-200 z-50 animate-in fade-in zoom-in-95 overflow-hidden">
                                            <div className="px-3 py-2 bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                                认领角色: {originalSpeaker}
                                            </div>
                                            <div className="max-h-48 overflow-y-auto">
                                                <button 
                                                    onClick={() => handleSelectSpeaker(originalSpeaker, "我")}
                                                    className="w-full text-left px-4 py-2 text-sm text-indigo-600 hover:bg-indigo-50 font-medium"
                                                >
                                                    我 (销售代表)
                                                </button>
                                                {stakeholders.map(dm => (
                                                    <button 
                                                        key={dm.id}
                                                        onClick={() => handleSelectSpeaker(originalSpeaker, dm.name)}
                                                        className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 truncate"
                                                    >
                                                        {dm.name} <span className="text-slate-400 text-xs">({dm.title})</span>
                                                    </button>
                                                ))}
                                                <button 
                                                    onClick={() => handleSelectSpeaker(originalSpeaker, originalSpeaker)} // Reset
                                                    className="w-full text-left px-4 py-2 text-sm text-slate-400 hover:bg-slate-50 italic border-t border-slate-50"
                                                >
                                                    重置为 "{originalSpeaker}"
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Text Bubble */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    {matchedStakeholder && (
                                        <div className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                                            {matchedStakeholder.title}
                                        </div>
                                    )}
                                    {hasTime && (
                                        <div className="text-[10px] text-slate-300 font-mono flex items-center gap-0.5">
                                            <Clock className="w-2.5 h-2.5" /> {segment.time}
                                        </div>
                                    )}
                                </div>
                                
                                {isEditing ? (
                                    <div className="flex flex-col gap-2">
                                        <textarea
                                            autoFocus
                                            value={editValue}
                                            onChange={(e) => setEditValue(e.target.value)}
                                            className="w-full p-3 rounded-xl text-sm leading-relaxed border-2 border-indigo-500 focus:ring-0 outline-none bg-white shadow-inner"
                                            rows={Math.max(2, Math.ceil(editValue.length / 40))}
                                        />
                                        <div className="flex justify-end gap-2">
                                            <button 
                                                onClick={cancelEditing}
                                                className="px-2 py-1 text-[10px] font-bold text-slate-400 hover:text-slate-600 flex items-center gap-1"
                                            >
                                                <X className="w-3 h-3" /> 取消
                                            </button>
                                            <button 
                                                onClick={() => saveEdit(idx)}
                                                className="px-3 py-1 text-[10px] font-bold bg-indigo-600 text-white rounded-md flex items-center gap-1 shadow-sm hover:bg-indigo-700"
                                            >
                                                <Check className="w-3 h-3" /> 保存修改
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="relative group/content">
                                        <div className={`p-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap transition-colors ${isMe ? 'bg-indigo-50 text-indigo-900 rounded-tl-none' : 'bg-slate-50 text-slate-800 rounded-tl-none border border-slate-100'}`}>
                                            {segment.text}
                                        </div>
                                        
                                        {/* Inline Edit Trigger */}
                                        {onUpdateTranscript && (
                                            <button 
                                                onClick={() => startEditing(idx, segment.text)}
                                                className="absolute right-2 top-2 p-1.5 bg-white/90 border border-slate-200 rounded-lg text-slate-400 hover:text-indigo-600 hover:border-indigo-300 hover:shadow-sm opacity-0 group-hover/content:opacity-100 transition-all"
                                                title="修改内容"
                                            >
                                                <Edit2 className="w-3 h-3" />
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}

                {parsedSegments.length === 0 && (
                        <div className="text-center py-10 text-slate-400">
                            <p>暂无对话内容。</p>
                        </div>
                )}
            </div>
        </div>
    );
};
