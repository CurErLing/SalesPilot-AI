
import React, { useState, useEffect } from 'react';
import { Customer, ResearchNote, PersonaData } from '../../types';
import { performWebResearch, extractPersonaData, generateIceBreaker } from '../../services/geminiService';
import { Search, Globe, Check } from 'lucide-react';
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
      // Removed automatic execution to allow user to review/edit prompt
  };

  const handleSaveNote = () => {
    if (!result) return;
    
    const newNote: ResearchNote = {
        id: Date.now().toString(),
        title: query || "AI 智能调研",
        content: result.text,
        timestamp: Date.now(),
        url: result.sources.length > 0 ? result.sources[0].uri : undefined
    };

    const updatedNotes = [newNote, ...(customer.researchNotes || [])];
    onUpdate({ ...customer, researchNotes: updatedNotes });
    setQuery('');
    setResult(null);
    setActionSuccessMsg("情报已存入金库 (右侧栏查看)");
    setTimeout(() => setActionSuccessMsg(null), 3000);
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
          
          const updatedPersona: PersonaData = {
            ...customer.persona,
            industry: extracted.industry || customer.persona.industry,
            companySize: extracted.companySize || customer.persona.companySize,
            budget: extracted.budget || customer.persona.budget,
            projectTimeline: extracted.projectTimeline || customer.persona.projectTimeline,
            currentSolution: extracted.currentSolution || customer.persona.currentSolution,
            keyPainPoints: extracted.keyPainPoints?.length ? [...new Set([...(customer.persona.keyPainPoints || []), ...extracted.keyPainPoints])] : customer.persona.keyPainPoints,
            decisionMakers: extracted.decisionMakers?.length ? [...new Set([...(customer.persona.decisionMakers || []), ...extracted.decisionMakers])] : customer.persona.decisionMakers,
            competitors: extracted.competitors?.length ? [...new Set([...(customer.persona.competitors || []), ...extracted.competitors])] : customer.persona.competitors,
          };

          onUpdate({ ...customer, persona: updatedPersona });
          setActionSuccessMsg("已提取并更新画像");
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
          
          setActionSuccessMsg("话术已保存");
          setTimeout(() => setActionSuccessMsg(null), 2000);
      } catch (e) {
          console.error(e);
      } finally {
          setProcessingNoteId(null);
      }
  };

  return (
    <div className="h-full flex flex-col lg:flex-row overflow-hidden bg-slate-50/50">
       
       {/* LEFT COLUMN: WORKSPACE (70%) */}
       <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
          
          {/* Header & Scenarios */}
          <div className="p-6 pb-2 space-y-6 overflow-y-auto custom-scrollbar">
              <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                         <Globe className="w-6 h-6 text-indigo-500" />
                         全网智能调研
                    </h2>
                    <p className="text-sm text-slate-500">基于客户上下文的深度搜索与洞察。</p>
                </div>
              </div>
              
              <WebResearchAgents 
                  customer={customer}
                  loading={loading}
                  activeScenarioId={activeScenario}
                  onSelectScenario={handleSelectScenario}
              />

              {/* Search Bar */}
              <div className="flex gap-3 bg-white p-2 rounded-xl border border-slate-200 shadow-sm focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition-all">
                  <div className="relative flex-1">
                      <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                      <input 
                          type="text" 
                          placeholder="输入关键词或自定义调研问题..."
                          className="w-full pl-10 pr-4 py-2.5 outline-none bg-transparent text-sm font-medium text-slate-700 placeholder:font-normal"
                          value={query}
                          onChange={(e) => {
                              setQuery(e.target.value);
                              if (activeScenario) setActiveScenario(null); // Clear selection on manual edit
                          }}
                          onKeyDown={(e) => e.key === 'Enter' && executeSearch(query)}
                      />
                  </div>
                  <Button 
                      onClick={() => executeSearch(query)}
                      disabled={loading || !query.trim()}
                      className="rounded-lg px-6"
                      isLoading={loading}
                  >
                      搜索
                  </Button>
              </div>
          </div>

          {/* Results Area (Flex Grow) */}
          <div className="flex-1 overflow-y-auto px-6 pb-6 custom-scrollbar">
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
           <div className="fixed bottom-6 right-6 lg:right-[400px] bg-emerald-600 text-white px-4 py-2 rounded-lg shadow-lg animate-in slide-in-from-bottom-4 flex items-center gap-2 z-50 text-sm font-medium pointer-events-none">
               <Check className="w-4 h-4" />
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
