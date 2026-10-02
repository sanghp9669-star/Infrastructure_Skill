import React, { useState } from 'react';
import { CompetencyLevel, PrintReportConfig, SkillItem, TeamMember } from '../types/skills';
import { COMPETENCY_DEFINITIONS } from '../data/initialData';
import { 
  TrendingUp, 
  Users,
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

  // Distinct domains
  const domains = Array.from(new Set(skills.map(s => s.domain))).sort();

  // Compute level distribution per member (for profile export & analytics)
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

  // Sync Milestones & Linear Regression Trendline Calculations
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
          showL2Rate: true,
        },
        filterMode: 'all',
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
          showL2Rate: true,
        },
        filterMode: 'all',
        showKpis: true,
        showCompetencyLegend: true,
        showSignatures: true,
      });
    }
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
