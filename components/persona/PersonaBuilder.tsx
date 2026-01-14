
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Customer, PersonaData, Stakeholder, Relationship } from '../../types';
import { extractPersonaData } from '../../services/geminiService';
import { mergePersonaWithMetadata } from '../../utils/personaHelper';
import { StakeholderProfileModal } from '../StakeholderProfileModal';

// Sub-components
import { PersonaHeader } from './PersonaHeader';
import { ProjectContextCard } from './ProjectContextCard';
import { CompetitiveLandscapeCard } from './CompetitiveLandscapeCard';
import { StakeholdersCard } from './StakeholdersCard';
import { NeedsCard } from './NeedsCard';
import { StakeholderEditModal } from './StakeholderEditModal';
import { AIQuickFill } from './AIQuickFill';
import { LayoutGrid, Users, Target, Swords, AlertCircle, CheckCircle2, Sparkles } from 'lucide-react';

interface Props {
  customer: Customer;
  onUpdate: (updatedCustomer: Customer) => void;
  onResearchCompetitors?: (competitors: string[]) => void;
  initialStakeholder?: Stakeholder | null; // Intent to edit from other view
  onClearInitialStakeholder?: () => void;
}

export const PersonaBuilder: React.FC<Props> = ({ 
    customer, 
    onUpdate, 
    onResearchCompetitors, 
    initialStakeholder,
    onClearInitialStakeholder
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeSection, setActiveSection] = useState('context');
  const isManualScrolling = useRef(false);
  
  // Modal State
  const [editingStakeholder, setEditingStakeholder] = useState<Partial<Stakeholder> | null>(null);
  const [viewingStakeholder, setViewingStakeholder] = useState<Stakeholder | null>(null);

  // Refs
  const mainContainerRef = useRef<HTMLDivElement>(null);
  const sectionRefs = {
    context: useRef<HTMLDivElement>(null),
    stakeholders: useRef<HTMLDivElement>(null),
    needs: useRef<HTMLDivElement>(null),
    competition: useRef<HTMLDivElement>(null),
  };

  // --- Handle cross-view editing intent ---
  useEffect(() => {
    if (initialStakeholder) {
        setEditingStakeholder(initialStakeholder);
        setActiveSection('stakeholders');
        // Scroll to stakeholders section if not already there
        sectionRefs.stakeholders.current?.scrollIntoView({ behavior: 'smooth' });
        
        // Clean up the intent so it doesn't re-trigger
        if (onClearInitialStakeholder) onClearInitialStakeholder();
    }
  }, [initialStakeholder]);

  // --- ScrollSpy Logic ---
  useEffect(() => {
    const observerOptions = {
      root: mainContainerRef.current,
      rootMargin: '-10% 0px -70% 0px', 
      threshold: 0
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      if (isManualScrolling.current) return;

      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    Object.values(sectionRefs).forEach(ref => {
      if (ref.current) observer.observe(ref.current);
    });

    return () => observer.disconnect();
  }, []);

  const scrollToSection = (id: string) => {
    isManualScrolling.current = true;
    setActiveSection(id);
    
    sectionRefs[id as keyof typeof sectionRefs].current?.scrollIntoView({ 
      behavior: 'smooth', 
      block: 'start' 
    });

    setTimeout(() => {
      isManualScrolling.current = false;
    }, 1000); 
  };

  // --- Data Logic ---
  const stats = useMemo(() => {
    const p = customer.persona;
    const decisionMakers = p.decisionMakers || [];
    return {
      hasEB: decisionMakers.some(dm => dm.role === 'Economic Buyer'),
      hasChampion: decisionMakers.some(dm => dm.stance === 'Champion'),
      hasPain: (p.keyPainPoints || []).length > 0,
      hasBudget: !!p.budget,
      completeness: Math.round((
        [p.industry, p.budget, p.projectTimeline, p.currentSolution, (p.keyPainPoints || []).length > 0, (p.decisionMakers || []).length > 0].filter(Boolean).length / 6
      ) * 100)
    };
  }, [customer.persona]);

  const handleAIAnalyze = async (rawInput: string) => {
    setIsAnalyzing(true);
    try {
      const extracted = await extractPersonaData(rawInput, customer.persona);
      const finalPersona = mergePersonaWithMetadata(customer.persona, extracted, "AI 快速归档");
      onUpdate({ ...customer, persona: finalPersona });
    } catch (e) {
      console.error(e);
      alert("分析失败");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFieldChange = (field: keyof PersonaData | 'projectName', value: any) => {
    if (field === 'projectName') {
        onUpdate({ ...customer, projectName: value });
        return;
    }
    onUpdate({
      ...customer,
      persona: { ...customer.persona, [field]: value }
    });
  };

  const handleStatusChange = (newStatus: any) => {
      onUpdate({ ...customer, status: newStatus });
  };

  const handleSaveStakeholder = (data: Partial<Stakeholder>) => {
      if (!data.name) return;
      const newStakeholder = {
          ...data,
          id: data.id || Date.now().toString(),
          role: data.role || 'Unknown',
          stance: data.stance || 'Neutral'
      } as Stakeholder;
      const currentList = customer.persona.decisionMakers || [];
      const index = currentList.findIndex(dm => dm.id === newStakeholder.id);
      let newList = index >= 0 ? [...currentList] : [...currentList, newStakeholder];
      if (index >= 0) newList[index] = newStakeholder;
      handleFieldChange('decisionMakers', newList);
      setEditingStakeholder(null);
  };

  const handleDeleteStakeholder = (id: string) => {
      const newList = customer.persona.decisionMakers.filter(dm => dm.id !== id);
      handleFieldChange('decisionMakers', newList);
      setEditingStakeholder(null);
  };

  const handleStakeholderDataChange = (updates: { decisionMakers?: Stakeholder[]; relationships?: Relationship[] }) => {
      const newPersona = { ...customer.persona };
      if (updates.decisionMakers) newPersona.decisionMakers = updates.decisionMakers;
      if (updates.relationships) newPersona.relationships = updates.relationships;
      onUpdate({ ...customer, persona: newPersona });
  };

  const navItems = [
    { id: 'context', label: '项目背景', icon: LayoutGrid, isCritical: !stats.hasBudget },
    { id: 'stakeholders', label: '决策链图谱', icon: Users, isCritical: !stats.hasEB || !stats.hasChampion },
    { id: 'needs', label: '痛点与预期', icon: Target, isCritical: !stats.hasPain },
    { id: 'competition', label: '竞争格局', icon: Swords, isCritical: false },
  ];

  return (
    <div className="h-full flex bg-slate-50/50 overflow-hidden relative">
      
      {/* 1. LEFT: Navigator */}
      <aside className="w-64 border-r border-slate-200 bg-white flex flex-col shrink-0">
          <div className="p-6 border-b border-slate-100">
              <div className="flex justify-between items-end mb-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">画像完善度</span>
                  <span className="text-sm font-black text-indigo-600">{stats.completeness}%</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-indigo-600 h-full transition-all duration-1000" style={{ width: `${stats.completeness}%` }}></div>
              </div>
          </div>
          
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
              {navItems.map(item => (
                  <button
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl transition-all group ${activeSection === item.id ? 'bg-indigo-50 text-indigo-700 shadow-sm ring-1 ring-indigo-100' : 'text-slate-500 hover:bg-slate-50'}`}
                  >
                      <div className="flex items-center gap-3">
                          <item.icon className={`w-4 h-4 ${activeSection === item.id ? 'text-indigo-600' : 'text-slate-400'}`} />
                          <span className="text-sm font-bold">{item.label}</span>
                      </div>
                      {item.isCritical && <AlertCircle className="w-3.5 h-3.5 text-amber-500" />}
                      {!item.isCritical && activeSection !== item.id && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 opacity-0 group-hover:opacity-100" />}
                  </button>
              ))}
          </nav>

          <div className="p-4 border-t border-slate-100">
              <div className="bg-indigo-50 rounded-xl p-4">
                  <h4 className="text-[10px] font-bold text-indigo-600 uppercase mb-2 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> 补齐建议
                  </h4>
                  <p className="text-[11px] text-indigo-800 leading-relaxed font-medium">
                      {!stats.hasBudget ? "• 尚未记录项目预算。" : !stats.hasEB ? "• 尚未识别 EB。" : "• 当前画像健康。"}
                  </p>
              </div>
          </div>
      </aside>

      {/* 2. CENTER: Scrollable Content Area */}
      <main 
        ref={mainContainerRef}
        className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50/50 p-8 scroll-smooth"
      >
          <div className="max-w-4xl mx-auto space-y-12 pb-32">
              
              <PersonaHeader 
                  completeness={stats.completeness} 
                  hasRisk={customer.visits.some(v => v.sentiment === 'Risk')}
              />

              <AIQuickFill onAnalyze={handleAIAnalyze} isAnalyzing={isAnalyzing} />

              {/* Section: Context */}
              <section id="context" ref={sectionRefs.context} className="scroll-mt-8 space-y-4">
                   <div className="flex items-center justify-between px-2">
                      <h3 className="font-bold text-slate-800 flex items-center gap-2">
                          <LayoutGrid className="w-5 h-5 text-blue-500" /> 项目概况
                      </h3>
                      {!stats.hasBudget && <span className="text-[10px] font-bold text-amber-500 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" /> 预算/时间未确认</span>}
                  </div>
                  <ProjectContextCard 
                      projectName={customer.projectName}
                      projectBackground={customer.persona.projectBackground}
                      status={customer.status}
                      companyName={customer.name}
                      industry={customer.persona.industry} 
                      companySize={customer.persona.companySize}
                      scenario={customer.persona.scenario}
                      budget={customer.persona.budget}
                      projectTimeline={customer.persona.projectTimeline}
                      metadata={customer.persona._metadata}
                      onChange={handleFieldChange}
                      onStatusChange={handleStatusChange}
                  />
              </section>

              {/* Section: Stakeholders */}
              <section id="stakeholders" ref={sectionRefs.stakeholders} className="scroll-mt-8 space-y-4">
                  <div className="flex items-center justify-between px-2">
                      <h3 className="font-bold text-slate-800 flex items-center gap-2">
                          <Users className="w-5 h-5 text-indigo-500" /> 决策链图谱
                      </h3>
                      {!stats.hasEB && <span className="text-[10px] font-bold text-red-500 flex items-center gap-1 animate-pulse"><AlertCircle className="w-3.5 h-3.5" /> 关键角色缺失</span>}
                  </div>
                  <StakeholdersCard 
                      stakeholders={customer.persona.decisionMakers}
                      relationships={customer.persona.relationships}
                      onAdd={() => setEditingStakeholder({})}
                      onView={setViewingStakeholder}
                      onDataChange={handleStakeholderDataChange}
                  />
              </section>

              {/* Section: Needs */}
              <section id="needs" ref={sectionRefs.needs} className="scroll-mt-8 space-y-4">
                  <div className="flex items-center justify-between px-2">
                      <h3 className="font-bold text-slate-800 flex items-center gap-2">
                          <Target className="w-5 h-5 text-red-500" /> 需求与痛点
                      </h3>
                  </div>
                  <NeedsCard 
                      keyPainPoints={customer.persona.keyPainPoints}
                      currentSolution={customer.persona.currentSolution}
                      customerExpectations={customer.persona.customerExpectations}
                      onChange={handleFieldChange}
                  />
              </section>

              {/* Section: Competition */}
              <section id="competition" ref={sectionRefs.competition} className="scroll-mt-8 space-y-4">
                   <div className="flex items-center justify-between px-2">
                      <h3 className="font-bold text-slate-800 flex items-center gap-2">
                          <Swords className="w-5 h-5 text-orange-500" /> 竞争格局
                      </h3>
                  </div>
                  <CompetitiveLandscapeCard 
                      competitors={customer.persona.competitors}
                      onChange={handleFieldChange}
                      customer={customer}
                      onAnalyze={() => onResearchCompetitors?.(customer.persona.competitors)}
                  />
              </section>
          </div>
      </main>

      {/* Modals */}
      <StakeholderProfileModal 
         isOpen={!!viewingStakeholder}
         onClose={() => setViewingStakeholder(null)}
         stakeholder={viewingStakeholder}
         customer={customer}
         onEdit={(stakeholder) => setEditingStakeholder(stakeholder)}
      />

      <StakeholderEditModal
        isOpen={!!editingStakeholder}
        onClose={() => setEditingStakeholder(null)}
        initialData={editingStakeholder}
        onSave={handleSaveStakeholder}
        onDelete={handleDeleteStakeholder}
        allStakeholders={customer.persona.decisionMakers}
      />
    </div>
  );
};
