import React, { useState, useMemo } from 'react';
import { CompetencyLevel, SkillItem, TeamMember } from '../types/skills';
import { COMPETENCY_DEFINITIONS } from '../data/initialData';
import { calculateEngineerGamification } from '../utils/gamificationUtils';
import { 
  User, 
  Radar, 
  Award, 
  CheckCircle2, 
  AlertCircle, 
  Trophy, 
  Sparkles, 
  ShieldCheck, 
  Shield, 
  Crown, 
  Flame, 
  Briefcase, 
  ChevronRight, 
  Layers, 
  Target, 
  ExternalLink,
  BookOpen,
  BarChart3
} from 'lucide-react';

interface IndividualMemberAnalyticsProps {
  skills: SkillItem[];
  members: TeamMember[];
  initialSelectedMemberName?: string;
  onSelectMember?: (memberName: string) => void;
}

export const IndividualMemberAnalytics: React.FC<IndividualMemberAnalyticsProps> = ({
  skills,
  members,
  initialSelectedMemberName,
  onSelectMember
}) => {
  const [selectedMemberName, setSelectedMemberName] = useState<string>(
    initialSelectedMemberName && initialSelectedMemberName !== 'all'
      ? initialSelectedMemberName
      : members[0]?.name || 'Toàn'
  );

  const [filterDomain, setFilterDomain] = useState<string>('all');

  const selectedMember = useMemo(() => {
    return members.find(m => m.name === selectedMemberName) || members[0];
  }, [members, selectedMemberName]);

  const handleMemberChange = (name: string) => {
    setSelectedMemberName(name);
    if (onSelectMember) onSelectMember(name);
  };

  // Compute Gamification & Rank Title
  const gamification = useMemo(() => {
    return calculateEngineerGamification(selectedMember.name, skills, []);
  }, [selectedMember.name, skills]);

  // Compute Member Skills Breakdown
  const memberSkills = useMemo(() => {
    return skills.map(s => {
      const lvl = (s.ratings[selectedMember.name] || 'L0') as CompetencyLevel;
      const score = COMPETENCY_DEFINITIONS[lvl]?.score || 0;
      return {
        ...s,
        level: lvl,
        score
      };
    });
  }, [skills, selectedMember.name]);

  const l2Skills = useMemo(() => memberSkills.filter(s => s.level === 'L2'), [memberSkills]);
  const l1Skills = useMemo(() => memberSkills.filter(s => s.level === 'L1'), [memberSkills]);
  const l0Skills = useMemo(() => memberSkills.filter(s => s.level === 'L0'), [memberSkills]);

  const ownedSkills = useMemo(() => skills.filter(s => s.owner === selectedMember.name), [skills, selectedMember.name]);
  const backupSkills = useMemo(() => skills.filter(s => s.backup === selectedMember.name), [skills, selectedMember.name]);
  const smeSkills = useMemo(() => skills.filter(s => s.sme === selectedMember.name), [skills, selectedMember.name]);

  const avgScore = useMemo(() => {
    const total = memberSkills.reduce((acc, curr) => acc + curr.score, 0);
    return (total / (skills.length || 1)).toFixed(2);
  }, [memberSkills, skills.length]);

  // 14 Domains Radar Calculation
  const domains = useMemo(() => Array.from(new Set(skills.map(s => s.domain))).sort(), [skills]);
  const numDomains = domains.length;
  const radarRadius = 120;
  const radarCenter = 150;

  const memberDomainStats = useMemo(() => {
    return domains.map((domain, index) => {
      const domainSkills = skills.filter(s => s.domain === domain);
      let scoreSum = 0;
      let l2Count = 0;
      let l1Count = 0;

      domainSkills.forEach(s => {
        const lvl = s.ratings[selectedMember.name] || 'L0';
        const score = COMPETENCY_DEFINITIONS[lvl]?.score || 0;
        scoreSum += score;
        if (score >= 2) l2Count++;
        else if (score === 1) l1Count++;
      });

      const dAvg = domainSkills.length > 0 ? Number((scoreSum / domainSkills.length).toFixed(2)) : 0;
      const l2Pct = domainSkills.length > 0 ? Math.round((l2Count / domainSkills.length) * 100) : 0;

      // Team average baseline for comparison
      let teamScoreSum = 0;
      skills.filter(s => s.domain === domain).forEach(s => {
        members.forEach(m => {
          const lvl = s.ratings[m.name] || 'L0';
          teamScoreSum += COMPETENCY_DEFINITIONS[lvl]?.score || 0;
        });
      });
      const teamAvg = Number((teamScoreSum / (domainSkills.length * members.length || 1)).toFixed(2));

      const angle = (Math.PI * 2 * index) / numDomains - Math.PI / 2;
      const rVal = (dAvg / 2.0) * radarRadius;
      const x = radarCenter + rVal * Math.cos(angle);
      const y = radarCenter + rVal * Math.sin(angle);

      // Team polygon point
      const teamRVal = (teamAvg / 2.0) * radarRadius;
      const teamX = radarCenter + teamRVal * Math.cos(angle);
      const teamY = radarCenter + teamRVal * Math.sin(angle);

      return {
        domain,
        totalSkills: domainSkills.length,
        avgScore: dAvg,
        teamAvg,
        l2Count,
        l1Count,
        l2Pct,
        angle,
        x,
        y,
        teamX,
        teamY
      };
    });
  }, [domains, skills, selectedMember.name, members]);

  const radarPolygonPoints = useMemo(() => memberDomainStats.map(p => `${p.x},${p.y}`).join(' '), [memberDomainStats]);
  const teamRadarPolygonPoints = useMemo(() => memberDomainStats.map(p => `${p.teamX},${p.teamY}`).join(' '), [memberDomainStats]);

  const sortedMemberDomains = useMemo(() => {
    return [...memberDomainStats].sort((a, b) => b.avgScore - a.avgScore);
  }, [memberDomainStats]);

  // 14 Domains Competency Level Distribution for Selected Member
  const domainLevelDistribution = useMemo(() => {
    return domains.map(domain => {
      const domainSkills = skills.filter(s => s.domain === domain);
      const total = domainSkills.length;
      let l2 = 0;
      let l1 = 0;
      let l0 = 0;

      domainSkills.forEach(s => {
        const lvl = s.ratings[selectedMember.name] || 'L0';
        if (lvl === 'L2') l2++;
        else if (lvl === 'L1') l1++;
        else l0++;
      });

      const l2Pct = total > 0 ? Math.round((l2 / total) * 100) : 0;
      const l1Pct = total > 0 ? Math.round((l1 / total) * 100) : 0;
      const l0Pct = total > 0 ? Math.max(0, 100 - l2Pct - l1Pct) : 0;

      return {
        domain,
        total,
        l2,
        l1,
        l0,
        l2Pct,
        l1Pct,
        l0Pct
      };
    });
  }, [domains, skills, selectedMember.name]);

  // Filtered skills list for table display
  const displayedSkills = useMemo(() => {
    if (filterDomain === 'all') return memberSkills;
    return memberSkills.filter(s => s.domain === filterDomain);
  }, [memberSkills, filterDomain]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* 1. Member Selector Ribbon with Avatars & Quick Stats */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs">
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-indigo-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Chọn Kỹ Sư Cần Đánh Giá Chi Tiết ({members.length} Kỹ Sư Execution Team)
            </h3>
          </div>
          <span className="text-[11px] text-slate-500 font-medium">
            Nhấp chọn bất kỳ kỹ sư nào bên dưới để soi ma trận năng lực
          </span>
        </div>

        {/* Member Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-2">
          {members.map(m => {
            const isSelected = m.name === selectedMember.name;
            const mGamification = calculateEngineerGamification(m.name, skills, []);
            const mL2Count = skills.filter(s => s.ratings[m.name] === 'L2').length;

            return (
              <button
                key={m.name}
                type="button"
                onClick={() => handleMemberChange(m.name)}
                className={`p-2 rounded-xl border transition-all text-center flex flex-col items-center cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-700 shadow-sm ring-2 ring-indigo-400/50 scale-[1.02]'
                    : 'bg-slate-50/80 hover:bg-slate-100 text-slate-800 border-slate-200'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${m.avatarColor} text-white font-black text-xs flex items-center justify-center shadow-xs mb-1.5`}>
                  {m.name.charAt(0)}
                </div>
                <span className="font-bold text-xs truncate w-full">{m.name}</span>
                <span className={`text-[10px] font-mono mt-0.5 ${isSelected ? 'text-indigo-100' : 'text-emerald-700 font-bold'}`}>
                  {mL2Count} L2 ({Math.round((mL2Count / skills.length) * 100)}%)
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Executive Hero Banner for Selected Member */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white border border-slate-800 shadow-lg relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${selectedMember.avatarColor} text-white font-black text-2xl flex items-center justify-center shadow-xl border-2 border-white/20 shrink-0`}>
              {selectedMember.name.charAt(0)}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-2xl font-extrabold tracking-tight">{selectedMember.name}</h2>
                <span className="px-2.5 py-0.5 text-xs font-black rounded-lg bg-amber-400 text-slate-950 shadow-xs">
                  Tier {gamification.levelTier} · {gamification.levelTitle}
                </span>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-white/10 text-slate-300 border border-white/15">
                  {selectedMember.roleTitle}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 mt-2 font-medium">
                <span className="text-indigo-300">✉️ {selectedMember.email}</span>
                <span className="text-emerald-300 font-bold font-mono">
                  📊 Điểm Trung Bình: {avgScore} / 2.0
                </span>
                <span className="text-amber-300 font-bold font-mono">
                  ⚡ {gamification.totalXP} XP
                </span>
              </div>
            </div>
          </div>

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-4 gap-2.5 text-center shrink-0">
            <div className="bg-white/10 backdrop-blur-xs p-2.5 rounded-xl border border-white/15 min-w-[85px]">
              <span className="text-[10px] uppercase font-bold text-slate-300 block">Kỹ Năng L2</span>
              <strong className="text-xl font-black text-emerald-400 tabular-nums block mt-0.5">
                {l2Skills.length}
              </strong>
              <span className="text-[9px] text-slate-400">Đã Lab thực chiến</span>
            </div>

            <div className="bg-white/10 backdrop-blur-xs p-2.5 rounded-xl border border-white/15 min-w-[85px]">
              <span className="text-[10px] uppercase font-bold text-slate-300 block">Chuyên Gia (SME)</span>
              <strong className="text-xl font-black text-purple-300 tabular-nums block mt-0.5">
                {smeSkills.length}
              </strong>
              <span className="text-[9px] text-slate-400">Chuyên môn sâu</span>
            </div>

            <div className="bg-white/10 backdrop-blur-xs p-2.5 rounded-xl border border-white/15 min-w-[85px]">
              <span className="text-[10px] uppercase font-bold text-slate-300 block">Chính (Owner)</span>
              <strong className="text-xl font-black text-indigo-300 tabular-nums block mt-0.5">
                {ownedSkills.length}
              </strong>
              <span className="text-[9px] text-slate-400">Phụ trách chính</span>
            </div>

            <div className="bg-white/10 backdrop-blur-xs p-2.5 rounded-xl border border-white/15 min-w-[85px]">
              <span className="text-[10px] uppercase font-bold text-slate-300 block">Dự Phòng (Backup)</span>
              <strong className="text-xl font-black text-teal-300 tabular-nums block mt-0.5">
                {backupSkills.length}
              </strong>
              <span className="text-[9px] text-slate-400">Dự phòng 24/7</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Main Analytical Grid: Radar Chart + Domain Competency Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (5 cols): Individual Radar Chart */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Radar className="w-4 h-4 text-indigo-600" />
                <span>Radar Năng Lực 14 Domains ({selectedMember.name})</span>
              </h3>
              <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                14 Infrastructure Domains
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              So sánh mạng nhện năng lực của {selectedMember.name} (Tím) với Mức trung bình chung toàn đội ngũ (Đường xám)
            </p>
          </div>

          {/* SVG Radar Chart */}
          <div className="flex flex-col items-center justify-center relative py-2">
            <svg className="w-full max-w-[320px] h-[280px] overflow-visible" viewBox="0 0 300 300">
              {/* Concentric grid webs */}
              {[0.25, 0.5, 0.75, 1.0].map((step, sIdx) => {
                const r = radarRadius * step;
                const gridPoints = domains.map((_, i) => {
                  const a = (Math.PI * 2 * i) / numDomains - Math.PI / 2;
                  return `${radarCenter + r * Math.cos(a)},${radarCenter + r * Math.sin(a)}`;
                }).join(' ');

                return (
                  <g key={sIdx}>
                    <polygon
                      points={gridPoints}
                      fill="none"
                      stroke="#cbd5e1"
                      strokeWidth={sIdx === 3 ? "1.5" : "1"}
                      strokeDasharray={sIdx === 3 ? "none" : "3 3"}
                    />
                    <text
                      x={radarCenter + 4}
                      y={radarCenter - r + 3}
                      className="text-[8px] fill-slate-400 font-mono"
                    >
                      {(step * 2.0).toFixed(1)}
                    </text>
                  </g>
                );
              })}

              {/* Spokes */}
              {domains.map((_, i) => {
                const a = (Math.PI * 2 * i) / numDomains - Math.PI / 2;
                const x2 = radarCenter + radarRadius * Math.cos(a);
                const y2 = radarCenter + radarRadius * Math.sin(a);
                return (
                  <line
                    key={i}
                    x1={radarCenter}
                    y1={radarCenter}
                    x2={x2}
                    y2={y2}
                    stroke="#f1f5f9"
                    strokeWidth={1}
                  />
                );
              })}

              {/* Team Average Baseline Polygon (Dashed Gray) */}
              <polygon
                points={teamRadarPolygonPoints}
                fill="none"
                stroke="#94a3b8"
                strokeWidth={1.5}
                strokeDasharray="4 3"
              />

              {/* Selected Member Polygon (Solid Indigo) */}
              <polygon
                points={radarPolygonPoints}
                fill="rgba(99, 102, 241, 0.28)"
                stroke="#4f46e5"
                strokeWidth={2.5}
                className="transition-all duration-300"
              />

              {/* Member Vertices */}
              {memberDomainStats.map((p, idx) => (
                <g key={idx}>
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={4}
                    fill="#4338ca"
                    stroke="#ffffff"
                    strokeWidth={1.5}
                  />
                </g>
              ))}

              {/* Perimeter Labels */}
              {memberDomainStats.map((p, idx) => {
                const labelRadius = radarRadius + 22;
                const lx = radarCenter + labelRadius * Math.cos(p.angle);
                const ly = radarCenter + labelRadius * Math.sin(p.angle);
                const isRight = Math.cos(p.angle) > 0.05;
                const isLeft = Math.cos(p.angle) < -0.05;
                const textAnchor = isRight ? 'start' : isLeft ? 'end' : 'middle';

                const shortLabel = p.domain
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
                    className="text-[9px] font-bold fill-slate-700 select-none"
                  >
                    {shortLabel} ({p.avgScore})
                  </text>
                );
              })}
            </svg>
          </div>

          {/* Chart Legend */}
          <div className="flex items-center justify-center gap-4 text-xs pt-2 border-t border-slate-100 font-medium">
            <span className="flex items-center gap-1.5 text-indigo-700 font-bold">
              <span className="w-3 h-3 bg-indigo-600 rounded-sm inline-block" />
              <span>{selectedMember.name}</span>
            </span>
            <span className="flex items-center gap-1.5 text-slate-500">
              <span className="w-3 h-3 border border-slate-400 border-dashed rounded-sm inline-block" />
              <span>Trung Bình Toàn Đội ({memberDomainStats[0]?.teamAvg || 0.8})</span>
            </span>
          </div>

          {/* Highlight Cards */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200">
              <span className="text-[9px] font-bold uppercase text-emerald-800 block">🏆 Domain Mạnh Nhất</span>
              <strong className="text-slate-900 text-xs truncate block mt-0.5">{sortedMemberDomains[0]?.domain}</strong>
              <span className="text-[10px] text-emerald-700 font-bold">{sortedMemberDomains[0]?.l2Count} Kỹ năng L2</span>
            </div>

            <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200">
              <span className="text-[9px] font-bold uppercase text-amber-800 block">🚀 Cần Bồi Dưỡng L2</span>
              <strong className="text-slate-900 text-xs truncate block mt-0.5">{sortedMemberDomains[sortedMemberDomains.length - 1]?.domain}</strong>
              <span className="text-[10px] text-amber-800 font-bold">{sortedMemberDomains[sortedMemberDomains.length - 1]?.l1Count} Kỹ năng L1</span>
            </div>
          </div>
        </div>

        {/* Right Column (7 cols): Domain Scores Breakdown & Upskilling Recommendations */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Target className="w-4 h-4 text-indigo-600" />
                <span>Chi Tiết Điểm Năng Lực & Tỷ Lệ Đạt L2 Theo 14 Domains</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Bảng xếp hạng năng lực cá nhân của {selectedMember.name} qua từng mảng công nghệ hạ tầng
              </p>
            </div>
          </div>

          {/* Domain Progress List */}
          <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
            {sortedMemberDomains.map(item => {
              const scorePct = Math.min(100, Math.round((item.avgScore / 2.0) * 100));

              return (
                <div key={item.domain} className="p-2.5 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-xs">{item.domain}</span>
                      <span className="text-[10px] text-slate-400">({item.totalSkills} Kỹ năng)</span>
                    </div>

                    <div className="flex items-center gap-3 text-xs">
                      <span className="text-emerald-700 font-bold text-[11px]">
                        L2: {item.l2Count}/{item.totalSkills} ({item.l2Pct}%)
                      </span>
                      <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200 tabular-nums">
                        {item.avgScore} / 2.0
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${scorePct}%` }}
                      className={`h-full rounded-full transition-all ${
                        scorePct >= 75 ? 'bg-emerald-500' : scorePct >= 40 ? 'bg-amber-400' : 'bg-slate-400'
                      }`}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Recommended Upskilling Roadmap */}
          <div className="p-3.5 bg-indigo-50/70 rounded-xl border border-indigo-200/80 space-y-2">
            <span className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>Lộ Trình Đề Xuất Cấp Tài Nguyên Lab Bứt Phá Lên L2 Cho {selectedMember.name}:</span>
            </span>
            <p className="text-[11px] text-indigo-800 leading-relaxed">
              Kỹ sư {selectedMember.name} đang sở hữu <strong className="text-indigo-950 font-bold">{l1Skills.length} kỹ năng ở mức L1</strong> (đã học lý thuyết / lab dở dang). Đề xuất cấp kinh phí thi chứng chỉ và tài nguyên Lab thực chiến để sẵn sàng đảm nhận vai trò Owner/SME cho dự án mới.
            </p>
          </div>
        </div>
      </div>

      {/* 3b. Biểu Đồ Phân Phối Cấp Độ Năng Lực (L0-L2) Cá Nhân Cho {selectedMember.name} */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-indigo-600" />
              <span>Biểu Đồ Phân Phối Cấp Độ Năng Lực (L0, L1, L2) Của Kỹ Sư {selectedMember.name} (14 Domains)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Chi tiết số lượng & tỷ lệ % kỹ năng ở mức Thực chiến (L2), Lý thuyết (L1) và Chưa tiếp cận (L0) của {selectedMember.name}
            </p>
          </div>

          {/* Overall Member Level Summary Pills */}
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
            <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 rounded-lg border border-emerald-200/90 flex items-center gap-1.5 shadow-2xs">
              <span className="w-2.5 h-2.5 bg-emerald-600 rounded-full" />
              <span>🟢 L2 Thực Chiến: {l2Skills.length} ({Math.round((l2Skills.length / skills.length) * 100)}%)</span>
            </span>

            <span className="px-2.5 py-1 bg-amber-50 text-amber-800 rounded-lg border border-amber-200/90 flex items-center gap-1.5 shadow-2xs">
              <span className="w-2.5 h-2.5 bg-amber-400 rounded-full" />
              <span>🟡 L1 Lý Thuyết: {l1Skills.length} ({Math.round((l1Skills.length / skills.length) * 100)}%)</span>
            </span>

            <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg border border-slate-200 flex items-center gap-1.5 shadow-2xs">
              <span className="w-2.5 h-2.5 bg-slate-400 rounded-full" />
              <span>⚪ L0 Chưa Tiếp Cận: {l0Skills.length} ({Math.round((l0Skills.length / skills.length) * 100)}%)</span>
            </span>
          </div>
        </div>

        {/* 14 Domain Stacked Bar Chart for Selected Member */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
          {domainLevelDistribution.map(item => {
            return (
              <div key={item.domain} className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/80 space-y-1.5 hover:bg-slate-50 transition-colors">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-bold text-slate-900 text-xs truncate" title={item.domain}>{item.domain}</span>
                    <span className="text-[10px] text-slate-400 font-mono shrink-0">({item.total} kỹ năng)</span>
                  </div>

                  <div className="flex items-center gap-2 text-[10px] font-mono shrink-0">
                    <span className="text-emerald-700 font-bold">L2: {item.l2}</span>
                    <span className="text-amber-700 font-bold">L1: {item.l1}</span>
                    <span className="text-slate-400">L0: {item.l0}</span>
                  </div>
                </div>

                {/* Stacked Progress Bar */}
                <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden flex shadow-2xs">
                  {item.l2 > 0 && (
                    <div
                      style={{ width: `${item.l2Pct}%` }}
                      className="bg-emerald-600 h-full transition-all relative group cursor-pointer"
                      title={`${item.domain} - L2 Thực chiến: ${item.l2} / ${item.total} kỹ năng (${item.l2Pct}%)`}
                    />
                  )}
                  {item.l1 > 0 && (
                    <div
                      style={{ width: `${item.l1Pct}%` }}
                      className="bg-amber-400 h-full transition-all relative group cursor-pointer"
                      title={`${item.domain} - L1 Lý thuyết: ${item.l1} / ${item.total} kỹ năng (${item.l1Pct}%)`}
                    />
                  )}
                  {item.l0 > 0 && (
                    <div
                      style={{ width: `${item.l0Pct}%` }}
                      className="bg-slate-300 h-full transition-all relative group cursor-pointer"
                      title={`${item.domain} - L0 Chưa tiếp cận: ${item.l0} / ${item.total} kỹ năng (${item.l0Pct}%)`}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Detailed Skill Matrix List for Selected Member */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-600" />
              <span>Danh Sách Kỹ Năng Đã Đánh Giá Của {selectedMember.name} ({displayedSkills.length} / {skills.length} Kỹ Năng)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Soi chi tiết cấp độ L0 - L2, minh chứng chứng chỉ và vai trò trách nhiệm của kỹ sư
            </p>
          </div>

          {/* Filter Domain */}
          <div className="flex items-center gap-2 text-xs">
            <label className="font-semibold text-slate-700">Domain Filter:</label>
            <select
              value={filterDomain}
              onChange={e => setFilterDomain(e.target.value)}
              className="px-3 py-1 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium focus:outline-hidden"
            >
              <option value="all">Tất cả {domains.length} Domains</option>
              {domains.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Skills Grid List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[480px] overflow-y-auto p-1">
          {displayedSkills.map(s => {
            const def = COMPETENCY_DEFINITIONS[s.level] || COMPETENCY_DEFINITIONS.L0;
            const isOwner = s.owner === selectedMember.name;
            const isBackup = s.backup === selectedMember.name;
            const isSme = s.sme === selectedMember.name;

            return (
              <div
                key={s.id}
                className={`p-3 rounded-xl border transition-all ${
                  s.level === 'L2'
                    ? 'bg-emerald-50/30 border-emerald-200/80'
                    : s.level === 'L1'
                    ? 'bg-amber-50/30 border-amber-200/80'
                    : 'bg-slate-50/50 border-slate-200/70'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <span className="font-bold text-slate-900 text-xs block truncate" title={s.skill}>
                    {s.skill}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold shrink-0 ${def.bgClass} ${def.textClass} border ${def.borderClass}`}>
                    {s.level}: {def.name}
                  </span>
                </div>

                <div className="text-[10px] text-slate-500 mb-2 truncate">
                  Domain: <span className="font-semibold text-slate-700">{s.domain}</span>
                </div>

                {/* Roles Badges */}
                <div className="flex flex-wrap items-center gap-1.5 text-[10px] border-t border-slate-100 pt-1.5">
                  {isSme && (
                    <span className="px-1.5 py-0.2 rounded bg-purple-100 text-purple-800 font-bold border border-purple-200">
                      💜 Chuyên Gia SME
                    </span>
                  )}
                  {isOwner && (
                    <span className="px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-800 font-bold border border-indigo-200">
                      👑 Phụ Trách Owner
                    </span>
                  )}
                  {isBackup && (
                    <span className="px-1.5 py-0.2 rounded bg-teal-100 text-teal-800 font-bold border border-teal-200">
                      🛡️ Dự Phòng Backup
                    </span>
                  )}
                  {!isSme && !isOwner && !isBackup && (
                    <span className="text-slate-400 italic">Thành viên triển khai</span>
                  )}
                </div>

                {/* Certification / Evidence link if present */}
                {s.evidence && (
                  <div className="mt-2 text-[10px] text-indigo-700 bg-indigo-50/80 p-1.5 rounded border border-indigo-100 flex items-center justify-between">
                    <span className="truncate">Minh chứng: {s.evidence}</span>
                    <ExternalLink className="w-3 h-3 shrink-0 ml-1" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
