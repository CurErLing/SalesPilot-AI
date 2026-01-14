
import React, { useState, useMemo } from 'react';
import { Customer, PersonaData, Stakeholder, Relationship, ViewState } from '../../types';
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
import { PersonaGapTracer } from './PersonaGapTracer';

interface Props {
  customer: Customer;
  onUpdate: (updatedCustomer: Customer) => void;
  onResearchCompetitors?: (competitors: string[]) => void;
  onChangeView?: (view: ViewState, params?: any) => void;
}

export const PersonaBuilder: React.FC<Props> = ({ customer, onUpdate, onResearchCompetitors, onChangeView }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const [editingStakeholder, setEditingStakeholder] = useState<Partial<Stakeholder> | null>(null);
  const [viewingStakeholder, setViewingStakeholder] = useState<Stakeholder | null>(null);

  const completeness = useMemo(() => {
    const fields = [
      customer.persona.industry,
      customer.persona.companySize,
      customer.persona.budget,
      customer.persona.projectTimeline,
      customer.persona.currentSolution,
      (customer.persona.keyPainPoints || []).length > 0,
      (customer.persona.decisionMakers || []).length > 0,
      (customer.persona.competitors || []).length > 0
    ];
    const filled = fields.filter(Boolean).length;
    return Math.round((filled / fields.length) * 100);
  }, [customer.persona]);

  const handleAIAnalyze = async (rawInput: string) => {
    setIsAnalyzing(true);
    try {
      const extracted = await extractPersonaData(rawInput, customer.persona);
      const finalPersona = mergePersonaWithMetadata(customer.persona, extracted, "AI 情报碎纸机", false);
      
      onUpdate({
        ...customer,
        persona: finalPersona
      });
    } catch (e) {
      console.error(e);
      alert("分析失败，请重试");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFieldChange = (field: keyof PersonaData | 'projectName', value: any, isVerified: boolean = false) => {
    if (field === 'projectName') {
        onUpdate({ ...customer, projectName: value });
        return;
    }
    
    const newMetadata = { ...(customer.persona._metadata || {}) };
    newMetadata[field as string] = {
        source: isVerified ? "手动核实" : "手动输入",
        timestamp: Date.now(),
        isVerified: isVerified
    };

    onUpdate({
      ...customer,
      persona: { 
          ...customer.persona, 
          [field]: value,
          _metadata: newMetadata
      }
    });
  };

  const handleStatusChange = (newStatus: any) => {
      onUpdate({ ...customer, status: newStatus });
  };

  const handleSaveStakeholder = (data: Partial<Stakeholder>) => {
      if (!data.name) return;
      const newStakeholder = { ...data, id: data.id || Date.now().toString(), role: data.role || 'Unknown', stance: data.stance || 'Neutral' } as Stakeholder;
      const currentList = customer.persona.decisionMakers || [];
      const index = currentList.findIndex(dm => dm.id === newStakeholder.id);
      const newList = index >= 0 ? [...currentList] : [...currentList, newStakeholder];
      if (index >= 0) newList[index] = newStakeholder;
      onUpdate({ ...customer, persona: { ...customer.persona, decisionMakers: newList } });
      setEditingStakeholder(null);
  };

  const handleDeleteStakeholder = (id: string) => {
      onUpdate({ ...customer, persona: { ...customer.persona, decisionMakers: customer.persona.decisionMakers.filter(dm => dm.id !== id) } });
      setEditingStakeholder(null);
  };

  const handleStakeholderDataChange = (updates: { decisionMakers?: Stakeholder[]; relationships?: Relationship[] }) => {
      onUpdate({ ...customer, persona: { ...customer.persona, ...updates } });
  };

  return (
    <div className="h-full flex flex-col overflow-y-auto bg-slate-50/50 custom-scrollbar">
      
      <div className="p-6 pb-0 shrink-0">
          <PersonaHeader 
              customer={customer}
              completeness={completeness} 
          />
      </div>

      <div className="p-6 grid grid-cols-1 xl:grid-cols-12 gap-6 pb-20 items-start">
          
          {/* 左侧区域：画像主体 (8 Cols on XL) */}
          <div className="xl:col-span-8 space-y-6">
              <AIQuickFill 
                  onAnalyze={handleAIAnalyze}
                  isAnalyzing={isAnalyzing}
              />

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

                  <CompetitiveLandscapeCard 
                      competitors={customer.persona.competitors}
                      onChange={(field, val) => handleFieldChange(field as any, val, true)}
                      customer={customer}
                      onAnalyze={() => {
                          if (onResearchCompetitors && customer.persona.competitors) {
                              onResearchCompetitors(customer.persona.competitors);
                          }
                      }}
                  />
              </div>

              <div className="h-[520px]">
                  <StakeholdersCard 
                      stakeholders={customer.persona.decisionMakers}
                      relationships={customer.persona.relationships}
                      onAdd={() => setEditingStakeholder({})}
                      onView={setViewingStakeholder}
                      onDataChange={handleStakeholderDataChange}
                  />
              </div>

              <NeedsCard 
                  keyPainPoints={customer.persona.keyPainPoints}
                  currentSolution={customer.persona.currentSolution}
                  customerExpectations={customer.persona.customerExpectations}
                  onChange={(field, val) => handleFieldChange(field as any, val, true)}
              />
          </div>

          {/* 右侧区域：缺口诊断与行动 (4 Cols on XL) */}
          <div className="xl:col-span-4 sticky top-0 space-y-6">
              <PersonaGapTracer 
                  customer={customer}
                  onChangeView={onChangeView}
              />
              
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">画像维护守则</h3>
                  <ul className="space-y-3">
                      {[
                          { text: "所有 AI 提取的信息必须经过销售人工勾选确认。", color: "text-amber-600" },
                          { text: "项目预算变更必须在 24 小时内更新画像。", color: "text-slate-600" },
                          { text: "关键决策人立场转变需立即运行“陪练模式”。", color: "text-slate-600" }
                      ].map((rule, i) => (
                          <li key={i} className={`text-xs leading-relaxed flex gap-2 ${rule.color}`}>
                              <span className="shrink-0">•</span>
                              {rule.text}
                          </li>
                      ))}
                  </ul>
              </div>
          </div>
      </div>
      
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
