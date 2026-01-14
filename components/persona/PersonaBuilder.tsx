
import React, { useState } from 'react';
import { Customer, PersonaData, Stakeholder, PainPoint, Relationship } from '../../types';
import { extractPersonaData } from '../../services/geminiService';
import { mergePersonaWithMetadata } from '../../utils/personaHelper';
import { StakeholderProfileModal } from '../StakeholderProfileModal';

// Sub-components
import { ProjectContextCard } from './ProjectContextCard';
import { CompetitiveLandscapeCard } from './CompetitiveLandscapeCard';
import { StakeholdersCard } from './StakeholdersCard';
import { NeedsCard } from './NeedsCard';
import { StakeholderEditModal } from './StakeholderEditModal';
import { AIQuickFill } from './AIQuickFill';
import { Tabs } from '../ui/Tabs';

// Icons
import { LayoutGrid, Users, Target, Swords } from 'lucide-react';

interface Props {
  customer: Customer;
  onUpdate: (updatedCustomer: Customer) => void;
  onResearchCompetitors?: (competitors: string[]) => void;
}

type TabType = 'OVERVIEW' | 'STAKEHOLDERS' | 'NEEDS' | 'COMPETITION';

export const PersonaBuilder: React.FC<Props> = ({ customer, onUpdate, onResearchCompetitors }) => {
  const [activeTab, setActiveTab] = useState<TabType>('OVERVIEW');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Modal State
  const [editingStakeholder, setEditingStakeholder] = useState<Partial<Stakeholder> | null>(null);
  const [viewingStakeholder, setViewingStakeholder] = useState<Stakeholder | null>(null);

  // --- Logic ---

  const handleAIAnalyze = async (rawInput: string) => {
    setIsAnalyzing(true);
    try {
      const extracted = await extractPersonaData(rawInput, customer.persona);
      
      // Use enhanced helper to merge both simple fields and arrays (PainPoints, Competitors, DMs)
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

  const TAB_ITEMS = [
      { id: 'OVERVIEW', label: '项目概览', icon: LayoutGrid },
      { id: 'STAKEHOLDERS', label: '决策图谱', icon: Users },
      { id: 'NEEDS', label: '需求与痛点', icon: Target },
      { id: 'COMPETITION', label: '竞争格局', icon: Swords },
  ];

  return (
    <div className="h-full flex flex-col overflow-hidden bg-slate-50/30">
      
      {/* 1. Navigation Tabs */}
      <div className="px-6 py-4 flex shrink-0 bg-transparent pt-6">
          <Tabs 
            items={TAB_ITEMS}
            activeId={activeTab}
            onChange={(id) => setActiveTab(id as TabType)}
            variant="pills"
          />
      </div>

      {/* 2. Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto px-6 pb-6 custom-scrollbar">
          <div className="max-w-6xl mx-auto space-y-6">
              
              {activeTab === 'OVERVIEW' && (
                  <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
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
              )}

              {activeTab === 'STAKEHOLDERS' && (
                  <div className="h-full animate-in fade-in slide-in-from-bottom-2 duration-300">
                      <StakeholdersCard 
                          stakeholders={customer.persona.decisionMakers}
                          relationships={customer.persona.relationships}
                          onAdd={() => setEditingStakeholder({})}
                          onView={setViewingStakeholder}
                          onDataChange={handleStakeholderDataChange}
                      />
                  </div>
              )}

              {activeTab === 'NEEDS' && (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                      <div className="lg:col-span-2">
                          <NeedsCard 
                              keyPainPoints={customer.persona.keyPainPoints}
                              currentSolution={customer.persona.currentSolution}
                              customerExpectations={customer.persona.customerExpectations}
                              onChange={handleFieldChange}
                          />
                      </div>
                      <div className="lg:col-span-1 h-full">
                          <AIQuickFill 
                              onAnalyze={handleAIAnalyze}
                              isAnalyzing={isAnalyzing}
                          />
                      </div>
                  </div>
              )}

              {activeTab === 'COMPETITION' && (
                  <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
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
              )}
          </div>
      </div>
      
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
