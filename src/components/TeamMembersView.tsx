import React, { useState } from 'react';
import { Project, SkillItem, TeamMember } from '../types/skills';
import { COMPETENCY_DEFINITIONS } from '../data/initialData';
import { calculateEngineerGamification, EngineerGamificationProfile } from '../utils/gamificationUtils';
import { 
  Users, 
  Shield, 
  CheckCircle2, 
  ChevronRight, 
  Mail, 
  Award, 
  Trophy, 
  Sparkles, 
  Flame, 
  Zap, 
  Star,
  Layers,
  FolderKanban,
  UserCog,
  UserPlus,
  Briefcase
} from 'lucide-react';

interface TeamMembersViewProps {
  members: TeamMember[];
  skills: SkillItem[];
  projects?: Project[];
  onSelectMember: (member: TeamMember) => void;
  onFilterMemberInMatrix: (memberName: string) => void;
  onEditMember?: (member: TeamMember) => void;
  onAddNewMember?: () => void;
}

export const TeamMembersView: React.FC<TeamMembersViewProps> = ({
  members,
  skills,
  projects = [],
  onSelectMember,
  onFilterMemberInMatrix,
  onEditMember,
  onAddNewMember
}) => {
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<'all' | 'top_xp' | 'sme_leaders' | 'cloud' | 'network'>('all');

  // Compute gamification profiles for all members
  const memberProfiles = members.map(member => {
    const gamification = calculateEngineerGamification(member.name, skills, projects);
    let totalScore = 0;
    skills.forEach(s => {
      const lvl = s.ratings[member.name] || 'L0';
      totalScore += COMPETENCY_DEFINITIONS[lvl]?.score || 0;
    });
    const avgScore = (totalScore / (skills.length || 1)).toFixed(2);
    const ownerCount = skills.filter(s => s.owner === member.name).length;

    return {
      member,
      gamification,
      avgScore,
      ownerCount
    };
  });

  // Sort by total XP descending for Hall of Fame ranking
  const sortedByXP = [...memberProfiles].sort((a, b) => b.gamification.totalXP - a.gamification.totalXP);

  // Filter members based on selected filter
  const filteredProfiles = memberProfiles.filter(p => {
    if (selectedCategoryFilter === 'top_xp') {
      return p.gamification.totalXP >= 500;
    }
    if (selectedCategoryFilter === 'sme_leaders') {
      return p.gamification.smeCount >= 2 || p.gamification.projectLeadCount >= 1;
    }
    if (selectedCategoryFilter === 'cloud') {
      return p.gamification.unlockedBadges.some(b => b.id === 'cloud_architect');
    }
    if (selectedCategoryFilter === 'network') {
      return p.gamification.unlockedBadges.some(b => b.id === 'network_ninja');
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header with Gamification Summary */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-lg border border-indigo-900/50 flex flex-wrap items-center justify-between gap-4 no-print">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-slate-950 font-black text-2xl shadow-md border border-amber-300/40">
            <Trophy className="w-6 h-6 text-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Hệ Thống Huy Hiệu & Bảng Vinh Danh Năng Lực Kỹ Sư
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                Gamification & Badges
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Huy hiệu tự động trao thưởng dựa trên cấp độ thực chiến <strong>(L2)</strong>, phân công chuyên gia <strong>(SME/Backup)</strong> và đóng góp dự án thực tế.
            </p>
          </div>
        </div>

        {/* Quick Filter Chips */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-800/80 p-1 rounded-xl border border-slate-700/80 text-xs">
          <button
            type="button"
            onClick={() => setSelectedCategoryFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              selectedCategoryFilter === 'all'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Tất Cả ({members.length})
          </button>
          <button
            type="button"
            onClick={() => setSelectedCategoryFilter('top_xp')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1 ${
              selectedCategoryFilter === 'top_xp'
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>Top XP Cao</span>
          </button>
          <button
            type="button"
            onClick={() => setSelectedCategoryFilter('sme_leaders')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1 ${
              selectedCategoryFilter === 'sme_leaders'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Star className="w-3.5 h-3.5 text-purple-300" />
            <span>Chuyên Gia / Lead</span>
          </button>

          {onAddNewMember && (
            <button
              type="button"
              onClick={onAddNewMember}
              className="px-3 py-1.5 rounded-lg font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-all flex items-center gap-1 ml-1"
              title="Thêm kỹ sư / thành viên mới vào ma trận"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>+ Thêm Thành Viên</span>
            </button>
          )}
        </div>
      </div>

      {/* Top 3 Leaderboard Podium */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 no-print">
        {sortedByXP.slice(0, 3).map((item, rank) => {
          const rankColors = [
            { bg: 'from-amber-500/20 to-orange-500/10', border: 'border-amber-400/50', medal: '🥇 Hạng 1', text: 'text-amber-700' },
            { bg: 'from-slate-300/30 to-slate-400/10', border: 'border-slate-300', medal: '🥈 Hạng 2', text: 'text-slate-700' },
            { bg: 'from-amber-700/15 to-orange-800/10', border: 'border-amber-600/30', medal: '🥉 Hạng 3', text: 'text-amber-800' }
          ][rank];

          return (
            <div
              key={item.member.name}
              onClick={() => onSelectMember(item.member)}
              className={`p-4 rounded-2xl bg-gradient-to-b ${rankColors.bg} bg-white border ${rankColors.border} shadow-2xs hover:shadow-md transition-all cursor-pointer flex items-center justify-between group`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.member.avatarColor} flex items-center justify-center text-white font-bold text-lg shadow-sm shrink-0`}>
                  {item.member.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-black px-1.5 py-0.2 rounded-full bg-white shadow-2xs border border-slate-200">
                      {rankColors.medal}
                    </span>
                    <h4 className="font-bold text-slate-900 text-sm truncate group-hover:text-indigo-600 transition-colors">
                      {item.member.name}
                    </h4>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-600 block truncate mt-0.5">
                    {item.gamification.levelTitle}
                  </span>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="font-mono font-black text-indigo-700 text-base block tabular-nums">
                  {item.gamification.totalXP} <span className="text-[10px] font-bold text-slate-400">XP</span>
                </span>
                <span className="text-[10px] text-amber-700 font-bold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 inline-flex items-center gap-1">
                  <span>🏆 {item.gamification.unlockedBadges.length} Huy Hiệu</span>
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Engineer Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredProfiles.map(({ member, gamification, avgScore, ownerCount }) => {
          return (
            <div
              key={member.name}
              className="bg-white rounded-2xl border border-slate-200/90 hover:border-indigo-300 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
            >
              <div className="p-5 space-y-3.5">
                {/* Header Lockup */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-br ${member.avatarColor} flex items-center justify-center text-white font-extrabold text-lg shadow-sm shrink-0`}
                    >
                      {member.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-base group-hover:text-indigo-600 transition-colors leading-tight">
                        {member.name}
                      </h3>
                      <p className="text-[11px] text-slate-500 truncate max-w-[140px]">
                        {member.email}
                      </p>
                    </div>
                  </div>

                  {/* Level Tier Chip */}
                  <span className="px-2 py-0.5 text-[10px] font-black rounded-lg bg-indigo-50 text-indigo-800 border border-indigo-200 shrink-0">
                    Tier {gamification.levelTier}
                  </span>
                </div>

                {/* Level Title & XP Progress Bar */}
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800 text-[11px]">
                      {gamification.levelTitle}
                    </span>
                    <span className="font-mono font-bold text-indigo-700 text-[11px]">
                      {gamification.totalXP} <span className="text-[9px] text-slate-400">XP</span>
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-indigo-500 to-purple-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${gamification.levelProgressPercent}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-500">
                    <span>Tiến trình cấp bậc:</span>
                    <span>{gamification.levelProgressPercent}%</span>
                  </div>
                </div>

                {/* Unlocked Badges Showcase Strip */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-slate-700 flex items-center gap-1">
                      <Award className="w-3.5 h-3.5 text-amber-500" />
                      <span>Huy Hiệu Đạt Được ({gamification.unlockedBadges.length}):</span>
                    </span>
                  </div>

                  {gamification.unlockedBadges.length === 0 ? (
                    <div className="p-2 rounded-lg bg-slate-50 text-slate-400 text-[10px] italic border border-dashed border-slate-200 text-center">
                      Đang tích lũy kỹ năng L2 để mở khóa huy hiệu đầu tiên
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-1">
                      {gamification.unlockedBadges.map(badge => (
                        <span
                          key={badge.id}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border shadow-2xs ${badge.colorClass.chipBg}`}
                          title={`${badge.name}: ${badge.description} (${badge.requirementText})`}
                        >
                          <span>{badge.icon}</span>
                          <span className="truncate max-w-[120px]">{badge.name}</span>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Metrics Breakdown Grid */}
                <div className="grid grid-cols-4 gap-1.5 text-center text-[10px]">
                  <div className="p-1.5 rounded-lg bg-slate-50 border border-slate-200/80" title="Số kỹ năng đã làm thực tế thành công">
                    <span className="text-slate-500 block text-[9px]">L2 Lab</span>
                    <strong className="text-emerald-700 font-bold text-xs tabular-nums">
                      {gamification.l2Count}
                    </strong>
                  </div>
                  <div className="p-1.5 rounded-lg bg-slate-50 border border-slate-200/80" title="Số kỹ năng giữ vai trò Chuyên Gia">
                    <span className="text-slate-500 block text-[9px]">SME</span>
                    <strong className="text-purple-700 font-bold text-xs tabular-nums">
                      {gamification.smeCount}
                    </strong>
                  </div>
                  <div className="p-1.5 rounded-lg bg-slate-50 border border-slate-200/80" title="Số kỹ năng giữ vai trò Người Dự Phòng">
                    <span className="text-slate-500 block text-[9px]">Backup</span>
                    <strong className="text-teal-700 font-bold text-xs tabular-nums">
                      {gamification.backupCount}
                    </strong>
                  </div>
                  <div className="p-1.5 rounded-lg bg-slate-50 border border-slate-200/80" title="Số dự án thực tế tham gia">
                    <span className="text-slate-500 block text-[9px]">Dự án</span>
                    <strong className="text-indigo-700 font-bold text-xs tabular-nums">
                      {gamification.projectActiveCount}
                    </strong>
                  </div>
                </div>

                {/* Primary domains */}
                <div>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    Nhóm kỹ năng phụ trách
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {member.primaryDomains.slice(0, 3).map(d => (
                      <span
                        key={d}
                        className="text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-700 rounded font-medium truncate max-w-[150px]"
                      >
                        {d}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="p-3 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onSelectMember(member)}
                    className="font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors"
                  >
                    <span>Hồ Sơ</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>

                  {onEditMember && (
                    <button
                      onClick={() => onEditMember(member)}
                      className="px-2 py-0.5 rounded text-[11px] font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-300 transition-colors flex items-center gap-1"
                      title="Chỉnh sửa họ tên, chức danh, email, avatar..."
                    >
                      <UserCog className="w-3 h-3 text-slate-500" />
                      <span>Sửa</span>
                    </button>
                  )}
                </div>

                <button
                  onClick={() => onFilterMemberInMatrix(member.name)}
                  className="text-slate-500 hover:text-slate-800 text-[11px] underline font-medium"
                >
                  Lọc Ma Trận
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
