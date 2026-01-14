

export enum ViewState {
  DASHBOARD = 'DASHBOARD',
  PROJECT_COCKPIT = 'PROJECT_COCKPIT',
  PERSONA = 'PERSONA',
  VISIT_RECORDS = 'VISIT_RECORDS',
  WEB_RESEARCH = 'WEB_RESEARCH',
  ASSESSMENT = 'ASSESSMENT',
  STRATEGY = 'STRATEGY',
  ROLE_PLAY = 'ROLE_PLAY',
  CHAT = 'CHAT',
  REVIEW = 'REVIEW'
}

export interface Stakeholder {
  id: string;
  name: string;
  title: string;
  role: 'Economic Buyer' | 'Technical Buyer' | 'User Buyer' | 'Coach' | 'Gatekeeper' | 'Influencer' | 'Unknown';
  stance: 'Champion' | 'Positive' | 'Neutral' | 'Negative' | 'Blocker';
  contact?: string;
  notes?: string;
  reportsTo?: string; // New: ID of the manager
}

export interface PersonaData {
  // Customer Domain
  industry: string;
  companySize: string;
  scenario?: string; // NEW: 业务场景

  // Project Domain
  projectBackground?: string; // NEW: 项目背景与核心需求
  keyPainPoints: string[];
  customerExpectations?: string; // NEW: 客户预期
  budget: string;
  projectTimeline: string;
  decisionMakers: Stakeholder[];

  // Product Domain / Competitive Landscape
  currentSolution: string;
  competitors: string[];
  
  // Strategy
  painPointPitches?: Record<string, string>;
}

export interface VisitRecord {
  id: string;
  date: string;
  type: 'Meeting' | 'Call' | 'Email' | 'Other';
  status: 'Planned' | 'Completed'; // New Field
  title: string;
  
  // Planning Fields (Pre-meeting)
  visitGoal?: string; 
  agendaItems?: string[];
  targetQuestions?: string[]; // AI recommended questions to close gaps
  requiredMaterials?: string[];

  // Execution Fields (Post-meeting)
  content: string; 
  nextSteps?: string;
  sentiment?: 'Positive' | 'Neutral' | 'Negative' | 'Risk';
  transcript?: string;
  speakerMapping?: Record<string, string>;
  stakeholderIds?: string[];
  audioUrl?: string;
  images?: string[];

  // AI Processing State Persistence
  aiStatus?: 'idle' | 'transcribing' | 'reviewing_transcript' | 'analyzing_insights' | 'completed';
}

export interface ResearchNote {
  id: string;
  title: string;
  url?: string;
  content: string;
  timestamp: number;
  iceBreaker?: string;
}

export interface AssessmentResult {
    score: number;
    deal_health: 'Healthy' | 'At Risk' | 'Critical';
    summary: string;
    categories: {
        name: string;
        score: number;
        status: 'Good' | 'Gap';
        evidence: string[];
        missing: string[];
        coaching_tip: string;
    }[];
}

export interface Customer {
  id: string;
  name: string;
  projectName?: string;
  updatedAt?: string;
  status: '线索' | '合格' | '提案' | '谈判' | '赢单' | '输单';
  lastContact: string;
  persona: PersonaData;
  assessmentScore?: number;
  assessmentResult?: AssessmentResult; // NEW: Persist the full result
  notes: string;
  visits: VisitRecord[];
  researchNotes: ResearchNote[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}