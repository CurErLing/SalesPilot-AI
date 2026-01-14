
import React, { useState, useEffect } from 'react';
import { VisitRecord, Customer, PersonaData, PainPoint } from '../../types';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
// Added missing Image as ImageIcon import
import { ArrowLeft, Edit2, Save, Clock, Mic, FileText, CheckSquare, Target, Calendar, HelpCircle, Briefcase, PlayCircle, BrainCircuit, Sparkles, UserPlus, AlertCircle, ArrowDown, Swords, ListTodo, Image as ImageIcon } from 'lucide-react';
import { generateMeetingTranscript, generateMeetingInsights, generateVisitPlan, extractPersonaData } from '../../services/geminiService';
import { mergePersonaWithMetadata } from '../../utils/personaHelper';
import { TranscriptViewer } from './TranscriptViewer';
import { VisitRecordForm } from './VisitRecordForm';
import { Tabs } from '../ui/Tabs';
import ReactMarkdown from 'react-markdown';

interface Props {
    record: VisitRecord;
    customer: Customer;
    isNew?: boolean;
    onSave: (record: VisitRecord) => void;
    onUpdateCustomer?: (customer: Customer) => void;
    onBack: () => void;
}

export const VisitRecordDetail: React.FC<Props> = ({ 
    record: initialRecord, 
    customer, 
    isNew = false, 
    onSave,
    onUpdateCustomer,
    onBack 
}) => {
    const initialAiStatus = initialRecord.aiStatus || 'idle';
    const isProcessingStart = ['transcribing', 'reviewing_transcript', 'analyzing_insights'].includes(initialAiStatus);

    const [isEditing, setIsEditing] = useState(isNew || isProcessingStart);
    const [editingRecord, setEditingRecord] = useState<Partial<VisitRecord>>({ ...initialRecord });
    const [activeTab, setActiveTab] = useState<'summary' | 'transcript'>('summary');
    const [loadingPlan, setLoadingPlan] = useState(false); 
    const [isExtractingPersona, setIsExtractingPersona] = useState(false);
    const [extractedData, setExtractedData] = useState<Partial<PersonaData> | null>(null);
    const [extractionSuccess, setExtractionSuccess] = useState(false);
    const [localSpeakerMapping, setLocalSpeakerMapping] = useState<Record<string, string>>(initialRecord.speakerMapping || {});

    useEffect(() => {
        setEditingRecord({ ...initialRecord });
        setLocalSpeakerMapping(initialRecord.speakerMapping || {});
        const currentStatus = initialRecord.aiStatus || 'idle';
        if (['transcribing', 'reviewing_transcript', 'analyzing_insights'].includes(currentStatus)) {
            setIsEditing(true);
        }
    }, [initialRecord]);

    const isPlanned = editingRecord.status === 'Planned';
    const aiStatus = editingRecord.aiStatus || 'idle';
    const isAiProcessing = ['transcribing', 'reviewing_transcript', 'analyzing_insights'].includes(aiStatus);

    const handleSave = () => {
        if (!editingRecord.title) return;
        const toSave = {
            ...editingRecord,
            speakerMapping: localSpeakerMapping
        } as VisitRecord;
        onSave(toSave);
        setIsEditing(false);
    };

    const handleCancelEdit = () => {
        if (isNew) {
            onBack();
        } else {
            setEditingRecord({ ...initialRecord });
            setIsEditing(false);
        }
    };

    const handleStartMeeting = () => {
        const startedRecord: Partial<VisitRecord> = {
            ...editingRecord,
            status: 'Completed',
            date: new Date().toISOString().split('T')[0]
        };
        setEditingRecord(startedRecord);
        onSave(startedRecord as VisitRecord);
        setIsEditing(true); 
    };

    const handleGenerateAIPlan = async () => {
        if (!editingRecord.visitGoal || !editingRecord.stakeholderIds?.length) {
            alert("请先填写拜访目标并选择参会决策人");
            return;
        }
        setLoadingPlan(true);
        try {
            const stakeholders = customer.persona.decisionMakers.filter(dm => editingRecord.stakeholderIds?.includes(dm.id));
            const plan = await generateVisitPlan(customer, editingRecord.visitGoal, stakeholders);
            setEditingRecord(prev => ({
                ...prev,
                agendaItems: plan.agendaItems,
                targetQuestions: plan.targetQuestions,
                requiredMaterials: plan.requiredMaterials
            }));
        } catch (e) {
            console.error(e);
            alert("生成失败");
        } finally {
            setLoadingPlan(false);
        }
    };

    const handleSpeakerMap = (speakerKey: string, name: string) => {
        const newMapping = { ...localSpeakerMapping, [speakerKey]: name };
        setLocalSpeakerMapping(newMapping);
        const updatedRecord = { ...editingRecord, speakerMapping: newMapping } as VisitRecord;
        onSave(updatedRecord);
        setEditingRecord(updatedRecord);
    };

    const handleUpdateTranscript = (newTranscript: string) => {
        const updatedRecord = { ...editingRecord, transcript: newTranscript } as VisitRecord;
        setEditingRecord(updatedRecord);
        onSave(updatedRecord);
    };

    const handleScanForPersona = async () => {
        setIsExtractingPersona(true);
        setExtractedData(null);
        setExtractionSuccess(false);
        try {
            const fullText = `Title: ${editingRecord.title}\nSummary: ${editingRecord.content}\nTranscript: ${editingRecord.transcript}`;
            const updates = await extractPersonaData(fullText, customer.persona);
            const hasUpdates = Object.keys(updates).length > 0 && (
                (updates.decisionMakers && updates.decisionMakers.length > 0) ||
                (updates.keyPainPoints && updates.keyPainPoints.length > 0) ||
                (updates.competitors && updates.competitors.length > 0) ||
                updates.budget || 
                updates.projectTimeline ||
                updates.projectBackground
            );
            if (hasUpdates) setExtractedData(updates);
            else alert("AI 未在本次记录中发现新的画像信息。");
        } catch (e) {
            console.error(e);
            alert("扫描失败");
        } finally {
            setIsExtractingPersona(false);
        }
    };

    const handleAdoptUpdates = () => {
        if (!extractedData || !onUpdateCustomer) return;
        const sourceLabel = `Visit: ${editingRecord.date}`;
        const updatedPersona = mergePersonaWithMetadata(customer.persona, extractedData, sourceLabel);
        onUpdateCustomer({ ...customer, persona: updatedPersona });
        setExtractedData(null);
        setExtractionSuccess(true);
        setTimeout(() => setExtractionSuccess(false), 3000);
    };

    const handleAudioUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        const processingRecord: Partial<VisitRecord> = { ...editingRecord, aiStatus: 'transcribing' };
        setEditingRecord(processingRecord);
        onSave(processingRecord as VisitRecord);
        try {
            const audioUrl = URL.createObjectURL(file);
            const base64Data = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = () => resolve((reader.result as string).split(',')[1]);
                reader.onerror = reject;
            });
            const transcript = await generateMeetingTranscript(base64Data, file.type);
            const reviewedRecord: Partial<VisitRecord> = { ...processingRecord, audioUrl, transcript, aiStatus: 'reviewing_transcript' };
            setEditingRecord(reviewedRecord);
            onSave(reviewedRecord as VisitRecord);
        } catch (error) {
            console.error(error);
            alert("音频处理失败");
            const failedRecord: Partial<VisitRecord> = { ...editingRecord, aiStatus: 'idle' };
            setEditingRecord(failedRecord);
            onSave(failedRecord as VisitRecord);
        } finally {
            if (event.target) event.target.value = '';
        }
    };

    const handleAnalyzeTranscript = async () => {
        if (!editingRecord.transcript) return;
        const analyzingRecord: Partial<VisitRecord> = { ...editingRecord, aiStatus: 'analyzing_insights' };
        setEditingRecord(analyzingRecord);
        onSave(analyzingRecord as VisitRecord);
        try {
            const insights = await generateMeetingInsights(editingRecord.transcript);
            const completedRecord: Partial<VisitRecord> = {
                ...analyzingRecord,
                title: analyzingRecord?.title ? analyzingRecord.title : insights.title,
                type: insights.type,
                content: insights.summary,
                nextSteps: insights.nextSteps,
                sentiment: insights.sentiment,
                aiStatus: 'completed'
            };
            setEditingRecord(completedRecord);
            onSave(completedRecord as VisitRecord);
        } catch (e) {
            console.error(e);
            alert("分析失败，请重试");
            const retryRecord: Partial<VisitRecord> = { ...editingRecord, aiStatus: 'reviewing_transcript' };
            setEditingRecord(retryRecord);
            onSave(retryRecord as VisitRecord);
        }
    };

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!event.target.files) return;
        const newImages: string[] = [];
        for (let i = 0; i < event.target.files.length; i++) {
            const file = event.target.files[i];
            const reader = new FileReader();
            reader.readAsDataURL(file);
            await new Promise<void>((resolve) => { reader.onload = () => { newImages.push(reader.result as string); resolve(); };});
        }
        setEditingRecord(prev => ({ ...prev, images: [...(prev?.images || []), ...newImages] }));
        if (event.target) event.target.value = '';
    };

    const removeImage = (index: number) => {
        if (!editingRecord.images) return;
        const newImages = [...editingRecord.images];
        newImages.splice(index, 1);
        setEditingRecord(prev => ({ ...prev, images: newImages }));
    };

    const TAB_ITEMS = [
        { id: 'summary', label: '纪要与行动', icon: FileText },
        { id: 'transcript', label: 'AI 逐字稿', icon: BrainCircuit },
    ];

    return (
        <div className="h-full flex flex-col bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-in slide-in-from-right-4 duration-300">
             <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white sticky top-0 z-10 shrink-0">
                  <div className="flex items-center gap-4">
                      <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors">
                          <ArrowLeft className="w-5 h-5" />
                      </button>
                      <div>
                          <h2 className="font-bold text-slate-800 text-lg leading-none mb-1 flex items-center gap-2">
                              {isPlanned ? <Target className="w-5 h-5 text-indigo-500" /> : <Briefcase className="w-5 h-5 text-slate-500" />}
                              {isNew ? (isPlanned ? "策划新任务" : "新建记录") : (isPlanned ? "作战策划室" : "复盘详情")}
                          </h2>
                          {!isEditing && (
                              <div className="flex items-center gap-2 text-xs text-slate-500">
                                  <span>{editingRecord.date}</span>
                                  <span>•</span>
                                  <span>{editingRecord.type}</span>
                              </div>
                          )}
                      </div>
                  </div>
                  <div className="flex items-center gap-3">
                      {!isEditing ? (
                          <>
                            {isPlanned && (
                                <Button onClick={handleStartMeeting} icon={PlayCircle} className="bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200">
                                    执行任务 / 录入结果
                                </Button>
                            )}
                            <Button onClick={() => setIsEditing(true)} icon={Edit2} variant="secondary">编辑</Button>
                          </>
                      ) : (
                          <>
                              <Button variant="ghost" onClick={handleCancelEdit} disabled={isAiProcessing}>取消</Button>
                              <Button 
                                onClick={handleSave} 
                                disabled={!editingRecord?.title || isAiProcessing} 
                                icon={Save}
                                isLoading={isAiProcessing}
                              >
                                  {isAiProcessing ? "AI 处理中..." : (isPlanned ? "保存计划" : "保存记录")}
                              </Button>
                          </>
                      )}
                  </div>
              </div>

              <div className="flex-1 overflow-y-auto bg-slate-50/50">
                  <div className="max-w-4xl mx-auto p-6 space-y-6">
                      {isEditing ? (
                          <VisitRecordForm 
                             record={editingRecord}
                             onChange={setEditingRecord}
                             onAudioUpload={handleAudioUpload}
                             onAnalyzeTranscript={handleAnalyzeTranscript}
                             onImageUpload={handleImageUpload}
                             onRemoveImage={removeImage}
                             onRemoveAudio={() => {
                                 const reset = {...editingRecord, audioUrl: undefined, transcript: undefined, aiStatus: 'idle' as const};
                                 setEditingRecord(reset);
                                 onSave(reset as VisitRecord);
                             }}
                             stakeholders={customer.persona.decisionMakers || []}
                             isPlanned={isPlanned}
                             onGeneratePlan={handleGenerateAIPlan}
                             isGeneratingPlan={loadingPlan}
                          />
                      ) : (
                          <div className="space-y-6 animate-in fade-in duration-300">
                                <div className={`rounded-xl p-6 border shadow-sm ${isPlanned ? 'bg-gradient-to-br from-indigo-50 to-white border-indigo-100' : 'bg-white border-slate-200'}`}>
                                    <div className="flex items-start justify-between mb-4">
                                        <h1 className="text-2xl font-extrabold text-slate-900 leading-tight">{editingRecord.title}</h1>
                                        {isPlanned && <Badge className="bg-indigo-100 text-indigo-700 border-indigo-200 px-3 py-1">计划中</Badge>}
                                    </div>
                                    <div className="flex flex-col gap-4">
                                        <div className="flex flex-wrap gap-3">
                                            <Badge variant="neutral" className="px-3 py-1 text-sm flex items-center gap-1"><Clock className="w-3.5 h-3.5"/> {editingRecord.date}</Badge>
                                            <Badge variant="neutral" className="px-3 py-1 text-sm">{editingRecord.type}</Badge>
                                            {editingRecord.audioUrl && <Badge variant="success" className="px-3 py-1 text-sm flex items-center gap-1"><Mic className="w-3.5 h-3.5" /> 含 AI 录音分析</Badge>}
                                        </div>
                                        {editingRecord.stakeholderIds && editingRecord.stakeholderIds.length > 0 && (
                                            <div className="flex items-center gap-2 pt-2 border-t border-slate-200/50">
                                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                                                    {isPlanned ? '目标决策人:' : '实际参会人:'}
                                                </span>
                                                <div className="flex flex-wrap gap-2">
                                                    {editingRecord.stakeholderIds.map(id => {
                                                        const person = customer.persona.decisionMakers.find(dm => dm.id === id);
                                                        if (!person) return null;
                                                        return (
                                                            <div key={id} className="flex items-center gap-1.5 px-2 py-1 bg-white text-slate-700 rounded-full text-xs font-medium border border-slate-200 shadow-sm">
                                                                <div className="w-4 h-4 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-[9px] font-bold">
                                                                    {person.name.charAt(0)}
                                                                </div>
                                                                {person.name}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {isPlanned && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="md:col-span-2 bg-white rounded-xl p-6 border border-slate-200 shadow-sm relative overflow-hidden">
                                             <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
                                             <h4 className="text-sm font-bold text-indigo-800 uppercase tracking-wide mb-3 flex items-center gap-2">
                                                 <Target className="w-4 h-4" /> 本次拜访核心目标
                                             </h4>
                                             <p className="text-xl font-medium text-slate-800 leading-relaxed">
                                                 {editingRecord.visitGoal || '未设定目标'}
                                             </p>
                                        </div>
                                        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm h-full">
                                            <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-4 flex items-center gap-2">
                                                 <Calendar className="w-4 h-4" /> 议程规划
                                            </h4>
                                            <ul className="space-y-4">
                                                {editingRecord.agendaItems?.map((item, i) => (
                                                    <li key={i} className="flex gap-3 text-sm text-slate-700">
                                                        <span className="flex items-center justify-center w-5 h-5 rounded-full bg-indigo-50 text-indigo-600 font-bold text-xs shrink-0">{i+1}</span>
                                                        <span>{item}</span>
                                                    </li>
                                                ))}
                                                {(!editingRecord.agendaItems || editingRecord.agendaItems.length === 0) && <p className="text-slate-400 italic text-sm">暂无议程</p>}
                                            </ul>
                                        </div>
                                        <div className="bg-gradient-to-br from-amber-50 to-white rounded-xl p-6 border border-amber-100 shadow-sm h-full">
                                            <h4 className="text-sm font-bold text-amber-600 uppercase tracking-wide mb-4 flex items-center gap-2">
                                                 <HelpCircle className="w-4 h-4" /> 黄金提问 (Gap挖掘)
                                            </h4>
                                            <ul className="space-y-4">
                                                {editingRecord.targetQuestions?.map((item, i) => (
                                                    <li key={i} className="flex gap-3 text-sm text-slate-800">
                                                        <span className="font-bold text-amber-500 select-none shrink-0">Q{i+1}</span>
                                                        <span className="font-medium">{item}</span>
                                                    </li>
                                                ))}
                                                 {(!editingRecord.targetQuestions || editingRecord.targetQuestions.length === 0) && <p className="text-slate-400 italic text-sm">暂无推荐问题</p>}
                                            </ul>
                                        </div>
                                    </div>
                                )}

                                {!isPlanned && (
                                    <>
                                        {editingRecord.transcript && (
                                            <div className="sticky top-0 z-10">
                                                <Tabs 
                                                    items={TAB_ITEMS}
                                                    activeId={activeTab}
                                                    onChange={(id) => setActiveTab(id as any)}
                                                    className="bg-white border-b border-slate-200 px-6 pt-2"
                                                />
                                            </div>
                                        )}

                                        {activeTab === 'summary' && (
                                            <div className="space-y-8 animate-in fade-in">
                                                {(editingRecord.transcript || editingRecord.content) && onUpdateCustomer && (
                                                    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-5 rounded-2xl border border-indigo-100 flex flex-col gap-4 shadow-sm">
                                                        <div className="flex items-center justify-between">
                                                            <div>
                                                                <h4 className="font-bold text-indigo-900 text-base flex items-center gap-2">
                                                                    <Sparkles className="w-5 h-5 text-purple-600" /> AI 智能提取与回写
                                                                </h4>
                                                                <p className="text-xs text-indigo-700/70 mt-1">
                                                                    扫描对话内容，自动发现并补齐画像中的新决策人、痛点或竞品信息。
                                                                </p>
                                                            </div>
                                                            {!extractedData && !extractionSuccess && (
                                                                <Button 
                                                                    size="md" 
                                                                    variant="gradient"
                                                                    onClick={handleScanForPersona} 
                                                                    isLoading={isExtractingPersona}
                                                                    icon={Sparkles}
                                                                    className="shadow-md shadow-indigo-200 px-6"
                                                                >
                                                                    扫描更新
                                                                </Button>
                                                            )}
                                                            {extractionSuccess && (
                                                                <Badge variant="success" className="px-3 py-1.5 flex items-center gap-1">
                                                                    <CheckSquare className="w-3.5 h-3.5" /> 画像已更新
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        {extractedData && (
                                                            <div className="bg-white rounded-lg p-4 border border-indigo-100 shadow-sm space-y-4 animate-in slide-in-from-top-2">
                                                                <div className="space-y-3">
                                                                    {extractedData.decisionMakers && extractedData.decisionMakers.length > 0 && (
                                                                        <div className="flex flex-col gap-1 text-sm text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100">
                                                                            <div className="flex items-center gap-2 font-medium">
                                                                                <UserPlus className="w-4 h-4 text-indigo-500" />
                                                                                <span>发现 {extractedData.decisionMakers.length} 位新决策人:</span>
                                                                            </div>
                                                                            <ul className="pl-6 list-disc space-y-1 mt-1 text-xs text-slate-600">
                                                                                {extractedData.decisionMakers.map((dm, idx) => (
                                                                                    <li key={idx}><span className="font-bold text-slate-700">{dm.name}</span> | {dm.title}</li>
                                                                                ))}
                                                                            </ul>
                                                                        </div>
                                                                    )}
                                                                    {extractedData.keyPainPoints && extractedData.keyPainPoints.length > 0 && (
                                                                        <div className="flex flex-col gap-1 text-sm text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100">
                                                                            <div className="flex items-center gap-2 font-medium">
                                                                                <AlertCircle className="w-4 h-4 text-red-500" />
                                                                                <span>识别出 {extractedData.keyPainPoints.length} 个新痛点:</span>
                                                                            </div>
                                                                            <ul className="pl-6 list-disc space-y-1 mt-1 text-xs text-slate-600">
                                                                                {(extractedData.keyPainPoints as unknown as string[]).map((pp, idx) => (
                                                                                    <li key={idx}>{pp}</li>
                                                                                ))}
                                                                            </ul>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <div className="flex justify-end pt-2">
                                                                    <Button size="sm" variant="gradient" onClick={handleAdoptUpdates} icon={ArrowDown}>一键采纳并更新画像</Button>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                                                    <div className="md:col-span-7 space-y-8">
                                                        <div className="bg-white rounded-2xl p-7 border border-slate-200 shadow-sm relative group overflow-hidden">
                                                            <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-500"></div>
                                                            <h4 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-5 flex items-center gap-2">
                                                                <FileText className="w-4 h-4 text-indigo-500" /> AI 总结 / 核心发现
                                                            </h4>
                                                            <div className="prose prose-slate prose-sm max-w-none prose-p:leading-relaxed prose-p:text-slate-700 prose-p:mb-4">
                                                                {editingRecord.content ? (
                                                                    <ReactMarkdown>{editingRecord.content}</ReactMarkdown>
                                                                ) : (
                                                                    <p className="text-slate-400 italic">暂无核心发现内容...</p>
                                                                )}
                                                            </div>
                                                        </div>

                                                        <div className="bg-indigo-50/40 rounded-2xl p-7 border border-indigo-100 shadow-sm ring-1 ring-indigo-50 group">
                                                            <h4 className="text-sm font-black text-indigo-500 uppercase tracking-[0.2em] mb-5 flex items-center gap-2">
                                                                <ListTodo className="w-4 h-4" /> 下一步计划 (Action Items)
                                                            </h4>
                                                            <div className="prose prose-indigo prose-sm max-w-none prose-p:leading-relaxed prose-li:mb-2 prose-strong:text-indigo-900">
                                                                {editingRecord.nextSteps ? (
                                                                    <ReactMarkdown>{editingRecord.nextSteps}</ReactMarkdown>
                                                                ) : (
                                                                    <p className="text-slate-400 italic">尚未明确下一步具体计划。</p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="md:col-span-5 space-y-6">
                                                        {editingRecord.audioUrl && (
                                                            <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 shadow-xl">
                                                                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                                                    <Mic className="w-3.5 h-3.5" /> 录音回放存档
                                                                </div>
                                                                <audio src={editingRecord.audioUrl} controls className="w-full h-9 brightness-90 contrast-125" />
                                                            </div>
                                                        )}
                                                        {editingRecord.images && editingRecord.images.length > 0 && (
                                                            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
                                                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                                                    <ImageIcon className="w-3.5 h-3.5" /> 现场图片附件 ({editingRecord.images.length})
                                                                </div>
                                                                <div className="grid grid-cols-2 gap-3">
                                                                    {editingRecord.images.map((img, idx) => (
                                                                        <div key={idx} className="aspect-square rounded-xl overflow-hidden border border-slate-100 bg-slate-50 cursor-zoom-in hover:opacity-90 transition-opacity">
                                                                            <img src={img} alt="attachment" className="w-full h-full object-cover" />
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {activeTab === 'transcript' && editingRecord.transcript && (
                                            <TranscriptViewer 
                                                transcript={editingRecord.transcript}
                                                speakerMapping={localSpeakerMapping}
                                                stakeholders={customer.persona.decisionMakers}
                                                onMapSpeaker={handleSpeakerMap}
                                                onUpdateTranscript={handleUpdateTranscript}
                                            />
                                        )}
                                    </>
                                )}
                          </div>
                      )}
                  </div>
              </div>
        </div>
    );
};
