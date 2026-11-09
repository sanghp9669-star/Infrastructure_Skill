import React, { useState } from 'react';
import { CompetencyLevel, PrintReportConfig, SkillItem, TeamMember } from '../types/skills';
import { COMPETENCY_DEFINITIONS } from '../data/initialData';
import { 
  TrendingUp, 
  Users,
  Printer,
  User
} from 'lucide-react';
import { SyncState } from './SyncSettingsModal';
import { PerformanceMetricsDashboard } from './PerformanceMetricsDashboard';
import { AdvancedDataVisualizations } from './AdvancedDataVisualizations';
import { IndividualMemberAnalytics } from './IndividualMemberAnalytics';

interface RealtimeChartsProps {
  skills: SkillItem[];
  members: TeamMember[];
  syncState?: SyncState | null;
  onOpenPrintModal?: (customPresetConfig?: Partial<PrintReportConfig>) => void;
}

export const RealtimeCharts: React.FC<RealtimeChartsProps> = ({ skills, members, syncState, onOpenPrintModal }) => {
  const [analyticsViewMode, setAnalyticsViewMode] = useState<'team' | 'member'>('team');
  const [selectedMember, setSelectedMember] = useState<string>('all');

  // Overall Team Average Score
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
        notes: `Báo cáo phân tích năng lực đội ngũ hạ tầng từ dữ liệu ma trận thực tế. Điểm trung bình toàn đội: ${teamAverageScore}/2.0.`,
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
