import { SkillRequest } from '../types/skills';

export const INITIAL_SKILL_REQUESTS: SkillRequest[] = [
  {
    id: 'req-1',
    title: 'AI Cluster Networking (RoCEv2 / InfiniBand & GPU Fabric)',
    domain: 'Enterprise Networking & SD-WAN',
    requestType: 'new_skill',
    requesterName: 'Sang',
    urgency: 'high',
    targetLevel: 'L2',
    interestedMembers: ['Sang', 'An', 'Cường'],
    justification: 'Cần bổ sung vào ma trận để phục vụ dự án triển khai cụm GPU Train Model cho Khách hàng Tài chính Q4/2026. Đang ở trạng thái chờ duyệt để đưa vào ma trận chính thức.',
    status: 'pending',
    createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString() // 2 hours ago
  },
  {
    id: 'req-2',
    title: 'Cilium eBPF CNI & Service Mesh Lab Workshop',
    domain: 'Cloud & Container Platforms',
    requestType: 'training_request',
    requesterName: 'An',
    urgency: 'high',
    targetLevel: 'L2',
    interestedMembers: ['An', 'Bình', 'Dũng'],
    justification: 'Yêu cầu mở buổi Workshop Lab chuyên sâu về eBPF Network Policies và Hubble UI Observability để thay thế Calico CNI truyền thống.',
    status: 'pending',
    createdAt: new Date(Date.now() - 6 * 3600 * 1000).toISOString() // 6 hours ago
  },
  {
    id: 'req-3',
    title: 'ArgoCD & GitOps Multi-Cluster Sync',
    domain: 'Automation & IaC',
    requestType: 'new_skill',
    requesterName: 'Bình',
    urgency: 'medium',
    targetLevel: 'L2',
    interestedMembers: ['Bình', 'Sang'],
    justification: 'Đề xuất chuẩn hóa bộ công cụ CD tự động đồng bộ Manifest qua GitHub Enterprise.',
    status: 'approved',
    createdAt: new Date(Date.now() - 28 * 3600 * 1000).toISOString(),
    reviewedBy: 'Trưởng Phòng Hạ Tầng',
    reviewNotes: 'Đã phê duyệt và đồng ý đưa vào lộ trình đào tạo Q4/2026.',
    reviewedAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString()
  },
  {
    id: 'req-4',
    title: 'Kafka Cluster High-Availability & MirrorMaker 2',
    domain: 'Database & Messaging Platforms',
    requestType: 'training_request',
    requesterName: 'Dũng',
    urgency: 'medium',
    targetLevel: 'L1',
    interestedMembers: ['Dũng', 'Cường'],
    justification: 'Yêu cầu hỗ trợ Lab mô phỏng đồng bộ Kafka liên Data Center (Multi-DC disaster recovery).',
    status: 'in_training',
    createdAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
    reviewedBy: 'Lead Kỹ Thuật',
    reviewNotes: 'Đang tiến hành Lab thực hành theo tài liệu hướng dẫn nội bộ.',
    reviewedAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString()
  }
];
