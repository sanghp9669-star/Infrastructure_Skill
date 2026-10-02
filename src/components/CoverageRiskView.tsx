import React, { useState } from 'react';
import { CompetencyLevel, SkillItem, TeamMember } from '../types/skills';
import { COMPETENCY_DEFINITIONS } from '../data/initialData';
import { ShieldAlert, AlertTriangle, CheckCircle, ArrowRight, UserPlus, Filter, Printer } from 'lucide-react';

interface CoverageRiskViewProps {
  skills: SkillItem[];
  members: TeamMember[];
  onAssignBackup: (skillId: number, memberName: string) => void;
  onAssignSME: (skillId: number, memberName: string) => void;
  onOpenPrintModal?: () => void;
}

export const CoverageRiskView: React.FC<CoverageRiskViewProps> = ({
  skills,
  members,
  onAssignBackup,
  onAssignSME,
  onOpenPrintModal
}) => {
  const [riskFilter, setRiskFilter] = useState<'all' | 'spof' | 'no_sme' | 'no_coverage'>('all');
  const [selectedDomain, setSelectedDomain] = useState<string>('all');

  // Categorize skills by risk
  const riskAnalysis = skills.map(skill => {
    // Check highest level in team
    let maxLevel: CompetencyLevel = 'L0';
    let maxScore = 0;
    const memberScores: { member: string; level: CompetencyLevel; score: number }[] = [];

    members.forEach(m => {
      const lvl = skill.ratings[m.name] || 'L0';
      const sc = COMPETENCY_DEFINITIONS[lvl]?.score || 0;
      memberScores.push({ member: m.name, level: lvl, score: sc });
      if (sc > maxScore) {
        maxScore = sc;
        maxLevel = lvl;
      }
    });

    // Sort member scores descending to identify natural candidates
    memberScores.sort((a, b) => b.score - a.score);

    // Assess risk type
    const hasSme = !!skill.sme;
    const hasBackup = !!skill.backup;
    const hasOwner = !!skill.owner;

    let riskType: 'CRITICAL_NO_COVERAGE' | 'HIGH_SPOF' | 'MEDIUM_NO_SME' | 'SAFE' = 'SAFE';
    let riskLabel = 'Đầy đủ người phụ trách';
    let riskColor = 'text-emerald-700 bg-emerald-50 border-emerald-200';

    if (!hasSme && !hasBackup && !hasOwner && maxScore <= 1) {
      riskType = 'CRITICAL_NO_COVERAGE';
      riskLabel = 'Chưa có người phụ trách (L0-L1)';
      riskColor = 'text-rose-700 bg-rose-50 border-rose-200';
    } else if (hasSme && !hasBackup) {
      riskType = 'HIGH_SPOF';
      riskLabel = 'Chỉ 1 người phụ trách (Thiếu dự phòng)';
      riskColor = 'text-amber-700 bg-amber-50 border-amber-200';
    } else if (!hasSme && hasOwner) {
      riskType = 'MEDIUM_NO_SME';
      riskLabel = 'Chưa có người giỏi mức L2';
      riskColor = 'text-orange-700 bg-orange-50 border-orange-200';
    } else if (!hasBackup) {
      riskType = 'HIGH_SPOF';
      riskLabel = 'Thiếu người dự phòng';
      riskColor = 'text-amber-700 bg-amber-50 border-amber-200';
    }

    return {
      skill,
      maxScore,
      maxLevel,
      topMembers: memberScores,
      riskType,
      riskLabel,
      riskColor
    };
  });

  // Filter skills
  const filtered = riskAnalysis.filter(item => {
    if (selectedDomain !== 'all' && item.skill.domain !== selectedDomain) return false;
    if (riskFilter === 'spof') return item.riskType === 'HIGH_SPOF';
    if (riskFilter === 'no_sme') return item.riskType === 'MEDIUM_NO_SME';
    if (riskFilter === 'no_coverage') return item.riskType === 'CRITICAL_NO_COVERAGE';
    return true;
  });

  const domains = Array.from(new Set(skills.map(s => s.domain))).sort();

  // Metrics
  const spofCount = riskAnalysis.filter(r => r.riskType === 'HIGH_SPOF').length;
  const noSmeCount = riskAnalysis.filter(r => r.riskType === 'MEDIUM_NO_SME').length;
  const noCoverageCount = riskAnalysis.filter(r => r.riskType === 'CRITICAL_NO_COVERAGE').length;
  const safeCount = riskAnalysis.filter(r => r.riskType === 'SAFE').length;

  return (
    <div className="space-y-6">
      {/* Header and KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 no-print">
        <div
          onClick={() => setRiskFilter('all')}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            riskFilter === 'all' ? 'ring-2 ring-indigo-500 bg-white shadow-xs' : 'bg-white/80 hover:bg-white'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Tổng Kỹ Năng Đánh Giá</span>
            <CheckCircle className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 tabular-nums">{skills.length}</div>
          <div className="text-xs text-slate-500 mt-1">Toàn bộ 14 Domain hạ tầng</div>
        </div>

        <div
          onClick={() => setRiskFilter('spof')}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            riskFilter === 'spof' ? 'ring-2 ring-amber-500 bg-amber-50/40 border-amber-200' : 'bg-white/80 hover:bg-white border-amber-200'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-amber-700 mb-1 font-semibold">
            <span>Chỉ 1 Người Phụ Trách</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-amber-800 tabular-nums">{spofCount}</div>
          <div className="text-xs text-amber-700/80 mt-1">Chưa có người dự phòng</div>
        </div>

        <div
          onClick={() => setRiskFilter('no_sme')}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            riskFilter === 'no_sme' ? 'ring-2 ring-orange-500 bg-orange-50/40 border-orange-200' : 'bg-white/80 hover:bg-white border-orange-200'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-orange-700 mb-1 font-semibold">
            <span>Chưa Có Người Mức L2</span>
            <ShieldAlert className="w-4 h-4 text-orange-600" />
          </div>
          <div className="text-2xl font-bold text-orange-800 tabular-nums">{noSmeCount}</div>
          <div className="text-xs text-orange-700/80 mt-1">Cần hỗ trợ học tập</div>
        </div>

        <div
          onClick={() => setRiskFilter('all')}
          className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/30"
        >
          <div className="flex items-center justify-between text-xs text-emerald-700 mb-1 font-semibold">
            <span>Đủ Phụ Trách & Dự Phòng</span>
            <CheckCircle className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-800 tabular-nums">{safeCount}</div>
          <div className="text-xs text-emerald-700/80 mt-1">
            Đạt {Math.round((safeCount / (skills.length || 1)) * 100)}% toàn bộ kỹ năng
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-3 no-print">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-500" />
          <span className="text-xs font-semibold text-slate-700">Lọc Theo Nhóm:</span>
          <select
            value={selectedDomain}
            onChange={e => setSelectedDomain(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium"
          >
            <option value="all">Tất cả Nhóm Kỹ Năng ({domains.length} nhóm)</option>
            {domains.map(d => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs text-slate-500">
            Hiển thị <strong className="text-slate-900 font-semibold">{filtered.length}</strong> kỹ năng
          </div>
          {onOpenPrintModal && (
            <button
              onClick={onOpenPrintModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-2xs transition-colors"
              title="Mở hộp thoại tùy chỉnh và xuất báo cáo rủi ro PDF"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span>Xuất Báo Cáo PDF</span>
            </button>
          )}
        </div>
      </div>

      {/* Risk Table with Actionable succession recommendation */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-slate-100 text-slate-700 border-b border-slate-300 font-semibold">
              <tr>
                <th className="py-2.5 px-3 w-10 text-center text-slate-500">#</th>
                <th className="py-2.5 px-3 w-36">Nhóm Kỹ Năng</th>
                <th className="py-2.5 px-3 min-w-[180px]">Tên Kỹ Năng</th>
                <th className="py-2.5 px-3 w-44">Tình Trạng</th>
                <th className="py-2.5 px-3 w-32">Người Phụ Trách Hiện Tại</th>
                <th className="py-2.5 px-3 w-40">Người Dự Phòng</th>
                <th className="py-2.5 px-3 min-w-[200px]">Gợi Ý Người Có Thể Làm Dự Phòng</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filtered.map((item, idx) => {
                const s = item.skill;
                // Candidate recommendation: find someone with at least L1 or L2 who is NOT currently the SME/Owner
                const backupCandidate = item.topMembers.find(
                  tm => tm.member !== s.sme && tm.member !== s.owner && tm.score >= 1
                );

                return (
                  <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-3 text-center text-slate-400 font-mono text-[11px] tabular-nums">
                      {s.id}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-slate-600 whitespace-nowrap">
                      {s.domain}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-slate-900">
                      {s.skill}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border ${item.riskColor}`}>
                        {item.riskLabel}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="font-bold text-slate-900">
                        {s.sme || s.owner || <span className="text-slate-400 italic">Chưa có</span>}
                      </div>
                      <span className="text-[10px] text-slate-500">
                        {s.sme ? 'Chuyên gia SME' : s.owner ? 'Chủ quản Owner' : ''}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      {s.backup ? (
                        <span className="font-semibold text-slate-900">{s.backup}</span>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <span className="text-amber-700 font-semibold text-[11px] bg-amber-50 px-1.5 py-0.5 rounded">
                            Chưa gán
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="py-2.5 px-3">
                      {backupCandidate ? (
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-indigo-700">{backupCandidate.member}</span>
                            <span className="text-[10px] text-slate-500 font-mono">
                              (Hiện có {backupCandidate.level})
                            </span>
                          </div>
                          {!s.backup && (
                            <button
                              onClick={() => onAssignBackup(s.id, backupCandidate.member)}
                              className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded text-[11px] font-medium transition-colors"
                              title="Gán làm người dự phòng Backup ngay"
                            >
                              <UserPlus className="w-3 h-3" />
                              <span>Gán Backup</span>
                            </button>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[11px] italic">
                          Cần mở khóa đào tạo cho đội ngũ
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
