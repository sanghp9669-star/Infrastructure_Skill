import React, { useState, useRef } from 'react';
import { 
  RefreshCw, 
  ArrowDownToLine, 
  ArrowUpFromLine, 
  Settings2, 
  CheckCircle2, 
  AlertTriangle, 
  X, 
  ExternalLink, 
  Download, 
  Upload, 
  FileSpreadsheet, 
  Link2, 
  Zap, 
  Layers, 
  Clock, 
  ShieldCheck,
  Check,
  HelpCircle,
  Copy,
  FolderSync,
  Database
} from 'lucide-react';
import { SkillItem, TeamMember } from '../types/skills';
import { SyncState } from './SyncSettingsModal';
import { isSupabaseConfigured, SUPABASE_SQL_SCHEMA, getSupabaseConfig, setSupabaseConfig } from '../lib/supabase';
import { 
  syncAllSkillsToSupabase, 
  fetchSkillsFromSupabase,
  syncAllMembersToSupabase,
  fetchMembersFromSupabase,
  syncAllDataToSupabase
} from '../utils/supabaseSync';

export interface DiffItem {
  skill: string;
  domain: string;
  type: 'added' | 'modified' | 'removed';
  changes: string[];
}

export interface SyncResult {
  success: boolean;
  changed?: boolean;
  itemCount?: number;
  diffCount?: number;
  diff?: DiffItem[];
  source?: string;
  message?: string;
  skills?: SkillItem[];
  lastChecksum?: string;
  lastSyncTime?: string;
  status?: string;
  error?: string;
}

interface TwoWaySharePointSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  syncState: SyncState | null;
  skills: SkillItem[];
  members: TeamMember[];
  onPullFromSharePoint: (url?: string) => Promise<SyncResult | null>;
  onPullFromFile: (fileBase64: string, filename: string) => Promise<SyncResult | null>;
  onPushToSharePoint: (webhookUrl?: string) => Promise<SyncResult | null>;
  onUpdateConfig: (config: { intervalMinutes?: number; enabled?: boolean; url?: string; webhookUrl?: string; autoPushOnEdit?: boolean }) => Promise<void>;
  isSyncing: boolean;
}

export const TwoWaySharePointSyncModal: React.FC<TwoWaySharePointSyncModalProps> = ({
  isOpen,
  onClose,
  syncState,
  skills,
  members,
  onPullFromSharePoint,
  onPullFromFile,
  onPushToSharePoint,
  onUpdateConfig,
  isSyncing
}) => {
  const [activeTab, setActiveTab] = useState<'pull' | 'push' | 'supabase' | 'settings'>('push');

  // Supabase Tab State
  const [supabaseLoading, setSupabaseLoading] = useState(false);
  const [supabaseStatusMsg, setSupabaseStatusMsg] = useState<{ type: 'success' | 'error'; message: string; details?: string } | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);
  const [supabaseUrlInput, setSupabaseUrlInput] = useState(() => getSupabaseConfig().url);
  const [supabaseKeyInput, setSupabaseKeyInput] = useState(() => getSupabaseConfig().key);
  const [isConfigExpanded, setIsConfigExpanded] = useState(false);

  // Pull Tab State
  const [pullUrl, setPullUrl] = useState<string>(syncState?.url || '');
  const [pullMode, setPullMode] = useState<'url' | 'upload'>('url');
  const [pullFile, setPullFile] = useState<File | null>(null);
  const [pullStep, setPullStep] = useState<number>(0);
  const [pullResult, setPullResult] = useState<SyncResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Push Tab State
  const [pushWebhookUrl, setPushWebhookUrl] = useState<string>((syncState as any)?.webhookUrl || '');
  const [pushStep, setPushStep] = useState<number>(0);
  const [pushResult, setPushResult] = useState<SyncResult | null>(null);
  const [copiedFlowCode, setCopiedFlowCode] = useState(false);

  // Settings Tab State
  const [interval, setIntervalVal] = useState<number>(syncState?.intervalMinutes || 5);
  const [isEnabled, setIsEnabled] = useState<boolean>(syncState?.enabled ?? true);
  const [autoPushOnEdit, setAutoPushOnEdit] = useState<boolean>((syncState as any)?.autoPushOnEdit ?? true);
  const [isSavingConfig, setIsSavingConfig] = useState(false);
  const [configSaveSuccess, setConfigSaveSuccess] = useState(false);

  // Sync state when modal opens
  React.useEffect(() => {
    if (isOpen) {
      if (syncState?.url) setPullUrl(syncState.url);
      if ((syncState as any)?.webhookUrl) setPushWebhookUrl((syncState as any).webhookUrl);
      if (syncState?.intervalMinutes) setIntervalVal(syncState.intervalMinutes);
      if (syncState?.enabled !== undefined) setIsEnabled(syncState.enabled);
      if ((syncState as any)?.autoPushOnEdit !== undefined) setAutoPushOnEdit((syncState as any).autoPushOnEdit);
    }
  }, [isOpen, syncState]);

  if (!isOpen) return null;

  // Handle Pull from SharePoint URL
  const handleStartPullUrl = async () => {
    setPullResult(null);
    setPullStep(1); // Connecting

    const timer1 = setTimeout(() => setPullStep(2), 600); // Parsing
    const timer2 = setTimeout(() => setPullStep(3), 1400); // Comparing

    const result = await onPullFromSharePoint(pullUrl.trim() || undefined);

    clearTimeout(timer1);
    clearTimeout(timer2);
    setPullStep(4); // Done
    setPullResult(result);
  };

  // Handle Pull from local file
  const handleStartPullFile = () => {
    if (!pullFile) return;
    setPullResult(null);
    setPullStep(1);

    const reader = new FileReader();
    reader.onload = async () => {
      setPullStep(2);
      const base64 = reader.result as string;
      setPullStep(3);
      const result = await onPullFromFile(base64, pullFile.name);
      setPullStep(4);
      setPullResult(result);
    };
    reader.readAsDataURL(pullFile);
  };

  // Handle Push to SharePoint
  const handleStartPush = async () => {
    setPushResult(null);
    setPushStep(1); // Packaging Excel

    const timer1 = setTimeout(() => setPushStep(2), 600); // Sending

    const result = await onPushToSharePoint(pushWebhookUrl.trim() || undefined);

    clearTimeout(timer1);
    setPushStep(3); // Done
    setPushResult(result);
  };

  // Save Settings
  const handleSaveSettings = async () => {
    setIsSavingConfig(true);
    await onUpdateConfig({
      url: pullUrl.trim(),
      webhookUrl: pushWebhookUrl.trim(),
      intervalMinutes: Number(interval),
      enabled: isEnabled,
      autoPushOnEdit
    });
    setIsSavingConfig(false);
    setConfigSaveSuccess(true);
    setTimeout(() => setConfigSaveSuccess(false), 3000);
  };

  const handleDownloadDirectExcel = () => {
    window.location.href = '/api/download-excel';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-slate-900 to-indigo-950 text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-400">
              <FolderSync className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm sm:text-base text-white">
                  Trung Tâm Đồng Bộ 2 Chiều Microsoft SharePoint / OneDrive
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                  Two-Way Sync Hub
                </span>
              </div>
              <p className="text-[11px] text-slate-300">
                Kéo dữ liệu từ SharePoint về Web & Đẩy dữ liệu cập nhật từ Web ngược lại file Excel
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
            title="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6 pt-3 bg-slate-50 border-b border-slate-200 flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('pull')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all border-t border-x ${
              activeTab === 'pull'
                ? 'bg-white text-indigo-700 border-slate-200 -mb-px shadow-2xs font-extrabold'
                : 'text-slate-600 hover:text-slate-900 border-transparent hover:bg-slate-100'
            }`}
          >
            <ArrowDownToLine className="w-4 h-4 text-indigo-600" />
            <span>1. Kéo Về Web (SharePoint ➔ Web)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('push')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all border-t border-x ${
              activeTab === 'push'
                ? 'bg-white text-indigo-700 border-slate-200 -mb-px shadow-2xs font-extrabold'
                : 'text-slate-600 hover:text-slate-900 border-transparent hover:bg-slate-100'
            }`}
          >
            <ArrowUpFromLine className="w-4 h-4 text-emerald-600" />
            <span>2. Đẩy Lên SharePoint (Web ➔ SharePoint)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('supabase')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all border-t border-x ${
              activeTab === 'supabase'
                ? 'bg-white text-emerald-700 border-slate-200 -mb-px shadow-2xs font-extrabold'
                : 'text-slate-600 hover:text-slate-900 border-transparent hover:bg-slate-100'
            }`}
          >
            <Database className="w-4 h-4 text-emerald-600" />
            <span>3. Cơ Sở Dữ Liệu Supabase</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all border-t border-x ${
              activeTab === 'settings'
                ? 'bg-white text-indigo-700 border-slate-200 -mb-px shadow-2xs font-extrabold'
                : 'text-slate-600 hover:text-slate-900 border-transparent hover:bg-slate-100'
            }`}
          >
            <Settings2 className="w-4 h-4 text-slate-500" />
            <span>4. Tự Động Hóa & Lịch Sử (Settings)</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-slate-700">
          
          {/* ================= TAB 1: PULL (SharePoint -> Web) ================= */}
          {activeTab === 'pull' && (
            <div className="space-y-5">
              {/* Overview banner */}
              <div className="p-4 bg-indigo-50/60 rounded-xl border border-indigo-100 flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <ArrowDownToLine className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">
                    Kéo Dữ Liệu Ma Trận Từ File Excel SharePoint
                  </h4>
                  <p className="text-slate-600 text-xs mt-0.5 leading-relaxed">
                    Hệ thống sẽ tải file Excel từ đường link chia sẻ, phân tích cú pháp Sheet <code>Team Skill Matrix</code>, kiểm tra mã Checksum và tự động cập nhật đánh giá mới nhất lên ứng dụng web.
                  </p>
                </div>
              </div>

              {/* Source Mode Toggle */}
              <div className="flex items-center gap-3">
                <span className="font-bold text-slate-700">Nguồn dữ liệu:</span>
                <div className="inline-flex bg-slate-100 p-1 rounded-lg border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setPullMode('url')}
                    className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                      pullMode === 'url' ? 'bg-white text-indigo-700 shadow-2xs font-bold' : 'text-slate-600'
                    }`}
                  >
                    Đường Dẫn Trực Tiếp SharePoint
                  </button>
                  <button
                    type="button"
                    onClick={() => setPullMode('upload')}
                    className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                      pullMode === 'upload' ? 'bg-white text-indigo-700 shadow-2xs font-bold' : 'text-slate-600'
                    }`}
                  >
                    Tải File Excel Từ Máy Tính
                  </button>
                </div>
              </div>

              {/* Mode 1: SharePoint URL input */}
              {pullMode === 'url' ? (
                <div className="space-y-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <label className="block text-xs font-bold text-slate-800">
                    Đường dẫn chia sẻ File Excel (SharePoint / OneDrive Link):
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <Link2 className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="url"
                        placeholder="https://viendatvidaco-my.sharepoint.com/:x:/g/personal/... hoặc link download"
                        value={pullUrl}
                        onChange={e => setPullUrl(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleStartPullUrl}
                      disabled={isSyncing || pullStep === 1 || pullStep === 2 || pullStep === 3}
                      className="inline-flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 disabled:opacity-50 text-white font-bold rounded-lg transition-all shadow-xs shrink-0"
                    >
                      <RefreshCw className={`w-4 h-4 ${pullStep > 0 && pullStep < 4 ? 'animate-spin' : ''}`} />
                      <span>{pullStep > 0 && pullStep < 4 ? 'Đang Xử Lý...' : 'Kéo Dữ Liệu Ngay'}</span>
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Hỗ trợ tất cả định dạng link chia sẻ của Microsoft 365, SharePoint Online và OneDrive Doanh Nghiệp.
                  </p>
                </div>
              ) : (
                /* Mode 2: Local File Upload */
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx, .xls"
                    className="hidden"
                    onChange={e => {
                      if (e.target.files && e.target.files[0]) {
                        setPullFile(e.target.files[0]);
                      }
                    }}
                  />
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-xl p-6 text-center cursor-pointer bg-white transition-all"
                  >
                    <FileSpreadsheet className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
                    <p className="font-bold text-slate-800">
                      {pullFile ? pullFile.name : 'Nhấp để chọn file Excel (.xlsx) từ máy tính'}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1">
                      {pullFile ? `${(pullFile.size / 1024).toFixed(1)} KB` : 'Hoặc kéo thả file Excel ma trận kỹ năng vào đây'}
                    </p>
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleStartPullFile}
                      disabled={!pullFile || pullStep > 0 && pullStep < 4}
                      className="inline-flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-lg shadow-xs"
                    >
                      <RefreshCw className={`w-4 h-4 ${pullStep > 0 && pullStep < 4 ? 'animate-spin' : ''}`} />
                      <span>Đồng Bộ Từ File Này</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Progress Steps */}
              {pullStep > 0 && pullStep < 4 && (
                <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                    <span>Tiến Trình Kiểm Tra & Đồng Bộ:</span>
                    <span className="text-indigo-600 font-mono">Đang thực hiện...</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
                    <div className={`p-2 rounded-lg border ${pullStep >= 1 ? 'bg-indigo-50 border-indigo-300 text-indigo-900 font-bold' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
                      1. Kết nối SharePoint
                    </div>
                    <div className={`p-2 rounded-lg border ${pullStep >= 2 ? 'bg-indigo-50 border-indigo-300 text-indigo-900 font-bold' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
                      2. Đọc Sheet Ma Trận
                    </div>
                    <div className={`p-2 rounded-lg border ${pullStep >= 3 ? 'bg-indigo-50 border-indigo-300 text-indigo-900 font-bold' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
                      3. So Khớp Checksum
                    </div>
                  </div>
                </div>
              )}

              {/* Pull Result Box */}
              {pullResult && (
                <div className={`p-4 rounded-xl border animate-in fade-in ${
                  pullResult.success ? 'bg-emerald-50/70 border-emerald-200' : 'bg-rose-50/70 border-rose-200'
                }`}>
                  <div className="flex items-start gap-3">
                    {pullResult.success ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-slate-900 text-sm">
                          {pullResult.success ? 'Đồng Bộ Thành Công!' : 'Không Thể Kết Nối'}
                        </h4>
                        <span className="text-[11px] text-slate-500 font-mono">
                          {new Date().toLocaleTimeString('vi-VN')}
                        </span>
                      </div>
                      <p className="text-xs text-slate-700">
                        {pullResult.message || (pullResult.changed ? 'Đã phát hiện thay đổi trên SharePoint và cập nhật vào ma trận web.' : 'Dữ liệu giữa SharePoint và Web đã hoàn toàn khớp nhau, không có thay đổi.')}
                      </p>

                      {/* Diff Items Details */}
                      {pullResult.diff && pullResult.diff.length > 0 && (
                        <div className="mt-3 bg-white p-3 rounded-lg border border-slate-200 max-h-48 overflow-y-auto space-y-1.5">
                          <span className="font-bold text-slate-800 text-[11px] block">
                            Chi tiết thay đổi ({pullResult.diff.length} mục):
                          </span>
                          {pullResult.diff.map((d, i) => (
                            <div key={i} className="text-[11px] text-slate-700 flex items-start gap-2">
                              <span className={`px-1.5 py-0.2 rounded font-mono font-bold text-[10px] ${
                                d.type === 'added' ? 'bg-emerald-100 text-emerald-800' : 'bg-indigo-100 text-indigo-800'
                              }`}>
                                {d.type === 'added' ? '+ Mới' : 'Δ Sửa'}
                              </span>
                              <span><strong>{d.skill}</strong>: {d.changes.join(', ')}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ================= TAB 2: PUSH (Web -> SharePoint) ================= */}
          {activeTab === 'push' && (
            <div className="space-y-5">
              {/* Overview banner */}
              <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-100 flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <ArrowUpFromLine className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">
                    Đẩy & Ghi Đè Dữ Liệu Ngược Lại SharePoint Excel
                  </h4>
                  <p className="text-slate-600 text-xs mt-0.5 leading-relaxed">
                    Tất cả các thay đổi vừa chỉnh sửa trên Web (đánh giá L0–L2, phân công vai trò, thêm kỹ năng mới) sẽ được đóng gói chuẩn cấu trúc Excel và gửi trực tiếp lên SharePoint hoặc xuất file tải về.
                  </p>
                </div>
              </div>

              {/* Option A: Push via Power Automate Webhook */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-[10px]">
                      A
                    </span>
                    <h5 className="font-bold text-slate-800 text-xs">
                      Tùy Chọn 1: Đẩy Tự Động Lên SharePoint Qua Webhook / Power Automate (Khuyên Dùng)
                    </h5>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200">
                    Trực Tiếp & Tức Thì
                  </span>
                </div>

                <p className="text-[11px] text-slate-600">
                  Nhập URL Webhook (Microsoft Power Automate HTTP Trigger / Logic Apps). Khi nhấp nút, hệ thống sẽ POST toàn bộ file Excel chuẩn hóa sang Cloud Flow để tự động ghi đè file trên SharePoint mà không cần làm thủ công.
                </p>

                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    placeholder="https://prod-xx.southeastasia.logic.azure.com:443/workflows/... hoặc webhook url"
                    value={pushWebhookUrl}
                    onChange={e => setPushWebhookUrl(e.target.value)}
                    className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={handleStartPush}
                    disabled={pushStep === 1 || pushStep === 2}
                    className="inline-flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold rounded-lg transition-all shadow-xs shrink-0"
                  >
                    <ArrowUpFromLine className={`w-4 h-4 ${pushStep > 0 && pushStep < 3 ? 'animate-bounce' : ''}`} />
                    <span>{pushStep > 0 && pushStep < 3 ? 'Đang Đẩy...' : 'Đẩy Lên SharePoint Ngay'}</span>
                  </button>
                </div>

                {/* Push Result Box */}
                {pushResult && (
                  <div className={`p-3 rounded-lg border text-xs flex items-center justify-between ${
                    pushResult.success ? 'bg-emerald-50 text-emerald-900 border-emerald-300' : 'bg-rose-50 text-rose-900 border-rose-300'
                  }`}>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{pushResult.message}</span>
                    </div>
                    <span className="font-mono text-[10px] text-slate-500">
                      {new Date().toLocaleTimeString('vi-VN')}
                    </span>
                  </div>
                )}
              </div>

              {/* Option B: Direct Download Excel File */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-[10px]">
                      B
                    </span>
                    <h5 className="font-bold text-slate-800 text-xs">
                      Tùy Chọn 2: Tải File Excel Đã Đồng Bộ Về Máy (Lưu Vào Thư Mục Đồng Bộ SharePoint)
                    </h5>
                  </div>
                  <span className="text-[10px] font-bold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                    Thủ Công / File Lưu Trữ
                  </span>
                </div>

                <p className="text-[11px] text-slate-600">
                  Tải ngay file <code>Infrastructure_Skill_Matrix_Updated.xlsx</code> chứa toàn bộ {skills.length} kỹ năng và 3 Sheet chuẩn hóa để lưu đè vào thư mục OneDrive / SharePoint trên máy tính của bạn.
                </p>

                <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-slate-200">
                  <div className="flex items-center gap-2.5">
                    <FileSpreadsheet className="w-6 h-6 text-emerald-600" />
                    <div>
                      <span className="font-bold text-slate-900 block text-xs">
                        Infrastructure_Skill_Matrix_15Domains_Updated.xlsx
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {skills.length} Kỹ Năng · {members.length} Kỹ Sư · 3 Sheet Chuẩn Hóa
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleDownloadDirectExcel}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold rounded-lg shadow-xs transition-all"
                  >
                    <Download className="w-4 h-4" />
                    <span>Tải File Excel Về Máy</span>
                  </button>
                </div>
              </div>

              {/* Power Automate Flow 3-Step Setup Guide */}
              <div className="p-4 rounded-xl bg-indigo-50/40 border border-indigo-200/80 space-y-2">
                <div className="flex items-center gap-2 text-indigo-950 font-bold">
                  <Zap className="w-4 h-4 text-indigo-600" />
                  <span>Hướng dẫn nhanh thiết lập Microsoft Power Automate Flow (3 Bước):</span>
                </div>
                <ol className="list-decimal list-inside space-y-1.5 text-[11px] text-indigo-900 leading-relaxed pl-1">
                  <li>Mở <strong>Power Automate</strong> ➔ Tạo <strong>Instant Cloud Flow</strong> ➔ Chọn trigger <code>When an HTTP request is received</code>.</li>
                  <li>Thêm action <strong>SharePoint</strong>: <code>Update file</code> hoặc <code>Create file</code> ➔ Chọn Thư viện tài liệu & đường dẫn file Excel ma trận.</li>
                  <li>Lưu Flow, sao chép <strong>HTTP POST URL</strong> dán vào ô Webhook ở trên. Hệ thống sẽ tự động đồng bộ mỗi khi bạn cập nhật!</li>
                </ol>
              </div>
            </div>
          )}

          {/* ================= TAB 3: SUPABASE DATABASE ================= */}
          {activeTab === 'supabase' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              {/* Overview banner */}
              <div className="p-4 bg-emerald-50/70 rounded-xl border border-emerald-200 flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <Database className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h4 className="font-bold text-slate-900 text-sm">
                      Lưu Trữ Cơ Sở Dữ Liệu Quan Hệ Supabase (PostgreSQL)
                    </h4>
                    <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full border ${
                      isSupabaseConfigured()
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : 'bg-amber-100 text-amber-800 border-amber-300'
                    }`}>
                      {isSupabaseConfigured() ? '✓ Đã Kết Nối Supabase' : 'Chưa Cấu Hình Khóa API'}
                    </span>
                  </div>
                  <p className="text-slate-600 text-xs mt-1 leading-relaxed">
                    Sử dụng cơ sở dữ liệu quan hệ PostgreSQL trên nền tảng Supabase để lưu trữ toàn bộ ma trận kỹ năng, thành viên và nhật ký thay đổi với độ tin cậy và hiệu năng cao.
                  </p>
                </div>
              </div>

              {/* Status Message */}
              {supabaseStatusMsg && (
                <div className={`p-3.5 rounded-xl border text-xs ${
                  supabaseStatusMsg.type === 'success' 
                    ? 'bg-emerald-50 text-emerald-950 border-emerald-300' 
                    : 'bg-rose-50 text-rose-950 border-rose-300'
                }`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2.5">
                      {supabaseStatusMsg.type === 'success' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <span className="font-bold block">{supabaseStatusMsg.message}</span>
                        {supabaseStatusMsg.details && (
                          <div className="mt-1.5 p-2 bg-white/80 rounded border border-rose-200 font-mono text-[10px] text-rose-800">
                            {supabaseStatusMsg.details}
                          </div>
                        )}
                      </div>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => setSupabaseStatusMsg(null)}
                      className="text-slate-400 hover:text-slate-600 text-xs font-bold shrink-0"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              )}

              {/* Direct Supabase Connection Credentials Editor */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Settings2 className="w-4 h-4 text-indigo-600" />
                    <h5 className="font-bold text-slate-800 text-xs">
                      Cấu Hình Kết Nối Supabase (URL & API Key):
                    </h5>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsConfigExpanded(!isConfigExpanded)}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                  >
                    {isConfigExpanded ? 'Thu Gọn' : 'Chỉnh Sửa / Kiểm Tra Khóa'}
                  </button>
                </div>

                {(isConfigExpanded || !isSupabaseConfigured()) && (
                  <div className="space-y-3 pt-2 border-t border-slate-200">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Project URL:
                      </label>
                      <input
                        type="url"
                        placeholder="https://your-project-id.supabase.co"
                        value={supabaseUrlInput}
                        onChange={e => setSupabaseUrlInput(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono focus:outline-hidden focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Project API Key (anon / public key):
                      </label>
                      <input
                        type="text"
                        placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                        value={supabaseKeyInput}
                        onChange={e => setSupabaseKeyInput(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono focus:outline-hidden focus:border-indigo-500"
                      />
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          const saved = setSupabaseConfig(supabaseUrlInput, supabaseKeyInput);
                          setSupabaseUrlInput(saved.url);
                          setSupabaseKeyInput(saved.key);
                          if (saved.url && saved.key) {
                            setSupabaseStatusMsg({
                              type: 'success',
                              message: `Đã lưu và chuẩn hóa URL: ${saved.url}. Bạn có thể bấm nút "Đẩy Toàn Bộ Kỹ Năng Lên Supabase" ngay bây giờ!`
                            });
                          } else {
                            setSupabaseStatusMsg({
                              type: 'error',
                              message: 'Vui lòng nhập đầy đủ cả Project URL (dạng https://xxx.supabase.co) và API Key.'
                            });
                          }
                        }}
                        className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold text-xs rounded-lg transition-all shadow-xs cursor-pointer"
                      >
                        Lưu & Chuẩn Hóa Kết Nối
                      </button>

                      <span className="text-[10px] text-slate-500">
                        URL chuẩn: <code>https://&lt;id-dự-án&gt;.supabase.co</code>
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <h5 className="font-bold text-slate-800 text-xs">
                  Thao Tác Đồng Bộ Trực Tiếp Với Supabase:
                </h5>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    disabled={supabaseLoading || !isSupabaseConfigured()}
                    onClick={async () => {
                      setSupabaseLoading(true);
                      setSupabaseStatusMsg(null);
                      try {
                        if (supabaseUrlInput && supabaseKeyInput) {
                          setSupabaseConfig(supabaseUrlInput, supabaseKeyInput);
                        }
                        const res = await syncAllDataToSupabase(skills, members);
                        if (res.success) {
                          setSupabaseStatusMsg({
                            type: 'success',
                            message: `Đã đồng bộ thành công ${res.skillCount} kỹ năng & ${res.memberCount} thành viên vào các bảng 'skills' và 'team_members' trên Supabase!`
                          });
                        } else {
                          const isInvalidPath = res.error?.includes('Invalid path');
                          setSupabaseStatusMsg({
                            type: 'error',
                            message: isInvalidPath 
                              ? 'Lỗi: Đường dẫn Project URL không hợp lệ (Invalid path specified in request URL).'
                              : (res.error ? `Lỗi từ Supabase: ${res.error}` : 'Không thể kết nối hoặc các bảng chưa tồn tại trong Supabase.'),
                            details: isInvalidPath
                              ? 'Project URL phải có dạng https://<mã-dự-án>.supabase.co. Hãy mở mục "Chỉnh Sửa / Kiểm Tra Khóa" ở trên, dán lại URL chuẩn và bấm Lưu.'
                              : res.error
                          });
                        }
                      } catch (e: any) {
                        setSupabaseStatusMsg({
                          type: 'error',
                          message: `Lỗi đồng bộ: ${e.message}`,
                          details: e.stack || String(e)
                        });
                      } finally {
                        setSupabaseLoading(false);
                      }
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 disabled:opacity-50 text-white font-bold rounded-lg transition-all shadow-xs cursor-pointer"
                  >
                    <ArrowUpFromLine className={`w-4 h-4 ${supabaseLoading ? 'animate-bounce' : ''}`} />
                    <span>{supabaseLoading ? 'Đang Đẩy Lên...' : `Đẩy Toàn Bộ Kỹ Năng (${skills.length}) & Thành Viên (${members.length}) Lên Supabase`}</span>
                  </button>

                  <button
                    type="button"
                    disabled={supabaseLoading || !isSupabaseConfigured()}
                    onClick={async () => {
                      setSupabaseLoading(true);
                      setSupabaseStatusMsg(null);
                      try {
                        if (supabaseUrlInput && supabaseKeyInput) {
                          setSupabaseConfig(supabaseUrlInput, supabaseKeyInput);
                        }
                        const res = await syncAllMembersToSupabase(members);
                        if (res.success) {
                          setSupabaseStatusMsg({
                            type: 'success',
                            message: `Đã nạp thành công toàn bộ ${res.count} thành viên vào bảng team_members trên Supabase!`
                          });
                        } else {
                          setSupabaseStatusMsg({
                            type: 'error',
                            message: res.error ? `Lỗi: ${res.error}` : 'Không thể cập nhật bảng team_members.',
                            details: res.error
                          });
                        }
                      } catch (e: any) {
                        setSupabaseStatusMsg({
                          type: 'error',
                          message: `Lỗi: ${e.message}`
                        });
                      } finally {
                        setSupabaseLoading(false);
                      }
                    }}
                    className="inline-flex items-center gap-2 px-3 py-2 bg-teal-600 hover:bg-teal-700 active:scale-95 disabled:opacity-50 text-white font-bold rounded-lg transition-all shadow-xs cursor-pointer text-xs"
                  >
                    <ArrowUpFromLine className="w-3.5 h-3.5" />
                    <span>Đẩy Riêng Bảng team_members ({members.length})</span>
                  </button>

                  <button
                    type="button"
                    disabled={supabaseLoading || !isSupabaseConfigured()}
                    onClick={async () => {
                      setSupabaseLoading(true);
                      setSupabaseStatusMsg(null);
                      try {
                        const [skillsFetched, membersFetched] = await Promise.all([
                          fetchSkillsFromSupabase(),
                          fetchMembersFromSupabase()
                        ]);
                        let msgParts = [];
                        if (skillsFetched.data && skillsFetched.data.length > 0) {
                          msgParts.push(`${skillsFetched.data.length} kỹ năng`);
                        }
                        if (membersFetched.data && membersFetched.data.length > 0) {
                          msgParts.push(`${membersFetched.data.length} thành viên`);
                        }
                        if (msgParts.length > 0) {
                          setSupabaseStatusMsg({
                            type: 'success',
                            message: `Đã kéo thành công ${msgParts.join(' & ')} từ Supabase về hệ thống web!`
                          });
                        } else {
                          setSupabaseStatusMsg({
                            type: 'error',
                            message: skillsFetched.error || membersFetched.error || 'Không tìm thấy dữ liệu trên Supabase hoặc bảng rỗng.',
                            details: skillsFetched.error || membersFetched.error
                          });
                        }
                      } catch (e: any) {
                        setSupabaseStatusMsg({
                          type: 'error',
                          message: `Lỗi tải: ${e.message}`
                        });
                      } finally {
                        setSupabaseLoading(false);
                      }
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-100 active:scale-95 disabled:opacity-50 text-slate-700 border border-slate-300 font-bold rounded-lg transition-all shadow-xs cursor-pointer"
                  >
                    <ArrowDownToLine className="w-4 h-4 text-emerald-600" />
                    <span>Kéo Dữ Liệu Từ Supabase Về Web</span>
                  </button>
                </div>

                {!isSupabaseConfigured() && (
                  <p className="text-[11px] text-amber-700 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                    💡 <strong>Chưa phát hiện kết nối:</strong> Vui lòng điền <strong>Project URL</strong> và <strong>API Key</strong> ở khung cấu hình phía trên và bấm <em>Lưu & Kết Nối</em>.
                  </p>
                )}
              </div>

              {/* SQL Schema Initialization Script */}
              <div className="p-4 rounded-xl bg-slate-900 text-slate-100 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-emerald-400" />
                    <span className="font-bold text-xs text-white">
                      Mã SQL Khởi Tạo Bảng Cho Supabase SQL Editor
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
                      setCopiedSql(true);
                      setTimeout(() => setCopiedSql(false), 3000);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs transition-colors cursor-pointer"
                  >
                    {copiedSql ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedSql ? 'Đã Sao Chép!' : 'Sao Chép Mã SQL'}</span>
                  </button>
                </div>

                <p className="text-[11px] text-slate-400">
                  Mở <strong>Supabase Dashboard</strong> ➔ <strong>SQL Editor</strong> ➔ Dán đoạn mã này vào và bấm <strong>RUN</strong> để tạo các bảng <code>skills</code>, <code>team_members</code> và <code>audit_logs</code>:
                </p>

                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-[10px] text-slate-300 max-h-48 overflow-y-auto whitespace-pre leading-relaxed select-all">
                  {SUPABASE_SQL_SCHEMA}
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 4: SETTINGS & HISTORY ================= */}
          {activeTab === 'settings' && (
            <div className="space-y-5">
              {/* Automation Config */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Settings2 className="w-4 h-4 text-indigo-600" />
                  <span>Cấu Hình Quét & Đồng Bộ Nền Tự Động</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Instant Auto-Push on Edit Switch */}
                  <div className="p-3 rounded-lg bg-white border border-slate-200 flex items-center justify-between sm:col-span-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800 block text-xs">
                          ⚡ Tự Động Cập Nhật Ngay Lập Tức Xuống File Excel SharePoint Khi Có Sửa Đổi
                        </span>
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                          Bật Mặc Định
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500 block mt-0.5">
                        Mỗi khi bạn chỉnh sửa đánh giá L0–L2, phân công SME/Backup, thêm/xóa kỹ năng trên web, hệ thống sẽ tự động gửi và ghi đè ngay vào file Excel SharePoint.
                      </span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer ml-3 shrink-0">
                      <input
                        type="checkbox"
                        checked={autoPushOnEdit}
                        onChange={e => setAutoPushOnEdit(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-10 h-5 bg-slate-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>

                  {/* Enable Switch */}
                  <div className="p-3 rounded-lg bg-white border border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-800 block text-xs">
                        Trạng Thái Quét Nền Định Kỳ
                      </span>
                      <span className="text-[10px] text-slate-500">
                        Tự động kiểm tra file SharePoint định kỳ
                      </span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isEnabled}
                        onChange={e => setIsEnabled(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-10 h-5 bg-slate-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>

                  {/* Interval Select */}
                  <div className="p-3 rounded-lg bg-white border border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-800 block text-xs">
                        Tần Suất Quét Định Kỳ
                      </span>
                      <span className="text-[10px] text-slate-500">
                        Thời gian giữa các lần kiểm tra
                      </span>
                    </div>
                    <select
                      value={interval}
                      onChange={e => setIntervalVal(Number(e.target.value))}
                      className="px-2.5 py-1 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-bold focus:outline-hidden"
                    >
                      <option value={1}>1 phút</option>
                      <option value={3}>3 phút</option>
                      <option value={5}>5 phút (Khuyên dùng)</option>
                      <option value={15}>15 phút</option>
                      <option value={30}>30 phút</option>
                      <option value={60}>1 giờ</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                  <span className="text-xs text-slate-500">
                    {configSaveSuccess && <span className="text-emerald-600 font-bold">✓ Đã lưu cấu hình thành công!</span>}
                  </span>
                  <button
                    type="button"
                    onClick={handleSaveSettings}
                    disabled={isSavingConfig}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-2xs transition-all"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{isSavingConfig ? 'Đang Lưu...' : 'Lưu Cấu Hình'}</span>
                  </button>
                </div>
              </div>

              {/* Sync History Log */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <Clock className="w-4 h-4 text-indigo-600" />
                    <span>Nhật Ký Đồng Bộ 2 Chiều Gần Đây</span>
                  </h4>
                  <span className="text-[10px] text-slate-500">
                    Lưu trữ 50 lần thao tác gần nhất
                  </span>
                </div>

                {(!syncState?.history || syncState.history.length === 0) ? (
                  <p className="text-xs text-slate-400 italic text-center py-4 bg-white rounded-lg border border-slate-200">
                    Chưa có nhật ký đồng bộ nào.
                  </p>
                ) : (
                  <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1">
                    {syncState.history.map((h, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 bg-white rounded-lg border border-slate-200 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className={`w-2 h-2 rounded-full shrink-0 ${
                            h.status === 'updated' ? 'bg-emerald-500' : h.status === 'error' ? 'bg-rose-500' : 'bg-slate-400'
                          }`} />
                          <span className="font-medium text-slate-800 truncate">{h.message}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono shrink-0 ml-2">
                          {h.timestamp}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-[11px] text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Đồng bộ an toàn · Bảo toàn toàn vẹn dữ liệu ma trận L0–L2</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Đóng
          </button>
        </div>

      </div>
    </div>
  );
};
