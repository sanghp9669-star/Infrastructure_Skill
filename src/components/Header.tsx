import React from 'react';
import { ActiveTab, AppTheme } from '../types/skills';
import { SyncState } from './SyncSettingsModal';
import { ThemeSwitcher } from './ThemeSwitcher';
import { FirebaseAuthButton } from './FirebaseAuthButton';
import { User } from '../firebase';
import { 
  FileSpreadsheet, 
  Download, 
  Printer, 
  Upload, 
  Layers, 
  BarChart3, 
  FolderKanban, 
  AlertTriangle, 
  Users,
  RefreshCw,
  Clock,
  Zap,
  Settings,
  BookOpen,
  History,
  GraduationCap,
  FolderSync
} from 'lucide-react';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenImport: () => void;
  onExportCSV: () => void;
  onExportExcel: () => void;
  onPrintPDF: () => void;
  totalSkills: number;
  syncState: SyncState | null;
  isSyncing: boolean;
  onTriggerSync: () => void;
  onOpenSyncSettings: () => void;
  onOpenManualSync: () => void;
  onOpenCompetencyModal: () => void;
  onOpenAuditLog?: () => void;
  auditLogCount?: number;
  onOpenSkillRequests?: () => void;
  pendingRequestsCount?: number;
  currentTheme?: AppTheme;
  onThemeChange?: (theme: AppTheme) => void;
  onUserChanged?: (user: User | null) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenImport,
  onExportCSV,
  onExportExcel,
  onPrintPDF,
  totalSkills,
  syncState,
  isSyncing,
  onTriggerSync,
  onOpenSyncSettings,
  onOpenManualSync,
  onOpenCompetencyModal,
  onOpenAuditLog,
  auditLogCount,
  onOpenSkillRequests,
  pendingRequestsCount,
  currentTheme = 'light',
  onThemeChange,
  onUserChanged
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Zone 1: Single Text Element Wordmark */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-xs">
              V
            </div>
            <div>
              <a href="#" className="text-base sm:text-lg font-bold tracking-tight text-slate-900 block leading-tight">
                Viendat Skill Matrix
              </a>
              <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
                <span>{totalSkills} Kỹ Năng Hạ Tầng</span>
                <span>·</span>
                {/* Database Primary status chip */}
                <button
                  onClick={onOpenManualSync}
                  className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition-colors cursor-pointer"
                  title="Cơ sở dữ liệu chính: Supabase (Lưu tự động). Nhấp để mở trung tâm đồng bộ."
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-bold">Database: Supabase (Tự Động)</span>
                </button>
              </div>
            </div>
          </div>

          {/* Zone 2: Streamlined Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100/90 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setActiveTab('matrix')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeTab === 'matrix'
                  ? 'bg-white text-indigo-700 shadow-2xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Bảng Kỹ Năng</span>
            </button>

            <button
              onClick={() => setActiveTab('charts')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeTab === 'charts'
                  ? 'bg-white text-indigo-700 shadow-2xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Biểu Đồ & Thành Viên</span>
            </button>

            <button
              onClick={() => setActiveTab('projects')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeTab === 'projects'
                  ? 'bg-white text-indigo-700 shadow-2xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FolderKanban className="w-3.5 h-3.5" />
              <span>Phù Hợp Dự Án</span>
            </button>
          </nav>

          {/* Zone 3: Primary Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Firebase Auth Google Sign-In */}
            <FirebaseAuthButton onUserChanged={onUserChanged} />

            {/* Theme Switcher Button */}
            {onThemeChange && (
              <ThemeSwitcher
                currentTheme={currentTheme}
                onThemeChange={onThemeChange}
              />
            )}

            {/* Skill Requests / Training Requests Button */}
            {onOpenSkillRequests && (
              <button
                onClick={onOpenSkillRequests}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200/90 hover:bg-amber-50 hover:text-amber-900 hover:border-amber-300 rounded-lg transition-colors shadow-2xs relative"
                title="Đề xuất thêm kỹ năng mới hoặc đăng ký học thêm"
              >
                <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
                <span className="hidden sm:inline">Đề Xuất & Học Tập</span>
                {pendingRequestsCount !== undefined && pendingRequestsCount > 0 && (
                  <span className="inline-flex items-center justify-center px-1.5 py-0.2 text-[10px] font-bold text-white bg-amber-500 rounded-full animate-pulse">
                    {pendingRequestsCount}
                  </span>
                )}
              </button>
            )}

            {/* Audit Log / History Button */}
            {onOpenAuditLog && (
              <button
                onClick={onOpenAuditLog}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200/90 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 rounded-lg transition-colors shadow-2xs relative"
                title="Xem lịch sử các lần thay đổi đánh giá"
              >
                <History className="w-3.5 h-3.5 text-indigo-600" />
                <span className="hidden sm:inline">Lịch Sử</span>
                {auditLogCount !== undefined && auditLogCount > 0 && (
                  <span className="inline-flex items-center justify-center px-1.5 py-0.2 text-[10px] font-bold text-white bg-indigo-600 rounded-full">
                    {auditLogCount}
                  </span>
                )}
              </button>
            )}

            {/* Competency Framework Button */}
            <button
              onClick={onOpenCompetencyModal}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200/90 hover:bg-slate-50 hover:text-slate-900 rounded-lg transition-colors shadow-2xs"
              title="Xem giải thích các mức L0 - L1 - L2"
            >
              <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
              <span className="hidden xl:inline">Mức Độ L0-L2</span>
            </button>

            {/* TWO-WAY SHAREPOINT MANUAL SYNC BUTTON */}
            <button
              onClick={onOpenManualSync}
              disabled={isSyncing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 active:scale-95 disabled:opacity-50 rounded-lg transition-all shadow-xs cursor-pointer"
              title="Mở trung tâm đồng bộ thủ công: Kéo từ SharePoint về Web, Đẩy lên SharePoint, hoặc Quản lý Supabase"
            >
              <FolderSync className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Đang Xử Lý...' : 'Đồng Bộ Thủ Công (SharePoint/Excel)'}</span>
            </button>

            <button
              onClick={onOpenImport}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200/90 hover:bg-slate-50 hover:text-slate-900 rounded-lg transition-colors shadow-2xs"
              title="Nhập dữ liệu Excel thủ công"
            >
              <Upload className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden lg:inline">Nhập Excel</span>
            </button>

            <button
              onClick={onExportExcel}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200/90 hover:bg-slate-50 hover:text-slate-900 rounded-lg transition-colors shadow-2xs"
              title="Tải file Excel .xlsx 3 Sheet chuẩn"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden lg:inline">Xuất Excel</span>
            </button>

            <button
              onClick={onPrintPDF}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200/90 hover:bg-slate-50 hover:text-slate-900 rounded-lg transition-colors shadow-2xs"
              title="Tùy chỉnh chọn cột, domain phòng ban và in/xuất file PDF A4 chuyên sâu"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Xuất PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Strip */}
      <div className="md:hidden flex items-center justify-around border-t border-slate-200 bg-slate-50 px-2 py-1.5 overflow-x-auto">
        <button
          onClick={() => setActiveTab('matrix')}
          className={`px-2.5 py-1 text-xs font-medium rounded whitespace-nowrap ${
            activeTab === 'matrix' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-600'
          }`}
        >
          Ma Trận
        </button>
        <button
          onClick={() => setActiveTab('charts')}
          className={`px-2.5 py-1 text-xs font-medium rounded whitespace-nowrap ${
            activeTab === 'charts' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-600'
          }`}
        >
          Biểu Đồ & Thành Viên
        </button>
        <button
          onClick={() => setActiveTab('projects')}
          className={`px-2.5 py-1 text-xs font-medium rounded whitespace-nowrap ${
            activeTab === 'projects' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-600'
          }`}
        >
          Phù Hợp Dự Án
        </button>
      </div>
    </header>
  );
};
