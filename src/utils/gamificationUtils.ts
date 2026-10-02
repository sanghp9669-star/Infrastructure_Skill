import { CompetencyLevel, Project, SkillItem, TeamMember } from '../types/skills';

export interface EngineerBadge {
  id: string;
  name: string;
  category: 'domain' | 'role' | 'project' | 'mastery';
  icon: string;
  description: string;
  requirementText: string;
  colorClass: {
    bg: string;
    text: string;
    border: string;
    glow: string;
    gradient: string;
    chipBg: string;
  };
  tier: 'bronze' | 'silver' | 'gold' | 'diamond' | 'legendary';
  isUnlocked: boolean;
  progress: number;
  maxProgress: number;
}

export interface EngineerGamificationProfile {
  levelTitle: string;
  levelTier: number;
  totalXP: number;
  nextLevelXP: number;
  levelProgressPercent: number;
  l2Count: number;
  l1Count: number;
  smeCount: number;
  backupCount: number;
  projectLeadCount: number;
  projectActiveCount: number;
  unlockedBadges: EngineerBadge[];
  lockedBadges: EngineerBadge[];
  allBadges: EngineerBadge[];
}

export const calculateEngineerGamification = (
  memberName: string,
  skills: SkillItem[],
  projects: Project[] = []
): EngineerGamificationProfile => {
  // 1. Calculate Skill counts
  let l2Count = 0;
  let l1Count = 0;
  let smeCount = 0;
  let backupCount = 0;

  // Domain specific L2 counters
  let cloudL2 = 0;
  let networkL2 = 0;
  let securityL2 = 0;
  let virtualizationStorageL2 = 0;
  let databaseL2 = 0;
  let monitoringL2 = 0;
  let aiInfraL2 = 0;
  let contactCenterL2 = 0;

  skills.forEach(s => {
    const lvl = s.ratings[memberName] || 'L0';
    if (lvl === 'L2') {
      l2Count++;

      const d = s.domain.toLowerCase();
      const sk = s.skill.toLowerCase();

      if (/cloud|devops|kubernetes|docker|aws|azure|gcp/i.test(d) || /kubernetes|cloud|devops/i.test(sk)) {
        cloudL2++;
      }
      if (/network|routing|switching|sd-wan|cisco|wireless/i.test(d) || /bgp|ospf|cisco|vlan|switch|router/i.test(sk)) {
        networkL2++;
      }
      if (/security|firewall|pam|cyber|fortinet|palo alto|edr/i.test(d) || /firewall|vpn|pam|security|hardening|soc/i.test(sk)) {
        securityL2++;
      }
      if (/virtualization|storage|vmware|san|nas|backup|disaster|proxmox/i.test(d) || /vmware|proxmox|vsphere|san|nas|veeam|backup/i.test(sk)) {
        virtualizationStorageL2++;
      }
      if (/database|sql|oracle|postgres|mysql|redis/i.test(d) || /sql|oracle|database|db/i.test(sk)) {
        databaseL2++;
      }
      if (/monitoring|observability|syslog|grafana|prometheus|zabbix/i.test(d) || /grafana|prometheus|zabbix|snmp|syslog/i.test(sk)) {
        monitoringL2++;
      }
      if (/ai infra|gpu|rocev2|infiniband/i.test(d) || /rocev2|infiniband|gpu|ai cluster|ai /i.test(sk)) {
        aiInfraL2++;
      }
      if (/contact center|telecom|voip|sip/i.test(d) || /contact center|voip|sip|avaya|cisco uc/i.test(sk)) {
        contactCenterL2++;
      }
    } else if (lvl === 'L1') {
      l1Count++;
    }

    if (s.sme === memberName) smeCount++;
    if (s.backup === memberName) backupCount++;
  });

  // 2. Project counts
  let projectLeadCount = 0;
  let projectActiveCount = 0;

  projects.forEach(p => {
    if (p.lead === memberName) {
      projectLeadCount++;
    }
    if ((p.assignedMembers || []).includes(memberName)) {
      projectActiveCount++;
    }
  });

  // 3. Define All Badges
  const badgesData: Omit<EngineerBadge, 'isUnlocked' | 'progress'>[] = [
    // --- Domain Badges ---
    {
      id: 'cloud_architect',
      name: 'Cloud & DevOps Architect',
      category: 'domain',
      icon: '☁️',
      description: 'Chuyên gia làm chủ hạ tầng đám mây, ảo hóa container và CI/CD tự động hóa.',
      requirementText: 'Đạt tối thiểu 3 kỹ năng L2 trong nhóm Cloud & DevOps',
      tier: 'gold',
      maxProgress: 3,
      colorClass: {
        bg: 'bg-sky-50',
        text: 'text-sky-800',
        border: 'border-sky-300',
        glow: 'shadow-sky-200',
        gradient: 'from-sky-500 to-indigo-600',
        chipBg: 'bg-sky-100 text-sky-900 border-sky-300'
      }
    },
    {
      id: 'network_ninja',
      name: 'Network Ninja',
      category: 'domain',
      icon: '⚡',
      description: 'Làm chủ mạng doanh nghiệp, định tuyến phức hợp BGP/OSPF và kiến trúc SD-WAN.',
      requirementText: 'Đạt tối thiểu 3 kỹ năng L2 trong nhóm Enterprise Network',
      tier: 'gold',
      maxProgress: 3,
      colorClass: {
        bg: 'bg-amber-50',
        text: 'text-amber-900',
        border: 'border-amber-300',
        glow: 'shadow-amber-200',
        gradient: 'from-amber-500 to-orange-600',
        chipBg: 'bg-amber-100 text-amber-900 border-amber-300'
      }
    },
    {
      id: 'cyber_sentinel',
      name: 'Cyber Sentinel',
      category: 'domain',
      icon: '🛡️',
      description: 'Lá chắn an toàn thông tin, kiểm soát đặc quyền PAM và tường lửa thế hệ mới.',
      requirementText: 'Đạt tối thiểu 2 kỹ năng L2 trong nhóm Security & PAM',
      tier: 'silver',
      maxProgress: 2,
      colorClass: {
        bg: 'bg-rose-50',
        text: 'text-rose-800',
        border: 'border-rose-300',
        glow: 'shadow-rose-200',
        gradient: 'from-rose-500 to-red-600',
        chipBg: 'bg-rose-100 text-rose-900 border-rose-300'
      }
    },
    {
      id: 'storage_virtualization_master',
      name: 'Storage & VM Master',
      category: 'domain',
      icon: '💾',
      description: 'Bậc thầy ảo hóa VMware/Proxmox, SAN/NAS và sao lưu dự phòng thảm họa.',
      requirementText: 'Đạt tối thiểu 3 kỹ năng L2 trong nhóm Ảo Hóa & Lưu Trữ SAN/NAS',
      tier: 'gold',
      maxProgress: 3,
      colorClass: {
        bg: 'bg-blue-50',
        text: 'text-blue-800',
        border: 'border-blue-300',
        glow: 'shadow-blue-200',
        gradient: 'from-blue-600 to-cyan-600',
        chipBg: 'bg-blue-100 text-blue-900 border-blue-300'
      }
    },
    {
      id: 'database_maestro',
      name: 'Database Maestro',
      category: 'domain',
      icon: '🗄️',
      description: 'Quản trị cơ sở dữ liệu doanh nghiệp và giải pháp High Availability vững chắc.',
      requirementText: 'Đạt tối thiểu 2 kỹ năng L2 trong nhóm Database HA',
      tier: 'silver',
      maxProgress: 2,
      colorClass: {
        bg: 'bg-teal-50',
        text: 'text-teal-800',
        border: 'border-teal-300',
        glow: 'shadow-teal-200',
        gradient: 'from-teal-500 to-emerald-600',
        chipBg: 'bg-teal-100 text-teal-900 border-teal-300'
      }
    },
    {
      id: 'sre_observability',
      name: 'SRE & Observability Pioneer',
      category: 'domain',
      icon: '📈',
      description: 'Tiên phong giám sát hệ thống thời gian thực với Prometheus, Grafana và Zabbix.',
      requirementText: 'Đạt tối thiểu 2 kỹ năng L2 trong nhóm Monitoring & Syslog',
      tier: 'silver',
      maxProgress: 2,
      colorClass: {
        bg: 'bg-indigo-50',
        text: 'text-indigo-800',
        border: 'border-indigo-300',
        glow: 'shadow-indigo-200',
        gradient: 'from-indigo-500 to-purple-600',
        chipBg: 'bg-indigo-100 text-indigo-900 border-indigo-300'
      }
    },
    {
      id: 'ai_infra_vanguard',
      name: 'AI Infra Vanguard',
      category: 'domain',
      icon: '🤖',
      description: 'Đón đầu kỷ nguyên AI với hạ tầng RoCEv2/InfiniBand và siêu cụm tính toán GPU.',
      requirementText: 'Đạt tối thiểu 1 kỹ năng L2 trong nhóm AI Cluster Networking',
      tier: 'diamond',
      maxProgress: 1,
      colorClass: {
        bg: 'bg-violet-50',
        text: 'text-violet-800',
        border: 'border-violet-300',
        glow: 'shadow-violet-200',
        gradient: 'from-violet-600 to-fuchsia-600',
        chipBg: 'bg-violet-100 text-violet-900 border-violet-300'
      }
    },
    {
      id: 'telecom_contact_center',
      name: 'Contact Center Specialist',
      category: 'domain',
      icon: '🎧',
      description: 'Chuyên gia triển khai thoại VoIP, SIP Trunk và hệ thống tổng đài Contact Center.',
      requirementText: 'Đạt tối thiểu 2 kỹ năng L2 trong nhóm Contact Center & Voice',
      tier: 'bronze',
      maxProgress: 2,
      colorClass: {
        bg: 'bg-emerald-50',
        text: 'text-emerald-800',
        border: 'border-emerald-300',
        glow: 'shadow-emerald-200',
        gradient: 'from-emerald-500 to-teal-600',
        chipBg: 'bg-emerald-100 text-emerald-900 border-emerald-300'
      }
    },

    // --- Role & Leadership Badges ---
    {
      id: 'sme_guru',
      name: 'SME Guru (Chuyên Gia Trọng Yếu)',
      category: 'role',
      icon: '👑',
      description: 'Được tin cậy giữ vai trò Chuyên gia kỹ thuật (SME) cao nhất cho nhiều công nghệ cốt lõi.',
      requirementText: 'Được gán làm SME cho từ 3 kỹ năng trở lên',
      tier: 'diamond',
      maxProgress: 3,
      colorClass: {
        bg: 'bg-purple-50',
        text: 'text-purple-900',
        border: 'border-purple-300',
        glow: 'shadow-purple-200',
        gradient: 'from-purple-600 to-indigo-700',
        chipBg: 'bg-purple-100 text-purple-900 border-purple-300'
      }
    },
    {
      id: 'backup_hero',
      name: 'Reliable Shield (Dự Phòng Vững Chắc)',
      category: 'role',
      icon: '🛡️',
      description: 'Hậu phương tin cậy xóa bỏ rủi ro SPOF, sẵn sàng backup cho đồng đội 24/7.',
      requirementText: 'Được gán làm Người Dự Phòng (Backup) cho từ 4 kỹ năng trở lên',
      tier: 'gold',
      maxProgress: 4,
      colorClass: {
        bg: 'bg-blue-50',
        text: 'text-blue-900',
        border: 'border-blue-300',
        glow: 'shadow-blue-200',
        gradient: 'from-blue-500 to-indigo-600',
        chipBg: 'bg-blue-100 text-blue-900 border-blue-300'
      }
    },
    {
      id: 'mission_commander',
      name: 'Mission Commander (Thủ Lĩnh Dự Án)',
      category: 'project',
      icon: '🚀',
      description: 'Giữ vai trò Trưởng dự án (Lead) điều phối nhân sự và giải pháp hạ tầng triển khai.',
      requirementText: 'Làm Lead cho ít nhất 1 dự án thực tế',
      tier: 'diamond',
      maxProgress: 1,
      colorClass: {
        bg: 'bg-rose-50',
        text: 'text-rose-900',
        border: 'border-rose-300',
        glow: 'shadow-rose-200',
        gradient: 'from-rose-600 to-amber-600',
        chipBg: 'bg-rose-100 text-rose-900 border-rose-300'
      }
    },
    {
      id: 'multi_project_pillar',
      name: 'Multi-Project Pillar (Trụ Cột Dự Án)',
      category: 'project',
      icon: '🌟',
      description: 'Đóng góp năng lực thực chiến trong nhiều dự án doanh nghiệp cùng lúc.',
      requirementText: 'Được phân bổ nhân sự tham gia từ 2 dự án trở lên',
      tier: 'silver',
      maxProgress: 2,
      colorClass: {
        bg: 'bg-amber-50',
        text: 'text-amber-900',
        border: 'border-amber-300',
        glow: 'shadow-amber-200',
        gradient: 'from-amber-500 to-yellow-500',
        chipBg: 'bg-amber-100 text-amber-900 border-amber-300'
      }
    },

    // --- Mastery Badges ---
    {
      id: 'fullstack_titan',
      name: 'Full-Stack Infra Titan',
      category: 'mastery',
      icon: '💎',
      description: 'Huyền thoại hạ tầng đa năng với độ phủ thực chiến xuất sắc trên 10 kỹ năng L2.',
      requirementText: 'Đạt từ 10 kỹ năng L2 trở lên trên toàn bộ ma trận',
      tier: 'legendary',
      maxProgress: 10,
      colorClass: {
        bg: 'bg-indigo-950 text-white',
        text: 'text-indigo-100',
        border: 'border-indigo-400',
        glow: 'shadow-indigo-500/50',
        gradient: 'from-indigo-600 via-purple-600 to-pink-600',
        chipBg: 'bg-gradient-to-r from-indigo-900 to-purple-900 text-white border-indigo-400'
      }
    }
  ];

  // Map progress & unlocked status
  const allBadges: EngineerBadge[] = badgesData.map(b => {
    let progress = 0;
    switch (b.id) {
      case 'cloud_architect':
        progress = cloudL2;
        break;
      case 'network_ninja':
        progress = networkL2;
        break;
      case 'cyber_sentinel':
        progress = securityL2;
        break;
      case 'storage_virtualization_master':
        progress = virtualizationStorageL2;
        break;
      case 'database_maestro':
        progress = databaseL2;
        break;
      case 'sre_observability':
        progress = monitoringL2;
        break;
      case 'ai_infra_vanguard':
        progress = aiInfraL2;
        break;
      case 'telecom_contact_center':
        progress = contactCenterL2;
        break;
      case 'sme_guru':
        progress = smeCount;
        break;
      case 'backup_hero':
        progress = backupCount;
        break;
      case 'mission_commander':
        progress = projectLeadCount;
        break;
      case 'multi_project_pillar':
        progress = projectActiveCount;
        break;
      case 'fullstack_titan':
        progress = l2Count;
        break;
      default:
        progress = 0;
    }

    const isUnlocked = progress >= b.maxProgress;
    return {
      ...b,
      progress: Math.min(progress, b.maxProgress),
      isUnlocked
    };
  });

  const unlockedBadges = allBadges.filter(b => b.isUnlocked);
  const lockedBadges = allBadges.filter(b => !b.isUnlocked);

  // 4. Calculate XP and Level System
  // XP Formula:
  // L2 Skill: 50 XP
  // L1 Skill: 20 XP
  // SME Role: 40 XP
  // Backup Role: 25 XP
  // Project Lead: 60 XP
  // Project Assigned: 30 XP
  // Unlocked Badge: 100 XP
  const totalXP =
    l2Count * 50 +
    l1Count * 20 +
    smeCount * 40 +
    backupCount * 25 +
    projectLeadCount * 60 +
    projectActiveCount * 30 +
    unlockedBadges.length * 100;

  // Level Progression:
  // Tier 1: Apprentice Explorer (0 - 299 XP)
  // Tier 2: Advanced Practitioner (300 - 699 XP)
  // Tier 3: Principal Specialist (700 - 1199 XP)
  // Tier 4: Enterprise Infra Champion (1200+ XP)
  let levelTitle = 'Apprentice Explorer';
  let levelTier = 1;
  let nextLevelXP = 300;
  let levelBaseXP = 0;

  if (totalXP >= 1200) {
    levelTitle = 'Enterprise Infra Champion';
    levelTier = 4;
    nextLevelXP = 2000;
    levelBaseXP = 1200;
  } else if (totalXP >= 700) {
    levelTitle = 'Principal Specialist';
    levelTier = 3;
    nextLevelXP = 1200;
    levelBaseXP = 700;
  } else if (totalXP >= 300) {
    levelTitle = 'Advanced Practitioner';
    levelTier = 2;
    nextLevelXP = 700;
    levelBaseXP = 300;
  }

  const levelProgressPercent = Math.min(
    100,
    Math.round(((totalXP - levelBaseXP) / (nextLevelXP - levelBaseXP || 1)) * 100)
  );

  return {
    levelTitle,
    levelTier,
    totalXP,
    nextLevelXP,
    levelProgressPercent,
    l2Count,
    l1Count,
    smeCount,
    backupCount,
    projectLeadCount,
    projectActiveCount,
    unlockedBadges,
    lockedBadges,
    allBadges
  };
};
