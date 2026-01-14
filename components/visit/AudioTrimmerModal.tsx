
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Play, Pause, Scissors, RotateCcw, X, Check, ZoomIn, ZoomOut, ChevronLeft, ChevronRight, FastForward, Rewind } from 'lucide-react';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    file: File | null;
    onConfirm: (trimmedBlob: Blob, startTime: number, endTime: number) => void;
}

export const AudioTrimmerModal: React.FC<Props> = ({ isOpen, onClose, file, onConfirm }) => {
    const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
    const [duration, setDuration] = useState(0);
    const [startTime, setStartTime] = useState(0);
    const [endTime, setEndTime] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [zoom, setZoom] = useState(1);
    
    const audioContextRef = useRef<AudioContext | null>(null);
    const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const playStartTimeRef = useRef<number>(0);
    const offsetAtStartRef = useRef<number>(0);
    const animationFrameRef = useRef<number>(0);

    // --- Audio Loading & Decoding ---
    useEffect(() => {
        if (!file || !isOpen) return;

        const loadAudio = async () => {
            try {
                const arrayBuffer = await file.arrayBuffer();
                if (!audioContextRef.current) {
                    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
                }
                const buffer = await audioContextRef.current.decodeAudioData(arrayBuffer);
                setAudioBuffer(buffer);
                setDuration(buffer.duration);
                setStartTime(0);
                setEndTime(buffer.duration);
                setCurrentTime(0);
            } catch (err) {
                console.error("Audio decode error:", err);
            }
        };

        loadAudio();
        return () => stopPlayback();
    }, [file, isOpen]);

    // --- Spacebar Shortcut ---
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (isOpen && e.code === 'Space') {
                e.preventDefault();
                togglePlayback();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, isPlaying, audioBuffer, currentTime, startTime, endTime]);

    // --- Waveform Rendering (Pro Style) ---
    const drawWaveform = useCallback(() => {
        if (!audioBuffer || !canvasRef.current) return;
        
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);

        const width = rect.width;
        const height = rect.height;
        const data = audioBuffer.getChannelData(0);
        
        // Use Zoom to determine window of samples
        const step = Math.ceil(data.length / width);
        const amp = height / 2;

        ctx.clearRect(0, 0, width, height);
        
        // Helper to draw a single slice
        const drawSlice = (startIdx: number, endIdx: number, color: string) => {
            ctx.beginPath();
            ctx.strokeStyle = color;
            ctx.lineWidth = 1;
            for (let i = startIdx; i < endIdx; i++) {
                let min = 1.0;
                let max = -1.0;
                for (let j = 0; j < step; j++) {
                    const datum = data[i * step + j];
                    if (datum < min) min = datum;
                    if (datum > max) max = datum;
                }
                ctx.moveTo(i, (1 + min) * amp);
                ctx.lineTo(i, (1 + max) * amp);
            }
            ctx.stroke();
        };

        const selectionStartPx = (startTime / duration) * width;
        const selectionEndPx = (endTime / duration) * width;

        // Draw background (unselected)
        drawSlice(0, width, '#cbd5e1'); // Slate-300
        
        // Draw foreground (selected)
        ctx.save();
        ctx.beginPath();
        ctx.rect(selectionStartPx, 0, selectionEndPx - selectionStartPx, height);
        ctx.clip();
        drawSlice(0, width, '#6366f1'); // Indigo-500
        ctx.restore();

    }, [audioBuffer, startTime, endTime, duration]);

    useEffect(() => {
        drawWaveform();
    }, [drawWaveform]);

    // --- Playback ---
    const formatTime = (time: number) => {
        const mins = Math.floor(time / 60);
        const secs = Math.floor(time % 60);
        const ms = Math.floor((time % 1) * 100);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
    };

    const stopPlayback = () => {
        if (sourceNodeRef.current) {
            try { sourceNodeRef.current.stop(); } catch(e) {}
            sourceNodeRef.current = null;
        }
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
        }
        setIsPlaying(false);
    };

    const startPlayback = async () => {
        if (!audioBuffer || !audioContextRef.current) return;
        stopPlayback();
        const ctx = audioContextRef.current;
        if (ctx.state === 'suspended') await ctx.resume();

        let playFrom = currentTime;
        if (playFrom < startTime || playFrom >= endTime - 0.05) playFrom = startTime;

        const source = ctx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(ctx.destination);
        source.start(0, playFrom, endTime - playFrom);
        
        sourceNodeRef.current = source;
        playStartTimeRef.current = ctx.currentTime;
        offsetAtStartRef.current = playFrom;
        setIsPlaying(true);

        const update = () => {
            const now = ctx.currentTime;
            const elapsed = now - playStartTimeRef.current;
            const newTime = offsetAtStartRef.current + elapsed;
            
            if (newTime >= endTime) {
                setCurrentTime(startTime);
                stopPlayback();
                return;
            }
            setCurrentTime(newTime);
            animationFrameRef.current = requestAnimationFrame(update);
        };
        animationFrameRef.current = requestAnimationFrame(update);
    };

    const togglePlayback = () => isPlaying ? stopPlayback() : startPlayback();

    // --- Utils ---
    const nudge = (type: 'start' | 'end', amount: number) => {
        if (type === 'start') {
            setStartTime(prev => Math.max(0, Math.min(endTime - 0.1, prev + amount)));
        } else {
            setEndTime(prev => Math.max(startTime + 0.1, Math.min(duration, prev + amount)));
        }
    };

    const handleConfirm = async () => {
        if (!audioBuffer) return;
        stopPlayback();
        const sampleRate = audioBuffer.sampleRate;
        const frameCount = Math.floor((endTime - startTime) * sampleRate);
        const offlineCtx = new OfflineAudioContext(audioBuffer.numberOfChannels, frameCount, sampleRate);
        const source = offlineCtx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(offlineCtx.destination);
        source.start(0, startTime, endTime - startTime);
        const rendered = await offlineCtx.startRendering();
        onConfirm(bufferToWav(rendered), startTime, endTime);
    };

    function bufferToWav(abuffer: AudioBuffer) {
        let numOfChan = abuffer.numberOfChannels,
            length = abuffer.length * numOfChan * 2 + 44,
            buffer = new ArrayBuffer(length),
            view = new DataView(buffer),
            pos = 0;
        const setUint16 = (d: number) => { view.setUint16(pos, d, true); pos += 2; };
        const setUint32 = (d: number) => { view.setUint32(pos, d, true); pos += 4; };
        setUint32(0x46464952); setUint32(length - 8); setUint32(0x45564157);
        setUint32(0x20746d66); setUint32(16); setUint16(1); setUint16(numOfChan);
        setUint32(abuffer.sampleRate); setUint32(abuffer.sampleRate * 2 * numOfChan);
        setUint16(numOfChan * 2); setUint16(16); setUint32(0x61746164); setUint32(length - pos - 4);
        const channels = [];
        for (let i = 0; i < abuffer.numberOfChannels; i++) channels.push(abuffer.getChannelData(i));
        let offset = 0;
        while (pos < length) {
            for (let i = 0; i < numOfChan; i++) {
                let sample = Math.max(-1, Math.min(1, channels[i][offset]));
                sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0;
                view.setInt16(pos, sample, true); pos += 2;
            }
            offset++;
        }
        return new Blob([buffer], { type: "audio/wav" });
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            maxWidth="max-w-6xl"
            title={
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200">
                        <Scissors className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-slate-800 tracking-tight">{file?.name}</h3>
                        <div className="flex items-center gap-3 mt-1">
                            <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded uppercase">音频剪切预处理</span>
                            <span className="text-[10px] text-indigo-500 font-medium flex items-center gap-1">
                                <Rewind className="w-3 h-3" /> Space 键控制播放
                            </span>
                        </div>
                    </div>
                </div>
            }
            footer={
                <div className="flex justify-between items-center w-full">
                    <div className="flex items-center gap-6">
                        <button 
                            onClick={() => { setStartTime(0); setEndTime(duration); setCurrentTime(0); }}
                            className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-indigo-600 transition-colors"
                        >
                            <RotateCcw className="w-4 h-4" /> 重置全选
                        </button>
                        <div className="h-4 w-px bg-slate-200"></div>
                        <div className="text-xs text-slate-400 font-medium">
                            原始时长: <span className="font-mono text-slate-600">{formatTime(duration)}</span>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <Button variant="secondary" onClick={onClose}>取消</Button>
                        <Button variant="primary" onClick={handleConfirm} icon={Check} className="bg-indigo-600 px-8">
                            确认使用选区
                        </Button>
                    </div>
                </div>
            }
        >
            <div className="space-y-8 py-2">
                {/* Visualizer Area */}
                <div className="relative bg-slate-900 rounded-3xl border-4 border-slate-800 shadow-2xl overflow-hidden select-none h-64 group/viz">
                    {/* Dark Grid Background */}
                    <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#ffffff 0.5px, transparent 0.5px)', backgroundSize: '24px 24px' }}></div>
                    
                    <canvas 
                        ref={canvasRef} 
                        onClick={(e) => {
                            const rect = canvasRef.current!.getBoundingClientRect();
                            setCurrentTime(((e.clientX - rect.left) / rect.width) * duration);
                            if (isPlaying) startPlayback();
                        }}
                        className="w-full h-full pt-8 cursor-crosshair relative z-10"
                    />

                    {/* Selection Layer */}
                    <div 
                        className="absolute top-0 bottom-0 bg-indigo-500/20 border-x-2 border-indigo-400 z-20 backdrop-blur-[1px]"
                        style={{ left: `${(startTime / duration) * 100}%`, right: `${100 - (endTime / duration) * 100}%` }}
                    >
                        {/* Handles */}
                        <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-8 h-16 flex items-center justify-center cursor-ew-resize z-30"
                             onMouseDown={(e) => {
                                 const startX = e.clientX;
                                 const initial = startTime;
                                 const move = (m: MouseEvent) => {
                                     const delta = (m.clientX - startX) / canvasRef.current!.clientWidth;
                                     setStartTime(Math.max(0, Math.min(endTime - 0.1, initial + delta * duration)));
                                 };
                                 const up = () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up); };
                                 window.addEventListener('mousemove', move); window.addEventListener('mouseup', up);
                             }}>
                            <div className="w-1.5 h-10 bg-white rounded-full shadow-lg border-2 border-indigo-500"></div>
                        </div>
                        <div className="absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-16 flex items-center justify-center cursor-ew-resize z-30"
                             onMouseDown={(e) => {
                                 const startX = e.clientX;
                                 const initial = endTime;
                                 const move = (m: MouseEvent) => {
                                     const delta = (m.clientX - startX) / canvasRef.current!.clientWidth;
                                     setEndTime(Math.max(startTime + 0.1, Math.min(duration, initial + delta * duration)));
                                 };
                                 const up = () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up); };
                                 window.addEventListener('mousemove', move); window.addEventListener('mouseup', up);
                             }}>
                            <div className="w-1.5 h-10 bg-white rounded-full shadow-lg border-2 border-indigo-500"></div>
                        </div>
                    </div>

                    {/* Playhead */}
                    <div 
                        className="absolute top-0 bottom-0 w-0.5 bg-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.8)] z-40 pointer-events-none"
                        style={{ left: `${(currentTime / duration) * 100}%` }}
                    />
                    
                    {/* Time Counter Overlay */}
                    <div className="absolute top-4 left-6 bg-slate-950/80 backdrop-blur-md border border-slate-700/50 rounded-lg px-3 py-1.5 text-yellow-400 font-mono text-sm z-50 shadow-xl">
                        {formatTime(currentTime)}
                    </div>
                </div>

                {/* Precision Controls */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                    
                    {/* Start Nudge */}
                    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                        <div className="space-y-1">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">选区起点</span>
                            <div className="text-sm font-mono font-bold text-slate-700">{formatTime(startTime)}</div>
                        </div>
                        <div className="flex gap-1">
                            <button onClick={() => nudge('start', -1)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"><ChevronLeft className="w-4 h-4" /></button>
                            <button onClick={() => nudge('start', 1)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"><ChevronRight className="w-4 h-4" /></button>
                        </div>
                    </div>

                    {/* Main Play Action */}
                    <div className="flex flex-col items-center gap-4">
                        <button 
                            onClick={togglePlayback}
                            className="w-20 h-20 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-2xl shadow-indigo-200 hover:scale-110 active:scale-95 transition-all"
                        >
                            {isPlaying ? <Pause className="w-10 h-10 fill-current" /> : <Play className="w-10 h-10 fill-current ml-1" />}
                        </button>
                        <div className="text-center">
                            <div className="text-xl font-black text-indigo-600 font-mono tracking-tighter tabular-nums">
                                {formatTime(endTime - startTime)}
                            </div>
                            <div className="text-[10px] font-bold text-slate-400 uppercase">保留时长</div>
                        </div>
                    </div>

                    {/* End Nudge */}
                    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                        <div className="space-y-1">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">选区终点</span>
                            <div className="text-sm font-mono font-bold text-slate-700">{formatTime(endTime)}</div>
                        </div>
                        <div className="flex gap-1">
                            <button onClick={() => nudge('end', -1)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"><ChevronLeft className="w-4 h-4" /></button>
                            <button onClick={() => nudge('end', 1)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"><ChevronRight className="w-4 h-4" /></button>
                        </div>
                    </div>

                </div>

                {/* Bottom Tools */}
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 flex items-center justify-between px-8">
                     <div className="flex items-center gap-4">
                        <span className="text-xs font-bold text-slate-500">波形缩放</span>
                        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200">
                            <ZoomOut className="w-4 h-4 text-slate-400" />
                            <input 
                                type="range" min="1" max="50" step="1" 
                                value={zoom} onChange={(e) => setZoom(parseInt(e.target.value))}
                                className="w-48 h-1 bg-slate-200 rounded-full accent-indigo-600"
                            />
                            <ZoomIn className="w-4 h-4 text-slate-400" />
                        </div>
                     </div>
                     
                     <div className="flex items-center gap-2 text-slate-400">
                        <Rewind className="w-4 h-4" />
                        <span className="text-[10px] font-medium tracking-tight">建议：仅剪辑包含核心对话的部分，可提升 AI 分析的准确率</span>
                     </div>
                </div>
            </div>
        </Modal>
    );
};
