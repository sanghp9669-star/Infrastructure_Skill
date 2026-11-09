import { CompetencyDef, CompetencyLevel, Project, SkillItem, TeamMember } from '../types/skills';

export const COMPETENCY_DEFINITIONS: Record<CompetencyLevel, CompetencyDef> = {
  L0: {
    level: 'L0',
    name: 'Chưa biết gì',
    description: 'Chưa biết gì',
    criteria: 'Chưa tiếp cận công nghệ, chưa có kiến thức lý thuyết hay kinh nghiệm thực hành.',
    autonomy: 'Cần đào tạo và hướng dẫn từ đầu.',
    projectRole: 'Chưa tham gia phân công liên quan',
    score: 0,
    bgClass: 'bg-slate-100/80 dark:bg-slate-800/50',
    textClass: 'text-slate-500 dark:text-slate-400',
    borderClass: 'border-slate-200/80 dark:border-slate-700'
  },
  L1: {
    level: 'L1',
    name: 'Đã biết nhưng lab chưa thành công hoặc chưa lab',
    description: 'Đã biết nhưng lab chưa thành công hoặc chưa lab',
    criteria: 'Đã nắm khái niệm/lý thuyết hoặc đang thực hành lab dở dang, chưa dựng thành công bài Lab.',
    autonomy: 'Cần hướng dẫn và hỗ trợ xử lý lỗi khi thực hành lab.',
    projectRole: 'Đang tự học / Thực hành bài Lab',
    score: 1,
    bgClass: 'bg-orange-100/90 dark:bg-orange-950/40',
    textClass: 'text-orange-900 dark:text-orange-200',
    borderClass: 'border-orange-200/90 dark:border-orange-800'
  },
  L2: {
    level: 'L2',
    name: 'Đã biết và Lab thành công',
    description: 'Đã biết và Lab thành công',
    criteria: 'Đã nắm vững lý thuyết và tự tay triển khai Lab thành công, xác thực hoạt động thực tế.',
    autonomy: 'Tự chủ thực hành, triển khai độc lập và chịu trách nhiệm về kết quả cấu hình.',
    projectRole: 'Kỹ sư thực chiến / Sẵn sàng triển khai',
    score: 2,
    bgClass: 'bg-emerald-100/90 dark:bg-emerald-950/40',
    textClass: 'text-emerald-900 dark:text-emerald-200',
    borderClass: 'border-emerald-300/80 dark:border-emerald-700'
  },
  // Compatibility fallbacks for legacy references
  L3: {
    level: 'L2',
    name: 'Đã biết và Lab thành công',
    description: 'Đã biết và Lab thành công',
    criteria: 'Đã nắm vững lý thuyết và tự tay triển khai Lab thành công, xác thực hoạt động thực tế.',
    autonomy: 'Tự chủ thực hành, triển khai độc lập và chịu trách nhiệm về kết quả cấu hình.',
    projectRole: 'Kỹ sư thực chiến / Sẵn sàng triển khai',
    score: 2,
    bgClass: 'bg-emerald-100/90 dark:bg-emerald-950/40',
    textClass: 'text-emerald-900 dark:text-emerald-200',
    borderClass: 'border-emerald-300/80 dark:border-emerald-700'
  },
  L4: {
    level: 'L2',
    name: 'Đã biết và Lab thành công',
    description: 'Đã biết và Lab thành công',
    criteria: 'Đã nắm vững lý thuyết và tự tay triển khai Lab thành công, xác thực hoạt động thực tế.',
    autonomy: 'Tự chủ thực hành, triển khai độc lập và chịu trách nhiệm về kết quả cấu hình.',
    projectRole: 'Kỹ sư thực chiến / Sẵn sàng triển khai',
    score: 2,
    bgClass: 'bg-emerald-100/90 dark:bg-emerald-950/40',
    textClass: 'text-emerald-900 dark:text-emerald-200',
    borderClass: 'border-emerald-300/80 dark:border-emerald-700'
  },
  L5: {
    level: 'L2',
    name: 'Đã biết và Lab thành công',
    description: 'Đã biết và Lab thành công',
    criteria: 'Đã nắm vững lý thuyết và tự tay triển khai Lab thành công, xác thực hoạt động thực tế.',
    autonomy: 'Tự chủ thực hành, triển khai độc lập và chịu trách nhiệm về kết quả cấu hình.',
    projectRole: 'Kỹ sư thực chiến / Sẵn sàng triển khai',
    score: 2,
    bgClass: 'bg-emerald-100/90 dark:bg-emerald-950/40',
    textClass: 'text-emerald-900 dark:text-emerald-200',
    borderClass: 'border-emerald-300/80 dark:border-emerald-700'
  }
};

export const TEAM_MEMBERS: TeamMember[] = [
  {
    "id": "toan",
    "name": "Toàn",
    "email": "toan.nguyen@viendat.com",
    "avatarColor": "from-blue-600 to-indigo-700",
    "primaryDomains": [
      "Virtualization",
      "Storage & Backup"
    ]
  },
  {
    "id": "long",
    "name": "Long",
    "email": "long.tran@viendat.com",
    "avatarColor": "from-emerald-600 to-teal-700",
    "primaryDomains": [
      "Network",
      "Security",
      "Wireless"
    ]
  },
  {
    "id": "tuan",
    "name": "Tuấn",
    "email": "tuan.le@viendat.com",
    "avatarColor": "from-amber-600 to-orange-700",
    "primaryDomains": [
      "Container Platform",
      "Linux Server",
      "Database"
    ]
  },
  {
    "id": "duy",
    "name": "Duy",
    "email": "duy.nguyen@viendat.com",
    "avatarColor": "from-sky-600 to-indigo-800",
    "roleTitle": "Infrastructure Engineer",
    "primaryDomains": [
      "Container Platform",
      "Linux Server",
      "Syslog & Monitoring"
    ]
  },
  {
    "id": "sang",
    "name": "Sang",
    "email": "sanghp@viendat.com",
    "avatarColor": "from-violet-600 to-purple-800",
    "primaryDomains": [
      "Virtualization",
      "Windows Server",
      "Storage & Backup",
      "Microsoft 365",
      "AI Infrastructure"
    ]
  },
  {
    "id": "bao",
    "name": "Bảo",
    "email": "bao.pham@viendat.com",
    "avatarColor": "from-cyan-600 to-blue-700",
    "primaryDomains": [
      "Database",
      "Storage & Backup",
      "Syslog & Monitoring"
    ]
  },
  {
    "id": "nva",
    "name": "NV.A",
    "email": "nva@viendat.com",
    "roleTitle": "Infrastructure Engineer",
    "avatarColor": "from-slate-600 to-slate-800",
    "primaryDomains": [
      "Network",
      "Security"
    ]
  },
  {
    "id": "thong",
    "name": "Thông",
    "email": "thong.dang@viendat.com",
    "avatarColor": "from-fuchsia-600 to-purple-700",
    "primaryDomains": [
      "Automation & DevOps",
      "AI Infrastructure",
      "Syslog & Monitoring"
    ]
  },
  {
    "id": "khanh",
    "name": "Khánh",
    "email": "khanh.do@viendat.com",
    "avatarColor": "from-teal-600 to-cyan-700",
    "primaryDomains": [
      "UC & Contact Center",
      "Network",
      "Wireless"
    ]
  }
];


export const INITIAL_PROJECTS: Project[] = [];

export const INITIAL_SKILLS: SkillItem[] = [
  {
    "id": 1,
    "domain": "Virtualization",
    "skill": "VMware ESXi",
    "ratings": {
      "Toàn": "L2",
      "Long": "L2",
      "Tuấn": "L2",
      "Duy": "L2",
      "Sang": "L2",
      "Bảo": "L2",
      "Thông": "L2",
      "Khánh": "L2",
      "NV.A": "L0"
    },
    "owner": "",
    "backup": "",
    "sme": "",
    "evidence": ""
  },
  {
    "id": 2,
    "domain": "Virtualization",
    "skill": "VMware vCenter",
    "ratings": {
      "Toàn": "L2",
      "Long": "L2",
      "Tuấn": "L2",
      "Duy": "L2",
      "Sang": "L2",
      "Bảo": "L2",
      "Thông": "L2",
      "Khánh": "L2",
      "NV.A": "L0"
    },
    "owner": "",
    "backup": "",
    "sme": "",
    "evidence": ""
  },
  {
    "id": 3,
    "domain": "Virtualization",
    "skill": "VMware vSAN",
    "ratings": {
      "Toàn": "L2",
      "Long": "L1",
      "Tuấn": "L1",
      "Duy": "L2",
      "Sang": "L2",
      "Bảo": "L1",
      "Thông": "L0",
      "Khánh": "L1",
      "NV.A": "L0"
    },
    "owner": "",
    "backup": "",
    "sme": "",
    "evidence": ""
  },
  {
    "id": 4,
    "domain": "Virtualization",
    "skill": "VMware NSX",
    "ratings": {
      "Toàn": "L0",
      "Long": "L1",
      "Tuấn": "L1",
      "Duy": "L1",
      "Sang": "L1",
      "Bảo": "L1",
      "Thông": "L0",
      "Khánh": "L0",
      "NV.A": "L0"
    },
    "owner": "",
    "backup": "",
    "sme": "",
    "evidence": ""
  },
  {
    "id": 5,
    "domain": "Virtualization",
    "skill": "VMware Horizon",
    "ratings": {
      "Toàn": "L0",
      "Long": "L0",
      "Tuấn": "L2",
      "Duy": "L2",
      "Sang": "L2",
      "Bảo": "L1",
      "Thông": "L0",
      "Khánh": "L0",
      "NV.A": "L0"
    },
    "owner": "",
    "backup": "",
    "sme": "",
    "evidence": ""
  },
  {
    "id": 6,
    "domain": "Virtualization",
    "skill": "Proxmox VE",
    "ratings": {
      "Toàn": "L1",
      "Long": "L0",
      "Tuấn": "L1",
      "Duy": "L2",
      "Sang": "L2",
      "Bảo": "L2",
      "Thông": "L1",
      "Khánh": "L2",
      "NV.A": "L0"
    },
    "owner": "",
    "backup": "",
    "sme": "",
    "evidence": ""
  },
  {
    "id": 7,
    "domain": "Virtualization",
    "skill": "Hyper-V",
    "ratings": {
      "Toàn": "L2",
      "Long": "L1",
      "Tuấn": "L2",
      "Duy": "L2",
      "Sang": "L2",
      "Bảo": "L2",
      "Thông": "L2",
      "Khánh": "L1",
      "NV.A": "L0"
    },
    "owner": "",
    "backup": "",
    "sme": "",
    "evidence": ""
  },
  {
    "id": 8,
    "domain": "Virtualization",
    "skill": "XCP-ng",
    "ratings": {
      "Toàn": "L2",
      "Long": "L0",
      "Tuấn": "L0",
      "Duy": "L0",
      "Sang": "L2",
      "Bảo": "L0",
      "Thông": "L0",
      "Khánh": "L0",
      "NV.A": "L0"
    },
    "owner": "",
    "backup": "",
    "sme": "",
    "evidence": ""
  },
  {
    "id": 9,
    "domain": "Virtualization",
    "skill": "HPE",
    "ratings": {
      "Toàn": "L1",
      "Long": "L0",
      "Tuấn": "L1",
      "Duy": "L0",
      "Sang": "L0",
      "Bảo": "L0",
      "Thông": "L0",
      "Khánh": "L0",
      "NV.A": "L0"
    },
    "owner": "",
    "backup": "",
    "sme": "",
    "evidence": ""
  },
  {
    "id": 10,
    "domain": "Virtualization",
    "skill": "VergeIO",
    "ratings": {
      "Toàn": "L0",
      "Long": "L0",
      "Tuấn": "L0",
      "Duy": "L2",
      "Sang": "L2",
      "Bảo": "L0",
      "Thông": "L0",
      "Khánh": "L0",
      "NV.A": "L0"
    },
    "owner": "",
    "backup": "",
    "sme": "",
    "evidence": ""
  },
  {
    "id": 11,
    "domain": "Virtualization",
    "skill": "Nutanix",
    "ratings": {
      "Toàn": "L0",
      "Long": "L0",
      "Tuấn": "L0",
      "Duy": "L1",
      "Sang": "L1",
      "Bảo": "L0",
      "Thông": "L0",
      "Khánh": "L0",
      "NV.A": "L0"
    },
    "owner": "",
    "backup": "",
    "sme": "",
    "evidence": ""
  },
  {
    "id": 12,
    "domain": "Virtualization",
    "skill": "CloudStack",
    "ratings": {
      "Toàn": "L0",
      "Long": "L0",
      "Tuấn": "L0",
      "Duy": "L1",
      "Sang": "L2",
      "Bảo": "L0",
      "Thông": "L0",
      "Khánh": "L0",
      "NV.A": "L0"
    },
    "owner": "",
    "backup": "",
    "sme": "",
    "evidence": ""
  },
  {
    "id": 13,
    "domain": "Windows Server",
    "skill": "Windows Server Administration",
    "ratings": {
      "Toàn": "L2",
      "Long": "L2",
      "Tuấn": "L2",
      "Duy": "L2",
      "Sang": "L2",
      "Bảo": "L2",
      "Thông": "L1",
      "Khánh": "L2",
      "NV.A": "L0"
    },
    "owner": "",
    "backup": "",
    "sme": "",
    "evidence": ""
  },
  {
    "id": 14,
    "domain": "Windows Server",
    "skill": "Active Directory Domain Services (AD DS)",
    "ratings": {
      "Toàn": "L1",
      "Long": "L2",
      "Tuấn": "L2",
      "Duy": "L2",
      "Sang": "L2",
      "Bảo": "L2",
      "Thông": "L1",
      "Khánh": "L2",
      "NV.A": "L0"
    },
    "owner": "",
    "backup": "",
    "sme": "",
    "evidence": ""
  },
  {
    "id": 15,
    "domain": "Windows Server",
    "skill": "Group Policy (GPO)",
    "ratings": {
      "Toàn": "L1",
      "Long": "L1",
      "Tuấn": "L2",
      "Duy": "L1",
      "Sang": "L2",
      "Bảo": "L2",
      "Thông": "L1",
      "Khánh": "L2",
      "NV.A": "L0"
    },
    "owner": "",
    "backup": "",
    "sme": "",
    "evidence": ""
  },
  {
    "id": 16,
    "domain": "Windows Server",
    "skill": "Active Directory Certificate Services (AD CS)",
    "ratings": {
      "Toàn": "L1",
      "Long": "L1",
      "Tuấn": "L2",
      "Duy": "L2",
      "Sang": "L2",
      "Bảo": "L2",
      "Thông": "L1",
      "Khánh": "L1",
      "NV.A": "L0"
    },
    "owner": "",
    "backup": "",
    "sme": "",
    "evidence": ""
  },
  {
    "id": 17,
    "domain": "Windows Server",
    "skill": "DNS",
    "ratings": {
      "Toàn": "L1",
      "Long": "L2",
      "Tuấn": "L2",
      "Duy": "L2",
      "Sang": "L2",
      "Bảo": "L2",
      "Thông": "L2",
      "Khánh": "L2",
      "NV.A": "L0"
    },
    "owner": "",
    "backup": "",
    "sme": "",
    "evidence": ""
  },
  {
    "id": 18,
    "domain": "Windows Server",
    "skill": "DHCP",
    "ratings": {
      "Toàn": "L2",
      "Long": "L2",
      "Tuấn": "L2",
      "Duy": "L2",
      "Sang": "L2",
      "Bảo": "L2",
      "Thông": "L2",
      "Khánh": "L2",
      "NV.A": "L0"
    },
    "owner": "",
    "backup": "",
    "sme": "",
    "evidence": ""
  },
  {
    "id": 19,
    "domain": "Windows Server",
    "skill": "IIS",
    "ratings": {
      "Toàn": "L1",
      "Long": "L2",
      "Tuấn": "L2",
      "Duy": "L2",
      "Sang": "L1",
      "Bảo": "L2",
      "Thông": "L2",
      "Khánh": "L2",
      "NV.A": "L0"
    },
    "owner": "",
    "backup": "",
    "sme": "",
    "evidence": ""
  },
  {
    "id": 20,
    "domain": "Windows Server",
    "skill": "Failover Clustering",
    "ratings": {
      "Toàn": "L1",
      "Long": "L2",
      "Tuấn": "L2",
      "Duy": "L2",
      "Sang": "L2",
      "Bảo": "L2",
      "Thông": "L2",
      "Khánh": "L1",
      "NV.A": "L0"
    },
    "owner": "",
    "backup": "",
    "sme": "",
    "evidence": ""
  },
  {
    "id": 21,
    "domain": "Windows Server",
    "skill": "File Services",
    "ratings": {
      "Toàn": "L1",
      "Long": "L2",
      "Tuấn": "L2",
      "Duy": "L2",
      "Sang": "L2",
      "Bảo": "L2",
      "Thông": "L2",
      "Khánh": "L2",
      "NV.A": "L0"
    },
    "owner": "",
    "backup": "",
    "sme": "",
    "evidence": ""
  },
  {
    "id": 22,
    "domain": "Linux Server",
    "skill": "Ubuntu",
    "ratings": {
      "Toàn": "L2",
      "Long": "L2",
      "Tuấn": "L2",
      "Duy": "L2",
      "Sang": "L2",
      "Bảo": "L2",
      "Thông": "L2",
      "Khánh": "L2",
      "NV.A": "L0"
    },
    "owner": "",
    "backup": "",
    "sme": "",
    "evidence": ""
  },
  {
    "id": 23,
    "domain": "Linux Server",
    "skill": "RHEL",
    "ratings": {
      "Toàn": "L2",
      "Long": "L2",
      "Tuấn": "L2",
      "Duy": "L2",
      "Sang": "L2",
      "Bảo": "L2",
      "Thông": "L0",
      "Khánh": "L0",
      "NV.A": "L0"
    },
    "owner": "",
    "backup": "",
    "sme": "",
    "evidence": ""
  },
  {
    "id": 24,
    "domain": "Linux Server",
    "skill": "CentOS",
    "ratings": {
      "Toàn": "L1",
      "Long": "L2",
      "Tuấn": "L2",
      "Duy": "L2",
      "Sang": "L2",
      "Bảo": "L2",
      "Thông": "L2",
      "Khánh": "L1",
      "NV.A": "L0"
    },
    "owner": "",
    "backup": "",
    "sme": "",
    "evidence": ""
  },
  {
    "id": 25,
    "domain": "Linux Server",
    "skill": "Nginx",
    "ratings": {
      "Toàn": "L1",
      "Long": "L0",
      "Tuấn": "L1",
      "Duy": "L1",
      "Sang": "L2",
      "Bảo": "L1",
      "Thông": "L1",
      "Khánh": "L2",
      "NV.A": "L0"
    },
    "owner": "",
    "backup": "",
    "sme": "",
    "evidence": ""
  },
  {
    "id": 26,
    "domain": "Linux Server",
    "skill": "Apache",
    "ratings": {
      "Toàn": "L1",
      "Long": "L1",
      "Tuấn": "L1",
      "Duy": "L1",
      "Sang": "L1",
      "Bảo": "L1",
      "Thông": "L1",
      "Khánh": "L1",
      "NV.A": "L0"
    },
    "owner": "",
    "backup": "",
    "sme": "",
    "evidence": ""
  },
  {
    "id": 27,
    "domain": "Linux Server",
    "skill": "LVM",
    "ratings": {
      "Toàn": "L1",
      "Long": "L1",
      "Tuấn": "L2",
      "Duy": "L2",
      "Sang": "L2",
      "Bảo": "L2",
      "Thông": "L1",
      "Khánh": "L2",
      "NV.A": "L0"
    },
    "owner": "",
    "backup": "",
    "sme": "",
    "evidence": ""
  },
  {
    "id": 28,
    "domain": "Linux Server",
    "skill": "NFS",
    "ratings": {
      "Toàn": "L1",
      "Long": "L2",
      "Tuấn": "L2",
      "Duy": "L2",
      "Sang": "L2",
      "Bảo": "L2",
      "Thông": "L1",
      "Khánh": "L1",
      "NV.A": "L0"
    },
    "owner": "",
    "backup": "",
    "sme": "",
    "evidence": ""
  },
  {
    "id": 29,
    "domain": "Linux Server",
    "skill": "iSCSI",
    "ratings": {
      "Toàn": "L1",
      "Long": "L2",
      "Tuấn": "L2",
      "Duy": "L2",
      "Sang": "L2",
      "Bảo": "L2",
      "Thông": "L2",
      "Khánh": "L1",
      "NV.A": "L0"
    },
    "owner": "",
    "backup": "",
    "sme": "",
    "evidence": ""
  },
  {
    "id": 30,
    "domain": "Linux Server",
    "skill": "Samba",
    "ratings": {
      "Toàn": "L0",
      "Long": "L0",
      "Tuấn": "L1",
      "Duy": "L0",
      "Sang": "L1",
      "Bảo": "L0",
      "Thông": "L0",
      "Khánh": "L0",
      "NV.A": "L0"
    },
    "owner": "",
    "backup": "",
    "sme": "",
    "evidence": ""
  },
  {
    "id": 31,
    "domain": "Linux Server",
    "skill": "Tomcat",
    "ratings": {
      "Toàn": "L1",
      "Long": "L1",
      "Tuấn": "L1",
      "Duy": "L2",
      "Sang": "L1",
      "Bảo": "L1",
      "Thông": "L0",
      "Khánh": "L0",
      "NV.A": "L0"
    },
    "owner": "",
    "backup": "",
    "sme": "",
    "evidence": ""
  },
  {
    "id": 32,
    "domain": "Server Basic",
    "skill": "RAID",
    "ratings": {
      "Toàn": "L2",
      "Long": "L2",
      "Tuấn": "L2",
      "Duy": "L2",
      "Sang": "L2",
      "Bảo": "L2",
      "Thông": "L2",
      "Khánh": "L2",
      "NV.A": "L0"
    },
    "owner": "",
    "backup": "",
    "sme": "",
    "evidence": ""
  },
  {
    "id": 33,
    "domain": "Server Basic",
    "skill": "iLO/iDRAC",
    "ratings": {
      "Toàn": "L2",
      "Long": "L2",
      "Tuấn": "L2",
      "Duy": "L2",
      "Sang": "L2",
      "Bảo": "L2",
      "Thông": "L2",
      "Khánh": "L2",
      "NV.A": "L0"
    },
    "owner": "",
    "backup": "",
    "sme": "",
    "evidence": ""
  },
  {
    "id": 34,
    "domain": "Server Basic",
    "skill": "Firmware update",
    "ratings": {
      "Toàn": "L2",
      "Long": "L2",
      "Tuấn": "L2",
      "Duy": "L2",
      "Sang": "L2",
      "Bảo": "L2",
      "Thông": "L2",
      "Khánh": "L2",
      "NV.A": "L0"
    },
    "owner": "",
    "backup": "",
    "sme": "",
    "evidence": ""
  },
  {
    "id": 35,
    "domain": "Storage & Backup",
    "skill": "SAN",
    "ratings": {
      "Toàn": "L1",
      "Long": "L1",
      "Tuấn": "L1",
      "Duy": "L2",
      "Sang": "L2",
      "Bảo": "L1",
      "Thông": "L0",
      "Khánh": "L1",
      "NV.A": "L0"
    },
    "owner": "",
    "backup": "",
    "sme": "",
    "evidence": ""
  },
  {
    "id": 36,
    "domain": "Storage & Backup",
    "skill": "NAS",
    "ratings": {
      "Toàn": "L1",
      "Long": "L1",
      "Tuấn": "L2",
      "Duy": "L2",
      "Sang": "L2",
      "Bảo": "L2",
      "Thông": "L2",
      "Khánh": "L2",
      "NV.A": "L0"
    },
    "owner": "",
    "backup": "",
    "sme": "",
    "evidence": ""
  },
  {
    "id": 37,
    "domain": "Storage & Backup",
    "skill": "Nimble Storage",
    "ratings": {
      "Toàn": "L1",
      "Long": "L0",
      "Tuấn": "L2",
      "Duy": "L2",
      "Sang": "L2",
      "Bảo": "L0",
      "Thông": "L0",
      "Khánh": "L0",
      "NV.A": "L0"
    },
    "owner": "",
    "backup": "",
    "sme": "",
    "evidence": ""
  },
  {
    "id": 38,
    "domain": "Storage & Backup",
    "skill": "NexSan Storage",
    "ratings": {
      "Toàn": "L1",
      "Long": "L0",
      "Tuấn": "L1",
      "Duy": "L2",
      "Sang": "L2",
      "Bảo": "L0",
      "Thông": "L0",
      "Khánh": "L0",
      "NV.A": "L0"
    },
    "owner": "",
    "backup": "",
    "sme": "",
    "evidence": ""
  },
  {
    "id": 39,
    "domain": "Storage & Backup",
    "skill": "Synology",
    "ratings": {
      "Toàn": "L1",
      "Long": "L1",
      "Tuấn": "L2",
      "Duy": "L2",
      "Sang": "L2",
      "Bảo": "L2",
      "Thông": "L2",
      "Khánh": "L1",
      "NV.A": "L0"
    },
    "owner": "",
    "backup": "",
    "sme": "",
    "evidence": ""
  },
  {
    "id": 40,
    "domain": "Storage & Backup",
    "skill": "Qnap",
    "ratings": {
      "Toàn": "L1",
      "Long": "L0",
      "Tuấn": "L1",
      "Duy": "L2",
      "Sang": "L1",
      "Bảo": "L2",
      "Thông": "L0",
      "Khánh": "L0",
      "NV.A": "L0"
    },
    "owner": "",
    "backup": "",
    "sme": "",
    "evidence": ""
  },
  {
    "id": 41,
    "domain": "Storage & Backup",
    "skill": "TrueNAS",
    "ratings": {
      "Toàn": "L0",
      "Long": "L0",
      "Tuấn": "L2",
      "Duy": "L1",
      "Sang": "L2",
      "Bảo": "L2",
      "Thông": "L0",
      "Khánh": "L1",
      "NV.A": "L0"
    },
    "owner": "",
    "backup": "",
    "sme": "",
    "evidence": ""
  },
  {
    "id": 42,
    "domain": "Storage & Backup",
    "skill": "NetApp",
    "ratings": {
      "Toàn": "L0",
      "Long": "L0",
      "Tuấn": "L1",
      "Duy": "L1",
      "Sang": "L1",
      "Bảo": "L0",
      "Thông": "L0",
      "Khánh": "L0",
      "NV.A": "L0"
    },
    "owner": "",
    "backup": "",
    "sme": "",
    "evidence": ""
  },
  {
    "id": 43,
    "domain": "Storage & Backup",
    "skill": "Veeam",
    "ratings": {
      "Toàn": "L1",
      "Long": "L1",
      "Tuấn": "L2",
      "Duy": "L2",
      "Sang": "L2",
      "Bảo": "L2",
      "Thông": "L1",
      "Khánh": "L1",
      "NV.A": "L0"
    },
    "owner": "",
    "backup": "",
    "sme": "",
    "evidence": ""
  },
  {
    "id": 44,
    "domain": "Storage & Backup",
    "skill": "Commvault",
    "ratings": {
      "Toàn": "L0",
      "Long": "L0",
      "Tuấn": "L1",
      "Duy": "L1",
      "Sang": "L2",
      "Bảo": "L1",
      "Thông": "L0",
      "Khánh": "L0",
      "NV.A": "L0"
    },
    "owner": "",
    "backup": "",
    "sme": "",
    "evidence": ""
  },
  {
    "id": 45,
    "domain": "Storage & Backup",
    "skill": "Proxmox Backup",
    "ratings": {
      "Toàn": "L0",
      "Long": "L0",
      "Tuấn": "L1",
      "Duy": "L1",
      "Sang": "L2",
      "Bảo": "L0",
      "Thông": "L0",
      "Khánh": "L0",
      "NV.A": "L0"
    },
    "owner": "",
    "backup": "",
    "sme": "",
    "evidence": ""
  },
  {
    "id": 46,
    "domain": "Storage & Backup",
    "skill": "Bacula Backup",
    "ratings": {
      "Toàn": "L0",
      "Long": "L0",
      "Tuấn": "L1",
      "Duy": "L0",
      "Sang": "L2",
      "Bảo": "L2",
      "Thông": "L2",
      "Khánh": "L2",
      "NV.A": "L0"
    },
    "owner": "",
    "backup": "",
    "sme": "",
    "evidence": ""
  },
  {
    "id": 47,
    "domain": "Network",
    "skill": "Switching",
    "ratings": {
      "Toàn": "L2",
      "Long": "L2",
      "Tuấn": "L2",
      "Duy": "L2",
      "Sang": "L2",
      "Bảo": "L2",
      "Thông": "L2",
      "Khánh": "L2",
      "NV.A": "L0"
    },
    "owner": "",
    "backup": "",
    "sme": "",
    "evidence": ""
  },
  {
    "id": 48,
    "domain": "Network",
    "skill": "Routing",
    "ratings": {
      "Toàn": "L2",
      "Long": "L2",
      "Tuấn": "L2",
      "Duy": "L2",
      "Sang": "L2",
      "Bảo": "L2",
      "Thông": "L2",
      "Khánh": "L2",
      "NV.A": "L0"
    },
    "owner": "",
    "backup": "",
    "sme": "",
    "evidence": ""
  },
  {
    "id": 49,
    "domain": "Network",
    "skill": "Stacking",
    "ratings": {
      "Toàn": "L2",
      "Long": "L2",
      "Tuấn": "L2",
      "Duy": "L2",
      "Sang": "L2",
      "Bảo": "L2",
      "Thông": "L2",
      "Khánh": "L2",
      "NV.A": "L0"
    },
    "owner": "",
    "backup": "",
    "sme": "",
    "evidence": ""
  },
  {
    "id": 50,
    "domain": "Network",
    "skill": "OSPF",
    "ratings": {
      "Toàn": "L1",
      "Long": "L1",
      "Tuấn": "L2",
      "Duy": "L1",
      "Sang": "L2",
      "Bảo": "L2",
      "Thông": "L2",
      "Khánh": "L2",
      "NV.A": "L0"
    },
    "owner": "",
    "backup": "",
    "sme": "",
    "evidence": ""
  },
  {
    "id": 51,
    "domain": "Network",
    "skill": "BGP",
    "ratings": {
      "Toàn": "L1",
      "Long": "L1",
      "Tuấn": "L1",
      "Duy": "L1",
      "Sang": "L1",
      "Bảo": "L0",
      "Thông": "L0",
      "Khánh": "L1",
      "NV.A": "L0"
    },
    "owner": "",
    "backup": "",
    "sme": "",
    "evidence": ""
  },
  {
    "id": 52,
    "domain": "Network",
    "skill": "VLAN",
    "ratings": {
      "Toàn": "L2",
      "Long": "L2",
      "Tuấn": "L2",
      "Duy": "L2",
      "Sang": "L2",
      "Bảo": "L2",
      "Thông": "L2",
      "Khánh": "L2",
      "NV.A": "L0"
    },
    "owner": "",
    "backup": "",
    "sme": "",
    "evidence": ""
  },
  {
    "id": 53,
    "domain": "Network",
    "skill": "QoS",
    "ratings": {
      "Toàn": "L1",
      "Long": "L1",
      "Tuấn": "L1",
      "Duy": "L0",
      "Sang": "L1",
      "Bảo": "L0",
      "Thông": "L0",
      "Khánh": "L0",
      "NV.A": "L0"
    },
    "owner": "",
    "backup": "",
    "sme": "",
    "evidence": ""
  },
  {
    "id": 54,
    "domain": "Network",
    "skill": "Cisco ACI",
    "ratings": {
      "Toàn": "L0",
      "Long": "L0",
      "Tuấn": "L1",
      "Duy": "L1",
      "Sang": "L1",
      "Bảo": "L0",
      "Thông": "L0",
      "Khánh": "L0",
      "NV.A": "L0"
    },
    "owner": "",
    "backup": "",
    "sme": "",
    "evidence": ""
  },
  {
    "id": 55,
    "domain": "Wireless",
    "skill": "Aruba Wireless",
    "ratings": {
      "Toàn": "L1",
      "Long": "L2",
      "Tuấn": "L2",
      "Duy": "L2",
      "Sang": "L2",
      "Bảo": "L1",
      "Thông": "L0",
      "Khánh": "L1",
      "NV.A": "L0"
    },
    "owner": "",
    "backup": "",
    "sme": "",
    "evidence": ""
  },
  {
    "id": 56,
    "domain": "Wireless",
    "skill": "Cisco Wireless",
    "ratings": {
      "Toàn": "L1",
      "Long": "L1",
      "Tuấn": "L1",
      "Duy": "L1",
      "Sang": "L2",
      "Bảo": "L1",
      "Thông": "L0",
      "Khánh": "L0",
      "NV.A": "L0"
    },
    "owner": "",
    "backup": "",
    "sme": "",
    "evidence": ""
  },
  {
    "id": 57,
    "domain": "Wireless",
    "skill": "Allied Wireless",
    "ratings": {
      "Toàn": "L1",
      "Long": "L2",
      "Tuấn": "L2",
      "Duy": "L2",
      "Sang": "L2",
      "Bảo": "L1",
      "Thông": "L1",
      "Khánh": "L1",
      "NV.A": "L0"
    },
    "owner": "",
    "backup": "",
    "sme": "",
    "evidence": ""
  },
  {
    "id": 58,
    "domain": "Wireless",
    "skill": "Ruckus Wireless",
    "ratings": {
      "Toàn": "L1",
      "Long": "L1",
      "Tuấn": "L1",
      "Duy": "L2",
      "Sang": "L2",
      "Bảo": "L1",
      "Thông": "L1",
      "Khánh": "L0",
      "NV.A": "L0"
    },
    "owner": "",
    "backup": "",
    "sme": "",
    "evidence": ""
  },
  {
    "id": 59,
    "domain": "Wireless",
    "skill": "Ekahau Survey",
    "ratings": {
      "Toàn": "L2",
      "Long": "L2",
      "Tuấn": "L2",
      "Duy": "L1",
      "Sang": "L2",
      "Bảo": "L1",
      "Thông": "L1",
      "Khánh": "L0",
      "NV.A": "L0"
    },
    "owner": "",
    "backup": "",
    "sme": "",
    "evidence": ""
  },
  {
    "id": 60,
    "domain": "Wireless",
    "skill": "Wireless Design",
    "ratings": {
      "Toàn": "L0",
      "Long": "L2",
      "Tuấn": "L2",
      "Duy": "L2",
      "Sang": "L2",
      "Bảo": "L0",
      "Thông": "L0",
      "Khánh": "L0",
      "NV.A": "L0"
    },
    "owner": "",
    "backup": "",
    "sme": "",
    "evidence": ""
  },
  {
    "id": 61,
    "domain": "Firewall",
    "skill": "Palo Alto",
    "ratings": {
      "Toàn": "L2",
      "Long": "L1",
      "Tuấn": "L2",
      "Duy": "L2",
      "Sang": "L2",
      "Bảo": "L2",
      "Thông": "L1",
      "Khánh": "L1",
      "NV.A": "L0"
    },
    "owner": "",
    "backup": "",
    "sme": "",
    "evidence": ""
  },
  {
    "id": 62,
    "domain": "Firewall",
    "skill": "Check Point",
    "ratings": {
      "Toàn": "L2",
      "Long": "L2",
      "Tuấn": "L1",
      "Duy": "L1",
      "Sang": "L2",
      "Bảo": "L0",
      "Thông": "L0",
      "Khánh": "L0",
      "NV.A": "L0"
    },
    "owner": "",
    "backup": "",
    "sme": "",
    "evidence": ""
  },
  {
    "id": 63,
    "domain": "Firewall",
    "skill": "Fortinet",
    "ratings": {
      "Toàn": "L1",
      "Long": "L1",
      "Tuấn": "L2",
      "Duy": "L1",
      "Sang": "L2",
      "Bảo": "L1",
      "Thông": "L0",
      "Khánh": "L0",
      "NV.A": "L0"
    },
    "owner": "",
    "backup": "",
    "sme": "",
    "evidence": ""
  },
  {
    "id": 64,
    "domain": "Firewall",
    "skill": "Sophos",
    "ratings": {
      "Toàn": "L1",
      "Long": "L1",
      "Tuấn": "L2",
      "Duy": "L2",
      "Sang": "L1",
      "Bảo": "L1",
      "Thông": "L1",
      "Khánh": "L0",
      "NV.A": "L0"
    },
    "owner": "",
    "backup": "",
    "sme": "",
    "evidence": ""
  },
  {
    "id": 65,
    "domain": "Firewall",
    "skill": "OPNSense",
    "ratings": {
      "Toàn": "L0",
      "Long": "L0",
      "Tuấn": "L1",
      "Duy": "L1",
      "Sang": "L2",
      "Bảo": "L1",
      "Thông": "L1",
      "Khánh": "L1",
      "NV.A": "L0"
    },
    "owner": "",
    "backup": "",
    "sme": "",
    "evidence": ""
  },
  {
    "id": 66,
    "domain": "Firewall",
    "skill": "Cisco ASA",
    "ratings": {
      "Toàn": "L0",
      "Long": "L1",
      "Tuấn": "L1",
      "Duy": "L1",
      "Sang": "L2",
      "Bảo": "L0",
      "Thông": "L1",
      "Khánh": "L0",
      "NV.A": "L0"
    },
    "owner": "",
    "backup": "",
    "sme": "",
    "evidence": ""
  },
  {
    "id": 67,
    "domain": "Firewall",
    "skill": "Barracuda",
    "ratings": {
      "Toàn": "L0",
      "Long": "L1",
      "Tuấn": "L1",
      "Duy": "L1",
      "Sang": "L1",
      "Bảo": "L0",
      "Thông": "L0",
      "Khánh": "L0",
      "NV.A": "L0"
    },
    "owner": "",
    "backup": "",
    "sme": "",
    "evidence": ""
  },
  {
    "id": 68,
    "domain": "Firewall",
    "skill": "VPN(Client-to-site, Site-to-site)",
    "ratings": {
      "Toàn": "L1",
      "Long": "L2",
      "Tuấn": "L2",
      "Duy": "L1",
      "Sang": "L2",
      "Bảo": "L2",
      "Thông": "L2",
      "Khánh": "L1",
      "NV.A": "L0"
    },
    "owner": "",
    "backup": "",
    "sme": "",
    "evidence": ""
  },
  {
    "id": 69,
    "domain": "Security",
    "skill": "WAF",
    "ratings": {
      "Toàn": "L1",
      "Long": "L0",
      "Tuấn": "L2",
      "Duy": "L1",
      "Sang": "L1",
      "Bảo": "L1",
      "Thông": "L0",
      "Khánh": "L0",
      "NV.A": "L0"
    },
    "owner": "",
    "backup": "",
    "sme": "",
    "evidence": ""
  },
  {
    "id": 70,
    "domain": "Security",
    "skill": "Trend Micro",
    "ratings": {
      "Toàn": "L1",
      "Long": "L1",
      "Tuấn": "L2",
      "Duy": "L2",
      "Sang": "L1",
      "Bảo": "L2",
      "Thông": "L0",
      "Khánh": "L0",
      "NV.A": "L0"
    },
    "owner": "",
    "backup": "",
    "sme": "",
    "evidence": ""
  },
  {
    "id": 71,
    "domain": "Security",
    "skill": "Defender",
    "ratings": {
      "Toàn": "L0",
      "Long": "L0",
      "Tuấn": "L0",
      "Duy": "L0",
      "Sang": "L0",
      "Bảo": "L0",
      "Thông": "L0",
      "Khánh": "L0",
      "NV.A": "L0"
    },
    "owner": "",
    "backup": "",
    "sme": "",
    "evidence": ""
  },
  {
    "id": 72,
    "domain": "Security",
    "skill": "LDAP",
    "ratings": {
      "Toàn": "L1",
      "Long": "L1",
      "Tuấn": "L2",
      "Duy": "L2",
      "Sang": "L2",
      "Bảo": "L2",
      "Thông": "L2",
      "Khánh": "L0",
      "NV.A": "L0"
    },
    "owner": "",
    "backup": "",
    "sme": "",
    "evidence": ""
  },
  {
    "id": 73,
    "domain": "Security",
    "skill": "IDS/IPS",
    "ratings": {
      "Toàn": "L1",
      "Long": "L2",
      "Tuấn": "L2",
      "Duy": "L1",
      "Sang": "L2",
      "Bảo": "L1",
      "Thông": "L1",
      "Khánh": "L1",
      "NV.A": "L0"
    },
    "owner": "",
    "backup": "",
    "sme": "",
    "evidence": ""
  },
  {
    "id": 74,
    "domain": "Security",
    "skill": "NAC",
    "ratings": {
      "Toàn": "L0",
      "Long": "L1",
      "Tuấn": "L1",
      "Duy": "L2",
      "Sang": "L2",
      "Bảo": "L1",
      "Thông": "L1",
      "Khánh": "L0",
      "NV.A": "L0"
    },
    "owner": "",
    "backup": "",
    "sme": "",
    "evidence": ""
  },
  {
    "id": 75,
    "domain": "Security",
    "skill": "PKI",
    "ratings": {
      "Toàn": "L0",
      "Long": "L1",
      "Tuấn": "L1",
      "Duy": "L0",
      "Sang": "L2",
      "Bảo": "L0",
      "Thông": "L0",
      "Khánh": "L0",
      "NV.A": "L0"
    },
    "owner": "",
    "backup": "",
    "sme": "",
    "evidence": ""
  },
  {
    "id": 76,
    "domain": "Security",
    "skill": "MFA",
    "ratings": {
      "Toàn": "L0",
      "Long": "L0",
      "Tuấn": "L2",
      "Duy": "L1",
      "Sang": "L2",
      "Bảo": "L1",
      "Thông": "L1",
      "Khánh": "L0",
      "NV.A": "L0"
    },
    "owner": "",
    "backup": "",
    "sme": "",
    "evidence": ""
  },
  {
    "id": 77,
    "domain": "Security",
    "skill": "TACACS+",
    "ratings": {
      "Toàn": "L1",
      "Long": "L1",
      "Tuấn": "L2",
      "Duy": "L1",
      "Sang": "L2",
      "Bảo": "L0",
      "Thông": "L0",
      "Khánh": "L0",
      "NV.A": "L0"
    },
    "owner": "",
    "backup": "",
    "sme": "",
    "evidence": ""
  },
  {
    "id": 78,
    "domain": "Security",
    "skill": "RADIUS",
    "ratings": {
      "Toàn": "L1",
      "Long": "L1",
      "Tuấn": "L2",
      "Duy": "L2",
      "Sang": "L2",
      "Bảo": "L1",
      "Thông": "L1",
      "Khánh": "L0",
      "NV.A": "L0"
    },
    "owner": "",
    "backup": "",
    "sme": "",
    "evidence": ""
  },
  {
    "id": 79,
    "domain": "Syslog & Monitoring",
    "skill": "Zabbix",
    "ratings": {
      "Toàn": "L1",
      "Long": "L1",
      "Tuấn": "L2",
      "Duy": "L2",
      "Sang": "L2",
      "Bảo": "L2",
      "Thông": "L2",
      "Khánh": "L2",
      "NV.A": "L0"
    },
    "owner": "",
    "backup": "",
    "sme": "",
    "evidence": ""
  },
  {
    "id": 80,
    "domain": "Syslog & Monitoring",
    "skill": "Splunk",
    "ratings": {
      "Toàn": "L0",
      "Long": "L0",
      "Tuấn": "L1",
      "Duy": "L1",
      "Sang": "L1",
      "Bảo": "L1",
      "Thông": "L0",
      "Khánh": "L0",
      "NV.A": "L0"
    },
    "owner": "",
    "backup": "",
    "sme": "",
    "evidence": ""
  },
  {
    "id": 81,
    "domain": "Syslog & Monitoring",
    "skill": "PRTG",
    "ratings": {
      "Toàn": "L2",
      "Long": "L1",
      "Tuấn": "L1",
      "Duy": "L1",
      "Sang": "L2",
      "Bảo": "L0",
      "Thông": "L0",
      "Khánh": "L1",
      "NV.A": "L0"
    },
    "owner": "",
    "backup": "",
    "sme": "",
    "evidence": ""
  },
  {
    "id": 82,
    "domain": "Syslog & Monitoring",
    "skill": "OpManager",
    "ratings": {
      "Toàn": "L0",
      "Long": "L0",
      "Tuấn": "L1",
      "Duy": "L1",
      "Sang": "L2",
      "Bảo": "L0",
      "Thông": "L1",
      "Khánh": "L0",
      "NV.A": "L0"
    },
    "owner": "",
    "backup": "",
    "sme": "",
    "evidence": ""
  },
  {
    "id": 83,
    "domain": "Syslog & Monitoring",
    "skill": "LOG360",
    "ratings": {
      "Toàn": "L1",
      "Long": "L0",
      "Tuấn": "L1",
      "Duy": "L1",
      "Sang": "L2",
      "Bảo": "L0",
      "Thông": "L1",
      "Khánh": "L0",
      "NV.A": "L0"
    },
    "owner": "",
    "backup": "",
    "sme": "",
    "evidence": ""
  },
  {
    "id": 84,
    "domain": "Syslog & Monitoring",
    "skill": "PAM360",
    "ratings": {
      "Toàn": "L0",
      "Long": "L0",
      "Tuấn": "L1",
      "Duy": "L1",
      "Sang": "L1",
      "Bảo": "L0",
      "Thông": "L1",
      "Khánh": "L0",
      "NV.A": "L0"
    },
    "owner": "",
    "backup": "",
    "sme": "",
    "evidence": ""
  },
  {
    "id": 85,
    "domain": "Syslog & Monitoring",
    "skill": "Graylog",
    "ratings": {
      "Toàn": "L1",
      "Long": "L0",
      "Tuấn": "L2",
      "Duy": "L2",
      "Sang": "L2",
      "Bảo": "L2",
      "Thông": "L2",
      "Khánh": "L1",
      "NV.A": "L0"
    },
    "owner": "",
    "backup": "",
    "sme": "",
    "evidence": ""
  },
  {
    "id": 86,
    "domain": "Syslog & Monitoring",
    "skill": "OpenObserve",
    "ratings": {
      "Toàn": "L0",
      "Long": "L0",
      "Tuấn": "L2",
      "Duy": "L1",
      "Sang": "L1",
      "Bảo": "L2",
      "Thông": "L0",
      "Khánh": "L1",
      "NV.A": "L0"
    },
    "owner": "",
    "backup": "",
    "sme": "",
    "evidence": ""
  },
  {
    "id": 87,
    "domain": "Syslog & Monitoring",
    "skill": "SolarWinds",
    "ratings": {
      "Toàn": "L1",
      "Long": "L1",
      "Tuấn": "L1",
      "Duy": "L1",
      "Sang": "L2",
      "Bảo": "L0",
      "Thông": "L0",
      "Khánh": "L0",
      "NV.A": "L0"
    },
    "owner": "",
    "backup": "",
    "sme": "",
    "evidence": ""
  },
  {
    "id": 88,
    "domain": "Syslog & Monitoring",
    "skill": "ELK",
    "ratings": {
      "Toàn": "L0",
      "Long": "L0",
      "Tuấn": "L0",
      "Duy": "L0",
      "Sang": "L1",
      "Bảo": "L0",
      "Thông": "L0",
      "Khánh": "L0",
      "NV.A": "L0"
    },
    "owner": "",
    "backup": "",
    "sme": "",
    "evidence": ""
  },
  {
    "id": 89,
    "domain": "Syslog & Monitoring",
    "skill": "Grafana",
    "ratings": {
      "Toàn": "L2",
      "Long": "L1",
      "Tuấn": "L1",
      "Duy": "L2",
      "Sang": "L2",
      "Bảo": "L2",
      "Thông": "L1",
      "Khánh": "L2",
      "NV.A": "L0"
    },
    "owner": "",
    "backup": "",
    "sme": "",
    "evidence": ""
  },
  {
    "id": 90,
    "domain": "Database (Deploy & Basic configuration)",
    "skill": "SQL Server",
    "ratings": {
      "Toàn": "L2",
      "Long": "L2",
      "Tuấn": "L2",
      "Duy": "L2",
      "Sang": "L2",
      "Bảo": "L1",
      "Thông": "L1",
      "Khánh": "L1",
      "NV.A": "L0"
    },
    "owner": "",
    "backup": "",
    "sme": "",
    "evidence": ""
  },
  {
    "id": 91,
    "domain": "Database (Deploy & Basic configuration)",
    "skill": "PostgreSQL",
    "ratings": {
      "Toàn": "L2",
      "Long": "L2",
      "Tuấn": "L2",
      "Duy": "L2",
      "Sang": "L2",
      "Bảo": "L1",
      "Thông": "L1",
      "Khánh": "L1",
      "NV.A": "L0"
    },
    "owner": "",
    "backup": "",
    "sme": "",
    "evidence": ""
  },
  {
    "id": 92,
    "domain": "Database (Deploy & Basic configuration)",
    "skill": "MySQL",
    "ratings": {
      "Toàn": "L2",
      "Long": "L2",
      "Tuấn": "L2",
      "Duy": "L1",
      "Sang": "L2",
      "Bảo": "L1",
      "Thông": "L0",
      "Khánh": "L1",
      "NV.A": "L0"
    },
    "owner": "",
    "backup": "",
    "sme": "",
    "evidence": ""
  },
  {
    "id": 93,
    "domain": "Database (Deploy & Basic configuration)",
    "skill": "Oracle DB",
    "ratings": {
      "Toàn": "L0",
      "Long": "L0",
      "Tuấn": "L0",
      "Duy": "L2",
      "Sang": "L0",
      "Bảo": "L0",
      "Thông": "L0",
      "Khánh": "L0",
      "NV.A": "L0"
    },
    "owner": "",
    "backup": "",
    "sme": "",
    "evidence": ""
  },
  {
    "id": 94,
    "domain": "UC & Contact Center",
    "skill": "Cisco CUCM",
    "ratings": {
      "Toàn": "L2",
      "Long": "L1",
      "Tuấn": "L2",
      "Duy": "L1",
      "Sang": "L2",
      "Bảo": "L0",
      "Thông": "L0",
      "Khánh": "L0",
      "NV.A": "L0"
    },
    "owner": "",
    "backup": "",
    "sme": "",
    "evidence": ""
  },
  {
    "id": 95,
    "domain": "UC & Contact Center",
    "skill": "Cisco Meeting Server (CMS)",
    "ratings": {
      "Toàn": "L2",
      "Long": "L1",
      "Tuấn": "L2",
      "Duy": "L1",
      "Sang": "L1",
      "Bảo": "L0",
      "Thông": "L0",
      "Khánh": "L0",
      "NV.A": "L0"
    },
    "owner": "",
    "backup": "",
    "sme": "",
    "evidence": ""
  },
  {
    "id": 96,
    "domain": "UC & Contact Center",
    "skill": "Avaya Aura",
    "ratings": {
      "Toàn": "L2",
      "Long": "L2",
      "Tuấn": "L2",
      "Duy": "L2",
      "Sang": "L2",
      "Bảo": "L1",
      "Thông": "L1",
      "Khánh": "L0",
      "NV.A": "L0"
    },
    "owner": "",
    "backup": "",
    "sme": "",
    "evidence": ""
  },
  {
    "id": 97,
    "domain": "UC & Contact Center",
    "skill": "Avaya Unified Communication",
    "ratings": {
      "Toàn": "L2",
      "Long": "L1",
      "Tuấn": "L1",
      "Duy": "L2",
      "Sang": "L2",
      "Bảo": "L0",
      "Thông": "L0",
      "Khánh": "L0",
      "NV.A": "L0"
    },
    "owner": "",
    "backup": "",
    "sme": "",
    "evidence": ""
  },
  {
    "id": 98,
    "domain": "UC & Contact Center",
    "skill": "Avaya IPO (500v2 & SE)",
    "ratings": {
      "Toàn": "L2",
      "Long": "L2",
      "Tuấn": "L2",
      "Duy": "L0",
      "Sang": "L2",
      "Bảo": "L0",
      "Thông": "L0",
      "Khánh": "L0",
      "NV.A": "L0"
    },
    "owner": "",
    "backup": "",
    "sme": "",
    "evidence": ""
  },
  {
    "id": 99,
    "domain": "UC & Contact Center",
    "skill": "Avaya IPOCC",
    "ratings": {
      "Toàn": "L1",
      "Long": "L2",
      "Tuấn": "L1",
      "Duy": "L1",
      "Sang": "L2",
      "Bảo": "L0",
      "Thông": "L0",
      "Khánh": "L0",
      "NV.A": "L0"
    },
    "owner": "",
    "backup": "",
    "sme": "",
    "evidence": ""
  },
  {
    "id": 100,
    "domain": "UC & Contact Center",
    "skill": "Call Management System (CMS)",
    "ratings": {
      "Toàn": "L2",
      "Long": "L2",
      "Tuấn": "L1",
      "Duy": "L1",
      "Sang": "L1",
      "Bảo": "L0",
      "Thông": "L0",
      "Khánh": "L0",
      "NV.A": "L0"
    },
    "owner": "",
    "backup": "",
    "sme": "",
    "evidence": ""
  },
  {
    "id": 101,
    "domain": "UC & Contact Center",
    "skill": "Elite Multi Channel (EMC)",
    "ratings": {
      "Toàn": "L1",
      "Long": "L2",
      "Tuấn": "L1",
      "Duy": "L1",
      "Sang": "L1",
      "Bảo": "L0",
      "Thông": "L0",
      "Khánh": "L0",
      "NV.A": "L0"
    },
    "owner": "",
    "backup": "",
    "sme": "",
    "evidence": ""
  },
  {
    "id": 102,
    "domain": "UC & Contact Center",
    "skill": "Experience Portal (AEP)",
    "ratings": {
      "Toàn": "L1",
      "Long": "L1",
      "Tuấn": "L1",
      "Duy": "L2",
      "Sang": "L1",
      "Bảo": "L0",
      "Thông": "L0",
      "Khánh": "L0",
      "NV.A": "L0"
    },
    "owner": "",
    "backup": "",
    "sme": "",
    "evidence": ""
  },
  {
    "id": 103,
    "domain": "UC & Contact Center",
    "skill": "Avaya Contact Recorder (ACR)",
    "ratings": {
      "Toàn": "L2",
      "Long": "L2",
      "Tuấn": "L1",
      "Duy": "L1",
      "Sang": "L2",
      "Bảo": "L0",
      "Thông": "L0",
      "Khánh": "L0",
      "NV.A": "L0"
    },
    "owner": "",
    "backup": "",
    "sme": "",
    "evidence": ""
  },
  {
    "id": 104,
    "domain": "UC & Contact Center",
    "skill": "Avaya Workforce Engagement (WFE)",
    "ratings": {
      "Toàn": "L1",
      "Long": "L1",
      "Tuấn": "L1",
      "Duy": "L2",
      "Sang": "L2",
      "Bảo": "L0",
      "Thông": "L0",
      "Khánh": "L0",
      "NV.A": "L0"
    },
    "owner": "",
    "backup": "",
    "sme": "",
    "evidence": ""
  },
  {
    "id": 105,
    "domain": "UC & Contact Center",
    "skill": "NICE",
    "ratings": {
      "Toàn": "L2",
      "Long": "L1",
      "Tuấn": "L2",
      "Duy": "L2",
      "Sang": "L1",
      "Bảo": "L0",
      "Thông": "L0",
      "Khánh": "L0",
      "NV.A": "L0"
    },
    "owner": "",
    "backup": "",
    "sme": "",
    "evidence": ""
  },
  {
    "id": 106,
    "domain": "Container Platform",
    "skill": "Docker",
    "ratings": {
      "Toàn": "L1",
      "Long": "L1",
      "Tuấn": "L2",
      "Duy": "L2",
      "Sang": "L2",
      "Bảo": "L1",
      "Thông": "L1",
      "Khánh": "L2",
      "NV.A": "L0"
    },
    "owner": "",
    "backup": "",
    "sme": "",
    "evidence": ""
  },
  {
    "id": 107,
    "domain": "Container Platform",
    "skill": "Kubernetes",
    "ratings": {
      "Toàn": "L0",
      "Long": "L0",
      "Tuấn": "L1",
      "Duy": "L1",
      "Sang": "L0",
      "Bảo": "L0",
      "Thông": "L0",
      "Khánh": "L1",
      "NV.A": "L0"
    },
    "owner": "",
    "backup": "",
    "sme": "",
    "evidence": ""
  },
  {
    "id": 108,
    "domain": "Container Platform",
    "skill": "OpenShift",
    "ratings": {
      "Toàn": "L0",
      "Long": "L0",
      "Tuấn": "L0",
      "Duy": "L1",
      "Sang": "L0",
      "Bảo": "L0",
      "Thông": "L0",
      "Khánh": "L0",
      "NV.A": "L0"
    },
    "owner": "",
    "backup": "",
    "sme": "",
    "evidence": ""
  },
  {
    "id": 109,
    "domain": "Container Platform",
    "skill": "Rancher",
    "ratings": {
      "Toàn": "L0",
      "Long": "L0",
      "Tuấn": "L0",
      "Duy": "L0",
      "Sang": "L0",
      "Bảo": "L0",
      "Thông": "L0",
      "Khánh": "L0",
      "NV.A": "L0"
    },
    "owner": "",
    "backup": "",
    "sme": "",
    "evidence": ""
  },
  {
    "id": 110,
    "domain": "Basic Database Querying",
    "skill": "SQL Server",
    "ratings": {
      "Toàn": "L1",
      "Long": "L2",
      "Tuấn": "L2",
      "Duy": "L2",
      "Sang": "L2",
      "Bảo": "L1",
      "Thông": "L1",
      "Khánh": "L1",
      "NV.A": "L0"
    },
    "owner": "",
    "backup": "",
    "sme": "",
    "evidence": ""
  },
  {
    "id": 111,
    "domain": "Basic Database Querying",
    "skill": "PostgreSQL",
    "ratings": {
      "Toàn": "L1",
      "Long": "L2",
      "Tuấn": "L1",
      "Duy": "L2",
      "Sang": "L2",
      "Bảo": "L1",
      "Thông": "L1",
      "Khánh": "L1",
      "NV.A": "L0"
    },
    "owner": "",
    "backup": "",
    "sme": "",
    "evidence": ""
  },
  {
    "id": 112,
    "domain": "Basic Database Querying",
    "skill": "MySQL",
    "ratings": {
      "Toàn": "L1",
      "Long": "L2",
      "Tuấn": "L2",
      "Duy": "L2",
      "Sang": "L2",
      "Bảo": "L1",
      "Thông": "L0",
      "Khánh": "L1",
      "NV.A": "L0"
    },
    "owner": "",
    "backup": "",
    "sme": "",
    "evidence": ""
  },
  {
    "id": 113,
    "domain": "Basic Database Querying",
    "skill": "Oracle DB",
    "ratings": {
      "Toàn": "L0",
      "Long": "L0",
      "Tuấn": "L0",
      "Duy": "L2",
      "Sang": "L0",
      "Bảo": "L0",
      "Thông": "L0",
      "Khánh": "L0",
      "NV.A": "L0"
    },
    "owner": "",
    "backup": "",
    "sme": "",
    "evidence": ""
  },
  {
    "id": 114,
    "domain": "Basic Programming",
    "skill": "Python",
    "ratings": {
      "Toàn": "L1",
      "Long": "L0",
      "Tuấn": "L1",
      "Duy": "L2",
      "Sang": "L0",
      "Bảo": "L0",
      "Thông": "L1",
      "Khánh": "L2",
      "NV.A": "L0"
    },
    "owner": "",
    "backup": "",
    "sme": "",
    "evidence": ""
  },
  {
    "id": 115,
    "domain": "Basic Programming",
    "skill": "C#",
    "ratings": {
      "Toàn": "L0",
      "Long": "L0",
      "Tuấn": "L1",
      "Duy": "L2",
      "Sang": "L0",
      "Bảo": "L0",
      "Thông": "L0",
      "Khánh": "L1",
      "NV.A": "L0"
    },
    "owner": "",
    "backup": "",
    "sme": "",
    "evidence": ""
  },
  {
    "id": 116,
    "domain": "Basic Programming",
    "skill": "C++",
    "ratings": {
      "Toàn": "L0",
      "Long": "L0",
      "Tuấn": "L1",
      "Duy": "L2",
      "Sang": "L0",
      "Bảo": "L0",
      "Thông": "L1",
      "Khánh": "L1",
      "NV.A": "L0"
    },
    "owner": "",
    "backup": "",
    "sme": "",
    "evidence": ""
  },
  {
    "id": 117,
    "domain": "Basic Programming",
    "skill": "React",
    "ratings": {
      "Toàn": "L0",
      "Long": "L0",
      "Tuấn": "L0",
      "Duy": "L2",
      "Sang": "L0",
      "Bảo": "L0",
      "Thông": "L0",
      "Khánh": "L2",
      "NV.A": "L0"
    },
    "owner": "",
    "backup": "",
    "sme": "",
    "evidence": ""
  },
  {
    "id": 118,
    "domain": "Log file analysis and troubleshooting",
    "skill": "All systems, applications, ...",
    "ratings": {
      "Toàn": "L1",
      "Long": "L1",
      "Tuấn": "L1",
      "Duy": "L2",
      "Sang": "L1",
      "Bảo": "L1",
      "Thông": "L1",
      "Khánh": "L1",
      "NV.A": "L0"
    },
    "owner": "",
    "backup": "",
    "sme": "",
    "evidence": ""
  }
];

export const DOMAINS: string[] = Array.from(new Set(INITIAL_SKILLS.map(s => s.domain))).sort();
