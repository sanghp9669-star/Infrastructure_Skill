import { CompetencyLevel } from '../types/skills';

export interface SuggestedSkill {
  domain: string;
  skill: string;
  description: string;
  importance: 'Critical' | 'High' | 'Medium';
  recommendedOwner?: string;
}

export const CURATED_INFRA_SKILLS: SuggestedSkill[] = [
  // 1. Public & Hybrid Cloud
  {
    domain: 'Public Cloud & Hybrid Cloud',
    skill: 'Amazon Web Services (AWS)',
    description: 'EC2, VPC, S3, IAM, Transit Gateway, Route53, RDS',
    importance: 'Critical',
    recommendedOwner: 'Sang'
  },
  {
    domain: 'Public Cloud & Hybrid Cloud',
    skill: 'Microsoft Azure IaaS',
    description: 'Azure VMs, Virtual Network, ExpressRoute, Azure Bastion, NSG',
    importance: 'Critical',
    recommendedOwner: 'Thi'
  },
  {
    domain: 'Public Cloud & Hybrid Cloud',
    skill: 'Google Cloud Platform (GCP)',
    description: 'Compute Engine, VPC, Cloud Interconnect, GKE',
    importance: 'High',
    recommendedOwner: 'Thông'
  },
  {
    domain: 'Public Cloud & Hybrid Cloud',
    skill: 'Hybrid Cloud Interconnect (ExpressRoute / Direct Connect)',
    description: 'Kết nối Datacenter On-Premise với Cloud tốc độ cao bảo mật qua VPN/Leased Line',
    importance: 'Critical',
    recommendedOwner: 'Long'
  },

  // 2. Datacenter Infrastructure & Physical
  {
    domain: 'Datacenter & Hardware',
    skill: 'Server Hardware OOB (Dell iDRAC / HPE iLO / Cisco UCS)',
    description: 'Quản trị phần cứng máy chủ từ xa, cập nhật firmware, RAID controller',
    importance: 'Critical',
    recommendedOwner: 'Toàn'
  },
  {
    domain: 'Datacenter & Hardware',
    skill: 'Hệ Thống Điện & Nguồn UPS / PDU Datacenter',
    description: 'Quản trị ATS, UPS APC/Schneider, Eaton, Smart PDU, tính toán phụ tải điện',
    importance: 'High',
    recommendedOwner: 'Bảo'
  },
  {
    domain: 'Datacenter & Hardware',
    skill: 'Cáp Cấu Trúc Datacenter (TIA-942 / MPO / Fiber Optics)',
    description: 'Tiêu chuẩn đi dây mạng quang đa mode/đơn mode OM4/OS2, đo kiểm suy hao quang',
    importance: 'High',
    recommendedOwner: 'Long'
  },

  // 3. Network & Edge
  {
    domain: 'Network',
    skill: 'SD-WAN (Software-Defined WAN)',
    description: 'Fortinet Secure SD-WAN, Cisco Catalyst SD-WAN / Meraki kết nối đa chi nhánh',
    importance: 'Critical',
    recommendedOwner: 'Long'
  },
  {
    domain: 'Network',
    skill: 'Spine-Leaf & VXLAN EVPN Fabric',
    description: 'Kiến trúc mạng Datacenter thế hệ mới không giới hạn Spanning Tree',
    importance: 'Critical',
    recommendedOwner: 'Long'
  },
  {
    domain: 'Network',
    skill: 'Cân Bằng Tải ADC (F5 BIG-IP / HAProxy)',
    description: 'Hardware/Virtual ADC, SSL Offloading, L4/L7 Traffic Management, iRules',
    importance: 'Critical',
    recommendedOwner: 'Long'
  },

  // 4. Cyber Security & Zero-Trust
  {
    domain: 'Security',
    skill: 'EDR / XDR (CrowdStrike / Defender for Endpoint)',
    description: 'Bảo vệ thiết bị đầu cuối, phát hiện và phản ứng mối đe dọa nâng cao',
    importance: 'Critical',
    recommendedOwner: 'Long'
  },
  {
    domain: 'Security',
    skill: 'SIEM & SOC Operations (Microsoft Sentinel / Splunk ES)',
    description: 'Thu thập log phân tích bảo mật tập trung, xây dựng Playbook SOAR',
    importance: 'Critical',
    recommendedOwner: 'Thi'
  },
  {
    domain: 'Security',
    skill: 'PAM - Privileged Access Management (CyberArk / BeyondTrust)',
    description: 'Quản trị và giám sát phiên truy cập đặc quyền cho quản trị viên',
    importance: 'High',
    recommendedOwner: 'Thi'
  },
  {
    domain: 'Security',
    skill: 'Cloudflare / Anti-DDoS & CDN',
    description: 'Bảo vệ cổng dịch vụ Web trước tấn công từ chối dịch vụ phân tán',
    importance: 'High',
    recommendedOwner: 'Long'
  },
  {
    domain: 'Security',
    skill: 'PKI & SSL/TLS Certificate Management',
    description: 'Quản lý chứng chỉ số SSL nội bộ và quốc tế, tự động hóa với ACME/Let\'s Encrypt',
    importance: 'High',
    recommendedOwner: 'Thi'
  },

  // 5. Storage & Disaster Recovery
  {
    domain: 'Storage & Backup',
    skill: 'Pure Storage / Dell PowerStore All-Flash',
    description: 'Hệ thống lưu trữ All-Flash NVMe doanh nghiệp, deduplication và compression',
    importance: 'Critical',
    recommendedOwner: 'Bảo'
  },
  {
    domain: 'Storage & Backup',
    skill: 'Immutable Backup (Chống Ransomware)',
    description: 'Lưu trữ sao lưu bất biến sử dụng S3 Object Lock, Linux Hardened Repository',
    importance: 'Critical',
    recommendedOwner: 'Toàn'
  },
  {
    domain: 'Storage & Backup',
    skill: 'Ceph / TrueNAS Enterprise',
    description: 'Hệ thống lưu trữ phân tán mã nguồn mở cho Block, File và Object Storage',
    importance: 'High',
    recommendedOwner: 'Tuấn'
  },

  // 6. Modern Container & Cloud Native
  {
    domain: 'Container Platform',
    skill: 'Helm & Kustomize',
    description: 'Quản lý gói ứng dụng Kubernetes, cấu hình môi trường Dev/Staging/Prod',
    importance: 'Critical',
    recommendedOwner: 'Tuấn'
  },
  {
    domain: 'Container Platform',
    skill: 'ArgoCD (GitOps Deployment)',
    description: 'Tự động hóa đồng bộ trạng thái ứng dụng Kubernetes từ Git Repository',
    importance: 'Critical',
    recommendedOwner: 'Thông'
  },
  {
    domain: 'Container Platform',
    skill: 'Istio Service Mesh',
    description: 'Quản lý traffic microservices, mTLS nội bộ và quan sát giao tiếp dịch vụ',
    importance: 'High',
    recommendedOwner: 'Tuấn'
  },

  // 7. Monitoring & Observability
  {
    domain: 'Syslog & Monitoring',
    skill: 'Prometheus & Alertmanager',
    description: 'Thu thập metrics time-series và cấu hình cảnh báo sự cố tự động',
    importance: 'Critical',
    recommendedOwner: 'Thông'
  },
  {
    domain: 'Syslog & Monitoring',
    skill: 'Loki (Grafana Log Aggregation)',
    description: 'Thu thập và phân tích log phân tán chi phí thấp kết hợp Grafana',
    importance: 'High',
    recommendedOwner: 'Thông'
  },
  {
    domain: 'Syslog & Monitoring',
    skill: 'OpenTelemetry (OTel Tracing)',
    description: 'Chuẩn theo dõi vết giao dịch phân tán cho hạ tầng đám mây',
    importance: 'High',
    recommendedOwner: 'Thông'
  },

  // 8. Database High Availability
  {
    domain: 'Database',
    skill: 'Redis In-Memory Cache & Cluster',
    description: 'Cấu hình bộ nhớ đệm hiệu năng cao, Sentinel và Redis Cluster',
    importance: 'Critical',
    recommendedOwner: 'Bảo'
  },
  {
    domain: 'Database',
    skill: 'MongoDB Replica Set & Sharding',
    description: 'Cụm cơ sở dữ liệu tài liệu NoSQL dự phòng cao',
    importance: 'High',
    recommendedOwner: 'Bảo'
  },
  {
    domain: 'Database',
    skill: 'PostgreSQL HA (Patroni / PgBouncer)',
    description: 'Tự động chuyển đổi dự phòng Master-Standby cho cơ sở dữ liệu PostgreSQL',
    importance: 'Critical',
    recommendedOwner: 'Tuấn'
  },

  // 9. AI Infrastructure Cluster
  {
    domain: 'AI Infrastructure',
    skill: 'NVIDIA AI Enterprise & vGPU Software',
    description: 'Cấp phát vGPU cho máy ảo ảo hóa VMware/K8s huấn luyện và suy luận AI',
    importance: 'Critical',
    recommendedOwner: 'Sang'
  },
  {
    domain: 'AI Infrastructure',
    skill: 'InfiniBand & RoCE Networking',
    description: 'Mạng RDMA độ trễ micro-giây cho cụm tính toán GPU cụm lớn',
    importance: 'Critical',
    recommendedOwner: 'Long'
  },
  {
    domain: 'AI Infrastructure',
    skill: 'vLLM & TensorRT-LLM Inference Server',
    description: 'Tối ưu hóa máy chủ suy luận mô hình ngôn ngữ lớn (PagedAttention)',
    importance: 'High',
    recommendedOwner: 'Thông'
  },
  {
    domain: 'AI Infrastructure',
    skill: 'SLURM Cluster Management',
    description: 'Điều phối hàng đợi tác vụ tính toán hiệu năng cao HPC & AI Training',
    importance: 'High',
    recommendedOwner: 'Thông'
  }
];

export const ENTERPRISE_STACK_ORDER = [
  'Datacenter & Hardware',
  'Network',
  'Wireless',
  'Storage & Backup',
  'Virtualization',
  'Windows Server',
  'Linux Server',
  'Container Platform',
  'Public Cloud & Hybrid Cloud',
  'Database',
  'Syslog & Monitoring',
  'Security',
  'Microsoft 365',
  'UC & Contact Center',
  'Automation & DevOps',
  'AI Infrastructure'
];
