import React, { useState } from 'react';
import { COMPETENCY_DEFINITIONS } from '../data/initialData';
import { CompetencyLevel } from '../types/skills';
import { 
  CheckCircle2, 
  X, 
  BookOpen, 
  Briefcase, 
  Compass, 
  FileCheck, 
  ShieldCheck, 
  FileSpreadsheet
} from 'lucide-react';

interface CompetencyDefinitionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExportExcel?: () => void;
}

export const CompetencyDefinitionModal: React.FC<CompetencyDefinitionModalProps> = ({
  isOpen,
  onClose,
  onExportExcel
}) => {
  const [selectedLevel, setSelectedLevel] = useState<CompetencyLevel>('L2');

  if (!isOpen) return null;

  const levels: CompetencyLevel[] = ['L0', 'L1', 'L2'];
  const activeDef = COMPETENCY_DEFINITIONS[selectedLevel];

  // Specific deliverables mapped to each level
  const deliverablesMap: Record<string, string> = {
    L0: 'Chưa có phân công hay sản phẩm bàn giao.',
    L1: 'Tài liệu tìm hiểu lý thuyết, mô hình bài Lab đang xây dựng, nhật ký các vướng mắc / lỗi cần hỗ trợ giải quyết.',
    L2: 'Môi trường Lab hoàn chỉnh đã test thông suốt, tài liệu hướng dẫn As-Built mẫu, quy trình SOP sẵn sàng áp dụng dự án.'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-indigo-50/80 via-purple-50/60 to-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-xs">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-base">
                  Khung Tiêu Chuẩn Năng Lực Hạ Tầng Thực Chiến (L0 - L2)
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  Chuẩn Thực Hành Lab
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                L0: Chưa biết gì · L1: Đã biết nhưng lab chưa thành công hoặc chưa lab · L2: Đã biết và Lab thành công
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-white/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Level Tabs Navigation */}
        <div className="px-6 pt-3 bg-slate-50 border-b border-slate-200 flex items-center gap-2 overflow-x-auto text-xs">
          {levels.map(lvl => {
            const def = COMPETENCY_DEFINITIONS[lvl];
            const isSelected = selectedLevel === lvl;
            return (
              <button
                key={lvl}
                onClick={() => setSelectedLevel(lvl)}
                className={`flex items-center gap-2 py-2.5 px-3.5 border-b-2 font-bold transition-all whitespace-nowrap rounded-t-lg ${
                  isSelected
                    ? 'border-indigo-600 text-indigo-700 bg-white shadow-2xs'
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/60'
                }`}
              >
                <span className={`w-2.5 h-2.5 rounded-full ${def.bgClass} border ${def.borderClass}`} />
                <span className="text-sm">{lvl}</span>
                <span className="text-[11px] font-medium opacity-90">({def.name})</span>
              </button>
            );
          })}
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700 flex-1">
          {/* Active Level Showcase Hero Card */}
          <div className={`p-5 rounded-2xl border ${activeDef.bgClass} ${activeDef.borderClass} shadow-2xs`}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl font-black px-3 py-1 bg-white/90 rounded-xl shadow-2xs border border-slate-200 text-slate-900 font-mono">
                  {activeDef.level}
                </span>
                <div>
                  <h4 className="text-base font-extrabold text-slate-900">
                    {activeDef.name}
                  </h4>
                  <p className="text-xs font-semibold text-slate-600 mt-0.5">
                    {activeDef.description}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="px-3 py-1 bg-white/90 rounded-lg border border-slate-200 text-center font-mono font-bold text-xs text-slate-800">
                  Điểm quy đổi: <span className="text-indigo-600 text-sm font-extrabold">{activeDef.score}.0</span> / 2.0
                </div>
              </div>
            </div>
          </div>

          {/* 4 Core Pillars Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 1. Tiêu chí năng lực cốt lõi */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center gap-2 text-indigo-700 font-bold text-xs">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Tiêu Chí & Khả Năng Thực Chiến (Core Criteria):</span>
              </div>
              <p className="text-slate-700 text-xs leading-relaxed">
                {activeDef.criteria || activeDef.description}
              </p>
            </div>

            {/* 2. Mức độ tự chủ & Trách nhiệm */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs">
                <Compass className="w-4 h-4 shrink-0" />
                <span>Mức Độ Tự Chủ & Phân Cấp Trách Nhiệm (Autonomy):</span>
              </div>
              <p className="text-slate-700 text-xs leading-relaxed">
                {activeDef.autonomy || 'Thực hiện theo chỉ đạo của cấp quản lý.'}
              </p>
            </div>

            {/* 3. Vai trò tương đương trong dự án */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center gap-2 text-amber-700 font-bold text-xs">
                <Briefcase className="w-4 h-4 shrink-0" />
                <span>Vai Trò Trong Dự Án (Project Role / Assignment):</span>
              </div>
              <p className="text-slate-800 text-xs font-semibold leading-relaxed">
                {activeDef.projectRole || 'Chuyên viên kỹ thuật'}
              </p>
            </div>

            {/* 4. Kết quả & Sản phẩm bàn giao */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center gap-2 text-purple-700 font-bold text-xs">
                <FileCheck className="w-4 h-4 shrink-0" />
                <span>Kết Quả & Tiêu Chuẩn Bàn Giao (Deliverables & Scope):</span>
              </div>
              <p className="text-slate-700 text-xs leading-relaxed">
                {deliverablesMap[activeDef.level]}
              </p>
            </div>
          </div>

          {/* Full Comparison Matrix Table */}
          <div className="pt-2">
            <h5 className="font-bold text-slate-900 text-xs mb-2 flex items-center justify-between">
              <span>Bảng Đối Chiếu Tổng Thể 3 Cấp Độ Thực Chiến (L0 - L2):</span>
              <span className="text-[11px] text-slate-400 font-normal">Được nhúng trực tiếp vào Sheet 2 của File Excel</span>
            </h5>
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-[11px] border-collapse">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-2 px-2.5 w-12 text-center border-r border-slate-200">Mức</th>
                    <th className="py-2 px-3 w-36 border-r border-slate-200">Tên Mức Năng Lực</th>
                    <th className="py-2 px-3 border-r border-slate-200 min-w-[200px]">Tiêu Chí Năng Lực Thực Tế</th>
                    <th className="py-2 px-3 border-r border-slate-200 min-w-[160px]">Mức Tự Chủ & Trách Nhiệm</th>
                    <th className="py-2 px-3 min-w-[160px]">Vai Trò Trong Dự Án</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {levels.map(lvl => {
                    const d = COMPETENCY_DEFINITIONS[lvl];
                    const isRowSelected = selectedLevel === lvl;
                    return (
                      <tr
                        key={lvl}
                        onClick={() => setSelectedLevel(lvl)}
                        className={`cursor-pointer transition-colors ${
                          isRowSelected ? 'bg-indigo-50/70 font-medium' : 'hover:bg-slate-50'
                        }`}
                      >
                        <td className="py-2 px-2 text-center font-bold font-mono border-r border-slate-200">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] ${d.bgClass} ${d.textClass} border ${d.borderClass}`}>
                            {lvl}
                          </span>
                        </td>
                        <td className="py-2 px-3 font-bold text-slate-900 border-r border-slate-200">
                          {d.name}
                        </td>
                        <td className="py-2 px-3 text-slate-700 border-r border-slate-200 leading-snug">
                          {d.criteria || d.description}
                        </td>
                        <td className="py-2 px-3 text-slate-600 border-r border-slate-200 leading-snug">
                          {d.autonomy || '-'}
                        </td>
                        <td className="py-2 px-3 text-slate-800 font-semibold leading-snug">
                          {d.projectRole || '-'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="text-slate-500 text-[11px] flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Đã chuẩn hóa đồng bộ với Ma Trận Kỹ Năng & File Excel 15 Domains</span>
          </div>

          <div className="flex items-center gap-2">
            {onExportExcel && (
              <button
                type="button"
                onClick={onExportExcel}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 rounded-lg transition-colors shadow-2xs"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Tải File Excel Chứa Sheet Này</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs"
            >
              Đóng Khung Năng Lực
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
