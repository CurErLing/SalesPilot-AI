
import React, { useMemo, useState } from 'react';
import { Customer, ViewState, Stakeholder } from '../types';
import { StakeholderProfileModal } from './StakeholderProfileModal';
import { Button } from './ui/Button';
import { AlertTriangle } from 'lucide-react';

// Sub-components
import { CockpitStatsGrid } from './cockpit/CockpitStatsGrid';
import { MissionBriefingCard } from './cockpit/MissionBriefingCard';
import { ActivityTimelineCard } from './cockpit/ActivityTimelineCard';
import { QuickActionsCard } from './cockpit/QuickActionsCard';
import { StakeholderPreviewCard } from './cockpit/StakeholderPreviewCard';
import { CompetitorSnapshotCard } from './cockpit/CompetitorSnapshotCard';

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

  const latestVisits = customer.visits.slice(0, 3);
  
  const assessment = customer.assessmentResult;
  // Identify gaps from the assessment result
  const assessmentGaps = useMemo(() => {
      if (!assessment) return [];
      return assessment.categories.filter(c => c.status === 'Gap');
  }, [assessment]);

  const hasRisk = useMemo(() => {
      return customer.visits?.some(v => v.sentiment === 'Risk');
  }, [customer.visits]);

  return (
    <div className="h-full overflow-y-auto p-2 space-y-6 animate-in fade-in zoom-in-95 duration-300">
      
      {/* 0. Risk Alert Banner */}
      {hasRisk && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 animate-in slide-in-from-top-2 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
              <div className="p-2 bg-red-100 rounded-full text-red-600 shrink-0">
                  <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="flex-1">
                  <h3 className="text-sm font-bold text-red-800">风险预警：项目健康度受损</h3>
                  <p className="text-xs text-red-600 mt-0.5 font-medium">检测到最新的互动记录中包含“存在风险”标记，建议立即查看拜访详情并制定应对策略。</p>
              </div>
              <Button 
                  size="sm" 
                  className="bg-white text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 shadow-sm"
                  onClick={() => onChangeView(ViewState.VISIT_RECORDS)}
              >
                  查看记录
              </Button>
          </div>
      )}

      {/* 1. Header & Quick Stats Row */}
      <CockpitStatsGrid 
          customer={customer} 
          daysSinceContact={daysSinceContact} 
      />

      {/* 2. Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column (2/3): Situation & Strategy */}
          <div className="lg:col-span-2 space-y-6">
              
              <MissionBriefingCard 
                  assessment={assessment}
                  assessmentGaps={assessmentGaps}
                  onChangeView={onChangeView}
              />

              <ActivityTimelineCard 
                  visits={latestVisits}
                  onChangeView={onChangeView}
              />

          </div>

          {/* Right Column (1/3): Stakeholders & Quick Actions */}
          <div className="space-y-6">
              
              <QuickActionsCard onChangeView={onChangeView} />

              <StakeholderPreviewCard 
                  stakeholders={customer.persona.decisionMakers}
                  onChangeView={onChangeView}
                  onSelect={setSelectedStakeholder}
              />

              <CompetitorSnapshotCard 
                  competitors={customer.persona.competitors}
              />

          </div>
      </div>

      {/* Stakeholder Profile View Modal */}
      <StakeholderProfileModal 
         isOpen={!!selectedStakeholder}
         onClose={() => setSelectedStakeholder(null)}
         stakeholder={selectedStakeholder}
         customer={customer}
         onEdit={() => {
             // Navigate to Persona view to edit (Simpler MVP flow)
             setSelectedStakeholder(null);
             onChangeView(ViewState.PERSONA);
         }}
      />
    </div>
  );
};

export default ProjectCockpit;
