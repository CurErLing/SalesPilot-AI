
import React, { useRef, useState } from 'react';
import { VisitRecord, Stakeholder } from '../../types';
import { Clock, Mic, Trash2, Loader2, Image as ImageIcon, X, Plus, CheckSquare, Users, Target, ListChecks, HelpCircle, Check, Smartphone, UploadCloud } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Select } from '../ui/Select';
import { TranscriptEditor } from './TranscriptEditor';
import { AudioTrimmerModal } from './AudioTrimmerModal';
import { BluetoothSyncModal } from './BluetoothSyncModal';

interface Props {
    record: Partial<VisitRecord>;
    onChange: (updated: Partial<VisitRecord>) => void;
    onAudioUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onAnalyzeTranscript: () => void;
    onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onRemoveImage: (index: number) => void;
    onRemoveAudio: () => void;
    stakeholders: Stakeholder[];
    isPlanned?: boolean; 
    onGeneratePlan?: () => void; 
    isGeneratingPlan?: boolean; 
}

export const VisitRecordForm: React.FC<Props> = ({
    record,
    onChange,
    onAudioUpload,
    onAnalyzeTranscript,
    onImageUpload,
    onRemoveImage,
    onRemoveAudio,
    stakeholders,
    isPlanned = false,
    onGeneratePlan,
    isGeneratingPlan
}) => {
    const audioInputRef = useRef<HTMLInputElement>(null);
    const imageInputRef = useRef<HTMLInputElement>(null);
    const aiStatus = record.aiStatus || 'idle';

    // Trimmer State
    const [trimmerOpen, setTrimmerOpen] = useState(false);
    const [pendingFile, setPendingFile] = useState<File | null>(null);

    // Bluetooth State
    const [bluetoothOpen, setBluetoothOpen] = useState(false);

    const toggleStakeholder = (stakeholderId: string) => {
        const currentIds = record.stakeholderIds || [];
        let newIds;
        if (currentIds.includes(stakeholderId)) {
            newIds = currentIds.filter(id => id !== stakeholderId);
        } else {
            newIds = [...currentIds, stakeholderId];
        }
        onChange({ ...record, stakeholderIds: newIds });
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setPendingFile(file);
            setTrimmerOpen(true);
        }
    };

    const handleHardwareFileComplete = (file: File) => {
        setBluetoothOpen(false);
        setPendingFile(file);
        setTrimmerOpen(true);
    };

    const handleTrimConfirm = async (trimmedBlob: Blob, startTime: number, endTime: number) => {
        setTrimmerOpen(false);
        const file = new File([trimmedBlob], pendingFile?.name || "trimmed_audio.wav", { type: trimmedBlob.type });
        const syntheticEvent = {
            target: {
                files: [file]
            }
        } as unknown as React.ChangeEvent<HTMLInputElement>;
        onAudioUpload(syntheticEvent);
        setPendingFile(null);
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 space-y-8 animate-in fade-in duration-300">
            {/* Audio Trimmer Modal */}
            <AudioTrimmerModal 
                isOpen={trimmerOpen}
                onClose={() => { setTrimmerOpen(false); setPendingFile(null); if(audioInputRef.current) audioInputRef.current.value = ''; }}
                file={pendingFile}
                onConfirm={handleTrimConfirm}
            />

            {/* Bluetooth Sync Modal */}
            <BluetoothSyncModal 
                isOpen={bluetoothOpen}
                onClose={() => setBluetoothOpen(false)}
                onFileComplete={handleHardwareFileComplete}
            />

            {/* Header: Logistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Input 
                    label="日期"
                    type="date"
                    value={record.date} 
                    onChange={(e) => onChange({ ...record, date: e.target.value })}
                    icon={Clock}
                />
                
                <Select 
                    label="方式"
                    value={record.type}
                    onChange={(e) => onChange({ ...record, type: e.target.value as any })}
                    options={[
                        { label: '实地拜访 / 会议', value: 'Meeting' },
                        { label: '电话沟通', value: 'Call' },
                        { label: '邮件往来', value: 'Email' },
                        { label: '其他', value: 'Other' }
                    ]}
                />

                {!isPlanned && (
                    <Select 
                        label="互动成效 / 态度"
                        value={record.sentiment}
                        onChange={(e) => onChange({ ...record, sentiment: e.target.value as any })}
                        options={[
                            { label: '😐 一般 (Neutral)', value: 'Neutral' },
                            { label: '😊 推进顺利 (Positive)', value: 'Positive' },
                            { label: '😟 客户消极 (Negative)', value: 'Negative' },
                            { label: '⚠️ 存在风险 (Risk)', value: 'Risk' }
                        ]}
                    />
                )}
            </div>

            <Input 
                label="主题"
                placeholder="例如：需求沟通会议、价格谈判"
                value={record.title}
                onChange={(e) => onChange({ ...record, title: e.target.value })}
                className="font-bold text-lg"
            />

            {/* Stakeholder Selector */}
            <div className="p-5 bg-slate-50 rounded-xl border border-slate-200">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                    <Users className="w-4 h-4 text-indigo-600" /> {isPlanned ? '拟邀参会人 (决策人)' : '实际参会人'}
                </label>
                <div className="flex flex-wrap gap-2">
                    {stakeholders && stakeholders.length > 0 ? (
                        stakeholders.map(dm => {
                            const isSelected = record.stakeholderIds?.includes(dm.id);
                            return (
                                <button
                                    key={dm.id}
                                    onClick={() => toggleStakeholder(dm.id)}
                                    className={`
                                        flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all border
                                        ${isSelected 
                                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-md transform scale-105' 
                                            : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:text-indigo-600'
                                        }
                                    `}
                                >
                                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${isSelected ? 'bg-white/20' : 'bg-slate-100 text-slate-500'}`}>
                                        {dm.name.charAt(0)}
                                    </div>
                                    {dm.name}
                                    {isSelected && <CheckSquare className="w-3.5 h-3.5 ml-1" />}
                                </button>
                            )
                        })
                    ) : (
                        <div className="text-sm text-slate-400 italic py-2">
                            暂无决策人信息，请先在“全景画像”中添加。
                        </div>
                    )}
                </div>
            </div>

            {/* --- PLAN MODE FIELDS --- */}
            {isPlanned ? (
                 <div className="space-y-6 animate-in slide-in-from-bottom-4">
                     <div className="bg-indigo-50/50 p-6 rounded-xl border border-indigo-100 space-y-4">
                         <div className="flex items-center justify-between">
                             <label className="block text-xs font-bold text-indigo-800 uppercase tracking-wide flex items-center gap-2">
                                 <Target className="w-4 h-4" /> 拜访目标
                             </label>
                             {onGeneratePlan && (
                                 <Button 
                                    size="sm" 
                                    variant="gradient" 
                                    onClick={onGeneratePlan} 
                                    isLoading={isGeneratingPlan}
                                    disabled={!record.visitGoal || !record.stakeholderIds || record.stakeholderIds.length === 0}
                                    className="h-8 text-xs"
                                 >
                                     AI 生成策划案
                                 </Button>
                             )}
                         </div>
                         <Input 
                             placeholder="例如：确认预算金额，并推动技术选型" 
                             value={record.visitGoal || ''} 
                             onChange={(e) => onChange({ ...record, visitGoal: e.target.value })} 
                             disabled={isGeneratingPlan}
                             className="border-indigo-200 focus:border-indigo-500"
                         />
                         <p className="text-[10px] text-indigo-400/80">提示：输入目标并选择参会人后，点击右侧 AI 按钮自动生成议程与提问。</p>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div>
                             <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1">
                                 <ListChecks className="w-4 h-4" /> 会议议程
                             </label>
                             <Textarea 
                                 className="min-h-[200px]"
                                 placeholder="1. 破冰与回顾...&#10;2. 演示产品...&#10;3. ..." 
                                 value={record.agendaItems?.join('\n') || ''} 
                                 onChange={(e) => onChange({ ...record, agendaItems: e.target.value.split('\n') })} 
                             />
                         </div>
                         <div>
                             <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1">
                                 <HelpCircle className="w-4 h-4 text-amber-500" /> 黄金提问
                             </label>
                             <Textarea 
                                 className="min-h-[200px] border-amber-200 bg-amber-50/30 focus:bg-white focus:ring-amber-500"
                                 placeholder="AI 将根据画像缺口(Gap)生成必问问题..." 
                                 value={record.targetQuestions?.join('\n') || ''} 
                                 onChange={(e) => onChange({ ...record, targetQuestions: e.target.value.split('\n') })} 
                             />
                         </div>
                     </div>
                 </div>
            ) : (
                /* --- COMPLETED MODE FIELDS --- */
                <div className="space-y-8 animate-in slide-in-from-bottom-4">
                    {/* Audio Upload / Transcript Review Area */}
                    <div className="bg-slate-50 p-8 rounded-xl border border-dashed border-slate-300 text-center">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-4 flex items-center justify-center gap-2">
                            <Mic className="w-4 h-4 text-indigo-600" /> 现场录音 & AI 分析
                        </label>
                        
                        {record.audioUrl ? (
                            <div className="w-full">
                                {/* Editor Mode */}
                                {aiStatus === 'reviewing_transcript' && (
                                    <div className="w-full max-w-4xl mx-auto h-[600px] animate-in fade-in slide-in-from-bottom-2">
                                        <TranscriptEditor 
                                            audioUrl={record.audioUrl}
                                            transcript={record.transcript || ''}
                                            onChange={(text) => onChange({ ...record, transcript: text })}
                                            onAnalyze={onAnalyzeTranscript}
                                            stakeholders={stakeholders}
                                        />
                                    </div>
                                )}

                                {/* Analyzing State */}
                                {aiStatus === 'analyzing_insights' && (
                                    <div className="flex flex-col items-center justify-center gap-4 py-12">
                                        <Loader2 className="w-12 h-12 animate-spin text-indigo-600" />
                                        <div className="text-center">
                                            <p className="text-sm font-bold text-slate-800">正在深度分析对话内容...</p>
                                            <p className="text-xs text-slate-500 mt-1">提取关键行动项、客户情绪与潜在商机</p>
                                        </div>
                                    </div>
                                )}

                                {/* Completed State */}
                                {aiStatus === 'completed' && (
                                    <div className="flex flex-col items-center gap-4 py-6">
                                        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center animate-in zoom-in">
                                            <Check className="w-8 h-8 text-emerald-600" />
                                        </div>
                                        <div className="text-center">
                                            <p className="font-bold text-slate-800">AI 分析已完成</p>
                                            <Button variant="ghost" size="sm" onClick={onRemoveAudio} className="mt-2 text-red-500 hover:bg-red-50 hover:text-red-600">
                                                <Trash2 className="w-4 h-4 mr-1" /> 删除录音重试
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
                                    {/* Option A: Local Upload */}
                                    <div 
                                        onClick={() => !aiStatus.startsWith('transcribing') && audioInputRef.current?.click()}
                                        className={`flex flex-col items-center justify-center p-8 bg-white border border-slate-200 rounded-2xl shadow-sm hover:border-indigo-400 hover:bg-indigo-50/30 transition-all cursor-pointer group ${aiStatus === 'transcribing' ? 'opacity-50 pointer-events-none' : ''}`}
                                    >
                                        <input type="file" ref={audioInputRef} onChange={handleFileSelect} accept="audio/*" className="hidden" />
                                        <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-xl flex items-center justify-center mb-3 group-hover:bg-white group-hover:text-indigo-600 transition-colors">
                                            <UploadCloud className="w-6 h-6" />
                                        </div>
                                        <span className="text-sm font-bold text-slate-700">本地录音上传</span>
                                        <span className="text-[10px] text-slate-400 mt-1">支持 MP3, WAV, M4A</span>
                                    </div>

                                    {/* Option B: Hardware Import */}
                                    <div 
                                        onClick={() => setBluetoothOpen(true)}
                                        className="flex flex-col items-center justify-center p-8 bg-white border border-slate-200 rounded-2xl shadow-sm hover:border-indigo-400 hover:bg-indigo-50/30 transition-all cursor-pointer group"
                                    >
                                        <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mb-3 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                            <Smartphone className="w-6 h-6" />
                                        </div>
                                        <span className="text-sm font-bold text-slate-700">硬件设备同步</span>
                                        <span className="text-[10px] text-indigo-400 mt-1 font-medium">专用录音笔 5.3 蓝牙高速导入</span>
                                    </div>
                                </div>
                                {aiStatus === 'transcribing' && (
                                    <div className="mt-8 flex items-center gap-3 text-indigo-600 animate-pulse">
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        <span className="text-sm font-bold">AI 正在转录云端语音...</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Show Insights Fields only when Analysis is Done */}
                    {(aiStatus === 'completed' || aiStatus === 'idle' || record.content) && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in">
                            <Textarea 
                                label={record.transcript ? "AI 总结 / 核心发现" : "详细纪要"}
                                className="min-h-[200px] shadow-inner"
                                placeholder="记录会议的核心讨论点..." 
                                value={record.content} 
                                onChange={(e) => onChange({ ...record, content: e.target.value })} 
                            />
                            
                            <div>
                                <label className="block text-xs font-bold text-indigo-600 uppercase tracking-wide mb-1.5 flex items-center gap-1">
                                    <CheckSquare className="w-3.5 h-3.5" /> 下一步计划 (Action Items)
                                </label>
                                <Textarea 
                                    className="min-h-[200px] shadow-inner border-indigo-200 bg-indigo-50/30 focus:border-indigo-500"
                                    placeholder="明确具体的行动项、负责人和截止日期..." 
                                    value={record.nextSteps} 
                                    onChange={(e) => onChange({ ...record, nextSteps: e.target.value })} 
                                />
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Image Uploader */}
            <div className="pt-6 border-t border-slate-100">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-slate-400" /> 图片附件 / 现场照片
                </label>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                    {record.images?.map((img, idx) => (
                        <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden border border-slate-200 bg-slate-100">
                            <img src={img} alt="attachment" className="w-full h-full object-cover" />
                            <button onClick={() => onRemoveImage(idx)} className="absolute top-1 right-1 bg-white/90 hover:bg-red-50 text-slate-500 hover:text-red-600 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-sm">
                                <X className="w-3 h-3" />
                            </button>
                        </div>
                    ))}
                    <div onClick={() => imageInputRef.current?.click()} className="aspect-square rounded-lg border border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-500 cursor-pointer transition-colors bg-slate-50">
                        <input type="file" ref={imageInputRef} onChange={onImageUpload} accept="image/*" multiple className="hidden" />
                        <Plus className="w-6 h-6 mb-1" />
                        <span className="text-[10px] font-medium">上传</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
