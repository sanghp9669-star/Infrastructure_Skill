import React, { useMemo } from 'react';
import { SkillItem, TeamMember } from '../types/skills';
import { COMPETENCY_DEFINITIONS } from '../data/initialData';
import { 
  CheckCircle2, 
  ShieldAlert, 
  GraduationCap,
  Target,
  ArrowRight
} from 'lucide-react';

interface StatsOverviewProps {
  skills: SkillItem[];
  members: TeamMember[];
  onFilterClick?: (type: 'spof' | 'ready' | 'all') => void;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({ skills, members, onFilterClick }) => {
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

  const readyPercentage = totalSkills > 0 ? Math.round((readySkills / totalSkills) * 100) : 0;
  const coveragePercentage = totalSkills > 0 ? Math.round((fullyCovered / totalSkills) * 100) : 0;

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
                    Tỉ Lệ Bao Phủ (Coverage) Trung Bình Của 14 Domain
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
    </div>
  );
};
