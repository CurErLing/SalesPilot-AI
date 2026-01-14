
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
  reportsTo?: string; 
}

export interface Relationship {
  id: string;
  sourceId: string;
  targetId: string;
  type: 'Influence' | 'Conflict';
  note?: string;
}

export interface PainPoint {
  id: string;
  description: string;
  createdAt: string; 
  source?: string;   
  isSolved?: boolean;
}

export interface FieldMetadata {
  source: string;
  timestamp: number;
  isVerified: boolean; // 新增：标记是否经过人工确认
  previousValue?: string; // 新增：保留旧值以便回滚
}

export interface PersonaData {
  industry: string;
  companySize: string;
  scenario?: string; 

  projectBackground?: string; 
  keyPainPoints: PainPoint[]; 
  customerExpectations?: string; 
  budget: string;
  projectTimeline: string;
  decisionMakers: Stakeholder[];
  relationships?: Relationship[]; 

  currentSolution: string;
  competitors: string[];
  
  painPointPitches?: Record<string, string>; 

  _metadata?: Record<string, FieldMetadata>;
}

export interface VisitRecord {
  id: string;
  date: string;
  type: 'Meeting' | 'Call' | 'Email' | 'Other';
  status: 'Planned' | 'Completed'; 
  title: string;
  visitGoal?: string; 
  agendaItems?: string[];
  targetQuestions?: string[]; 
  requiredMaterials?: string[];
  content: string; 
  nextSteps?: string;
  sentiment?: 'Positive' | 'Neutral' | 'Negative' | 'Risk';
  transcript?: string;
  speakerMapping?: Record<string, string>;
  stakeholderIds?: string[];
  audioUrl?: string;
  images?: string[];
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

export interface AssessmentHistoryItem {
  date: string;
  score: number;
  deal_health: 'Healthy' | 'At Risk' | 'Critical';
  main_gap?: string; 
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
  assessmentResult?: AssessmentResult; 
  assessmentHistory?: AssessmentHistoryItem[]; 
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
