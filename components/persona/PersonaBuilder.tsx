
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
  
  // Modal State
  const [editingStakeholder, setEditingStakeholder] = useState<Partial<Stakeholder> | null>(null);
  const [viewingStakeholder, setViewingStakeholder] = useState<Stakeholder | null>(null);

  // --- Logic ---

  // Calculate Profile Completeness Score
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
      const finalPersona = mergePersonaWithMetadata(customer.persona, extracted, "AI Quick Fill");
      
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
      
      let newList;
      if (index >= 0) {
          newList = [...currentList];
          newList[index] = newStakeholder;
      } else {
          newList = [...currentList, newStakeholder];
      }

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

  return (
    <div className="h-full flex flex-col overflow-y-auto bg-slate-50/50 p-2 custom-scrollbar">
      
      {/* 1. Header Section */}
      <div className="mb-6 shrink-0">
          <PersonaHeader 
              completeness={completeness} 
              hasRisk={customer.visits.some(v => v.sentiment === 'Risk')}
          />
      </div>

      {/* 2. Main Dashboard Grid (The "Dossier" Layout) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 pb-10">
          
          {/* LEFT COLUMN: The "Hard" Facts (Project, Budget, Competition) - 5 Cols */}
          <div className="xl:col-span-5 flex flex-col gap-6">
              
              {/* Project Context (The Core) */}
              <div className="animate-in fade-in slide-in-from-left-2 duration-300">
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
              </div>

              {/* Competitive Landscape */}
              <div className="animate-in fade-in slide-in-from-left-2 duration-300 delay-100">
                  <CompetitiveLandscapeCard 
                      competitors={customer.persona.competitors}
                      onChange={handleFieldChange}
                      customer={customer}
                      onAnalyze={() => {
                          if (onResearchCompetitors && customer.persona.competitors) {
                              onResearchCompetitors(customer.persona.competitors);
                          }
                      }}
                  />
              </div>
          </div>

          {/* RIGHT COLUMN: The "Soft" Intelligence (Input, People, Pain) - 7 Cols */}
          <div className="xl:col-span-7 flex flex-col gap-6">
              
              {/* AI Intelligence Input (Top for accessibility) */}
              <div className="h-auto animate-in fade-in slide-in-from-right-2 duration-300">
                  <AIQuickFill 
                      onAnalyze={handleAIAnalyze}
                      isAnalyzing={isAnalyzing}
                  />
              </div>

              {/* Stakeholder Map (Needs width for chart) */}
              <div className="h-[500px] animate-in fade-in slide-in-from-right-2 duration-300 delay-75">
                  <StakeholdersCard 
                      stakeholders={customer.persona.decisionMakers}
                      relationships={customer.persona.relationships}
                      onAdd={() => setEditingStakeholder({})}
                      onView={setViewingStakeholder}
                      onDataChange={handleStakeholderDataChange}
                  />
              </div>

              {/* Needs & Pain Points */}
              <div className="h-[400px] animate-in fade-in slide-in-from-right-2 duration-300 delay-150">
                  <NeedsCard 
                      keyPainPoints={customer.persona.keyPainPoints}
                      currentSolution={customer.persona.currentSolution}
                      customerExpectations={customer.persona.customerExpectations}
                      onChange={handleFieldChange}
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
