import React from 'react';
import { CompetencyLevel, PrintReportConfig, SkillItem, TeamMember } from '../types/skills';
import { COMPETENCY_DEFINITIONS } from '../data/initialData';

export const createDefaultPrintConfig = (members: TeamMember[], domains: string[]): PrintReportConfig => ({
  departmentTitle: 'BÁO CÁO MA TRẬN KỸ NĂNG ĐỘI NGŨ HẠ TẦNG (SKILL MATRIX)',
  reportSubtitle: 'Viendat Information Technology & Systems Integration Services',
  notes: '',
  selectedDomains: [...domains],
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
    showL2Rate: false,
  },
  showKpis: true,
  showCompetencyLegend: true,
  showSignatures: true,
  filterMode: 'all',
});

interface PrintReportViewProps {
  skills: SkillItem[];
  members: TeamMember[];
  config?: PrintReportConfig;
  isInlinePreview?: boolean;
}

export const PrintReportView: React.FC<PrintReportViewProps> = ({
  skills,
  members,
  config,
  isInlinePreview = false
}) => {
  // Available domains in current skill set
  const allDomains = Array.from(new Set(skills.map(s => s.domain))).sort();
  const effectiveConfig = config || createDefaultPrintConfig(members, allDomains);

  const currentDate = new Date().toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // 1. Filter skills based on selected domains
  let reportSkills = skills;
  if (effectiveConfig.selectedDomains && effectiveConfig.selectedDomains.length > 0) {
    const domainSet = new Set(effectiveConfig.selectedDomains);
    reportSkills = reportSkills.filter(s => domainSet.has(s.domain));
  }

  // 2. Filter skills based on specialized criteria
  if (effectiveConfig.filterMode === 'spof_only') {
    reportSkills = reportSkills.filter(s => (s.sme || s.owner) && !s.backup);
  } else if (effectiveConfig.filterMode === 'no_coverage_only') {
    reportSkills = reportSkills.filter(s => !s.sme && !s.backup);
  } else if (effectiveConfig.filterMode === 'ready_only') {
    reportSkills = reportSkills.filter(s =>
      members.some(m => (COMPETENCY_DEFINITIONS[s.ratings[m.name] || 'L0']?.score || 0) >= 2)
    );
  } else if (effectiveConfig.filterMode === 'deficit_only') {
    reportSkills = reportSkills.filter(s =>
      !members.some(m => (COMPETENCY_DEFINITIONS[s.ratings[m.name] || 'L0']?.score || 0) >= 2)
    );
  }

  // Determine active members for columns and calculations
  const activeMemberNames = new Set(effectiveConfig.visibleColumns.members || members.map(m => m.name));
  const activeMembers = members.filter(m => activeMemberNames.has(m.name));

  // Dynamic KPI computations for the filtered report scope
  const totalSkills = reportSkills.length;
  const readySkills = reportSkills.filter(s =>
    activeMembers.some(m => (COMPETENCY_DEFINITIONS[s.ratings[m.name] || 'L0']?.score || 0) >= 2)
  ).length;

  const spofSkills = reportSkills.filter(s => (s.sme || s.owner) && !s.backup);
  const coveredSkills = reportSkills.filter(s => s.sme && s.backup);
  const unassignedSkills = reportSkills.filter(s => !s.sme && !s.backup);

  const selectedDomainCount = effectiveConfig.selectedDomains?.length || allDomains.length;
  const isCustomDomainSet = selectedDomainCount < allDomains.length;

  // Filter mode description
  const getFilterBadge = () => {
    switch (effectiveConfig.filterMode) {
      case 'spof_only':
        return 'Chuyên Đề: Rủi Ro SPOF (Thiếu Backup)';
      case 'no_coverage_only':
        return 'Chuyên Đề: Kỹ Năng Trống Phụ Trách';
      case 'ready_only':
        return 'Chuyên Đề: Đã Sẵn Sàng Triển Khai Thực Chiến (L2)';
      case 'deficit_only':
        return 'Chuyên Đề: Cần Bổ Sung Đào Tạo & Bài Lab';
      default:
        return null;
    }
  };

  const filterBadge = getFilterBadge();

  return (
    <div
      className={
        isInlinePreview
          ? 'p-6 text-black bg-white rounded-lg shadow-sm border border-slate-200 font-sans'
          : 'print-only p-8 text-black bg-white font-sans'
      }
    >
      {/* Document Header */}
      <div className="border-b-2 border-slate-900 pb-4 mb-5 flex flex-wrap justify-between items-end gap-4">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider bg-slate-900 text-white rounded">
              Báo Cáo Kỹ Thuật
            </span>
            {isCustomDomainSet && (
              <span className="px-2 py-0.5 text-[10px] font-bold bg-indigo-50 text-indigo-800 border border-indigo-200 rounded">
                Báo Cáo Phân Khúc ({selectedDomainCount} / {allDomains.length} Domain)
              </span>
            )}
            {filterBadge && (
              <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-50 text-amber-900 border border-amber-200 rounded">
                {filterBadge}
              </span>
            )}
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 leading-snug">
            {effectiveConfig.departmentTitle || 'BÁO CÁO MA TRẬN KỸ NĂNG ĐỘI NGŨ HẠ TẦNG (SKILL MATRIX)'}
          </h1>
          <p className="text-xs text-slate-600 mt-1 font-medium">
            {effectiveConfig.reportSubtitle || 'Viendat Information Technology & Systems Integration Services'}
          </p>
        </div>
        <div className="text-right text-xs text-slate-600 shrink-0">
          <div>Ngày xuất báo cáo: <strong>{currentDate}</strong></div>
          <div className="mt-0.5">
            Quy mô đánh giá: <strong>{totalSkills} kỹ năng · {activeMembers.length} kỹ sư</strong>
          </div>
          {isCustomDomainSet && (
            <div className="text-[10px] text-slate-500 mt-0.5 truncate max-w-xs" title={effectiveConfig.selectedDomains.join(', ')}>
              Domain: {effectiveConfig.selectedDomains.slice(0, 3).join(', ')}
              {effectiveConfig.selectedDomains.length > 3 && ` +${effectiveConfig.selectedDomains.length - 3} khác`}
            </div>
          )}
        </div>
      </div>

      {/* Optional Department Notes / Directives */}
      {effectiveConfig.notes && effectiveConfig.notes.trim() && (
        <div className="mb-5 p-3 rounded-lg bg-slate-50 border border-slate-300 text-xs text-slate-800">
          <strong className="font-bold text-slate-900 block mb-1">Mục đích & Chỉ đạo báo cáo:</strong>
          <p className="leading-relaxed whitespace-pre-line">{effectiveConfig.notes}</p>
        </div>
      )}

      {/* Executive KPIs */}
      {effectiveConfig.showKpis && (
        <div className="grid grid-cols-4 gap-3 mb-5 p-3.5 bg-slate-50 border border-slate-300 rounded-lg text-center print-break-inside-avoid">
          <div className="p-1">
            <span className="text-[10px] text-slate-500 uppercase font-semibold block">Tổng Kỹ Năng Báo Cáo</span>
            <div className="text-2xl font-bold text-slate-900">{totalSkills}</div>
            <span className="text-[10px] text-slate-500">
              {selectedDomainCount} Phân khúc ({activeMembers.length} nhân sự)
            </span>
          </div>
          <div className="p-1">
            <span className="text-[10px] text-slate-500 uppercase font-semibold block">Sẵn Sàng Triển Khai</span>
            <div className="text-2xl font-bold text-emerald-800">
              {readySkills} ({totalSkills > 0 ? Math.round((readySkills / totalSkills) * 100) : 0}%)
            </div>
            <span className="text-[10px] text-slate-500">Đạt chuẩn L2 (Lab thành công)</span>
          </div>
          <div className="p-1">
            <span className="text-[10px] text-slate-500 uppercase font-semibold block">Độ Phủ An Toàn</span>
            <div className="text-2xl font-bold text-slate-900">
              {coveredSkills.length} ({totalSkills > 0 ? Math.round((coveredSkills.length / totalSkills) * 100) : 0}%)
            </div>
            <span className="text-[10px] text-slate-500">Đủ Chuyên gia SME & Backup</span>
          </div>
          <div className="p-1">
            <span className="text-[10px] text-slate-500 uppercase font-semibold block">Rủi Ro SPOF (Thiếu Backup)</span>
            <div className="text-2xl font-bold text-amber-800">
              {spofSkills.length} ({totalSkills > 0 ? Math.round((spofSkills.length / totalSkills) * 100) : 0}%)
            </div>
            <span className="text-[10px] text-slate-500">
              {unassignedSkills.length > 0 ? `+ ${unassignedSkills.length} trống cả SME & Backup` : 'Chỉ 1 người phụ trách'}
            </span>
          </div>
        </div>
      )}

      {/* Competency Standard Legend */}
      {effectiveConfig.showCompetencyLegend && (
        <div className="mb-4 text-[10px] flex flex-wrap items-center gap-3 p-2 border border-slate-200 bg-slate-50 print-break-inside-avoid">
          <strong className="font-bold text-slate-900">Quy chuẩn đánh giá năng lực thực hành Lab (L0 - L2):</strong>
          <span className="inline-flex items-center gap-1">
            <strong className="text-slate-700 font-bold">L0:</strong>
            <span className="text-slate-600">Chưa biết gì (0đ)</span>
          </span>
          <span>·</span>
          <span className="inline-flex items-center gap-1">
            <strong className="text-orange-800 font-bold">L1:</strong>
            <span className="text-slate-600">Đã biết nhưng lab chưa thành công hoặc chưa lab (1đ)</span>
          </span>
          <span>·</span>
          <span className="inline-flex items-center gap-1">
            <strong className="text-emerald-800 font-bold">L2:</strong>
            <span className="text-slate-600">Đã biết và Lab thành công (2đ)</span>
          </span>
        </div>
      )}

      {/* Full Matrix Table for Printing */}
      <table className="w-full text-left border-collapse text-[10px] border border-slate-400">
        <thead>
          <tr className="bg-slate-200 border-b border-slate-400 font-bold text-slate-900">
            {effectiveConfig.visibleColumns.showIndex && (
              <th className="p-1.5 border-r border-slate-300 text-center w-8">#</th>
            )}
            {effectiveConfig.visibleColumns.showDomain && (
              <th className="p-1.5 border-r border-slate-300 w-28">Nhóm Kỹ Năng</th>
            )}
            {effectiveConfig.visibleColumns.showSkill && (
              <th className="p-1.5 border-r border-slate-300 min-w-[140px]">Tên Kỹ Năng</th>
            )}

            {/* Selected Members */}
            {activeMembers.map(m => (
              <th key={m.name} className="p-1.5 border-r border-slate-300 text-center w-12 font-bold">
                {m.name}
              </th>
            ))}

            {/* Role & Responsibility Columns */}
            {effectiveConfig.visibleColumns.showOwner && (
              <th className="p-1.5 border-r border-slate-300 w-16 text-center">Phụ Trách</th>
            )}
            {effectiveConfig.visibleColumns.showBackup && (
              <th className="p-1.5 border-r border-slate-300 w-16 text-center">Dự Phòng</th>
            )}
            {effectiveConfig.visibleColumns.showSme && (
              <th className="p-1.5 border-r border-slate-300 w-16 text-center">Chuyên Gia</th>
            )}

            {/* Optional Evidence Column */}
            {effectiveConfig.visibleColumns.showEvidence && (
              <th className="p-1.5 border-r border-slate-300 min-w-[100px]">Minh Chứng / Lab Cert</th>
            )}

            {/* Metrics */}
            {effectiveConfig.visibleColumns.showAvgScore && (
              <th className="p-1.5 border-r border-slate-300 text-center w-12">Đ.TB</th>
            )}
            {effectiveConfig.visibleColumns.showL2Rate && (
              <th className="p-1.5 text-center w-14">Tỷ Lệ L2</th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-300">
          {reportSkills.length === 0 ? (
            <tr>
              <td
                colSpan={20}
                className="p-6 text-center text-slate-500 italic bg-white"
              >
                Không có kỹ năng nào phù hợp với tiêu chí lọc domain hoặc phòng ban đã chọn.
              </td>
            </tr>
          ) : (
            reportSkills.map((s, idx) => {
              const scores = activeMembers.map(m => COMPETENCY_DEFINITIONS[s.ratings[m.name] || 'L0']?.score || 0);
              const avg = activeMembers.length > 0
                ? (scores.reduce((a, b) => a + b, 0) / activeMembers.length).toFixed(1)
                : '0.0';
              const l2Count = scores.filter(sc => sc >= 2).length;
              const l2Pct = activeMembers.length > 0
                ? Math.round((l2Count / activeMembers.length) * 100)
                : 0;

              return (
                <tr key={s.id} className={idx % 2 === 1 ? 'bg-slate-50/70' : 'bg-white'}>
                  {effectiveConfig.visibleColumns.showIndex && (
                    <td className="p-1 border-r border-slate-300 text-center text-slate-500 font-mono">
                      {idx + 1}
                    </td>
                  )}
                  {effectiveConfig.visibleColumns.showDomain && (
                    <td className="p-1 border-r border-slate-300 font-medium text-slate-700 whitespace-nowrap">
                      {s.domain}
                    </td>
                  )}
                  {effectiveConfig.visibleColumns.showSkill && (
                    <td className="p-1 border-r border-slate-300 font-semibold text-slate-900">
                      {s.skill}
                    </td>
                  )}

                  {/* Member ratings */}
                  {activeMembers.map(m => {
                    const lvl = s.ratings[m.name] || 'L0';
                    const isL2 = lvl === 'L2';
                    const isL1 = lvl === 'L1';

                    return (
                      <td
                        key={m.name}
                        className={`p-1 border-r border-slate-300 text-center font-bold ${
                          isL2
                            ? 'bg-emerald-50 text-emerald-900 font-black'
                            : isL1
                            ? 'bg-orange-50 text-orange-900'
                            : 'text-slate-400'
                        }`}
                      >
                        {lvl}
                      </td>
                    );
                  })}

                  {/* Roles */}
                  {effectiveConfig.visibleColumns.showOwner && (
                    <td className="p-1 border-r border-slate-300 text-center font-medium">
                      {s.owner || '-'}
                    </td>
                  )}
                  {effectiveConfig.visibleColumns.showBackup && (
                    <td className="p-1 border-r border-slate-300 text-center font-semibold">
                      {s.backup ? (
                        s.backup
                      ) : (
                        <span className="text-amber-800 font-bold">Thiếu</span>
                      )}
                    </td>
                  )}
                  {effectiveConfig.visibleColumns.showSme && (
                    <td className="p-1 border-r border-slate-300 text-center">
                      {s.sme || '-'}
                    </td>
                  )}

                  {/* Evidence */}
                  {effectiveConfig.visibleColumns.showEvidence && (
                    <td className="p-1 border-r border-slate-300 text-slate-600 truncate max-w-[150px]">
                      {s.evidence || '-'}
                    </td>
                  )}

                  {/* Metrics */}
                  {effectiveConfig.visibleColumns.showAvgScore && (
                    <td className={`p-1 text-center font-mono font-bold ${effectiveConfig.visibleColumns.showL2Rate ? 'border-r border-slate-300' : ''}`}>
                      {avg}
                    </td>
                  )}
                  {effectiveConfig.visibleColumns.showL2Rate && (
                    <td className="p-1 text-center font-mono font-semibold text-emerald-800">
                      {l2Pct}%
                    </td>
                  )}
                </tr>
              );
            })
          )}
        </tbody>
      </table>

      {/* Signature & Sign-off footer */}
      {effectiveConfig.showSignatures && (
        <div className="mt-8 pt-6 border-t border-slate-400 grid grid-cols-3 text-center text-xs print-break-inside-avoid">
          <div>
            <div className="font-bold text-slate-900">Người Lập Báo Cáo</div>
            <div className="text-[11px] text-slate-500 mt-1">(Ký và ghi rõ họ tên)</div>
            <div className="h-14" />
          </div>
          <div>
            <div className="font-bold text-slate-900">Trưởng Nhóm Kỹ Thuật (Tech Lead)</div>
            <div className="text-[11px] text-slate-500 mt-1">(Ký và ghi rõ họ tên)</div>
            <div className="h-14" />
          </div>
          <div>
            <div className="font-bold text-slate-900">Giám Đốc Khối Công Nghệ</div>
            <div className="text-[11px] text-slate-500 mt-1">(Ký và ghi rõ họ tên)</div>
            <div className="h-14" />
          </div>
        </div>
      )}
    </div>
  );
};
