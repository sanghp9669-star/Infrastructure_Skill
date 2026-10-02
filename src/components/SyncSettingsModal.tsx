import React, { useState } from 'react';
import { RefreshCw, Check, AlertCircle, Clock, Link2, Settings, History, Shield, Play } from 'lucide-react';

export interface SyncHistoryItem {
  timestamp: string;
  status: 'updated' | 'unchanged' | 'error';
  message: string;
  itemCount?: number;
}

export interface SyncState {
  url: string;
  lastChecksum: string;
  lastCheckTime: string;
  lastSyncTime: string;
  status: string;
  intervalMinutes: number;
  enabled: boolean;
  history: SyncHistoryItem[];
}

interface SyncSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  syncState: SyncState | null;
  onTriggerSync: (force?: boolean) => Promise<void>;
  onUpdateConfig: (config: { intervalMinutes?: number; enabled?: boolean; url?: string }) => Promise<void>;
  isSyncing: boolean;
}

export const SyncSettingsModal: React.FC<SyncSettingsModalProps> = ({
  isOpen,
  onClose,
  syncState,
  onTriggerSync,
  onUpdateConfig,
  isSyncing
}) => {
  const [urlInput, setUrlInput] = useState<string>(syncState?.url || '');
  const [interval, setIntervalVal] = useState<number>(syncState?.intervalMinutes || 5);
  const [isEnabled, setIsEnabled] = useState<boolean>(syncState?.enabled ?? true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSaveConfig = async () => {
    setIsSaving(true);
    await onUpdateConfig({
      url: urlInput.trim(),
      intervalMinutes: Number(interval),
      enabled: isEnabled
    });
    setIsSaving(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleManualSync = async (force: boolean = false) => {
    await onTriggerSync(force);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                Cấu Hình Đồng Bộ Định Kỳ Từ SharePoint Excel
              </h3>
              <p className="text-[11px] text-slate-500">
                Tự động kiểm tra thay đổi và cập nhật ma trận kỹ năng lên web
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-700">
          {/* Status summary banner */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-3 gap-2 text-center">
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-semibold">Trạng Thái Định Kỳ</span>
              <div className="flex items-center justify-center gap-1.5 mt-0.5">
                <span className={`w-2 h-2 rounded-full ${syncState?.enabled ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                <strong className={`font-bold ${syncState?.enabled ? 'text-emerald-700' : 'text-slate-600'}`}>
                  {syncState?.enabled ? 'Đang Hoạt Động' : 'Đã Tạm Dừng'}
                </strong>
              </div>
              <span className="text-[10px] text-slate-400">
                {syncState?.enabled ? `Mỗi ${syncState?.intervalMinutes || 5} phút` : 'Thủ công'}
              </span>
            </div>

            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-semibold">Lần Kiểm Tra Cuối</span>
              <strong className="text-slate-800 font-mono block text-xs mt-0.5 tabular-nums">
                {syncState?.lastCheckTime || 'Chưa kiểm tra'}
              </strong>
              <span className="text-[10px] text-slate-400">Tự động đối chiếu Hash</span>
            </div>

            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-semibold">Cập Nhật Mới Nhất</span>
              <strong className="text-indigo-700 font-mono block text-xs mt-0.5 tabular-nums">
                {syncState?.lastSyncTime || 'Khởi tạo ban đầu'}
              </strong>
              <span className="text-[10px] text-slate-400">MD5: {syncState?.lastChecksum?.slice(0, 8) || 'Init'}</span>
            </div>
          </div>

          {/* SharePoint URL config */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-800 flex items-center gap-1.5">
              <Link2 className="w-3.5 h-3.5 text-indigo-600" />
              <span>Đường dẫn file Excel trên SharePoint / OneDrive:</span>
            </label>
            <input
              type="text"
              value={urlInput}
              onChange={e => setUrlInput(e.target.value)}
              placeholder="https://viendatvidaco-my.sharepoint.com/:x:/g/personal/..."
              className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
            <span className="text-[11px] text-slate-500 block">
              Hệ thống sử dụng đường dẫn này để tự động tải và đối chiếu mã băm (MD5 checksum) của file Excel.
            </span>
          </div>

          {/* Sync Frequency & Toggle */}
          <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-200">
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-indigo-600" />
                <span>Chu kỳ kiểm tra định kỳ:</span>
              </label>
              <select
                value={interval}
                onChange={e => setIntervalVal(Number(e.target.value))}
                className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800 focus:outline-hidden"
              >
                <option value={1}>1 phút một lần (Kiểm tra liên tục)</option>
                <option value={5}>5 phút một lần (Khuyến nghị)</option>
                <option value={15}>15 phút một lần</option>
                <option value={30}>30 phút một lần</option>
                <option value={60}>1 tiếng một lần</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1 flex items-center gap-1.5">
                <Settings className="w-3.5 h-3.5 text-indigo-600" />
                <span>Tự động kiểm tra ngầm:</span>
              </label>
              <div className="flex items-center gap-3 mt-1.5">
                <label className="inline-flex items-center gap-2 cursor-pointer font-medium">
                  <input
                    type="checkbox"
                    checked={isEnabled}
                    onChange={e => setIsEnabled(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Bật tính năng đồng bộ định kỳ</span>
                </label>
              </div>
            </div>
          </div>

          {/* Manual Trigger Buttons */}
          <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100 flex flex-wrap items-center justify-between gap-3">
            <div>
              <strong className="text-xs font-bold text-indigo-950 block">Kiểm Tra Ngay Lập Tức</strong>
              <span className="text-[11px] text-indigo-700">
                Tải file Excel ngay để kiểm tra xem có thay đổi nào chưa được cập nhật.
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleManualSync(false)}
                disabled={isSyncing}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg font-semibold text-xs transition-colors shadow-2xs"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>Kiểm tra thay đổi</span>
              </button>
              <button
                onClick={() => handleManualSync(true)}
                disabled={isSyncing}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 rounded-lg font-medium text-xs transition-colors"
                title="Bỏ qua checksum và nạp lại toàn bộ file từ SharePoint"
              >
                <span>Nạp cưỡng bức</span>
              </button>
            </div>
          </div>

          {/* Sync History / Changelog Timeline */}
          <div>
            <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-1.5 text-xs">
              <History className="w-3.5 h-3.5 text-slate-500" />
              <span>Nhật Ký Đồng Bộ Gần Nhất (Changelog Audit)</span>
            </h4>
            <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
              {(!syncState?.history || syncState.history.length === 0) ? (
                <div className="text-slate-400 text-center py-4 bg-slate-50 rounded-lg">
                  Chưa có lịch sử đồng bộ ghi nhận.
                </div>
              ) : (
                syncState.history.map((h, idx) => (
                  <div
                    key={idx}
                    className="p-2 rounded-lg bg-slate-50 border border-slate-200/80 flex items-center justify-between text-[11px]"
                  >
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${
                        h.status === 'updated'
                          ? 'bg-emerald-500'
                          : h.status === 'error'
                          ? 'bg-rose-500'
                          : 'bg-slate-400'
                      }`} />
                      <span className="text-slate-800 font-medium">{h.message}</span>
                    </div>
                    <span className="text-slate-400 font-mono text-[10px] tabular-nums shrink-0 ml-2">
                      {h.timestamp}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div>
            {saveSuccess && (
              <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold text-xs">
                <Check className="w-3.5 h-3.5" />
                <span>Đã lưu cài đặt chu kỳ đồng bộ!</span>
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Đóng
            </button>
            <button
              onClick={handleSaveConfig}
              disabled={isSaving}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs"
            >
              {isSaving ? 'Đang lưu...' : 'Lưu Cài Đặt'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
