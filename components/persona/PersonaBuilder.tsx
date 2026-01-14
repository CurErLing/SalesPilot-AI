
import React, { useState } from 'react';
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

interface Props {
  customer: Customer;
  onUpdate: (updatedCustomer: Customer) => void;
  onResearchCompetitors?: (competitors: string[]) => void;
}

export const PersonaBuilder: React.FC<Props> = ({ customer, onUpdate, onResearchCompetitors }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const [editingStakeholder, setEditingStakeholder] = useState<Partial<Stakeholder> | null>(null);
  const [viewingStakeholder, setViewingStakeholder] = useState<Stakeholder | null>(null);

  const completeness = React.useMemo(() => {
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
      
      {/* Top Banner Area */}
      <div className="p-6 pb-0 shrink-0">
          <PersonaHeader 
              customer={customer}
              completeness={completeness} 
          />
      </div>

      {/* Main Workspace */}
      <div className="p-6 grid grid-cols-1 xl:grid-cols-12 gap-6 pb-20">
          
          {/* 左侧：核心上下文与竞争 (静态、事实类) */}
          <div className="xl:col-span-5 flex flex-col gap-6">
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

          {/* 右侧：动态情报与权力地图 (高频互动类) */}
          <div className="xl:col-span-7 flex flex-col gap-6">
              {/* Intelligence Input: 放在右侧顶部，作为主要的“喂数据”入口 */}
              <AIQuickFill 
                  onAnalyze={handleAIAnalyze}
                  isAnalyzing={isAnalyzing}
              />

              <div className="h-[520px]">
                  <StakeholdersCard 
                      stakeholders={customer.persona.decisionMakers}
                      relationships={customer.persona.relationships}
                      onAdd={() => setEditingStakeholder({})}
                      onView={setViewingStakeholder}
                      onDataChange={handleStakeholderDataChange}
                  />
              </div>

              <div>
                  <NeedsCard 
                      keyPainPoints={customer.persona.keyPainPoints}
                      currentSolution={customer.persona.currentSolution}
                      customerExpectations={customer.persona.customerExpectations}
                      onChange={(field, val) => handleFieldChange(field as any, val, true)}
                  />
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
