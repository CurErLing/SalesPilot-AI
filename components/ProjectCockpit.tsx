
import React, { useMemo, useState } from 'react';
import { Customer, ViewState, Stakeholder } from '../types';
import { StakeholderProfileModal } from './StakeholderProfileModal';
import { Button } from './ui/Button';
import { AlertTriangle, LayoutGrid, Newspaper } from 'lucide-react';

// Sub-components
import { DealHealthMonitor } from './cockpit/DealHealthMonitor';
import { MeddicRadar } from './cockpit/MeddicRadar';
import { StrategicAdviceCard } from './cockpit/StrategicAdviceCard';
import { ActivityTimelineCard } from './cockpit/ActivityTimelineCard';
import { StakeholderPreviewCard } from './cockpit/StakeholderPreviewCard';
import { QuickActionsCard } from './cockpit/QuickActionsCard';

interface Props {
  customer: Customer;
  onChangeView: (view: ViewState) => void;
}

const ProjectCockpit: React.FC<Props> = ({ customer, onChangeView }) => {
  const [selectedStakeholder, setSelectedStakeholder] = useState<Stakeholder | null>(null);

  // --- Derived Metrics ---
  const daysSinceContact = useMemo(() => {
    const last = new Date(customer.lastContact).getTime();
    const now = new Date().getTime();
    const diff = Math.floor((now - last) / (1000 * 3600 * 24));
    return diff;
  }, [customer.lastContact]);

  const assessment = customer.assessmentResult;
  const latestVisits = customer.visits.slice(0, 3);

  return (
    <div className="h-full overflow-y-auto p-2 space-y-5 animate-in fade-in zoom-in-95 duration-300">
      
      {/* 1. Top: Vital Signs Monitor */}
      <DealHealthMonitor 
          customer={customer} 
          daysSinceContact={daysSinceContact} 
      />

      {/* 2. Main Bento Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
          
          {/* Column A: Strategy & Radar (The "Brain") */}
          <div className="xl:col-span-2 flex flex-col gap-5">
              
              {/* The "Hero" Card: Next Best Action */}
              <StrategicAdviceCard 
                  assessment={assessment}
                  onChangeView={onChangeView}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 h-full">
                  {/* Visual Gaps */}
                  <div className="h-80 md:h-auto">
                      <MeddicRadar 
                          assessment={assessment}
                          onChangeView={onChangeView}
                      />
                  </div>
                  
                  {/* Stakeholders (Power Map Preview) */}
                  <div className="h-full">
                      <StakeholderPreviewCard 
                          stakeholders={customer.persona.decisionMakers}
                          onChangeView={onChangeView}
                          onSelect={setSelectedStakeholder}
                      />
                  </div>
              </div>
          </div>

          {/* Column B: Execution & Context (The "Hands") */}
          <div className="flex flex-col gap-5">
              {/* Quick Launchpad */}
              <QuickActionsCard onChangeView={onChangeView} />

              {/* Feed: Activity & Intelligence */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col flex-1 min-h-[400px]">
                  <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-2xl">
                      <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                          <Newspaper className="w-4 h-4 text-indigo-500" />
                          项目动态流
                      </h3>
                      <Button variant="ghost" size="sm" onClick={() => onChangeView(ViewState.VISIT_RECORDS)} className="h-6 text-xs">全屏</Button>
                  </div>
                  <div className="p-4 flex-1">
                      <ActivityTimelineCard 
                          visits={latestVisits}
                          onChangeView={onChangeView}
                      />
                  </div>
              </div>
          </div>
      </div>

      {/* Stakeholder Profile View Modal */}
      <StakeholderProfileModal 
         isOpen={!!selectedStakeholder}
         onClose={() => setSelectedStakeholder(null)}
         stakeholder={selectedStakeholder}
         customer={customer}
         onEdit={() => {
             setSelectedStakeholder(null);
             onChangeView(ViewState.PERSONA);
         }}
      />
    </div>
  );
};

export default ProjectCockpit;
