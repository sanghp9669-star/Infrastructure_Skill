import React, { useState, useRef } from 'react';
import { 
  Zap, 
  RefreshCw, 
  Upload, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertTriangle, 
  X, 
  ArrowRight, 
  ExternalLink, 
  FileText, 
  Layers, 
  Clock, 
  ShieldCheck,
  Check,
  Link2
} from 'lucide-react';
import { SkillItem } from '../types/skills';
import { SyncState } from './SyncSettingsModal';

export interface DiffItem {
  skill: string;
  domain: string;
  type: 'added' | 'modified' | 'removed';
  changes: string[];
}

export interface ManualSyncResult {
  success: boolean;
  changed: boolean;
  itemCount?: number;
  diffCount?: number;
  diff?: DiffItem[];
  source?: string;
  message?: string;
  skills?: SkillItem[];
  lastChecksum?: string;
  lastSyncTime?: string;
  error?: string;
}

interface ManualSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  syncState: SyncState | null;
  onManualSyncOnline: (url?: string) => Promise<ManualSyncResult | null>;
  onManualSyncFile: (fileBase64: string, filename: string) => Promise<ManualSyncResult | null>;
  isSyncing: boolean;
}

export const ManualSyncModal: React.FC<ManualSyncModalProps> = ({
  isOpen,
  onClose,
  syncState,
  onManualSyncOnline,
  onManualSyncFile,
  isSyncing
}) => {
  const [activeTab, setActiveTab] = useState<'sharepoint' | 'file'>('sharepoint');
  const [customUrl, setCustomUrl] = useState<string>(syncState?.url || '');
  const [syncStep, setSyncStep] = useState<number>(0); // 0: idle, 1: connecting, 2: parsing, 3: diffing, 4: done
  const [syncResult, setSyncResult] = useState<ManualSyncResult | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleStartOnlineSync = async () => {
    setSyncResult(null);
    setSyncStep(1);
    
    // Simulate nice step progression
    const timer1 = setTimeout(() => setSyncStep(2), 500);
    const timer2 = setTimeout(() => setSyncStep(3), 1200);

    const result = await onManualSyncOnline(customUrl.trim() || undefined);
    
    clearTimeout(timer1);
    clearTimeout(timer2);
    setSyncStep(4);
    setSyncResult(result);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleStartFileSync = async () => {
    if (!selectedFile) return;

    setSyncResult(null);
    setSyncStep(1);

    const reader = new FileReader();
    reader.onload = async () => {
      setSyncStep(2);
      const base64 = reader.result as string;
      setTimeout(() => setSyncStep(3), 400);

      const result = await onManualSyncFile(base64, selectedFile.name);
      setSyncStep(4);
      setSyncResult(result);
    };
    reader.readAsDataURL(selectedFile);
  };

  const resetDialog = () => {
    setSyncResult(null);
    setSyncStep(0);
    setSelectedFile(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-indigo-50/70 via-sky-50/70 to-emerald-50/70">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-xs">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                <span>Đồng Bộ Thủ Công Tức Thì (Instant Manual Sync)</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                  Đối chiếu dữ liệu Excel
                </span>
              </h3>
              <p className="text-[11px] text-slate-500">
                Kiểm tra toàn diện file Excel và cập nhật dữ liệu ngay lập tức lên toàn bộ hệ thống web
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              resetDialog();
              onClose();
            }}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-white/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Source Selector Tabs */}
        <div className="px-6 pt-3 border-b border-slate-200 bg-slate-50 flex items-center gap-2 text-xs">
          <button
            onClick={() => {
              setActiveTab('sharepoint');
              resetDialog();
            }}
            className={`flex items-center gap-2 py-2 px-3 border-b-2 font-semibold transition-all ${
              activeTab === 'sharepoint'
                ? 'border-indigo-600 text-indigo-700 bg-white rounded-t-lg'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Link2 className="w-4 h-4 text-indigo-600" />
            <span>Nguồn SharePoint / OneDrive Trực Tuyến</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('file');
              resetDialog();
            }}
            className={`flex items-center gap-2 py-2 px-3 border-b-2 font-semibold transition-all ${
              activeTab === 'file'
                ? 'border-indigo-600 text-indigo-700 bg-white rounded-t-lg'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Upload className="w-4 h-4 text-emerald-600" />
            <span>Nguồn File Excel Trên Máy Tính (.xlsx)</span>
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-700 flex-1">
          {/* Tab 1: SharePoint Online Sync */}
          {activeTab === 'sharepoint' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-indigo-50/60 border border-indigo-100 flex items-start gap-3">
                <FileSpreadsheet className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                <div className="flex-1 text-xs">
                  <strong className="text-slate-900 block font-bold mb-0.5">
                    File Excel Đang Liên Kết: Infrastructure_Skill_Matrix_15Domains.xlsx
                  </strong>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    Hệ thống sẽ kết nối đến SharePoint, tải phiên bản mới nhất, tự động trích xuất các sheet và phân tích từng thay đổi về năng lực, nhân sự hoặc kỹ năng mới.
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1 flex items-center justify-between">
                  <span>Đường Dẫn File Excel SharePoint:</span>
                  <span className="text-[10px] text-slate-400 font-normal">URL Direct Download</span>
                </label>
                <input
                  type="text"
                  value={customUrl}
                  onChange={e => setCustomUrl(e.target.value)}
                  placeholder="https://viendatvidaco-my.sharepoint.com/:x:/g/personal/..."
                  className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              {/* Action trigger button */}
              <div className="pt-2">
                <button
                  onClick={handleStartOnlineSync}
                  disabled={isSyncing}
                  className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all active:scale-[0.99]"
                >
                  <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>{isSyncing ? 'Đang Kiểm Tra & Đồng Bộ...' : 'Bắt Đầu Kiểm Tra & Đồng Bộ Ngay Lập Tức'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Tab 2: Local File Sync */}
          {activeTab === 'file' && (
            <div className="space-y-4">
              <div
                onDragOver={e => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={e => {
                  e.preventDefault();
                  setIsDragging(false);
                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    setSelectedFile(e.dataTransfer.files[0]);
                  }
                }}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                  isDragging
                    ? 'border-indigo-500 bg-indigo-50/50'
                    : selectedFile
                    ? 'border-emerald-400 bg-emerald-50/30'
                    : 'border-slate-300 hover:border-indigo-400 bg-slate-50/50'
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".xlsx, .xls"
                  className="hidden"
                />
                <div className="w-12 h-12 rounded-full bg-white border border-slate-200 flex items-center justify-center mx-auto mb-3 shadow-2xs">
                  <Upload className="w-6 h-6 text-indigo-600" />
                </div>
                {selectedFile ? (
                  <div>
                    <span className="font-bold text-emerald-800 text-sm block">{selectedFile.name}</span>
                    <span className="text-[11px] text-slate-500">
                      {(selectedFile.size / 1024).toFixed(1)} KB · Nhấp để chọn file khác
                    </span>
                  </div>
                ) : (
                  <div>
                    <span className="font-bold text-slate-800 text-sm block">
                      Kéo thả file Excel (.xlsx) vào đây
                    </span>
                    <span className="text-[11px] text-slate-500 block mt-1">
                      hoặc nhấp chuột để duyệt file từ máy tính
                    </span>
                  </div>
                )}
              </div>

              {selectedFile && (
                <button
                  onClick={handleStartFileSync}
                  disabled={isSyncing}
                  className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all"
                >
                  <Zap className="w-4 h-4 fill-current" />
                  <span>{isSyncing ? 'Đang Đọc File & Đồng Bộ...' : 'Đồng Bộ Dữ Liệu Từ File Này Ngay'}</span>
                </button>
              )}
            </div>
          )}

          {/* Progress Stages Animation */}
          {isSyncing && (
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 animate-in fade-in duration-150">
              <span className="font-bold text-slate-900 block text-xs flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 text-indigo-600 animate-spin" />
                <span>Tiến trình xử lý đồng bộ tức thì:</span>
              </span>

              <div className="grid grid-cols-4 gap-2 text-center text-[10px]">
                <div className={`p-2 rounded-lg border ${syncStep >= 1 ? 'bg-indigo-50 border-indigo-200 text-indigo-800 font-bold' : 'bg-white border-slate-200 text-slate-400'}`}>
                  <span>1. Kết nối nguồn</span>
                </div>
                <div className={`p-2 rounded-lg border ${syncStep >= 2 ? 'bg-indigo-50 border-indigo-200 text-indigo-800 font-bold' : 'bg-white border-slate-200 text-slate-400'}`}>
                  <span>2. Đọc bảng tính</span>
                </div>
                <div className={`p-2 rounded-lg border ${syncStep >= 3 ? 'bg-indigo-50 border-indigo-200 text-indigo-800 font-bold' : 'bg-white border-slate-200 text-slate-400'}`}>
                  <span>3. Đối chiếu Diff</span>
                </div>
                <div className={`p-2 rounded-lg border ${syncStep >= 4 ? 'bg-emerald-50 border-emerald-200 text-emerald-800 font-bold' : 'bg-white border-slate-200 text-slate-400'}`}>
                  <span>4. Cập nhật Web</span>
                </div>
              </div>
            </div>
          )}

          {/* Sync Result Details View */}
          {syncResult && (
            <div className="space-y-3 pt-2 border-t border-slate-200 animate-in fade-in duration-200">
              {syncResult.success ? (
                <div>
                  {/* Status header */}
                  <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-emerald-950 font-bold text-xs block">
                        Đồng Bộ Thành Công & Đã Cập Nhật Lên Web!
                      </strong>
                      <p className="text-emerald-800 text-[11px] mt-0.5">
                        {syncResult.message}
                      </p>
                      <div className="flex items-center gap-3 mt-2 text-[10px] text-emerald-700 font-mono">
                        <span>Đã quét: {syncResult.itemCount || 94} kỹ năng</span>
                        <span>·</span>
                        <span>Mã băm: {syncResult.lastChecksum?.slice(0, 8) || 'Updated'}</span>
                        <span>·</span>
                        <span>Thời gian: {syncResult.lastSyncTime || 'Vừa xong'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Diff items list (if any changes found) */}
                  {syncResult.diff && syncResult.diff.length > 0 ? (
                    <div className="mt-3 space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                        <span>Chi Tiết Các Thay Đổi Phát Hiện Được ({syncResult.diff.length} mục):</span>
                      </div>
                      <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                        {syncResult.diff.map((item, idx) => (
                          <div
                            key={idx}
                            className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-900">{item.skill}</span>
                              <span className="text-[10px] px-1.5 py-0.2 bg-slate-200 text-slate-700 rounded font-semibold">
                                {item.domain}
                              </span>
                            </div>
                            <ul className="mt-1 space-y-0.5 text-[11px] text-slate-600">
                              {item.changes.map((c, cIdx) => (
                                <li key={cIdx} className="flex items-center gap-1.5">
                                  <ArrowRight className="w-3 h-3 text-indigo-500 shrink-0" />
                                  <span>{c}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="mt-2 p-3 rounded-lg bg-slate-50 border border-slate-200 text-center text-xs text-slate-600">
                      <ShieldCheck className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
                      <span>Toàn bộ dữ liệu trên file Excel trùng khớp 100% với dữ liệu hiện tại trên web app. Không phát hiện xung đột.</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-rose-950 font-bold text-xs block">
                      Không Thể Hoàn Tất Đồng Bộ
                    </strong>
                    <p className="text-rose-800 text-[11px] mt-0.5">
                      {syncResult.error || 'Vui lòng kiểm tra lại liên kết SharePoint hoặc tính khả dụng của file.'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
          <div className="text-slate-500 text-[11px] flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Lần kiểm tra gần nhất: {syncState?.lastCheckTime || 'Chưa kiểm tra'}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                resetDialog();
                onClose();
              }}
              className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs"
            >
              {syncResult ? 'Hoàn Tất & Đóng' : 'Hủy'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
