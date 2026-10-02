import React, { useState, useMemo } from 'react';
import { CompetencyLevel, Project, SkillItem, TeamMember } from '../types/skills';
import { COMPETENCY_DEFINITIONS } from '../data/initialData';
import { 
  BarChart3, 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles, 
  TrendingUp, 
  Layers, 
  ShieldAlert, 
  Server, 
  Cpu, 
  ShieldCheck, 
  Building2, 
  ArrowRight,
  Info
} from 'lucide-react';

// Major Enterprise Infrastructure Baseline Profiles
export interface EnterpriseBaselineProfile {
  id: string;
  name: string;
  code: string;
  category: string;
  description: string;
  minLevelDefault: CompetencyLevel;
  requiredSkillDomains: {
    domain: string;
    sampleSkills: string[];
    minLevel: CompetencyLevel;
    weight: number;
  }[];
}

export const ENTERPRISE_INFRA_BASELINES: EnterpriseBaselineProfile[] = [
  {
    id: 'core_banking_dc',
    name: 'Hạ Tầng Core Banking & Multi-Datacenter (Tier 3/4)',
    code: 'BANK-DC-MIGRATION',
    category: 'Tài Chính / Ngân Hàng',
    description: 'Yêu cầu tính sẵn sàng 99.999%, cấu hình High Availability, SAN Storage Replication & BCP Disaster Recovery.',
    minLevelDefault: 'L2',
    requiredSkillDomains: [
      { domain: 'Datacenter & Virtualization', sampleSkills: ['VMware vSphere ESXi Cluster', 'SAN Array Management (Dell/HPE)'], minLevel: 'L2', weight: 5 },
      { domain: 'Enterprise Networking', sampleSkills: ['Cisco Nexus Datacenter Switching', 'BGP & OSPF Routing Protocols'], minLevel: 'L2', weight: 5 },
      { domain: 'Cyber Security & Zero Trust', sampleSkills: ['Fortinet / PaloAlto Firewall Cluster', 'Zero Trust Network Access (ZTNA)'], minLevel: 'L2', weight: 5 },
      { domain: 'Storage & Backup', sampleSkills: ['Enterprise SAN Storage Management', 'Veeam Backup & Replication'], minLevel: 'L2', weight: 4 },
      { domain: 'Syslog & Monitoring', sampleSkills: ['Prometheus & Grafana Enterprise', 'Log Analysis & SIEM Integration'], minLevel: 'L2', weight: 4 },
    ]
  },
  {
    id: 'cloud_k8s_enterprise',
    name: 'Chuyển Đổi Đám Mây & Kubernetes Cluster Enterprise',
    code: 'CLOUD-NATIVE-K8S',
    category: 'Cloud & DevOps',
    description: 'Yêu cầu tự động hóa IaC Terraform, Ansible, Kubernetes Production Cluster, Service Mesh & CI/CD Pipeline.',
    minLevelDefault: 'L2',
    requiredSkillDomains: [
      { domain: 'Cloud Infrastructure', sampleSkills: ['AWS Cloud Architecture', 'Azure Enterprise Landing Zone'], minLevel: 'L2', weight: 5 },
      { domain: 'Automation & DevOps', sampleSkills: ['Terraform Infrastructure as Code', 'Ansible Configuration Management', 'Kubernetes Cluster Administration'], minLevel: 'L2', weight: 5 },
      { domain: 'Linux & Server OS', sampleSkills: ['Red Hat Enterprise Linux (RHEL)', 'Ubuntu Server Administration'], minLevel: 'L2', weight: 4 },
      { domain: 'Cyber Security & Zero Trust', sampleSkills: ['Cloud Security Posture (CSPM)', 'API Gateway & Web Application Firewall'], minLevel: 'L2', weight: 4 },
    ]
  },
  {
    id: 'ai_supercomputing_cluster',
    name: 'Hạ Tầng AI Cluster & Siêu Máy Tính GPU (NVIDIA DGX)',
    code: 'AI-INFRA-CLUSTER',
    category: 'AI & High Performance Computing',
    description: 'Tối ưu cho huấn luyện mô hình Generative AI / LLM, mạng InfiniBand RoCE, Storage NVMe-oF throughput siêu tốc.',
    minLevelDefault: 'L2',
    requiredSkillDomains: [
      { domain: 'AI Infrastructure', sampleSkills: ['NVIDIA DGX & GPU Cluster Setup', 'InfiniBand & RoCE High-Speed Networking'], minLevel: 'L2', weight: 5 },
      { domain: 'Storage & Backup', sampleSkills: ['NVMe-oF & Parallel File System (Ceph/Lustre)'], minLevel: 'L2', weight: 5 },
      { domain: 'Linux & Server OS', sampleSkills: ['Linux Kernel Tuning & GPU Drivers'], minLevel: 'L2', weight: 4 },
      { domain: 'Automation & DevOps', sampleSkills: ['Docker & Container Runtime', 'Kubeflow / Ray Cluster Orchestration'], minLevel: 'L2', weight: 4 },
    ]
  }
];

interface SkillAnalysisItem {
  requirement: {
    domain: string;
    skillName: string;
    minLevel: CompetencyLevel;
    weight?: number;
  };
  skillItem?: SkillItem;
  targetScore: number;
  targetLevel: CompetencyLevel;
  bestAssignedMember: string;
  bestAssignedLevel: CompetencyLevel;
  bestAssignedScore: number;
  bestTeamMember: string;
  bestTeamLevel: CompetencyLevel;
  bestTeamScore: number;
  isMet: boolean;
  gap: number;
}

interface VisualSkillGapChartProps {
  activeProject: Project;
  skills: SkillItem[];
  members: TeamMember[];
  skillAnalysis: SkillAnalysisItem[];
}

export const VisualSkillGapChart: React.FC<VisualSkillGapChartProps> = ({
  activeProject,
  skills,
  members,
  skillAnalysis
}) => {
  const [baselineMode, setBaselineMode] = useState<'project_specific' | string>('project_specific');

  // Compute Gap Analysis data depending on baseline mode
  const currentModeData = useMemo(() => {
    if (baselineMode === 'project_specific') {
      return {
        title: `Yêu Cầu Thiết Kế Cụ Thể Của Dự Án: ${activeProject.name}`,
        subtitle: `Đối chiếu ${skillAnalysis.length} kỹ năng bắt buộc được cấu hình riêng cho dự án [${activeProject.code}]`,
        items: skillAnalysis.map(sa => {
          const targetScore = sa.targetScore;
          const assignedScore = sa.bestAssignedScore;
          const teamScore = sa.bestTeamScore;
          const gap = Math.max(0, targetScore - assignedScore);
          const gapPercent = targetScore > 0 ? Math.round((gap / targetScore) * 100) : 0;
          const fulfillmentPercent = targetScore > 0 ? Math.min(100, Math.round((assignedScore / targetScore) * 100)) : 100;

          return {
            skillName: sa.requirement.skillName,
            domain: sa.requirement.domain,
            targetLevel: sa.targetLevel,
            targetScore,
            assignedMember: sa.bestAssignedMember,
            assignedLevel: sa.bestAssignedLevel,
            assignedScore,
            teamMember: sa.bestTeamMember,
            teamLevel: sa.bestTeamLevel,
            teamScore,
            isMet: sa.isMet,
            gap,
            gapPercent,
            fulfillmentPercent
          };
        })
      };
    }

    // Enterprise Standard Baseline comparison
    const profile = ENTERPRISE_INFRA_BASELINES.find(p => p.id === baselineMode) || ENTERPRISE_INFRA_BASELINES[0];

    const baselineItems = profile.requiredSkillDomains.map(reqDomain => {
      // Find matching skills in active project assigned team
      let bestAssignedScore = 0;
      let bestAssignedLevel: CompetencyLevel = 'L0';
      let bestAssignedMember = '';

      let bestTeamScore = 0;
      let bestTeamLevel: CompetencyLevel = 'L0';
      let bestTeamMember = '';

      // Find skills in this domain
      const domainSkills = skills.filter(s => s.domain.toLowerCase().includes(reqDomain.domain.toLowerCase()) || reqDomain.domain.toLowerCase().includes(s.domain.toLowerCase()));

      domainSkills.forEach(s => {
        (activeProject.assignedMembers || []).forEach(mem => {
          const lvl = (s.ratings[mem] || 'L0') as CompetencyLevel;
          const sc = COMPETENCY_DEFINITIONS[lvl]?.score || 0;
          if (sc > bestAssignedScore) {
            bestAssignedScore = sc;
            bestAssignedLevel = lvl;
            bestAssignedMember = mem;
          }
        });

        members.forEach(m => {
          const lvl = (s.ratings[m.name] || 'L0') as CompetencyLevel;
          const sc = COMPETENCY_DEFINITIONS[lvl]?.score || 0;
          if (sc > bestTeamScore) {
            bestTeamScore = sc;
            bestTeamLevel = lvl;
            bestTeamMember = m.name;
          }
        });
      });

      const targetLevel = reqDomain.minLevel;
      const targetScore = COMPETENCY_DEFINITIONS[targetLevel]?.score || 2;
      const isMet = bestAssignedScore >= targetScore;
      const gap = Math.max(0, targetScore - bestAssignedScore);
      const gapPercent = targetScore > 0 ? Math.round((gap / targetScore) * 100) : 0;
      const fulfillmentPercent = targetScore > 0 ? Math.min(100, Math.round((bestAssignedScore / targetScore) * 100)) : 100;

      return {
        skillName: `${reqDomain.domain} (${reqDomain.sampleSkills[0] || 'Chuẩn Enterprise'})`,
        domain: reqDomain.domain,
        targetLevel,
        targetScore,
        assignedMember: bestAssignedMember,
        assignedLevel: bestAssignedLevel,
        assignedScore: bestAssignedScore,
        teamMember: bestTeamMember,
        teamLevel: bestTeamLevel,
        teamScore: bestTeamScore,
        isMet,
        gap,
        gapPercent,
        fulfillmentPercent
      };
    });

    return {
      title: `Chuẩn Hạ Tầng Doanh Nghiệp: ${profile.name}`,
      subtitle: profile.description,
      items: baselineItems
    };
  }, [baselineMode, activeProject, skillAnalysis, skills, members]);

  // Key KPI Metrics for the selected baseline
  const metItemsCount = currentModeData.items.filter(i => i.isMet).length;
  const totalItemsCount = currentModeData.items.length;
  const overallFulfillmentRate = totalItemsCount > 0
    ? Math.round(currentModeData.items.reduce((acc, curr) => acc + curr.fulfillmentPercent, 0) / totalItemsCount)
    : 100;

  const criticalGaps = currentModeData.items.filter(i => !i.isMet);

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs space-y-5">
      
      {/* 1. Header & Baseline Standard Mode Selector */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-indigo-600" />
            <span>Biểu Đồ Phân Tích Chênh Lệch Năng Lực Hạ Tầng (Visual Skill Gap Analysis)</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Trực quan hóa khoảng trống chênh lệch giữa năng lực nhân sự đã phân bổ với yêu cầu chuẩn hạ tầng
          </p>
        </div>

        {/* Mode Selector Buttons */}
        <div className="flex flex-wrap items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
          <button
            type="button"
            onClick={() => setBaselineMode('project_specific')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              baselineMode === 'project_specific'
                ? 'bg-white text-indigo-700 font-extrabold shadow-2xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            📌 Yêu Cầu Dự Án [{activeProject.code}]
          </button>

          {ENTERPRISE_INFRA_BASELINES.map(profile => (
            <button
              key={profile.id}
              type="button"
              onClick={() => setBaselineMode(profile.id)}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                baselineMode === profile.id
                  ? 'bg-indigo-600 text-white font-extrabold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🏢 {profile.name.split('&')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Overview Banner & Critical Gap Summary */}
      <div className="p-4 bg-slate-50/90 rounded-2xl border border-slate-200/80 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        <div className="md:col-span-8 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
            Tiêu Chuẩn So Sánh Đang Chọn
          </span>
          <h4 className="font-extrabold text-slate-900 text-sm mt-1">{currentModeData.title}</h4>
          <p className="text-xs text-slate-500">{currentModeData.subtitle}</p>
        </div>

        {/* Readiness Meter */}
        <div className="md:col-span-4 bg-white p-3 rounded-xl border border-slate-200 text-center space-y-1.5 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
            <span>Mức Độ Phù Hợp Nhân Sự:</span>
            <span className="font-bold text-indigo-700 font-mono">{overallFulfillmentRate}%</span>
          </div>

          <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden shadow-2xs">
            <div
              style={{ width: `${overallFulfillmentRate}%` }}
              className={`h-full rounded-full transition-all duration-500 ${
                overallFulfillmentRate >= 80 ? 'bg-emerald-500' : overallFulfillmentRate >= 60 ? 'bg-amber-400' : 'bg-rose-500'
              }`}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] font-medium pt-1 text-slate-500">
            <span className="text-emerald-700 font-bold">Đạt Chuẩn: {metItemsCount}/{totalItemsCount}</span>
            <span className="text-rose-600 font-bold">Thiếu Hụt: {criticalGaps.length} Kỹ năng</span>
          </div>
        </div>
      </div>

      {/* 3. Visual Dual-Bar Skill Gap Comparison Chart */}
      <div className="space-y-3.5 pt-1">
        <div className="flex items-center justify-between text-xs font-bold text-slate-700 px-1 border-b border-slate-100 pb-2">
          <span>Tên Kỹ Năng & Mảng Hạ Tầng Yêu Cầu</span>
          <div className="flex items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1.5 text-indigo-800">
              <span className="w-3 h-3 bg-indigo-600 rounded-sm inline-block" />
              <span>Chuẩn Tối Thiểu Yêu Cầu</span>
            </span>
            <span className="flex items-center gap-1.5 text-emerald-800">
              <span className="w-3 h-3 bg-emerald-500 rounded-sm inline-block" />
              <span>Năng Lực Nhân Sự Đã Gán</span>
            </span>
            <span className="flex items-center gap-1.5 text-amber-800">
              <span className="w-3 h-3 bg-amber-400 rounded-sm inline-block" />
              <span>Chênh Lệch Cần Bổ Sung (Gap)</span>
            </span>
          </div>
        </div>

        {/* Skills Comparison List */}
        <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
          {currentModeData.items.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              Chưa có kỹ năng nào để phân tích chênh lệch cho tiêu chuẩn này.
            </div>
          ) : (
            currentModeData.items.map((item, idx) => {
              const reqScore = item.targetScore; // max 2.0
              const assignedScore = item.assignedScore; // 0, 1, 2
              const gapVal = Math.max(0, reqScore - assignedScore);

              const reqWidthPct = Math.min(100, (reqScore / 2.0) * 100);
              const assignedWidthPct = Math.min(100, (assignedScore / 2.0) * 100);
              const gapWidthPct = Math.min(100, (gapVal / 2.0) * 100);

              return (
                <div key={idx} className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/80 space-y-2 hover:bg-slate-50 transition-colors">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-xs">{item.skillName}</span>
                      <span className="text-[10px] text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200 font-mono">
                        {item.domain}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs">
                      {/* Assigned Member Badge */}
                      {item.assignedMember ? (
                        <span className="text-slate-700 font-semibold text-[11px]">
                          👤 {item.assignedMember} (<strong className="text-indigo-700">{item.assignedLevel}</strong>)
                        </span>
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">Chưa gán nhân sự</span>
                      )}

                      {/* Status Badge */}
                      {item.isMet ? (
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded font-bold text-[10px] flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>ĐẠT CHUẨN</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-amber-50 text-amber-900 border border-amber-200 rounded font-bold text-[10px] flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 text-amber-600" />
                          <span>THIẾU {gapVal} CẤP (GAP {item.gapPercent}%)</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Dual Bar Visual Comparison */}
                  <div className="space-y-1">
                    {/* Required Target Level Bar */}
                    <div className="flex items-center gap-2 text-[10px]">
                      <span className="w-20 text-slate-500 shrink-0 font-medium">Standard ({item.targetLevel}):</span>
                      <div className="flex-1 bg-slate-200 h-2.5 rounded-full overflow-hidden">
                        <div
                          style={{ width: `${reqWidthPct}%` }}
                          className="bg-indigo-600 h-full rounded-full transition-all"
                        />
                      </div>
                      <span className="w-8 font-mono font-bold text-slate-700 text-right">{reqScore.toFixed(1)}</span>
                    </div>

                    {/* Assigned Capability Bar + Gap Segment */}
                    <div className="flex items-center gap-2 text-[10px]">
                      <span className="w-20 text-slate-500 shrink-0 font-medium">Kỹ sư gán:</span>
                      <div className="flex-1 bg-slate-200 h-2.5 rounded-full overflow-hidden flex">
                        <div
                          style={{ width: `${assignedWidthPct}%` }}
                          className={`h-full transition-all ${item.isMet ? 'bg-emerald-500' : 'bg-amber-400'}`}
                        />
                        {!item.isMet && (
                          <div
                            style={{ width: `${gapWidthPct}%` }}
                            className="bg-rose-400 h-full opacity-70 transition-all animate-pulse"
                            title={`Chênh lệch thiếu hụt: ${gapVal} điểm`}
                          />
                        )}
                      </div>
                      <span className="w-8 font-mono font-bold text-slate-700 text-right">{assignedScore.toFixed(1)}</span>
                    </div>
                  </div>

                  {/* Recommendation action if Gap exists */}
                  {!item.isMet && (
                    <div className="pt-1.5 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                      <span className="text-amber-800 font-medium flex items-center gap-1">
                        <Info className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span>Khoảng trống năng lực: Cần nâng cấp bài Lab từ mức {item.assignedLevel} lên {item.targetLevel}.</span>
                      </span>

                      {item.teamMember && item.teamScore >= item.targetScore && (
                        <span className="text-indigo-700 font-bold bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 shrink-0">
                          ⚡ Gợi ý: Điều động {item.teamMember} ({item.teamLevel}) hỗ trợ dự án
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
