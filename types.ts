
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
  reportsTo?: string; // ID of the manager
}

// New: Political Relationships
export interface Relationship {
  id: string;
  sourceId: string;
  targetId: string;
  type: 'Influence' | 'Conflict';
  note?: string;
}

// New Interface for structured Pain Points
export interface PainPoint {
  id: string;
  description: string;
  createdAt: string; // ISO Date String YYYY-MM-DD
  source?: string;   // e.g. "Meeting", "Manual"
  isSolved?: boolean;
}

export interface FieldMetadata {
  source: string;
  timestamp: number;
}

export interface PersonaData {
  // Customer Domain
  industry: string;
  companySize: string;
  scenario?: string; // NEW: 业务场景

  // Project Domain
  projectBackground?: string; // NEW: 项目背景与核心需求
  keyPainPoints: PainPoint[]; // CHANGED: From string[] to PainPoint[]
  customerExpectations?: string; // NEW: 客户预期
  budget: string;
  projectTimeline: string;
  decisionMakers: Stakeholder[];
  relationships?: Relationship[]; // NEW: Political Map

  // Product Domain / Competitive Landscape
  currentSolution: string;
  competitors: string[];
  
  // Strategy
  painPointPitches?: Record<string, string>; // Key is PainPoint.description

  // Metadata for lineage
  _metadata?: Record<string, FieldMetadata>;
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

export interface AssessmentHistoryItem {
  date: string;
  score: number;
  deal_health: 'Healthy' | 'At Risk' | 'Critical';
  main_gap?: string; // First gap found, to explain why score is low
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
  assessmentHistory?: AssessmentHistoryItem[]; // NEW: History
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
