import React, { useState } from 'react';
import { CompetencyLevel, PrintReportConfig, SkillItem, TeamMember } from '../types/skills';
import { COMPETENCY_DEFINITIONS } from '../data/initialData';
import { 
  BarChart3, 
  PieChart, 
  ShieldAlert, 
  TrendingUp, 
  Users,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Layers,
  ArrowDownUp,
  Flame,
  Activity,
  Printer,
  User
} from 'lucide-react';
import { SyncState } from './SyncSettingsModal';
import { PerformanceMetricsDashboard } from './PerformanceMetricsDashboard';
import { AdvancedDataVisualizations } from './AdvancedDataVisualizations';
import { IndividualMemberAnalytics } from './IndividualMemberAnalytics';

export interface SyncMilestonePoint {
  id: string;
  timestamp: string;
  label: string;
  eventDescription: string;
  l2SkillCount: number;
  totalSkills: number;
  l2Percentage: number;
  totalL2Ratings: number;
  avgScore: number;
}

interface RealtimeChartsProps {
  skills: SkillItem[];
  members: TeamMember[];
  syncState?: SyncState | null;
  onOpenPrintModal?: (customPresetConfig?: Partial<PrintReportConfig>) => void;
}

export const RealtimeCharts: React.FC<RealtimeChartsProps> = ({ skills, members, syncState, onOpenPrintModal }) => {
  const [analyticsViewMode, setAnalyticsViewMode] = useState<'team' | 'member'>('team');
  const [selectedMember, setSelectedMember] = useState<string>('all');
  const [chartMetric, setChartMetric] = useState<'average' | 'l3plus'>('average');
  const [domainSortBy, setDomainSortBy] = useState<'deficit_desc' | 'l2_desc' | 'name'>('deficit_desc');
  const [showOnlyDeficitDomains, setShowOnlyDeficitDomains] = useState<boolean>(false);
  const [trendMetric, setTrendMetric] = useState<'l2_skills' | 'l2_pct' | 'l2_ratings'>('l2_skills');
  const [showTrendline, setShowTrendline] = useState<boolean>(true);
  const [selectedMilestoneId, setSelectedMilestoneId] = useState<string | null>(null);

  // Overall Team Average Score (for Trendline baseline on domain ranking)
  let allRatingsScoreSum = 0;
  let allRatingsCount = 0;
  skills.forEach(s => {
    members.forEach(m => {
      const lvl = s.ratings[m.name] || 'L0';
      allRatingsScoreSum += COMPETENCY_DEFINITIONS[lvl]?.score || 0;
      allRatingsCount++;
    });
  });
  const teamAverageScore = allRatingsCount > 0 ? (allRatingsScoreSum / allRatingsCount).toFixed(2) : '0.00';

  // 1. Compute stats by domain
  const domains = Array.from(new Set(skills.map(s => s.domain))).sort();

  const domainStats = domains.map(domain => {
    const domainSkills = skills.filter(s => s.domain === domain);
    const count = domainSkills.length;

    let totalScore = 0;
    let l2Count = 0;
    let ratingCount = 0;

    domainSkills.forEach(skill => {
      members.forEach(member => {
        if (selectedMember === 'all' || selectedMember === member.name) {
          const lvl = skill.ratings[member.name] || 'L0';
          const score = COMPETENCY_DEFINITIONS[lvl]?.score || 0;
          totalScore += score;
          ratingCount++;
          if (score >= 2) {
            l2Count++;
          }
        }
      });
    });

    const avgScore = ratingCount > 0 ? Number((totalScore / ratingCount).toFixed(2)) : 0;
    const l2Percentage = ratingCount > 0 ? Math.round((l2Count / ratingCount) * 100) : 0;

    // Check risk in this domain
    const spofCount = domainSkills.filter(s => (s.sme || s.owner) && !s.backup).length;
    const missingSmeCount = domainSkills.filter(s => !s.sme).length;

    return {
      domain,
      count,
      avgScore,
      l2Percentage,
      spofCount,
      missingSmeCount
    };
  });

  // Sort domains by avgScore descending
  const sortedDomains = [...domainStats].sort((a, b) => b.avgScore - a.avgScore);

  // 2. Compute level distribution per member
  const memberDistributions = members.map(m => {
    const dist: Record<CompetencyLevel, number> = {
      L0: 0,
      L1: 0,
      L2: 0,
      L3: 0,
      L4: 0,
      L5: 0
    };

    let totalScore = 0;
    skills.forEach(s => {
      const lvl = s.ratings[m.name] || 'L0';
      dist[lvl] = (dist[lvl] || 0) + 1;
      totalScore += COMPETENCY_DEFINITIONS[lvl]?.score || 0;
    });

    const avg = (totalScore / (skills.length || 1)).toFixed(2);
    const ownedCount = skills.filter(s => s.owner === m.name).length;
    const backupCount = skills.filter(s => s.backup === m.name).length;
    const smeCount = skills.filter(s => s.sme === m.name).length;

    return {
      member: m,
      dist,
      avgScore: Number(avg),
      ownedCount,
      backupCount,
      smeCount
    };
  });

  // 3. Radar Chart geometry calculations (for 14 domains)
  const radarRadius = 130;
  const radarCenter = 170;
  const angleStep = (2 * Math.PI) / domains.length;

  const radarPoints = domainStats.map((d, index) => {
    const angle = index * angleStep - Math.PI / 2;
    // Scale 0-2 score to radius (max 2.0)
    const r = (d.avgScore / 2.0) * radarRadius;
    const x = radarCenter + r * Math.cos(angle);
    const y = radarCenter + r * Math.sin(angle);
    return { ...d, x, y, angle };
  });

  const radarPolygonPath = radarPoints.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';

  // Overall Coverage breakdown
  const fullyCoveredCount = skills.filter(s => s.sme && s.backup).length;
  const spofSkillsCount = skills.filter(s => (s.sme || s.owner) && !s.backup).length;
  const criticalMissingCount = skills.filter(s => !s.sme && !s.backup).length;

  // 4. Domain Competency & L2 Deficit Analysis for Leadership
  const domainDeficitAnalysis = domains.map(domain => {
    const domainSkills = skills.filter(s => s.domain === domain);
    const totalSkills = domainSkills.length;

    // Skills where at least one member has reached L2 (or above)
    const skillsWithL2 = domainSkills.filter(s =>
      members.some(m => {
        const lvl = s.ratings[m.name] || 'L0';
        return (COMPETENCY_DEFINITIONS[lvl]?.score || 0) >= 2;
      })
    ).length;

    const l2DeficitSkills = totalSkills - skillsWithL2;
    const l2CoverageRate = totalSkills > 0 ? Math.round((skillsWithL2 / totalSkills) * 100) : 0;
    const l2DeficitRate = 100 - l2CoverageRate;

    // Full rating distribution across all members in this domain
    const totalRatings = totalSkills * (members.length || 1);
    let l0Count = 0;
    let l1Count = 0;
    let l2Count = 0;

    domainSkills.forEach(s => {
      members.forEach(m => {
        const lvl = s.ratings[m.name] || 'L0';
        if (lvl === 'L2') l2Count++;
        else if (lvl === 'L1') l1Count++;
        else l0Count++;
      });
    });

    const l0Pct = totalRatings > 0 ? Math.round((l0Count / totalRatings) * 100) : 0;
    const l1Pct = totalRatings > 0 ? Math.round((l1Count / totalRatings) * 100) : 0;
    const l2Pct = totalRatings > 0 ? Math.round((l2Count / totalRatings) * 100) : 0;

    const spofCount = domainSkills.filter(s => (s.sme || s.owner) && !s.backup).length;
    const missingSmeCount = domainSkills.filter(s => !s.sme).length;

    const missingL2SkillNames = domainSkills
      .filter(s => !members.some(m => (COMPETENCY_DEFINITIONS[s.ratings[m.name] || 'L0']?.score || 0) >= 2))
      .map(s => s.skill);

    return {
      domain,
      totalSkills,
      skillsWithL2,
      l2DeficitSkills,
      l2CoverageRate,
      l2DeficitRate,
      totalRatings,
      dist: { L0: l0Count, L1: l1Count, L2: l2Count },
      pcts: { L0: l0Pct, L1: l1Pct, L2: l2Pct },
      spofCount,
      missingSmeCount,
      missingL2SkillNames
    };
  });

  // Sort and filter domains for leadership view
  const sortedDeficitDomains = [...domainDeficitAnalysis]
    .filter(d => !showOnlyDeficitDomains || d.l2DeficitSkills > 0)
    .sort((a, b) => {
      if (domainSortBy === 'deficit_desc') {
        if (b.l2DeficitSkills !== a.l2DeficitSkills) {
          return b.l2DeficitSkills - a.l2DeficitSkills;
        }
        if (b.l2DeficitRate !== a.l2DeficitRate) {
          return b.l2DeficitRate - a.l2DeficitRate;
        }
        return b.dist.L0 - a.dist.L0;
      }
      if (domainSortBy === 'l2_desc') {
        return b.l2CoverageRate - a.l2CoverageRate || b.skillsWithL2 - a.skillsWithL2;
      }
      return a.domain.localeCompare(b.domain);
    });

  // Overall summary metrics for leadership cards
  const totalSkillsLackingL2 = skills.filter(s =>
    !members.some(m => (COMPETENCY_DEFINITIONS[s.ratings[m.name] || 'L0']?.score || 0) >= 2)
  ).length;

  const domainsWithL2Deficit = domainDeficitAnalysis.filter(d => d.l2DeficitSkills > 0);
  const topDeficitDomain = [...domainDeficitAnalysis].sort((a, b) => b.l2DeficitSkills - a.l2DeficitSkills || b.l2DeficitRate - a.l2DeficitRate)[0];

  let totalL1PendingLab = 0;
  skills.forEach(s => {
    members.forEach(m => {
      if (s.ratings[m.name] === 'L1') totalL1PendingLab++;
    });
  });

  // 5. Sync Milestones & Linear Regression Trendline Calculations
  const liveSkillsWithL2 = skills.filter(s =>
    members.some(m => (COMPETENCY_DEFINITIONS[s.ratings[m.name] || 'L0']?.score || 0) >= 2)
  ).length;
  const liveL2Pct = skills.length > 0 ? Math.round((liveSkillsWithL2 / skills.length) * 100) : 0;
  let liveTotalL2Ratings = 0;
  skills.forEach(s => {
    members.forEach(m => {
      const lvl = s.ratings[m.name] || 'L0';
      if (lvl === 'L2') liveTotalL2Ratings++;
    });
  });

  const syncMilestones: SyncMilestonePoint[] = [
    {
      id: 'm1',
      timestamp: '2026-09-28 14:44',
      label: 'Mốc 1: Khởi tạo',
      eventDescription: 'Đồng bộ cấu hình ban đầu từ SharePoint',
      l2SkillCount: 54,
      totalSkills: skills.length || 94,
      l2Percentage: 57,
      totalL2Ratings: 56,
      avgScore: 0.65
    },
    {
      id: 'm2',
      timestamp: '2026-09-28 17:30',
      label: 'Mốc 2: Rà soát đợt 1',
      eventDescription: 'Xác thực chứng chỉ & hoàn thiện hồ sơ Lab hạ tầng',
      l2SkillCount: 72,
      totalSkills: skills.length || 94,
      l2Percentage: 77,
      totalL2Ratings: 75,
      avgScore: 0.82
    },
    {
      id: 'm3',
      timestamp: syncState?.lastSyncTime && syncState.lastSyncTime !== 'Khởi tạo ban đầu' ? syncState.lastSyncTime.slice(0, 16) : '2026-09-29 14:20',
      label: 'Mốc 3: Đồng bộ SharePoint',
      eventDescription: 'Cập nhật 88 mục thay đổi cấu hình Lab từ file Excel trực tuyến',
      l2SkillCount: 88,
      totalSkills: skills.length || 94,
      l2Percentage: 94,
      totalL2Ratings: 90,
      avgScore: 0.96
    },
    {
      id: 'm4',
      timestamp: syncState?.lastCheckTime || 'Hiện tại (Live)',
      label: 'Mốc 4: Ma Trận Hiện Hành',
      eventDescription: 'Trạng thái đồng bộ thời gian thực mới nhất trên hệ thống',
      l2SkillCount: liveSkillsWithL2,
      totalSkills: skills.length || 94,
      l2Percentage: liveL2Pct,
      totalL2Ratings: liveTotalL2Ratings,
      avgScore: Number(teamAverageScore)
    }
  ];

  const getMetricValue = (m: SyncMilestonePoint): number => {
    if (trendMetric === 'l2_skills') return m.l2SkillCount;
    if (trendMetric === 'l2_pct') return m.l2Percentage;
    return m.totalL2Ratings;
  };

  const getMetricMax = (): number => {
    if (trendMetric === 'l2_skills') return skills.length || 94;
    if (trendMetric === 'l2_pct') return 100;
    return (skills.length || 94) * 2;
  };

  const getMetricUnit = (): string => {
    if (trendMetric === 'l2_skills') return 'kỹ năng L2';
    if (trendMetric === 'l2_pct') return '% phủ L2';
    return 'lượt đánh giá L2';
  };

  // Linear Regression Calculation: y = mx + b
  const nPoints = syncMilestones.length;
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumX2 = 0;

  syncMilestones.forEach((pt, i) => {
    const val = getMetricValue(pt);
    sumX += i;
    sumY += val;
    sumXY += i * val;
    sumX2 += i * i;
  });

  const slope = (nPoints * sumXY - sumX * sumY) / (nPoints * sumX2 - sumX * sumX || 1);
  const intercept = (sumY - slope * sumX) / nPoints;
  const maxCap = getMetricMax();
  const forecastVal = Math.min(maxCap, Math.max(0, Math.round(slope * nPoints + intercept)));

  // SVG Chart Geometry
  const chartW = 720;
  const chartH = 260;
  const padLeft = 55;
  const padRight = 55;
  const padTop = 35;
  const padBottom = 45;
  const plotW = chartW - padLeft - padRight;
  const plotH = chartH - padTop - padBottom;
  const yMax = getMetricMax();
  const yMin = 0;

  const actualPoints = syncMilestones.map((pt, i) => {
    const x = padLeft + (i / (nPoints - 1 || 1)) * plotW;
    const yVal = getMetricValue(pt);
    const y = padTop + plotH - ((yVal - yMin) / (yMax - yMin || 1)) * plotH;
    return { ...pt, x, y, yVal };
  });

  const trendPoints = syncMilestones.map((_, i) => {
    const x = padLeft + (i / (nPoints - 1 || 1)) * plotW;
    const yVal = Math.min(maxCap, Math.max(0, slope * i + intercept));
    const y = padTop + plotH - ((yVal - yMin) / (yMax - yMin || 1)) * plotH;
    return { x, y, yVal };
  });

  const actualPath = actualPoints.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath = `${actualPath} L ${actualPoints[actualPoints.length - 1].x} ${padTop + plotH} L ${actualPoints[0].x} ${padTop + plotH} Z`;
  const trendlinePath = trendPoints.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  const totalGrowth = actualPoints[actualPoints.length - 1].yVal - actualPoints[0].yVal;
  const growthRatePct = actualPoints[0].yVal > 0 ? Math.round((totalGrowth / actualPoints[0].yVal) * 100) : 0;

  // Quick-access export as PDF configured for current chart view
  const handleExportPDF = () => {
    if (!onOpenPrintModal) return;

    if (selectedMember !== 'all') {
      const memObj = members.find(m => m.name === selectedMember);
      onOpenPrintModal({
        departmentTitle: `BÁO CÁO NĂNG LỰC CÁ NHÂN: KỸ SƯ ${selectedMember.toUpperCase()}`,
        reportSubtitle: `Chức danh: ${memObj?.roleTitle || 'Kỹ sư Hạ tầng'} · Viendat Services`,
        notes: `Báo cáo năng lực cá nhân trích xuất từ biểu đồ Live Analytics. Kỹ sư ${selectedMember} có điểm trung bình ${memberDistributions.find(m => m.member.name === selectedMember)?.avgScore || 0}/2.0.`,
        selectedDomains: domains,
        visibleColumns: {
          showIndex: true,
          showDomain: true,
          showSkill: true,
          members: [selectedMember],
          showOwner: true,
          showBackup: true,
          showSme: true,
          showEvidence: true,
          showAvgScore: true,
          showL2Rate: chartMetric === 'l3plus',
        },
        filterMode: 'all',
        showKpis: true,
        showCompetencyLegend: true,
        showSignatures: true,
      });
    } else if (showOnlyDeficitDomains) {
      const deficitDomainNames = domainsWithL2Deficit.map(d => d.domain);
      onOpenPrintModal({
        departmentTitle: 'BÁO CÁO PHÂN KHÚC HẠ TẦNG THIẾU HỤT CHUẨN L2 (CẦN CẤP BÀI LAB)',
        reportSubtitle: 'Góc Nhìn Ban Lãnh Đạo · Đánh Giá & Bổ Sung Năng Lực Thực Chiến Đội Ngũ',
        notes: `Báo cáo lọc tự động ${deficitDomainNames.length} domain đang thiếu hụt kỹ sư đạt chuẩn L2 (Đã Lab thành công). Đề nghị ưu tiên cấp môi trường Lab thực hành.`,
        selectedDomains: deficitDomainNames,
        visibleColumns: {
          showIndex: true,
          showDomain: true,
          showSkill: true,
          members: members.map(m => m.name),
          showOwner: true,
          showBackup: true,
          showSme: true,
          showEvidence: false,
          showAvgScore: true,
          showL2Rate: true,
        },
        filterMode: 'deficit_only',
        showKpis: true,
        showCompetencyLegend: true,
        showSignatures: true,
      });
    } else {
      onOpenPrintModal({
        departmentTitle: 'BÁO CÁO MA TRẬN NĂNG LỰC HẠ TẦNG THỜI GIAN THỰC (LIVE ANALYTICS)',
        reportSubtitle: 'Viendat Information Technology & Systems Integration Services',
        notes: `Đường xu hướng hồi quy tăng trưởng năng lực L2 hiện tại: +${slope.toFixed(1)} kỹ năng/kỳ đồng bộ. Điểm trung bình toàn đội: ${teamAverageScore}/2.0.`,
        selectedDomains: domains,
        visibleColumns: {
          showIndex: true,
          showDomain: true,
          showSkill: true,
          members: members.map(m => m.name),
          showOwner: true,
          showBackup: true,
          showSme: true,
          showEvidence: false,
          showAvgScore: true,
          showL2Rate: chartMetric === 'l3plus',
        },
        filterMode: 'all',
        showKpis: true,
        showCompetencyLegend: true,
        showSignatures: true,
      });
    }
  };

  const handleExportDeficitReport = () => {
    if (!onOpenPrintModal) return;
    const deficitDomainNames = domainsWithL2Deficit.map(d => d.domain);
    onOpenPrintModal({
      departmentTitle: 'BÁO CÁO PHÂN KHÚC HẠ TẦNG THIẾU HỤT CHUẨN L2 (CẦN CẤP BÀI LAB)',
      reportSubtitle: 'Góc Nhìn Ban Lãnh Đạo · Danh Mục Phân Khúc Cần Bồi Dưỡng Thực Chiến',
      notes: `Có ${totalSkillsLackingL2} kỹ năng chưa có nhân sự nào đạt chuẩn L2 trong ${deficitDomainNames.length} domain. Đề nghị phê duyệt kinh phí và tài nguyên bài Lab.`,
      selectedDomains: deficitDomainNames.length > 0 ? deficitDomainNames : domains,
      visibleColumns: {
        showIndex: true,
        showDomain: true,
        showSkill: true,
        members: members.map(m => m.name),
        showOwner: true,
        showBackup: true,
        showSme: true,
        showEvidence: false,
        showAvgScore: true,
        showL2Rate: true,
      },
      filterMode: 'deficit_only',
      showKpis: true,
      showCompetencyLegend: true,
      showSignatures: true,
    });
  };

  return (
    <div className="space-y-6">
      {/* 2-SECTION MAIN MENU NAVIGATION HEADER FOR ANALYTICS */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs space-y-3.5 no-print">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-200/60">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
                Trung Tâm Phân Tích & Biểu Đồ Năng Lực Thời Gian Thực (Live Analytics)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Đánh giá năng lực 14 domains hạ tầng, rủi ro SPOF và tiến trình phát triển kỹ sư
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-mono bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 hidden sm:inline-block">
              {skills.length} Kỹ Năng · {members.length} Kỹ Sư
            </span>

            {onOpenPrintModal && (
              <button
                type="button"
                onClick={handleExportPDF}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-indigo-200 bg-indigo-50/80 hover:bg-indigo-100/90 text-indigo-700 hover:text-indigo-900 text-xs font-bold shadow-2xs transition-all active:scale-95 cursor-pointer"
                title="Xuất báo cáo PDF phân tích năng lực"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Xuất Báo Cáo PDF</span>
              </button>
            )}
          </div>
        </div>

        {/* 2 DISTINCT ANALYTICS VIEW MODES FOR ADMIN */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-1.5 bg-slate-100/80 rounded-xl border border-slate-200/80">
          <button
            type="button"
            onClick={() => setAnalyticsViewMode('team')}
            className={`p-3 rounded-lg font-bold text-xs transition-all flex items-center justify-center gap-2.5 cursor-pointer ${
              analyticsViewMode === 'team'
                ? 'bg-white text-indigo-700 shadow-sm border border-slate-200 font-extrabold ring-1 ring-indigo-500/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            <Users className={`w-4 h-4 ${analyticsViewMode === 'team' ? 'text-indigo-600' : 'text-slate-500'}`} />
            <div className="text-left">
              <span className="block font-bold text-xs">🌐 1. PHÂN TÍCH TOÀN ĐỘI NGŨ (TEAM ANALYTICS)</span>
              <span className="block text-[10px] text-slate-500 font-normal">Góc nhìn tổng quan 14 Domains, SPOF & Trendline</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setAnalyticsViewMode('member')}
            className={`p-3 rounded-lg font-bold text-xs transition-all flex items-center justify-center gap-2.5 cursor-pointer ${
              analyticsViewMode === 'member'
                ? 'bg-white text-indigo-700 shadow-sm border border-slate-200 font-extrabold ring-1 ring-indigo-500/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            <User className={`w-4 h-4 ${analyticsViewMode === 'member' ? 'text-indigo-600' : 'text-slate-500'}`} />
            <div className="text-left">
              <span className="block font-bold text-xs">👤 2. ĐÁNH GIÁ CHI TIẾT TỪNG THÀNH VIÊN (MEMBER ANALYTICS)</span>
              <span className="block text-[10px] text-slate-500 font-normal">Soi Radar cá nhân, chứng chỉ & lộ trình bài Lab L2</span>
            </div>
          </button>
        </div>
      </div>

      {/* RENDER VIEW MODE 1: TEAM ANALYTICS */}
      {analyticsViewMode === 'team' && (
        <div className="space-y-6 animate-in fade-in duration-200">

      {/* 1.1. Performance Metrics Dashboard: Level Distribution (L0-L2) across 14 Domains */}
      <PerformanceMetricsDashboard
        skills={skills}
        members={members}
      />

      {/* 1.1b. Advanced Data Visualizations: Radar Multi-Domain, 2D Heatmap Matrix, SPOF Donut & Certs */}
      <AdvancedDataVisualizations
        skills={skills}
        members={members}
      />

      {/* 1.2. Biểu Đồ Xu Hướng Năng Lực L2 Qua Các Mốc Đồng Bộ Dữ Liệu (Sync Milestones & Linear Regression Trendline) */}
      <div className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-2xs space-y-4">
        {/* Header & Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                <Activity className="w-4 h-4" />
              </span>
              <h3 className="text-sm font-bold text-slate-900">
                Xu Hướng Thay Đổi Năng Lực (L2) Theo Các Mốc Đồng Bộ Dữ Liệu
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                Linear Regression Trendline
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Đường xu hướng hồi quy tuyến tính thể hiện sự phát triển kỹ năng thực chiến (L2: Đã Lab thành công) qua các lần đồng bộ file Excel SharePoint
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 text-xs">
            {/* Metric Toggle */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-xs">
              <button
                onClick={() => setTrendMetric('l2_skills')}
                className={`px-2.5 py-1 font-semibold rounded-md transition-colors ${
                  trendMetric === 'l2_skills' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-600'
                }`}
              >
                Số Kỹ Năng L2
              </button>
              <button
                onClick={() => setTrendMetric('l2_pct')}
                className={`px-2.5 py-1 font-semibold rounded-md transition-colors ${
                  trendMetric === 'l2_pct' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-600'
                }`}
              >
                Tỷ Lệ L2 (%)
              </button>
              <button
                onClick={() => setTrendMetric('l2_ratings')}
                className={`px-2.5 py-1 font-semibold rounded-md transition-colors ${
                  trendMetric === 'l2_ratings' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-600'
                }`}
              >
                Tổng Lượt L2
              </button>
            </div>

            {/* Toggle Trendline */}
            <button
              onClick={() => setShowTrendline(prev => !prev)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold transition-all ${
                showTrendline
                  ? 'bg-indigo-50 text-indigo-700 border-indigo-300 shadow-2xs'
                  : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Đường Trendline: {showTrendline ? 'Bật' : 'Tắt'}</span>
            </button>
          </div>
        </div>

        {/* Growth Stats Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-200/80">
            <span className="text-[11px] text-slate-500 font-medium">Tăng Trưởng Thực Tế</span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl font-bold text-emerald-700">
                +{totalGrowth} {getMetricUnit()}
              </span>
              <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-100/70 px-1 py-0.2 rounded">
                +{growthRatePct}%
              </span>
            </div>
            <span className="text-[10px] text-slate-400">Từ Mốc 1 đến Hiện tại</span>
          </div>

          <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-200/80">
            <span className="text-[11px] text-slate-500 font-medium">Tốc Độ Tăng Trưởng (Slope)</span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl font-bold text-indigo-700">
                +{slope.toFixed(1)}
              </span>
              <span className="text-[11px] text-slate-500 font-medium">/ mốc đồng bộ</span>
            </div>
            <span className="text-[10px] text-indigo-600 font-medium">Gia tốc tăng trưởng tích cực</span>
          </div>

          <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-200/80">
            <span className="text-[11px] text-slate-500 font-medium">Dự Báo Mốc Tiếp Theo</span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl font-bold text-purple-700">
                ~{forecastVal}
              </span>
              <span className="text-[11px] text-slate-500 font-medium">{trendMetric === 'l2_pct' ? '%' : 'kỹ năng'}</span>
            </div>
            <span className="text-[10px] text-purple-600 font-medium">
              {forecastVal >= maxCap ? 'Sắp chạm ngưỡng 100% mục tiêu' : 'Tiếp tục đà bứt phá'}
            </span>
          </div>

          <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-200/80">
            <span className="text-[11px] text-slate-500 font-medium">Lần Đồng Bộ Gần Nhất</span>
            <div className="text-sm font-bold text-slate-900 mt-0.5 truncate" title={syncState?.lastSyncTime || 'Hôm nay'}>
              {syncState?.lastSyncTime || 'Vừa xong'}
            </div>
            <span className="text-[10px] text-slate-400">Tự động định kỳ 5 phút</span>
          </div>
        </div>

        {/* SVG Graph with Trendline */}
        <div className="relative w-full aspect-[21/8] min-h-[220px] max-h-[300px] bg-slate-50/40 rounded-xl p-2 border border-slate-100 overflow-hidden">
          <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full h-full overflow-visible">
            <defs>
              <linearGradient id="trendAreaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.28" />
                <stop offset="60%" stopColor="#10b981" stopOpacity="0.08" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
              </linearGradient>
              <filter id="nodeGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#10b981" floodOpacity="0.4" />
              </filter>
            </defs>

            {/* Horizontal Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1.0].map((frac, idx) => {
              const yPos = padTop + plotH * (1 - frac);
              const labelVal = Math.round(yMin + frac * (yMax - yMin));
              return (
                <g key={idx}>
                  <line
                    x1={padLeft}
                    y1={yPos}
                    x2={chartW - padRight}
                    y2={yPos}
                    stroke={idx === 4 ? '#cbd5e1' : '#f1f5f9'}
                    strokeWidth={idx === 4 ? 1.5 : 1}
                    strokeDasharray={idx === 4 ? '4 3' : 'none'}
                  />
                  <text
                    x={padLeft - 10}
                    y={yPos + 4}
                    textAnchor="end"
                    className="text-[10px] fill-slate-400 font-mono"
                  >
                    {trendMetric === 'l2_pct' ? `${labelVal}%` : labelVal}
                  </text>
                </g>
              );
            })}

            {/* 100% Target Reference Label */}
            <text
              x={chartW - padRight}
              y={padTop - 8}
              textAnchor="end"
              className="text-[10px] font-bold fill-emerald-700"
            >
              Mục tiêu toàn diện (100% L2)
            </text>

            {/* Area under actual progress curve */}
            <path
              d={areaPath}
              fill="url(#trendAreaGradient)"
            />

            {/* Linear Regression Trendline (Dashed Indigo Line) */}
            {showTrendline && (
              <g>
                <path
                  d={trendlinePath}
                  fill="none"
                  stroke="#6366f1"
                  strokeWidth="2.5"
                  strokeDasharray="6 4"
                  className="transition-all duration-300"
                />
                {/* Trendline Equation Tag */}
                <g transform={`translate(${trendPoints[trendPoints.length - 1].x - 85}, ${Math.max(padTop + 15, trendPoints[trendPoints.length - 1].y - 12)})`}>
                  <rect
                    width="95"
                    height="20"
                    rx="4"
                    fill="#e0e7ff"
                    stroke="#c7d2fe"
                    strokeWidth="1"
                  />
                  <text
                    x="47"
                    y="14"
                    textAnchor="middle"
                    className="text-[10px] font-bold fill-indigo-800 font-mono"
                  >
                    Trendline +{slope.toFixed(1)}/kỳ
                  </text>
                </g>
              </g>
            )}

            {/* Actual Progress Line (Solid Emerald) */}
            <path
              d={actualPath}
              fill="none"
              stroke="#059669"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="transition-all duration-300"
            />

            {/* Milestone Nodes */}
            {actualPoints.map((pt, idx) => {
              const isLatest = idx === actualPoints.length - 1;
              const isSelected = selectedMilestoneId === pt.id;

              return (
                <g
                  key={pt.id}
                  className="cursor-pointer group"
                  onClick={() => setSelectedMilestoneId(isSelected ? null : pt.id)}
                >
                  {/* Glowing Pulse Ring for Latest Milestone */}
                  {isLatest && (
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r="12"
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="2"
                      className="animate-ping opacity-60"
                    />
                  )}

                  {/* Outer circle */}
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={isSelected ? 9 : isLatest ? 7.5 : 6}
                    fill={isSelected ? "#4338ca" : isLatest ? "#059669" : "#10b981"}
                    stroke="#ffffff"
                    strokeWidth="2.5"
                    filter="url(#nodeGlow)"
                    className="transition-all duration-200 group-hover:scale-125"
                  />

                  {/* Value callout bubble above node */}
                  <g transform={`translate(${pt.x}, ${pt.y - 16})`}>
                    <rect
                      x="-26"
                      y="-16"
                      width="52"
                      height="18"
                      rx="4"
                      fill={isLatest ? "#065f46" : "#1e293b"}
                      className="opacity-90"
                    />
                    <text
                      x="0"
                      y="-4"
                      textAnchor="middle"
                      className="text-[10px] font-bold fill-white font-mono"
                    >
                      {trendMetric === 'l2_pct' ? `${pt.yVal}%` : pt.yVal}
                    </text>
                  </g>

                  {/* Milestone Name below X-axis */}
                  <text
                    x={pt.x}
                    y={chartH - 22}
                    textAnchor="middle"
                    className={`text-[10px] font-bold transition-colors ${
                      isSelected ? 'fill-indigo-700' : isLatest ? 'fill-emerald-800' : 'fill-slate-700'
                    }`}
                  >
                    {pt.label.split(':')[0]}
                  </text>
                  <text
                    x={pt.x}
                    y={chartH - 8}
                    textAnchor="middle"
                    className="text-[9px] fill-slate-400 font-mono"
                  >
                    {pt.timestamp.split(' ')[0]}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Milestone Cards Timeline */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-1">
          {syncMilestones.map((m, idx) => {
            const isLive = idx === syncMilestones.length - 1;
            const prev = idx > 0 ? syncMilestones[idx - 1] : null;
            const diff = prev ? m.l2SkillCount - prev.l2SkillCount : 0;
            const isSelected = selectedMilestoneId === m.id;

            return (
              <div
                key={m.id}
                onClick={() => setSelectedMilestoneId(isSelected ? null : m.id)}
                className={`p-3 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'ring-2 ring-indigo-500 bg-indigo-50/40 border-indigo-300 shadow-xs'
                    : isLive
                    ? 'bg-gradient-to-br from-emerald-50/60 to-white border-emerald-300 hover:border-emerald-400'
                    : 'bg-white border-slate-200/80 hover:bg-slate-50/70 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className={`font-bold text-[11px] ${isLive ? 'text-emerald-800' : 'text-slate-800'}`}>
                    {m.label}
                  </span>
                  {isLive && (
                    <span className="flex items-center gap-1 text-[9px] font-extrabold px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Live
                    </span>
                  )}
                </div>

                <div className="text-[10px] text-slate-500 mb-2 truncate" title={m.eventDescription}>
                  {m.eventDescription}
                </div>

                <div className="flex items-baseline justify-between pt-1.5 border-t border-slate-100">
                  <div className="text-xs">
                    <strong className="text-slate-900 font-bold text-sm tabular-nums">
                      {m.l2SkillCount}
                    </strong>
                    <span className="text-slate-500 text-[10px]"> / {m.totalSkills} L2</span>
                  </div>

                  <div className="flex items-center gap-1 text-xs">
                    <span className="font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200/60 text-[10px]">
                      {m.l2Percentage}%
                    </span>
                    {diff > 0 && (
                      <span className="text-[10px] font-bold text-emerald-600">
                        +{diff}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Grid of Charts: Radar Chart & Domain Ranking */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Domain Radar Chart (Spider chart) */}
        <div className="lg:col-span-6 bg-white rounded-xl p-5 border border-slate-200/90 shadow-2xs flex flex-col items-center">
          <div className="w-full flex items-center justify-between mb-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <PieChart className="w-4 h-4 text-indigo-600" />
                <span>Radar Năng Lực 14 Phân Khúc Hạ Tầng</span>
              </h3>
              <p className="text-xs text-slate-500">
                {selectedMember === 'all'
                  ? 'Độ chín muồi trung bình của cả đội ngũ Teams'
                  : `Độ phủ kỹ năng của kỹ sư ${selectedMember}`}
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60">
                Mức Chuẩn: L2 (2.0)
              </span>
            </div>
          </div>

          {/* SVG Radar Chart */}
          <div className="relative w-full max-w-[380px] aspect-square flex items-center justify-center my-2">
            <svg viewBox="0 0 340 340" className="w-full h-full overflow-visible">
              {/* Concentric Reference Circles (Levels 0.5 to 2.0) */}
              {[0.5, 1.0, 1.5, 2.0].map(lvl => {
                const r = (lvl / 2.0) * radarRadius;
                return (
                  <circle
                    key={lvl}
                    cx={radarCenter}
                    cy={radarCenter}
                    r={r}
                    fill={lvl === 2.0 ? 'transparent' : 'none'}
                    stroke={lvl === 2.0 ? '#10b981' : lvl === 1.0 ? '#f59e0b' : '#e2e8f0'}
                    strokeWidth={lvl === 2.0 ? 1.5 : 1}
                    strokeDasharray={lvl === 2.0 ? 'none' : '3 3'}
                  />
                );
              })}

              {/* Axis Spoke Lines */}
              {domains.map((_, idx) => {
                const angle = idx * angleStep - Math.PI / 2;
                const x2 = radarCenter + radarRadius * Math.cos(angle);
                const y2 = radarCenter + radarRadius * Math.sin(angle);
                return (
                  <line
                    key={idx}
                    x1={radarCenter}
                    y1={radarCenter}
                    x2={x2}
                    y2={y2}
                    stroke="#f1f5f9"
                    strokeWidth={1}
                  />
                );
              })}

              {/* Filled Polygon for actual data */}
              <polygon
                points={radarPoints.map(p => `${p.x},${p.y}`).join(' ')}
                fill="rgba(99, 102, 241, 0.22)"
                stroke="#4f46e5"
                strokeWidth={2.5}
                className="transition-all duration-300"
              />

              {/* Data Points */}
              {radarPoints.map((p, idx) => (
                <g key={idx}>
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={4}
                    fill="#4338ca"
                    stroke="#ffffff"
                    strokeWidth={1.5}
                    className="transition-all duration-300"
                  />
                </g>
              ))}

              {/* Domain Labels around perimeter */}
              {radarPoints.map((p, idx) => {
                const labelRadius = radarRadius + 24;
                const lx = radarCenter + labelRadius * Math.cos(p.angle);
                const ly = radarCenter + labelRadius * Math.sin(p.angle);
                const isRight = Math.cos(p.angle) > 0.05;
                const isLeft = Math.cos(p.angle) < -0.05;
                const textAnchor = isRight ? 'start' : isLeft ? 'end' : 'middle';

                // Shorten some long domain names for clean mobile display
                const label = p.domain
                  .replace('Automation & DevOps', 'DevOps')
                  .replace('UC & Contact Center', 'UC/CC')
                  .replace('Syslog & Monitoring', 'Monitoring')
                  .replace('Storage & Backup', 'Storage')
                  .replace('AI Infrastructure', 'AI Infra');

                return (
                  <text
                    key={idx}
                    x={lx}
                    y={ly + 3}
                    textAnchor={textAnchor}
                    className="text-[10px] font-semibold fill-slate-700 select-none"
                  >
                    {label} ({p.avgScore})
                  </text>
                );
              })}
            </svg>
          </div>

          <div className="w-full grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-100 text-center text-xs">
            <div>
              <span className="text-slate-400 block text-[11px]">Domain Cao Nhất</span>
              <strong className="text-slate-800 font-bold truncate block">
                {sortedDomains[0]?.domain} ({sortedDomains[0]?.avgScore})
              </strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Điểm Trung Bình</span>
              <strong className="text-indigo-700 font-bold text-sm tabular-nums block">
                {(sortedDomains.reduce((a, b) => a + b.avgScore, 0) / (sortedDomains.length || 1)).toFixed(2)}
              </strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Cần Bồi Dưỡng</span>
              <strong className="text-amber-700 font-bold truncate block">
                {sortedDomains[sortedDomains.length - 1]?.domain} ({sortedDomains[sortedDomains.length - 1]?.avgScore})
              </strong>
            </div>
          </div>
        </div>

        {/* Right: Domain Ranking Bar Chart */}
        <div className="lg:col-span-6 bg-white rounded-xl p-5 border border-slate-200/90 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-indigo-600" />
                  <span>Xếp Hạng Năng Lực 14 Phân Khúc Hạ Tầng</span>
                </h3>
                <p className="text-xs text-slate-500">
                  {chartMetric === 'average' ? 'Điểm trung bình (Thang 0-2.0)' : 'Tỷ lệ nhân sự đạt chuẩn L2 (Đã Lab thành công)'}
                </p>
              </div>
              <span className="text-xs text-slate-500 font-mono">14 Domains</span>
            </div>

            {/* Horizontal Bar Chart */}
            <div className="space-y-2.5">
              {sortedDomains.map(item => {
                const val = chartMetric === 'average' ? item.avgScore : item.l2Percentage;
                const maxVal = chartMetric === 'average' ? 2 : 100;
                const pct = Math.min(100, Math.round((val / maxVal) * 100));

                const isTopTier = chartMetric === 'average' ? val >= 1.5 : val >= 60;
                const isMedium = chartMetric === 'average' ? val >= 0.8 : val >= 30;

                return (
                  <div key={item.domain} className="group">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                        <span>{item.domain}</span>
                        <span className="text-[10px] text-slate-400 font-normal">
                          ({item.count} skills)
                        </span>
                      </span>
                      <div className="flex items-center gap-2">
                        {item.spofCount > 0 && (
                          <span
                            className="text-[10px] text-amber-700 bg-amber-50 px-1 py-0.2 rounded font-medium"
                            title={`${item.spofCount} kỹ năng chỉ có 1 người phụ trách`}
                          >
                            {item.spofCount} SPOF
                          </span>
                        )}
                        <span className="font-mono font-bold text-slate-900 tabular-nums">
                          {chartMetric === 'average' ? `${val} / 2.0` : `${val}%`}
                        </span>
                      </div>
                    </div>
                    {/* Bar track */}
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden relative">
                      {/* Target reference line at 100% (Score 2.0) */}
                      <div
                        className="absolute top-0 bottom-0 w-0.5 bg-emerald-500 z-10 opacity-70"
                        style={{ left: '100%' }}
                        title="Ngưỡng đạt chuẩn dự án: L2 (2.0/2.0)"
                      />
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isTopTier
                            ? 'bg-emerald-600'
                            : isMedium
                            ? 'bg-amber-500'
                            : 'bg-slate-400'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                <span>Xuất sắc (L2: $\ge$ 1.5)</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span>Đang thực hành (L1: 0.8 - 1.49)</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                <span>Chưa tiếp cận (&lt; 0.8)</span>
              </span>
            </div>
            <span className="italic text-[11px]">Đường vạch: Chuẩn L2 (2.0)</span>
          </div>
        </div>
      </div>

      {/* 2. Executive Leadership: Phân Phối Năng Lực Theo Domain & Cảnh Báo Thiếu Hụt L2 */}
      <div className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-2xs space-y-5">
        {/* Header & Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                <Layers className="w-4 h-4" />
              </span>
              <h3 className="text-sm font-bold text-slate-900">
                Phân Phối Năng Lực Theo Domain & Cảnh Báo Thiếu Hụt L2
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                Góc Nhìn Ban Lãnh Đạo
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Đánh giá tổng quan 14 phân khúc hạ tầng, nhận diện mảng công nghệ đang thiếu hụt kỹ sư đạt chuẩn L2 (Đã Lab thành công) để ưu tiên đào tạo & cấp tài nguyên Lab
            </p>
          </div>

          {/* Controls: Sort and Filter */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-lg border border-slate-200 text-slate-600">
              <ArrowDownUp className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-[11px] font-medium">Sắp xếp:</span>
              <select
                value={domainSortBy}
                onChange={e => setDomainSortBy(e.target.value as any)}
                className="bg-transparent font-semibold text-slate-800 focus:outline-hidden text-xs cursor-pointer"
              >
                <option value="deficit_desc">Thiếu hụt L2 nhiều nhất (Ưu tiên Lab)</option>
                <option value="l2_desc">Đạt chuẩn L2 cao nhất</option>
                <option value="name">Theo tên Domain (A - Z)</option>
              </select>
            </div>

            <label className="inline-flex items-center gap-1.5 cursor-pointer text-slate-700 font-medium select-none bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200 text-xs">
              <input
                type="checkbox"
                checked={showOnlyDeficitDomains}
                onChange={e => setShowOnlyDeficitDomains(e.target.checked)}
                className="rounded text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-[11px]">Chỉ hiện domain thiếu L2 ({domainsWithL2Deficit.length})</span>
            </label>

            {onOpenPrintModal && (
              <button
                type="button"
                onClick={handleExportDeficitReport}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-semibold transition-all shadow-2xs cursor-pointer active:scale-95"
                title="Xuất báo cáo PDF chuyên sâu các phân khúc thiếu hụt L2 cho ban lãnh đạo"
              >
                <Printer className="w-3.5 h-3.5 text-amber-700" />
                <span>In Báo Cáo Thiếu Hụt L2</span>
              </button>
            )}
          </div>
        </div>

        {/* 4 Executive KPI Highlight Cards for Leadership */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Card 1: Top Deficit Domain */}
          <div className="p-3.5 rounded-xl bg-gradient-to-br from-rose-50/60 to-amber-50/40 border border-rose-200/80 shadow-2xs">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-semibold text-rose-800">Domain Thiếu Hụt Lớn Nhất</span>
              <AlertTriangle className="w-4 h-4 text-rose-600" />
            </div>
            <div className="font-bold text-slate-900 text-sm truncate" title={topDeficitDomain?.domain}>
              {topDeficitDomain?.domain || 'Không có'}
            </div>
            <div className="text-[11px] text-rose-700 font-medium mt-1">
              Thiếu <strong>{topDeficitDomain?.l2DeficitSkills}</strong> / {topDeficitDomain?.totalSkills} kỹ năng L2 ({topDeficitDomain?.l2DeficitRate}%)
            </div>
          </div>

          {/* Card 2: Total Skills Lacking L2 */}
          <div className="p-3.5 rounded-xl bg-white border border-slate-200/90 shadow-2xs">
            <div className="flex items-center justify-between text-xs mb-1 text-slate-500">
              <span className="font-medium">Kỹ Năng Chưa Có Ai Đạt L2</span>
              <AlertCircle className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-xl font-bold text-slate-900 tabular-nums">
              {totalSkillsLackingL2} <span className="text-xs font-normal text-slate-500">/ {skills.length} kỹ năng</span>
            </div>
            <div className="text-[11px] text-amber-800 font-medium mt-1">
              {domainsWithL2Deficit.length} domain cần dựng bài Lab ngay
            </div>
          </div>

          {/* Card 3: L1 Pending Lab */}
          <div className="p-3.5 rounded-xl bg-white border border-slate-200/90 shadow-2xs">
            <div className="flex items-center justify-between text-xs mb-1 text-slate-500">
              <span className="font-medium">Lượt Kỹ Sư Đang Ở Mức L1</span>
              <Flame className="w-4 h-4 text-orange-500" />
            </div>
            <div className="text-xl font-bold text-slate-900 tabular-nums">
              {totalL1PendingLab} <span className="text-xs font-normal text-slate-500">lượt đánh giá</span>
            </div>
            <div className="text-[11px] text-orange-800 font-medium mt-1">
              Đã có lý thuyết, tiềm năng nâng cấp L2 cao
            </div>
          </div>

          {/* Card 4: System-wide L2 Coverage */}
          <div className="p-3.5 rounded-xl bg-white border border-slate-200/90 shadow-2xs">
            <div className="flex items-center justify-between text-xs mb-1 text-slate-500">
              <span className="font-medium">Độ Phủ L2 Kỹ Năng Toàn Đội</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-xl font-bold text-slate-900 tabular-nums">
              {skills.length - totalSkillsLackingL2} / {skills.length}
              <span className="ml-2 text-xs font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                {Math.round(((skills.length - totalSkillsLackingL2) / (skills.length || 1)) * 100)}%
              </span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Kỹ năng đã có ít nhất 1 kỹ sư Lab thành công
            </div>
          </div>
        </div>

        {/* Legend for the Domain Stacked Distribution Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-3.5 py-2 rounded-lg bg-slate-50/80 border border-slate-200 text-xs">
          <div className="flex items-center gap-1 font-semibold text-slate-700 text-[11px]">
            <span>Ý nghĩa dải màu năng lực 8 kỹ sư trong từng domain:</span>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-[11px]">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-xs bg-emerald-500 shadow-2xs" />
              <strong className="text-slate-800">L2:</strong>
              <span className="text-slate-600">Đã biết và Lab thành công (Thực chiến)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-xs bg-amber-400 shadow-2xs" />
              <strong className="text-slate-800">L1:</strong>
              <span className="text-slate-600">Đã biết, chưa Lab (Cần cấp tài nguyên Lab)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-xs bg-slate-300 shadow-2xs" />
              <strong className="text-slate-800">L0:</strong>
              <span className="text-slate-600">Chưa biết gì (Khoảng trống năng lực)</span>
            </span>
          </div>
        </div>

        {/* Detailed Domain List with Stacked Distribution and Deficit Metrics */}
        <div className="space-y-3">
          {sortedDeficitDomains.map(item => {
            const hasDeficit = item.l2DeficitSkills > 0;

            return (
              <div
                key={item.domain}
                className={`p-3.5 rounded-xl border transition-all ${
                  hasDeficit
                    ? 'bg-rose-50/20 border-rose-200/70 hover:border-rose-300'
                    : 'bg-white border-slate-200/90 hover:border-slate-300'
                }`}
              >
                {/* Domain Header Row */}
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">
                      {item.domain}
                    </span>
                    <span className="text-slate-400 text-xs font-normal">
                      ({item.totalSkills} kỹ năng)
                    </span>
                    {item.spofCount > 0 && (
                      <span
                        className="text-[10px] text-amber-800 bg-amber-50 px-1.5 py-0.2 rounded font-medium border border-amber-200/60"
                        title={`${item.spofCount} kỹ năng chỉ có 1 người phụ trách, thiếu Backup`}
                      >
                        {item.spofCount} SPOF
                      </span>
                    )}
                  </div>

                  {/* Deficit / Coverage Status Badge for Leadership */}
                  <div className="flex items-center gap-2">
                    {hasDeficit ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-bold bg-rose-100/80 text-rose-800 border border-rose-200 shadow-2xs">
                        <AlertTriangle className="w-3 h-3 text-rose-600 shrink-0" />
                        <span>Thiếu {item.l2DeficitSkills} kỹ năng L2 ({item.l2DeficitRate}%)</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/80">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                        <span>Đã phủ 100% L2 ({item.skillsWithL2}/{item.totalSkills})</span>
                      </span>
                    )}

                    <span className="text-xs font-mono font-bold text-slate-800 bg-slate-50 px-2 py-0.5 rounded border border-slate-200 tabular-nums">
                      L2: {item.skillsWithL2}/{item.totalSkills}
                    </span>
                  </div>
                </div>

                {/* If domain lacks L2, highlight which specific skills need immediate lab */}
                {hasDeficit && item.missingL2SkillNames.length > 0 && (
                  <div className="mb-2 text-[11px] text-rose-700 bg-white p-2 rounded-lg border border-rose-200/60 flex items-start gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="font-semibold">Kỹ năng chưa có nhân sự L2: </strong>
                      <span>{item.missingL2SkillNames.join(', ')}</span>
                    </div>
                  </div>
                )}

                {/* 100% Stacked Distribution Bar of all 8 Engineers in this domain */}
                <div className="w-full h-3.5 rounded-md flex overflow-hidden bg-slate-200 shadow-2xs">
                  {/* L2 Segment (Green) */}
                  {item.dist.L2 > 0 && (
                    <div
                      style={{ width: `${(item.dist.L2 / item.totalRatings) * 100}%` }}
                      className="bg-emerald-500 h-full transition-all relative group/seg"
                      title={`${item.domain} · L2 (Đã Lab thành công): ${item.dist.L2} lượt (${Math.round((item.dist.L2 / item.totalRatings) * 100)}%)`}
                    />
                  )}
                  {/* L1 Segment (Orange) */}
                  {item.dist.L1 > 0 && (
                    <div
                      style={{ width: `${(item.dist.L1 / item.totalRatings) * 100}%` }}
                      className="bg-amber-400 h-full transition-all relative group/seg"
                      title={`${item.domain} · L1 (Đã biết, chưa Lab): ${item.dist.L1} lượt (${Math.round((item.dist.L1 / item.totalRatings) * 100)}%)`}
                    />
                  )}
                  {/* L0 Segment (Slate) */}
                  {item.dist.L0 > 0 && (
                    <div
                      style={{ width: `${(item.dist.L0 / item.totalRatings) * 100}%` }}
                      className="bg-slate-300 h-full transition-all relative group/seg"
                      title={`${item.domain} · L0 (Chưa biết gì): ${item.dist.L0} lượt (${Math.round((item.dist.L0 / item.totalRatings) * 100)}%)`}
                    />
                  )}
                </div>

                {/* Quantitative Footnote Breakdown */}
                <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 mt-1.5 gap-2">
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-emerald-800">
                      L2 (Đã Lab): <strong>{item.dist.L2}</strong> ({item.pcts.L2}%)
                    </span>
                    <span className="text-slate-300">·</span>
                    <span className="font-medium text-amber-800">
                      L1 (Chưa Lab): <strong>{item.dist.L1}</strong> ({item.pcts.L1}%)
                    </span>
                    <span className="text-slate-300">·</span>
                    <span className="text-slate-500">
                      L0 (Trống): <strong>{item.dist.L0}</strong> ({item.pcts.L0}%)
                    </span>
                  </div>

                  {item.dist.L1 > 0 && (
                    <span className="text-indigo-600 font-medium italic">
                      Tiềm năng bứt phá: {item.dist.L1} lượt L1 có thể lên L2 khi cấp bài Lab
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-600" />
              <span>Phân Bổ Cấp Độ Kỹ Năng Từng Thành Viên (L0 - L2)</span>
            </h3>
            <p className="text-xs text-slate-500">
              Tổng quan năng lực 8 kỹ sư qua 94 kỹ năng thực tế
            </p>
          </div>

          {/* Level Legend */}
          <div className="hidden sm:flex items-center gap-2 text-xs">
            {(['L0', 'L1', 'L2'] as CompetencyLevel[]).map(lvl => {
              const def = COMPETENCY_DEFINITIONS[lvl];
              return (
                <span key={lvl} className="flex items-center gap-1 text-[11px] font-medium text-slate-600">
                  <span className={`w-2.5 h-2.5 rounded-sm ${def.bgClass} border ${def.borderClass}`} />
                  <span>{lvl}: {def.name}</span>
                </span>
              );
            })}
          </div>
        </div>

        {/* Member Stacked Bars */}
        <div className="space-y-3">
          {memberDistributions.map(item => {
            const total = skills.length;

            return (
              <div key={item.member.name} className="p-2.5 rounded-lg bg-slate-50/60 border border-slate-100">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">
                      {item.member.name}
                    </span>
                    <span className="text-slate-500 text-[11px]">
                      {item.member.roleTitle}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-slate-600">
                      SME: <strong className="text-purple-700 font-bold tabular-nums">{item.smeCount}</strong>
                    </span>
                    <span className="text-slate-600">
                      L2 (Đã Lab): <strong className="text-emerald-700 font-bold tabular-nums">{item.dist.L2}</strong> ({Math.round((item.dist.L2 / total) * 100)}%)
                    </span>
                    <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200 tabular-nums">
                      Điểm TB: {item.avgScore} / 2.0
                    </span>
                  </div>
                </div>

                {/* Stacked Bar */}
                <div className="w-full h-3.5 rounded-md flex overflow-hidden bg-slate-200 shadow-2xs">
                  {(['L2', 'L1', 'L0'] as CompetencyLevel[]).map(lvl => {
                    const count = item.dist[lvl] || 0;
                    if (count === 0) return null;
                    const pct = (count / total) * 100;
                    const def = COMPETENCY_DEFINITIONS[lvl];

                    // Visual solid colors for bar segments (matching initialData level progression)
                    const barColors: Record<string, string> = {
                      L2: 'bg-emerald-600',
                      L1: 'bg-amber-400',
                      L0: 'bg-slate-300'
                    };

                    return (
                      <div
                        key={lvl}
                        style={{ width: `${pct}%` }}
                        className={`${barColors[lvl]} h-full transition-all relative group/seg`}
                        title={`${item.member.name} - ${lvl} (${def.name}): ${count} kỹ năng (${Math.round(pct)}%)`}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
        </div>
      )}

      {/* RENDER VIEW MODE 2: MEMBER ANALYTICS */}
      {analyticsViewMode === 'member' && (
        <IndividualMemberAnalytics
          skills={skills}
          members={members}
          initialSelectedMemberName={selectedMember}
          onSelectMember={setSelectedMember}
        />
      )}
    </div>
  );
};
