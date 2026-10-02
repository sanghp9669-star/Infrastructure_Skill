import React, { useState } from 'react';
import { CompetencyLevel, HeatmapConfig, SkillItem, TeamMember } from '../types/skills';
import { COMPETENCY_DEFINITIONS } from '../data/initialData';
import { DEFAULT_HEATMAP_CONFIG } from './HeatmapConfigModal';
import { 
  Check, 
  ChevronDown, 
  ChevronRight, 
  Edit3, 
  Shield, 
  AlertCircle, 
  Plus, 
  Sparkles, 
  ArrowDownUp, 
  Layers, 
  Zap, 
  BookOpen, 
  Flame, 
  Printer,
  Sliders,
  Settings2,
  Palette,
  History,
  GraduationCap,
  Clock,
  CheckSquare,
  Square,
  Users,
  UserCheck,
  X,
  CheckCircle2
} from 'lucide-react';

/**
 * Dynamic Heatmap visual encoding for Skill Matrix ratings (L0 - L2) supporting
 * customizable themes (classic, modern, risk, high_contrast), intensity, and display style.
 */
export const getHeatmapStyle = (
  level: CompetencyLevel | string,
  configInput: HeatmapConfig | boolean = true
) => {
  const config: HeatmapConfig = typeof configInput === 'boolean'
    ? { ...DEFAULT_HEATMAP_CONFIG, enabled: configInput }
    : configInput || DEFAULT_HEATMAP_CONFIG;

  if (!config.enabled) {
    const def = COMPETENCY_DEFINITIONS[level as CompetencyLevel] || COMPETENCY_DEFINITIONS['L0'];
    return {
      cellBg: 'bg-white',
      buttonClass: `${def.bgClass} ${def.textClass} ${def.borderClass} font-semibold`
    };
  }

  const { theme = 'classic', intensity = 'medium', displayStyle = 'both' } = config;

  if (theme === 'classic') {
    switch (level) {
      case 'L0':
        return {
          cellBg: displayStyle === 'button_only' ? 'bg-transparent group-hover:bg-slate-50/70' : 'bg-transparent group-hover:bg-slate-50/70',
          buttonClass: displayStyle === 'cell_only'
            ? 'text-slate-500 font-medium hover:text-slate-800'
            : 'bg-gradient-to-b from-slate-50 to-slate-100/80 text-slate-500 border border-slate-200/80 font-medium hover:border-slate-300 hover:text-slate-700 shadow-2xs'
        };
      case 'L1': {
        const cell = displayStyle === 'button_only'
          ? 'bg-transparent group-hover:bg-slate-50/70'
          : intensity === 'subtle'
          ? 'bg-gradient-to-b from-orange-50/25 to-amber-50/20 group-hover:from-orange-100/40 group-hover:to-amber-100/30'
          : intensity === 'vivid'
          ? 'bg-gradient-to-b from-orange-100/60 to-amber-100/50 group-hover:from-orange-200/60 group-hover:to-amber-200/50'
          : 'bg-gradient-to-b from-orange-50/45 to-amber-50/35 group-hover:from-orange-100/50 group-hover:to-amber-100/40';

        const btn = displayStyle === 'cell_only'
          ? 'text-orange-950 font-bold hover:underline'
          : intensity === 'subtle'
          ? 'bg-orange-50/80 text-orange-900 border border-orange-200/80 font-semibold hover:bg-orange-100 shadow-2xs'
          : intensity === 'vivid'
          ? 'bg-gradient-to-b from-orange-100 via-amber-200 to-orange-200 text-orange-950 border border-orange-400 font-bold hover:from-orange-200 hover:to-amber-300 shadow-xs'
          : 'bg-gradient-to-b from-orange-50 via-orange-100/70 to-orange-100 text-orange-900 border border-orange-200 font-semibold hover:from-orange-100 hover:to-orange-200 shadow-2xs';

        return { cellBg: cell, buttonClass: btn };
      }
      case 'L2':
      default: {
        const cell = displayStyle === 'button_only'
          ? 'bg-transparent group-hover:bg-slate-50/70'
          : intensity === 'subtle'
          ? 'bg-gradient-to-b from-emerald-50/30 to-green-50/20 group-hover:from-emerald-100/40 group-hover:to-green-100/30'
          : intensity === 'vivid'
          ? 'bg-gradient-to-b from-emerald-100/70 to-green-100/60 group-hover:from-emerald-200/70 group-hover:to-green-200/60'
          : 'bg-gradient-to-b from-emerald-50/50 to-green-50/40 group-hover:from-emerald-100/50 group-hover:to-green-100/40';

        const btn = displayStyle === 'cell_only'
          ? 'text-emerald-950 font-black hover:underline'
          : intensity === 'subtle'
          ? 'bg-emerald-50 text-emerald-900 border border-emerald-300 font-bold hover:bg-emerald-100 shadow-2xs'
          : intensity === 'vivid'
          ? 'bg-gradient-to-b from-emerald-100 via-green-200 to-emerald-200 text-emerald-950 border border-emerald-400 font-black hover:from-emerald-200 hover:to-green-300 shadow-xs ring-1 ring-emerald-400'
          : 'bg-gradient-to-b from-emerald-50 via-emerald-100/80 to-emerald-100 text-emerald-900 border border-emerald-300 font-bold hover:from-emerald-100 hover:to-emerald-200 shadow-2xs ring-1 ring-emerald-300/40';

        return { cellBg: cell, buttonClass: btn };
      }
    }
  }

  if (theme === 'modern') {
    switch (level) {
      case 'L0':
        return {
          cellBg: 'bg-transparent group-hover:bg-slate-50/70',
          buttonClass: 'bg-slate-100 text-slate-500 border border-slate-200 font-medium hover:text-slate-700'
        };
      case 'L1':
        return {
          cellBg: displayStyle === 'button_only' ? 'bg-transparent' : 'bg-gradient-to-b from-sky-50/40 to-blue-50/30 group-hover:from-sky-100/50',
          buttonClass: displayStyle === 'cell_only'
            ? 'text-sky-900 font-bold'
            : 'bg-gradient-to-b from-sky-50 to-blue-100 text-sky-900 border border-sky-300 font-semibold hover:from-sky-100 shadow-2xs'
        };
      case 'L2':
      default:
        return {
          cellBg: displayStyle === 'button_only' ? 'bg-transparent' : 'bg-gradient-to-b from-teal-50/50 to-emerald-50/40 group-hover:from-teal-100/50',
          buttonClass: displayStyle === 'cell_only'
            ? 'text-teal-900 font-black'
            : 'bg-gradient-to-b from-teal-50 to-emerald-100 text-teal-950 border border-teal-300 font-bold hover:from-teal-100 shadow-2xs ring-1 ring-teal-300/40'
        };
    }
  }

  if (theme === 'risk') {
    switch (level) {
      case 'L0':
        return {
          cellBg: displayStyle === 'button_only' ? 'bg-transparent' : 'bg-gradient-to-b from-rose-50/40 to-red-50/30 group-hover:from-rose-100/50',
          buttonClass: displayStyle === 'cell_only'
            ? 'text-rose-900 font-bold'
            : 'bg-gradient-to-b from-rose-50 to-rose-100 text-rose-900 border border-rose-300 font-bold hover:from-rose-100 shadow-2xs'
        };
      case 'L1':
        return {
          cellBg: displayStyle === 'button_only' ? 'bg-transparent' : 'bg-gradient-to-b from-amber-50/40 to-yellow-50/30 group-hover:from-amber-100/50',
          buttonClass: displayStyle === 'cell_only'
            ? 'text-amber-900 font-bold'
            : 'bg-gradient-to-b from-amber-50 to-amber-100 text-amber-900 border border-amber-300 font-semibold hover:from-amber-100 shadow-2xs'
        };
      case 'L2':
      default:
        return {
          cellBg: displayStyle === 'button_only' ? 'bg-transparent' : 'bg-gradient-to-b from-emerald-50/50 to-green-50/40 group-hover:from-emerald-100/50',
          buttonClass: displayStyle === 'cell_only'
            ? 'text-emerald-900 font-black'
            : 'bg-gradient-to-b from-emerald-50 to-emerald-100 text-emerald-950 border border-emerald-300 font-bold hover:from-emerald-100 shadow-2xs ring-1 ring-emerald-300/40'
        };
    }
  }

  // High contrast
  switch (level) {
    case 'L0':
      return {
        cellBg: 'bg-slate-100/80 group-hover:bg-slate-200/70',
        buttonClass: 'bg-slate-200 text-slate-900 border-2 border-slate-400 font-bold shadow-2xs'
      };
    case 'L1':
      return {
        cellBg: 'bg-amber-100/70 group-hover:bg-amber-200/70',
        buttonClass: 'bg-amber-300 text-amber-950 border-2 border-amber-500 font-black shadow-xs'
      };
    case 'L2':
    default:
      return {
        cellBg: 'bg-emerald-100/80 group-hover:bg-emerald-200/80',
        buttonClass: 'bg-emerald-400 text-emerald-950 border-2 border-emerald-600 font-black shadow-xs'
      };
  }
};

interface SkillMatrixTableProps {
  skills: SkillItem[];
  members: TeamMember[];
  onUpdateRating: (skillId: number, memberName: string, level: CompetencyLevel) => void;
  onUpdateRole: (skillId: number, field: 'owner' | 'backup' | 'sme', value: string) => void;
  groupByDomain: boolean;
  setGroupByDomain: (val: boolean) => void;
  onSelectMember?: (memberName: string) => void;
  onOpenAddSkill: () => void;
  onOpenCuratedModal: () => void;
  onOpenSortModal: () => void;
  onEditSkill: (skill: SkillItem) => void;
  onOpenManualSync?: () => void;
  onOpenCompetencyModal?: () => void;
  onOpenPrintModal?: () => void;
  heatmapConfig?: HeatmapConfig;
  onUpdateHeatmapConfig?: (config: HeatmapConfig) => void;
  onOpenHeatmapConfigModal?: () => void;
  onBatchRowRating?: (skillId: number, level: CompetencyLevel) => void;
  onBatchDomainRating?: (domain: string, level: CompetencyLevel) => void;
  onBulkSetLevel?: (skillIds: number[], targetMember: string | 'all', level: CompetencyLevel) => void;
  onBulkSetRole?: (skillIds: number[], roleField: 'owner' | 'backup' | 'sme', memberName: string) => void;
  onOpenAuditLog?: () => void;
  auditLogCount?: number;
  onOpenSkillRequests?: () => void;
  pendingRequestsCount?: number;
  onApprovePendingSkill?: (skillId: number) => void;
}

export const SkillMatrixTable: React.FC<SkillMatrixTableProps> = ({
  skills,
  members,
  onUpdateRating,
  onUpdateRole,
  groupByDomain,
  setGroupByDomain,
  onSelectMember,
  onOpenAddSkill,
  onOpenCuratedModal,
  onOpenSortModal,
  onEditSkill,
  onOpenManualSync,
  onOpenCompetencyModal,
  onOpenPrintModal,
  heatmapConfig,
  onUpdateHeatmapConfig,
  onOpenHeatmapConfigModal,
  onBatchRowRating,
  onBatchDomainRating,
  onBulkSetLevel,
  onBulkSetRole,
  onOpenAuditLog,
  auditLogCount,
  onOpenSkillRequests,
  pendingRequestsCount,
  onApprovePendingSkill
}) => {
  const [activeCell, setActiveCell] = useState<{ skillId: number; memberName: string } | null>(null);
  const [collapsedDomains, setCollapsedDomains] = useState<Record<string, boolean>>({});
  const [internalHeatmapMode, setInternalHeatmapMode] = useState<boolean>(true);

  // Multiple selection state
  const [selectedSkillIds, setSelectedSkillIds] = useState<number[]>([]);
  const [targetBulkMember, setTargetBulkMember] = useState<string>('all');
  const [bulkRoleField, setBulkRoleField] = useState<'owner' | 'backup' | 'sme'>('owner');
  const [bulkRoleMember, setBulkRoleMember] = useState<string>('');

  const handleToggleSelectSkill = (skillId: number) => {
    setSelectedSkillIds(prev =>
      prev.includes(skillId) ? prev.filter(id => id !== skillId) : [...prev, skillId]
    );
  };

  const handleToggleSelectAll = () => {
    const allVisibleIds = skills.map(s => s.id);
    const isAllSelected = allVisibleIds.length > 0 && allVisibleIds.every(id => selectedSkillIds.includes(id));
    if (isAllSelected) {
      setSelectedSkillIds(prev => prev.filter(id => !allVisibleIds.includes(id)));
    } else {
      setSelectedSkillIds(prev => Array.from(new Set([...prev, ...allVisibleIds])));
    }
  };

  const handleSelectDomainSkills = (domain: string) => {
    const domainIds = skills.filter(s => s.domain === domain).map(s => s.id);
    const isAllDomainSelected = domainIds.length > 0 && domainIds.every(id => selectedSkillIds.includes(id));
    if (isAllDomainSelected) {
      setSelectedSkillIds(prev => prev.filter(id => !domainIds.includes(id)));
    } else {
      setSelectedSkillIds(prev => Array.from(new Set([...prev, ...domainIds])));
    }
  };

  const handleApplyBulkLevel = (level: CompetencyLevel) => {
    if (onBulkSetLevel && selectedSkillIds.length > 0) {
      onBulkSetLevel(selectedSkillIds, targetBulkMember, level);
    }
  };

  const handleApplyBulkRole = (field: 'owner' | 'backup' | 'sme', memberName: string) => {
    if (onBulkSetRole && selectedSkillIds.length > 0) {
      onBulkSetRole(selectedSkillIds, field, memberName);
      setBulkRoleMember('');
    }
  };

  const handleClearSelection = () => {
    setSelectedSkillIds([]);
  };

  const effectiveHeatmapConfig = heatmapConfig || {
    ...DEFAULT_HEATMAP_CONFIG,
    enabled: internalHeatmapMode
  };

  const isHeatmapActive = effectiveHeatmapConfig.enabled;

  const handleToggleHeatmap = () => {
    if (onUpdateHeatmapConfig && heatmapConfig) {
      onUpdateHeatmapConfig({ ...heatmapConfig, enabled: !heatmapConfig.enabled });
    } else {
      setInternalHeatmapMode(!internalHeatmapMode);
    }
  };

  const handleToggleQuickCycle = () => {
    if (onUpdateHeatmapConfig && heatmapConfig) {
      onUpdateHeatmapConfig({ ...heatmapConfig, quickCycleMode: !heatmapConfig.quickCycleMode });
    }
  };

  const handleSelectTheme = (theme: 'classic' | 'modern' | 'risk' | 'high_contrast') => {
    if (onUpdateHeatmapConfig && heatmapConfig) {
      onUpdateHeatmapConfig({ ...heatmapConfig, theme, enabled: true });
    }
  };

  const toggleDomain = (domain: string) => {
    setCollapsedDomains(prev => ({ ...prev, [domain]: !prev[domain] }));
  };

  // Group skills by domain if enabled
  const domains = Array.from(new Set(skills.map(s => s.domain)));

  const competencyLevels: CompetencyLevel[] = ['L0', 'L1', 'L2'];

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
      {/* Top Action Bar: Add, Curated, Sort, Legend */}
      <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Action Buttons to Add & Sort Skills */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onOpenAddSkill}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-2xs"
            title="Thêm một kỹ năng công nghệ mới vào ma trận và lưu vào file Excel"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Thêm Kỹ Năng Mới</span>
          </button>

          <button
            onClick={onOpenCuratedModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200/90 hover:bg-slate-50 hover:text-slate-900 rounded-lg transition-colors shadow-2xs"
            title="Xem danh mục gợi ý công nghệ mới phù hợp hạ tầng"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Gợi Ý Kỹ Năng Mới</span>
          </button>

          <button
            onClick={onOpenSortModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200/90 hover:bg-slate-50 hover:text-slate-900 rounded-lg transition-colors shadow-2xs"
            title="Sắp xếp danh sách kỹ năng theo nhóm hoặc điểm số"
          >
            <ArrowDownUp className="w-3.5 h-3.5 text-slate-500" />
            <span>Sắp Xếp</span>
          </button>

          {onOpenManualSync && (
            <button
              onClick={onOpenManualSync}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200/90 hover:bg-slate-50 hover:text-slate-900 rounded-lg transition-colors shadow-2xs"
              title="Kiểm tra thông tin từ file Excel và cập nhật dữ liệu ngay lập tức"
            >
              <Zap className="w-3.5 h-3.5 fill-current text-indigo-600" />
              <span>Cập Nhật Dữ Liệu</span>
            </button>
          )}
        </div>

        {/* View Options: Heatmap controls, Group by domain, Export PDF */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Heatmap Control Group */}
          <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-slate-200 shadow-2xs">
            {/* Heatmap Toggle Button */}
            <button
              type="button"
              onClick={handleToggleHeatmap}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                isHeatmapActive
                  ? 'bg-amber-50 border border-amber-300 text-amber-900 shadow-2xs ring-1 ring-amber-200/60'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
              title="Bật hoặc tắt màu sắc trực quan thể hiện cấp độ L0-L2"
            >
              <Flame className={`w-3.5 h-3.5 ${isHeatmapActive ? 'text-amber-500 fill-amber-500' : 'text-slate-400'}`} />
              <span>Màu Sắc: {isHeatmapActive ? 'Bật' : 'Tắt'}</span>
            </button>

            {/* Quick 1-touch Cycle Mode */}
            <button
              type="button"
              onClick={handleToggleQuickCycle}
              className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md transition-all ${
                effectiveHeatmapConfig.quickCycleMode
                  ? 'bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
              title="Bấm 1 lần vào ô để chuyển nhanh: Chưa biết (L0) -> Đã biết (L1) -> Đã làm thực tế (L2)"
            >
              <Zap className={`w-3 h-3 ${effectiveHeatmapConfig.quickCycleMode ? 'text-indigo-600 fill-indigo-600' : 'text-slate-400'}`} />
              <span className="hidden sm:inline">1 Chạm: {effectiveHeatmapConfig.quickCycleMode ? 'Bật' : 'Tắt'}</span>
            </button>

            {/* Heatmap Config Modal Trigger */}
            {onOpenHeatmapConfigModal && (
              <button
                type="button"
                onClick={onOpenHeatmapConfigModal}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-indigo-700 hover:bg-indigo-50 rounded-md transition-all border border-indigo-100"
                title="Tùy chỉnh tông màu và mức độ đậm nhạt"
              >
                <Sliders className="w-3.5 h-3.5 text-indigo-600" />
                <span>Tùy Chỉnh Màu</span>
              </button>
            )}
          </div>

          <label className="inline-flex items-center gap-1.5 cursor-pointer text-slate-700 font-semibold select-none bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs shadow-2xs">
            <input
              type="checkbox"
              checked={groupByDomain}
              onChange={e => setGroupByDomain(e.target.checked)}
              className="rounded text-indigo-600 focus:ring-indigo-500"
            />
            <span>Gom Nhóm Kỹ Năng ({domains.length})</span>
          </label>
        </div>
      </div>

      {/* Sub-toolbar: Legend with Heatmap Intensity Spectrum & Theme Switcher */}
      <div className="px-4 py-2 bg-white border-b border-slate-100 flex flex-wrap items-center justify-between gap-2.5 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 font-semibold text-slate-600 text-[11px] mr-1">
            <Flame className={`w-3.5 h-3.5 ${isHeatmapActive ? 'text-amber-500 fill-amber-500' : 'text-slate-400'}`} />
            <span>Dải màu ({effectiveHeatmapConfig.theme}):</span>
          </div>
          {competencyLevels.map(lvl => {
            const def = COMPETENCY_DEFINITIONS[lvl];
            const hStyle = getHeatmapStyle(lvl, effectiveHeatmapConfig);
            const customLabel = effectiveHeatmapConfig.customLabels?.[lvl] || def.name;
            return (
              <button
                type="button"
                key={lvl}
                onClick={onOpenCompetencyModal}
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] border transition-transform hover:scale-105 ${hStyle.buttonClass}`}
                title={`Chuẩn năng lực ${lvl}: ${customLabel}\n${def.description}`}
              >
                <strong>{lvl}</strong>
                <span className="opacity-95">{customLabel}</span>
              </button>
            );
          })}

          {/* Theme Quick Switcher */}
          <div className="hidden md:flex items-center gap-1 pl-2 border-l border-slate-200 text-[11px]">
            <span className="text-slate-400">Theme:</span>
            {(['classic', 'modern', 'risk', 'high_contrast'] as const).map(th => {
              const themeNames = {
                classic: '🌿 Tinh Tế',
                modern: '⚡ Sky',
                risk: '🚨 Báo Động',
                high_contrast: '🔲 Tương Phản'
              };
              const isActive = effectiveHeatmapConfig.theme === th;
              return (
                <button
                  key={th}
                  type="button"
                  onClick={() => handleSelectTheme(th)}
                  className={`px-2 py-0.5 rounded-full text-[10px] font-semibold transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {themeNames[th]}
                </button>
              );
            })}
          </div>

          {onOpenHeatmapConfigModal && (
            <button
              type="button"
              onClick={onOpenHeatmapConfigModal}
              className="inline-flex items-center gap-1 ml-1 text-[11px] font-bold text-amber-800 hover:text-amber-950 bg-amber-50 hover:bg-amber-100 px-2 py-0.5 rounded border border-amber-200 transition-colors"
              title="Mở bảng điều khiển chi tiết để chỉnh sửa Heatmap"
            >
              <Palette className="w-3 h-3 text-amber-600" />
              <span>Chỉnh Sửa Dải Màu</span>
            </button>
          )}

          {onOpenCompetencyModal && (
            <button
              type="button"
              onClick={onOpenCompetencyModal}
              className="inline-flex items-center gap-1 ml-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-800 underline decoration-indigo-300 transition-colors"
              title="Mở xem bảng tiêu chuẩn năng lực L0 - L2 chuẩn thực hành Lab"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Khung L0-L2</span>
            </button>
          )}
        </div>

        <div className="text-[11px] text-slate-500 flex items-center gap-2">
          {effectiveHeatmapConfig.quickCycleMode ? (
            <span className="font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200 shadow-2xs">
              ⚡ 1 Chạm: Nhấp đổi L0 → L1 → L2
            </span>
          ) : (
            <span className="font-semibold text-emerald-900 bg-gradient-to-r from-emerald-50 to-emerald-100/90 px-2 py-0.5 rounded border border-emerald-200/80 shadow-2xs">
              L2: Đã biết và Lab thành công
            </span>
          )}
          <span className="hidden lg:inline text-slate-400">
            {effectiveHeatmapConfig.quickCycleMode ? '· Chuột phải để mở menu đầy đủ' : '· Nhấp ô để đổi điểm'}
          </span>
        </div>
      </div>

      {/* Main Responsive Data Grid */}
      <div className="overflow-x-auto max-h-[700px] overflow-y-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead className="sticky top-0 z-20 bg-slate-100 text-slate-700 border-b border-slate-300 font-semibold shadow-2xs">
            <tr>
              <th className="py-2.5 px-2 w-14 text-center text-slate-500 bg-slate-100 sticky left-0 z-30 border-r border-slate-200">
                <div className="flex items-center justify-center gap-1.5">
                  <input
                    type="checkbox"
                    checked={skills.length > 0 && skills.every(s => selectedSkillIds.includes(s.id))}
                    ref={el => {
                      if (el) {
                        const some = skills.some(s => selectedSkillIds.includes(s.id));
                        const all = skills.length > 0 && skills.every(s => selectedSkillIds.includes(s.id));
                        el.indeterminate = some && !all;
                      }
                    }}
                    onChange={handleToggleSelectAll}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer w-3.5 h-3.5"
                    title="Chọn tất cả kỹ năng đang hiển thị"
                  />
                  <span className="text-[11px] font-semibold text-slate-600">#</span>
                </div>
              </th>
              {!groupByDomain && (
                <th className="py-2.5 px-3 w-36 whitespace-nowrap border-r border-slate-200">
                  Nhóm Kỹ Năng
                </th>
              )}
              <th className="py-2.5 px-3 min-w-[220px] whitespace-nowrap border-r border-slate-200 bg-slate-100 sticky left-14 z-30 shadow-xs">
                Tên Kỹ Năng
              </th>

              {/* Members Columns */}
              {members.map(m => (
                <th
                  key={m.name}
                  onClick={() => onSelectMember && onSelectMember(m.name)}
                  className="py-2.5 px-2 text-center w-20 min-w-[76px] cursor-pointer hover:bg-slate-200/80 transition-colors border-r border-slate-200"
                  title={`Xem chi tiết đánh giá kỹ năng của ${m.name}`}
                >
                  <div className="font-bold text-slate-900 leading-tight py-1">{m.name}</div>
                </th>
              ))}

              {/* Roles */}
              <th className="py-2.5 px-2 text-center w-24 border-r border-slate-200" title="Người phụ trách chính của kỹ năng">
                Phụ Trách
              </th>
              <th className="py-2.5 px-2 text-center w-24 border-r border-slate-200" title="Người hỗ trợ hoặc dự phòng">
                Dự Phòng
              </th>
              <th className="py-2.5 px-2 text-center w-24 border-r border-slate-200" title="Người giỏi nhất / chuyên gia">
                Chuyên Gia
              </th>
              <th className="py-2.5 px-3 text-center w-16 border-r border-slate-200">
                Điểm TB
              </th>
              <th className="py-2.5 px-2 text-center w-12 text-slate-400">
                Sửa
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200 text-slate-800">
            {skills.length === 0 ? (
              <tr>
                <td colSpan={members.length + 7} className="py-12 text-center text-slate-400">
                  Không tìm thấy kỹ năng nào phù hợp với bộ lọc hiện tại.
                </td>
              </tr>
            ) : groupByDomain ? (
              domains.map(domain => {
                const domainSkills = skills.filter(s => s.domain === domain);
                if (domainSkills.length === 0) return null;
                const isCollapsed = collapsedDomains[domain];

                let domainScoresSum = 0;
                let domainScoresCount = 0;
                domainSkills.forEach(s => {
                  members.forEach(m => {
                    const lvl = s.ratings[m.name] || 'L0';
                    domainScoresSum += COMPETENCY_DEFINITIONS[lvl]?.score || 0;
                    domainScoresCount++;
                  });
                });
                const domainAvg = (domainScoresSum / (domainScoresCount || 1)).toFixed(2);
                const isAllDomainSelected = domainSkills.every(s => selectedSkillIds.includes(s.id));

                return (
                  <React.Fragment key={domain}>
                    {/* Domain Header Row */}
                    <tr
                      onClick={() => toggleDomain(domain)}
                      className="bg-slate-100/90 hover:bg-slate-200/70 cursor-pointer font-bold text-slate-900 select-none transition-colors border-y border-slate-300"
                    >
                      <td colSpan={members.length + 7} className="py-2 px-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {isCollapsed ? (
                              <ChevronRight className="w-4 h-4 text-slate-500" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-slate-500" />
                            )}
                            <span className="text-sm font-bold text-slate-900">{domain}</span>
                            <span className="text-xs font-normal text-slate-500">
                              ({domainSkills.length} kỹ năng)
                            </span>

                            {/* Quick Select by Domain Button */}
                            <button
                              type="button"
                              onClick={e => {
                                e.stopPropagation();
                                handleSelectDomainSkills(domain);
                              }}
                              className={`ml-2 px-2 py-0.5 rounded text-[10px] font-semibold transition-colors flex items-center gap-1 border ${
                                isAllDomainSelected
                                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                                  : 'bg-white hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 border-slate-200'
                              }`}
                              title="Chọn hoặc bỏ chọn tất cả kỹ năng trong nhóm này"
                            >
                              <CheckSquare className="w-3 h-3" />
                              <span>{isAllDomainSelected ? 'Bỏ chọn nhóm' : `Chọn nhóm (${domainSkills.length})`}</span>
                            </button>
                          </div>
                          <div className="flex items-center gap-3 text-xs font-normal text-slate-600">
                            {onBatchDomainRating && (
                              <div
                                className="flex items-center gap-1 bg-white px-2 py-0.5 rounded-md border border-slate-200 shadow-2xs"
                                onClick={e => e.stopPropagation()}
                              >
                                <span className="text-[10px] text-slate-500 font-medium mr-1">Gán domain:</span>
                                {(['L0', 'L1', 'L2'] as CompetencyLevel[]).map(lvl => (
                                  <button
                                    key={lvl}
                                    type="button"
                                    onClick={() => onBatchDomainRating(domain, lvl)}
                                    className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 border border-slate-200 transition-colors"
                                    title={`Gán tất cả kỹ năng trong phân khúc "${domain}" thành ${lvl}`}
                                  >
                                    Set {lvl}
                                  </button>
                                ))}
                              </div>
                            )}
                            <span>
                              Điểm TB Domain: <strong className="text-slate-900 font-bold tabular-nums">{domainAvg}</strong>
                            </span>
                          </div>
                        </div>
                      </td>
                    </tr>

                    {/* Domain Items */}
                    {!isCollapsed &&
                      domainSkills.map((item, idx) => (
                        <SkillTableRow
                          key={item.id}
                          item={item}
                          index={idx + 1}
                          members={members}
                          showDomainColumn={false}
                          activeCell={activeCell}
                          setActiveCell={setActiveCell}
                          isSelected={selectedSkillIds.includes(item.id)}
                          onToggleSelect={handleToggleSelectSkill}
                          onUpdateRating={onUpdateRating}
                          onUpdateRole={onUpdateRole}
                          onSelectMember={onSelectMember}
                          onEditSkill={onEditSkill}
                          heatmapConfig={effectiveHeatmapConfig}
                          onBatchRowRating={onBatchRowRating}
                          onApprovePendingSkill={onApprovePendingSkill}
                        />
                      ))}
                  </React.Fragment>
                );
              })
            ) : (
              skills.map((item, idx) => (
                <SkillTableRow
                  key={item.id}
                  item={item}
                  index={idx + 1}
                  members={members}
                  showDomainColumn={true}
                  activeCell={activeCell}
                  setActiveCell={setActiveCell}
                  isSelected={selectedSkillIds.includes(item.id)}
                  onToggleSelect={handleToggleSelectSkill}
                  onUpdateRating={onUpdateRating}
                  onUpdateRole={onUpdateRole}
                  onSelectMember={onSelectMember}
                  onEditSkill={onEditSkill}
                  heatmapConfig={effectiveHeatmapConfig}
                  onBatchRowRating={onBatchRowRating}
                  onApprovePendingSkill={onApprovePendingSkill}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Floating Bulk Action Bar (Thanh Thao Tác Hàng Loạt) */}
      {selectedSkillIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-900 text-white px-4 sm:px-5 py-3 rounded-2xl shadow-2xl border border-slate-700/90 flex flex-wrap items-center gap-3 sm:gap-4 animate-in slide-in-from-bottom-5 duration-200 no-print max-w-[96vw]">
          {/* Selected counter */}
          <div className="flex items-center gap-2 pr-3 border-r border-slate-700">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-indigo-500 text-white font-bold text-xs">
              {selectedSkillIds.length}
            </span>
            <span className="text-xs font-bold text-white whitespace-nowrap">
              Đã Chọn
            </span>
          </div>

          {/* Member selector */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-400 font-medium whitespace-nowrap">Áp dụng cho:</span>
            <select
              value={targetBulkMember}
              onChange={e => setTargetBulkMember(e.target.value)}
              className="px-2.5 py-1 text-xs bg-slate-800 border border-slate-700 rounded-lg text-white font-semibold focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">Toàn Bộ Thành Viên ({members.length} người)</option>
              {members.map(m => (
                <option key={m.name} value={m.name}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          {/* Bulk Level Buttons */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-400 font-medium whitespace-nowrap">Đặt mức:</span>
            <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl border border-slate-700">
              <button
                type="button"
                onClick={() => handleApplyBulkLevel('L0')}
                className="px-2.5 py-1 text-xs font-bold rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 transition-colors flex items-center gap-1 shadow-2xs"
                title="Đặt mức L0 (Chưa biết) cho các kỹ năng đã chọn"
              >
                <span>L0 · Chưa biết</span>
              </button>

              <button
                type="button"
                onClick={() => handleApplyBulkLevel('L1')}
                className="px-2.5 py-1 text-xs font-bold rounded-lg bg-orange-600 hover:bg-orange-500 text-white transition-colors flex items-center gap-1 shadow-2xs"
                title="Đặt mức L1 (Đã biết) cho các kỹ năng đã chọn"
              >
                <span>L1 · Đã biết</span>
              </button>

              <button
                type="button"
                onClick={() => handleApplyBulkLevel('L2')}
                className="px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors flex items-center gap-1 shadow-xs"
                title="Đặt mức L2 (Đã làm thực tế) cho các kỹ năng đã chọn"
              >
                <span>L2 · Đã làm thực tế</span>
              </button>
            </div>
          </div>

          {/* Bulk Role Assign Dropdown */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-400 font-medium whitespace-nowrap">Gán vai trò:</span>
            <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl border border-slate-700">
              <select
                value={bulkRoleField}
                onChange={e => setBulkRoleField(e.target.value as any)}
                className="px-2 py-1 text-xs bg-slate-900 border border-slate-700 rounded-lg text-slate-200 font-medium focus:outline-hidden"
              >
                <option value="owner">Phụ Trách</option>
                <option value="backup">Dự Phòng</option>
                <option value="sme">Chuyên Gia</option>
              </select>

              <select
                value={bulkRoleMember}
                onChange={e => {
                  const val = e.target.value;
                  setBulkRoleMember(val);
                  if (val !== undefined) {
                    handleApplyBulkRole(bulkRoleField, val);
                  }
                }}
                className="px-2 py-1 text-xs bg-indigo-900/80 border border-indigo-700 rounded-lg text-indigo-100 font-semibold focus:outline-hidden"
              >
                <option value="">Chọn thành viên...</option>
                <option value="">(Xóa gán)</option>
                {members.map(m => (
                  <option key={m.name} value={m.name}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Deselect All Button */}
          <button
            type="button"
            onClick={handleClearSelection}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors ml-auto"
            title="Bỏ chọn tất cả"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

interface SkillTableRowProps {
  item: SkillItem;
  index: number;
  members: TeamMember[];
  showDomainColumn: boolean;
  activeCell: { skillId: number; memberName: string } | null;
  setActiveCell: (val: { skillId: number; memberName: string } | null) => void;
  isSelected?: boolean;
  onToggleSelect?: (skillId: number) => void;
  onUpdateRating: (skillId: number, memberName: string, level: CompetencyLevel) => void;
  onUpdateRole: (skillId: number, field: 'owner' | 'backup' | 'sme', value: string) => void;
  onSelectMember?: (memberName: string) => void;
  onEditSkill: (skill: SkillItem) => void;
  heatmapConfig: HeatmapConfig;
  onBatchRowRating?: (skillId: number, level: CompetencyLevel) => void;
  onApprovePendingSkill?: (skillId: number) => void;
}

const SkillTableRow: React.FC<SkillTableRowProps> = ({
  item,
  index,
  members,
  showDomainColumn,
  activeCell,
  setActiveCell,
  isSelected = false,
  onToggleSelect,
  onUpdateRating,
  onUpdateRole,
  onSelectMember,
  onEditSkill,
  heatmapConfig,
  onBatchRowRating,
  onApprovePendingSkill
}) => {
  const scores = members.map(m => {
    const lvl = item.ratings[m.name] || 'L0';
    return COMPETENCY_DEFINITIONS[lvl]?.score || 0;
  });
  const avg = (scores.reduce((a, b) => a + b, 0) / (members.length || 1)).toFixed(1);

  const isSPOF = (item.sme || item.owner) && !item.backup;
  const isNoCoverage = !item.sme && !item.backup;
  const isPending = item.status === 'pending';

  return (
    <tr className={`transition-colors group ${
      isSelected
        ? 'bg-indigo-50/50 hover:bg-indigo-50/80 border-l-4 border-l-indigo-600'
        : isPending
        ? 'bg-amber-50/35 hover:bg-amber-50/60 border-l-4 border-l-amber-500'
        : 'hover:bg-slate-50/80'
    }`}>
      {/* Index & Checkbox */}
      <td className={`py-2 px-2 text-center font-mono text-[11px] tabular-nums sticky left-0 z-10 border-r border-slate-200 ${
        isSelected ? 'bg-indigo-100/70 text-indigo-900 font-bold' : isPending ? 'bg-amber-50/60 text-amber-700 font-bold' : 'text-slate-400 bg-white group-hover:bg-slate-50/80'
      }`}>
        <div className="flex items-center justify-center gap-1.5">
          {onToggleSelect && (
            <input
              type="checkbox"
              checked={isSelected}
              onChange={e => {
                e.stopPropagation();
                onToggleSelect(item.id);
              }}
              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer w-3.5 h-3.5"
              title="Chọn kỹ năng này để thao tác hàng loạt"
            />
          )}
          <span>{item.id}</span>
        </div>
      </td>

      {/* Domain */}
      {showDomainColumn && (
        <td className="py-2 px-3 text-slate-600 font-medium border-r border-slate-200 whitespace-nowrap">
          {item.domain}
        </td>
      )}

      {/* Skill Name with Risk Indicator & Pending status */}
      <td className={`py-2 px-3 font-medium text-slate-900 border-r border-slate-200 sticky left-14 z-10 shadow-xs ${
        isSelected ? 'bg-indigo-50/80 group-hover:bg-indigo-100/70' : isPending ? 'bg-amber-50/80 group-hover:bg-amber-100/60' : 'bg-white group-hover:bg-slate-50/80'
      }`}>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="font-semibold text-slate-900 truncate">{item.skill}</span>
            {isPending && (
              <span
                className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-900 bg-amber-100 px-1.5 py-0.5 rounded border border-amber-300 shrink-0"
                title={`Kỹ năng đang ở trạng thái Chờ Duyệt (Pending). Đề xuất bởi ${item.requestedBy || 'kỹ sư'}`}
              >
                <Clock className="w-2.5 h-2.5 text-amber-600 animate-spin" />
                Chờ Duyệt
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {isSPOF ? (
              <span
                className="text-[10px] text-amber-700 font-semibold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 whitespace-nowrap"
                title="Chỉ 1 người phụ trách, thiếu Backup (SPOF)"
              >
                Thiếu Backup
              </span>
            ) : null}
          </div>
        </div>
      </td>

      {/* Member Rating Badges with Heatmap Visual Intensity & Direct Editing */}
      {members.map(m => {
        const currentLevel = item.ratings[m.name] || 'L0';
        const def = COMPETENCY_DEFINITIONS[currentLevel] || COMPETENCY_DEFINITIONS['L0'];
        const isEditing = activeCell?.skillId === item.id && activeCell?.memberName === m.name;
        const heatmap = getHeatmapStyle(currentLevel, heatmapConfig);
        const customLabel = heatmapConfig.customLabels?.[currentLevel] || def.name;

        const cycleNextLevel = () => {
          const nextLvl: CompetencyLevel = currentLevel === 'L0' ? 'L1' : currentLevel === 'L1' ? 'L2' : 'L0';
          onUpdateRating(item.id, m.name, nextLvl);
        };

        const handleCellClick = (e: React.MouseEvent) => {
          if (heatmapConfig.quickCycleMode && !e.shiftKey) {
            cycleNextLevel();
          } else {
            setActiveCell({ skillId: item.id, memberName: m.name });
          }
        };

        const handleContextMenu = (e: React.MouseEvent) => {
          e.preventDefault();
          setActiveCell({ skillId: item.id, memberName: m.name });
        };

        return (
          <td
            key={m.name}
            className={`py-1.5 px-1 text-center relative border-r border-slate-200 transition-colors ${heatmap.cellBg}`}
            onContextMenu={handleContextMenu}
          >
            {isEditing ? (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 bg-white rounded-lg shadow-xl border border-slate-300 p-2 flex flex-col gap-1.5 w-52 animate-in fade-in zoom-in duration-100 text-left">
                <div className="flex items-center justify-between pb-1 border-b">
                  <span className="text-[10px] font-bold text-slate-700 truncate max-w-[130px]">
                    {m.name} · {item.skill}
                  </span>
                  <button
                    onClick={() => setActiveCell(null)}
                    className="text-slate-400 hover:text-slate-600 text-xs p-0.5 rounded"
                  >
                    ✕
                  </button>
                </div>

                <div className="text-[10px] text-slate-500 font-medium px-0.5">
                  Chọn cấp độ thành thạo:
                </div>

                {(['L0', 'L1', 'L2'] as CompetencyLevel[]).map(lvl => {
                  const lDef = COMPETENCY_DEFINITIONS[lvl];
                  const lHeatmap = getHeatmapStyle(lvl, heatmapConfig);
                  const lLabel = heatmapConfig.customLabels?.[lvl] || lDef.name;
                  const isCurrent = currentLevel === lvl;

                  return (
                    <button
                      key={lvl}
                      onClick={() => {
                        onUpdateRating(item.id, m.name, lvl);
                        setActiveCell(null);
                      }}
                      className={`flex items-center justify-between px-2 py-1.5 rounded text-[11px] font-semibold transition-colors ${
                        isCurrent
                          ? 'bg-indigo-50 text-indigo-700 font-bold ring-1 ring-indigo-200'
                          : 'hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        <span className={`w-5 h-5 rounded text-[10px] flex items-center justify-center font-bold ${lHeatmap.buttonClass}`}>
                          {lvl}
                        </span>
                        <span className="text-[11px] truncate">{lLabel}</span>
                      </span>
                      {isCurrent && <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />}
                    </button>
                  );
                })}

                {/* Quick advance button */}
                <button
                  onClick={() => {
                    cycleNextLevel();
                    setActiveCell(null);
                  }}
                  className="flex items-center justify-center gap-1 py-1 px-2 rounded bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-semibold transition-colors"
                >
                  <Zap className="w-3 h-3 text-amber-500 fill-amber-500" />
                  <span>Chuyển tiếp L0 → L1 → L2</span>
                </button>

                {/* Batch row quick set */}
                {onBatchRowRating && (
                  <div className="pt-1.5 border-t border-slate-100">
                    <div className="text-[9px] text-slate-400 font-medium mb-1">
                      Gán cho cả hàng ({members.length} kỹ sư):
                    </div>
                    <div className="grid grid-cols-3 gap-1">
                      {(['L0', 'L1', 'L2'] as CompetencyLevel[]).map(lvl => (
                        <button
                          key={lvl}
                          onClick={() => {
                            onBatchRowRating(item.id, lvl);
                            setActiveCell(null);
                          }}
                          className="py-0.5 px-1 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 rounded text-[10px] font-bold transition-colors text-center"
                          title={`Đặt tất cả kỹ sư trong hàng này thành ${lvl}`}
                        >
                          Set {lvl}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={handleCellClick}
                className={`w-14 py-1 rounded text-center text-xs transition-all hover:scale-105 active:scale-95 border ${heatmap.buttonClass}`}
                title={`Kỹ sư ${m.name}: ${currentLevel} - ${customLabel}\n${def.criteria || def.description}\n${
                  heatmapConfig.quickCycleMode
                    ? '⚡ Chế độ 1 chạm: Nhấp để chuyển nhanh L0->L1->L2\nChuột phải để mở menu chi tiết'
                    : 'Nhấp để đổi trình độ'
                }`}
              >
                {currentLevel}
              </button>
            )}
          </td>
        );
      })}

      {/* Owner Dropdown - Real data from SharePoint, left completely blank if empty */}
      <td className="py-1 px-1.5 border-r border-slate-200">
        <select
          value={item.owner || ''}
          onChange={e => onUpdateRole(item.id, 'owner', e.target.value)}
          className={`w-full py-1 px-1.5 text-[11px] rounded font-medium border bg-white focus:outline-hidden transition-colors ${
            item.owner ? 'border-slate-300 text-slate-900 font-semibold bg-white' : 'border-transparent text-transparent bg-transparent hover:border-slate-200 hover:text-slate-400'
          }`}
          title={item.owner ? `Người phụ trách: ${item.owner}` : 'Chưa phân công phụ trách (Trống)'}
        >
          <option value=""> </option>
          {members.map(m => (
            <option key={m.name} value={m.name} className="text-slate-900 font-normal">
              {m.name}
            </option>
          ))}
        </select>
      </td>

      {/* Backup Dropdown - Real data from SharePoint, left completely blank if empty */}
      <td className="py-1 px-1.5 border-r border-slate-200">
        <select
          value={item.backup || ''}
          onChange={e => onUpdateRole(item.id, 'backup', e.target.value)}
          className={`w-full py-1 px-1.5 text-[11px] rounded font-medium border bg-white focus:outline-hidden transition-colors ${
            item.backup ? 'border-slate-300 text-slate-900 font-semibold bg-white' : 'border-transparent text-transparent bg-transparent hover:border-slate-200 hover:text-slate-400'
          }`}
          title={item.backup ? `Người dự phòng: ${item.backup}` : 'Chưa phân công dự phòng (Trống)'}
        >
          <option value=""> </option>
          {members.map(m => (
            <option key={m.name} value={m.name} className="text-slate-900 font-normal">
              {m.name}
            </option>
          ))}
        </select>
      </td>

      {/* SME Dropdown - Real data from SharePoint, left completely blank if empty */}
      <td className="py-1 px-1.5 border-r border-slate-200">
        <select
          value={item.sme || ''}
          onChange={e => onUpdateRole(item.id, 'sme', e.target.value)}
          className={`w-full py-1 px-1.5 text-[11px] rounded font-medium border bg-white focus:outline-hidden transition-colors ${
            item.sme ? 'border-indigo-300 text-indigo-950 font-bold bg-indigo-50/40' : 'border-transparent text-transparent bg-transparent hover:border-slate-200 hover:text-slate-400'
          }`}
          title={item.sme ? `Chuyên gia SME: ${item.sme}` : 'Chưa phân công chuyên gia (Trống)'}
        >
          <option value=""> </option>
          {members.map(m => (
            <option key={m.name} value={m.name} className="text-slate-900 font-normal">
              {m.name}
            </option>
          ))}
        </select>
      </td>

      {/* Score */}
      <td className="py-2 px-2 text-center font-mono font-bold text-slate-700 text-xs tabular-nums border-r border-slate-200">
        <span className={`inline-block px-1.5 py-0.5 rounded text-[11px] ${
          Number(avg) >= 1.5
            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60 font-bold'
            : Number(avg) >= 0.8
            ? 'bg-amber-50 text-amber-800 border border-amber-200/60 font-semibold'
            : 'bg-slate-100 text-slate-600 font-medium'
        }`}>
          {avg}
        </span>
      </td>

      {/* Edit row button & Quick Approve for pending */}
      <td className="py-1 px-1 text-center">
        <div className="flex items-center justify-center gap-0.5">
          {isPending && onApprovePendingSkill && (
            <button
              onClick={() => onApprovePendingSkill(item.id)}
              className="p-1 text-emerald-600 hover:text-white hover:bg-emerald-600 bg-emerald-50 rounded transition-colors"
              title="Phê duyệt kỹ năng này và chuyển sang trạng thái chính thức"
            >
              <Check className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            onClick={() => onEditSkill(item)}
            className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
            title="Chỉnh sửa tên kỹ năng hoặc xóa"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
        </div>
      </td>
    </tr>
  );
};
