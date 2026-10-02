import React, { useState, useMemo } from 'react';
import { SkillItem, TeamMember } from '../types/skills';
import { COMPETENCY_DEFINITIONS } from '../data/initialData';
import { 
  CheckCircle2, 
  ShieldAlert, 
  ShieldCheck, 
  Layers, 
  Users, 
  Zap, 
  ChevronDown, 
  ChevronUp, 
  TrendingUp, 
  AlertTriangle, 
  Award, 
  Info,
  Compass,
  GraduationCap,
  Target,
  ArrowRight
} from 'lucide-react';
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer, 
  Tooltip 
} from 'recharts';

interface StatsOverviewProps {
  skills: SkillItem[];
  members: TeamMember[];
  onFilterClick?: (type: 'spof' | 'ready' | 'all') => void;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({ skills, members, onFilterClick }) => {
  const [isRadarExpanded, setIsRadarExpanded] = useState<boolean>(true);

  const totalSkills = skills.length;

  // Skills with at least one member at L2 (Đã biết và Lab thành công)
  const readySkills = skills.filter(s =>
    members.some(m => {
      const lvl = s.ratings[m.name] || 'L0';
      return (COMPETENCY_DEFINITIONS[lvl]?.score || 0) >= 2;
    })
  ).length;

  // Fully covered (has both SME and Backup)
  const fullyCovered = skills.filter(s => s.sme && s.backup).length;

  // Single Point of Failure (SPOF): has SME or Owner but NO backup
  const spofCount = skills.filter(s => (s.sme || s.owner) && !s.backup).length;

  // High Risk: NO SME and NO Backup
  const criticalUncovered = skills.filter(s => !s.sme && !s.backup).length;

  // Overall average team score
  let totalScore = 0;
  let totalRatingsCount = 0;
  skills.forEach(s => {
    members.forEach(m => {
      const lvl = s.ratings[m.name] || 'L0';
      totalScore += COMPETENCY_DEFINITIONS[lvl]?.score || 0;
      totalRatingsCount++;
    });
  });
  const avgScore = totalRatingsCount > 0 ? (totalScore / totalRatingsCount).toFixed(2) : '0.00';

  const readyPercentage = totalSkills > 0 ? Math.round((readySkills / totalSkills) * 100) : 0;
  const coveragePercentage = totalSkills > 0 ? Math.round((fullyCovered / totalSkills) * 100) : 0;

  // Compute Radar Chart data across infrastructure domains
  const radarData = useMemo(() => {
    const domainMap: Record<string, { totalScore: number; count: number; skillCount: number; l2Count: number }> = {};
    
    skills.forEach(s => {
      const d = s.domain || 'General';
      if (!domainMap[d]) {
        domainMap[d] = { totalScore: 0, count: 0, skillCount: 0, l2Count: 0 };
      }
      domainMap[d].skillCount++;

      members.forEach(m => {
        const lvl = s.ratings[m.name] || 'L0';
        const score = COMPETENCY_DEFINITIONS[lvl]?.score || 0;
        domainMap[d].totalScore += score;
        domainMap[d].count++;
        if (score >= 2) {
          domainMap[d].l2Count++;
        }
      });
    });

    return Object.entries(domainMap).map(([domain, data]) => {
      const avg = data.count > 0 ? Number((data.totalScore / data.count).toFixed(2)) : 0;
      const l2Pct = data.count > 0 ? Math.round((data.l2Count / data.count) * 100) : 0;
      
      // Short label for clean polar angle axis display
      const shortDomain = domain
        .replace('Database (Deploy & Basic configuration)', 'Database')
        .replace('Basic Database Querying', 'DB Query')
        .replace('Log file analysis and troubleshooting', 'Log Analysis')
        .replace('UC & Contact Center', 'UC / CC')
        .replace('Storage & Backup', 'Storage')
        .replace('Syslog & Monitoring', 'Syslog/Mon')
        .replace('Container Platform', 'Containers')
        .replace('Basic Programming', 'Programming')
        .replace('Windows Server', 'Win Server')
        .replace('Linux Server', 'Linux')
        .replace('Enterprise Networking & SD-WAN', 'Network')
        .replace('Cyber Security & Zero Trust', 'Security');

      return {
        domain,
        shortDomain,
        avgScore: avg,
        skillCount: data.skillCount,
        l2Pct,
        fullMark: 2.0
      };
    });
  }, [skills, members]);

  // 1. Phân tích thành viên cần đào tạo thêm (Training & Lab Support)
  const memberTrainingAnalysis = useMemo(() => {
    return members.map(m => {
      let l0 = 0;
      let l1 = 0;
      let l2 = 0;
      let assignedUnderL2 = 0;
      skills.forEach(s => {
        const lvl = s.ratings[m.name] || 'L0';
        if (lvl === 'L2') l2++;
        else if (lvl === 'L1') l1++;
        else l0++;

        if ((s.owner === m.name || s.backup === m.name) && lvl !== 'L2') {
          assignedUnderL2++;
        }
      });
      const needsTraining = l1 > 0 || assignedUnderL2 > 0;
      return {
        member: m,
        l0,
        l1,
        l2,
        assignedUnderL2,
        needsTraining
      };
    });
  }, [members, skills]);

  const trainingNeededMembers = useMemo(() => {
    return memberTrainingAnalysis.filter(m => m.needsTraining);
  }, [memberTrainingAnalysis]);

  const totalL1Skills = useMemo(() => {
    return memberTrainingAnalysis.reduce((acc, m) => acc + m.l1, 0);
  }, [memberTrainingAnalysis]);

  // 2. Phân tích tỉ lệ bao phủ (Coverage) của 14 domain
  const domainCoverageAnalysis = useMemo(() => {
    const domainMap: Record<string, { total: number; ready: number; withBackup: number }> = {};
    skills.forEach(s => {
      const d = s.domain || 'General';
      if (!domainMap[d]) {
        domainMap[d] = { total: 0, ready: 0, withBackup: 0 };
      }
      domainMap[d].total++;
      
      const isReady = members.some(m => {
        const lvl = s.ratings[m.name] || 'L0';
        return (COMPETENCY_DEFINITIONS[lvl]?.score || 0) >= 2;
      });
      if (isReady) domainMap[d].ready++;

      if (s.backup && (s.sme || s.owner)) {
        domainMap[d].withBackup++;
      }
    });

    const domains = Object.entries(domainMap).map(([domain, data]) => {
      const coveragePct = data.total > 0 ? (data.ready / data.total) * 100 : 0;
      const backupPct = data.total > 0 ? (data.withBackup / data.total) * 100 : 0;
      return {
        domain,
        total: data.total,
        ready: data.ready,
        coveragePct: Math.round(coveragePct),
        backupPct: Math.round(backupPct)
      };
    });

    const avgCoverage = domains.length > 0 
      ? Math.round(domains.reduce((sum, d) => sum + d.coveragePct, 0) / domains.length)
      : 0;

    const avgBackupCoverage = domains.length > 0
      ? Math.round(domains.reduce((sum, d) => sum + d.backupPct, 0) / domains.length)
      : 0;

    const sortedByCoverage = [...domains].sort((a, b) => b.coveragePct - a.coveragePct);
    const highest = sortedByCoverage[0];
    const lowest = sortedByCoverage[sortedByCoverage.length - 1];

    return {
      domainCount: domains.length,
      domains,
      avgCoverage,
      avgBackupCoverage,
      highest,
      lowest
    };
  }, [skills, members]);

  // Insights: Top Strongest and Needs Improvement Domains
  const sortedByScore = useMemo(() => {
    return [...radarData].sort((a, b) => b.avgScore - a.avgScore);
  }, [radarData]);

  const topDomains = sortedByScore.slice(0, 3);
  const bottomDomains = [...sortedByScore].reverse().slice(0, 3);

  // Custom Tooltip for Radar Chart
  const CustomRadarTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900/95 text-white p-3 rounded-xl shadow-xl border border-slate-700/80 text-xs backdrop-blur-md z-50">
          <p className="font-extrabold text-indigo-300 text-sm">{data.domain}</p>
          <div className="mt-2 space-y-1">
            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-400">Điểm Đánh Giá TB:</span>
              <span className="font-bold text-amber-400 font-mono text-sm">{data.avgScore} / 2.0</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-400">Tỷ Lệ Thực Chiến (L2):</span>
              <span className="font-semibold text-emerald-400 font-mono">{data.l2Pct}%</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-400">Tổng Số Kỹ Năng:</span>
              <span className="font-medium text-slate-200">{data.skillCount} kỹ năng</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4 mb-6 no-print">
      {/* 1. Layout Dạng Grid 2x2: Bốn Chỉ Số Cốt Lõi */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Ô 1 (Hàng 1, Cột 1): Số Kỹ Năng Đạt Chuẩn L2 */}
        <div 
          onClick={() => onFilterClick && onFilterClick('ready')}
          className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs hover:shadow-xs transition-all hover:border-emerald-300 cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between gap-3 mb-2.5">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200/70 group-hover:scale-105 transition-transform">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                    Số Kỹ Năng Đạt Chuẩn L2
                  </h4>
                  <p className="text-xs text-slate-500">Đã biết và tự tay dựng bài Lab thực chiến thành công</p>
                </div>
              </div>
              <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/80 shadow-2xs">
                {readyPercentage}% Hoàn Tất
              </span>
            </div>

            <div className="flex items-baseline gap-2 mt-3">
              <span className="text-3xl font-extrabold tracking-tight text-slate-900 font-mono">
                {readySkills}
              </span>
              <span className="text-sm font-semibold text-slate-500">
                / {totalSkills} kỹ năng hạ tầng
              </span>
            </div>

            {/* Progress Bar */}
            <div className="mt-3.5">
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden border border-slate-200/60">
                <div 
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${readyPercentage}%` }}
                />
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">
              Có ít nhất 1 kỹ sư trong nhóm làm chủ độc lập
            </span>
            <span className="font-semibold text-emerald-700 group-hover:underline inline-flex items-center gap-1">
              <span>Xem kỹ năng L2</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>

        {/* Ô 2 (Hàng 1, Cột 2): Số Thành Viên Cần Training Thêm */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs hover:shadow-xs transition-all hover:border-amber-300 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-3 mb-2.5">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200/70">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Số Thành Viên Cần Training Thêm
                  </h4>
                  <p className="text-xs text-slate-500">Kỹ sư có kỹ năng L1 (đang thực hành Lab) hoặc cần củng cố</p>
                </div>
              </div>
              <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200/80 shadow-2xs">
                {trainingNeededMembers.length} / {members.length} Kỹ Sư
              </span>
            </div>

            <div className="flex items-baseline gap-2 mt-3">
              <span className="text-3xl font-extrabold tracking-tight text-slate-900 font-mono">
                {trainingNeededMembers.length}
              </span>
              <span className="text-sm font-semibold text-slate-500">
                kỹ sư đang có kỹ năng cần hỗ trợ bài Lab
              </span>
            </div>

            {/* Member chips needing training */}
            <div className="mt-3 flex flex-wrap gap-1.5 max-h-12 overflow-y-auto">
              {trainingNeededMembers.length > 0 ? (
                trainingNeededMembers.map(item => (
                  <span 
                    key={item.member.id || item.member.name}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold bg-amber-50/80 text-amber-900 border border-amber-200/60 px-2 py-0.5 rounded-md"
                  >
                    <span>{item.member.name}</span>
                    <span className="text-[10px] text-amber-700 bg-white px-1 rounded font-mono font-bold">
                      {item.l1} L1
                    </span>
                  </span>
                ))
              ) : (
                <span className="text-xs text-emerald-600 font-medium">Toàn bộ nhân sự đều đã vững chuẩn L2!</span>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Tổng cộng {totalL1Skills} lượt kỹ năng L1 cần hướng dẫn bài Lab</span>
            <span className="font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/50">
              Đào tạo thực chiến
            </span>
          </div>
        </div>

        {/* Ô 3 (Hàng 2, Cột 1): Tỉ Lệ Bao Phủ (Coverage) Trung Bình Của 14 Domain */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs hover:shadow-xs transition-all hover:border-blue-300 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-3 mb-2.5">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200/70">
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Tỉ Lệ Bao Phủ (Coverage) Trung Bình
                  </h4>
                  <p className="text-xs text-slate-500">Mức độ sẵn sàng triển khai trên {domainCoverageAnalysis.domainCount} phân khúc hạ tầng</p>
                </div>
              </div>
              <span className="text-xs font-bold text-blue-800 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200/80 shadow-2xs">
                {domainCoverageAnalysis.domainCount} Phân Khúc
              </span>
            </div>

            <div className="flex items-baseline gap-2 mt-3">
              <span className="text-3xl font-extrabold tracking-tight text-slate-900 font-mono">
                {domainCoverageAnalysis.avgCoverage}%
              </span>
              <span className="text-sm font-semibold text-slate-500">
                tỷ lệ bao phủ L2 trung bình các domain
              </span>
            </div>

            {/* Progress Bar */}
            <div className="mt-3.5">
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden border border-slate-200/60">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${domainCoverageAnalysis.avgCoverage}%` }}
                />
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className="truncate mr-2">
              Cao nhất: <strong className="text-slate-800 font-semibold">{domainCoverageAnalysis.highest?.domain}</strong> ({domainCoverageAnalysis.highest?.coveragePct}%)
            </span>
            <span className="font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200/50 shrink-0">
              Dự phòng (Backup): {domainCoverageAnalysis.avgBackupCoverage}%
            </span>
          </div>
        </div>

        {/* Ô 4 (Hàng 2, Cột 2): Phân Bổ An Toàn & Cảnh Báo SPOF */}
        <div 
          onClick={() => onFilterClick && onFilterClick('spof')}
          className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs hover:shadow-xs transition-all hover:border-rose-300 cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between gap-3 mb-2.5">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-200/70 group-hover:scale-105 transition-transform">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 group-hover:text-rose-700 transition-colors">
                    Độ Phủ Dự Phòng & Rủi Ro SPOF
                  </h4>
                  <p className="text-xs text-slate-500">Kỹ năng có người thay thế khi có sự cố hạ tầng phát sinh</p>
                </div>
              </div>
              <span className="text-xs font-bold text-rose-800 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200/80 shadow-2xs">
                {spofCount} SPOF Rủi Ro
              </span>
            </div>

            <div className="flex items-baseline gap-2 mt-3">
              <span className="text-3xl font-extrabold tracking-tight text-slate-900 font-mono">
                {fullyCovered}
              </span>
              <span className="text-sm font-semibold text-slate-500">
                / {totalSkills} kỹ năng đủ cả SME & Backup
              </span>
            </div>

            {/* Progress Bar */}
            <div className="mt-3.5">
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden border border-slate-200/60">
                <div 
                  className="bg-gradient-to-r from-emerald-500 via-amber-500 to-rose-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${coveragePercentage}%` }}
                />
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">
              {spofCount} kỹ năng chỉ có 1 người (nguy cơ SPOF)
            </span>
            <span className="font-semibold text-rose-700 group-hover:underline inline-flex items-center gap-1">
              <span>Lọc kỹ năng SPOF</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      </div>

      {/* 2. Recharts Radar Chart: Average Skill Distribution across Infrastructure Domains */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden transition-all">
        {/* Header & Toggle */}
        <div className="p-4 sm:px-5 sm:py-3.5 bg-slate-50/70 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-100/70 text-indigo-700 border border-indigo-200/60">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900">
                  Biểu Đồ Radar Năng Lực 14+ Nhóm Hạ Tầng (Domain Skill Distribution)
                </h3>
                <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200/80 px-2 py-0.5 rounded-full">
                  {radarData.length} Domains
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Trực quan hóa độ chín muồi và điểm đánh giá trung bình của toàn đội ngũ theo từng mảng công nghệ
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2 text-[11px] text-slate-500 mr-2">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 inline-block" />
                <span>Điểm TB Đội Ngũ (0 - 2.0)</span>
              </span>
            </div>

            <button
              type="button"
              onClick={() => setIsRadarExpanded(!isRadarExpanded)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors shadow-2xs cursor-pointer"
            >
              <span>{isRadarExpanded ? 'Thu Gọn' : 'Mở Rộng Radar'}</span>
              {isRadarExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Collapsible Radar Chart Body */}
        {isRadarExpanded && (
          <div className="p-5 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center animate-in fade-in duration-200">
            {/* Left: Recharts Radar Chart */}
            <div className="lg:col-span-8 flex flex-col items-center justify-center">
              <div className="w-full h-80 sm:h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                    <PolarGrid stroke="#cbd5e1" strokeDasharray="3 3" />
                    <PolarAngleAxis 
                      dataKey="shortDomain" 
                      tick={{ fill: '#334155', fontSize: 11, fontWeight: 600 }}
                    />
                    <PolarRadiusAxis 
                      angle={30} 
                      domain={[0, 2]} 
                      stroke="#94a3b8"
                      tick={{ fill: '#64748b', fontSize: 10 }}
                    />
                    <Tooltip content={<CustomRadarTooltip />} />
                    <Radar 
                      name="Điểm Trung Bình Đội Ngũ" 
                      dataKey="avgScore" 
                      stroke="#4f46e5" 
                      fill="#6366f1" 
                      fillOpacity={0.35} 
                      strokeWidth={2.5} 
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              {/* Reference Benchmarks Scale */}
              <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] text-slate-500 pt-2 border-t border-slate-100 w-full">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-slate-300" />
                  <span>L0 (0.0): Chưa Biết</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span>L1 (1.0): Đã Biết / Chưa Lab</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>L2 (2.0): Thực Chiến / Lab Thành Công</span>
                </span>
              </div>
            </div>

            {/* Right: Domain Analysis & Highlights Panel */}
            <div className="lg:col-span-4 space-y-4 bg-slate-50/70 p-4 rounded-xl border border-slate-200/80">
              <div>
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Mảng Thế Mạnh Dẫn Đầu (Top L2)</span>
                </h4>
                <div className="mt-2.5 space-y-2">
                  {topDomains.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200/80 text-xs shadow-2xs">
                      <div className="flex items-center gap-2 truncate pr-2">
                        <span className="w-5 h-5 rounded-md bg-emerald-50 text-emerald-700 font-bold flex items-center justify-center text-[10px] shrink-0 border border-emerald-200">
                          #{idx + 1}
                        </span>
                        <span className="font-semibold text-slate-900 truncate" title={item.domain}>
                          {item.domain}
                        </span>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-bold font-mono text-emerald-600 text-xs">{item.avgScore}</span>
                        <span className="text-[10px] text-slate-400"> / 2.0</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200/80">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  <span>Mảng Cần Đẩy Mạnh Đào Tạo (Need Lab)</span>
                </h4>
                <div className="mt-2.5 space-y-2">
                  {bottomDomains.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200/80 text-xs shadow-2xs">
                      <div className="flex items-center gap-2 truncate pr-2">
                        <span className="w-5 h-5 rounded-md bg-amber-50 text-amber-700 font-bold flex items-center justify-center text-[10px] shrink-0 border border-amber-200">
                          #{idx + 1}
                        </span>
                        <span className="font-semibold text-slate-800 truncate" title={item.domain}>
                          {item.domain}
                        </span>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-bold font-mono text-amber-700 text-xs">{item.avgScore}</span>
                        <span className="text-[10px] text-slate-400"> / 2.0</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200/80 text-[11px] text-slate-500 flex items-start gap-1.5">
                <Info className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
                <span>
                  Độ phủ đa giác càng mở rộng về chu vi vòng ngoài (2.0) phản ánh đội ngũ càng hoàn thiện năng lực tự chủ triển khai.
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
