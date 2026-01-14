
import React, { useState, useMemo } from 'react';
import { Customer, PersonaData, Stakeholder } from '../../types';
import { extractPersonaData } from '../../services/geminiService';
import { StakeholderProfileModal } from '../StakeholderProfileModal';

// Sub-components
import { ProjectContextCard } from './ProjectContextCard';
import { CompetitiveLandscapeCard } from './CompetitiveLandscapeCard';
import { StakeholdersCard } from './StakeholdersCard';
import { NeedsCard } from './NeedsCard';
import { StakeholderEditModal } from './StakeholderEditModal';
import { AIQuickFill } from './AIQuickFill';
import { PersonaHeader } from './PersonaHeader';

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

  // Calculate Profile Completeness Score (moved from previous version for header)
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

  const hasRisk = useMemo(() => {
      return customer.visits?.some(v => v.sentiment === 'Risk');
  }, [customer.visits]);

  const handleAIAnalyze = async (rawInput: string) => {
    setIsAnalyzing(true);
    try {
      // Pass the current persona so AI can do delta updates and arithmetic
      const extracted = await extractPersonaData(rawInput, customer.persona);
      
      const updatedPersona: PersonaData = {
        ...customer.persona,
        industry: extracted.industry || customer.persona.industry,
        companySize: extracted.companySize || customer.persona.companySize,
        scenario: extracted.scenario || customer.persona.scenario,
        projectBackground: extracted.projectBackground || customer.persona.projectBackground,
        budget: extracted.budget || customer.persona.budget,
        projectTimeline: extracted.projectTimeline || customer.persona.projectTimeline,
        currentSolution: extracted.currentSolution || customer.persona.currentSolution,
        customerExpectations: extracted.customerExpectations || customer.persona.customerExpectations,
        
        // Arrays: Merge new items with existing items
        keyPainPoints: extracted.keyPainPoints?.length ? [...new Set([...(customer.persona.keyPainPoints || []), ...extracted.keyPainPoints])] : customer.persona.keyPainPoints,
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

  // --- Render Tabs (Modern Segmented Control) ---
  const renderTabButton = (id: TabType, label: string, icon: React.ElementType) => {
      const isActive = activeTab === id;
      const Icon = icon;
      return (
          <button
              onClick={() => setActiveTab(id)}
              className={`
                  flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200
                  ${isActive 
                      ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200' 
                      : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}
              `}
          >
              <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
              {label}
          </button>
      );
  };

  return (
    <div className="h-full flex flex-col overflow-hidden bg-slate-50/30">
      
      {/* 1. Header with Completeness & Risk Warning */}
      <div className="px-6 pt-6 shrink-0">
          <PersonaHeader completeness={completeness} hasRisk={hasRisk} />
      </div>

      {/* 2. Navigation Tabs (Pill Style Container) */}
      <div className="px-6 py-4 flex shrink-0 bg-transparent">
          <div className="flex p-1 bg-slate-100 rounded-xl border border-slate-200/60">
            {renderTabButton('OVERVIEW', '项目概览', LayoutGrid)}
            {renderTabButton('STAKEHOLDERS', '决策图谱', Users)}
            {renderTabButton('NEEDS', '需求与痛点', Target)}
            {renderTabButton('COMPETITION', '竞争格局', Swords)}
          </div>
      </div>

      {/* 3. Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto px-6 pb-6 custom-scrollbar">
          <div className="max-w-6xl mx-auto space-y-6">
              
              {/* TAB: OVERVIEW */}
              {activeTab === 'OVERVIEW' && (
                  <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                      <ProjectContextCard 
                          // Identity
                          projectName={customer.projectName}
                          projectBackground={customer.persona.projectBackground}
                          status={customer.status}
                          companyName={customer.name}
                          
                          // Firmographics
                          industry={customer.persona.industry} 
                          companySize={customer.persona.companySize}
                          scenario={customer.persona.scenario}
                          
                          // Commercials
                          budget={customer.persona.budget}
                          projectTimeline={customer.persona.projectTimeline}
                          
                          // Handlers
                          onChange={handleFieldChange}
                          onStatusChange={handleStatusChange}
                      />
                  </div>
              )}

              {/* TAB: STAKEHOLDERS */}
              {activeTab === 'STAKEHOLDERS' && (
                  <div className="h-full animate-in fade-in slide-in-from-bottom-2 duration-300">
                      <StakeholdersCard 
                          stakeholders={customer.persona.decisionMakers}
                          onAdd={() => setEditingStakeholder({})}
                          onView={setViewingStakeholder}
                      />
                  </div>
              )}

              {/* TAB: NEEDS (Redesigned with AI on Right) */}
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

              {/* TAB: COMPETITION */}
              {activeTab === 'COMPETITION' && (
                  <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                      <CompetitiveLandscapeCard 
                          competitors={customer.persona.competitors}
                          onChange={handleFieldChange}
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
        allStakeholders={customer.persona.decisionMakers} // Pass full list for manager selection
      />

    </div>
  );
};
