import React, { useState, useMemo } from 'react';
import { Project, SkillItem, TeamMember } from '../types/skills';
import { COMPETENCY_DEFINITIONS } from '../data/initialData';
import { 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  Users, 
  TrendingUp, 
  Sliders, 
  GraduationCap, 
  CheckCircle2, 
  Flame, 
  Sparkles, 
  Target, 
  ChevronDown, 
  ChevronUp,
  FolderKanban,
  Zap,
  Info
} from 'lucide-react';

interface ProjectGapForecastSectionProps {
  skills: SkillItem[];
  members: TeamMember[];
  projects: Project[];
  activeProject?: Project | null;
}

export type SafetyStandard = 'standard' | 'high_availability' | 'ratio_50' | 'ratio_60';

export const ProjectGapForecastSection: React.FC<ProjectGapForecastSectionProps> = ({
  skills,
  members,
  projects,
  activeProject
}) => {
  // Mode: Selected active project vs Custom Simulation
  const [useCustomProject, setCustomProject] = useState<boolean>(false);
  const [plannedTeamSize, setPlannedTeamSize] = useState<number>(
    activeProject ? activeProject.assignedMembers?.length || 5 : 6
  );
  const [safetyStandard, setSafetyStandard] = useState<SafetyStandard>('standard');
  const [expandedDomain, setExpandedDomain] = useState<string | null>(null);

  // Sync plannedTeamSize if activeProject changes and not in custom mode
  React.useEffect(() => {
    if (activeProject && !useCustomProject) {
      setPlannedTeamSize(Math.max(1, activeProject.assignedMembers?.length || 5));
    }
  }, [activeProject, useCustomProject]);

  // Compute Domain Gap Forecast
  const forecastData = useMemo(() => {
    const domains = Array.from(new Set(skills.map(s => s.domain))).sort();

    // Determine target L2 required engineers per domain based on planned team size N & safety standard
    const calculateRequiredL2 = (teamSize: number, standard: SafetyStandard): number => {
      if (standard === 'standard') {
        // N+1 Redundancy: Min 2 L2 engineers (1 Owner + 1 Backup) for N <= 5; scaling with N
        if (teamSize <= 4) return 2;
        if (teamSize <= 8) return 3;
        return Math.max(3, Math.ceil(teamSize * 0.35));
      }
      if (standard === 'high_availability') {
        // HA Redundancy: Min 3 L2 engineers per domain
        if (teamSize <= 5) return 3;
        if (teamSize <= 10) return 4;
        return Math.max(4, Math.ceil(teamSize * 0.45));
      }
      if (standard === 'ratio_50') {
        return Math.max(2, Math.ceil(teamSize * 0.50));
      }
      // ratio_60
      return Math.max(2, Math.ceil(teamSize * 0.60));
    };

    const requiredL2PerDomain = calculateRequiredL2(plannedTeamSize, safetyStandard);

    const domainResults = domains.map(domain => {
      const domainSkills = skills.filter(s => s.domain === domain);
      
      // Filter target members (if specific project is selected, filter by assigned members; otherwise all members)
      const targetMemberList = (!useCustomProject && activeProject && activeProject.assignedMembers?.length > 0)
        ? members.filter(m => activeProject.assignedMembers.includes(m.name))
        : members;

      // Find engineers who hold L2 in this domain
      const l2Engineers = targetMemberList.filter(m => {
        // Check if member holds L2 in at least one skill in this domain
        return domainSkills.some(s => s.ratings[m.name] === 'L2');
      });

      // Find candidate engineers currently at L1 (ready for upskilling)
      const l1CandidateEngineers = targetMemberList.filter(m => {
        const isNotL2 = !l2Engineers.some(l2m => l2m.name === m.name);
        const holdsL1 = domainSkills.some(s => s.ratings[m.name] === 'L1');
        return isNotL2 && holdsL1;
      });

      const currentL2Count = l2Engineers.length;
      const gap = Math.max(0, requiredL2PerDomain - currentL2Count);

      let status: 'safe' | 'warning' | 'critical' = 'safe';
      if (gap === 1) status = 'warning';
      else if (gap >= 2) status = 'critical';

      return {
        domain,
        totalSkills: domainSkills.length,
        currentL2Count,
        requiredL2: requiredL2PerDomain,
        gap,
        status,
        l2Engineers,
        l1CandidateEngineers
      };
    });

    // Summary Metrics
    const totalRequiredL2Sum = domainResults.reduce((acc, curr) => acc + curr.requiredL2, 0);
    const totalCurrentL2Sum = domainResults.reduce((acc, curr) => acc + curr.currentL2Count, 0);
    const totalGapSum = domainResults.reduce((acc, curr) => acc + curr.gap, 0);
    const criticalDomainsCount = domainResults.filter(d => d.status === 'critical').length;
    const warningDomainsCount = domainResults.filter(d => d.status === 'warning').length;
    const safeDomainsCount = domainResults.filter(d => d.status === 'safe').length;

    // Safety Index Score (0 - 100%)
    const safetyIndex = totalRequiredL2Sum > 0 
      ? Math.min(100, Math.round((totalCurrentL2Sum / totalRequiredL2Sum) * 100))
      : 100;

    return {
      domainResults,
      requiredL2PerDomain,
      totalRequiredL2Sum,
      totalCurrentL2Sum,
      totalGapSum,
      criticalDomainsCount,
      warningDomainsCount,
      safeDomainsCount,
      safetyIndex
    };
  }, [skills, members, activeProject, plannedTeamSize, safetyStandard, useCustomProject]);

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-2xs space-y-6">
      {/* Title Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-700 text-white flex items-center justify-center shadow-xs">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Dự Báo Nhu Cầu Nhân Sự L2 (Gap Analysis Forecast)
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                Chuẩn Vận Hành An Toàn
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Tính toán số lượng kỹ sư cần đạt level <strong>L2 (Đã thực hành Lab)</strong> ở mỗi domain để đảm bảo dự án vận hành an toàn, chống rủi ro SPOF.
            </p>
          </div>
        </div>

        {/* Project Selector Mode */}
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
          <button
            type="button"
            onClick={() => setCustomProject(false)}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              !useCustomProject ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {activeProject ? `Theo Dự Án: ${activeProject.code}` : 'Theo Dự Án Hiện Tại'}
          </button>
          <button
            type="button"
            onClick={() => setCustomProject(true)}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              useCustomProject ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🧪 Mô Phỏng Dự Án Mới
          </button>
        </div>
      </div>

      {/* Control Inputs Panel */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 items-center">
          
          {/* Input 1: Planned Team Size Slider */}
          <div className="lg:col-span-6 space-y-1.5 bg-white p-3.5 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between text-xs">
              <label className="font-bold text-slate-800 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-indigo-600" />
                <span>Số lượng thành viên dự kiến tham gia dự án (N):</span>
              </label>
              <span className="font-mono font-black text-indigo-700 text-sm bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                {plannedTeamSize} Kỹ Sư
              </span>
            </div>
            <input
              type="range"
              min={1}
              max={20}
              value={plannedTeamSize}
              onChange={e => setPlannedTeamSize(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-medium">
              <span>1 kỹ sư (Nhỏ)</span>
              <span>5-8 kỹ sư (Trung bình)</span>
              <span>20 kỹ sư (Quy mô lớn)</span>
            </div>
          </div>

          {/* Input 2: Safety Redundancy Standard */}
          <div className="lg:col-span-6 space-y-1.5 bg-white p-3.5 rounded-xl border border-slate-200">
            <label className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
              <Sliders className="w-4 h-4 text-indigo-600" />
              <span>Tiêu chuẩn dự phòng an toàn (Safety Standard):</span>
            </label>
            <select
              value={safetyStandard}
              onChange={e => setSafetyStandard(e.target.value as SafetyStandard)}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-bold focus:outline-hidden focus:border-indigo-500"
            >
              <option value="standard">
                🟢 Tiêu Chuẩn N+1 Backup (Tối thiểu {forecastData.requiredL2PerDomain} L2/domain - Khuyên dùng)
              </option>
              <option value="high_availability">
                🟡 Tiêu Chuẩn Dự Án Trọng Yếu HA (Tối thiểu 3+ L2/domain)
              </option>
              <option value="ratio_50">
                ⚡ Tỷ Lệ 50% Đội Ngũ Đạt L2 ({Math.ceil(plannedTeamSize * 0.5)} L2/domain)
              </option>
              <option value="ratio_60">
                🛡️ Tỷ Lệ 60% Đội Ngũ Đạt L2 ({Math.ceil(plannedTeamSize * 0.6)} L2/domain)
              </option>
            </select>
            <p className="text-[10px] text-slate-500">
              {safetyStandard === 'standard' && 'Yêu cầu tối thiểu 1 SME + 1 Backup L2 cho mỗi nhóm kỹ năng trọng yếu.'}
              {safetyStandard === 'high_availability' && 'Đảm bảo luôn có ít nhất 2 Backup L2 sẵn sàng thay thế khi sự cố xảy ra.'}
              {safetyStandard === 'ratio_50' && 'Tối thiểu 50% số lượng kỹ sư tham gia phải tự chủ triển khai L2.'}
              {safetyStandard === 'ratio_60' && 'Tiêu chuẩn khắt khe cho các dự án Ngân hàng / Tài chính / Hạ tầng trọng yếu.'}
            </p>
          </div>

        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
          <span className="text-[11px] font-semibold text-slate-500 block">
            Nhu Cầu L2 Toàn Mạng (Tổng)
          </span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-2xl font-black text-slate-900 tabular-nums">
              {forecastData.totalRequiredL2Sum}
            </span>
            <span className="text-[10px] text-slate-400 font-bold">
              lượt L2 cần thiết
            </span>
          </div>
          <span className="text-[10px] text-slate-500 block mt-0.5">
            Dựa trên {plannedTeamSize} kỹ sư dự kiến
          </span>
        </div>

        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
          <span className="text-[11px] font-semibold text-slate-500 block">
            Số Kỹ Sư L2 Hiện Có
          </span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-2xl font-black text-emerald-600 tabular-nums">
              {forecastData.totalCurrentL2Sum}
            </span>
            <span className="text-[10px] text-slate-400 font-bold">
              / {forecastData.totalRequiredL2Sum} đạt L2
            </span>
          </div>
          <span className="text-[10px] text-emerald-600 font-semibold block mt-0.5">
            Đã làm thực tế / Lab thành công
          </span>
        </div>

        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
          <span className="text-[11px] font-semibold text-slate-500 block">
            Chênh Lệch Thiếu Hụt L2 (Gap)
          </span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className={`text-2xl font-black tabular-nums ${
              forecastData.totalGapSum > 0 ? 'text-rose-600' : 'text-emerald-600'
            }`}>
              {forecastData.totalGapSum > 0 ? `-${forecastData.totalGapSum}` : '0 (Đạt)'}
            </span>
            <span className="text-[10px] text-slate-400 font-bold">
              kỹ sư L2 cần đào tạo
            </span>
          </div>
          <span className="text-[10px] text-rose-600 font-semibold block mt-0.5">
            {forecastData.criticalDomainsCount} domains thiếu rủi ro
          </span>
        </div>

        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
          <span className="text-[11px] font-semibold text-slate-500 block">
            Chỉ Số An Toàn Vận Hành
          </span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className={`text-2xl font-black tabular-nums ${
              forecastData.safetyIndex >= 80 ? 'text-emerald-600' : forecastData.safetyIndex >= 50 ? 'text-amber-600' : 'text-rose-600'
            }`}>
              {forecastData.safetyIndex}%
            </span>
          </div>
          <span className="text-[10px] text-slate-500 block mt-0.5">
            {forecastData.safetyIndex >= 80 ? '🟢 Đạt ngưỡng an toàn' : '🔴 Cần đào tạo bổ sung L2'}
          </span>
        </div>
      </div>

      {/* Domain Gap Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-2">
            <Target className="w-4 h-4 text-indigo-600" />
            <span>Chi Tiết Dự Báo Nhu Cầu L2 Theo 14 Nhóm Kỹ Năng (Domains)</span>
          </h4>
          <span className="text-[11px] text-slate-500 font-medium">
            Mỗi domain cần tối thiểu <strong>{forecastData.requiredL2PerDomain} kỹ sư L2</strong>
          </span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 text-[11px] uppercase tracking-wider">
              <tr>
                <th className="p-3">Nhóm Kỹ Năng (Domain)</th>
                <th className="p-3 text-center">Số Kỹ Sư L2 Hiện Có</th>
                <th className="p-3 text-center">Số Kỹ Sư L2 Cần Thiết</th>
                <th className="p-3 text-center">Thiếu Hụt (Gap)</th>
                <th className="p-3">Trạng Thái An Toàn</th>
                <th className="p-3 text-right">Ứng Viên L1 Khả Thi Nâng Cấp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {forecastData.domainResults.map(item => {
                const isExpanded = expandedDomain === item.domain;
                return (
                  <React.Fragment key={item.domain}>
                    <tr className={`hover:bg-slate-50/80 transition-colors ${
                      item.status === 'critical' ? 'bg-rose-50/30' : item.status === 'warning' ? 'bg-amber-50/30' : ''
                    }`}>
                      <td className="p-3 font-bold text-slate-900">
                        <div className="flex items-center gap-2">
                          <span>{item.domain}</span>
                          <span className="text-[10px] font-normal text-slate-400">({item.totalSkills} SK)</span>
                        </div>
                      </td>

                      <td className="p-3 text-center font-bold font-mono text-slate-800">
                        <span className={`px-2 py-0.5 rounded text-xs ${
                          item.currentL2Count >= item.requiredL2 ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {item.currentL2Count} KS
                        </span>
                      </td>

                      <td className="p-3 text-center font-bold font-mono text-indigo-700">
                        <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-800 border border-indigo-200">
                          {item.requiredL2} KS
                        </span>
                      </td>

                      <td className="p-3 text-center font-bold font-mono">
                        {item.gap > 0 ? (
                          <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-black">
                            Thiếu {item.gap} KS
                          </span>
                        ) : (
                          <span className="text-emerald-600 font-bold">✓ Đủ</span>
                        )}
                      </td>

                      <td className="p-3">
                        {item.status === 'safe' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            <ShieldCheck className="w-3 h-3" />
                            <span>Vận Hành An Toàn</span>
                          </span>
                        )}
                        {item.status === 'warning' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                            <AlertTriangle className="w-3 h-3" />
                            <span>Thiếu 1 Backup L2</span>
                          </span>
                        )}
                        {item.status === 'critical' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300 animate-pulse">
                            <ShieldAlert className="w-3 h-3" />
                            <span>Rủi Ro Thiếu Hụt Trọng Yếu</span>
                          </span>
                        )}
                      </td>

                      <td className="p-3 text-right">
                        {item.l1CandidateEngineers.length > 0 ? (
                          <button
                            type="button"
                            onClick={() => setExpandedDomain(isExpanded ? null : item.domain)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-lg text-[11px] transition-colors border border-indigo-200"
                          >
                            <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
                            <span>{item.l1CandidateEngineers.length} KS L1 Khả Thi</span>
                            {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400">Không có KS L1</span>
                        )}
                      </td>
                    </tr>

                    {/* Expandable Upskill Pipeline Candidates */}
                    {isExpanded && item.l1CandidateEngineers.length > 0 && (
                      <tr className="bg-indigo-50/50">
                        <td colSpan={6} className="p-3.5 border-t border-indigo-100">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs font-bold text-indigo-950">
                              <span className="flex items-center gap-1.5">
                                <Sparkles className="w-4 h-4 text-amber-500" />
                                <span>Gợi Ý Lộ Trình Đào Tạo Bồi Dưỡng L1 ➔ L2 Cho Domain "{item.domain}":</span>
                              </span>
                              <span className="text-[10px] font-normal text-slate-500">
                                Ưu tiên giao bài Lab nâng cao cho các kỹ sư dưới đây để bù đắp khoảng trống {item.gap} L2
                              </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                              {item.l1CandidateEngineers.map(cand => (
                                <div key={cand.name} className="p-2 bg-white rounded-lg border border-indigo-200 flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <div className={`w-6 h-6 rounded-md bg-gradient-to-br ${cand.avatarColor} text-white font-bold text-[10px] flex items-center justify-center`}>
                                      {cand.name.charAt(0)}
                                    </div>
                                    <div>
                                      <span className="font-bold text-slate-900 block text-xs">{cand.name}</span>
                                      <span className="text-[9px] text-slate-500">{cand.roleTitle}</span>
                                    </div>
                                  </div>
                                  <span className="text-[10px] font-bold px-1.5 py-0.2 bg-amber-100 text-amber-900 rounded border border-amber-200">
                                    Đang ở L1
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
