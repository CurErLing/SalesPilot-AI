
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Play, Pause, RotateCcw, RotateCw, Edit2, Copy, Trash2, User, Clock, Check, Users } from 'lucide-react';
import { Button } from '../ui/Button';
import { SpeakerManagerModal } from './SpeakerManagerModal';
import { SpeakerEditModal } from './SpeakerEditModal';
import { Stakeholder } from '../../types';

interface Props {
    audioUrl?: string;
    transcript: string;
    onChange: (newTranscript: string) => void;
    onAnalyze: () => void;
    stakeholders?: Stakeholder[];
}

interface Segment {
    id: string;
    time: string;
    speaker: string;
    text: string;
}

export const TranscriptEditor: React.FC<Props> = ({ audioUrl, transcript, onChange, onAnalyze, stakeholders }) => {
    // --- State ---
    const [segments, setSegments] = useState<Segment[]>([]);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [playbackRate, setPlaybackRate] = useState(1);
    
    // Modals
    const [isSpeakerManagerOpen, setIsSpeakerManagerOpen] = useState(false);
    const [editingSpeaker, setEditingSpeaker] = useState<string | null>(null);
    
    // Audio Ref
    const audioRef = useRef<HTMLAudioElement>(null);

    // --- Parsing Logic ---
    useEffect(() => {
        if (!transcript) {
            setSegments([]);
            return;
        }

        // Try parsing: [MM:SS] Speaker: Text
        const regex = /\[(\d{2}:\d{2})\]\s*(.*?):\s*(.*)/;
        const lines = transcript.split('\n');
        const parsed: Segment[] = [];
        
        let currentSegment: Partial<Segment> | null = null;

        lines.forEach((line, idx) => {
            const match = line.match(regex);
            if (match) {
                if (currentSegment) parsed.push(currentSegment as Segment);
                currentSegment = {
                    id: `seg-${idx}`,
                    time: match[1],
                    speaker: match[2],
                    text: match[3]
                };
            } else if (currentSegment) {
                // Append to previous if it's a continuation
                currentSegment.text += ` ${line}`;
            } else if (line.trim()) {
                // Fallback for lines without timestamp
                parsed.push({
                    id: `seg-${idx}`,
                    time: '00:00',
                    speaker: 'Unknown',
                    text: line
                });
            }
        });
        if (currentSegment) parsed.push(currentSegment as Segment);

        // If regex failed completely (e.g. raw text), just wrap it
        if (parsed.length === 0 && transcript.trim()) {
            parsed.push({
                id: 'seg-0',
                time: '00:00',
                speaker: 'System',
                text: transcript
            });
        }

        setSegments(parsed);
    }, [transcript]);

    // --- Audio Control ---
    const togglePlay = () => {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    const handleTimeUpdate = () => {
        if (audioRef.current) setCurrentTime(audioRef.current.currentTime);
    };

    const handleLoadedMetadata = () => {
        if (audioRef.current) setDuration(audioRef.current.duration);
    };

    const skip = (seconds: number) => {
        if (audioRef.current) {
            audioRef.current.currentTime += seconds;
        }
    };

    const changeSpeed = () => {
        const rates = [1, 1.25, 1.5, 0.75];
        const nextIdx = (rates.indexOf(playbackRate) + 1) % rates.length;
        const newRate = rates[nextIdx];
        setPlaybackRate(newRate);
        if (audioRef.current) audioRef.current.playbackRate = newRate;
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const time = parseFloat(e.target.value);
        if (audioRef.current) {
            audioRef.current.currentTime = time;
            setCurrentTime(time);
        }
    };

    const formatTime = (time: number) => {
        const mins = Math.floor(time / 60);
        const secs = Math.floor(time % 60);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // --- Editing Logic ---
    const notifyChange = (newSegments: Segment[]) => {
        setSegments(newSegments);
        const newTranscript = newSegments.map(s => `[${s.time}] ${s.speaker}: ${s.text}`).join('\n');
        onChange(newTranscript);
    };

    const updateSegmentText = (id: string, newText: string) => {
        const updated = segments.map(s => s.id === id ? { ...s, text: newText } : s);
        notifyChange(updated);
    };

    // --- Speaker Management ---
    const uniqueSpeakers = useMemo(() => {
        return Array.from(new Set(segments.map(s => s.speaker))).filter(Boolean);
    }, [segments]);

    const handleGlobalRename = (oldName: string, newName: string) => {
        const updated = segments.map(s => s.speaker === oldName ? { ...s, speaker: newName } : s);
        notifyChange(updated);
        setEditingSpeaker(null); // Close individual modal if open
    };

    return (
        <div className="flex flex-col h-full bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            
            {/* 1. Player Header */}
            <div className="p-4 border-b border-slate-100 bg-white sticky top-0 z-20">
                <div className="flex flex-col gap-4">
                    {/* Audio Metadata */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                                <Play className="w-4 h-4" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-slate-800">录音转写预览</h3>
                                <p className="text-[10px] text-slate-400">请核对文字，确保 AI 总结的准确性</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                             <Button onClick={onAnalyze} variant="gradient" size="sm">确认无误，生成总结</Button>
                        </div>
                    </div>

                    {/* Controls */}
                    {audioUrl && (
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                            <audio 
                                ref={audioRef} 
                                src={audioUrl} 
                                onTimeUpdate={handleTimeUpdate}
                                onLoadedMetadata={handleLoadedMetadata}
                                onEnded={() => setIsPlaying(false)}
                            />
                            
                            {/* Progress */}
                            <div className="flex items-center gap-3 text-xs text-slate-500 font-mono mb-2">
                                <span>{formatTime(currentTime)}</span>
                                <input 
                                    type="range" 
                                    min={0} 
                                    max={duration || 100} 
                                    value={currentTime} 
                                    onChange={handleSeek}
                                    className="flex-1 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-indigo-600 [&::-webkit-slider-thumb]:rounded-full"
                                />
                                <span>{formatTime(duration)}</span>
                            </div>

                            {/* Buttons */}
                            <div className="flex items-center justify-center gap-6">
                                <button onClick={() => skip(-15)} className="text-slate-400 hover:text-indigo-600 transition-colors p-1"><RotateCcw className="w-5 h-5" /></button>
                                <button 
                                    onClick={togglePlay}
                                    className="w-10 h-10 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full flex items-center justify-center shadow-lg shadow-indigo-200 transition-all active:scale-95"
                                >
                                    {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
                                </button>
                                <button onClick={() => skip(15)} className="text-slate-400 hover:text-indigo-600 transition-colors p-1"><RotateCw className="w-5 h-5" /></button>
                                
                                <button onClick={changeSpeed} className="text-xs font-bold text-slate-500 bg-slate-200 px-2 py-1 rounded hover:bg-slate-300 transition-colors w-12">
                                    {playbackRate}x
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* 2. Transcript Actions Bar */}
            <div className="px-6 py-2 bg-white border-b border-slate-50 flex items-center justify-between sticky top-[138px] z-10">
                <Button 
                    size="sm" 
                    variant="secondary" 
                    className="h-8 text-xs bg-slate-50 border-slate-200 hover:border-indigo-300 text-slate-600"
                    icon={Users}
                    onClick={() => setIsSpeakerManagerOpen(true)}
                >
                    管理发言人
                </Button>
                <span className="text-[10px] text-slate-400">
                    {currentTime > 0 ? `当前播放: ${formatTime(currentTime)}` : '准备就绪'}
                </span>
            </div>

            {/* 3. Transcript List */}
            <div className="flex-1 overflow-y-auto bg-slate-50/50 p-6 space-y-4 custom-scrollbar">
                {segments.map((seg, idx) => {
                    const isCurrent = audioUrl && currentTime >= parseTime(seg.time) && currentTime < parseTime(segments[idx + 1]?.time || '59:59');
                    
                    return (
                        <div key={seg.id} className={`group flex gap-4 p-4 rounded-xl border transition-all ${isCurrent ? 'bg-indigo-50/50 border-indigo-100 shadow-sm' : 'hover:bg-white hover:shadow-sm hover:border-slate-200 border-transparent'}`}>
                            {/* Left: Speaker Info */}
                            <div className="w-24 shrink-0 flex flex-col gap-2 pt-1 relative">
                                <button 
                                    onClick={() => setEditingSpeaker(seg.speaker)}
                                    className="flex items-center gap-1 group/speaker text-left hover:bg-indigo-50 rounded px-1.5 py-1 -ml-1.5 transition-colors"
                                    title="点击编辑发言人"
                                >
                                    <span className="text-xs font-bold text-indigo-600 truncate max-w-[80px]">
                                        {seg.speaker}
                                    </span>
                                    {/* Inline Edit Icon Visual Hint */}
                                    <Edit2 
                                        className="w-3 h-3 text-slate-300 opacity-0 group-hover/speaker:opacity-100 transition-opacity" 
                                    />
                                </button>
                                <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1 cursor-pointer hover:text-indigo-500" onClick={() => {
                                    if(audioRef.current) audioRef.current.currentTime = parseTime(seg.time);
                                }}>
                                    <Clock className="w-3 h-3" />
                                    {seg.time}
                                </div>
                            </div>

                            {/* Right: Text */}
                            <div className="flex-1 relative">
                                <textarea 
                                    value={seg.text}
                                    onChange={(e) => updateSegmentText(seg.id, e.target.value)}
                                    className="w-full bg-transparent text-sm text-slate-700 leading-relaxed border-none focus:ring-0 p-0 resize-none overflow-hidden h-auto min-h-[24px]"
                                    rows={Math.max(1, Math.ceil(seg.text.length / 50))}
                                    spellCheck={false}
                                />
                            </div>
                        </div>
                    );
                })}

                {segments.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400 pb-20">
                        <p>暂无内容</p>
                    </div>
                )}
            </div>

            {/* Speaker Manager Modal (Bulk List) */}
            <SpeakerManagerModal 
                isOpen={isSpeakerManagerOpen}
                onClose={() => setIsSpeakerManagerOpen(false)}
                speakers={uniqueSpeakers}
                onRename={handleGlobalRename}
                stakeholders={stakeholders}
            />

            {/* Individual Speaker Edit Modal */}
            {editingSpeaker && (
                <SpeakerEditModal 
                    isOpen={!!editingSpeaker}
                    onClose={() => setEditingSpeaker(null)}
                    initialName={editingSpeaker}
                    onSave={(newName) => handleGlobalRename(editingSpeaker, newName)}
                    stakeholders={stakeholders}
                />
            )}
        </div>
    );
};

// Helper
function parseTime(timeStr: string): number {
    const [min, sec] = timeStr.split(':').map(Number);
    return (min || 0) * 60 + (sec || 0);
}
