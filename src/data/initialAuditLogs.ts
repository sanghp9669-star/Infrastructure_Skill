import { AuditLogEntry } from '../types/skills';

// Seed initial audit log entries representing recent activities within the current week
export const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'log-1',
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 mins ago
    memberName: 'Sang',
    skillId: 1,
    skillName: 'Kubernetes Cluster (k8s/OpenShift)',
    domain: 'Cloud & Container Platforms',
    oldValue: 'L1',
    newValue: 'L2',
    changeType: 'rating',
    performedBy: 'Sang (Self-assessment)',
    notes: 'Hoàn thành bài Lab multi-cluster federation & Istio service mesh'
  },
  {
    id: 'log-2',
    timestamp: new Date(Date.now() - 48 * 60 * 1000).toISOString(), // 48 mins ago
    memberName: 'An',
    skillId: 5,
    skillName: 'Cisco ACI & Software-Defined Network',
    domain: 'Enterprise Networking & SD-WAN',
    oldValue: 'L0',
    newValue: 'L1',
    changeType: 'rating',
    performedBy: 'Quản lý phòng hạ tầng',
    notes: 'Bắt đầu nghiên cứu cấu hình Tenant và EPG trên môi trường Lab'
  },
  {
    id: 'log-3',
    timestamp: new Date(Date.now() - 2 * 3600 * 1000).toISOString(), // 2 hours ago
    memberName: 'Bình',
    skillId: 3,
    skillName: 'Terraform & Infrastructure as Code (IaC)',
    domain: 'Automation & IaC',
    oldValue: '',
    newValue: 'Bình',
    changeType: 'role_backup',
    performedBy: 'Lead Kỹ thuật',
    notes: 'Chỉ định làm Backup engineer để khắc phục tình trạng SPOF'
  },
  {
    id: 'log-4',
    timestamp: new Date(Date.now() - 4 * 3600 * 1000).toISOString(), // 4 hours ago
    memberName: 'Cường',
    skillId: 8,
    skillName: 'Zero Trust Network Architecture (ZTNA)',
    domain: 'Network & System Security',
    oldValue: 'L1',
    newValue: 'L2',
    changeType: 'rating',
    performedBy: 'Cường (Kỹ sư chuyên trách)',
    notes: 'Nghiệm thu triển khai thành công bài lab ZTNA Gateway'
  },
  {
    id: 'log-5',
    timestamp: new Date(Date.now() - 7 * 3600 * 1000).toISOString(), // 7 hours ago
    memberName: 'Dũng',
    skillId: 12,
    skillName: 'Prometheus & Grafana Observability',
    domain: 'Monitoring & Observability',
    oldValue: 'L0',
    newValue: 'L1',
    changeType: 'rating',
    performedBy: 'Dũng',
    notes: 'Thiết lập thành công Dashboard giám sát Kube-state-metrics'
  },
  {
    id: 'log-6',
    timestamp: new Date(Date.now() - 26 * 3600 * 1000).toISOString(), // Yesterday
    memberName: 'Sang',
    skillId: 2,
    skillName: 'Ceph Storage & Software-Defined Storage',
    domain: 'Enterprise Storage & SAN',
    oldValue: '',
    newValue: 'Sang',
    changeType: 'role_sme',
    performedBy: 'Ban Quản trị',
    notes: 'Chỉ định vị trí SME chính cho giải pháp hạ tầng lưu trữ phân tán'
  }
];
