import React, { useState, useMemo } from 'react';
import { Customer, PersonaData, Stakeholder } from '../types';
import { extractPersonaData } from '../services/geminiService';
import { StakeholderProfileModal } from './StakeholderProfileModal';

// Sub-components
import { PersonaHeader } from './persona/PersonaHeader';
import { AIQuickFill } from './persona/AIQuickFill';
import { FirmographicsCard } from './persona/FirmographicsCard';
import { CommercialsCard } from './persona/CommercialsCard';
import { StakeholdersCard } from './persona/StakeholdersCard';
import { NeedsCard } from './persona/NeedsCard';
import { StakeholderEditModal } from './persona/StakeholderEditModal';

interface Props {
  customer: Customer;
  onUpdate: (updatedCustomer: Customer) => void;
  onResearchCompetitors?: (competitors: string[]) => void;
}

const PersonaBuilder: React.FC<Props> = ({ customer, onUpdate, onResearchCompetitors }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Modal State
  const [editingStakeholder, setEditingStakeholder] = useState<Partial<Stakeholder> | null>(null);
  const [viewingStakeholder, setViewingStakeholder] = useState<Stakeholder | null>(null);

  // --- Logic ---

  // Calculate Profile Completeness Score
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
      const extracted = await extractPersonaData(rawInput);
      
      const updatedPersona: PersonaData = {
        ...customer.persona,
        industry: extracted.industry || customer.persona.industry,
        companySize: extracted.companySize || customer.persona.companySize,
        budget: extracted.budget || customer.persona.budget,
        projectTimeline: extracted.projectTimeline || customer.persona.projectTimeline,
        currentSolution: extracted.currentSolution || customer.persona.currentSolution,
        keyPainPoints: extracted.keyPainPoints?.length ? [...new Set([...(customer.persona.keyPainPoints || []), ...extracted.keyPainPoints])] : customer.persona.keyPainPoints,
        // For decision makers, append new ones found by AI
        decisionMakers: extracted.decisionMakers?.length ? [...(customer.persona.decisionMakers || []), ...extracted.decisionMakers] : customer.persona.decisionMakers,
        competitors: extracted.competitors?.length ? [...new Set([...(customer.persona.competitors || []), ...extracted.competitors])] : customer.persona.competitors,
      };
      
      onUpdate({
        ...customer,
        persona: updatedPersona
      });
    } catch (e) {
      console.error(e);
      alert("分析失败，请重试");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFieldChange = (field: keyof PersonaData, value: any) => {
    onUpdate({
      ...customer,
      persona: { ...customer.persona, [field]: value }
    });
  };

  // --- Stakeholder Actions ---
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


  return (
    <div className="h-full overflow-y-auto p-1 space-y-6">
      
      <PersonaHeader completeness={completeness} />

      <AIQuickFill 
          onAnalyze={handleAIAnalyze} 
          isAnalyzing={isAnalyzing} 
      />

      {/* Main Form Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <FirmographicsCard 
              industry={customer.persona.industry} 
              companySize={customer.persona.companySize}
              onChange={handleFieldChange} 
          />

          <CommercialsCard 
              budget={customer.persona.budget}
              projectTimeline={customer.persona.projectTimeline}
              competitors={customer.persona.competitors}
              onChange={handleFieldChange}
              onAnalyze={() => {
                  if (onResearchCompetitors && customer.persona.competitors) {
                      onResearchCompetitors(customer.persona.competitors);
                  }
              }}
          />

          <StakeholdersCard 
              stakeholders={customer.persona.decisionMakers}
              onAdd={() => setEditingStakeholder({})}
              onView={setViewingStakeholder}
          />

           <NeedsCard 
              keyPainPoints={customer.persona.keyPainPoints}
              currentSolution={customer.persona.currentSolution}
              onChange={handleFieldChange}
           />

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
      />

    </div>
  );
};

export default PersonaBuilder;