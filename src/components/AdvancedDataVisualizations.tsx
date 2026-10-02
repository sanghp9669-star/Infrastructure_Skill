import React, { useState, useMemo } from 'react';
import { CompetencyLevel, SkillItem, TeamMember } from '../types/skills';
import { COMPETENCY_DEFINITIONS } from '../data/initialData';
import { 
  Radar, 
  Layers, 
  Grid3X3, 
  Award, 
  ShieldCheck, 
  ShieldAlert, 
  PieChart as PieIcon, 
  Sparkles, 
  TrendingUp, 
  Filter, 
  UserCheck, 
  CheckCircle2, 
  AlertTriangle,
  ChevronRight,
  Info
} from 'lucide-react';

interface AdvancedDataVisualizationsProps {
  skills: SkillItem[];
  members: TeamMember[];
}

export const AdvancedDataVisualizations: React.FC<AdvancedDataVisualizationsProps> = ({
  skills,
  members
}) => {
  const [selectedEngineerForRadar, setSelectedEngineerForRadar] = useState<string>('all');
  const [heatmapDomainFilter, setHeatmapDomainFilter] = useState<string>('all');
  const [activeSubTab, setActiveSubTab] = useState<'radar' | 'heatmap' | 'spof_donut' | 'certs'>('radar');

  // 1. Radar Chart Data: Compute average score per domain for Team vs Selected Member
  const domains = useMemo(() => Array.from(new Set(skills.map(s => s.domain))).sort(), [skills]);

  const radarDomainData = useMemo(() => {
    return domains.map(domain => {
      const domainSkills = skills.filter(s => s.domain === domain);
      
      // Team average
      let teamScoreSum = 0;
      let teamScoreCount = 0;

      // Selected member average
      let memberScoreSum = 0;
      let memberScoreCount = 0;

      domainSkills.forEach(s => {
        members.forEach(m => {
          const lvl = s.ratings[m.name] || 'L0';
          const score = COMPETENCY_DEFINITIONS[lvl]?.score || 0;
          teamScoreSum += score;
          teamScoreCount++;

          if (selectedEngineerForRadar !== 'all' && m.name === selectedEngineerForRadar) {
            memberScoreSum += score;
            memberScoreCount++;
          }
        });
      });

      const teamAvg = teamScoreCount > 0 ? Number((teamScoreSum / teamScoreCount).toFixed(2)) : 0;
      const memberAvg = memberScoreCount > 0 ? Number((memberScoreSum / memberScoreCount).toFixed(2)) : 0;

      // L2 count in this domain
      const l2Count = domainSkills.filter(s => 
        selectedEngineerForRadar === 'all' 
          ? members.some(m => s.ratings[m.name] === 'L2')
          : s.ratings[selectedEngineerForRadar] === 'L2'
      ).length;

      return {
        domain,
        totalSkills: domainSkills.length,
        teamAvg,
        memberAvg,
        l2Count,
        l2Percentage: domainSkills.length > 0 ? Math.round((l2Count / domainSkills.length) * 100) : 0
      };
    });
  }, [domains, skills, members, selectedEngineerForRadar]);

  // 2. SPOF & Coverage Donut Statistics
  const coverageStats = useMemo(() => {
    let totalSkills = skills.length;
    let fullCoverage = 0; // Owner + Backup + SME
    let missingBackup = 0; // Has SME/Owner but no Backup (SPOF)
    let missingSME = 0; // No SME
    let noRolesAssigned = 0; // No Owner, Backup or SME

    skills.forEach(s => {
      const hasOwner = Boolean(s.owner);
      const hasBackup = Boolean(s.backup);
      const hasSME = Boolean(s.sme);

      if (hasOwner && hasBackup && hasSME) {
        fullCoverage++;
      } else if ((hasOwner || hasSME) && !hasBackup) {
        missingBackup++;
      } else if (!hasSME && hasOwner) {
        missingSME++;
      } else if (!hasOwner && !hasBackup && !hasSME) {
        noRolesAssigned++;
      } else {
        missingBackup++;
      }
    });

    const fullPct = totalSkills > 0 ? Math.round((fullCoverage / totalSkills) * 100) : 0;
    const backupPct = totalSkills > 0 ? Math.round((missingBackup / totalSkills) * 100) : 0;
    const smePct = totalSkills > 0 ? Math.round((missingSME / totalSkills) * 100) : 0;

    return {
      totalSkills,
      fullCoverage,
      missingBackup,
      missingSME,
      noRolesAssigned,
      fullPct,
      backupPct,
      smePct
    };
  }, [skills]);

  // 3. Certifications & Evidence Data
  const certStats = useMemo(() => {
    const certsByMember: Record<string, { member: TeamMember; certList: string[] }> = {};
    let totalCertsCount = 0;

    members.forEach(m => {
      certsByMember[m.name] = { member: m, certList: [] };
    });

    skills.forEach(s => {
      if (s.evidence && s.evidence.trim()) {
        members.forEach(m => {
          const lvl = s.ratings[m.name] || 'L0';
          if (lvl === 'L2') {
            certsByMember[m.name]?.certList.push(`${s.skill} (${s.domain})`);
            totalCertsCount++;
          }
        });
      }
    });

    return {
      certsByMember: Object.values(certsByMember),
      totalCertsCount
    };
  }, [skills, members]);

  // 4. Heatmap Skills Filtered
  const filteredHeatmapSkills = useMemo(() => {
    if (heatmapDomainFilter === 'all') return skills;
    return skills.filter(s => s.domain === heatmapDomainFilter);
  }, [skills, heatmapDomainFilter]);

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-2xs space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-700 text-white flex items-center justify-center shadow-xs">
            <PieIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Biểu Đồ Trực Quan Năng Lực Đa Chiều & Ma Trận Nhiệt (Advanced Analytics)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Phân tích đa chiều năng lực 14 domains, ma trận nhiệt kỹ sư $L0 - L2$, bảo vệ rủi ro SPOF và hồ sơ chứng chỉ.
            </p>
          </div>
        </div>

        {/* Sub-tab navigation */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
          <button
            type="button"
            onClick={() => setActiveSubTab('radar')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
              activeSubTab === 'radar' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Radar className="w-3.5 h-3.5" />
            <span>Đồ Thị Multi-Domain</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('heatmap')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
              activeSubTab === 'heatmap' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Grid3X3 className="w-3.5 h-3.5" />
            <span>Ma Trận Nhiệt 2D</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('spof_donut')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
              activeSubTab === 'spof_donut' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Bảo Vệ SPOF</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('certs')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
              activeSubTab === 'certs' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Hồ Sơ Chứng Chỉ</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: RADAR / MULTI-DOMAIN COMPETENCY CHART */}
      {activeSubTab === 'radar' && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-800 text-xs">So Sánh Năng Lực Kỹ Sư:</span>
              <select
                value={selectedEngineerForRadar}
                onChange={e => setSelectedEngineerForRadar(e.target.value)}
                className="px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 font-bold focus:outline-hidden focus:border-indigo-500"
              >
                <option value="all">🌐 Toàn Đội Ngũ (Trung Bình Chung)</option>
                {members.map(m => (
                  <option key={m.name} value={m.name}>
                    👤 Kỹ Sư: {m.name} ({m.roleTitle})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-4 text-xs font-bold">
              <span className="flex items-center gap-1.5 text-indigo-700">
                <span className="w-3 h-3 rounded-full bg-indigo-600 inline-block" />
                <span>Mức Trung Bình Đội Ngũ</span>
              </span>
              {selectedEngineerForRadar !== 'all' && (
                <span className="flex items-center gap-1.5 text-emerald-700">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
                  <span>Kỹ Sư {selectedEngineerForRadar}</span>
                </span>
              )}
            </div>
          </div>

          {/* Polygon / Bar Visual Representation of 14 Domains Competency */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-14 gap-2">
            {radarDomainData.map(d => {
              const maxVal = 2.0; // Max score L2 = 2.0
              const teamPct = Math.min(100, Math.round((d.teamAvg / maxVal) * 100));
              const memberPct = Math.min(100, Math.round((d.memberAvg / maxVal) * 100));

              return (
                <div
                  key={d.domain}
                  className="p-3 bg-slate-50 hover:bg-indigo-50/50 rounded-xl border border-slate-200/90 transition-colors flex flex-col justify-between"
                >
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase block truncate" title={d.domain}>
                      {d.domain}
                    </span>
                    <span className="text-xs font-black text-slate-900 block mt-1">
                      {d.teamAvg} <span className="text-[9px] font-normal text-slate-400">/ 2.0</span>
                    </span>
                  </div>

                  {/* Dual Bar gauge */}
                  <div className="space-y-1.5 mt-3">
                    {/* Team bar */}
                    <div>
                      <div className="flex justify-between text-[9px] text-slate-400 font-medium mb-0.5">
                        <span>Đội ngũ</span>
                        <span>{teamPct}%</span>
                      </div>
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div
                          style={{ width: `${teamPct}%` }}
                          className="bg-indigo-600 h-full rounded-full transition-all"
                        />
                      </div>
                    </div>

                    {/* Member bar if selected */}
                    {selectedEngineerForRadar !== 'all' && (
                      <div>
                        <div className="flex justify-between text-[9px] text-emerald-700 font-bold mb-0.5">
                          <span>{selectedEngineerForRadar}</span>
                          <span>{memberPct}%</span>
                        </div>
                        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                          <div
                            style={{ width: `${memberPct}%` }}
                            className="bg-emerald-500 h-full rounded-full transition-all"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-2 text-[9px] font-bold text-slate-600 border-t border-slate-200/60 pt-1 flex justify-between">
                    <span>{d.totalSkills} Kỹ Năng</span>
                    <span className="text-emerald-700">L2: {d.l2Count} KS</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 2: 2D HEATMAP GRID */}
      {activeSubTab === 'heatmap' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <div className="flex items-center gap-2 text-xs">
              <Filter className="w-4 h-4 text-indigo-600" />
              <label className="font-bold text-slate-800">Lọc theo Domain Phân Khúc:</label>
              <select
                value={heatmapDomainFilter}
                onChange={e => setHeatmapDomainFilter(e.target.value)}
                className="px-3 py-1 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 font-bold focus:outline-hidden focus:border-indigo-500"
              >
                <option value="all">Tất cả {domains.length} Domains ({skills.length} Kỹ Năng)</option>
                {domains.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            {/* Level Legend */}
            <div className="flex items-center gap-3 text-xs font-bold">
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 bg-emerald-500 rounded-sm border border-emerald-600 inline-block" />
                <span className="text-emerald-800">L2: Đã Lab thành công</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 bg-amber-400 rounded-sm border border-amber-500 inline-block" />
                <span className="text-amber-800">L1: Đã biết, chưa Lab</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 bg-slate-200 rounded-sm border border-slate-300 inline-block" />
                <span className="text-slate-500">L0: Chưa tiếp cận</span>
              </span>
            </div>
          </div>

          {/* 2D Heatmap Grid Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-200 max-h-[500px]">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-900 text-white font-bold sticky top-0 z-10 text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="p-3 sticky left-0 bg-slate-900 z-20 min-w-[200px] border-r border-slate-800">
                    Kỹ Năng Công Nghệ
                  </th>
                  <th className="p-3 min-w-[120px] border-r border-slate-800">Domain</th>
                  {members.map(m => (
                    <th key={m.name} className="p-2.5 text-center min-w-[80px] border-r border-slate-800">
                      <span className="block font-bold text-white">{m.name}</span>
                    </th>
                  ))}
                  <th className="p-3 text-center min-w-[100px]">Owner / Backup</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredHeatmapSkills.map((s, idx) => (
                  <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-2.5 font-bold text-slate-900 sticky left-0 bg-white z-10 border-r border-slate-200 shadow-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-slate-400 font-mono">#{idx + 1}</span>
                        <span>{s.skill}</span>
                      </div>
                    </td>
                    <td className="p-2.5 text-slate-600 text-[11px] border-r border-slate-100">
                      {s.domain}
                    </td>
                    {members.map(m => {
                      const lvl = s.ratings[m.name] || 'L0';
                      const cellBg = 
                        lvl === 'L2' ? 'bg-emerald-500 text-white font-black' :
                        lvl === 'L1' ? 'bg-amber-300 text-amber-950 font-bold' :
                        'bg-slate-100 text-slate-400 font-normal';

                      return (
                        <td key={m.name} className="p-1.5 text-center border-r border-slate-100">
                          <span className={`inline-block w-full py-1 rounded text-center text-xs font-mono shadow-2xs ${cellBg}`}>
                            {lvl}
                          </span>
                        </td>
                      );
                    })}
                    <td className="p-2 text-center text-[10px] text-slate-600 font-semibold">
                      <div className="truncate max-w-[120px]" title={`Owner: ${s.owner || '-'} | Backup: ${s.backup || '-'}`}>
                        👑 {s.owner || '-'}<br />
                        🛡️ {s.backup || '-'}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 3: SPOF & COVERAGE DONUT / METRICS */}
      {activeSubTab === 'spof_donut' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-emerald-50/70 rounded-xl border border-emerald-200 space-y-2">
              <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Bảo Vệ An Toàn Đầy Đủ</span>
              </span>
              <div className="text-2xl font-black text-emerald-700 font-mono">
                {coverageStats.fullCoverage} <span className="text-xs font-bold text-emerald-600">/ {coverageStats.totalSkills} Kỹ Năng ({coverageStats.fullPct}%)</span>
              </div>
              <p className="text-[11px] text-emerald-800">
                Có đủ 3 vai trò: <strong>Owner chính + Backup dự phòng + SME chuyên gia</strong>.
              </p>
            </div>

            <div className="p-4 bg-amber-50/70 rounded-xl border border-amber-200 space-y-2">
              <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Rủi Ro Thiếu Backup (SPOF)</span>
              </span>
              <div className="text-2xl font-black text-amber-700 font-mono">
                {coverageStats.missingBackup} <span className="text-xs font-bold text-amber-600">/ {coverageStats.totalSkills} Kỹ Năng ({coverageStats.backupPct}%)</span>
              </div>
              <p className="text-[11px] text-amber-800">
                Chỉ có 1 kỹ sư phụ trách duy nhất. Cần giao bài Lab dự phòng khẩn cấp.
              </p>
            </div>

            <div className="p-4 bg-rose-50/70 rounded-xl border border-rose-200 space-y-2">
              <span className="text-xs font-bold text-rose-900 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-rose-600" />
                <span>Thiếu SME Hoặc Chưa Gán Vai Trò</span>
              </span>
              <div className="text-2xl font-black text-rose-700 font-mono">
                {coverageStats.missingSME + coverageStats.noRolesAssigned} <span className="text-xs font-bold text-rose-600">/ {coverageStats.totalSkills} Kỹ Năng</span>
              </div>
              <p className="text-[11px] text-rose-800">
                Chưa có chuyên gia SME định hướng hoặc chưa phân công trách nhiệm.
              </p>
            </div>
          </div>

          {/* Progress Bar Breakdown */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <span className="text-xs font-bold text-slate-800 block">
              Tỷ Lệ Phân Bổ An Toàn Ma Trận Kỹ Năng Vận Hành
            </span>
            <div className="w-full h-4 bg-slate-200 rounded-full flex overflow-hidden shadow-2xs">
              <div
                style={{ width: `${coverageStats.fullPct}%` }}
                className="bg-emerald-500 h-full"
                title={`Đầy đủ bảo vệ: ${coverageStats.fullPct}%`}
              />
              <div
                style={{ width: `${coverageStats.backupPct}%` }}
                className="bg-amber-400 h-full"
                title={`Thiếu Backup (SPOF): ${coverageStats.backupPct}%`}
              />
              <div
                style={{ width: `${100 - coverageStats.fullPct - coverageStats.backupPct}%` }}
                className="bg-rose-500 h-full"
                title={`Thiếu SME / Chưa gán: ${100 - coverageStats.fullPct - coverageStats.backupPct}%`}
              />
            </div>
          </div>
        </div>
      )}

      {/* VIEW 4: CERTIFICATIONS PORTFOLIO */}
      {activeSubTab === 'certs' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-slate-900 text-xs flex items-center gap-2">
              <Award className="w-4 h-4 text-indigo-600" />
              <span>Hồ Sơ Năng Lực & Bằng Cấp Chứng Chỉ Quốc Tế Của 9 Kỹ Sư</span>
            </h4>
            <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200">
              Tổng số {certStats.totalCertsCount} chứng chỉ / minh chứng xác thực
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {certStats.certsByMember.map(item => (
              <div key={item.member.name} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${item.member.avatarColor} text-white font-bold text-xs flex items-center justify-center shadow-xs`}>
                    {item.member.name.charAt(0)}
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 text-xs block">{item.member.name}</span>
                    <span className="text-[10px] text-slate-500">{item.member.roleTitle}</span>
                  </div>
                </div>

                <div className="space-y-1 border-t border-slate-200/60 pt-2">
                  <span className="text-[10px] font-bold text-slate-600 block">Kỹ năng đạt chứng chỉ / Lab xuất sắc:</span>
                  {item.certList.length > 0 ? (
                    <ul className="space-y-1">
                      {item.certList.slice(0, 5).map((cert, cIdx) => (
                        <li key={cIdx} className="text-[11px] font-semibold text-emerald-800 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                          <span className="truncate">{cert}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span className="text-[11px] text-slate-400 italic block">Chưa gắn liên kết chứng chỉ</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
