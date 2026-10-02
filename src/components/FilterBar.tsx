import React from 'react';
import { CompetencyLevel, FilterOptions, Project, SkillItem, TeamMember } from '../types/skills';
import { Search, X, RotateCcw, Filter, Briefcase, User, Layers, ShieldCheck, AlertTriangle } from 'lucide-react';

interface FilterBarProps {
  filter: FilterOptions;
  setFilter: React.Dispatch<React.SetStateAction<FilterOptions>>;
  domains: string[];
  members: TeamMember[];
  projects: Project[];
  totalCount: number;
  filteredCount: number;
  skills?: SkillItem[];
  onReset: () => void;
  onOpenManageDomains?: () => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filter,
  setFilter,
  domains,
  members,
  projects,
  totalCount,
  filteredCount,
  skills,
  onReset,
  onOpenManageDomains
}) => {
  const isFiltered =
    filter.searchQuery !== '' ||
    filter.selectedDomain !== 'all' ||
    filter.selectedMember !== 'all' ||
    filter.selectedProject !== 'all' ||
    filter.minLevel !== 'all' ||
    filter.roleStatus !== 'all';

  // Compute live counts for SPOF risk categories
  const spofCount = skills ? skills.filter(s => (s.sme || s.owner) && !s.backup).length : 0;
  const noBackupCount = skills ? skills.filter(s => !s.backup).length : 0;
  const noSmeCount = skills ? skills.filter(s => !s.sme).length : 0;
  const noOwnerCount = skills ? skills.filter(s => !s.owner).length : 0;

  return (
    <div className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-2xs mb-6 no-print">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* 1. Search Query */}
        <div className="relative">
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Tìm Kiếm Kỹ Năng
          </label>
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
            <input
              type="text"
              value={filter.searchQuery}
              onChange={e => setFilter(prev => ({ ...prev, searchQuery: e.target.value }))}
              placeholder="VD: VMware, Kubernetes, BGP, Palo Alto..."
              className="w-full pl-9 pr-8 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
            {filter.searchQuery && (
              <button
                onClick={() => setFilter(prev => ({ ...prev, searchQuery: '' }))}
                className="absolute right-2.5 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* 2. Filter by Domain */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-semibold text-slate-700 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-slate-400" />
              <span>Phân Khúc Domain ({domains.length})</span>
            </label>
            {onOpenManageDomains && (
              <button
                type="button"
                onClick={onOpenManageDomains}
                className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 hover:underline"
                title="Thêm/Sửa/Đổi tên/Xóa danh mục Domain"
              >
                + Quản lý
              </button>
            )}
          </div>
          <select
            value={filter.selectedDomain}
            onChange={e => setFilter(prev => ({ ...prev, selectedDomain: e.target.value }))}
            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
          >
            <option value="all">Tất cả Phân khúc ({domains.length} Domains)</option>
            {domains.map(d => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        {/* 3. Filter by Team Member */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
            <User className="w-3.5 h-3.5 text-slate-400" />
            <span>Thành Viên Nhân Sự</span>
          </label>
          <select
            value={filter.selectedMember}
            onChange={e => setFilter(prev => ({ ...prev, selectedMember: e.target.value }))}
            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
          >
            <option value="all">Tất cả Thành viên ({members.length} người)</option>
            {members.map(m => (
              <option key={m.name} value={m.name}>
                {m.name}
              </option>
            ))}
          </select>
        </div>

        {/* 4. Filter by Project */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
            <Briefcase className="w-3.5 h-3.5 text-slate-400" />
            <span>Dự Án Áp Dụng</span>
          </label>
          <select
            value={filter.selectedProject}
            onChange={e => setFilter(prev => ({ ...prev, selectedProject: e.target.value }))}
            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
          >
            <option value="all">Tất cả Dự án (Hiện toàn bộ)</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>
                [{p.code}] {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Quick SPOF & Role Risk Filters Strip */}
      <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1 mr-1">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
            <span>Lọc Nhanh Rủi Ro SPOF:</span>
          </span>

          <button
            type="button"
            onClick={() => setFilter(prev => ({ ...prev, roleStatus: 'all' }))}
            className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border transition-all ${
              filter.roleStatus === 'all'
                ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            Tất Cả ({totalCount})
          </button>

          <button
            type="button"
            onClick={() => setFilter(prev => ({ ...prev, roleStatus: 'risk_spof' }))}
            className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border transition-all flex items-center gap-1 cursor-pointer ${
              filter.roleStatus === 'risk_spof'
                ? 'bg-amber-500 text-slate-950 border-amber-600 font-extrabold shadow-2xs'
                : 'bg-amber-50 text-amber-900 border-amber-200/90 hover:bg-amber-100'
            }`}
            title="Kỹ năng chỉ có 1 người phụ trách, không có người dự phòng"
          >
            <span>⚠️ Rủi Ro SPOF (Chỉ 1 người)</span>
            {(spofCount > 0 || noBackupCount > 0) && (
              <span className="px-1.5 py-0.2 text-[10px] bg-amber-200/90 text-amber-950 rounded font-black tabular-nums">
                {spofCount || noBackupCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setFilter(prev => ({ ...prev, roleStatus: 'no_sme' }))}
            className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border transition-all flex items-center gap-1 cursor-pointer ${
              filter.roleStatus === 'no_sme'
                ? 'bg-rose-600 text-white border-rose-700 font-extrabold shadow-2xs'
                : 'bg-rose-50 text-rose-900 border-rose-200/90 hover:bg-rose-100'
            }`}
            title="Kỹ năng chưa có chuyên gia mức L2 hỗ trợ"
          >
            <span>🔴 Chưa Có SME</span>
            {noSmeCount > 0 && (
              <span className="px-1.5 py-0.2 text-[10px] bg-rose-200/90 text-rose-950 rounded font-black tabular-nums">
                {noSmeCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setFilter(prev => ({ ...prev, roleStatus: 'no_backup' }))}
            className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border transition-all flex items-center gap-1 cursor-pointer ${
              filter.roleStatus === 'no_backup'
                ? 'bg-orange-500 text-white border-orange-600 font-extrabold shadow-2xs'
                : 'bg-orange-50 text-orange-900 border-orange-200/90 hover:bg-orange-100'
            }`}
            title="Kỹ năng chưa gán nhân sự dự phòng (Backup)"
          >
            <span>🛡️ Chưa Có Backup</span>
            {noBackupCount > 0 && (
              <span className="px-1.5 py-0.2 text-[10px] bg-orange-200/90 text-orange-950 rounded font-black tabular-nums">
                {noBackupCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setFilter(prev => ({ ...prev, roleStatus: 'no_owner' }))}
            className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border transition-all flex items-center gap-1 cursor-pointer ${
              filter.roleStatus === 'no_owner'
                ? 'bg-purple-600 text-white border-purple-700 font-extrabold shadow-2xs'
                : 'bg-purple-50 text-purple-900 border-purple-200/90 hover:bg-purple-100'
            }`}
            title="Kỹ năng chưa có người phụ trách chính (Owner)"
          >
            <span>👑 Chưa Có Owner</span>
            {noOwnerCount > 0 && (
              <span className="px-1.5 py-0.2 text-[10px] bg-purple-200/90 text-purple-950 rounded font-black tabular-nums">
                {noOwnerCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setFilter(prev => ({ ...prev, roleStatus: 'fully_covered' }))}
            className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border transition-all flex items-center gap-1 cursor-pointer ${
              filter.roleStatus === 'fully_covered'
                ? 'bg-emerald-600 text-white border-emerald-700 font-extrabold shadow-2xs'
                : 'bg-emerald-50 text-emerald-900 border-emerald-200/90 hover:bg-emerald-100'
            }`}
            title="Kỹ năng có đủ Owner + Backup + SME"
          >
            <span>✅ Đủ Đội Ngũ</span>
          </button>
        </div>

        {/* Counter and Reset */}
        <div className="flex items-center gap-3 text-xs">
          <span className="text-slate-500">
            Hiển thị <strong className="text-slate-900 font-semibold tabular-nums">{filteredCount}</strong> / {totalCount} kỹ năng
          </span>

          {isFiltered && (
            <button
              onClick={onReset}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-md transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Xóa bộ lọc</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
