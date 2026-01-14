import React, { useState, useMemo } from 'react';
import { Badge } from '../ui/Badge';
import { UserCircle } from 'lucide-react';
import { Stakeholder } from '../../types';

interface TranscriptSegment {
    speaker: string;
    text: string;
}

interface Props {
    transcript: string;
    speakerMapping: Record<string, string>;
    stakeholders: Stakeholder[];
    onMapSpeaker: (speakerKey: string, name: string) => void;
}

export const TranscriptViewer: React.FC<Props> = ({ 
    transcript, 
    speakerMapping, 
    stakeholders, 
    onMapSpeaker 
}) => {
    // FIX: Use index (number) instead of speaker name to uniquely identify which dropdown to open
    const [mappingMenuOpenIndex, setMappingMenuOpenIndex] = useState<number | null>(null);

    // --- Transcript Parsing Logic ---
    const parsedTranscript = useMemo<TranscriptSegment[]>(() => {
        const raw = transcript || '';
        if (!raw) return [];

        // Check if the text actually has speaker labels.
        const hasLabels = /([A-Za-z0-9\u4e00-\u9fa5]+)[:：]/.test(raw);
        
        if (!hasLabels) {
            return [{ speaker: 'Unknown', text: raw }];
        }

        // Split by pattern that looks like "Name:"
        const parts = raw.split(/(?:^|\s+)([A-Za-z0-9\u4e00-\u9fa5]+)[:：]/g);
        
        const segments: TranscriptSegment[] = [];
        for (let i = 1; i < parts.length; i += 2) {
            const speaker = parts[i];
            const text = parts[i+1];
            if (text && text.trim()) {
                segments.push({ speaker, text: text.trim() });
            }
        }
        
        return segments;
    }, [transcript]);

    const handleSelectSpeaker = (originalSpeaker: string, name: string) => {
        onMapSpeaker(originalSpeaker, name);
        setMappingMenuOpenIndex(null);
    };

    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm animate-in fade-in overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/50">
                <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-slate-700">智能剧本</h4>
                    <Badge variant="neutral" className="text-[10px]">AI Generated</Badge>
                </div>
                <div className="text-xs text-slate-400 flex items-center gap-1">
                    <UserCircle className="w-3 h-3" /> 点击发言人可进行角色认领
                </div>
            </div>
            
            <div className="p-6 space-y-6 max-h-[800px] overflow-y-auto custom-scrollbar">
                {parsedTranscript.map((segment, idx) => {
                    const originalSpeaker = segment.speaker;
                    const mappedName = speakerMapping[originalSpeaker] || originalSpeaker;
                    
                    // Check if mapped name matches a known stakeholder
                    const matchedStakeholder = stakeholders.find(dm => dm.name === mappedName);
                    const isMe = mappedName === '我' || mappedName === 'Me' || mappedName === '销售' || mappedName === 'Sales';

                    return (
                        <div key={idx} className="flex gap-4 group">
                            {/* Speaker Avatar Column */}
                            <div className="flex-shrink-0 w-12 flex flex-col items-center gap-1">
                                <div 
                                    onClick={() => setMappingMenuOpenIndex(mappingMenuOpenIndex === idx ? null : idx)}
                                    className={`
                                        w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold cursor-pointer transition-all border-2
                                        ${isMe ? 'bg-indigo-100 text-indigo-600 border-indigo-200' : 
                                          matchedStakeholder ? 'bg-emerald-100 text-emerald-600 border-emerald-200' : 'bg-slate-100 text-slate-500 border-transparent hover:border-indigo-300'}
                                    `}
                                    title="点击关联决策人"
                                >
                                    {matchedStakeholder ? matchedStakeholder.name.charAt(0) : mappedName.charAt(0)}
                                </div>
                                
                                {/* Speaker Name / Label */}
                                <div className="relative">
                                    <button 
                                        onClick={() => setMappingMenuOpenIndex(mappingMenuOpenIndex === idx ? null : idx)}
                                        className="text-[10px] font-medium text-slate-500 hover:text-indigo-600 truncate max-w-[60px] text-center"
                                    >
                                        {mappedName}
                                    </button>

                                    {/* Context Menu for Mapping */}
                                    {mappingMenuOpenIndex === idx && (
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
                            <div className="flex-1">
                                {matchedStakeholder && (
                                    <div className="text-[10px] font-bold text-emerald-600 mb-0.5 flex items-center gap-1">
                                        {matchedStakeholder.title}
                                    </div>
                                )}
                                <div className={`p-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${isMe ? 'bg-indigo-50 text-indigo-900 rounded-tl-none' : 'bg-slate-50 text-slate-800 rounded-tl-none border border-slate-100'}`}>
                                    {segment.text}
                                </div>
                            </div>
                        </div>
                    );
                })}

                {parsedTranscript.length === 0 && (
                        <div className="text-center py-10 text-slate-400">
                            <p>无法识别对话格式，显示原始文本：</p>
                            <div className="mt-4 p-4 bg-slate-50 rounded text-left whitespace-pre-wrap font-mono text-xs">
                                {transcript}
                            </div>
                        </div>
                )}
            </div>
        </div>
    );
};
