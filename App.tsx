
import React, { useState, useEffect } from 'react';
import { ViewState, Customer, Stakeholder } from './types';
import { INITIAL_CUSTOMERS } from './data/mockData';
import { PersonaBuilder } from './components/persona/PersonaBuilder';
import AssessmentView from './components/AssessmentView';
import StrategyView from './components/strategy/StrategyView';
import VisitRecordsView from './components/visit/VisitRecordsView';
import WebResearchView from './components/research/WebResearchView';
import DashboardView from './components/DashboardView';
import ProjectCockpit from './components/ProjectCockpit';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { GlobalChatWidget } from './components/GlobalChatWidget';
import RolePlayView from './components/RolePlayView';

const App: React.FC = () => {
  const [appMode, setAppMode] = useState<'PIPELINE' | 'WORKSPACE'>('PIPELINE');
  const [view, setView] = useState<ViewState>(ViewState.PROJECT_COCKPIT);
  
  // State to hold cross-view editing intent (e.g. from search or external link)
  const [stakeholderToEdit, setStakeholderToEdit] = useState<Stakeholder | null>(null);
  
  // State to hold the research query when transitioning from Persona to Research view
  const [initialResearchQuery, setInitialResearchQuery] = useState<string>('');

  // Initialize from LocalStorage or Fallback to Mocks
  const [customers, setCustomers] = useState<Customer[]>(() => {
    try {
        const saved = localStorage.getItem('salespilot_customers');
        return saved ? JSON.parse(saved) : INITIAL_CUSTOMERS;
    } catch (e) {
        return INITIAL_CUSTOMERS;
    }
  });

  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(() => {
     return customers[0]?.id || '';
  });
  
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  // Persistence Effect
  useEffect(() => {
    localStorage.setItem('salespilot_customers', JSON.stringify(customers));
  }, [customers]);

  const activeCustomer = customers.find(c => c.id === selectedCustomerId) || customers[0];

  const handleUpdateCustomer = (updated: Customer) => {
    setCustomers(prev => prev.map(c => c.id === updated.id ? updated : c));
  };

  const handleSelectCustomer = (id: string) => {
    setSelectedCustomerId(id);
    setAppMode('WORKSPACE');
    setView(ViewState.PROJECT_COCKPIT); // Default to cockpit when selecting a customer
  };

  const handleAddCustomer = (newCustomer: Customer) => {
    setCustomers(prev => [newCustomer, ...prev]);
  };

  // --- Cross-Component Actions ---
  const handleCompetitorResearch = (competitors: string[]) => {
      const query = `Analyze the competitive landscape between ${activeCustomer.name} and ${competitors.join(', ')}. Compare their market share, recent strategic moves, and strengths/weaknesses.`;
      setInitialResearchQuery(query);
      setView(ViewState.WEB_RESEARCH);
  };

  const handleEditStakeholderIntent = (s: Stakeholder) => {
      setStakeholderToEdit(s);
      setView(ViewState.PERSONA);
  };

  if (appMode === 'PIPELINE') {
    return (
      <DashboardView 
        customers={customers}
        onSelectCustomer={handleSelectCustomer}
        onAddCustomer={handleAddCustomer}
      />
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900">
      
      <Sidebar 
        isOpen={isSidebarOpen}
        toggle={() => setSidebarOpen(!isSidebarOpen)}
        currentView={view}
        onViewChange={(v) => {
            setView(v);
            if (v !== ViewState.PERSONA) setStakeholderToEdit(null); // Clear intent if manually switching
        }}
        onBackToPipeline={() => setAppMode('PIPELINE')}
        customerName={activeCustomer?.name || 'Loading...'}
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-white relative">
        
        {activeCustomer && (
          <>
            <Header 
                customer={activeCustomer} 
                onUpdate={handleUpdateCustomer}
                onBack={() => setAppMode('PIPELINE')}
            />

            {/* Content Area */}
            <div className="flex-1 overflow-hidden bg-slate-50/50 p-6">
                <div className="max-w-7xl mx-auto h-full">
                    {view === ViewState.PROJECT_COCKPIT && (
                        <ProjectCockpit 
                            customer={activeCustomer} 
                            onChangeView={setView} 
                            onUpdateCustomer={handleUpdateCustomer}
                        />
                    )}
                    {view === ViewState.PERSONA && (
                        <PersonaBuilder 
                            customer={activeCustomer} 
                            onUpdate={handleUpdateCustomer} 
                            onResearchCompetitors={handleCompetitorResearch}
                            initialStakeholder={stakeholderToEdit}
                            onClearInitialStakeholder={() => setStakeholderToEdit(null)}
                        />
                    )}
                    {view === ViewState.VISIT_RECORDS && (
                        <VisitRecordsView customer={activeCustomer} onUpdate={handleUpdateCustomer} />
                    )}
                    {view === ViewState.WEB_RESEARCH && (
                        <WebResearchView 
                            customer={activeCustomer} 
                            onUpdate={handleUpdateCustomer} 
                            initialQuery={initialResearchQuery}
                        />
                    )}
                    {view === ViewState.ASSESSMENT && (
                        <AssessmentView 
                            customer={activeCustomer} 
                            onUpdate={handleUpdateCustomer}
                        />
                    )}
                    {view === ViewState.STRATEGY && (
                        <StrategyView 
                            customer={activeCustomer} 
                            onUpdate={handleUpdateCustomer} 
                            onChangeView={setView}
                        />
                    )}
                    {view === ViewState.ROLE_PLAY && (
                        <RolePlayView customer={activeCustomer} />
                    )}
                </div>
            </div>

            {/* Global Chat / Copilot Widget */}
            <GlobalChatWidget customer={activeCustomer} />
          </>
        )}
      </main>
    </div>
  );
};

export default App;
