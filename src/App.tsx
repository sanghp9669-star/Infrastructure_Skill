import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  ActiveTab, 
  AppTheme,
  AuditLogEntry,
  CompetencyLevel, 
  FilterOptions, 
  HeatmapConfig,
  PrintReportConfig,
  Project,
  SkillItem, 
  SkillRequest,
  TeamMember 
} from './types/skills';
import { 
  COMPETENCY_DEFINITIONS, 
  DOMAINS as INITIAL_DOMAINS, 
  INITIAL_PROJECTS, 
  INITIAL_SKILLS, 
  TEAM_MEMBERS 
} from './data/initialData';
import { INITIAL_AUDIT_LOGS } from './data/initialAuditLogs';
import { INITIAL_SKILL_REQUESTS } from './data/initialSkillRequests';
import { 
  ENTERPRISE_STACK_ORDER, 
  SuggestedSkill 
} from './data/suggestedSkills';
import { Header } from './components/Header';
import { StatsOverview } from './components/StatsOverview';
import { FilterBar } from './components/FilterBar';
import { SkillMatrixTable } from './components/SkillMatrixTable';
import { RealtimeCharts } from './components/RealtimeCharts';
import { CoverageRiskView } from './components/CoverageRiskView';
import { ProjectFitView } from './components/ProjectFitView';
import { TeamMembersView } from './components/TeamMembersView';
import { MemberProfileModal } from './components/MemberProfileModal';
import { ExcelImportModal } from './components/ExcelImportModal';
import { SyncSettingsModal, SyncState } from './components/SyncSettingsModal';
import { ManualSyncModal, ManualSyncResult } from './components/ManualSyncModal';
import { TwoWaySharePointSyncModal } from './components/TwoWaySharePointSyncModal';
import { CompetencyDefinitionModal } from './components/CompetencyDefinitionModal';
import { AddSkillModal } from './components/AddSkillModal';
import { CuratedSkillsModal } from './components/CuratedSkillsModal';
import { SortOrganizeModal, SortStrategy } from './components/SortOrganizeModal';
import { EditSkillModal } from './components/EditSkillModal';
import { EditMemberModal } from './components/EditMemberModal';
import { ManageDomainsModal } from './components/ManageDomainsModal';
import { HeatmapConfigModal, DEFAULT_HEATMAP_CONFIG } from './components/HeatmapConfigModal';
import { AuditLogDrawer } from './components/AuditLogDrawer';
import { SkillRequestModal } from './components/SkillRequestModal';
import { User } from './firebase';
import { 
  syncAllSkillsToFirestore, 
  addAuditLogToFirestore, 
  subscribeToFirestoreSkills 
} from './utils/firestoreSync';
import { 
  isSupabaseConfigured,
  fetchSkillsFromSupabase,
  fetchMembersFromSupabase,
  syncSkillToSupabase,
  deleteSkillFromSupabase,
  deleteMemberFromSupabase,
  syncAllSkillsToSupabase,
  syncAllMembersToSupabase,
  addAuditLogToSupabase,
  subscribeToSupabaseSkills
} from './utils/supabaseSync';
import { PrintReportView, createDefaultPrintConfig } from './components/PrintReportView';
import { PrintCustomizationModal } from './components/PrintCustomizationModal';
import { exportSkillsToCSV, exportSkillsToExcel } from './utils/exportUtils';
import { CheckCircle2, RefreshCw, X, Sparkles } from 'lucide-react';

export default function App() {
  const [theme, setTheme] = useState<AppTheme>(() => {
    try {
      const saved = localStorage.getItem('skill_matrix_theme') as AppTheme;
      if (saved === 'light' || saved === 'dark' || saved === 'blue') return saved;
    } catch {
      // fallback
    }
    return 'light';
  });

  const handleThemeChange = (newTheme: AppTheme) => {
    setTheme(newTheme);
    try {
      localStorage.setItem('skill_matrix_theme', newTheme);
    } catch {}
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const [skills, setSkills] = useState<SkillItem[]>(() => {
    try {
      const saved = localStorage.getItem('skill_matrix_custom_skills');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    const initialPendingSkill: SkillItem = {
      id: INITIAL_SKILLS.length + 1,
      domain: 'Enterprise Networking & SD-WAN',
      skill: 'AI Cluster Networking (RoCEv2 / InfiniBand & GPU Fabric)',
      ratings: {
        Sang: 'L2',
        An: 'L1',
        Cường: 'L1'
      },
      owner: '',
      backup: '',
      sme: '',
      notes: '[Chờ duyệt] Bổ sung phục vụ cụm GPU Train Model cho Khách hàng Tài chính',
      status: 'pending',
      requestedBy: 'Sang',
      requestId: 'req-1'
    };
    return [...INITIAL_SKILLS, initialPendingSkill];
  });
  const [members, setMembers] = useState<TeamMember[]>(() => {
    try {
      const saved = localStorage.getItem('skill_matrix_custom_members');
      if (saved) {
        const parsed: TeamMember[] = JSON.parse(saved);
        const clean = parsed.filter(m => m.name !== 'Thi' && m.id !== 'thi');
        if (clean.length > 0) return clean;
      }
    } catch {
      // fallback
    }
    return TEAM_MEMBERS.filter(m => m.name !== 'Thi' && m.id !== 'thi');
  });

  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);

  const persistMembers = (updatedMembers: TeamMember[]) => {
    setMembers(updatedMembers);
    try {
      localStorage.setItem('skill_matrix_custom_members', JSON.stringify(updatedMembers));
    } catch {
      // ignore
    }
  };

  // Save / Update Member Profile with Cascading references
  const handleSaveMember = (oldName: string, updatedMember: TeamMember) => {
    const existingIndex = members.findIndex(m => m.name === oldName || m.id === updatedMember.id);
    let updatedMembersList: TeamMember[];

    if (existingIndex >= 0) {
      updatedMembersList = [...members];
      updatedMembersList[existingIndex] = updatedMember;
    } else {
      updatedMembersList = [...members, updatedMember];
    }

    persistMembers(updatedMembersList);

    // If name changed, cascade update to skills ratings, owner, backup, sme, projects
    if (oldName && oldName !== updatedMember.name) {
      const updatedSkills = skills.map(s => {
        const newRatings = { ...s.ratings };
        if (newRatings[oldName]) {
          newRatings[updatedMember.name] = newRatings[oldName];
          delete newRatings[oldName];
        }
        return {
          ...s,
          ratings: newRatings,
          owner: s.owner === oldName ? updatedMember.name : s.owner,
          backup: s.backup === oldName ? updatedMember.name : s.backup,
          sme: s.sme === oldName ? updatedMember.name : s.sme
        };
      });

      setSkills(updatedSkills);
      persistSkillsToBackend(updatedSkills);

      // Cascade to projects
      const updatedProjects = projects.map(p => ({
        ...p,
        lead: p.lead === oldName ? updatedMember.name : p.lead,
        assignedMembers: p.assignedMembers.map(m => (m === oldName ? updatedMember.name : m))
      }));
      persistProjects(updatedProjects);
    }

    addAuditLog({
      memberName: updatedMember.name,
      skillId: 0,
      skillName: updatedMember.roleTitle || 'Hồ sơ',
      domain: 'Thành viên',
      oldValue: oldName,
      newValue: updatedMember.name,
      changeType: 'rating',
      performedBy: 'Quản lý',
      notes: `Cập nhật thông tin thành viên "${updatedMember.name}" (${updatedMember.roleTitle})`
    });

    setSyncToastMessage(`Đã cập nhật thông tin kỹ sư ${updatedMember.name} thành công!`);
    setTimeout(() => setSyncToastMessage(null), 4000);
  };

  // Add new member
  const handleAddNewMember = () => {
    const newMemberTemplate: TeamMember = {
      id: `member-${Date.now()}`,
      name: '',
      roleTitle: 'Kỹ sư Hạ tầng',
      email: '',
      phone: '',
      avatarColor: 'from-blue-600 to-indigo-700',
      primaryDomains: ['General Infrastructure']
    };
    setEditingMember(newMemberTemplate);
  };

  // Delete member
  const handleDeleteMember = (memberName: string) => {
    const updatedMembersList = members.filter(m => m.name !== memberName);
    persistMembers(updatedMembersList);

    // Clean up references in skills
    const updatedSkills = skills.map(s => {
      const newRatings = { ...s.ratings };
      delete newRatings[memberName];
      return {
        ...s,
        ratings: newRatings,
        owner: s.owner === memberName ? '' : s.owner,
        backup: s.backup === memberName ? '' : s.backup,
        sme: s.sme === memberName ? '' : s.sme
      };
    });
    setSkills(updatedSkills);
    persistSkillsToBackend(updatedSkills);

    setSyncToastMessage(`Đã xóa thành viên "${memberName}" khỏi danh sách.`);
    setTimeout(() => setSyncToastMessage(null), 4000);
  };

  // Domain Management States & Handlers
  const [isManageDomainsModalOpen, setIsManageDomainsModalOpen] = useState(false);

  const handleRenameDomain = (oldDomain: string, newDomain: string) => {
    const updatedSkills = skills.map(s => (s.domain === oldDomain ? { ...s, domain: newDomain } : s));
    setSkills(updatedSkills);
    persistSkillsToBackend(updatedSkills);

    addAuditLog({
      memberName: 'Admin',
      skillId: 0,
      skillName: newDomain,
      domain: 'Domain Manager',
      oldValue: oldDomain,
      newValue: newDomain,
      changeType: 'rating',
      performedBy: 'Admin',
      notes: `Đổi tên Domain từ "${oldDomain}" sang "${newDomain}"`
    });

    setSyncToastMessage(`Đã đổi tên Domain "${oldDomain}" ➔ "${newDomain}" thành công!`);
    setTimeout(() => setSyncToastMessage(null), 4000);
  };

  const handleAddDomainWithSkill = (domainName: string, initialSkillName: string) => {
    const newSkill: SkillItem = {
      id: Date.now(),
      domain: domainName,
      skill: initialSkillName,
      ratings: members.reduce((acc, m) => ({ ...acc, [m.name]: 'L1' }), {}),
      owner: members[0]?.name || '',
      backup: '',
      sme: '',
      notes: 'Kỹ năng khởi tạo cho Domain mới',
      status: 'active'
    };

    const updatedSkills = [newSkill, ...skills];
    setSkills(updatedSkills);
    persistSkillsToBackend(updatedSkills);

    setSyncToastMessage(`Đã tạo Domain mới "${domainName}" với kỹ năng "${initialSkillName}"!`);
    setTimeout(() => setSyncToastMessage(null), 4000);
  };

  const handleDeleteDomain = (domainName: string) => {
    const updatedSkills = skills.filter(s => s.domain !== domainName);
    setSkills(updatedSkills);
    persistSkillsToBackend(updatedSkills);

    setSyncToastMessage(`Đã xóa Domain "${domainName}" và các kỹ năng liên quan.`);
    setTimeout(() => setSyncToastMessage(null), 4000);
  };

  const handleReassignSkillDomain = (skillId: number, newDomain: string) => {
    const updatedSkills = skills.map(s => (s.id === skillId ? { ...s, domain: newDomain } : s));
    setSkills(updatedSkills);
    persistSkillsToBackend(updatedSkills);

    setSyncToastMessage(`Đã chuyển kỹ năng sang Domain "${newDomain}".`);
    setTimeout(() => setSyncToastMessage(null), 4000);
  };
  const [projects, setProjects] = useState<Project[]>(() => {
    try {
      const saved = localStorage.getItem('skill_matrix_custom_projects');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return INITIAL_PROJECTS;
  });

  const persistProjects = (updatedProjects: Project[]) => {
    setProjects(updatedProjects);
    try {
      localStorage.setItem('skill_matrix_custom_projects', JSON.stringify(updatedProjects));
    } catch {
      // ignore
    }
  };

  const handleAddProject = (newProject: Project) => {
    const updated = [newProject, ...projects];
    persistProjects(updated);
    addAuditLog({
      memberName: newProject.lead || 'Quản lý',
      skillId: 0,
      skillName: newProject.name,
      domain: 'Dự án',
      oldValue: '(Mới)',
      newValue: newProject.code,
      changeType: 'rating',
      performedBy: 'Quản lý',
      notes: `Tạo dự án mới "${newProject.name}" [${newProject.code}]`
    });
    setSyncToastMessage(`Đã tạo thành công dự án "${newProject.name}"!`);
    setTimeout(() => setSyncToastMessage(null), 3500);
  };

  const handleUpdateProject = (updatedProject: Project) => {
    const updated = projects.map(p => p.id === updatedProject.id ? updatedProject : p);
    persistProjects(updated);
    addAuditLog({
      memberName: updatedProject.lead || 'Quản lý',
      skillId: 0,
      skillName: updatedProject.name,
      domain: 'Dự án',
      oldValue: 'Đã có',
      newValue: updatedProject.code,
      changeType: 'rating',
      performedBy: 'Quản lý',
      notes: `Cập nhật dự án "${updatedProject.name}" [${updatedProject.code}]`
    });
    setSyncToastMessage(`Đã cập nhật thông tin dự án "${updatedProject.name}"!`);
    setTimeout(() => setSyncToastMessage(null), 3500);
  };

  const handleDeleteProject = (projectId: string) => {
    const target = projects.find(p => p.id === projectId);
    const updated = projects.filter(p => p.id !== projectId);
    persistProjects(updated);
    if (target) {
      addAuditLog({
        memberName: target.lead || 'Quản lý',
        skillId: 0,
        skillName: target.name,
        domain: 'Dự án',
        oldValue: target.code,
        newValue: '(Đã xóa)',
        changeType: 'rating',
        performedBy: 'Quản lý',
        notes: `Xóa dự án "${target.name}" [${target.code}]`
      });
      setSyncToastMessage(`Đã xóa dự án "${target.name}"!`);
      setTimeout(() => setSyncToastMessage(null), 3500);
    }
  };

  const handleClearDemoProjects = () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa tất cả dự án để bắt đầu quản lý danh sách dự án thực tế mới?')) {
      persistProjects([]);
      setSyncToastMessage('Đã xóa tất cả dự án. Bạn có thể tự do tạo các dự án thực tế!');
      setTimeout(() => setSyncToastMessage(null), 3500);
    }
  };

  const handleRestoreDemoProjects = () => {
    persistProjects(INITIAL_PROJECTS);
    setSyncToastMessage('Đã nạp lại danh sách dự án mẫu!');
    setTimeout(() => setSyncToastMessage(null), 3500);
  };

  const [activeTab, setActiveTab] = useState<ActiveTab>('matrix');
  const [groupByDomain, setGroupByDomain] = useState<boolean>(true);

  // Sync state & Modals
  const [syncState, setSyncState] = useState<SyncState | null>(null);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [isSyncSettingsOpen, setIsSyncSettingsOpen] = useState<boolean>(false);
  const [isManualSyncModalOpen, setIsManualSyncModalOpen] = useState<boolean>(false);
  const [isCompetencyModalOpen, setIsCompetencyModalOpen] = useState<boolean>(false);
  const [syncToastMessage, setSyncToastMessage] = useState<string | null>(null);

  // Skills Management Modals
  const [isAddSkillModalOpen, setIsAddSkillModalOpen] = useState<boolean>(false);
  const [isCuratedModalOpen, setIsCuratedModalOpen] = useState<boolean>(false);
  const [isSortModalOpen, setIsSortModalOpen] = useState<boolean>(false);
  const [editingSkill, setEditingSkill] = useState<SkillItem | null>(null);

  const [selectedProfileMember, setSelectedProfileMember] = useState<TeamMember | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);

  // Heatmap Customization & Editing state with localStorage persistence
  const [heatmapConfig, setHeatmapConfig] = useState<HeatmapConfig>(() => {
    try {
      const saved = localStorage.getItem('skill_matrix_heatmap_config');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return DEFAULT_HEATMAP_CONFIG;
  });
  const [isHeatmapConfigModalOpen, setIsHeatmapConfigModalOpen] = useState<boolean>(false);

  const handleSaveHeatmapConfig = (updated: HeatmapConfig) => {
    setHeatmapConfig(updated);
    try {
      localStorage.setItem('skill_matrix_heatmap_config', JSON.stringify(updated));
    } catch {
      // ignore
    }
    setSyncToastMessage('Đã cập nhật tùy biến Heatmap năng lực thành công!');
    setTimeout(() => setSyncToastMessage(null), 3500);
  };

  // Audit Log State with localStorage persistence
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() => {
    try {
      const saved = localStorage.getItem('skill_matrix_audit_logs');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback
    }
    return INITIAL_AUDIT_LOGS;
  });
  const [isAuditLogOpen, setIsAuditLogOpen] = useState<boolean>(false);

  const addAuditLog = useCallback((entry: Omit<AuditLogEntry, 'id' | 'timestamp'>) => {
    const newLog: AuditLogEntry = {
      ...entry,
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString()
    };
    setAuditLogs(prev => {
      const updated = [newLog, ...prev.slice(0, 99)]; // keep latest 100 entries
      try {
        localStorage.setItem('skill_matrix_audit_logs', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });

    // Sync Audit Log entry to Supabase
    if (isSupabaseConfigured()) {
      addAuditLogToSupabase(newLog).catch(e => console.warn('[Supabase] Audit log save error:', e));
    }
  }, []);

  const handleClearAuditLogs = () => {
    setAuditLogs([]);
    try {
      localStorage.removeItem('skill_matrix_audit_logs');
    } catch {
      // ignore
    }
    setSyncToastMessage('Đã xóa toàn bộ lịch sử thay đổi!');
    setTimeout(() => setSyncToastMessage(null), 3000);
  };

  const handleNavigateToSkillFromAudit = (skillId: number) => {
    setActiveTab('matrix');
    const targetSkill = skills.find(s => s.id === skillId);
    if (targetSkill) {
      setFilter(prev => ({
        ...prev,
        searchQuery: targetSkill.skill,
        selectedDomain: 'all',
        selectedMember: 'all'
      }));
    }
  };

  // Skill & Training Requests state with localStorage persistence
  const [skillRequests, setSkillRequests] = useState<SkillRequest[]>(() => {
    try {
      const saved = localStorage.getItem('skill_matrix_skill_requests');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback
    }
    return INITIAL_SKILL_REQUESTS;
  });
  const [isSkillRequestModalOpen, setIsSkillRequestModalOpen] = useState<boolean>(false);

  const pendingRequestsCount = useMemo(() => {
    return skillRequests.filter(r => r.status === 'pending').length;
  }, [skillRequests]);

  const persistSkillRequests = (updated: SkillRequest[]) => {
    setSkillRequests(updated);
    try {
      localStorage.setItem('skill_matrix_skill_requests', JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  // 1. Submit New Skill or Training Request
  const handleSubmitSkillRequest = (
    newReqData: Omit<SkillRequest, 'id' | 'createdAt'>,
    addToMatrixAsPending: boolean = true
  ) => {
    const reqId = `req-${Date.now()}`;
    const newReq: SkillRequest = {
      ...newReqData,
      id: reqId,
      createdAt: new Date().toISOString()
    };

    let newMatrixSkillId: number | undefined = undefined;

    // If proposing a new skill and requested to show as pending in matrix
    if (newReqData.requestType === 'new_skill' && addToMatrixAsPending) {
      const nextId = skills.length > 0 ? Math.max(...skills.map(s => s.id)) + 1 : 1;
      newMatrixSkillId = nextId;
      newReq.matrixSkillId = nextId;

      const initialRatings: Record<string, CompetencyLevel> = {};
      members.forEach(m => {
        if (m.name === newReqData.requesterName) {
          initialRatings[m.name] = newReqData.targetLevel;
        } else if (newReqData.interestedMembers.includes(m.name)) {
          initialRatings[m.name] = 'L1';
        } else {
          initialRatings[m.name] = 'L0';
        }
      });

      const pendingSkillItem: SkillItem = {
        id: nextId,
        domain: newReqData.domain,
        skill: newReqData.title,
        ratings: initialRatings,
        owner: newReqData.requesterName,
        backup: '',
        sme: '',
        notes: `[Chờ duyệt] ${newReqData.justification}`,
        status: 'pending',
        requestedBy: newReqData.requesterName,
        requestId: reqId
      };

      const updatedSkills = [...skills, pendingSkillItem];
      setSkills(updatedSkills);
      persistSkillsToBackend(updatedSkills);
    }

    const updatedRequests = [newReq, ...skillRequests];
    persistSkillRequests(updatedRequests);

    addAuditLog({
      memberName: newReqData.requesterName,
      skillId: newMatrixSkillId || 0,
      skillName: newReqData.title,
      domain: newReqData.domain,
      oldValue: '(Mới)',
      newValue: 'Pending',
      changeType: 'rating',
      performedBy: newReqData.requesterName,
      notes: `Gửi đề xuất ${newReqData.requestType === 'new_skill' ? 'kỹ năng mới' : 'đào tạo'}: "${newReqData.title}"`
    });

    setSyncToastMessage(
      `Đã gửi thành công đề xuất "${newReqData.title}" (${newReqData.requestType === 'new_skill' ? 'Kỹ năng mới' : 'Yêu cầu đào tạo'})!`
    );
    setTimeout(() => setSyncToastMessage(null), 4500);
  };

  // 2. Approve Request & Activate in Matrix
  const handleApproveSkillRequest = (requestId: string, reviewerNotes?: string) => {
    const targetReq = skillRequests.find(r => r.id === requestId);
    if (!targetReq) return;

    const updatedRequests: SkillRequest[] = skillRequests.map(r => {
      if (r.id !== requestId) return r;
      return {
        ...r,
        status: 'approved' as const,
        reviewedBy: 'Trưởng Phòng Hạ Tầng',
        reviewNotes: reviewerNotes || 'Đã phê duyệt đưa vào ma trận chính thức',
        reviewedAt: new Date().toISOString()
      };
    });
    persistSkillRequests(updatedRequests);

    // Update or activate skill in matrix
    let activatedSkillId = targetReq.matrixSkillId;
    let updatedSkills = skills.map(s => {
      if (s.requestId === requestId || (targetReq.matrixSkillId && s.id === targetReq.matrixSkillId)) {
        return {
          ...s,
          status: 'active' as const,
          notes: s.notes?.replace('[Chờ duyệt]', '[Chính thức]') || s.notes
        };
      }
      return s;
    });

    // If not in matrix yet, add it as active
    const exists = updatedSkills.some(s => s.requestId === requestId || s.skill.toLowerCase() === targetReq.title.toLowerCase());
    if (!exists && targetReq.requestType === 'new_skill') {
      const nextId = updatedSkills.length > 0 ? Math.max(...updatedSkills.map(s => s.id)) + 1 : 1;
      activatedSkillId = nextId;
      const initialRatings: Record<string, CompetencyLevel> = {};
      members.forEach(m => {
        if (m.name === targetReq.requesterName) {
          initialRatings[m.name] = targetReq.targetLevel;
        } else if (targetReq.interestedMembers.includes(m.name)) {
          initialRatings[m.name] = 'L1';
        } else {
          initialRatings[m.name] = 'L0';
        }
      });
      const newActiveSkill: SkillItem = {
        id: nextId,
        domain: targetReq.domain,
        skill: targetReq.title,
        ratings: initialRatings,
        owner: targetReq.requesterName,
        backup: '',
        sme: targetReq.requesterName,
        notes: `[Chính thức] ${targetReq.justification}`,
        status: 'active',
        requestedBy: targetReq.requesterName,
        requestId
      };
      updatedSkills.push(newActiveSkill);
    }

    setSkills(updatedSkills);
    persistSkillsToBackend(updatedSkills);

    addAuditLog({
      memberName: targetReq.requesterName,
      skillId: activatedSkillId || 0,
      skillName: targetReq.title,
      domain: targetReq.domain,
      oldValue: 'Pending',
      newValue: 'Approved / Active',
      changeType: 'rating',
      performedBy: 'Trưởng Phòng Hạ Tầng',
      notes: `Phê duyệt chính thức kỹ năng "${targetReq.title}" vào Ma Trận`
    });

    setSyncToastMessage(`Đã phê duyệt đề xuất "${targetReq.title}" và kích hoạt trong Ma Trận!`);
    setTimeout(() => setSyncToastMessage(null), 4500);
  };

  // 3. Reject Request
  const handleRejectSkillRequest = (requestId: string, reviewerNotes?: string) => {
    const targetReq = skillRequests.find(r => r.id === requestId);
    if (!targetReq) return;

    const updatedRequests: SkillRequest[] = skillRequests.map(r => {
      if (r.id !== requestId) return r;
      return {
        ...r,
        status: 'rejected' as const,
        reviewedBy: 'Trưởng Phòng Hạ Tầng',
        reviewNotes: reviewerNotes || 'Chưa phù hợp với định hướng công nghệ hiện tại',
        reviewedAt: new Date().toISOString()
      };
    });
    persistSkillRequests(updatedRequests);

    // Remove pending skill placeholder from matrix if present
    const updatedSkills = skills.filter(s => s.requestId !== requestId && (!targetReq.matrixSkillId || s.id !== targetReq.matrixSkillId || s.status !== 'pending'));
    setSkills(updatedSkills);
    persistSkillsToBackend(updatedSkills);

    addAuditLog({
      memberName: targetReq.requesterName,
      skillId: targetReq.matrixSkillId || 0,
      skillName: targetReq.title,
      domain: targetReq.domain,
      oldValue: 'Pending',
      newValue: 'Rejected',
      changeType: 'rating',
      performedBy: 'Trưởng Phòng Hạ Tầng',
      notes: `Từ chối đề xuất "${targetReq.title}": ${reviewerNotes || 'Chưa phù hợp'}`
    });

    setSyncToastMessage(`Đã từ chối đề xuất "${targetReq.title}".`);
    setTimeout(() => setSyncToastMessage(null), 3500);
  };

  // 4. Set Training in Progress
  const handleSetInTraining = (requestId: string) => {
    const targetReq = skillRequests.find(r => r.id === requestId);
    if (!targetReq) return;

    const updatedRequests: SkillRequest[] = skillRequests.map(r => {
      if (r.id !== requestId) return r;
      return {
        ...r,
        status: 'in_training' as const,
        reviewedBy: 'Lead Kỹ Thuật',
        reviewNotes: 'Đang triển khai buổi đào tạo / Lab Workshop',
        reviewedAt: new Date().toISOString()
      };
    });
    persistSkillRequests(updatedRequests);

    addAuditLog({
      memberName: targetReq.requesterName,
      skillId: targetReq.matrixSkillId || 0,
      skillName: targetReq.title,
      domain: targetReq.domain,
      oldValue: 'Pending',
      newValue: 'In Training',
      changeType: 'rating',
      performedBy: 'Lead Kỹ Thuật',
      notes: `Khởi động chương trình đào tạo cho chủ đề "${targetReq.title}"`
    });

    setSyncToastMessage(`Đã chuyển đề xuất "${targetReq.title}" sang trạng thái Đang Đào Tạo!`);
    setTimeout(() => setSyncToastMessage(null), 3500);
  };

  // 5. Toggle Upvote / Interested
  const handleToggleUpvoteSkillRequest = (requestId: string, memberName: string) => {
    const updatedRequests = skillRequests.map(r => {
      if (r.id !== requestId) return r;
      const isInterested = r.interestedMembers.includes(memberName);
      const newInterested = isInterested
        ? r.interestedMembers.filter(m => m !== memberName)
        : [...r.interestedMembers, memberName];
      return { ...r, interestedMembers: newInterested };
    });
    persistSkillRequests(updatedRequests);
  };

  // 6. Quick Approve directly from table row
  const handleQuickApprovePendingSkill = (skillId: number) => {
    const targetSkill = skills.find(s => s.id === skillId);
    if (!targetSkill) return;

    if (targetSkill.requestId) {
      handleApproveSkillRequest(targetSkill.requestId);
    } else {
      const updated = skills.map(s => s.id === skillId ? { ...s, status: 'active' as const } : s);
      setSkills(updated);
      persistSkillsToBackend(updated);
      addAuditLog({
        memberName: targetSkill.owner || 'Toàn nhóm',
        skillId,
        skillName: targetSkill.skill,
        domain: targetSkill.domain,
        oldValue: 'Pending',
        newValue: 'Active',
        changeType: 'rating',
        performedBy: 'Quản lý',
        notes: `Duyệt nhanh kỹ năng "${targetSkill.skill}" thành chính thức`
      });
      setSyncToastMessage(`Đã duyệt kỹ năng "${targetSkill.skill}" thành chính thức!`);
      setTimeout(() => setSyncToastMessage(null), 3500);
    }
  };

  // Print & PDF Customization state
  const [isPrintModalOpen, setIsPrintModalOpen] = useState<boolean>(false);
  const [printConfig, setPrintConfig] = useState<PrintReportConfig>(() =>
    createDefaultPrintConfig(TEAM_MEMBERS, INITIAL_DOMAINS)
  );

  // Dynamic domains list
  const currentDomains = useMemo(() => {
    return Array.from(new Set(skills.map(s => s.domain))).sort();
  }, [skills]);

  const handleOpenPrintModal = (customPresetConfig?: Partial<PrintReportConfig>) => {
    if (customPresetConfig) {
      setPrintConfig(prev => ({
        ...prev,
        ...customPresetConfig,
        visibleColumns: {
          ...prev.visibleColumns,
          ...(customPresetConfig.visibleColumns || {})
        }
      }));
    } else if (filter.selectedDomain !== 'all') {
      // If user currently filtered by a domain, smartly pre-select that domain in the report
      setPrintConfig(prev => ({
        ...prev,
        selectedDomains: [filter.selectedDomain],
        departmentTitle: `BÁO CÁO NĂNG LỰC PHÂN KHÚC: ${filter.selectedDomain.toUpperCase()}`
      }));
    }
    setIsPrintModalOpen(true);
  };

  const handleSavePrintConfig = (updated: PrintReportConfig) => {
    setPrintConfig(updated);
  };

  const handleExecutePrint = (finalConfig: PrintReportConfig) => {
    setPrintConfig(finalConfig);
    // Slight tick to ensure React re-render before print dialog opens
    setTimeout(() => {
      window.print();
    }, 120);
  };

  // Filter state
  const [filter, setFilter] = useState<FilterOptions>({
    searchQuery: '',
    selectedDomain: 'all',
    selectedMember: 'all',
    selectedProject: 'all',
    minLevel: 'all',
    roleStatus: 'all',
    sortBy: 'id',
    sortOrder: 'asc'
  });

  // Helper to apply synced skills to React state & localStorage and strictly sync detected members
  const updateSkillsAndMembersFromSync = useCallback((syncedSkills: SkillItem[]) => {
    // 1. Remove 'Thi' from all skills ratings
    syncedSkills.forEach(s => {
      if (s.ratings && 'Thi' in s.ratings) {
        delete s.ratings['Thi'];
      }
    });

    setSkills(syncedSkills);
    try {
      localStorage.setItem('skill_matrix_custom_skills', JSON.stringify(syncedSkills));
    } catch {}

    // 2. Identify active members from the synced skills
    const activeMemberNames = new Set<string>();
    syncedSkills.forEach(s => {
      if (s.ratings) {
        Object.keys(s.ratings).forEach(mName => {
          const clean = mName?.trim();
          if (clean && clean !== 'Thi') {
            activeMemberNames.add(clean);
          }
        });
      }
    });

    if (activeMemberNames.size > 0) {
      setMembers(prevMembers => {
        const prevMemberMap = new Map(prevMembers.filter(m => m.name !== 'Thi').map(m => [m.name, m]));
        const updatedMemberList: TeamMember[] = [];

        activeMemberNames.forEach(name => {
          if (prevMemberMap.has(name)) {
            updatedMemberList.push(prevMemberMap.get(name)!);
          } else {
            updatedMemberList.push({
              id: name.toLowerCase().replace(/\s+/g, '-'),
              name,
              roleTitle: 'Infrastructure Engineer',
              email: `${name.toLowerCase()}@viendat.com`,
              avatarColor: 'from-slate-600 to-slate-800',
              primaryDomains: ['General']
            });
          }
        });

        try {
          localStorage.setItem('skill_matrix_custom_members', JSON.stringify(updatedMemberList));
        } catch {}

        if (isSupabaseConfigured()) {
          deleteMemberFromSupabase('Thi');
          syncAllMembersToSupabase(updatedMemberList).catch(err => console.warn(err));
        }

        return updatedMemberList;
      });
    }
  }, []);

  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Fetch initial matrix: Load real SharePoint data from backend and sync to Supabase
  const fetchBackendData = useCallback(async () => {
    try {
      // 1. Fetch real SharePoint synced data from local server
      const res = await fetch('/api/matrix');
      if (res.ok) {
        const data = await res.json();
        if (data.skills && Array.isArray(data.skills) && data.skills.length > 0) {
          updateSkillsAndMembersFromSync(data.skills);
          if (data.state) {
            setSyncState(data.state);
          }
          // Keep Supabase synchronized with the real SharePoint file
          if (isSupabaseConfigured()) {
            syncAllSkillsToSupabase(data.skills).catch(e => console.warn(e));
          }
          return;
        }
      }

      // 2. Fallback to Supabase if local server matrix is not available
      if (isSupabaseConfigured()) {
        try {
          const [supabaseSkills, supabaseMembers] = await Promise.all([
            fetchSkillsFromSupabase(),
            fetchMembersFromSupabase()
          ]);
          if (supabaseMembers.data && supabaseMembers.data.length > 0) {
            setMembers(supabaseMembers.data);
          }
          if (supabaseSkills.data && supabaseSkills.data.length > 0) {
            updateSkillsAndMembersFromSync(supabaseSkills.data);
            return;
          }
        } catch (e) {
          console.warn('[Supabase] Initial fetch note:', e);
        }
      }
    } catch {
      // Backend not running or static dev
    }
  }, [updateSkillsAndMembersFromSync]);

  useEffect(() => {
    fetchBackendData();
  }, [fetchBackendData]);

  // Subscribe to real-time updates from Supabase (sole authoritative real-time database)
  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    const unsub = subscribeToSupabaseSkills((supabaseSkills) => {
      if (supabaseSkills && supabaseSkills.length > 0) {
        updateSkillsAndMembersFromSync(supabaseSkills);
      }
    });
    return () => unsub();
  }, [updateSkillsAndMembersFromSync]);

  // Helper to persist skills: SUPABASE is the ONLY AUTOMATIC DATABASE
  const persistSkillsToBackend = (updatedSkills: SkillItem[]) => {
    try {
      localStorage.setItem('skill_matrix_custom_skills', JSON.stringify(updatedSkills));
    } catch {}

    // Save to local backend cache (without auto-pushing to SharePoint)
    fetch('/api/matrix', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ skills: updatedSkills })
    }).catch(err => {
      console.warn('Local cache warning:', err.message);
    });

    // AUTOMATIC & PRIMARY: Always sync in real-time to Supabase
    if (isSupabaseConfigured()) {
      syncAllSkillsToSupabase(updatedSkills).catch(err => {
        console.warn('[Supabase] Auto-sync error:', err);
      });
    }
  };

  // Trigger manual or forced sync
  const handleTriggerSync = async (force: boolean = false) => {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ force })
      });
      const data = await res.json();
      if (data.success) {
        if (data.skills && data.skills.length > 0) {
          updateSkillsAndMembersFromSync(data.skills);
        }
        setSyncToastMessage(data.message || 'Đồng bộ hoàn tất thành công!');
        setTimeout(() => setSyncToastMessage(null), 5000);
        const sRes = await fetch('/api/sync-status');
        if (sRes.ok) {
          const sData = await sRes.json();
          setSyncState(sData.state);
        }
      } else {
        setSyncToastMessage(data.error ? `Lỗi: ${data.error}` : 'Không thể kết nối SharePoint.');
        setTimeout(() => setSyncToastMessage(null), 5000);
      }
    } catch (err: any) {
      setSyncToastMessage(`Lỗi đồng bộ: ${err.message}`);
      setTimeout(() => setSyncToastMessage(null), 5000);
    } finally {
      setIsSyncing(false);
    }
  };

  // Update sync config
  const handleUpdateConfig = async (config: { intervalMinutes?: number; enabled?: boolean; url?: string }) => {
    try {
      const res = await fetch('/api/sync-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      const data = await res.json();
      if (data.success && data.state) {
        setSyncState(data.state);
      }
    } catch (err: any) {
      console.error('Failed to update sync config:', err);
    }
  };

  // Instant manual sync online from SharePoint
  const handleManualSyncOnline = async (url?: string): Promise<ManualSyncResult | null> => {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/manual-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ force: true, url })
      });
      const data: ManualSyncResult = await res.json();
      if (data.success && data.skills && data.skills.length > 0) {
        updateSkillsAndMembersFromSync(data.skills);
        if ((data as any).state) {
          setSyncState((data as any).state);
        }
        setSyncToastMessage(data.message || 'Đã đồng bộ thủ công tức thì từ SharePoint thành công!');
        setTimeout(() => setSyncToastMessage(null), 6000);
      }
      return data;
    } catch (err: any) {
      return {
        success: false,
        changed: false,
        error: err.message
      };
    } finally {
      setIsSyncing(false);
    }
  };

  // Instant manual sync from local uploaded Excel file
  const handleManualSyncFile = async (fileBase64: string, filename: string): Promise<ManualSyncResult | null> => {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/manual-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ force: true, fileBase64, filename })
      });
      const data: ManualSyncResult = await res.json();
      if (data.success && data.skills && data.skills.length > 0) {
        updateSkillsAndMembersFromSync(data.skills);
        if ((data as any).state) {
          setSyncState((data as any).state);
        }
        setSyncToastMessage(data.message || `Đã đồng bộ thủ công tức thì từ file ${filename}!`);
        setTimeout(() => setSyncToastMessage(null), 6000);
      }
      return data;
    } catch (err: any) {
      return {
        success: false,
        changed: false,
        error: err.message
      };
    } finally {
      setIsSyncing(false);
    }
  };

  // Push updated skills back to SharePoint Excel via Webhook / Flow / Direct Export
  const handlePushToSharePoint = async (webhookUrl?: string): Promise<any> => {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/push-sharepoint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ webhookUrl, skills })
      });
      const data = await res.json();
      if (data.success) {
        if (data.state) {
          setSyncState(data.state);
        }
        setSyncToastMessage(data.message || 'Đã đóng gói và đồng bộ file Excel thành công!');
        setTimeout(() => setSyncToastMessage(null), 6000);
      }
      return data;
    } catch (err: any) {
      return {
        success: false,
        message: `Lỗi kết nối: ${err.message}`
      };
    } finally {
      setIsSyncing(false);
    }
  };

  // 1. Add Single Skill
  const handleAddSkill = (newSkillData: Omit<SkillItem, 'id'>) => {
    const newId = skills.length > 0 ? Math.max(...skills.map(s => s.id)) + 1 : 1;
    const newSkillItem: SkillItem = {
      ...newSkillData,
      id: newId
    };

    if (isSupabaseConfigured()) {
      syncSkillToSupabase(newSkillItem).catch(err => console.warn('[Supabase] Add skill sync error:', err));
    }

    const updated = [...skills, newSkillItem];
    setSkills(updated);
    persistSkillsToBackend(updated);

    setSyncToastMessage(
      `Đã bổ sung kỹ năng "${newSkillData.skill}" vào database Supabase thành công!`
    );
    setTimeout(() => setSyncToastMessage(null), 5000);
  };

  // 2. Batch Add Curated Infrastructure Skills
  const handleBatchAddSkills = (skillsToAdd: SuggestedSkill[]) => {
    let nextId = skills.length > 0 ? Math.max(...skills.map(s => s.id)) + 1 : 1;

    const newItems: SkillItem[] = skillsToAdd.map(item => {
      const ratings: Record<string, CompetencyLevel> = {};
      const owner = item.recommendedOwner || 'Sang';
      const backupCandidate = members.find(m => m.name !== owner);

      members.forEach(m => {
        if (m.name === owner) {
          ratings[m.name] = 'L2';
        } else if (backupCandidate && m.name === backupCandidate.name) {
          ratings[m.name] = 'L2';
        } else {
          ratings[m.name] = 'L0';
        }
      });

      return {
        id: nextId++,
        domain: item.domain,
        skill: item.skill,
        ratings,
        owner,
        backup: backupCandidate ? backupCandidate.name : '',
        sme: owner,
        notes: item.description
      };
    });

    const updated = [...skills, ...newItems];
    setSkills(updated);
    persistSkillsToBackend(updated);

    setSyncToastMessage(
      `Đã bổ sung thành công ${skillsToAdd.length} kỹ năng hạ tầng mới vào database Supabase!`
    );
    setTimeout(() => setSyncToastMessage(null), 5000);
  };

  // 3. Edit Existing Skill
  const handleSaveSkillEdit = (updatedSkill: SkillItem) => {
    if (isSupabaseConfigured()) {
      syncSkillToSupabase(updatedSkill).catch(err => console.warn('[Supabase] Edit skill sync error:', err));
    }

    const updated = skills.map(s => (s.id === updatedSkill.id ? updatedSkill : s));
    setSkills(updated);
    persistSkillsToBackend(updated);

    setSyncToastMessage(`Đã cập nhật kỹ năng "${updatedSkill.skill}" vào database Supabase thành công!`);
    setTimeout(() => setSyncToastMessage(null), 4000);
  };

  // 4. Delete Skill
  const handleDeleteSkill = (skillId: number) => {
    const skillToDelete = skills.find(s => s.id === skillId);
    if (isSupabaseConfigured()) {
      deleteSkillFromSupabase(skillId).catch(err => console.warn('[Supabase] Delete skill sync error:', err));
    }

    const updated = skills.filter(s => s.id !== skillId);
    setSkills(updated);
    persistSkillsToBackend(updated);

    setSyncToastMessage(
      `Đã xóa kỹ năng "${skillToDelete?.skill || skillId}" khỏi database Supabase!`
    );
    setTimeout(() => setSyncToastMessage(null), 4000);
  };

  // 5. Sort & Organize Matrix
  const handleSortSkills = (strategy: SortStrategy) => {
    const sorted = [...skills];

    const getAvgScore = (item: SkillItem) => {
      const scores = members.map(m => COMPETENCY_DEFINITIONS[item.ratings[m.name] || 'L0']?.score || 0);
      return scores.reduce((a, b) => a + b, 0) / (members.length || 1);
    };

    switch (strategy) {
      case 'enterprise_stack':
        sorted.sort((a, b) => {
          let idxA = ENTERPRISE_STACK_ORDER.indexOf(a.domain);
          let idxB = ENTERPRISE_STACK_ORDER.indexOf(b.domain);
          if (idxA === -1) idxA = 99;
          if (idxB === -1) idxB = 99;
          if (idxA !== idxB) return idxA - idxB;
          return a.skill.localeCompare(b.skill);
        });
        break;

      case 'domain_az':
        sorted.sort((a, b) => {
          const dComp = a.domain.localeCompare(b.domain);
          if (dComp !== 0) return dComp;
          return a.skill.localeCompare(b.skill);
        });
        break;

      case 'skill_az':
        sorted.sort((a, b) => a.skill.localeCompare(b.skill));
        break;

      case 'score_desc':
        sorted.sort((a, b) => getAvgScore(b) - getAvgScore(a));
        break;

      case 'score_asc':
        sorted.sort((a, b) => getAvgScore(a) - getAvgScore(b));
        break;

      case 'risk_spof_first':
        sorted.sort((a, b) => {
          const aRisk = (!a.sme && !a.backup) ? 3 : (!a.backup ? 2 : (!a.sme ? 1 : 0));
          const bRisk = (!b.sme && !b.backup) ? 3 : (!b.backup ? 2 : (!b.sme ? 1 : 0));
          if (bRisk !== aRisk) return bRisk - aRisk;
          return a.domain.localeCompare(b.domain);
        });
        break;
    }

    // Re-index IDs cleanly 1..N
    const reindexed = sorted.map((s, idx) => ({ ...s, id: idx + 1 }));
    setSkills(reindexed);
    persistSkillsToBackend(reindexed);

    setSyncToastMessage('Đã sắp xếp lại ma trận kỹ năng và đồng bộ file Excel thành công!');
    setTimeout(() => setSyncToastMessage(null), 4000);
  };

  // Filter skills based on criteria
  const filteredSkills = useMemo(() => {
    return skills.filter(item => {
      // 1. Search Query
      if (filter.searchQuery.trim()) {
        const q = filter.searchQuery.toLowerCase().trim();
        const matchName = item.skill.toLowerCase().includes(q);
        const matchDomain = item.domain.toLowerCase().includes(q);
        const matchOwner = (item.owner || '').toLowerCase().includes(q);
        const matchSME = (item.sme || '').toLowerCase().includes(q);
        if (!matchName && !matchDomain && !matchOwner && !matchSME) return false;
      }

      // 2. Domain
      if (filter.selectedDomain !== 'all' && item.domain !== filter.selectedDomain) {
        return false;
      }

      // 3. Member Filter
      if (filter.selectedMember !== 'all') {
        const memLevel = item.ratings[filter.selectedMember] || 'L0';
        if (filter.minLevel !== 'all') {
          const reqScore = COMPETENCY_DEFINITIONS[filter.minLevel]?.score || 0;
          const memScore = COMPETENCY_DEFINITIONS[memLevel]?.score || 0;
          if (memScore < reqScore) return false;
        } else {
          if (memLevel === 'L0') return false;
        }
      } else if (filter.minLevel !== 'all') {
        const reqScore = COMPETENCY_DEFINITIONS[filter.minLevel]?.score || 0;
        const hasMember = members.some(m => {
          const lvl = item.ratings[m.name] || 'L0';
          return (COMPETENCY_DEFINITIONS[lvl]?.score || 0) >= reqScore;
        });
        if (!hasMember) return false;
      }

      // 4. Project Filter
      if (filter.selectedProject !== 'all') {
        const proj = projects.find(p => p.id === filter.selectedProject);
        if (proj && proj.requiredSkills) {
          const isReq = proj.requiredSkills.some(
            (r) => r.skillName.toLowerCase() === item.skill.toLowerCase() ||
                   item.skill.toLowerCase().includes(r.skillName.toLowerCase())
          );
          if (!isReq) return false;
        }
      }

      // 5. Role Status
      if (filter.roleStatus === 'pending_only' && item.status !== 'pending') return false;
      if (filter.roleStatus === 'has_owner' && !item.owner) return false;
      if (filter.roleStatus === 'no_owner' && item.owner) return false;
      if (filter.roleStatus === 'has_backup' && !item.backup) return false;
      if (filter.roleStatus === 'no_backup' && item.backup) return false;
      if (filter.roleStatus === 'has_sme' && !item.sme) return false;
      if (filter.roleStatus === 'no_sme' && item.sme) return false;
      if (filter.roleStatus === 'risk_spof') {
        const isSPOF = (item.sme || item.owner) && !item.backup;
        if (!isSPOF) return false;
      }
      if (filter.roleStatus === 'fully_covered') {
        if (!item.sme || !item.backup) return false;
      }

      return true;
    });
  }, [skills, filter, members, projects]);

  // Real-time Update Rating Handler with server sync & audit logging
  const handleUpdateRating = (
    skillId: number, 
    memberName: string, 
    level: CompetencyLevel, 
    logAudit: boolean = true
  ) => {
    let skillName = '';
    let skillDomain = '';
    let oldRating: CompetencyLevel = 'L0';

    setSkills(prev => {
      const targetSkill = prev.find(s => s.id === skillId);
      if (targetSkill) {
        skillName = targetSkill.skill;
        skillDomain = targetSkill.domain;
        oldRating = targetSkill.ratings[memberName] || 'L0';
      }

      const updated = prev.map(s => {
        if (s.id !== skillId) return s;
        const modified = {
          ...s,
          ratings: { ...s.ratings, [memberName]: level }
        };
        // Instant single skill write to Supabase
        if (isSupabaseConfigured()) {
          syncSkillToSupabase(modified).catch(err => console.warn('[Supabase] Rating sync error:', err));
        }
        return modified;
      });
      persistSkillsToBackend(updated);
      return updated;
    });

    if (logAudit && oldRating !== level && skillName) {
      addAuditLog({
        memberName,
        skillId,
        skillName,
        domain: skillDomain,
        oldValue: oldRating,
        newValue: level,
        changeType: 'rating',
        performedBy: `${memberName} / Quản lý`,
        notes: `Cập nhật cấp độ từ ${oldRating} lên ${level}`
      });
    }
  };

  // Real-time Role Update Handler with server sync & audit logging
  const handleUpdateRole = (skillId: number, field: 'owner' | 'backup' | 'sme', value: string) => {
    let skillName = '';
    let skillDomain = '';
    let oldValue = '';

    setSkills(prev => {
      const targetSkill = prev.find(s => s.id === skillId);
      if (targetSkill) {
        skillName = targetSkill.skill;
        skillDomain = targetSkill.domain;
        oldValue = targetSkill[field] || '';
      }

      const updated = prev.map(s => {
        if (s.id !== skillId) return s;
        const modified = { ...s, [field]: value };
        if (isSupabaseConfigured()) {
          syncSkillToSupabase(modified).catch(err => console.warn('[Supabase] Role sync error:', err));
        }
        return modified;
      });
      persistSkillsToBackend(updated);
      return updated;
    });

    if (oldValue !== value && skillName) {
      const roleLabels = {
        owner: 'Owner chính',
        backup: 'Backup engineer',
        sme: 'SME chuyên gia'
      };
      addAuditLog({
        memberName: value || oldValue || 'Hệ thống',
        skillId,
        skillName,
        domain: skillDomain,
        oldValue: oldValue || '(Trống)',
        newValue: value || '(Đã xóa)',
        changeType: `role_${field}` as any,
        performedBy: 'Lead Quản lý',
        notes: `Chỉ định phân công vai trò ${roleLabels[field]}`
      });
    }
  };

  // Batch Row Rating Handler (Apply level to all engineers for a skill)
  const handleBatchRowRating = (skillId: number, level: CompetencyLevel) => {
    let skillName = '';
    let skillDomain = '';

    setSkills(prev => {
      const targetSkill = prev.find(s => s.id === skillId);
      if (targetSkill) {
        skillName = targetSkill.skill;
        skillDomain = targetSkill.domain;
      }

      const updated = prev.map(s => {
        if (s.id !== skillId) return s;
        const newRatings = { ...s.ratings };
        members.forEach(m => {
          newRatings[m.name] = level;
        });
        return { ...s, ratings: newRatings };
      });
      persistSkillsToBackend(updated);
      return updated;
    });

    if (skillName) {
      addAuditLog({
        memberName: 'Toàn bộ nhóm',
        skillId,
        skillName,
        domain: skillDomain,
        oldValue: 'Hỗn hợp',
        newValue: level,
        changeType: 'batch_row',
        performedBy: 'Quản lý',
        notes: `Gán đồng loạt cấp độ ${level} cho tất cả ${members.length} kỹ sư trong kỹ năng`
      });
    }

    setSyncToastMessage(`Đã cập nhật toàn bộ kỹ sư trong hàng thành cấp độ ${level}!`);
    setTimeout(() => setSyncToastMessage(null), 3500);
  };

  // Batch Domain Rating Handler (Apply level to all skills in a domain)
  const handleBatchDomainRating = (domain: string, level: CompetencyLevel) => {
    setSkills(prev => {
      const updated = prev.map(s => {
        if (s.domain !== domain) return s;
        const newRatings = { ...s.ratings };
        members.forEach(m => {
          newRatings[m.name] = level;
        });
        return { ...s, ratings: newRatings };
      });
      persistSkillsToBackend(updated);
      return updated;
    });

    addAuditLog({
      memberName: 'Toàn bộ domain',
      skillId: 0,
      skillName: `Tất cả kỹ năng thuộc ${domain}`,
      domain,
      oldValue: 'Hỗn hợp',
      newValue: level,
      changeType: 'batch_domain',
      performedBy: 'Trưởng nhóm phân khúc',
      notes: `Gán hàng loạt cấp độ ${level} cho toàn bộ domain "${domain}"`
    });

    setSyncToastMessage(`Đã cập nhật tất cả kỹ năng trong phân khúc "${domain}" thành cấp độ ${level}!`);
    setTimeout(() => setSyncToastMessage(null), 3500);
  };

  // Bulk Set Level for Multiple Selected Skills
  const handleBulkSetLevel = (skillIds: number[], targetMember: string | 'all', level: CompetencyLevel) => {
    if (skillIds.length === 0) return;

    setSkills(prev => {
      const updated = prev.map(s => {
        if (!skillIds.includes(s.id)) return s;
        const newRatings = { ...s.ratings };
        if (targetMember === 'all') {
          members.forEach(m => {
            newRatings[m.name] = level;
          });
        } else {
          newRatings[targetMember] = level;
        }
        return { ...s, ratings: newRatings };
      });
      persistSkillsToBackend(updated);
      return updated;
    });

    const targetLabel = targetMember === 'all' ? 'Tất cả thành viên' : targetMember;
    addAuditLog({
      memberName: targetLabel,
      skillId: skillIds[0],
      skillName: `${skillIds.length} kỹ năng đã chọn`,
      domain: 'Thao tác hàng loạt',
      oldValue: 'Hỗn hợp',
      newValue: level,
      changeType: 'batch_row',
      performedBy: 'Quản lý',
      notes: `Đặt hàng loạt mức ${level} cho ${skillIds.length} kỹ năng (${targetLabel})`
    });

    setSyncToastMessage(`Đã cập nhật mức ${level} cho ${skillIds.length} kỹ năng (${targetLabel}) thành công!`);
    setTimeout(() => setSyncToastMessage(null), 3500);
  };

  // Bulk Set Role for Multiple Selected Skills
  const handleBulkSetRole = (skillIds: number[], roleField: 'owner' | 'backup' | 'sme', memberName: string) => {
    if (skillIds.length === 0) return;

    setSkills(prev => {
      const updated = prev.map(s => {
        if (!skillIds.includes(s.id)) return s;
        return { ...s, [roleField]: memberName };
      });
      persistSkillsToBackend(updated);
      return updated;
    });

    const roleLabels = {
      owner: 'Người phụ trách chính',
      backup: 'Người dự phòng',
      sme: 'Chuyên gia'
    };

    addAuditLog({
      memberName: memberName || '(Xóa)',
      skillId: skillIds[0],
      skillName: `${skillIds.length} kỹ năng đã chọn`,
      domain: 'Thao tác hàng loạt',
      oldValue: 'Hỗn hợp',
      newValue: memberName || '(Trống)',
      changeType: `role_${roleField}` as any,
      performedBy: 'Quản lý',
      notes: `Gán hàng loạt ${roleLabels[roleField]}: ${memberName || 'Chưa gán'} cho ${skillIds.length} kỹ năng`
    });

    setSyncToastMessage(`Đã gán ${roleLabels[roleField]} cho ${skillIds.length} kỹ năng!`);
    setTimeout(() => setSyncToastMessage(null), 3500);
  };

  // Revert audit log entry
  const handleRevertAuditChange = (log: AuditLogEntry) => {
    if (log.changeType === 'rating' && log.oldValue) {
      handleUpdateRating(log.skillId, log.memberName, log.oldValue as CompetencyLevel, false);
      setSyncToastMessage(`Đã khôi phục đánh giá của ${log.memberName} cho kỹ năng "${log.skillName}" về ${log.oldValue}!`);
      setTimeout(() => setSyncToastMessage(null), 3500);
    }
  };

  // Reset Filters
  const handleResetFilters = () => {
    setFilter({
      searchQuery: '',
      selectedDomain: 'all',
      selectedMember: 'all',
      selectedProject: 'all',
      minLevel: 'all',
      roleStatus: 'all',
      sortBy: 'id',
      sortOrder: 'asc'
    });
  };

  const handleKPIFilterClick = (type: 'spof' | 'ready' | 'all') => {
    setActiveTab('matrix');
    if (type === 'spof') {
      setFilter(prev => ({ ...prev, roleStatus: 'risk_spof' }));
    } else if (type === 'ready') {
      setFilter(prev => ({ ...prev, minLevel: 'L2' }));
    } else {
      handleResetFilters();
    }
  };

  const handleSelectProjectFilter = (projectId: string) => {
    setFilter(prev => ({ ...prev, selectedProject: projectId }));
    setActiveTab('matrix');
  };

  const handleFilterMember = (memberName: string) => {
    setFilter(prev => ({ ...prev, selectedMember: memberName }));
    setActiveTab('matrix');
  };

  const handleOpenMemberProfile = (memberName: string) => {
    const mem = members.find(m => m.name === memberName);
    if (mem) {
      setSelectedProfileMember(mem);
    }
  };

  const handleImportSuccess = (importedSkills: SkillItem[], detectedMembers: string[], importedProjects?: Project[]) => {
    const existingNames = new Set(members.map(m => m.name));
    const newMembers = [...members];

    detectedMembers.forEach(name => {
      if (!existingNames.has(name)) {
        newMembers.push({
          id: name.toLowerCase().replace(/\s+/g, '-'),
          name,
          roleTitle: 'Infrastructure Engineer',
          email: `${name.toLowerCase()}@viendat.com`,
          avatarColor: 'from-slate-600 to-slate-800',
          primaryDomains: ['General']
        });
      }
    });

    setMembers(newMembers);
    setSkills(importedSkills);
    persistSkillsToBackend(importedSkills);
    if (isSupabaseConfigured()) {
      syncAllMembersToSupabase(newMembers).catch(e => console.warn('[Supabase] Members import sync warning:', e));
    }

    if (importedProjects && importedProjects.length > 0) {
      persistProjects(importedProjects);
      setSyncToastMessage(`Đã nhập thành công ${importedSkills.length} kỹ năng và ${importedProjects.length} dự án từ file Excel!`);
    } else {
      setSyncToastMessage(`Đã nhập thành công ${importedSkills.length} kỹ năng!`);
    }
    setTimeout(() => setSyncToastMessage(null), 4000);
  };

  return (
    <div 
      data-theme={theme}
      className={`min-h-screen flex flex-col font-sans transition-colors duration-150 ${
        theme === 'light' 
          ? 'bg-slate-50 text-slate-900' 
          : theme === 'blue' 
          ? 'bg-[#030a1a] text-[#f0f7ff]' 
          : 'bg-[#0b0f19] text-[#f1f5f9]'
      }`}
    >
      {/* Toast Notification Banner for Sync & Skill Add Events */}
      {syncToastMessage && (
        <div className="bg-indigo-900 text-white px-4 py-2 text-xs flex items-center justify-between no-print animate-in slide-in-from-top duration-200">
          <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="font-medium">{syncToastMessage}</span>
            </div>
            <button
              onClick={() => setSyncToastMessage(null)}
              className="text-white/80 hover:text-white p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* 1. Header (Sticky Top Bar Contract) */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenImport={() => setIsImportModalOpen(true)}
        onExportCSV={() => exportSkillsToCSV(filteredSkills, members)}
        onExportExcel={() => exportSkillsToExcel(skills, members, projects)}
        onPrintPDF={handleOpenPrintModal}
        totalSkills={skills.length}
        syncState={syncState}
        isSyncing={isSyncing}
        onTriggerSync={() => handleTriggerSync(false)}
        onOpenSyncSettings={() => setIsSyncSettingsOpen(true)}
        onOpenManualSync={() => setIsManualSyncModalOpen(true)}
        onOpenCompetencyModal={() => setIsCompetencyModalOpen(true)}
        onOpenAuditLog={() => setIsAuditLogOpen(true)}
        auditLogCount={auditLogs.length}
        onOpenSkillRequests={() => setIsSkillRequestModalOpen(true)}
        pendingRequestsCount={pendingRequestsCount}
        currentTheme={theme}
        onThemeChange={handleThemeChange}
        onUserChanged={setCurrentUser}
      />

      {/* 2. Main Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Tab 1: Skill Matrix View */}
        {activeTab === 'matrix' && (
          <div className="space-y-4">
            {/* KPI Stats Overview 2x2 Grid */}
            <StatsOverview
              skills={skills}
              members={members}
              onFilterClick={handleKPIFilterClick}
            />

            <FilterBar
              filter={filter}
              setFilter={setFilter}
              domains={currentDomains}
              members={members}
              projects={projects}
              totalCount={skills.length}
              filteredCount={filteredSkills.length}
              skills={skills}
              onReset={handleResetFilters}
              onOpenManageDomains={() => setIsManageDomainsModalOpen(true)}
            />

            <SkillMatrixTable
              skills={filteredSkills}
              members={members}
              onUpdateRating={handleUpdateRating}
              onUpdateRole={handleUpdateRole}
              groupByDomain={groupByDomain}
              setGroupByDomain={setGroupByDomain}
              onSelectMember={handleOpenMemberProfile}
              onOpenAddSkill={() => setIsAddSkillModalOpen(true)}
              onOpenCuratedModal={() => setIsCuratedModalOpen(true)}
              onOpenSortModal={() => setIsSortModalOpen(true)}
              onEditSkill={skill => setEditingSkill(skill)}
              onOpenManualSync={() => setIsManualSyncModalOpen(true)}
              onOpenCompetencyModal={() => setIsCompetencyModalOpen(true)}
              onOpenPrintModal={handleOpenPrintModal}
              heatmapConfig={heatmapConfig}
              onUpdateHeatmapConfig={handleSaveHeatmapConfig}
              onOpenHeatmapConfigModal={() => setIsHeatmapConfigModalOpen(true)}
              onBatchRowRating={handleBatchRowRating}
              onBatchDomainRating={handleBatchDomainRating}
              onBulkSetLevel={handleBulkSetLevel}
              onBulkSetRole={handleBulkSetRole}
              onOpenAuditLog={() => setIsAuditLogOpen(true)}
              auditLogCount={auditLogs.length}
              onOpenSkillRequests={() => setIsSkillRequestModalOpen(true)}
              pendingRequestsCount={pendingRequestsCount}
              onApprovePendingSkill={handleQuickApprovePendingSkill}
            />
          </div>
        )}

        {/* Tab 2: Realtime Live Charts */}
        {activeTab === 'charts' && (
          <RealtimeCharts
            skills={skills}
            members={members}
            syncState={syncState}
            onOpenPrintModal={handleOpenPrintModal}
          />
        )}

        {/* Tab 3: Projects & Gap Analysis */}
        {activeTab === 'projects' && (
          <ProjectFitView
            projects={projects}
            skills={skills}
            members={members}
            onSelectProjectFilter={handleSelectProjectFilter}
            onAddProject={handleAddProject}
            onUpdateProject={handleUpdateProject}
            onDeleteProject={handleDeleteProject}
            onClearDemoProjects={handleClearDemoProjects}
            onRestoreDemoProjects={handleRestoreDemoProjects}
          />
        )}
      </main>

      {/* 3. Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500 no-print mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700">Viendat Technology & Systems Integration</span>
            <span>·</span>
            <span>Hạ Tầng {currentDomains.length} Domains Skill Matrix</span>
          </div>
          <div className="flex items-center gap-2 text-slate-400">
            <span className={`w-2 h-2 rounded-full ${syncState?.enabled ? 'bg-emerald-500' : 'bg-slate-400'}`} />
            <span>Đồng bộ định kỳ SharePoint: {syncState?.enabled ? `Bật (${syncState.intervalMinutes || 5} phút)` : 'Tắt'}</span>
          </div>
        </div>
      </footer>

      {/* 4. Modals */}
      <MemberProfileModal
        member={selectedProfileMember}
        onClose={() => setSelectedProfileMember(null)}
        skills={skills}
        projects={projects}
        onFilterMember={handleFilterMember}
        onEditMember={member => setEditingMember(member)}
      />

      <EditMemberModal
        member={editingMember}
        isOpen={Boolean(editingMember)}
        onClose={() => setEditingMember(null)}
        availableDomains={currentDomains}
        onSaveMember={handleSaveMember}
        onDeleteMember={handleDeleteMember}
      />

      <ManageDomainsModal
        isOpen={isManageDomainsModalOpen}
        onClose={() => setIsManageDomainsModalOpen(false)}
        skills={skills}
        onRenameDomain={handleRenameDomain}
        onAddDomainWithSkill={handleAddDomainWithSkill}
        onDeleteDomain={handleDeleteDomain}
        onReassignSkillDomain={handleReassignSkillDomain}
      />

      <ExcelImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportSuccess={handleImportSuccess}
        existingMembers={members}
      />

      <SyncSettingsModal
        isOpen={isSyncSettingsOpen}
        onClose={() => setIsSyncSettingsOpen(false)}
        syncState={syncState}
        onTriggerSync={handleTriggerSync}
        onUpdateConfig={handleUpdateConfig}
        isSyncing={isSyncing}
      />

      {/* Two-Way SharePoint / OneDrive Sync Modal */}
      <TwoWaySharePointSyncModal
        isOpen={isManualSyncModalOpen}
        onClose={() => setIsManualSyncModalOpen(false)}
        syncState={syncState}
        skills={skills}
        members={members}
        onPullFromSharePoint={handleManualSyncOnline}
        onPullFromFile={handleManualSyncFile}
        onPushToSharePoint={handlePushToSharePoint}
        onUpdateConfig={handleUpdateConfig}
        isSyncing={isSyncing}
      />

      {/* Competency Definition Modal (Khung Tiêu Chuẩn Năng Lực L0 - L2) */}
      <CompetencyDefinitionModal
        isOpen={isCompetencyModalOpen}
        onClose={() => setIsCompetencyModalOpen(false)}
        onExportExcel={() => exportSkillsToExcel(skills, members)}
      />

      {/* Add Skill Modal */}
      <AddSkillModal
        isOpen={isAddSkillModalOpen}
        onClose={() => setIsAddSkillModalOpen(false)}
        domains={currentDomains}
        members={members}
        onAddSkill={handleAddSkill}
      />

      {/* Curated 2026 Infra Skills Modal */}
      <CuratedSkillsModal
        isOpen={isCuratedModalOpen}
        onClose={() => setIsCuratedModalOpen(false)}
        existingSkills={skills}
        members={members}
        onBatchAddSkills={handleBatchAddSkills}
      />

      {/* Sort & Organize Matrix Modal */}
      <SortOrganizeModal
        isOpen={isSortModalOpen}
        onClose={() => setIsSortModalOpen(false)}
        onApplySort={handleSortSkills}
      />

      {/* Edit Existing Skill Modal */}
      <EditSkillModal
        skill={editingSkill}
        isOpen={!!editingSkill}
        onClose={() => setEditingSkill(null)}
        domains={currentDomains}
        members={members}
        onSaveSkill={handleSaveSkillEdit}
        onDeleteSkill={handleDeleteSkill}
      />

      {/* Heatmap Customization & Editing Modal */}
      <HeatmapConfigModal
        isOpen={isHeatmapConfigModalOpen}
        onClose={() => setIsHeatmapConfigModalOpen(false)}
        config={heatmapConfig}
        onSaveConfig={handleSaveHeatmapConfig}
      />

      {/* Print Customization Modal */}
      <PrintCustomizationModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        skills={skills}
        members={members}
        domains={currentDomains}
        currentConfig={printConfig}
        onSaveConfig={handleSavePrintConfig}
        onPrint={handleExecutePrint}
      />

      {/* Audit Log (Lịch sử thay đổi) Drawer */}
      <AuditLogDrawer
        isOpen={isAuditLogOpen}
        onClose={() => setIsAuditLogOpen(false)}
        logs={auditLogs}
        members={members}
        onRevertChange={handleRevertAuditChange}
        onNavigateToSkill={handleNavigateToSkillFromAudit}
        onClearLogs={handleClearAuditLogs}
      />

      {/* Skill & Training Requests Modal */}
      <SkillRequestModal
        isOpen={isSkillRequestModalOpen}
        onClose={() => setIsSkillRequestModalOpen(false)}
        requests={skillRequests}
        domains={currentDomains}
        members={members}
        onSubmitRequest={handleSubmitSkillRequest}
        onApproveRequest={handleApproveSkillRequest}
        onRejectRequest={handleRejectSkillRequest}
        onSetInTraining={handleSetInTraining}
        onToggleUpvote={handleToggleUpvoteSkillRequest}
        onDeleteRequest={id => persistSkillRequests(skillRequests.filter(r => r.id !== id))}
      />

      {/* 5. Print-Only Report Container for PDF export */}
      <PrintReportView
        skills={skills}
        members={members}
        config={printConfig}
      />
    </div>
  );
}
