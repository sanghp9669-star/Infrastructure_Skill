import React, { useState, useMemo } from 'react';
import { AuditLogEntry, CompetencyLevel, TeamMember } from '../types/skills';
import { COMPETENCY_DEFINITIONS } from '../data/initialData';
import { 
  History, 
  X, 
  Search, 
  Filter, 
  RotateCcw, 
  Download, 
  Trash2, 
  ArrowRight, 
  CheckCircle2, 
  TrendingUp, 
  User, 
  Calendar, 
  Clock, 
  Layers, 
  Sparkles,
  ExternalLink,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';

interface AuditLogDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  logs: AuditLogEntry[];
  members: TeamMember[];
  onRevertChange?: (log: AuditLogEntry) => void;
  onNavigateToSkill?: (skillId: number, memberName: string) => void;
  onClearLogs?: () => void;
}

// Format relative time in Vietnamese
const getRelativeTime = (isoString: string) => {
  try {
    const now = new Date();
    const date = new Date(isoString);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Vừa xong';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} phút trước`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} giờ trước`;
    if (diffInSeconds < 172800) return 'Hôm qua';
    return `${Math.floor(diffInSeconds / 86400)} ngày trước`;
  } catch {
    return isoString;
  }
};

const getExactTime = (isoString: string) => {
  try {
    const d = new Date(isoString);
    return d.toLocaleString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch {
    return isoString;
  }
};

export const AuditLogDrawer: React.FC<AuditLogDrawerProps> = ({
  isOpen,
  onClose,
  logs,
  members,
  onRevertChange,
  onNavigateToSkill,
  onClearLogs
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMember, setSelectedMember] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');

  // Filter logs
  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      // 1. Member filter
      if (selectedMember !== 'all' && log.memberName !== selectedMember) {
        return false;
      }
      // 2. Type filter
      if (selectedType === 'rating' && log.changeType !== 'rating') {
        return false;
      }
      if (selectedType === 'l2_only' && (log.newValue !== 'L2' || log.changeType !== 'rating')) {
        return false;
      }
      if (selectedType === 'roles' && !log.changeType.startsWith('role_')) {
        return false;
      }

      // 3. Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchSkill = log.skillName.toLowerCase().includes(q);
        const matchMember = log.memberName.toLowerCase().includes(q);
        const matchDomain = log.domain.toLowerCase().includes(q);
        const matchNote = (log.notes || '').toLowerCase().includes(q);
        const matchAuthor = (log.performedBy || '').toLowerCase().includes(q);
        return matchSkill || matchMember || matchDomain || matchNote || matchAuthor;
      }

      return true;
    });
  }, [logs, selectedMember, selectedType, searchQuery]);

  // Statistics
  const stats = useMemo(() => {
    const total = logs.length;
    const l2Promotions = logs.filter(l => l.changeType === 'rating' && l.newValue === 'L2').length;
    const roleChanges = logs.filter(l => l.changeType.startsWith('role_')).length;
    
    // Most active member
    const counts: Record<string, number> = {};
    logs.forEach(l => {
      counts[l.memberName] = (counts[l.memberName] || 0) + 1;
    });
    let topMember = '-';
    let topCount = 0;
    Object.entries(counts).forEach(([m, count]) => {
      if (count > topCount) {
        topCount = count;
        topMember = m;
      }
    });

    return { total, l2Promotions, roleChanges, topMember, topCount };
  }, [logs]);

  if (!isOpen) return null;

  // Export audit log to CSV
  const handleExportCSV = () => {
    if (logs.length === 0) return;
    const header = ['Thời gian', 'Kỹ sư', 'Kỹ năng', 'Phân khúc', 'Loại thay đổi', 'Giá trị cũ', 'Giá trị mới', 'Người thực hiện', 'Ghi chú'];
    const rows = logs.map(l => [
      `"${getExactTime(l.timestamp)}"`,
      `"${l.memberName}"`,
      `"${l.skillName}"`,
      `"${l.domain}"`,
      `"${l.changeType}"`,
      `"${l.oldValue || 'Trống'}"`,
      `"${l.newValue}"`,
      `"${l.performedBy || ''}"`,
      `"${l.notes || ''}"`
    ]);

    const csvContent = '\uFEFF' + [header.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Audit_Log_Skill_Matrix_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getLevelBadge = (level: string) => {
    if (level === 'L2') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
          L2 · Đã làm thực tế
        </span>
      );
    }
    if (level === 'L1') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-orange-100 text-orange-900 border border-orange-300">
          L1 · Đã biết
        </span>
      );
    }
    if (level === 'L0') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
          L0 · Chưa biết
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
        {level || 'Chưa gán'}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs flex justify-end no-print animate-in fade-in duration-200">
      <div 
        className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-250"
        role="dialog"
        aria-modal="true"
      >
        {/* Drawer Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/90 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white shadow-sm">
              <History className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  Lịch Sử Thay Đổi
                </h2>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200">
                  {logs.length} lần
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Theo dõi tất cả các lần cập nhật đánh giá kỹ năng và người phụ trách
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {logs.length > 0 && (
              <button
                type="button"
                onClick={handleExportCSV}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors shadow-2xs"
                title="Xuất lịch sử thay đổi ra file CSV"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden sm:inline">Xuất CSV</span>
              </button>
            )}

            {onClearLogs && logs.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Bạn có chắc chắn muốn xóa toàn bộ lịch sử thay đổi này không?')) {
                    onClearLogs();
                  }
                }}
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                title="Xóa toàn bộ lịch sử"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors ml-1"
              title="Đóng bảng lịch sử"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick KPI Stats Summary */}
        <div className="grid grid-cols-3 gap-2 px-6 py-3 bg-white border-b border-slate-100 text-xs shrink-0">
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-[11px] text-slate-500 font-medium block">Tổng lượt cập nhật</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-lg font-bold text-slate-900">{stats.total}</span>
              <span className="text-[10px] text-slate-400">lần</span>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200/80">
            <span className="text-[11px] text-emerald-800 font-medium block flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-emerald-600" />
              Nâng cấp lên L2
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-lg font-bold text-emerald-950">{stats.l2Promotions}</span>
              <span className="text-[10px] text-emerald-700 font-semibold">kỹ năng</span>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-indigo-50/70 border border-indigo-200/80">
            <span className="text-[11px] text-indigo-800 font-medium block flex items-center gap-1">
              <User className="w-3 h-3 text-indigo-600" />
              Cập nhật nhiều nhất
            </span>
            <div className="flex items-baseline gap-1 mt-0.5 truncate">
              <span className="text-sm font-bold text-indigo-950 truncate">{stats.topMember}</span>
              {stats.topCount > 0 && (
                <span className="text-[10px] text-indigo-600 font-semibold shrink-0">
                  ({stats.topCount} lần)
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="px-6 py-3 bg-slate-50/60 border-b border-slate-200 flex flex-wrap items-center gap-2 text-xs shrink-0">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Tìm theo kỹ năng, kỹ sư, ghi chú..."
              className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs placeholder:text-slate-400 focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Member Filter */}
          <select
            value={selectedMember}
            onChange={e => setSelectedMember(e.target.value)}
            className="py-1.5 px-2.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 font-medium focus:outline-hidden focus:border-indigo-500"
          >
            <option value="all">Tất cả kỹ sư ({members.length})</option>
            {members.map(m => (
              <option key={m.name} value={m.name}>
                {m.name}
              </option>
            ))}
          </select>

          {/* Type Filter */}
          <select
            value={selectedType}
            onChange={e => setSelectedType(e.target.value)}
            className="py-1.5 px-2.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 font-medium focus:outline-hidden focus:border-indigo-500"
          >
            <option value="all">Tất cả thay đổi</option>
            <option value="l2_only">Chỉ nâng cấp L2</option>
            <option value="rating">Đổi điểm (L0/L1/L2)</option>
            <option value="roles">Phân công vai trò</option>
          </select>
        </div>

        {/* Log Entries List */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3 bg-slate-50/30">
          {filteredLogs.length === 0 ? (
            <div className="py-16 text-center text-slate-400 space-y-2">
              <History className="w-10 h-10 mx-auto text-slate-300 stroke-1" />
              <p className="text-xs font-semibold text-slate-600">
                Không tìm thấy sự kiện thay đổi nào phù hợp
              </p>
              <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                Khi các kỹ sư hoặc quản lý cập nhật điểm số L0-L2 trên bảng ma trận, các bản ghi sẽ xuất hiện tự động tại đây.
              </p>
            </div>
          ) : (
            filteredLogs.map(log => {
              const isL2Upgrade = log.changeType === 'rating' && log.newValue === 'L2' && log.oldValue !== 'L2';
              const isRoleChange = log.changeType.startsWith('role_');

              return (
                <div
                  key={log.id}
                  className={`p-3.5 rounded-xl border bg-white shadow-2xs hover:shadow-sm transition-all ${
                    isL2Upgrade
                      ? 'border-emerald-200/90 ring-1 ring-emerald-100'
                      : isRoleChange
                      ? 'border-indigo-200/90'
                      : 'border-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      {/* Avatar / Initials */}
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                        isL2Upgrade
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-indigo-100 text-indigo-800'
                      }`}>
                        {log.memberName.slice(0, 2).toUpperCase()}
                      </div>

                      <div className="space-y-1">
                        {/* Member name & Skill */}
                        <div className="flex flex-wrap items-center gap-1.5 text-xs">
                          <span className="font-bold text-slate-900">{log.memberName}</span>
                          <span className="text-slate-400">·</span>
                          <span className="font-semibold text-indigo-900">{log.skillName}</span>
                          <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded font-normal">
                            {log.domain}
                          </span>
                        </div>

                        {/* Transition representation: Old -> New */}
                        <div className="flex items-center gap-2 pt-0.5">
                          <span className="text-[11px] text-slate-500">
                            {isRoleChange ? 'Vai trò:' : 'Trình độ:'}
                          </span>
                          {getLevelBadge(log.oldValue)}
                          <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          {getLevelBadge(log.newValue)}

                          {isL2Upgrade && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                              <Sparkles className="w-3 h-3 text-emerald-600" />
                              Lên chuẩn L2
                            </span>
                          )}
                        </div>

                        {/* Note & Performer */}
                        {log.notes && (
                          <p className="text-[11px] text-slate-600 italic bg-slate-50 px-2 py-1 rounded border border-slate-100 mt-1">
                            "{log.notes}"
                          </p>
                        )}

                        <div className="flex items-center gap-3 text-[10px] text-slate-400 pt-1">
                          {log.performedBy && (
                            <span>Bởi: <strong className="text-slate-600">{log.performedBy}</strong></span>
                          )}
                          <span title={getExactTime(log.timestamp)} className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            {getRelativeTime(log.timestamp)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions: View in Table & Revert */}
                    <div className="flex items-center gap-1 shrink-0">
                      {onNavigateToSkill && (
                        <button
                          type="button"
                          onClick={() => {
                            onNavigateToSkill(log.skillId, log.memberName);
                            onClose();
                          }}
                          className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                          title="Xem vị trí ô kỹ năng này trên bảng ma trận"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {onRevertChange && log.changeType === 'rating' && log.oldValue && (
                        <button
                          type="button"
                          onClick={() => onRevertChange(log)}
                          className="p-1 text-slate-400 hover:text-amber-700 hover:bg-amber-50 rounded transition-colors"
                          title={`Hoàn tác: Khôi phục lại cấp độ ${log.oldValue}`}
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="px-6 py-3 border-t border-slate-200 bg-white flex items-center justify-between text-xs text-slate-500 shrink-0">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Dữ liệu nhật ký được tự động lưu trữ và đồng bộ</span>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
