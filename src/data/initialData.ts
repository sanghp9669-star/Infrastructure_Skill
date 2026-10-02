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

export const INITIAL_PROJECTS: Project[] = [
  {
    "id": "proj-1",
    "name": "Hệ Thống Private Cloud & Ảo Hóa Doanh Nghiệp",
    "code": "PRJ-VIRT-2026",
    "client": "Tập đoàn Tài chính Ngân hàng Á Châu",
    "description": "Triển khai cụm VMware vSphere 8 / vSAN / NSX và hệ thống lưu trữ All-Flash dự phòng thảm họa DR.",
    "status": "In Progress",
    "lead": "Sang",
    "assignedMembers": [
      "Sang",
      "Toàn",
      "Bảo",
      "Long"
    ],
    "startDate": "2026-02-01",
    "targetDate": "2026-08-31",
    "requiredSkills": [
      {
        "skillName": "VMware ESXi",
        "domain": "Virtualization",
        "minLevel": 'L2',
        "weight": 5
      },
      {
        "skillName": "VMware vCenter",
        "domain": "Virtualization",
        "minLevel": 'L2',
        "weight": 5
      },
      {
        "skillName": "VMware vSAN",
        "domain": "Virtualization",
        "minLevel": 'L2',
        "weight": 4
      },
      {
        "skillName": "VMware NSX",
        "domain": "Virtualization",
        "minLevel": 'L2',
        "weight": 4
      },
      {
        "skillName": "SAN",
        "domain": "Storage & Backup",
        "minLevel": 'L2',
        "weight": 4
      },
      {
        "skillName": "Veeam",
        "domain": "Storage & Backup",
        "minLevel": 'L2',
        "weight": 4
      },
      {
        "skillName": "DR Solution",
        "domain": "Storage & Backup",
        "minLevel": 'L2',
        "weight": 3
      },
      {
        "skillName": "Switching",
        "domain": "Network",
        "minLevel": 'L2',
        "weight": 3
      }
    ]
  },
  {
    "id": "proj-2",
    "name": "Nâng Cấp Hạ Tầng Mạng & Zero-Trust Security Datacenter",
    "code": "PRJ-NETSEC-2026",
    "client": "Viendat Viễn Thông Data Center",
    "description": "Hiện đại hóa Core Switch BGP/OSPF, triển khai cụm Tường lửa Palo Alto thế hệ mới và xác thực MFA 802.1X.",
    "status": "In Progress",
    "lead": "Long",
    "assignedMembers": [
      "Long",
      "NV.A",
      "Sang"
    ],
    "startDate": "2026-03-15",
    "targetDate": "2026-10-30",
    "requiredSkills": [
      {
        "skillName": "BGP",
        "domain": "Network",
        "minLevel": 'L2',
        "weight": 5
      },
      {
        "skillName": "OSPF",
        "domain": "Network",
        "minLevel": 'L2',
        "weight": 5
      },
      {
        "skillName": "Palo Alto",
        "domain": "Security",
        "minLevel": 'L2',
        "weight": 5
      },
      {
        "skillName": "Fortinet",
        "domain": "Security",
        "minLevel": 'L2',
        "weight": 4
      },
      {
        "skillName": "MFA",
        "domain": "Security",
        "minLevel": 'L2',
        "weight": 4
      },
      {
        "skillName": "RADIUS",
        "domain": "Security",
        "minLevel": 'L2',
        "weight": 3
      },
      {
        "skillName": "WAF",
        "domain": "Security",
        "minLevel": 'L2',
        "weight": 3
      }
    ]
  },
  {
    "id": "proj-3",
    "name": "Xây Dựng Nền Tảng Microservices Kubernetes & CI/CD Pipeline",
    "code": "PRJ-K8S-2026",
    "client": "Công ty Công nghệ Bán lẻ Viendat Retail",
    "description": "Thiết lập cụm Kubernetes on-premise kết hợp Rancher, GitLab CI/CD và giám sát Prometheus/Grafana.",
    "status": "Planning",
    "lead": "Tuấn",
    "assignedMembers": [
      "Tuấn",
      "Thông",
      "Bảo"
    ],
    "startDate": "2026-05-01",
    "targetDate": "2026-11-15",
    "requiredSkills": [
      {
        "skillName": "Kubernetes",
        "domain": "Container Platform",
        "minLevel": 'L2',
        "weight": 5
      },
      {
        "skillName": "Docker",
        "domain": "Container Platform",
        "minLevel": 'L2',
        "weight": 5
      },
      {
        "skillName": "Rancher",
        "domain": "Container Platform",
        "minLevel": 'L2',
        "weight": 4
      },
      {
        "skillName": "GitLab",
        "domain": "Automation & DevOps",
        "minLevel": 'L2',
        "weight": 4
      },
      {
        "skillName": "Grafana",
        "domain": "Syslog & Monitoring",
        "minLevel": 'L2',
        "weight": 4
      },
      {
        "skillName": "Ansible",
        "domain": "Automation & DevOps",
        "minLevel": 'L2',
        "weight": 3
      },
      {
        "skillName": "Ubuntu",
        "domain": "Linux Server",
        "minLevel": 'L2',
        "weight": 3
      }
    ]
  },
  {
    "id": "proj-4",
    "name": "Di Chuyển Hệ Thống Microsoft 365, Hybrid AD & Intune MDM",
    "code": "PRJ-M365-2026",
    "client": "Tổng Công ty Sản xuất & Xuất nhập khẩu",
    "description": "Di chuyển 2,500 hòm thư lên Exchange Online, cấu hình SharePoint Intranet và quản lý thiết bị đầu cuối với Intune.",
    "status": "Delivered",
    "lead": "NV.A",
    "assignedMembers": [
      "NV.A",
      "Sang",
      "Khánh"
    ],
    "startDate": "2025-09-01",
    "targetDate": "2026-01-20",
    "requiredSkills": [
      {
        "skillName": "Exchange Online",
        "domain": "Microsoft 365",
        "minLevel": 'L2',
        "weight": 5
      },
      {
        "skillName": "Active Directory Domain Services (AD DS)",
        "domain": "Windows Server",
        "minLevel": 'L2',
        "weight": 5
      },
      {
        "skillName": "Intune",
        "domain": "Microsoft 365",
        "minLevel": 'L2',
        "weight": 4
      },
      {
        "skillName": "Teams",
        "domain": "Microsoft 365",
        "minLevel": 'L2',
        "weight": 4
      },
      {
        "skillName": "SharePoint",
        "domain": "Microsoft 365",
        "minLevel": 'L2',
        "weight": 3
      },
      {
        "skillName": "Group Policy (GPO)",
        "domain": "Windows Server",
        "minLevel": 'L2',
        "weight": 3
      }
    ]
  },
  {
    "id": "proj-5",
    "name": "Triển Khai Cụm Contact Center Đa Kênh & AI Voice Bot",
    "code": "PRJ-CC-AI-2026",
    "client": "Trung Tâm Chăm Sóc Khách Hàng Viendat Care",
    "description": "Tích hợp Cisco CUCM/CMS, Avaya Aura và kết nối mô hình ngôn ngữ AI RAG Architecture cho trợ lý ảo.",
    "status": "In Progress",
    "lead": "Khánh",
    "assignedMembers": [
      "Khánh",
      "Thông",
      "Sang",
      "Long"
    ],
    "startDate": "2026-04-10",
    "targetDate": "2026-12-20",
    "requiredSkills": [
      {
        "skillName": "Cisco CUCM",
        "domain": "UC & Contact Center",
        "minLevel": 'L2',
        "weight": 5
      },
      {
        "skillName": "Avaya Aura",
        "domain": "UC & Contact Center",
        "minLevel": 'L2',
        "weight": 4
      },
      {
        "skillName": "NICE",
        "domain": "UC & Contact Center",
        "minLevel": 'L2',
        "weight": 4
      },
      {
        "skillName": "RAG Architecture",
        "domain": "AI Infrastructure",
        "minLevel": 'L2',
        "weight": 5
      },
      {
        "skillName": "Python",
        "domain": "Automation & DevOps",
        "minLevel": 'L2',
        "weight": 4
      },
      {
        "skillName": "Vector Database",
        "domain": "AI Infrastructure",
        "minLevel": 'L2',
        "weight": 3
      }
    ]
  }
];

export const INITIAL_SKILLS: SkillItem[] = [
  {
    "id": 1,
    "domain": "Virtualization",
    "skill": "VMware ESXi",
    "ratings": {
      "Toàn": 'L2',
      "Long": "L2",
      "Tuấn": "L1",
      "Sang": 'L2',
      "Bảo": "L2",
      "NV.A": "L1",
      "Thông": "L1",
      "Khánh": "L1"
    },
    "owner": "",
    "backup": "",
    "sme": ""
  },
  {
    "id": 2,
    "domain": "Virtualization",
    "skill": "VMware vCenter",
    "ratings": {
      "Toàn": 'L2',
      "Long": "L2",
      "Tuấn": "L1",
      "Sang": 'L2',
      "Bảo": "L2",
      "NV.A": "L1",
      "Thông": "L1",
      "Khánh": "L1"
    },
    "owner": "",
    "backup": "",
    "sme": ""
  },
  {
    "id": 3,
    "domain": "Virtualization",
    "skill": "VMware vSAN",
    "ratings": {
      "Toàn": 'L2',
      "Long": "L2",
      "Tuấn": "L1",
      "Sang": 'L2',
      "Bảo": "L2",
      "NV.A": "L1",
      "Thông": "L1",
      "Khánh": "L1"
    },
    "owner": "",
    "backup": "",
    "sme": ""
  },
  {
    "id": 4,
    "domain": "Virtualization",
    "skill": "VMware NSX",
    "ratings": {
      "Toàn": 'L2',
      "Long": "L2",
      "Tuấn": "L1",
      "Sang": 'L2',
      "Bảo": "L2",
      "NV.A": "L1",
      "Thông": "L1",
      "Khánh": "L1"
    },
    "owner": "",
    "backup": "",
    "sme": ""
  },
  {
    "id": 5,
    "domain": "Virtualization",
    "skill": "VMware Horizon",
    "ratings": {
      "Toàn": 'L2',
      "Long": "L2",
      "Tuấn": "L1",
      "Sang": 'L2',
      "Bảo": "L2",
      "NV.A": "L1",
      "Thông": "L1",
      "Khánh": "L1"
    },
    "owner": "",
    "backup": "",
    "sme": ""
  },
  {
    "id": 6,
    "domain": "Virtualization",
    "skill": "Proxmox VE",
    "ratings": {
      "Toàn": 'L2',
      "Long": "L2",
      "Tuấn": "L1",
      "Sang": 'L2',
      "Bảo": "L2",
      "NV.A": "L1",
      "Thông": "L1",
      "Khánh": "L1"
    },
    "owner": "",
    "backup": "",
    "sme": ""
  },
  {
    "id": 7,
    "domain": "Virtualization",
    "skill": "Hyper-V",
    "ratings": {
      "Toàn": 'L2',
      "Long": "L2",
      "Tuấn": "L1",
      "Sang": 'L2',
      "Bảo": "L2",
      "NV.A": "L1",
      "Thông": "L1",
      "Khánh": "L1"
    },
    "owner": "",
    "backup": "",
    "sme": ""
  },
  {
    "id": 8,
    "domain": "Virtualization",
    "skill": "VergeIO",
    "ratings": {
      "Toàn": 'L2',
      "Long": "L2",
      "Tuấn": "L1",
      "Sang": 'L2',
      "Bảo": "L2",
      "NV.A": "L1",
      "Thông": "L1",
      "Khánh": "L1"
    },
    "owner": "",
    "backup": "",
    "sme": ""
  },
  {
    "id": 9,
    "domain": "Virtualization",
    "skill": "Nutanix",
    "ratings": {
      "Toàn": 'L2',
      "Long": "L2",
      "Tuấn": "L1",
      "Sang": 'L2',
      "Bảo": "L2",
      "NV.A": "L1",
      "Thông": "L1",
      "Khánh": "L1"
    },
    "owner": "",
    "backup": "",
    "sme": ""
  },
  {
    "id": 10,
    "domain": "Virtualization",
    "skill": "CloudStack",
    "ratings": {
      "Toàn": 'L2',
      "Long": "L2",
      "Tuấn": "L1",
      "Sang": 'L2',
      "Bảo": "L2",
      "NV.A": "L1",
      "Thông": "L1",
      "Khánh": "L1"
    },
    "owner": "",
    "backup": "",
    "sme": ""
  },
  {
    "id": 11,
    "domain": "Container Platform",
    "skill": "Docker",
    "ratings": {
      "Toàn": "L2",
      "Long": "L1",
      "Tuấn": 'L2',
      "Sang": "L2",
      "Bảo": "L2",
      "NV.A": "L1",
      "Thông": 'L2',
      "Khánh": "L1"
    },
    "owner": "",
    "backup": "",
    "sme": ""
  },
  {
    "id": 12,
    "domain": "Container Platform",
    "skill": "Kubernetes",
    "ratings": {
      "Toàn": "L2",
      "Long": "L1",
      "Tuấn": 'L2',
      "Sang": "L2",
      "Bảo": "L2",
      "NV.A": "L1",
      "Thông": 'L2',
      "Khánh": "L1"
    },
    "owner": "",
    "backup": "",
    "sme": ""
  },
  {
    "id": 13,
    "domain": "Container Platform",
    "skill": "OpenShift",
    "ratings": {
      "Toàn": "L2",
      "Long": "L1",
      "Tuấn": 'L2',
      "Sang": "L2",
      "Bảo": "L2",
      "NV.A": "L1",
      "Thông": 'L2',
      "Khánh": "L1"
    },
    "owner": "",
    "backup": "",
    "sme": ""
  },
  {
    "id": 14,
    "domain": "Container Platform",
    "skill": "Rancher",
    "ratings": {
      "Toàn": "L2",
      "Long": "L1",
      "Tuấn": 'L2',
      "Sang": "L2",
      "Bảo": "L2",
      "NV.A": "L1",
      "Thông": 'L2',
      "Khánh": "L1"
    },
    "owner": "",
    "backup": "",
    "sme": ""
  },
  {
    "id": 15,
    "domain": "Windows Server",
    "skill": "Windows Server",
    "ratings": {
      "Toàn": "L1",
      "Long": "L1",
      "Tuấn": "L1",
      "Sang": 'L2',
      "Bảo": "L2",
      "NV.A": 'L2',
      "Thông": "L1",
      "Khánh": "L1"
    },
    "owner": "",
    "backup": "",
    "sme": ""
  },
  {
    "id": 16,
    "domain": "Windows Server",
    "skill": "Active Directory Domain Services (AD DS)",
    "ratings": {
      "Toàn": "L1",
      "Long": "L1",
      "Tuấn": "L1",
      "Sang": 'L2',
      "Bảo": "L2",
      "NV.A": 'L2',
      "Thông": "L1",
      "Khánh": "L1"
    },
    "owner": "",
    "backup": "",
    "sme": ""
  },
  {
    "id": 17,
    "domain": "Windows Server",
    "skill": "Group Policy (GPO)",
    "ratings": {
      "Toàn": "L1",
      "Long": "L1",
      "Tuấn": "L1",
      "Sang": 'L2',
      "Bảo": "L2",
      "NV.A": 'L2',
      "Thông": "L1",
      "Khánh": "L1"
    },
    "owner": "",
    "backup": "",
    "sme": ""
  },
  {
    "id": 18,
    "domain": "Windows Server",
    "skill": "Active Directory Certificate Services (AD CS)",
    "ratings": {
      "Toàn": "L1",
      "Long": "L1",
      "Tuấn": "L1",
      "Sang": 'L2',
      "Bảo": "L2",
      "NV.A": 'L2',
      "Thông": "L1",
      "Khánh": "L1"
    },
    "owner": "",
    "backup": "",
    "sme": ""
  },
  {
    "id": 19,
    "domain": "Windows Server",
    "skill": "DNS và DHCP",
    "ratings": {
      "Toàn": "L1",
      "Long": "L1",
      "Tuấn": "L1",
      "Sang": 'L2',
      "Bảo": "L2",
      "NV.A": 'L2',
      "Thông": "L1",
      "Khánh": "L1"
    },
    "owner": "",
    "backup": "",
    "sme": ""
  },
  {
    "id": 20,
    "domain": "Windows Server",
    "skill": "IIS",
    "ratings": {
      "Toàn": "L1",
      "Long": "L1",
      "Tuấn": "L1",
      "Sang": 'L2',
      "Bảo": "L2",
      "NV.A": 'L2',
      "Thông": "L1",
      "Khánh": "L1"
    },
    "owner": "",
    "backup": "",
    "sme": ""
  },
  {
    "id": 21,
    "domain": "Windows Server",
    "skill": "ADFS",
    "ratings": {
      "Toàn": "L1",
      "Long": "L1",
      "Tuấn": "L1",
      "Sang": 'L2',
      "Bảo": "L2",
      "NV.A": 'L2',
      "Thông": "L1",
      "Khánh": "L1"
    },
    "owner": "",
    "backup": "",
    "sme": ""
  },
  {
    "id": 22,
    "domain": "Linux Server",
    "skill": "Ubuntu",
    "ratings": {
      "Toàn": "L2",
      "Long": "L1",
      "Tuấn": 'L2',
      "Sang": "L2",
      "Bảo": "L2",
      "NV.A": "L1",
      "Thông": "L1",
      "Khánh": "L1"
    },
    "owner": "",
    "backup": "",
    "sme": ""
  },
  {
    "id": 23,
    "domain": "Linux Server",
    "skill": "RHEL",
    "ratings": {
      "Toàn": "L2",
      "Long": "L1",
      "Tuấn": 'L2',
      "Sang": "L2",
      "Bảo": "L2",
      "NV.A": "L1",
      "Thông": "L1",
      "Khánh": "L1"
    },
    "owner": "",
    "backup": "",
    "sme": ""
  },
  {
    "id": 24,
    "domain": "Linux Server",
    "skill": "Rocky Linux",
    "ratings": {
      "Toàn": "L2",
      "Long": "L1",
      "Tuấn": 'L2',
      "Sang": "L2",
      "Bảo": "L2",
      "NV.A": "L1",
      "Thông": "L1",
      "Khánh": "L1"
    },
    "owner": "",
    "backup": "",
    "sme": ""
  },
  {
    "id": 25,
    "domain": "Linux Server",
    "skill": "Nginx",
    "ratings": {
      "Toàn": "L2",
      "Long": "L1",
      "Tuấn": 'L2',
      "Sang": "L2",
      "Bảo": "L2",
      "NV.A": "L1",
      "Thông": "L1",
      "Khánh": "L1"
    },
    "owner": "",
    "backup": "",
    "sme": ""
  },
  {
    "id": 26,
    "domain": "Linux Server",
    "skill": "Apache",
    "ratings": {
      "Toàn": "L2",
      "Long": "L1",
      "Tuấn": 'L2',
      "Sang": "L2",
      "Bảo": "L2",
      "NV.A": "L1",
      "Thông": "L1",
      "Khánh": "L1"
    },
    "owner": "",
    "backup": "",
    "sme": ""
  },
  {
    "id": 27,
    "domain": "Linux Server",
    "skill": "Tomcat",
    "ratings": {
      "Toàn": "L2",
      "Long": "L1",
      "Tuấn": 'L2',
      "Sang": "L2",
      "Bảo": "L2",
      "NV.A": "L1",
      "Thông": "L1",
      "Khánh": "L1"
    },
    "owner": "",
    "backup": "",
    "sme": ""
  },
  {
    "id": 28,
    "domain": "Storage & Backup",
    "skill": "SAN",
    "ratings": {
      "Toàn": 'L2',
      "Long": "L1",
      "Tuấn": "L1",
      "Sang": 'L2',
      "Bảo": 'L2',
      "NV.A": "L1",
      "Thông": "L1",
      "Khánh": "L1"
    },
    "owner": "",
    "backup": "",
    "sme": ""
  },
  {
    "id": 29,
    "domain": "Storage & Backup",
    "skill": "NAS",
    "ratings": {
      "Toàn": 'L2',
      "Long": "L1",
      "Tuấn": "L1",
      "Sang": 'L2',
      "Bảo": 'L2',
      "NV.A": "L1",
      "Thông": "L1",
      "Khánh": "L1"
    },
    "owner": "",
    "backup": "",
    "sme": ""
  },
  {
    "id": 30,
    "domain": "Storage & Backup",
    "skill": "Nimble Storage",
    "ratings": {
      "Toàn": 'L2',
      "Long": "L1",
      "Tuấn": "L1",
      "Sang": 'L2',
      "Bảo": 'L2',
      "NV.A": "L1",
      "Thông": "L1",
      "Khánh": "L1"
    },
    "owner": "",
    "backup": "",
    "sme": ""
  },
  {
    "id": 31,
    "domain": "Storage & Backup",
    "skill": "NetApp",
    "ratings": {
      "Toàn": 'L2',
      "Long": "L1",
      "Tuấn": "L1",
      "Sang": 'L2',
      "Bảo": 'L2',
      "NV.A": "L1",
      "Thông": "L1",
      "Khánh": "L1"
    },
    "owner": "",
    "backup": "",
    "sme": ""
  },
  {
    "id": 32,
    "domain": "Storage & Backup",
    "skill": "Veeam",
    "ratings": {
      "Toàn": 'L2',
      "Long": "L1",
      "Tuấn": "L1",
      "Sang": 'L2',
      "Bảo": 'L2',
      "NV.A": "L1",
      "Thông": "L1",
      "Khánh": "L1"
    },
    "owner": "",
    "backup": "",
    "sme": ""
  },
  {
    "id": 33,
    "domain": "Storage & Backup",
    "skill": "Commvault",
    "ratings": {
      "Toàn": 'L2',
      "Long": "L1",
      "Tuấn": "L1",
      "Sang": 'L2',
      "Bảo": 'L2',
      "NV.A": "L1",
      "Thông": "L1",
      "Khánh": "L1"
    },
    "owner": "",
    "backup": "",
    "sme": ""
  },
  {
    "id": 34,
    "domain": "Storage & Backup",
    "skill": "DR Solution",
    "ratings": {
      "Toàn": 'L2',
      "Long": "L1",
      "Tuấn": "L1",
      "Sang": 'L2',
      "Bảo": 'L2',
      "NV.A": "L1",
      "Thông": "L1",
      "Khánh": "L1"
    },
    "owner": "",
    "backup": "",
    "sme": ""
  },
  {
    "id": 35,
    "domain": "Network",
    "skill": "Switching",
    "ratings": {
      "Toàn": "L1",
      "Long": 'L2',
      "Tuấn": "L1",
      "Sang": 'L2',
      "Bảo": "L2",
      "NV.A": "L1",
      "Thông": "L1",
      "Khánh": 'L2'
    },
    "owner": "",
    "backup": "",
    "sme": ""
  },
  {
    "id": 36,
    "domain": "Network",
    "skill": "Routing",
    "ratings": {
      "Toàn": "L1",
      "Long": 'L2',
      "Tuấn": "L1",
      "Sang": 'L2',
      "Bảo": "L2",
      "NV.A": "L1",
      "Thông": "L1",
      "Khánh": 'L2'
    },
    "owner": "",
    "backup": "",
    "sme": ""
  },
  {
    "id": 37,
    "domain": "Network",
    "skill": "OSPF",
    "ratings": {
      "Toàn": "L1",
      "Long": 'L2',
      "Tuấn": "L1",
      "Sang": 'L2',
      "Bảo": "L2",
      "NV.A": "L1",
      "Thông": "L1",
      "Khánh": 'L2'
    },
    "owner": "",
    "backup": "",
    "sme": ""
  },
  {
    "id": 38,
    "domain": "Network",
    "skill": "BGP",
    "ratings": {
      "Toàn": "L1",
      "Long": 'L2',
      "Tuấn": "L1",
      "Sang": 'L2',
      "Bảo": "L2",
      "NV.A": "L1",
      "Thông": "L1",
      "Khánh": 'L2'
    },
    "owner": "",
    "backup": "",
    "sme": ""
  },
  {
    "id": 39,
    "domain": "Network",
    "skill": "VLAN",
    "ratings": {
      "Toàn": "L1",
      "Long": 'L2',
      "Tuấn": "L1",
      "Sang": 'L2',
      "Bảo": "L2",
      "NV.A": "L1",
      "Thông": "L1",
      "Khánh": 'L2'
    },
    "owner": "",
    "backup": "",
    "sme": ""
  },
  {
    "id": 40,
    "domain": "Network",
    "skill": "QoS",
    "ratings": {
      "Toàn": "L1",
      "Long": 'L2',
      "Tuấn": "L1",
      "Sang": 'L2',
      "Bảo": "L2",
      "NV.A": "L1",
      "Thông": "L1",
      "Khánh": 'L2'
    },
    "owner": "",
    "backup": "",
    "sme": ""
  },
  {
    "id": 41,
    "domain": "Network",
    "skill": "Cisco ACI",
    "ratings": {
      "Toàn": "L1",
      "Long": 'L2',
      "Tuấn": "L1",
      "Sang": 'L2',
      "Bảo": "L2",
      "NV.A": "L1",
      "Thông": "L1",
      "Khánh": 'L2'
    },
    "owner": "",
    "backup": "",
    "sme": ""
  },
  {
    "id": 42,
    "domain": "Wireless",
    "skill": "Aruba Wireless",
    "ratings": {
      "Toàn": "L1",
      "Long": 'L2',
      "Tuấn": "L1",
      "Sang": "L2",
      "Bảo": "L2",
      "NV.A": "L1",
      "Thông": "L1",
      "Khánh": 'L2'
    },
    "owner": "",
    "backup": "",
    "sme": ""
  },
  {
    "id": 43,
    "domain": "Wireless",
    "skill": "Cisco Wireless",
    "ratings": {
      "Toàn": "L1",
      "Long": 'L2',
      "Tuấn": "L1",
      "Sang": "L2",
      "Bảo": "L2",
      "NV.A": "L1",
      "Thông": "L1",
      "Khánh": 'L2'
    },
    "owner": "",
    "backup": "",
    "sme": ""
  },
  {
    "id": 44,
    "domain": "Wireless",
    "skill": "Allied Wireless",
    "ratings": {
      "Toàn": "L1",
      "Long": 'L2',
      "Tuấn": "L1",
      "Sang": "L2",
      "Bảo": "L2",
      "NV.A": "L1",
      "Thông": "L1",
      "Khánh": 'L2'
    },
    "owner": "",
    "backup": "",
    "sme": ""
  },
  {
    "id": 45,
    "domain": "Wireless",
    "skill": "Ruckus",
    "ratings": {
      "Toàn": "L1",
      "Long": 'L2',
      "Tuấn": "L1",
      "Sang": "L2",
      "Bảo": "L2",
      "NV.A": "L1",
      "Thông": "L1",
      "Khánh": 'L2'
    },
    "owner": "",
    "backup": "",
    "sme": ""
  },
  {
    "id": 46,
    "domain": "Wireless",
    "skill": "Ekahau Survey",
    "ratings": {
      "Toàn": "L1",
      "Long": 'L2',
      "Tuấn": "L1",
      "Sang": "L2",
      "Bảo": "L2",
      "NV.A": "L1",
      "Thông": "L1",
      "Khánh": 'L2'
    },
    "owner": "",
    "backup": "",
    "sme": ""
  },
  {
    "id": 47,
    "domain": "Wireless",
    "skill": "Wireless Design",
    "ratings": {
      "Toàn": "L1",
      "Long": 'L2',
      "Tuấn": "L1",
      "Sang": "L2",
      "Bảo": "L2",
      "NV.A": "L1",
      "Thông": "L1",
      "Khánh": 'L2'
    },
    "owner": "",
    "backup": "",
    "sme": ""
  },
  {
    "id": 48,
    "domain": "Security",
    "skill": "Palo Alto",
    "ratings": {
      "Toàn": "L1",
      "Long": 'L2',
      "Tuấn": "L1",
      "Sang": 'L2',
      "Bảo": "L2",
      "NV.A": "L2",
      "Thông": "L1",
      "Khánh": "L1"
    },
    "owner": "",
    "backup": "",
    "sme": ""
  },
  {
    "id": 49,
    "domain": "Security",
    "skill": "Check Point",
    "ratings": {
      "Toàn": "L1",
      "Long": 'L2',
      "Tuấn": "L1",
      "Sang": 'L2',
      "Bảo": "L2",
      "NV.A": "L2",
      "Thông": "L1",
      "Khánh": "L1"
    },
    "owner": "",
    "backup": "",
    "sme": ""
  },
  {
    "id": 50,
    "domain": "Security",
    "skill": "Fortinet",
    "ratings": {
      "Toàn": "L1",
      "Long": 'L2',
      "Tuấn": "L1",
      "Sang": 'L2',
      "Bảo": "L2",
      "NV.A": "L2",
      "Thông": "L1",
      "Khánh": "L1"
    },
    "owner": "",
    "backup": "",
    "sme": ""
  },
  {
    "id": 51,
    "domain": "Security",
    "skill": "Sophos",
    "ratings": {
      "Toàn": "L1",
      "Long": 'L2',
      "Tuấn": "L1",
      "Sang": 'L2',
      "Bảo": "L2",
      "NV.A": "L2",
      "Thông": "L1",
      "Khánh": "L1"
    },
    "owner": "",
    "backup": "",
    "sme": ""
  },
  {
    "id": 52,
    "domain": "Security",
    "skill": "Cisco ASA",
    "ratings": {
      "Toàn": "L1",
      "Long": 'L2',
      "Tuấn": "L1",
      "Sang": 'L2',
      "Bảo": "L2",
      "NV.A": "L2",
      "Thông": "L1",
      "Khánh": "L1"
    },
    "owner": "",
    "backup": "",
    "sme": ""
  },
  {
    "id": 53,
    "domain": "Security",
    "skill": "WAF",
    "ratings": {
      "Toàn": "L1",
      "Long": 'L2',
      "Tuấn": "L1",
      "Sang": 'L2',
      "Bảo": "L2",
      "NV.A": "L2",
      "Thông": "L1",
      "Khánh": "L1"
    },
    "owner": "",
    "backup": "",
    "sme": ""
  },
  {
    "id": 54,
    "domain": "Security",
    "skill": "Trend Micro",
    "ratings": {
      "Toàn": "L1",
      "Long": 'L2',
      "Tuấn": "L1",
      "Sang": 'L2',
      "Bảo": "L2",
      "NV.A": "L2",
      "Thông": "L1",
      "Khánh": "L1"
    },
    "owner": "",
    "backup": "",
    "sme": ""
  },
  {
    "id": 55,
    "domain": "Security",
    "skill": "Defender",
    "ratings": {
      "Toàn": "L1",
      "Long": 'L2',
      "Tuấn": "L1",
      "Sang": 'L2',
      "Bảo": "L2",
      "NV.A": 'L2',
      "Thông": "L1",
      "Khánh": "L1"
    },
    "owner": "",
    "backup": "",
    "sme": ""
  },
  {
    "id": 56,
    "domain": "Security",
    "skill": "MFA",
    "ratings": {
      "Toàn": "L1",
      "Long": 'L2',
      "Tuấn": "L1",
      "Sang": 'L2',
      "Bảo": "L2",
      "NV.A": 'L2',
      "Thông": "L1",
      "Khánh": "L1"
    },
    "owner": "",
    "backup": "",
    "sme": ""
  },
  {
    "id": 57,
    "domain": "Security",
    "skill": "LDAP",
    "ratings": {
      "Toàn": "L1",
      "Long": 'L2',
      "Tuấn": "L1",
      "Sang": 'L2',
      "Bảo": "L2",
      "NV.A": 'L2',
      "Thông": "L1",
      "Khánh": "L1"
    },
    "owner": "",
    "backup": "",
    "sme": ""
  },
  {
    "id": 58,
    "domain": "Security",
    "skill": "RADIUS",
    "ratings": {
      "Toàn": "L1",
      "Long": 'L2',
      "Tuấn": "L1",
      "Sang": 'L2',
      "Bảo": "L2",
      "NV.A": "L2",
      "Thông": "L1",
      "Khánh": "L1"
    },
    "owner": "",
    "backup": "",
    "sme": ""
  },
  {
    "id": 59,
    "domain": "Syslog & Monitoring",
    "skill": "Zabbix",
    "ratings": {
      "Toàn": "L1",
      "Long": "L1",
      "Tuấn": "L1",
      "Sang": "L2",
      "Bảo": 'L2',
      "NV.A": "L1",
      "Thông": 'L2',
      "Khánh": "L1"
    },
    "owner": "",
    "backup": "",
    "sme": ""
  },
  {
    "id": 60,
    "domain": "Syslog & Monitoring",
    "skill": "Splunk",
    "ratings": {
      "Toàn": "L1",
      "Long": "L1",
      "Tuấn": "L1",
      "Sang": "L2",
      "Bảo": 'L2',
      "NV.A": "L1",
      "Thông": 'L2',
      "Khánh": "L1"
    },
    "owner": "",
    "backup": "",
    "sme": ""
  },
  {
    "id": 61,
    "domain": "Syslog & Monitoring",
    "skill": "PRTG",
    "ratings": {
      "Toàn": "L1",
      "Long": "L1",
      "Tuấn": "L1",
      "Sang": "L2",
      "Bảo": 'L2',
      "NV.A": "L1",
      "Thông": 'L2',
      "Khánh": "L1"
    },
    "owner": "",
    "backup": "",
    "sme": ""
  },
  {
    "id": 62,
    "domain": "Syslog & Monitoring",
    "skill": "Graylog",
    "ratings": {
      "Toàn": "L1",
      "Long": "L1",
      "Tuấn": "L1",
      "Sang": "L2",
      "Bảo": 'L2',
      "NV.A": "L1",
      "Thông": 'L2',
      "Khánh": "L1"
    },
    "owner": "",
    "backup": "",
    "sme": ""
  },
  {
    "id": 63,
    "domain": "Syslog & Monitoring",
    "skill": "OpenObserve",
    "ratings": {
      "Toàn": "L1",
      "Long": "L1",
      "Tuấn": "L1",
      "Sang": "L2",
      "Bảo": 'L2',
      "NV.A": "L1",
      "Thông": 'L2',
      "Khánh": "L1"
    },
    "owner": "",
    "backup": "",
    "sme": ""
  },
  {
    "id": 64,
    "domain": "Syslog & Monitoring",
    "skill": "SolarWinds",
    "ratings": {
      "Toàn": "L1",
      "Long": "L1",
      "Tuấn": "L1",
      "Sang": "L2",
      "Bảo": 'L2',
      "NV.A": "L1",
      "Thông": 'L2',
      "Khánh": "L1"
    },
    "owner": "",
    "backup": "",
    "sme": ""
  },
  {
    "id": 65,
    "domain": "Syslog & Monitoring",
    "skill": "ELK",
    "ratings": {
      "Toàn": "L1",
      "Long": "L1",
      "Tuấn": "L1",
      "Sang": "L2",
      "Bảo": 'L2',
      "NV.A": "L1",
      "Thông": 'L2',
      "Khánh": "L1"
    },
    "owner": "",
    "backup": "",
    "sme": ""
  },
  {
    "id": 66,
    "domain": "Syslog & Monitoring",
    "skill": "Grafana",
    "ratings": {
      "Toàn": "L1",
      "Long": "L1",
      "Tuấn": "L1",
      "Sang": "L2",
      "Bảo": 'L2',
      "NV.A": "L1",
      "Thông": 'L2',
      "Khánh": "L1"
    },
    "owner": "",
    "backup": "",
    "sme": ""
  },
  {
    "id": 67,
    "domain": "Database",
    "skill": "SQL Server",
    "ratings": {
      "Toàn": "L1",
      "Long": "L1",
      "Tuấn": "L2",
      "Sang": "L2",
      "Bảo": 'L2',
      "NV.A": "L1",
      "Thông": "L1",
      "Khánh": "L1"
    },
    "owner": "",
    "backup": "",
    "sme": ""
  },
  {
    "id": 68,
    "domain": "Database",
    "skill": "PostgreSQL",
    "ratings": {
      "Toàn": "L1",
      "Long": "L1",
      "Tuấn": 'L2',
      "Sang": "L2",
      "Bảo": 'L2',
      "NV.A": "L1",
      "Thông": "L1",
      "Khánh": "L1"
    },
    "owner": "",
    "backup": "",
    "sme": ""
  },
  {
    "id": 69,
    "domain": "Database",
    "skill": "MySQL",
    "ratings": {
      "Toàn": "L1",
      "Long": "L1",
      "Tuấn": 'L2',
      "Sang": "L2",
      "Bảo": 'L2',
      "NV.A": "L1",
      "Thông": "L1",
      "Khánh": "L1"
    },
    "owner": "",
    "backup": "",
    "sme": ""
  },
  {
    "id": 70,
    "domain": "Database",
    "skill": "Oracle DB",
    "ratings": {
      "Toàn": "L1",
      "Long": "L1",
      "Tuấn": "L2",
      "Sang": "L2",
      "Bảo": 'L2',
      "NV.A": "L1",
      "Thông": "L1",
      "Khánh": "L1"
    },
    "owner": "",
    "backup": "",
    "sme": ""
  },
  {
    "id": 71,
    "domain": "Microsoft 365",
    "skill": "Exchange Online",
    "ratings": {
      "Toàn": "L1",
      "Long": "L1",
      "Tuấn": "L1",
      "Sang": 'L2',
      "Bảo": "L2",
      "NV.A": 'L2',
      "Thông": "L1",
      "Khánh": "L2"
    },
    "owner": "",
    "backup": "",
    "sme": ""
  },
  {
    "id": 72,
    "domain": "Microsoft 365",
    "skill": "Teams",
    "ratings": {
      "Toàn": "L1",
      "Long": "L1",
      "Tuấn": "L1",
      "Sang": 'L2',
      "Bảo": "L2",
      "NV.A": 'L2',
      "Thông": "L1",
      "Khánh": 'L2'
    },
    "owner": "",
    "backup": "",
    "sme": ""
  },
  {
    "id": 73,
    "domain": "Microsoft 365",
    "skill": "SharePoint",
    "ratings": {
      "Toàn": "L1",
      "Long": "L1",
      "Tuấn": "L1",
      "Sang": 'L2',
      "Bảo": "L2",
      "NV.A": 'L2',
      "Thông": "L1",
      "Khánh": "L2"
    },
    "owner": "",
    "backup": "",
    "sme": ""
  },
  {
    "id": 74,
    "domain": "Microsoft 365",
    "skill": "OneDrive",
    "ratings": {
      "Toàn": "L1",
      "Long": "L1",
      "Tuấn": "L1",
      "Sang": 'L2',
      "Bảo": "L2",
      "NV.A": 'L2',
      "Thông": "L1",
      "Khánh": "L2"
    },
    "owner": "",
    "backup": "",
    "sme": ""
  },
  {
    "id": 75,
    "domain": "Microsoft 365",
    "skill": "Intune",
    "ratings": {
      "Toàn": "L1",
      "Long": "L1",
      "Tuấn": "L1",
      "Sang": 'L2',
      "Bảo": "L2",
      "NV.A": 'L2',
      "Thông": "L1",
      "Khánh": "L2"
    },
    "owner": "",
    "backup": "",
    "sme": ""
  },
  {
    "id": 76,
    "domain": "UC & Contact Center",
    "skill": "Cisco CUCM",
    "ratings": {
      "Toàn": "L1",
      "Long": "L1",
      "Tuấn": "L1",
      "Sang": "L2",
      "Bảo": "L2",
      "NV.A": "L1",
      "Thông": "L1",
      "Khánh": 'L2'
    },
    "owner": "",
    "backup": "",
    "sme": ""
  },
  {
    "id": 77,
    "domain": "UC & Contact Center",
    "skill": "Cisco CMS",
    "ratings": {
      "Toàn": "L1",
      "Long": "L1",
      "Tuấn": "L1",
      "Sang": "L2",
      "Bảo": "L2",
      "NV.A": "L1",
      "Thông": "L1",
      "Khánh": 'L2'
    },
    "owner": "",
    "backup": "",
    "sme": ""
  },
  {
    "id": 78,
    "domain": "UC & Contact Center",
    "skill": "Avaya Aura",
    "ratings": {
      "Toàn": "L1",
      "Long": "L1",
      "Tuấn": "L1",
      "Sang": "L2",
      "Bảo": "L2",
      "NV.A": "L1",
      "Thông": "L1",
      "Khánh": 'L2'
    },
    "owner": "",
    "backup": "",
    "sme": ""
  },
  {
    "id": 79,
    "domain": "UC & Contact Center",
    "skill": "Avaya IPO",
    "ratings": {
      "Toàn": "L1",
      "Long": "L1",
      "Tuấn": "L1",
      "Sang": "L2",
      "Bảo": "L2",
      "NV.A": "L1",
      "Thông": "L1",
      "Khánh": 'L2'
    },
    "owner": "",
    "backup": "",
    "sme": ""
  },
  {
    "id": 80,
    "domain": "UC & Contact Center",
    "skill": "Avaya CMS",
    "ratings": {
      "Toàn": "L1",
      "Long": "L1",
      "Tuấn": "L1",
      "Sang": "L2",
      "Bảo": "L2",
      "NV.A": "L1",
      "Thông": "L1",
      "Khánh": 'L2'
    },
    "owner": "",
    "backup": "",
    "sme": ""
  },
  {
    "id": 81,
    "domain": "UC & Contact Center",
    "skill": "NICE",
    "ratings": {
      "Toàn": "L1",
      "Long": "L1",
      "Tuấn": "L1",
      "Sang": "L2",
      "Bảo": "L2",
      "NV.A": "L1",
      "Thông": "L1",
      "Khánh": 'L2'
    },
    "owner": "",
    "backup": "",
    "sme": ""
  },
  {
    "id": 82,
    "domain": "Automation & DevOps",
    "skill": "PowerShell",
    "ratings": {
      "Toàn": "L1",
      "Long": "L1",
      "Tuấn": 'L2',
      "Sang": "L2",
      "Bảo": "L2",
      "NV.A": "L1",
      "Thông": 'L2',
      "Khánh": "L1"
    },
    "owner": "",
    "backup": "",
    "sme": ""
  },
  {
    "id": 83,
    "domain": "Automation & DevOps",
    "skill": "Python",
    "ratings": {
      "Toàn": "L1",
      "Long": "L1",
      "Tuấn": 'L2',
      "Sang": "L2",
      "Bảo": "L2",
      "NV.A": "L1",
      "Thông": 'L2',
      "Khánh": "L1"
    },
    "owner": "",
    "backup": "",
    "sme": ""
  },
  {
    "id": 84,
    "domain": "Automation & DevOps",
    "skill": "Bash",
    "ratings": {
      "Toàn": "L1",
      "Long": "L1",
      "Tuấn": 'L2',
      "Sang": "L2",
      "Bảo": "L2",
      "NV.A": "L1",
      "Thông": 'L2',
      "Khánh": "L1"
    },
    "owner": "",
    "backup": "",
    "sme": ""
  },
  {
    "id": 85,
    "domain": "Automation & DevOps",
    "skill": "Ansible",
    "ratings": {
      "Toàn": "L1",
      "Long": "L1",
      "Tuấn": 'L2',
      "Sang": "L2",
      "Bảo": "L2",
      "NV.A": "L1",
      "Thông": 'L2',
      "Khánh": "L1"
    },
    "owner": "",
    "backup": "",
    "sme": ""
  },
  {
    "id": 86,
    "domain": "Automation & DevOps",
    "skill": "Terraform",
    "ratings": {
      "Toàn": "L1",
      "Long": "L1",
      "Tuấn": 'L2',
      "Sang": "L2",
      "Bảo": "L2",
      "NV.A": "L1",
      "Thông": 'L2',
      "Khánh": "L1"
    },
    "owner": "",
    "backup": "",
    "sme": ""
  },
  {
    "id": 87,
    "domain": "Automation & DevOps",
    "skill": "Azure DevOps",
    "ratings": {
      "Toàn": "L1",
      "Long": "L1",
      "Tuấn": 'L2',
      "Sang": "L2",
      "Bảo": "L2",
      "NV.A": "L1",
      "Thông": 'L2',
      "Khánh": "L1"
    },
    "owner": "",
    "backup": "",
    "sme": ""
  },
  {
    "id": 88,
    "domain": "Automation & DevOps",
    "skill": "GitLab",
    "ratings": {
      "Toàn": "L1",
      "Long": "L1",
      "Tuấn": 'L2',
      "Sang": "L2",
      "Bảo": "L2",
      "NV.A": "L1",
      "Thông": 'L2',
      "Khánh": "L1"
    },
    "owner": "",
    "backup": "",
    "sme": ""
  },
  {
    "id": 89,
    "domain": "AI Infrastructure",
    "skill": "Microsoft Copilot",
    "ratings": {
      "Toàn": "L1",
      "Long": "L1",
      "Tuấn": "L1",
      "Sang": 'L2',
      "Bảo": "L2",
      "NV.A": "L1",
      "Thông": 'L2',
      "Khánh": "L1"
    },
    "owner": "",
    "backup": "",
    "sme": ""
  },
  {
    "id": 90,
    "domain": "AI Infrastructure",
    "skill": "Azure AI",
    "ratings": {
      "Toàn": "L1",
      "Long": "L1",
      "Tuấn": "L1",
      "Sang": 'L2',
      "Bảo": "L2",
      "NV.A": "L1",
      "Thông": 'L2',
      "Khánh": "L1"
    },
    "owner": "",
    "backup": "",
    "sme": ""
  },
  {
    "id": 91,
    "domain": "AI Infrastructure",
    "skill": "OpenAI API",
    "ratings": {
      "Toàn": "L1",
      "Long": "L1",
      "Tuấn": "L1",
      "Sang": 'L2',
      "Bảo": "L2",
      "NV.A": "L1",
      "Thông": 'L2',
      "Khánh": "L1"
    },
    "owner": "",
    "backup": "",
    "sme": ""
  },
  {
    "id": 92,
    "domain": "AI Infrastructure",
    "skill": "GPU Server",
    "ratings": {
      "Toàn": "L1",
      "Long": "L1",
      "Tuấn": "L1",
      "Sang": 'L2',
      "Bảo": "L2",
      "NV.A": "L1",
      "Thông": 'L2',
      "Khánh": "L1"
    },
    "owner": "",
    "backup": "",
    "sme": ""
  },
  {
    "id": 93,
    "domain": "AI Infrastructure",
    "skill": "Vector Database",
    "ratings": {
      "Toàn": "L1",
      "Long": "L1",
      "Tuấn": "L1",
      "Sang": 'L2',
      "Bảo": "L2",
      "NV.A": "L1",
      "Thông": 'L2',
      "Khánh": "L1"
    },
    "owner": "",
    "backup": "",
    "sme": ""
  },
  {
    "id": 94,
    "domain": "AI Infrastructure",
    "skill": "RAG Architecture",
    "ratings": {
      "Toàn": "L1",
      "Long": "L1",
      "Tuấn": "L1",
      "Sang": 'L2',
      "Bảo": "L2",
      "NV.A": "L1",
      "Thông": 'L2',
      "Khánh": "L1"
    },
    "owner": "",
    "backup": "",
    "sme": ""
  }
];

export const DOMAINS: string[] = Array.from(new Set(INITIAL_SKILLS.map(s => s.domain))).sort();
