import React, { useState, useMemo } from 'react';
import { PrintReportConfig, SkillItem, TeamMember } from '../types/skills';
import { PrintReportView, createDefaultPrintConfig } from './PrintReportView';
import { 
  Printer, 
  X, 
  Check, 
  Layers, 
  Columns, 
  FileText, 
  Eye, 
  Sliders, 
  RotateCcw, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle,
  Building2,
  Users,
  Sparkles,
  Info
} from 'lucide-react';

interface PrintCustomizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  skills: SkillItem[];
  members: TeamMember[];
  domains: string[];
  currentConfig: PrintReportConfig;
  onSaveConfig: (config: PrintReportConfig) => void;
  onPrint: (config: PrintReportConfig) => void;
}

export const PrintCustomizationModal: React.FC<PrintCustomizationModalProps> = ({
  isOpen,
  onClose,
  skills,
  members,
  domains,
  currentConfig,
  onSaveConfig,
  onPrint
}) => {
  const [activeTab, setActiveTab] = useState<'config' | 'preview'>('config');
  const [config, setConfig] = useState<PrintReportConfig>(currentConfig);

  // Sync config when modal re-opens
  React.useEffect(() => {
    if (isOpen) {
      setConfig(currentConfig);
    }
  }, [isOpen, currentConfig]);

  // Domain skill counts
  const domainSkillCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    skills.forEach(s => {
      counts[s.domain] = (counts[s.domain] || 0) + 1;
    });
    return counts;
  }, [skills]);

  // Department Presets
  const applyPreset = (presetKey: string) => {
    switch (presetKey) {
      case 'all':
        setConfig({
          ...config,
          departmentTitle: 'BÁO CÁO MA TRẬN KỸ NĂNG ĐỘI NGŨ HẠ TẦNG (SKILL MATRIX)',
          reportSubtitle: 'Viendat Information Technology & Systems Integration Services',
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
          filterMode: 'all',
          showKpis: true,
          showCompetencyLegend: true,
          showSignatures: true,
        });
        break;

      case 'cloud': {
        const cloudDomains = domains.filter(d => 
          /Cloud|DevOps|Kubernetes|AI Infra/i.test(d)
        );
        setConfig({
          ...config,
          departmentTitle: 'BÁO CÁO NĂNG LỰC PHÒNG VẬN HÀNH HẠ TẦNG CLOUD & DEVOPS',
          reportSubtitle: 'Khối Kỹ Thuật Đám Mây & Trung Tâm Dữ Liệu · Viendat Services',
          selectedDomains: cloudDomains.length > 0 ? cloudDomains : domains.slice(0, 4),
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
        break;
      }

      case 'network': {
        const netDomains = domains.filter(d => 
          /Network|Security|Contact|Syslog|Wireless/i.test(d)
        );
        setConfig({
          ...config,
          departmentTitle: 'BÁO CÁO NĂNG LỰC PHÒNG AN NINH MẠNG & HẠ TẦNG VIỄN THÔNG',
          reportSubtitle: 'Khối An Toàn Thông Tin & Network Operations Center · Viendat Services',
          selectedDomains: netDomains.length > 0 ? netDomains : domains.slice(0, 4),
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
          filterMode: 'all',
          showKpis: true,
          showCompetencyLegend: true,
          showSignatures: true,
        });
        break;
      }

      case 'systems': {
        const sysDomains = domains.filter(d => 
          /Virtualization|Server|Storage|Disaster/i.test(d)
        );
        setConfig({
          ...config,
          departmentTitle: 'BÁO CÁO NĂNG LỰC PHÒNG HỆ THỐNG MÁY CHỦ & LƯU TRỮ DỰ PHÒNG',
          reportSubtitle: 'Khối Hệ Thống Ảo Hóa & Lưu Trữ Doanh Nghiệp · Viendat Services',
          selectedDomains: sysDomains.length > 0 ? sysDomains : domains.slice(0, 4),
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
          filterMode: 'all',
          showKpis: true,
          showCompetencyLegend: true,
          showSignatures: true,
        });
        break;
      }

      case 'database': {
        const dbDomains = domains.filter(d => 
          /Database|Monitoring/i.test(d)
        );
        setConfig({
          ...config,
          departmentTitle: 'BÁO CÁO NĂNG LỰC PHÒNG QUẢN TRỊ DỮ LIỆU & GIÁM SÁT HỆ THỐNG',
          reportSubtitle: 'Khối Cơ Sở Dữ Liệu Doanh Nghiệp & SRE Platform · Viendat Services',
          selectedDomains: dbDomains.length > 0 ? dbDomains : domains.slice(0, 3),
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
          filterMode: 'all',
          showKpis: true,
          showCompetencyLegend: true,
          showSignatures: true,
        });
        break;
      }

      case 'spof_risk': {
        setConfig({
          ...config,
          departmentTitle: 'BÁO CÁO RỦI RO ĐỘ PHỦ: DANH MỤC KỸ NĂNG SPOF (THIẾU BACKUP)',
          reportSubtitle: 'Báo Cáo Kiểm Toán & Đánh Giá An Toàn Vận Hành Kỹ Thuật',
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
          filterMode: 'spof_only',
          showKpis: true,
          showCompetencyLegend: false,
          showSignatures: true,
        });
        break;
      }

      case 'ready_l2': {
        setConfig({
          ...config,
          departmentTitle: 'BÁO CÁO NĂNG LỰC THỰC CHIẾN ĐÃ HOÀN THÀNH BÀI LAB (L2)',
          reportSubtitle: 'Hồ Sơ Năng Lực Dự Án Sẵn Sàng Triển Khai Cho Khách Hàng Doanh Nghiệp',
          selectedDomains: [...domains],
          visibleColumns: {
            showIndex: true,
            showDomain: true,
            showSkill: true,
            members: members.map(m => m.name),
            showOwner: true,
            showBackup: true,
            showSme: true,
            showEvidence: true,
            showAvgScore: true,
            showL2Rate: true,
          },
          filterMode: 'ready_only',
          showKpis: true,
          showCompetencyLegend: true,
          showSignatures: true,
        });
        break;
      }
    }
  };

  // Domain toggling
  const toggleDomain = (domain: string) => {
    const isSelected = config.selectedDomains.includes(domain);
    let updated: string[];
    if (isSelected) {
      updated = config.selectedDomains.filter(d => d !== domain);
    } else {
      updated = [...config.selectedDomains, domain];
    }
    setConfig({ ...config, selectedDomains: updated });
  };

  const selectAllDomains = () => {
    setConfig({ ...config, selectedDomains: [...domains] });
  };

  const deselectAllDomains = () => {
    setConfig({ ...config, selectedDomains: [] });
  };

  // Member column toggling
  const toggleMember = (memberName: string) => {
    const isSelected = config.visibleColumns.members.includes(memberName);
    let updated: string[];
    if (isSelected) {
      updated = config.visibleColumns.members.filter(m => m !== memberName);
    } else {
      updated = [...config.visibleColumns.members, memberName];
    }
    setConfig({
      ...config,
      visibleColumns: {
        ...config.visibleColumns,
        members: updated
      }
    });
  };

  const selectAllMembers = () => {
    setConfig({
      ...config,
      visibleColumns: {
        ...config.visibleColumns,
        members: members.map(m => m.name)
      }
    });
  };

  const deselectAllMembers = () => {
    setConfig({
      ...config,
      visibleColumns: {
        ...config.visibleColumns,
        members: []
      }
    });
  };

  // Column toggle helper
  const toggleColumn = (key: keyof Omit<PrintReportConfig['visibleColumns'], 'members'>) => {
    setConfig({
      ...config,
      visibleColumns: {
        ...config.visibleColumns,
        [key]: !config.visibleColumns[key]
      }
    });
  };

  // Summary counts
  const selectedSkillsCount = useMemo(() => {
    let list = skills;
    if (config.selectedDomains && config.selectedDomains.length > 0) {
      const set = new Set(config.selectedDomains);
      list = list.filter(s => set.has(s.domain));
    }
    if (config.filterMode === 'spof_only') {
      list = list.filter(s => (s.sme || s.owner) && !s.backup);
    } else if (config.filterMode === 'no_coverage_only') {
      list = list.filter(s => !s.sme && !s.backup);
    } else if (config.filterMode === 'ready_only') {
      list = list.filter(s =>
        members.some(m => (s.ratings[m.name] === 'L2'))
      );
    } else if (config.filterMode === 'deficit_only') {
      list = list.filter(s =>
        !members.some(m => (s.ratings[m.name] === 'L2'))
      );
    }
    return list.length;
  }, [skills, members, config.selectedDomains, config.filterMode]);

  const totalSelectedColumns = useMemo(() => {
    let count = 0;
    if (config.visibleColumns.showIndex) count++;
    if (config.visibleColumns.showDomain) count++;
    if (config.visibleColumns.showSkill) count++;
    count += config.visibleColumns.members.length;
    if (config.visibleColumns.showOwner) count++;
    if (config.visibleColumns.showBackup) count++;
    if (config.visibleColumns.showSme) count++;
    if (config.visibleColumns.showEvidence) count++;
    if (config.visibleColumns.showAvgScore) count++;
    if (config.visibleColumns.showL2Rate) count++;
    return count;
  }, [config.visibleColumns]);

  const handlePrintClick = () => {
    onSaveConfig(config);
    onPrint(config);
  };

  const handleResetToDefault = () => {
    const defaultConf = createDefaultPrintConfig(members, domains);
    setConfig(defaultConf);
    onSaveConfig(defaultConf);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 no-print animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-xs">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  Tùy Chỉnh & Xuất Báo Cáo PDF Chuyên Sâu
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                  Chuẩn A4 Landscape
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Lựa chọn phòng ban, phân khúc domain và các cột dữ liệu theo nhu cầu quản trị trước khi in
              </p>
            </div>
          </div>

          {/* Mode Switch Tabs (Config vs Live Preview) */}
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-slate-200/80 p-0.5 rounded-lg text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActiveTab('config')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
                  activeTab === 'config'
                    ? 'bg-white text-indigo-700 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Cấu Hình Báo Cáo</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
                  activeTab === 'preview'
                    ? 'bg-white text-indigo-700 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Xem Trước Bản In A4</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors ml-2"
              title="Đóng cửa sổ"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'config' ? (
            <div className="space-y-6">
              
              {/* Section 1: Department Presets */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                    <Building2 className="w-4 h-4 text-indigo-600" />
                    <span>Mẫu Báo Cáo Nhanh Cho Từng Phòng Ban / Khối Nghiệp Vụ:</span>
                  </div>
                  <span className="text-[11px] text-slate-400 italic">Nhấp để áp dụng ngay</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                  <button
                    type="button"
                    onClick={() => applyPreset('all')}
                    className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-indigo-50/50 hover:border-indigo-300 text-left transition-all group"
                  >
                    <span className="text-[11px] font-bold text-slate-800 group-hover:text-indigo-700 block truncate">
                      🌟 Toàn Đội Ngũ
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5 truncate">
                      Tất cả 14 Domain
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => applyPreset('cloud')}
                    className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-indigo-50/50 hover:border-indigo-300 text-left transition-all group"
                  >
                    <span className="text-[11px] font-bold text-slate-800 group-hover:text-indigo-700 block truncate">
                      ☁️ Cloud & DevOps
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5 truncate">
                      Cloud, K8s, AI Infra
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => applyPreset('network')}
                    className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-indigo-50/50 hover:border-indigo-300 text-left transition-all group"
                  >
                    <span className="text-[11px] font-bold text-slate-800 group-hover:text-indigo-700 block truncate">
                      🛡️ Mạng & An Ninh
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5 truncate">
                      Network, Firewall, UC
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => applyPreset('systems')}
                    className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-indigo-50/50 hover:border-indigo-300 text-left transition-all group"
                  >
                    <span className="text-[11px] font-bold text-slate-800 group-hover:text-indigo-700 block truncate">
                      🖥️ Máy Chủ & Storage
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5 truncate">
                      Virtualization, DR
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => applyPreset('database')}
                    className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-indigo-50/50 hover:border-indigo-300 text-left transition-all group"
                  >
                    <span className="text-[11px] font-bold text-slate-800 group-hover:text-indigo-700 block truncate">
                      🗄️ Database & Ops
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5 truncate">
                      DBA, Monitoring
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => applyPreset('spof_risk')}
                    className="p-2.5 rounded-xl border border-amber-200 bg-amber-50/40 hover:bg-amber-100/50 hover:border-amber-400 text-left transition-all group"
                  >
                    <span className="text-[11px] font-bold text-amber-900 group-hover:text-amber-950 block truncate">
                      ⚠️ Rủi Ro SPOF
                    </span>
                    <span className="text-[10px] text-amber-700 block mt-0.5 truncate">
                      Chỉ kỹ năng thiếu Backup
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => applyPreset('ready_l2')}
                    className="p-2.5 rounded-xl border border-emerald-200 bg-emerald-50/40 hover:bg-emerald-100/50 hover:border-emerald-400 text-left transition-all group"
                  >
                    <span className="text-[11px] font-bold text-emerald-900 group-hover:text-emerald-950 block truncate">
                      ✅ Sẵn Sàng L2
                    </span>
                    <span className="text-[10px] text-emerald-700 block mt-0.5 truncate">
                      Đã hoàn thành bài Lab
                    </span>
                  </button>
                </div>
              </div>

              {/* Section 2: Domain Filter Selector */}
              <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200/90 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-indigo-600" />
                    <span className="text-xs font-bold text-slate-900">
                      1. Chọn Phân Khúc Domain Cho Báo Cáo:
                    </span>
                    <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                      Đã chọn {config.selectedDomains.length} / {domains.length} Domain
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <button
                      type="button"
                      onClick={selectAllDomains}
                      className="text-indigo-600 hover:text-indigo-800 font-semibold text-[11px] hover:underline"
                    >
                      Chọn tất cả
                    </button>
                    <span className="text-slate-300">·</span>
                    <button
                      type="button"
                      onClick={deselectAllDomains}
                      className="text-slate-500 hover:text-slate-800 font-medium text-[11px] hover:underline"
                    >
                      Bỏ chọn tất cả
                    </button>
                  </div>
                </div>

                {/* Domain Grid Checkboxes */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                  {domains.map(domain => {
                    const isChecked = config.selectedDomains.includes(domain);
                    const count = domainSkillCounts[domain] || 0;

                    return (
                      <label
                        key={domain}
                        className={`flex items-center justify-between p-2 rounded-lg border text-xs cursor-pointer select-none transition-all ${
                          isChecked
                            ? 'bg-white border-indigo-300 text-slate-900 font-semibold shadow-2xs'
                            : 'bg-slate-100/60 border-slate-200/80 text-slate-400 hover:bg-white hover:text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate mr-1">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleDomain(domain)}
                            className="rounded text-indigo-600 focus:ring-indigo-500 shrink-0"
                          />
                          <span className="truncate" title={domain}>{domain}</span>
                        </div>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono shrink-0 ${
                          isChecked ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-200 text-slate-500'
                        }`}>
                          {count}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Section 3: Column Selector */}
              <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200/90 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Columns className="w-4 h-4 text-indigo-600" />
                    <span className="text-xs font-bold text-slate-900">
                      2. Chọn Các Cột Dữ Liệu Hiển Thị Trong Bảng:
                    </span>
                    <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      {totalSelectedColumns} Cột được chọn
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Column Group 1: General & Skill Info */}
                  <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-2">
                    <span className="text-[11px] font-bold text-slate-700 block uppercase tracking-wider pb-1 border-b border-slate-100">
                      Thông Tin Kỹ Năng
                    </span>
                    <label className="flex items-center gap-2 text-xs text-slate-800 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={config.visibleColumns.showIndex}
                        onChange={() => toggleColumn('showIndex')}
                        className="rounded text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>Số Thứ Tự (#)</span>
                    </label>
                    <label className="flex items-center gap-2 text-xs text-slate-800 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={config.visibleColumns.showDomain}
                        onChange={() => toggleColumn('showDomain')}
                        className="rounded text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>Cột Tên Domain (Phân Khúc)</span>
                    </label>
                    <label className="flex items-center gap-2 text-xs text-slate-800 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={config.visibleColumns.showSkill}
                        disabled
                        className="rounded text-indigo-600 focus:ring-indigo-500 opacity-60"
                      />
                      <span className="font-semibold text-slate-900">Tên Kỹ Năng (Bắt buộc)</span>
                    </label>
                  </div>

                  {/* Column Group 2: Personnel Members */}
                  <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                      <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                        Kỹ Sư Tham Gia ({config.visibleColumns.members.length}/{members.length})
                      </span>
                      <div className="flex items-center gap-1.5 text-[10px]">
                        <button
                          type="button"
                          onClick={selectAllMembers}
                          className="text-indigo-600 hover:underline font-semibold"
                        >
                          Tất cả
                        </button>
                        <span>·</span>
                        <button
                          type="button"
                          onClick={deselectAllMembers}
                          className="text-slate-500 hover:underline"
                        >
                          Bỏ chọn
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-1.5 max-h-36 overflow-y-auto pr-1">
                      {members.map(m => {
                        const isSelected = config.visibleColumns.members.includes(m.name);
                        return (
                          <label
                            key={m.name}
                            className={`flex items-center gap-1.5 p-1 rounded text-xs cursor-pointer select-none transition-colors ${
                              isSelected ? 'bg-indigo-50/60 font-semibold text-indigo-900' : 'text-slate-500 hover:bg-slate-50'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleMember(m.name)}
                              className="rounded text-indigo-600 focus:ring-indigo-500 shrink-0"
                            />
                            <span className="truncate">{m.name}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Column Group 3: Roles & Metrics */}
                  <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-2">
                    <span className="text-[11px] font-bold text-slate-700 block uppercase tracking-wider pb-1 border-b border-slate-100">
                      Vai Trò & Chỉ Số
                    </span>
                    <label className="flex items-center gap-2 text-xs text-slate-800 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={config.visibleColumns.showOwner}
                        onChange={() => toggleColumn('showOwner')}
                        className="rounded text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>Người Phụ Trách (Owner)</span>
                    </label>
                    <label className="flex items-center gap-2 text-xs text-slate-800 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={config.visibleColumns.showBackup}
                        onChange={() => toggleColumn('showBackup')}
                        className="rounded text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>Người Dự Phòng (Backup)</span>
                    </label>
                    <label className="flex items-center gap-2 text-xs text-slate-800 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={config.visibleColumns.showSme}
                        onChange={() => toggleColumn('showSme')}
                        className="rounded text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>Chuyên Gia L2 (SME)</span>
                    </label>
                    <label className="flex items-center gap-2 text-xs text-slate-800 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={config.visibleColumns.showAvgScore}
                        onChange={() => toggleColumn('showAvgScore')}
                        className="rounded text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>Điểm Trung Bình (Đ.TB 0-2.0)</span>
                    </label>
                    <label className="flex items-center gap-2 text-xs text-slate-800 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={config.visibleColumns.showL2Rate}
                        onChange={() => toggleColumn('showL2Rate')}
                        className="rounded text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>Tỷ Lệ Đạt Chuẩn L2 (%)</span>
                    </label>
                    <label className="flex items-center gap-2 text-xs text-slate-800 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={config.visibleColumns.showEvidence}
                        onChange={() => toggleColumn('showEvidence')}
                        className="rounded text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>Minh Chứng / Link Bài Lab</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Section 4: Title, Notes & Sections to Include */}
              <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200/90 space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                  <FileText className="w-4 h-4 text-indigo-600" />
                  <span>3. Tùy Biến Tiêu Đề Báo Cáo & Khối Hiển Thị Phụ:</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Tiêu Đề Báo Cáo (Department Title):
                    </label>
                    <input
                      type="text"
                      value={config.departmentTitle}
                      onChange={e => setConfig({ ...config, departmentTitle: e.target.value })}
                      placeholder="VD: BÁO CÁO NĂNG LỰC PHÒNG VẬN HÀNH HẠ TẦNG CLOUD"
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Đơn Vị / Phụ Đề Báo Cáo:
                    </label>
                    <input
                      type="text"
                      value={config.reportSubtitle}
                      onChange={e => setConfig({ ...config, reportSubtitle: e.target.value })}
                      placeholder="VD: Viendat Information Technology & Systems Integration Services"
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Bộ Lọc Chuyên Đề Kỹ Năng:
                    </label>
                    <select
                      value={config.filterMode}
                      onChange={e => setConfig({ ...config, filterMode: e.target.value as any })}
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="all">Toàn bộ kỹ năng thuộc domain đã chọn</option>
                      <option value="spof_only">Chỉ kỹ năng có rủi ro SPOF (Chỉ 1 người phụ trách, thiếu Backup)</option>
                      <option value="no_coverage_only">Chỉ kỹ năng Trống Phụ Trách (Chưa có cả SME lẫn Backup)</option>
                      <option value="ready_only">Chỉ kỹ năng Sẵn Sàng Triển Khai (Đã có nhân sự đạt L2)</option>
                      <option value="deficit_only">Chỉ kỹ năng Chưa Có Nhân Sự Đạt L2 (Cần cấp bài Lab ngay)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Ghi Chú Hoặc Ý Kiến Chỉ Đạo Của Lãnh Đạo (Tùy chọn):
                    </label>
                    <input
                      type="text"
                      value={config.notes || ''}
                      onChange={e => setConfig({ ...config, notes: e.target.value })}
                      placeholder="VD: Ưu tiên bố trí kinh phí bài Lab cho mảng Kubernetes và CI/CD trong Quý 2/2026."
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                {/* Section checkboxes */}
                <div className="pt-2 border-t border-slate-200/80 flex flex-wrap items-center gap-6 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer select-none font-medium text-slate-800">
                    <input
                      type="checkbox"
                      checked={config.showKpis}
                      onChange={e => setConfig({ ...config, showKpis: e.target.checked })}
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>Hiện 4 Thẻ KPI Tổng Quan</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer select-none font-medium text-slate-800">
                    <input
                      type="checkbox"
                      checked={config.showCompetencyLegend}
                      onChange={e => setConfig({ ...config, showCompetencyLegend: e.target.checked })}
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>Hiện Bảng Tiêu Chuẩn Năng Lực L0 - L2</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer select-none font-medium text-slate-800">
                    <input
                      type="checkbox"
                      checked={config.showSignatures}
                      onChange={e => setConfig({ ...config, showSignatures: e.target.checked })}
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>Hiện Vùng Ký Duyệt 3 Bên (Lập báo cáo, Tech Lead, Giám đốc)</span>
                  </label>
                </div>
              </div>
            </div>
          ) : (
            /* Tab 2: Live Preview */
            <div className="space-y-4">
              <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-200/80 flex flex-wrap items-center justify-between text-xs gap-3">
                <div className="flex items-center gap-2 text-indigo-900">
                  <Info className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>
                    Bản xem trước phản ánh chính xác cấu trúc trang in A4 Landscape (Bao gồm {selectedSkillsCount} kỹ năng trong {config.selectedDomains.length} domain và {totalSelectedColumns} cột dữ liệu).
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('config')}
                  className="font-bold text-indigo-700 hover:text-indigo-900 underline text-xs shrink-0"
                >
                  Quay lại chỉnh sửa cấu hình
                </button>
              </div>

              {/* Simulated Paper View */}
              <div className="overflow-x-auto bg-slate-200 p-4 rounded-xl border border-slate-300">
                <div className="max-w-[1100px] mx-auto bg-white shadow-lg rounded-sm overflow-hidden">
                  <PrintReportView
                    skills={skills}
                    members={members}
                    config={config}
                    isInlinePreview={true}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50 shrink-0">
          <div className="flex items-center gap-3 text-xs text-slate-600">
            <span className="font-semibold text-slate-800">
              Quy mô in:
            </span>
            <span className="bg-white px-2 py-0.5 rounded border border-slate-200 font-mono font-bold text-indigo-700">
              {selectedSkillsCount} Kỹ năng
            </span>
            <span>·</span>
            <span className="bg-white px-2 py-0.5 rounded border border-slate-200 font-mono font-bold text-slate-700">
              {config.selectedDomains.length} Domain
            </span>
            <span>·</span>
            <span className="bg-white px-2 py-0.5 rounded border border-slate-200 font-mono font-bold text-slate-700">
              {totalSelectedColumns} Cột
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleResetToDefault}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors"
              title="Khôi phục cấu hình in chuẩn toàn bộ 14 domain"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
              <span>Mặc Định</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Đóng
            </button>

            <button
              type="button"
              onClick={handlePrintClick}
              disabled={selectedSkillsCount === 0}
              className="inline-flex items-center gap-2 px-4 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 disabled:opacity-50 disabled:pointer-events-none rounded-lg shadow-sm transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>In / Lưu PDF Ngay (A4)</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
