export type CompetencyLevel = 'L0' | 'L1' | 'L2' | 'L3' | 'L4' | 'L5';
export type AppTheme = 'light' | 'dark' | 'blue';

export interface CompetencyDef {
  level: CompetencyLevel;
  name: string;
  description: string;
  score: number;
  criteria?: string;
  autonomy?: string;
  projectRole?: string;
  certifications?: string;
  bgClass: string;
  textClass: string;
  borderClass: string;
}

export interface TeamMember {
  id: string;
  name: string;
  roleTitle?: string;
  email: string;
  phone?: string;
  avatarColor: string;
  primaryDomains: string[];
}

export interface SkillItem {
  id: number;
  domain: string;
  skill: string;
  ratings: Record<string, CompetencyLevel>; // member name -> level
  owner: string;
  backup: string;
  sme: string;
  notes?: string;
  evidence?: string; // Evidence / Certification links supporting competency level
  memberEvidence?: Record<string, string>; // Member-specific certification or training evidence links
  status?: 'active' | 'pending';
  requestedBy?: string;
  requestId?: string;
}

export interface ProjectRequirement {
  skillName: string;
  domain: string;
  minLevel: CompetencyLevel;
  weight: number; // 1 to 5
}

export interface Project {
  id: string;
  name: string;
  code: string;
  description: string;
  client: string;
  status: 'Planning' | 'In Progress' | 'Delivered';
  lead: string;
  requiredSkills: ProjectRequirement[];
  assignedMembers: string[];
  startDate: string;
  targetDate: string;
}

export interface FilterOptions {
  searchQuery: string;
  selectedDomain: string;
  selectedMember: string;
  selectedProject: string;
  minLevel: CompetencyLevel | 'all';
  roleStatus: 'all' | 'has_owner' | 'no_owner' | 'has_backup' | 'no_backup' | 'has_sme' | 'no_sme' | 'risk_spof' | 'fully_covered' | 'pending_only';
  sortBy: 'id' | 'domain' | 'skill' | 'avgScore';
  sortOrder: 'asc' | 'desc';
}

export type ActiveTab = 'matrix' | 'charts' | 'projects';

export interface PrintReportConfig {
  departmentTitle: string;
  reportSubtitle: string;
  notes?: string;
  selectedDomains: string[];
  visibleColumns: {
    showIndex: boolean;
    showDomain: boolean;
    showSkill: boolean;
    members: string[];
    showOwner: boolean;
    showBackup: boolean;
    showSme: boolean;
    showEvidence: boolean;
    showAvgScore: boolean;
    showL2Rate: boolean;
  };
  showKpis: boolean;
  showCompetencyLegend: boolean;
  showSignatures: boolean;
  filterMode: 'all' | 'spof_only' | 'no_coverage_only' | 'ready_only' | 'deficit_only';
}

export type HeatmapTheme = 'classic' | 'modern' | 'risk' | 'high_contrast';
export type HeatmapIntensity = 'subtle' | 'medium' | 'vivid';
export type HeatmapDisplayStyle = 'both' | 'button_only' | 'cell_only';

export interface HeatmapConfig {
  enabled: boolean;
  theme: HeatmapTheme;
  intensity: HeatmapIntensity;
  displayStyle: HeatmapDisplayStyle;
  quickCycleMode: boolean;
  customLabels?: Partial<Record<CompetencyLevel, string>>;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string; // ISO string
  memberName: string;
  skillId: number;
  skillName: string;
  domain: string;
  oldValue: string; // e.g. 'L0', 'L1', 'L2' or previous role/assignee
  newValue: string; // e.g. 'L1', 'L2' or new role/assignee
  changeType: 'rating' | 'role_owner' | 'role_backup' | 'role_sme' | 'batch_row' | 'batch_domain';
  performedBy?: string;
  notes?: string;
}

export type SkillRequestType = 'new_skill' | 'training_request';
export type SkillRequestStatus = 'pending' | 'approved' | 'rejected' | 'in_training';
export type SkillRequestUrgency = 'low' | 'medium' | 'high' | 'critical';

export interface SkillRequest {
  id: string;
  title: string;
  domain: string;
  requestType: SkillRequestType;
  requesterName: string;
  urgency: SkillRequestUrgency;
  targetLevel: 'L1' | 'L2';
  interestedMembers: string[];
  justification: string;
  status: SkillRequestStatus;
  createdAt: string; // ISO string
  reviewedBy?: string;
  reviewNotes?: string;
  reviewedAt?: string;
  matrixSkillId?: number;
}

