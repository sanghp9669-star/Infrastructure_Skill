import React, { useState, useRef } from 'react';
import { parseUploadedExcel, ParseResult } from '../utils/excelParser';
import { Project, SkillItem, TeamMember } from '../types/skills';
import { Upload, FileSpreadsheet, Check, AlertCircle, X, RefreshCw, FolderKanban } from 'lucide-react';

interface ExcelImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: (importedSkills: SkillItem[], detectedMembers: string[], importedProjects?: Project[]) => void;
  existingMembers: TeamMember[];
}

export const ExcelImportModal: React.FC<ExcelImportModalProps> = ({
  isOpen,
  onClose,
  onImportSuccess,
  existingMembers
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setIsProcessing(true);
    const result = await parseUploadedExcel(selectedFile, existingMembers);
    setParseResult(result);
    setIsProcessing(false);
  };

  const handleConfirmImport = () => {
    if (!parseResult || parseResult.skills.length === 0) return;
    onImportSuccess(parseResult.skills, parseResult.detectedMembers, parseResult.projects);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-slate-900 text-sm">
              Nhập Dữ Liệu Excel / CSV (Skill Matrix)
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 text-xs text-slate-700">
          <p className="text-slate-600">
            Hỗ trợ file định dạng <strong>.xlsx</strong>, <strong>.xls</strong> hoặc <strong>.csv</strong> từ SharePoint/OneDrive. Hệ thống tự động nhận diện các cột Domain, Skill, tên thành viên và các cột Owner/Backup/SME.
          </p>

          {/* Upload Drop Zone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-indigo-200 hover:border-indigo-400 bg-indigo-50/20 hover:bg-indigo-50/40 rounded-xl p-6 text-center cursor-pointer transition-colors"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx, .xls, .csv"
              onChange={handleFileChange}
              className="hidden"
            />
            <Upload className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
            <div className="font-semibold text-indigo-900 text-sm">
              {file ? file.name : 'Nhấp để chọn file Excel từ máy tính'}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Ví dụ: Infrastructure_Skill_Matrix_15Domains.xlsx
            </div>
          </div>

          {/* Processing State */}
          {isProcessing && (
            <div className="flex items-center justify-center gap-2 py-4 text-indigo-600 font-semibold">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Đang đọc và phân tích cấu trúc dữ liệu Excel...</span>
            </div>
          )}

          {/* Parse Result Preview */}
          {parseResult && (
            <div className="space-y-3 pt-2 border-t border-slate-200">
              {parseResult.errors.length > 0 ? (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <div>
                    <strong className="block font-semibold">Lỗi đọc file:</strong>
                    {parseResult.errors.join(', ')}
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 space-y-2">
                  <div className="flex items-center gap-2 font-bold">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>Đọc file thành công!</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      Số kỹ năng nhận diện: <strong>{parseResult.totalRows}</strong>
                    </div>
                    <div>
                      Số dự án nhận diện: <strong>{parseResult.projects.length}</strong>
                    </div>
                  </div>
                  <div className="text-[11px] text-emerald-700 space-y-0.5">
                    <div>
                      Kỹ sư được nhận dạng ({parseResult.detectedMembers.length}):{' '}
                      <strong>{parseResult.detectedMembers.join(', ')}</strong>
                    </div>
                    {parseResult.projects.length > 0 && (
                      <div className="font-semibold text-indigo-800 flex items-center gap-1">
                        <FolderKanban className="w-3.5 h-3.5 text-indigo-600 inline" />
                        <span>Đã đọc thành công sheet Dự Án ({parseResult.projects.length} dự án)</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={handleConfirmImport}
            disabled={!parseResult || parseResult.skills.length === 0}
            className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors shadow-xs"
          >
            Áp Dụng Dữ Liệu Lên Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};
