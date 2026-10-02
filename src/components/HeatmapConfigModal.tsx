import React, { useState } from 'react';
import { 
  HeatmapConfig, 
  HeatmapDisplayStyle, 
  HeatmapIntensity, 
  HeatmapTheme 
} from '../types/skills';
import { 
  Flame, 
  X, 
  Check, 
  Palette, 
  Zap, 
  Sliders, 
  Eye, 
  RotateCcw, 
  Sparkles, 
  Type, 
  MousePointer, 
  ShieldAlert,
  HelpCircle
} from 'lucide-react';

export const DEFAULT_HEATMAP_CONFIG: HeatmapConfig = {
  enabled: true,
  theme: 'classic',
  intensity: 'medium',
  displayStyle: 'both',
  quickCycleMode: false,
  customLabels: {
    L0: 'Chưa biết gì',
    L1: 'Đã biết nhưng lab chưa thành công hoặc chưa lab',
    L2: 'Đã biết và Lab thành công'
  }
};

interface HeatmapConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: HeatmapConfig;
  onSaveConfig: (updated: HeatmapConfig) => void;
}

export const HeatmapConfigModal: React.FC<HeatmapConfigModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig
}) => {
  const [tempConfig, setTempConfig] = useState<HeatmapConfig>(config);
  const [activeTab, setActiveTab] = useState<'theme' | 'interaction' | 'labels'>('theme');

  // Sync state when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setTempConfig(config);
    }
  }, [isOpen, config]);

  if (!isOpen) return null;

  const handleApply = () => {
    onSaveConfig(tempConfig);
    onClose();
  };

  const handleReset = () => {
    setTempConfig(DEFAULT_HEATMAP_CONFIG);
  };

  // Preview mock styles based on tempConfig
  const getMockStyle = (lvl: 'L0' | 'L1' | 'L2') => {
    if (!tempConfig.enabled) {
      return {
        cell: 'bg-white',
        btn: 'bg-white text-slate-700 border border-slate-300 font-semibold'
      };
    }

    const { theme, intensity, displayStyle } = tempConfig;

    if (theme === 'classic') {
      if (lvl === 'L0') {
        return {
          cell: displayStyle === 'button_only' ? 'bg-white' : 'bg-slate-50/50',
          btn: displayStyle === 'cell_only'
            ? 'bg-transparent text-slate-500 border border-transparent font-medium'
            : 'bg-gradient-to-b from-slate-50 to-slate-100/80 text-slate-500 border border-slate-200/80 font-medium'
        };
      }
      if (lvl === 'L1') {
        return {
          cell: displayStyle === 'button_only'
            ? 'bg-white'
            : intensity === 'subtle'
            ? 'bg-orange-50/30'
            : intensity === 'vivid'
            ? 'bg-gradient-to-b from-orange-100/70 to-amber-100/60'
            : 'bg-gradient-to-b from-orange-50/50 to-amber-50/40',
          btn: displayStyle === 'cell_only'
            ? 'bg-transparent text-orange-900 border border-transparent font-semibold'
            : intensity === 'subtle'
            ? 'bg-orange-50/80 text-orange-900 border border-orange-200 font-semibold'
            : intensity === 'vivid'
            ? 'bg-gradient-to-b from-orange-100 via-amber-200 to-orange-200 text-orange-950 border border-orange-400 font-bold shadow-xs'
            : 'bg-gradient-to-b from-orange-50 via-orange-100/70 to-orange-100 text-orange-900 border border-orange-200 font-semibold shadow-2xs'
        };
      }
      // L2
      return {
        cell: displayStyle === 'button_only'
          ? 'bg-white'
          : intensity === 'subtle'
          ? 'bg-emerald-50/30'
          : intensity === 'vivid'
          ? 'bg-gradient-to-b from-emerald-100/70 to-green-100/60'
          : 'bg-gradient-to-b from-emerald-50/60 to-green-50/50',
        btn: displayStyle === 'cell_only'
          ? 'bg-transparent text-emerald-900 border border-transparent font-bold'
          : intensity === 'subtle'
          ? 'bg-emerald-50 text-emerald-900 border border-emerald-300 font-bold'
          : intensity === 'vivid'
          ? 'bg-gradient-to-b from-emerald-100 via-green-200 to-emerald-200 text-emerald-950 border border-emerald-400 font-black shadow-xs ring-1 ring-emerald-400'
          : 'bg-gradient-to-b from-emerald-50 via-emerald-100/80 to-emerald-100 text-emerald-900 border border-emerald-300 font-bold shadow-2xs ring-1 ring-emerald-300/40'
      };
    }

    if (theme === 'modern') {
      if (lvl === 'L0') {
        return {
          cell: displayStyle === 'button_only' ? 'bg-white' : 'bg-slate-50/40',
          btn: displayStyle === 'cell_only' ? 'text-slate-500 font-medium' : 'bg-slate-100/80 text-slate-500 border border-slate-200 font-medium'
        };
      }
      if (lvl === 'L1') {
        return {
          cell: displayStyle === 'button_only' ? 'bg-white' : 'bg-sky-50/50',
          btn: displayStyle === 'cell_only' ? 'text-sky-900 font-semibold' : 'bg-gradient-to-b from-sky-50 to-blue-100 text-sky-900 border border-sky-300 font-semibold'
        };
      }
      // L2
      return {
        cell: displayStyle === 'button_only' ? 'bg-white' : 'bg-teal-50/60',
        btn: displayStyle === 'cell_only' ? 'text-teal-900 font-bold' : 'bg-gradient-to-b from-teal-50 to-emerald-100 text-teal-900 border border-teal-300 font-bold ring-1 ring-teal-300/40'
      };
    }

    if (theme === 'risk') {
      if (lvl === 'L0') {
        return {
          cell: displayStyle === 'button_only' ? 'bg-white' : 'bg-rose-50/50',
          btn: displayStyle === 'cell_only' ? 'text-rose-900 font-bold' : 'bg-gradient-to-b from-rose-50 to-rose-100 text-rose-900 border border-rose-300 font-bold'
        };
      }
      if (lvl === 'L1') {
        return {
          cell: displayStyle === 'button_only' ? 'bg-white' : 'bg-amber-50/50',
          btn: displayStyle === 'cell_only' ? 'text-amber-900 font-semibold' : 'bg-gradient-to-b from-amber-50 to-amber-100 text-amber-900 border border-amber-300 font-semibold'
        };
      }
      // L2
      return {
        cell: displayStyle === 'button_only' ? 'bg-white' : 'bg-emerald-50/50',
        btn: displayStyle === 'cell_only' ? 'text-emerald-900 font-bold' : 'bg-gradient-to-b from-emerald-50 to-emerald-100 text-emerald-900 border border-emerald-300 font-bold ring-1 ring-emerald-300/40'
      };
    }

    // High Contrast
    if (lvl === 'L0') {
      return {
        cell: 'bg-slate-100/90',
        btn: 'bg-slate-200 text-slate-800 border-2 border-slate-400 font-bold'
      };
    }
    if (lvl === 'L1') {
      return {
        cell: 'bg-amber-100/80',
        btn: 'bg-amber-300 text-amber-950 border-2 border-amber-500 font-black'
      };
    }
    // L2
    return {
      cell: 'bg-emerald-100/90',
      btn: 'bg-emerald-400 text-emerald-950 border-2 border-emerald-600 font-black'
    };
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 no-print animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-xs">
              <Flame className="w-5 h-5 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  Chỉnh Sửa & Tùy Biến Heatmap Năng Lực
                </h2>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  tempConfig.enabled ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                }`}>
                  {tempConfig.enabled ? 'Đang Bật' : 'Tắt'}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Tùy chỉnh bảng màu gradient, cường độ hiển thị, chế độ thao tác 1 chạm và nhãn cấp độ
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center px-6 pt-3 border-b border-slate-200 bg-white gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('theme')}
            className={`flex items-center gap-1.5 pb-2.5 px-3 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'theme'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>Dải Màu & Cường Độ</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('interaction')}
            className={`flex items-center gap-1.5 pb-2.5 px-3 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'interaction'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <MousePointer className="w-3.5 h-3.5" />
            <span>Thao Tác Nhấp Chuột (1 Chạm)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('labels')}
            className={`flex items-center gap-1.5 pb-2.5 px-3 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'labels'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Type className="w-3.5 h-3.5" />
            <span>Nhãn Cấp Độ (L0 - L2)</span>
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* Global Enable / Disable Switch */}
          <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <span className="font-bold text-slate-900 text-xs block">
                Kích Hoạt Heatmap Năng Lực Toàn Bảng
              </span>
              <span className="text-[11px] text-slate-500">
                Áp dụng màu sắc phân tầng trực quan cho các ô đánh giá kỹ sư trong bảng ma trận
              </span>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={tempConfig.enabled}
                onChange={e => setTempConfig({ ...tempConfig, enabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
            </label>
          </div>

          {activeTab === 'theme' && (
            <div className="space-y-5">
              {/* 1. Theme Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-2 flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-indigo-600" />
                  <span>1. Chọn Bảng Màu Heatmap (Color Theme):</span>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Theme 1: Classic */}
                  <div
                    onClick={() => setTempConfig({ ...tempConfig, theme: 'classic' })}
                    className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
                      tempConfig.theme === 'classic'
                        ? 'border-indigo-600 bg-indigo-50/30 shadow-2xs'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-xs text-slate-900">
                        🌿 Chuẩn Tinh Tế (Classic Gradient)
                      </span>
                      {tempConfig.theme === 'classic' && (
                        <Check className="w-4 h-4 text-indigo-600" />
                      )}
                    </div>
                    <span className="text-[11px] text-slate-500 block mb-2">
                      L0 Xám nhạt · L1 Cam dịu · L2 Xanh lục bảo
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] bg-slate-100 text-slate-600 border border-slate-200">L0</span>
                      <span className="px-2 py-0.5 rounded text-[10px] bg-orange-100 text-orange-900 border border-orange-200 font-semibold">L1</span>
                      <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold">L2</span>
                    </div>
                  </div>

                  {/* Theme 2: Modern Sky - Teal */}
                  <div
                    onClick={() => setTempConfig({ ...tempConfig, theme: 'modern' })}
                    className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
                      tempConfig.theme === 'modern'
                        ? 'border-indigo-600 bg-indigo-50/30 shadow-2xs'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-xs text-slate-900">
                        ⚡ Công Nghệ Hiện Đại (Modern Sky - Teal)
                      </span>
                      {tempConfig.theme === 'modern' && (
                        <Check className="w-4 h-4 text-indigo-600" />
                      )}
                    </div>
                    <span className="text-[11px] text-slate-500 block mb-2">
                      L0 Slate · L1 Xanh lam Sky · L2 Xanh lam Teal
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] bg-slate-100 text-slate-600 border border-slate-200">L0</span>
                      <span className="px-2 py-0.5 rounded text-[10px] bg-sky-100 text-sky-900 border border-sky-300 font-semibold">L1</span>
                      <span className="px-2 py-0.5 rounded text-[10px] bg-teal-100 text-teal-900 border border-teal-300 font-bold">L2</span>
                    </div>
                  </div>

                  {/* Theme 3: Risk Warning */}
                  <div
                    onClick={() => setTempConfig({ ...tempConfig, theme: 'risk' })}
                    className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
                      tempConfig.theme === 'risk'
                        ? 'border-indigo-600 bg-indigo-50/30 shadow-2xs'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-xs text-slate-900">
                        🚨 Cảnh Báo Rủi Ro (Risk Audit Alert)
                      </span>
                      {tempConfig.theme === 'risk' && (
                        <Check className="w-4 h-4 text-indigo-600" />
                      )}
                    </div>
                    <span className="text-[11px] text-slate-500 block mb-2">
                      L0 Hồng cảnh báo · L1 Vàng chú ý · L2 Xanh an toàn
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] bg-rose-100 text-rose-900 border border-rose-300 font-bold">L0</span>
                      <span className="px-2 py-0.5 rounded text-[10px] bg-amber-100 text-amber-900 border border-amber-300 font-semibold">L1</span>
                      <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold">L2</span>
                    </div>
                  </div>

                  {/* Theme 4: High Contrast */}
                  <div
                    onClick={() => setTempConfig({ ...tempConfig, theme: 'high_contrast' })}
                    className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
                      tempConfig.theme === 'high_contrast'
                        ? 'border-indigo-600 bg-indigo-50/30 shadow-2xs'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-xs text-slate-900">
                        🎯 Tương Phản Cao (High Contrast)
                      </span>
                      {tempConfig.theme === 'high_contrast' && (
                        <Check className="w-4 h-4 text-indigo-600" />
                      )}
                    </div>
                    <span className="text-[11px] text-slate-500 block mb-2">
                      Viền đậm nét, màu khối rõ ràng cho người mắt kém
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] bg-slate-200 text-slate-900 border-2 border-slate-400 font-bold">L0</span>
                      <span className="px-2 py-0.5 rounded text-[10px] bg-amber-300 text-amber-950 border-2 border-amber-500 font-black">L1</span>
                      <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-400 text-emerald-950 border-2 border-emerald-600 font-black">L2</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Intensity & Display Style */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Intensity */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <label className="block text-xs font-bold text-slate-800">
                    2. Cường Độ Màu (Intensity):
                  </label>
                  <div className="space-y-1.5">
                    {[
                      { id: 'subtle', name: 'Nhẹ nhàng, dịu mắt (Subtle 25%)', desc: 'Tối ưu khi xem bảng dữ liệu lớn trong nhiều giờ' },
                      { id: 'medium', name: 'Tiêu chuẩn cân bằng (Medium 50%)', desc: 'Hiển thị hài hòa, dễ phân biệt cấp độ' },
                      { id: 'vivid', name: 'Rõ nét, nổi bật (Vivid 80%)', desc: 'Độ tương phản cao, làm nổi bật ngay các ô L2' }
                    ].map(opt => (
                      <label
                        key={opt.id}
                        className={`flex items-start gap-2 p-2 rounded-lg border text-xs cursor-pointer select-none transition-all ${
                          tempConfig.intensity === opt.id
                            ? 'bg-white border-indigo-500 font-semibold text-indigo-950 shadow-2xs'
                            : 'bg-white/60 border-slate-200 text-slate-600 hover:bg-white'
                        }`}
                      >
                        <input
                          type="radio"
                          name="intensity"
                          checked={tempConfig.intensity === opt.id}
                          onChange={() => setTempConfig({ ...tempConfig, intensity: opt.id as HeatmapIntensity })}
                          className="mt-0.5 text-indigo-600 focus:ring-indigo-500"
                        />
                        <div>
                          <span className="block font-bold">{opt.name}</span>
                          <span className="text-[10px] text-slate-400 block">{opt.desc}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Display Style */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <label className="block text-xs font-bold text-slate-800">
                    3. Kiểu Tô Màu (Display Style):
                  </label>
                  <div className="space-y-1.5">
                    {[
                      { id: 'both', name: 'Cả Nền Ô & Nút Bấm (Khuyên dùng)', desc: 'Nền ô đổi màu nhẹ kết hợp nút bấm gradient' },
                      { id: 'button_only', name: 'Chỉ Tô Màu Nút Bấm (Badge Only)', desc: 'Nền ô màu trắng thông thoáng, chỉ nổi bật nhãn L0-L2' },
                      { id: 'cell_only', name: 'Chỉ Tô Màu Nền Ô (Cell Only)', desc: 'Nút bấm tối giản không viền, toàn bộ ô mang dải màu' }
                    ].map(opt => (
                      <label
                        key={opt.id}
                        className={`flex items-start gap-2 p-2 rounded-lg border text-xs cursor-pointer select-none transition-all ${
                          tempConfig.displayStyle === opt.id
                            ? 'bg-white border-indigo-500 font-semibold text-indigo-950 shadow-2xs'
                            : 'bg-white/60 border-slate-200 text-slate-600 hover:bg-white'
                        }`}
                      >
                        <input
                          type="radio"
                          name="displayStyle"
                          checked={tempConfig.displayStyle === opt.id}
                          onChange={() => setTempConfig({ ...tempConfig, displayStyle: opt.id as HeatmapDisplayStyle })}
                          className="mt-0.5 text-indigo-600 focus:ring-indigo-500"
                        />
                        <div>
                          <span className="block font-bold">{opt.name}</span>
                          <span className="text-[10px] text-slate-400 block">{opt.desc}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'interaction' && (
            <div className="space-y-4">
              {/* Quick Cycle Mode Toggle */}
              <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-indigo-600 fill-indigo-600" />
                    <div>
                      <span className="font-bold text-sm text-slate-900 block">
                        Chế Độ Nhấp 1 Chạm Đổi Nhanh (Quick-Click Cycle)
                      </span>
                      <span className="text-xs text-slate-600">
                        Giúp kỹ sư hoặc quản lý đánh giá nhanh ma trận 94 kỹ năng mà không cần qua menu popover
                      </span>
                    </div>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={tempConfig.quickCycleMode}
                      onChange={e => setTempConfig({ ...tempConfig, quickCycleMode: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>

                <div className="p-3 bg-white rounded-lg border border-indigo-100 text-xs space-y-1.5 text-slate-700">
                  <strong className="text-indigo-900 block font-bold">Cơ chế hoạt động khi bật:</strong>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>
                      <strong>Nhấp chuột trái 1 lần:</strong> Tự động tăng vòng lặp cấp độ: <span className="font-mono font-bold text-slate-600">L0</span> ➔ <span className="font-mono font-bold text-amber-700">L1</span> ➔ <span className="font-mono font-bold text-emerald-700">L2</span> ➔ <span className="font-mono font-bold text-slate-600">L0</span>.
                    </li>
                    <li>
                      <strong>Nhấp chuột phải:</strong> Mở menu đầy đủ để chọn nhanh bất kỳ cấp độ nào nếu muốn.
                    </li>
                    <li>
                      <strong>Phím tắt bàn phím:</strong> Di chuột vào ô và nhấn phím <kbd className="px-1.5 py-0.5 bg-slate-100 border rounded font-mono">0</kbd>, <kbd className="px-1.5 py-0.5 bg-slate-100 border rounded font-mono">1</kbd>, hoặc <kbd className="px-1.5 py-0.5 bg-slate-100 border rounded font-mono">2</kbd> để gán cấp độ ngay tức khắc.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'labels' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600">
                Tùy chỉnh tên hiển thị của các cấp độ năng lực để phù hợp với ngôn ngữ báo cáo nội bộ của từng phòng ban:
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded text-[10px] bg-slate-100 text-slate-700 border flex items-center justify-center font-bold">L0</span>
                    <span>Tên hiển thị Cấp độ L0:</span>
                  </label>
                  <input
                    type="text"
                    value={tempConfig.customLabels?.L0 || 'Chưa biết gì'}
                    onChange={e => setTempConfig({
                      ...tempConfig,
                      customLabels: { ...tempConfig.customLabels, L0: e.target.value }
                    })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded text-[10px] bg-orange-100 text-orange-900 border border-orange-200 flex items-center justify-center font-bold">L1</span>
                    <span>Tên hiển thị Cấp độ L1:</span>
                  </label>
                  <input
                    type="text"
                    value={tempConfig.customLabels?.L1 || 'Đã biết nhưng lab chưa thành công hoặc chưa lab'}
                    onChange={e => setTempConfig({
                      ...tempConfig,
                      customLabels: { ...tempConfig.customLabels, L1: e.target.value }
                    })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded text-[10px] bg-emerald-100 text-emerald-900 border border-emerald-300 flex items-center justify-center font-bold">L2</span>
                    <span>Tên hiển thị Cấp độ L2:</span>
                  </label>
                  <input
                    type="text"
                    value={tempConfig.customLabels?.L2 || 'Đã biết và Lab thành công'}
                    onChange={e => setTempConfig({
                      ...tempConfig,
                      customLabels: { ...tempConfig.customLabels, L2: e.target.value }
                    })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Live Preview Box */}
          <div className="p-4 bg-slate-100 rounded-xl border border-slate-200/90 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-indigo-600" />
                <span>Xem Trước Hiển Thị Trực Quan (Live Preview):</span>
              </span>
              <span className="text-[11px] text-slate-500">
                Chế độ 1 chạm: <strong>{tempConfig.quickCycleMode ? 'Bật (1-Click Cycle)' : 'Tắt (Menu)'}</strong>
              </span>
            </div>

            <div className="bg-white p-3 rounded-lg border border-slate-200 flex items-center justify-around gap-4 text-xs">
              {(['L0', 'L1', 'L2'] as const).map(lvl => {
                const s = getMockStyle(lvl);
                const label = tempConfig.customLabels?.[lvl] || (lvl === 'L0' ? 'Chưa biết gì' : lvl === 'L1' ? 'Đã biết (Chưa Lab)' : 'Đã Lab thành công');

                return (
                  <div key={lvl} className={`p-3 rounded-lg border text-center flex-1 transition-all ${s.cell}`}>
                    <span className="text-[10px] text-slate-400 block mb-1">Mức {lvl}</span>
                    <button
                      type="button"
                      className={`w-16 py-1 mx-auto rounded text-xs block transition-all ${s.btn}`}
                    >
                      {lvl}
                    </button>
                    <span className="text-[10px] text-slate-600 block mt-1 font-medium truncate" title={label}>
                      {label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span>Mặc Định</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-all active:scale-95"
            >
              <Check className="w-4 h-4" />
              <span>Lưu & Áp Dụng Heatmap</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
