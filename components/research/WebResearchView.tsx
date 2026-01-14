
import React, { useState, useEffect } from 'react';
import { Customer, ResearchNote, PersonaData, PainPoint } from '../../types';
import { performWebResearch, extractPersonaData, generateIceBreaker } from '../../services/geminiService';
import { mergePersonaWithMetadata } from '../../utils/personaHelper';
import { Search, Globe, Check, Command } from 'lucide-react';
import { Button } from '../ui/Button';

// Sub-components
import { WebResearchAgents } from './WebResearchAgents';
import { WebResearchResult } from './WebResearchResult';
import { ResearchNoteList } from './ResearchNoteList';
import { ResearchNoteDetail } from './ResearchNoteDetail';

interface Props {
  customer: Customer;
  onUpdate: (customer: Customer) => void;
  initialQuery?: string; // New prop
}

const WebResearchView: React.FC<Props> = ({ customer, onUpdate, initialQuery }) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeScenario, setActiveScenario] = useState<string | null>(null);
  const [result, setResult] = useState<{ text: string; sources: { title: string; uri: string }[] } | null>(null);
  
  // Action States
  const [processingNoteId, setProcessingNoteId] = useState<string | null>(null);
  const [viewingNote, setViewingNote] = useState<ResearchNote | null>(null); // For detail modal
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  // --- Logic ---
  
  // Auto-execute if initialQuery is provided
  useEffect(() => {
    if (initialQuery && initialQuery !== query) {
        setQuery(initialQuery);
        executeSearch(initialQuery);
    }
  }, [initialQuery]);

  const executeSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    setResult(null);

    try {
        const data = await performWebResearch(searchQuery);
        setResult(data);
    } catch (e) {
        console.error(e);
    } finally {
        setLoading(false);
    }
  };

  const handleSelectScenario = (prompt: string, id: string) => {
      setQuery(prompt);
      setActiveScenario(id);
      executeSearch(prompt); // Auto execute for smoother flow
  };

  const handleSaveNote = () => {
    if (!result) return;
    
    const newNote: ResearchNote = {
        id: Date.now().toString(),
        title: activeScenario ? `情报：${scenariosMap[activeScenario]}` : (query.length > 20 ? query.substring(0, 20) + '...' : query),
        content: result.text,
        timestamp: Date.now(),
        url: result.sources.length > 0 ? result.sources[0].uri : undefined
    };

    const updatedNotes = [newNote, ...(customer.researchNotes || [])];
    onUpdate({ ...customer, researchNotes: updatedNotes });
    setQuery('');
    setResult(null);
    setActiveScenario(null);
    setActionSuccessMsg("情报已归档至金库");
    setTimeout(() => setActionSuccessMsg(null), 3000);
  };

  // Helper for title mapping
  const scenariosMap: Record<string, string> = {
      'news': '近期动态侦察',
      'competitors': '竞品攻防分析',
      'executives': '关键人画像',
      'painpoints': '痛点雷达扫描'
  };

  const handleDeleteNote = (id: string) => {
      const updatedNotes = customer.researchNotes.filter(n => n.id !== id);
      onUpdate({ ...customer, researchNotes: updatedNotes });
      if (viewingNote?.id === id) setViewingNote(null);
  };

  // --- Downstream Actions ---

  const handleExtractToPersona = async (note: ResearchNote) => {
      setProcessingNoteId(note.id);
      try {
          const extracted = await extractPersonaData(note.content);
          
          const sourceLabel = `Research: ${note.title.substring(0, 15)}...`;

          // Use enhanced helper to merge both simple fields and arrays (PainPoints, Competitors, DMs)
          const updatedPersona = mergePersonaWithMetadata(customer.persona, extracted, sourceLabel);

          onUpdate({ ...customer, persona: updatedPersona });
          setActionSuccessMsg("画像已更新");
          setTimeout(() => setActionSuccessMsg(null), 3000);
      } catch (e) {
          console.error(e);
          alert("提取失败");
      } finally {
          setProcessingNoteId(null);
      }
  };

  const handleGenerateIceBreaker = async (note: ResearchNote) => {
      setProcessingNoteId(note.id);
      try {
          const text = await generateIceBreaker(note.content, customer);
          
          const updatedNotes = customer.researchNotes.map(n => 
              n.id === note.id ? { ...n, iceBreaker: text } : n
          );
          onUpdate({ ...customer, researchNotes: updatedNotes });
          
          // Update the currently viewed note if open
          if (viewingNote?.id === note.id) {
              setViewingNote({ ...note, iceBreaker: text });
          }
          
          setActionSuccessMsg("话术已生成");
          setTimeout(() => setActionSuccessMsg(null), 2000);
      } catch (e) {
          console.error(e);
      } finally {
          setProcessingNoteId(null);
      }
  };

  return (
    <div className="h-full flex flex-col lg:flex-row overflow-hidden bg-slate-50/50 gap-6 p-6">
       
       {/* LEFT COLUMN: WORKSPACE (70%) */}
       <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden gap-6">
          
          {/* Header & Controls */}
          <div className="shrink-0 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-extrabold text-slate-800 flex items-center gap-2">
                         <Globe className="w-7 h-7 text-indigo-600" />
                         情报指挥中心
                    </h2>
                    <p className="text-sm text-slate-500 font-medium mt-1">
                        AI 驱动的全网深度侦察，从海量信息中提炼赢单线索。
                    </p>
                </div>
              </div>
              
              <WebResearchAgents 
                  customer={customer}
                  loading={loading}
                  activeScenarioId={activeScenario}
                  onSelectScenario={handleSelectScenario}
              />

              {/* Search Bar */}
              <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl opacity-20 group-hover:opacity-40 transition duration-500 blur"></div>
                  <div className="relative flex gap-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition-all">
                      <div className="relative flex-1">
                          <Command className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                          <input 
                              type="text" 
                              placeholder="输入自定义侦察指令（例如：查询该公司的 IT 招标历史...）"
                              className="w-full pl-12 pr-4 py-3 outline-none bg-transparent text-sm font-medium text-slate-700 placeholder:font-normal"
                              value={query}
                              onChange={(e) => {
                                  setQuery(e.target.value);
                                  if (activeScenario) setActiveScenario(null); 
                              }}
                              onKeyDown={(e) => e.key === 'Enter' && executeSearch(query)}
                          />
                      </div>
                      <Button 
                          onClick={() => executeSearch(query)}
                          disabled={loading || !query.trim()}
                          className="rounded-xl px-8 shadow-md"
                          isLoading={loading}
                      >
                          {loading ? '侦察中...' : '执行'}
                      </Button>
                  </div>
              </div>
          </div>

          {/* Results Area (Flex Grow) */}
          <div className="flex-1 min-h-0">
             <WebResearchResult 
                 loading={loading}
                 result={result}
                 onSave={handleSaveNote}
             />
          </div>
       </div>

       {/* RIGHT COLUMN: INTELLIGENCE VAULT (30%) */}
       <ResearchNoteList 
           notes={customer.researchNotes}
           onView={setViewingNote}
           onDelete={handleDeleteNote}
           onGenerateIceBreaker={(note, e) => {
               e.stopPropagation();
               handleGenerateIceBreaker(note);
           }}
           processingNoteId={processingNoteId}
       />

       {/* Toast Notification */}
       {actionSuccessMsg && (
           <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-6 py-3 rounded-full shadow-2xl animate-in slide-in-from-bottom-4 flex items-center gap-3 z-50 text-sm font-medium pointer-events-none">
               <div className="bg-emerald-500 rounded-full p-0.5">
                   <Check className="w-3 h-3 text-white" />
               </div>
               {actionSuccessMsg}
           </div>
       )}

       {/* Note Detail Modal */}
       <ResearchNoteDetail 
           note={viewingNote}
           onClose={() => setViewingNote(null)}
           onExtractPersona={handleExtractToPersona}
           onGenerateIceBreaker={handleGenerateIceBreaker}
           processingNoteId={processingNoteId}
           setActionSuccessMsg={setActionSuccessMsg}
       />
    </div>
  );
};

export default WebResearchView;
