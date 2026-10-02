import React, { useState, useMemo } from 'react';
import { CompetencyLevel, Project, SkillItem, TeamMember } from '../types/skills';
import { COMPETENCY_DEFINITIONS } from '../data/initialData';
import { calculateEngineerGamification, EngineerBadge } from '../utils/gamificationUtils';
import { 
  X, 
  Shield, 
  UserCheck, 
  Briefcase, 
  Mail, 
  CheckCircle2, 
  Layers, 
  Award, 
  Trophy, 
  Sparkles, 
  Lock, 
  Flame, 
  Star,
  ExternalLink,
  FolderKanban,
  UserCog,
  Radar,
  Crown,
  ShieldAlert,
  AlertTriangle,
  Gauge,
  Info
} from 'lucide-react';

interface MemberProfileModalProps {
  member: TeamMember | null;
  onClose: () => void;
  skills: SkillItem[];
  projects: Project[];
  onFilterMember: (memberName: string) => void;
  onEditMember?: (member: TeamMember) => void;
}

export const MemberProfileModal: React.FC<MemberProfileModalProps> = ({
  member,
  onClose,
  skills,
  projects,
  onFilterMember,
  onEditMember
}) => {
  const [activeTab, setActiveTab] = useState<'radar' | 'responsibilities' | 'badges' | 'skills' | 'projects'>('radar');
  const [respFilter, setRespFilter] = useState<'all' | 'owner' | 'sme' | 'dual' | 'spof'>('all');

  if (!member) return null;

  // Compute Gamification Profile & Metrics
  const gamification = calculateEngineerGamification(member.name, skills, projects);

  const memberSkills = skills.map(s => ({
    ...s,
    level: s.ratings[member.name] || 'L0',
    score: COMPETENCY_DEFINITIONS[s.ratings[member.name] || 'L0']?.score || 0
  }));

  const l2Skills = memberSkills.filter(s => s.level === 'L2' || s.score >= 2);
  const l1Skills = memberSkills.filter(s => s.level === 'L1');

  // Responsibilities & Workload Allocation
  const ownedSkills = skills.filter(s => s.owner === member.name);
  const backupSkills = skills.filter(s => s.backup === member.name);
  const smeSkills = skills.filter(s => s.sme === member.name);

  // Critical responsibilities: Unique skills where member is marked as Owner OR SME
  const primarySkills = skills.filter(s => s.owner === member.name || s.sme === member.name);
  // Skills where member is BOTH Owner AND SME (Highest single-point concentration)
  const dualRoleSkills = skills.filter(s => s.owner === member.name && s.sme === member.name);
  // Skills where member is Owner or SME but lacks a Backup (High SPOF vulnerability)
  const spofResponsibleSkills = primarySkills.filter(s => !s.backup);

  // Over-allocation level definition:
  // <= 10: Balanced (healthy)
  // 11 - 20: High load (watch closely)
  // > 20: Critical over-allocation (bottleneck / burnout risk)
  const allocationLevel: 'balanced' | 'high' | 'critical' = 
    primarySkills.length > 20 ? 'critical' : primarySkills.length > 10 ? 'high' : 'balanced';

  // Domain-level distribution of Owner & SME roles
  const responsibilityByDomain = useMemo(() => {
    const map: Record<string, { domain: string; ownerCount: number; smeCount: number; backupCount: number; totalCritical: number }> = {};
    
    primarySkills.forEach(s => {
      const d = s.domain || 'General';
      if (!map[d]) {
        map[d] = { domain: d, ownerCount: 0, smeCount: 0, backupCount: 0, totalCritical: 0 };
      }
      if (s.owner === member.name) map[d].ownerCount++;
      if (s.sme === member.name) map[d].smeCount++;
      map[d].totalCritical++;
    });

    backupSkills.forEach(s => {
      const d = s.domain || 'General';
      if (!map[d]) {
        map[d] = { domain: d, ownerCount: 0, smeCount: 0, backupCount: 0, totalCritical: 0 };
      }
      map[d].backupCount++;
    });

    return Object.values(map).sort((a, b) => b.totalCritical - a.totalCritical);
  }, [primarySkills, backupSkills, member.name]);

  // Filtered skills for responsibility list
  const filteredRespSkills = useMemo(() => {
    if (respFilter === 'owner') return ownedSkills;
    if (respFilter === 'sme') return smeSkills;
    if (respFilter === 'dual') return dualRoleSkills;
    if (respFilter === 'spof') return spofResponsibleSkills;
    return primarySkills;
  }, [respFilter, primarySkills, ownedSkills, smeSkills, dualRoleSkills, spofResponsibleSkills]);

  const memberProjects = projects.filter(p => (p.assignedMembers || []).includes(member.name) || p.lead === member.name);

  const avgScore = (
    memberSkills.reduce((acc, curr) => acc + curr.score, 0) / (skills.length || 1)
  ).toFixed(2);

  // 14 Domains Individual Radar Calculation
  const domains = Array.from(new Set(skills.map(s => s.domain))).sort();
  const numDomains = domains.length;
  const radarRadius = 110;
  const radarCenter = 140;

  const memberDomainStats = domains.map((domain, index) => {
    const domainSkills = skills.filter(s => s.domain === domain);
    let scoreSum = 0;
    let l2Count = 0;

    domainSkills.forEach(s => {
      const lvl = s.ratings[member.name] || 'L0';
      const score = COMPETENCY_DEFINITIONS[lvl]?.score || 0;
      scoreSum += score;
      if (score >= 2) l2Count++;
    });

    const dAvg = domainSkills.length > 0 ? Number((scoreSum / domainSkills.length).toFixed(2)) : 0;
    const l2Pct = domainSkills.length > 0 ? Math.round((l2Count / domainSkills.length) * 100) : 0;

    const angle = (Math.PI * 2 * index) / numDomains - Math.PI / 2;
    const rVal = (dAvg / 2.0) * radarRadius;
    const x = radarCenter + rVal * Math.cos(angle);
    const y = radarCenter + rVal * Math.sin(angle);

    return {
      domain,
      totalSkills: domainSkills.length,
      avgScore: dAvg,
      l2Count,
      l2Pct,
      angle,
      x,
      y
    };
  });

  const radarPolygonPoints = memberDomainStats.map(p => `${p.x},${p.y}`).join(' ');
  const sortedMemberDomains = [...memberDomainStats].sort((a, b) => b.avgScore - a.avgScore);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden max-h-[92vh] flex flex-col">
        
        {/* Header with Avatar & Rank Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 text-white relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/70 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${member.avatarColor} flex items-center justify-center text-white font-black text-2xl shadow-lg border-2 border-white/20 shrink-0`}>
                {member.name.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-extrabold tracking-tight">{member.name}</h3>
                  <span className="px-2 py-0.5 text-[10px] font-black rounded-lg bg-amber-400 text-slate-950 shadow-xs">
                    Tier {gamification.levelTier} · {gamification.levelTitle}
                  </span>
                  {onEditMember && (
                    <button
                      type="button"
                      onClick={() => onEditMember(member)}
                      className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-white/15 hover:bg-white/25 text-white border border-white/20 transition-colors inline-flex items-center gap-1 shadow-xs ml-1"
                      title="Chỉnh sửa thông tin thành viên"
                    >
                      <UserCog className="w-3.5 h-3.5" />
                      <span>Sửa Hồ Sơ</span>
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 mt-1.5">
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-indigo-400" />
                    {member.email}
                  </span>
                  <span className="flex items-center gap-1 font-mono text-indigo-300 font-bold">
                    <span>Điểm TB: {avgScore} / 2.0</span>
                  </span>
                  <span className="text-amber-300 font-bold font-mono">
                    ⚡ {gamification.totalXP} XP
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              {/* Over-allocation / Responsibility Workload Card */}
              <div 
                onClick={() => setActiveTab('responsibilities')}
                className={`px-3.5 py-2 rounded-xl border backdrop-blur-xs text-center cursor-pointer transition-all hover:scale-105 shadow-xs ${
                  allocationLevel === 'critical'
                    ? 'bg-rose-500/25 border-rose-400 text-rose-200 ring-2 ring-rose-400/30'
                    : allocationLevel === 'high'
                    ? 'bg-amber-500/25 border-amber-400 text-amber-200 ring-2 ring-amber-400/30'
                    : 'bg-white/10 border-white/15 text-slate-300'
                }`}
                title="Bấm để xem chi tiết phân bổ vai trò Chủ Quản (Owner) & Chuyên Gia (SME)"
              >
                <span className="text-[10px] uppercase font-bold block flex items-center justify-center gap-1">
                  {allocationLevel === 'critical' && <ShieldAlert className="w-3 h-3 text-rose-400 animate-pulse" />}
                  {allocationLevel === 'high' && <AlertTriangle className="w-3 h-3 text-amber-400" />}
                  {allocationLevel === 'balanced' && <Crown className="w-3 h-3 text-amber-400" />}
                  <span>{allocationLevel === 'critical' ? 'Quá Tải Trách Nhiệm' : allocationLevel === 'high' ? 'Tải Trọng Trách Nhiệm Cao' : 'Vai Trò Chủ Quản'}</span>
                </span>
                <span className="text-xl font-black text-white tabular-nums">
                  {primarySkills.length} <span className="text-xs text-slate-300 font-normal">kỹ năng</span>
                </span>
              </div>

              {/* Badges count badge */}
              <div className="bg-white/10 backdrop-blur-xs px-3.5 py-2 rounded-xl border border-white/15 text-center shrink-0">
                <span className="text-[10px] uppercase font-bold text-slate-300 block">Huy Hiệu Đã Đạt</span>
                <span className="text-xl font-black text-amber-400 tabular-nums">
                  🏆 {gamification.unlockedBadges.length} <span className="text-xs text-slate-300 font-normal">/ {gamification.allBadges.length}</span>
                </span>
              </div>
            </div>
          </div>

          {/* XP Progress Bar */}
          <div className="mt-4 pt-3 border-t border-white/10 space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-300">
                Tiến trình thăng hạng cấp bậc tiếp theo:
              </span>
              <span className="font-mono font-bold text-amber-300">
                {gamification.totalXP} / {gamification.nextLevelXP} XP ({gamification.levelProgressPercent}%)
              </span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden border border-white/10">
              <div
                className="bg-gradient-to-r from-amber-400 via-orange-500 to-indigo-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${gamification.levelProgressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="px-6 pt-3 bg-slate-50 border-b border-slate-200 flex items-center gap-2 shrink-0 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab('radar')}
            className={`flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-bold rounded-t-xl transition-all border-t border-x shrink-0 cursor-pointer ${
              activeTab === 'radar'
                ? 'bg-white text-indigo-700 border-slate-200 -mb-px shadow-2xs font-extrabold'
                : 'text-slate-600 hover:text-slate-900 border-transparent hover:bg-slate-100'
            }`}
          >
            <Radar className="w-4 h-4 text-indigo-600" />
            <span>Radar Năng Lực</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('responsibilities')}
            className={`flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-bold rounded-t-xl transition-all border-t border-x shrink-0 cursor-pointer ${
              activeTab === 'responsibilities'
                ? 'bg-white text-indigo-700 border-slate-200 -mb-px shadow-2xs font-extrabold'
                : 'text-slate-600 hover:text-slate-900 border-transparent hover:bg-slate-100'
            }`}
          >
            <Crown className="w-4 h-4 text-amber-500" />
            <span>Trách Nhiệm Owner/SME ({primarySkills.length})</span>
            {allocationLevel === 'critical' && (
              <span className="px-1.5 py-0.2 text-[9px] font-black rounded-full bg-rose-500 text-white animate-pulse">
                Quá tải
              </span>
            )}
            {allocationLevel === 'high' && (
              <span className="px-1.5 py-0.2 text-[9px] font-black rounded-full bg-amber-500 text-white">
                Tải cao
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('badges')}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all border-t border-x ${
              activeTab === 'badges'
                ? 'bg-white text-indigo-700 border-slate-200 -mb-px shadow-2xs font-extrabold'
                : 'text-slate-600 hover:text-slate-900 border-transparent hover:bg-slate-100'
            }`}
          >
            <Trophy className="w-4 h-4 text-amber-500" />
            <span>Huy Hiệu ({gamification.unlockedBadges.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('skills')}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all border-t border-x ${
              activeTab === 'skills'
                ? 'bg-white text-indigo-700 border-slate-200 -mb-px shadow-2xs font-extrabold'
                : 'text-slate-600 hover:text-slate-900 border-transparent hover:bg-slate-100'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Kỹ Năng L2 ({l2Skills.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('projects')}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all border-t border-x ${
              activeTab === 'projects'
                ? 'bg-white text-indigo-700 border-slate-200 -mb-px shadow-2xs font-extrabold'
                : 'text-slate-600 hover:text-slate-900 border-transparent hover:bg-slate-100'
            }`}
          >
            <Briefcase className="w-4 h-4 text-indigo-600" />
            <span>Dự Án ({memberProjects.length})</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700 flex-1">
          
          {/* TAB 0: INDIVIDUAL RADAR CHART (14 DOMAINS) */}
          {activeTab === 'radar' && (
            <div className="space-y-5">
              {/* Radar Chart Card */}
              <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-200/90 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/80 pb-3">
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                      <Radar className="w-4 h-4 text-indigo-600" />
                      <span>Biểu Đồ Radar Năng Lực Cá Nhân ({member.name})</span>
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Đánh giá chiều sâu & chiều rộng kỹ năng thực chiến ($0.0 \to 2.0$) trên toàn bộ 14 phân khúc hạ tầng
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 block uppercase font-semibold">Điểm Trung Bình:</span>
                    <span className="text-base font-black text-indigo-700 font-mono tabular-nums">
                      {avgScore} / 2.0
                    </span>
                  </div>
                </div>

                {/* SVG Radar Visualization */}
                <div className="flex flex-col items-center justify-center relative py-2">
                  <svg className="w-full max-w-[340px] h-[280px] overflow-visible" viewBox="0 0 280 280">
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

                    {/* Member Filled Radar Polygon */}
                    <polygon
                      points={radarPolygonPoints}
                      fill="rgba(99, 102, 241, 0.3)"
                      stroke="#4f46e5"
                      strokeWidth={2.5}
                      className="transition-all duration-300"
                    />

                    {/* Vertices */}
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

                    {/* Domain Labels around perimeter */}
                    {memberDomainStats.map((p, idx) => {
                      const labelRadius = radarRadius + 20;
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

                {/* Highlights */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="p-3 bg-emerald-50/90 rounded-xl border border-emerald-200">
                    <span className="text-[10px] font-bold uppercase text-emerald-800 block">
                      🏆 Domain Thế Mạnh Hàng Đầu:
                    </span>
                    <span className="font-bold text-slate-900 text-xs mt-0.5 block">
                      {sortedMemberDomains[0]?.domain} ({sortedMemberDomains[0]?.avgScore} / 2.0)
                    </span>
                    <span className="text-[11px] text-emerald-700 mt-1 block">
                      Đã hoàn thành {sortedMemberDomains[0]?.l2Count} / {sortedMemberDomains[0]?.totalSkills} bài Lab L2.
                    </span>
                  </div>

                  <div className="p-3 bg-indigo-50/90 rounded-xl border border-indigo-200">
                    <span className="text-[10px] font-bold uppercase text-indigo-800 block">
                      🚀 Phân Khúc Tiềm Năng Nâng Cấp:
                    </span>
                    <span className="font-bold text-slate-900 text-xs mt-0.5 block">
                      {sortedMemberDomains[sortedMemberDomains.length - 1]?.domain} ({sortedMemberDomains[sortedMemberDomains.length - 1]?.avgScore} / 2.0)
                    </span>
                    <span className="text-[11px] text-indigo-700 mt-1 block">
                      Ưu tiên cấp tài nguyên Lab để lên mức L2.
                    </span>
                  </div>
                </div>

                {/* Over-allocation & Responsibility Mini Card */}
                <div className={`p-4 rounded-xl border flex flex-wrap items-center justify-between gap-3 ${
                  allocationLevel === 'critical'
                    ? 'bg-rose-50/90 border-rose-200 text-rose-950'
                    : allocationLevel === 'high'
                    ? 'bg-amber-50/90 border-amber-200 text-amber-950'
                    : 'bg-indigo-50/70 border-indigo-200/80 text-indigo-950'
                }`}>
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl text-white ${
                      allocationLevel === 'critical' ? 'bg-rose-600 animate-pulse' : allocationLevel === 'high' ? 'bg-amber-600' : 'bg-indigo-600'
                    }`}>
                      {allocationLevel === 'critical' ? <ShieldAlert className="w-4 h-4" /> : <Crown className="w-4 h-4" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs">
                          {allocationLevel === 'critical' 
                            ? '🚨 Cảnh Báo: Quá Tải Trách Nhiệm Owner/SME' 
                            : allocationLevel === 'high'
                            ? '⚠️ Tải Trọng Trách Nhiệm Cao'
                            : 'Trách Nhiệm Chủ Quản & Chuyên Gia'}
                        </span>
                        <span className="font-extrabold font-mono text-xs">
                          ({primarySkills.length} kỹ năng)
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-0.5">
                        {ownedSkills.length} Owner · {smeSkills.length} SME · {spofResponsibleSkills.length > 0 ? `${spofResponsibleSkills.length} kỹ năng thiếu Backup` : 'Đã có Backup đầy đủ'}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveTab('responsibilities')}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white border border-slate-300 shadow-2xs hover:bg-slate-50 transition-colors text-slate-800 inline-flex items-center gap-1 cursor-pointer"
                  >
                    <span>Xem Phân Bổ Tải</span>
                    <ExternalLink className="w-3 h-3 text-slate-500" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 1: RESPONSIBILITY WORKLOAD & OVER-ALLOCATION VISUALIZATION */}
          {activeTab === 'responsibilities' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* 1. Overall Workload & Over-allocation Status Banner */}
              <div className={`p-4 rounded-2xl border ${
                allocationLevel === 'critical'
                  ? 'bg-rose-50 border-rose-200 text-rose-950'
                  : allocationLevel === 'high'
                  ? 'bg-amber-50 border-amber-200 text-amber-950'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-950'
              }`}>
                <div className="flex items-start gap-3">
                  <div className={`p-2.5 rounded-xl shrink-0 ${
                    allocationLevel === 'critical'
                      ? 'bg-rose-600 text-white'
                      : allocationLevel === 'high'
                      ? 'bg-amber-600 text-white'
                      : 'bg-emerald-600 text-white'
                  }`}>
                    {allocationLevel === 'critical' ? (
                      <ShieldAlert className="w-5 h-5 animate-pulse" />
                    ) : allocationLevel === 'high' ? (
                      <AlertTriangle className="w-5 h-5" />
                    ) : (
                      <Shield className="w-5 h-5" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h4 className="font-extrabold text-sm flex items-center gap-2">
                        <span>
                          {allocationLevel === 'critical' 
                            ? 'CẢNH BÁO QUÁ TẢI TRÁCH NHIỆM (CRITICAL OVER-ALLOCATION)' 
                            : allocationLevel === 'high' 
                            ? 'CẢNH BÁO TẢI TRÁCH NHIỆM CAO (HIGH WORKLOAD ALLOCATION)' 
                            : 'MỨC ĐỘ PHÂN BỔ TRÁCH NHIỆM CÂN ĐỐI (BALANCED ALLOCATION)'}
                        </span>
                      </h4>
                      <span className={`px-2.5 py-0.5 text-[11px] font-bold rounded-full ${
                        allocationLevel === 'critical'
                          ? 'bg-rose-600 text-white'
                          : allocationLevel === 'high'
                          ? 'bg-amber-600 text-white'
                          : 'bg-emerald-700 text-white'
                      }`}>
                        {primarySkills.length} Kỹ Năng Trọng Yếu
                      </span>
                    </div>
                    <p className="text-xs mt-1.5 leading-relaxed text-slate-700">
                      {allocationLevel === 'critical'
                        ? `Kỹ sư ${member.name} hiện đang đảm nhiệm vai trò Chủ Quản (Owner) hoặc Chuyên Gia (SME) cho ${primarySkills.length} kỹ năng (chiếm ${Math.round((primarySkills.length / skills.length) * 100)}% tổng số kỹ năng toàn đội ngũ). Khối lượng trách nhiệm này vượt quá ngưỡng khuyến nghị (tối đa 15-20 kỹ năng), tạo thành điểm nghẽn nghiêm trọng (Single Point of Failure - SPOF) và rủi ro quá tải cho nhân sự.`
                        : allocationLevel === 'high'
                        ? `Kỹ sư ${member.name} đang phụ trách ${primarySkills.length} kỹ năng ở mức trọng yếu. Khối lượng trách nhiệm khá dày đặc, cần chủ động phân công nhân sự Backup và chia sẻ tài liệu vận hành để giảm thiểu rủi ro khi có sự cố đồng thời.`
                        : `Kỹ sư ${member.name} đang phụ trách ${primarySkills.length} kỹ năng, nằm trong khoảng tối ưu (≤ 10 kỹ năng). Đảm bảo sự tập trung chuyên môn sâu, ít rủi ro phân tán năng lực và độ sẵn sàng cao.`
                      }
                    </p>
                    {allocationLevel === 'critical' && (
                      <div className="mt-2.5 p-2.5 bg-white/80 rounded-xl border border-rose-300 text-[11px] text-rose-800 font-medium flex items-center gap-2">
                        <Info className="w-4 h-4 shrink-0 text-rose-600" />
                        <span>
                          <strong>Khuyến nghị của Lead:</strong> Xem xét chuyển giao bớt vai trò Owner/SME cho các kỹ năng đã có nhân sự khác đạt mức L1/L2, hoặc đào tạo khẩn cấp Backup để giảm bớt áp lực gánh team.
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Visual Capacity Meter / Gauge Bar */}
                <div className="mt-4 pt-3 border-t border-slate-200/70 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-semibold">
                    <span className="text-slate-700 flex items-center gap-1.5">
                      <Gauge className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Thước đo tải trọng trách nhiệm (Over-allocation Capacity Meter):</span>
                    </span>
                    <span className="font-mono text-slate-900 font-bold">
                      {primarySkills.length} / 30 max ({Math.min(100, Math.round((primarySkills.length / 30) * 100))}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-200/80 rounded-full h-3 overflow-hidden p-0.5 border border-slate-300/80 flex gap-0.5">
                    {/* Segment 1: Safe 0-10 */}
                    <div className="h-full rounded-l-full bg-emerald-500 transition-all" style={{ width: `${Math.min(33.3, (Math.min(primarySkills.length, 10) / 30) * 100)}%` }} />
                    {/* Segment 2: Warning 11-20 */}
                    <div className="h-full bg-amber-500 transition-all" style={{ width: `${Math.min(33.3, (Math.max(0, Math.min(primarySkills.length - 10, 10)) / 30) * 100)}%` }} />
                    {/* Segment 3: Critical >20 */}
                    <div className="h-full rounded-r-full bg-rose-500 transition-all" style={{ width: `${Math.min(33.4, (Math.max(0, primarySkills.length - 20) / 30) * 100)}%` }} />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-0.5">
                    <span className="text-emerald-700 font-bold">0 - 10 (Cân đối)</span>
                    <span className="text-amber-700 font-bold">11 - 20 (Tải cao)</span>
                    <span className="text-rose-700 font-bold">&gt; 20 (Quá tải SPOF)</span>
                  </div>
                </div>
              </div>

              {/* 2. Key KPI Breakdown Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div 
                  onClick={() => setRespFilter(respFilter === 'owner' ? 'all' : 'owner')}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    respFilter === 'owner' ? 'bg-indigo-50 border-indigo-300 ring-2 ring-indigo-500/20 shadow-xs' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span className="text-slate-500 block text-[10px] font-bold uppercase tracking-wider">👑 Chủ Quản (Owner)</span>
                  <strong className="text-indigo-700 text-2xl font-black tabular-nums block mt-0.5">
                    {ownedSkills.length}
                  </strong>
                  <span className="text-[10px] text-slate-500">Chịu trách nhiệm kiến trúc</span>
                </div>

                <div 
                  onClick={() => setRespFilter(respFilter === 'sme' ? 'all' : 'sme')}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    respFilter === 'sme' ? 'bg-purple-50 border-purple-300 ring-2 ring-purple-500/20 shadow-xs' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span className="text-slate-500 block text-[10px] font-bold uppercase tracking-wider">🌟 Chuyên Gia (SME)</span>
                  <strong className="text-purple-700 text-2xl font-black tabular-nums block mt-0.5">
                    {smeSkills.length}
                  </strong>
                  <span className="text-[10px] text-slate-500">Xử lý sự cố khó nhất</span>
                </div>

                <div 
                  onClick={() => setRespFilter(respFilter === 'dual' ? 'all' : 'dual')}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    respFilter === 'dual' ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-500/20 shadow-xs' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span className="text-slate-500 block text-[10px] font-bold uppercase tracking-wider">👑🌟 Kiêm Cả 2</span>
                  <strong className="text-amber-700 text-2xl font-black tabular-nums block mt-0.5">
                    {dualRoleSkills.length}
                  </strong>
                  <span className="text-[10px] text-slate-500">Vừa Owner vừa SME</span>
                </div>

                <div 
                  onClick={() => setRespFilter(respFilter === 'spof' ? 'all' : 'spof')}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    respFilter === 'spof' ? 'bg-rose-50 border-rose-300 ring-2 ring-rose-500/20 shadow-xs' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span className="text-slate-500 block text-[10px] font-bold uppercase tracking-wider">⚠️ Thiếu Backup</span>
                  <strong className={`text-2xl font-black tabular-nums block mt-0.5 ${spofResponsibleSkills.length > 0 ? 'text-rose-600' : 'text-slate-400'}`}>
                    {spofResponsibleSkills.length}
                  </strong>
                  <span className="text-[10px] text-slate-500">Rủi ro 1 người duy nhất</span>
                </div>
              </div>

              {/* 3. Domain-level Allocation Distribution (Bar chart visualization) */}
              <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/90 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="font-bold text-slate-900 text-xs flex items-center gap-1.5 uppercase tracking-wider">
                      <Layers className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Phân Bổ Vai Trò Trọng Yếu Theo Nhóm Công Nghệ (Domains Distribution)</span>
                    </h5>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Các mảng công nghệ mà {member.name} đang giữ vai trò Owner hoặc SME
                    </p>
                  </div>
                  <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-lg">
                    {responsibilityByDomain.length} Domains liên quan
                  </span>
                </div>

                <div className="space-y-2.5 pt-1">
                  {responsibilityByDomain.map(item => {
                    const isHeavyDomain = item.totalCritical >= 4;
                    const maxVal = Math.max(1, item.ownerCount + item.smeCount + item.backupCount);
                    return (
                      <div key={item.domain} className="p-3 rounded-xl bg-white border border-slate-200/80 shadow-2xs space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2 truncate pr-2">
                            <span className="font-bold text-slate-900 truncate">{item.domain}</span>
                            {isHeavyDomain && (
                              <span className="px-2 py-0.2 text-[9px] font-extrabold rounded-md bg-rose-100 text-rose-800 border border-rose-200 shrink-0">
                                Tải trọng lớn ({item.totalCritical} kỹ năng)
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-[11px] shrink-0 font-medium">
                            {item.ownerCount > 0 && (
                              <span className="text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200 font-semibold">
                                {item.ownerCount} Owner
                              </span>
                            )}
                            {item.smeCount > 0 && (
                              <span className="text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200 font-semibold">
                                {item.smeCount} SME
                              </span>
                            )}
                            {item.backupCount > 0 && (
                              <span className="text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200 font-semibold">
                                {item.backupCount} Backup
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Progress bar representing proportion */}
                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden flex gap-0.5">
                          <div 
                            className="bg-indigo-600 h-full rounded-l-full" 
                            style={{ width: `${(item.ownerCount / maxVal) * 100}%` }} 
                            title={`Owner: ${item.ownerCount}`}
                          />
                          <div 
                            className="bg-purple-600 h-full" 
                            style={{ width: `${(item.smeCount / maxVal) * 100}%` }} 
                            title={`SME: ${item.smeCount}`}
                          />
                          <div 
                            className="bg-teal-500 h-full rounded-r-full" 
                            style={{ width: `${(item.backupCount / maxVal) * 100}%` }} 
                            title={`Backup: ${item.backupCount}`}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 4. Filterable List of Responsible Skills */}
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-2">
                  <h5 className="font-bold text-slate-900 text-xs flex items-center gap-1.5 uppercase tracking-wider">
                    <Briefcase className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Danh Sách Kỹ Năng Phụ Trách ({filteredRespSkills.length})</span>
                  </h5>

                  {/* Filter Pills */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setRespFilter('all')}
                      className={`px-2 py-1 text-[11px] font-bold rounded-lg transition-colors cursor-pointer ${
                        respFilter === 'all' ? 'bg-indigo-600 text-white shadow-2xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Tất Cả ({primarySkills.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setRespFilter('owner')}
                      className={`px-2 py-1 text-[11px] font-bold rounded-lg transition-colors cursor-pointer ${
                        respFilter === 'owner' ? 'bg-indigo-600 text-white shadow-2xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Chỉ Owner ({ownedSkills.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setRespFilter('sme')}
                      className={`px-2 py-1 text-[11px] font-bold rounded-lg transition-colors cursor-pointer ${
                        respFilter === 'sme' ? 'bg-purple-600 text-white shadow-2xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Chỉ SME ({smeSkills.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setRespFilter('dual')}
                      className={`px-2 py-1 text-[11px] font-bold rounded-lg transition-colors cursor-pointer ${
                        respFilter === 'dual' ? 'bg-amber-600 text-white shadow-2xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Kiêm Cả 2 ({dualRoleSkills.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setRespFilter('spof')}
                      className={`px-2 py-1 text-[11px] font-bold rounded-lg transition-colors cursor-pointer ${
                        respFilter === 'spof' ? 'bg-rose-600 text-white shadow-2xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Thiếu Backup ({spofResponsibleSkills.length})
                    </button>
                  </div>
                </div>

                {filteredRespSkills.length === 0 ? (
                  <div className="p-6 text-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                    Không có kỹ năng nào phù hợp với bộ lọc đã chọn.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[320px] overflow-y-auto pr-1">
                    {filteredRespSkills.map(s => {
                      const isOwner = s.owner === member.name;
                      const isSME = s.sme === member.name;
                      const hasBackup = Boolean(s.backup);
                      const myLvl = s.ratings[member.name] || 'L0';
                      const def = COMPETENCY_DEFINITIONS[myLvl] || COMPETENCY_DEFINITIONS['L0'];

                      return (
                        <div 
                          key={s.id} 
                          className="p-3 rounded-xl bg-white border border-slate-200 hover:border-indigo-300 transition-all shadow-2xs flex flex-col justify-between gap-2"
                        >
                          <div>
                            <div className="flex items-start justify-between gap-2">
                              <span className="font-bold text-slate-900 text-xs block leading-snug">{s.skill}</span>
                              <span className={`px-2 py-0.5 rounded font-bold text-[10px] shrink-0 border ${def.bgClass} ${def.textClass} ${def.borderClass}`}>
                                {myLvl}
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-500 block mt-0.5">{s.domain}</span>
                          </div>

                          <div className="flex flex-wrap items-center justify-between gap-1.5 pt-1.5 border-t border-slate-100 text-[10px]">
                            <div className="flex items-center gap-1">
                              {isOwner && (
                                <span className="px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold">
                                  👑 Owner
                                </span>
                              )}
                              {isSME && (
                                <span className="px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200 font-bold">
                                  🌟 SME
                                </span>
                              )}
                            </div>

                            <div>
                              {hasBackup ? (
                                <span className="text-slate-600 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200">
                                  Backup: <strong>{s.backup}</strong>
                                </span>
                              ) : (
                                <span className="text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200 font-bold">
                                  ⚠️ Chưa có Backup
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: BADGES & ACHIEVEMENTS */}
          {activeTab === 'badges' && (
            <div className="space-y-6">
              {/* Quick Metrics Grid */}
              <div className="grid grid-cols-4 gap-2.5 text-center">
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <span className="text-slate-500 block text-[10px] mb-0.5 font-medium">Chuyên Gia (SME)</span>
                  <strong className="text-purple-700 text-lg font-bold tabular-nums block">
                    {smeSkills.length}
                  </strong>
                  <span className="text-[9px] text-slate-400">Giỏi nhất</span>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <span className="text-slate-500 block text-[10px] mb-0.5 font-medium">Phụ Trách (Owner)</span>
                  <strong className="text-indigo-700 text-lg font-bold tabular-nums block">
                    {ownedSkills.length}
                  </strong>
                  <span className="text-[9px] text-slate-400">Chịu trách nhiệm</span>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <span className="text-slate-500 block text-[10px] mb-0.5 font-medium">Dự Phòng (Backup)</span>
                  <strong className="text-teal-700 text-lg font-bold tabular-nums block">
                    {backupSkills.length}
                  </strong>
                  <span className="text-[9px] text-slate-400">Hỗ trợ 24/7</span>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <span className="text-slate-500 block text-[10px] mb-0.5 font-medium">Đã Làm Thực Tế (L2)</span>
                  <strong className="text-emerald-700 text-lg font-bold tabular-nums block">
                    {l2Skills.length}
                  </strong>
                  <span className="text-[9px] text-slate-400">Tự chủ triển khai</span>
                </div>
              </div>

              {/* 1. Unlocked Badges Grid */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b pb-1.5">
                  <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5 uppercase tracking-wider">
                    <Trophy className="w-4 h-4 text-amber-500" />
                    <span>Huy Hiệu Đã Đạt Được ({gamification.unlockedBadges.length})</span>
                  </h4>
                  <span className="text-[11px] text-emerald-700 font-semibold">
                    Đã mở khóa toàn bộ quyền lợi & điểm thưởng
                  </span>
                </div>

                {gamification.unlockedBadges.length === 0 ? (
                  <div className="p-6 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300 text-slate-400">
                    <Award className="w-8 h-8 mx-auto mb-1 text-slate-300" />
                    <p className="font-semibold text-xs">Chưa có huy hiệu nào được mở khóa</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Hãy tiếp tục hoàn thành các bài Lab thực tế (L2) và nhận phân công dự án để đạt các huy hiệu bên dưới!
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {gamification.unlockedBadges.map(badge => (
                      <div
                        key={badge.id}
                        className={`p-3.5 rounded-xl border shadow-2xs flex items-start gap-3 bg-white transition-all hover:shadow-md ${badge.colorClass.border}`}
                      >
                        <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-xl shrink-0 shadow-2xs">
                          {badge.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <h5 className="font-bold text-slate-900 text-xs truncate">
                              {badge.name}
                            </h5>
                            <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 border border-emerald-300 shrink-0">
                              Đã Đạt
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                            {badge.description}
                          </p>
                          <div className="mt-2 text-[10px] text-slate-500 flex items-center gap-1 font-medium bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                            <Sparkles className="w-3 h-3 text-amber-500 shrink-0" />
                            <span className="truncate">{badge.requirementText}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 2. In-Progress / Locked Badges Grid */}
              {gamification.lockedBadges.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b pb-1.5">
                    <h4 className="font-bold text-slate-700 text-xs flex items-center gap-1.5 uppercase tracking-wider">
                      <Lock className="w-4 h-4 text-slate-400" />
                      <span>Huy Hiệu Đang Chinh Phục ({gamification.lockedBadges.length})</span>
                    </h4>
                    <span className="text-[11px] text-slate-400">
                      Theo dõi tiến độ hoàn thành các tiêu chí
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {gamification.lockedBadges.map(badge => {
                      const percent = Math.round((badge.progress / badge.maxProgress) * 100);
                      return (
                        <div
                          key={badge.id}
                          className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 flex items-start gap-3 opacity-80 hover:opacity-100 transition-opacity"
                        >
                          <div className="w-10 h-10 rounded-xl bg-slate-200/80 flex items-center justify-center text-xl grayscale shrink-0">
                            {badge.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <h5 className="font-bold text-slate-800 text-xs truncate">
                                {badge.name}
                              </h5>
                              <span className="text-[10px] font-mono font-bold text-slate-600 shrink-0">
                                {badge.progress} / {badge.maxProgress}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                              {badge.description}
                            </p>

                            {/* Progress bar */}
                            <div className="mt-2 space-y-1">
                              <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                                <div
                                  className="bg-indigo-500 h-full rounded-full transition-all duration-300"
                                  style={{ width: `${percent}%` }}
                                />
                              </div>
                              <span className="text-[10px] text-slate-400 block truncate">
                                Mục tiêu: {badge.requirementText}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: SKILLS PROFICIENCY */}
          {activeTab === 'skills' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">
                  Danh sách kỹ năng đã hoàn thành bài Lab thực tế (Mức L2):
                </span>
                <span className="text-xs text-slate-500">
                  {l2Skills.length} kỹ năng thực chiến
                </span>
              </div>

              {l2Skills.length === 0 ? (
                <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                  Chưa có kỹ năng mức L2 nào được xác nhận.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {l2Skills.map(s => {
                    const def = COMPETENCY_DEFINITIONS[s.level] || COMPETENCY_DEFINITIONS['L2'];
                    const memberCert = s.memberEvidence?.[member.name] || s.evidence;
                    const isUrl = /^https?:\/\//i.test(memberCert || '');

                    return (
                      <div
                        key={s.id}
                        className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start justify-between gap-2 hover:bg-white hover:border-indigo-300 transition-all shadow-2xs"
                      >
                        <div className="min-w-0">
                          <span className="font-bold text-slate-900 block truncate text-xs">{s.skill}</span>
                          <span className="text-[10px] text-slate-500 block mt-0.5">{s.domain}</span>
                          {memberCert && (
                            <div className="mt-1.5 text-[10px] text-indigo-700 flex items-center gap-1 font-medium truncate">
                              <Sparkles className="w-3 h-3 text-amber-500 shrink-0" />
                              <span className="truncate">Chứng nhận: {memberCert}</span>
                            </div>
                          )}
                        </div>
                        <span className={`px-2 py-0.5 rounded font-bold text-[11px] shrink-0 border ${def.bgClass} ${def.textClass} ${def.borderClass}`}>
                          {s.level}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: PROJECT CONTRIBUTIONS */}
          {activeTab === 'projects' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">
                  Dự án doanh nghiệp đang tham gia đóng góp:
                </span>
                <span className="text-xs text-slate-500">
                  {memberProjects.length} dự án
                </span>
              </div>

              {memberProjects.length === 0 ? (
                <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                  Hiện chưa được phân bổ vào dự án thực tế nào.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {memberProjects.map(p => (
                    <div key={p.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-xs">
                            [{p.code}] {p.name}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            p.lead === member.name
                              ? 'bg-purple-100 text-purple-900 border border-purple-200'
                              : 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                          }`}>
                            {p.lead === member.name ? '👑 Trưởng Dự Án (Lead)' : 'Kỹ Sư Triển Khai'}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-500 block mt-0.5">
                          Khách hàng: <strong>{p.client}</strong> · Thời hạn: {p.startDate} ➔ {p.targetDate}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-600 bg-white px-2.5 py-1 rounded-lg border border-slate-200 font-medium">
                        {p.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onFilterMember(member.name);
                onClose();
              }}
              className="px-3.5 py-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors border border-indigo-200"
            >
              Lọc bảng Ma Trận cho kỹ sư {member.name}
            </button>

            {onEditMember && (
              <button
                type="button"
                onClick={() => onEditMember(member)}
                className="px-3 py-1.5 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 rounded-lg transition-colors border border-slate-300 inline-flex items-center gap-1.5"
              >
                <UserCog className="w-3.5 h-3.5 text-indigo-600" />
                <span>Chỉnh Sửa Thông Tin</span>
              </button>
            )}
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
