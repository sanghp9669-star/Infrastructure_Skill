import React, { useState, useMemo } from 'react';
import { 
  CompetencyLevel, 
  SkillItem, 
  SkillRequest, 
  SkillRequestStatus, 
  SkillRequestType, 
  SkillRequestUrgency, 
  TeamMember 
} from '../types/skills';
import { 
  GraduationCap, 
  PlusCircle, 
  X, 
  Check, 
  Clock, 
  AlertCircle, 
  Send, 
  ThumbsUp, 
  Sparkles, 
  Layers, 
  User, 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  Flame, 
  ChevronRight, 
  BookOpen, 
  Zap, 
  Lightbulb,
  ArrowRight,
  ShieldCheck,
  TrendingUp
} from 'lucide-react';

interface SkillRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  requests: SkillRequest[];
  domains: string[];
  members: TeamMember[];
  onSubmitRequest: (newReq: Omit<SkillRequest, 'id' | 'createdAt'>, addToMatrixAsPending?: boolean) => void;
  onApproveRequest: (requestId: string, reviewerNotes?: string) => void;
  onRejectRequest: (requestId: string, reviewerNotes?: string) => void;
  onSetInTraining: (requestId: string) => void;
  onToggleUpvote: (requestId: string, memberName: string) => void;
  onDeleteRequest?: (requestId: string) => void;
}

export const SkillRequestModal: React.FC<SkillRequestModalProps> = ({
  isOpen,
  onClose,
  requests,
  domains,
  members,
  onSubmitRequest,
  onApproveRequest,
  onRejectRequest,
  onSetInTraining,
  onToggleUpvote,
  onDeleteRequest
}) => {
  const [activeTab, setActiveTab] = useState<'list' | 'propose' | 'insights'>('list');
  
  // New Proposal Form State
  const [title, setTitle] = useState('');
  const [domain, setDomain] = useState(domains[0] || 'Cloud & Container Platforms');
  const [requestType, setRequestType] = useState<SkillRequestType>('new_skill');
  const [requesterName, setRequesterName] = useState(members[0]?.name || 'Sang');
  const [urgency, setUrgency] = useState<SkillRequestUrgency>('high');
  const [targetLevel, setTargetLevel] = useState<'L1' | 'L2'>('L2');
  const [interestedMembers, setInterestedMembers] = useState<string[]>([members[0]?.name || 'Sang']);
  const [justification, setJustification] = useState('');
  const [addToMatrixAsPending, setAddToMatrixAsPending] = useState(true);

  // Review / Filter State
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [reviewNoteInput, setReviewNoteInput] = useState<Record<string, string>>({});
  const [reviewingId, setReviewingId] = useState<string | null>(null);

  // Filtered Requests List
  const filteredRequests = useMemo(() => {
    return requests.filter(req => {
      if (statusFilter !== 'all' && req.status !== statusFilter) return false;
      if (typeFilter !== 'all' && req.requestType !== typeFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = req.title.toLowerCase().includes(q);
        const matchDomain = req.domain.toLowerCase().includes(q);
        const matchRequester = req.requesterName.toLowerCase().includes(q);
        const matchJust = req.justification.toLowerCase().includes(q);
        return matchTitle || matchDomain || matchRequester || matchJust;
      }
      return true;
    });
  }, [requests, statusFilter, typeFilter, searchQuery]);

  // Statistics
  const stats = useMemo(() => {
    const total = requests.length;
    const pending = requests.filter(r => r.status === 'pending').length;
    const approved = requests.filter(r => r.status === 'approved').length;
    const inTraining = requests.filter(r => r.status === 'in_training').length;
    const newSkills = requests.filter(r => r.requestType === 'new_skill').length;
    const trainingRequests = requests.filter(r => r.requestType === 'training_request').length;

    // Most requested domain
    const domainCounts: Record<string, number> = {};
    requests.forEach(r => {
      domainCounts[r.domain] = (domainCounts[r.domain] || 0) + (r.interestedMembers.length || 1);
    });
    const topDomain = Object.entries(domainCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

    return { total, pending, approved, inTraining, newSkills, trainingRequests, topDomain };
  }, [requests]);

  // Handle Interested Members Checkbox
  const handleToggleInterestedMember = (name: string) => {
    setInterestedMembers(prev => 
      prev.includes(name) ? prev.filter(m => m !== name) : [...prev, name]
    );
  };

  // Submit Handler
  const handleSubmitProposal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !domain.trim()) return;

    onSubmitRequest({
      title: title.trim(),
      domain: domain.trim(),
      requestType,
      requesterName,
      urgency,
      targetLevel,
      interestedMembers: interestedMembers.length > 0 ? interestedMembers : [requesterName],
      justification: justification.trim() || 'Đề xuất bổ sung vào lộ trình kỹ năng',
      status: 'pending'
    }, addToMatrixAsPending);

    // Reset form & switch to list tab
    setTitle('');
    setJustification('');
    setActiveTab('list');
  };

  if (!isOpen) return null;

  const getUrgencyBadge = (u: SkillRequestUrgency) => {
    switch (u) {
      case 'critical':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">🚨 Khẩn Cấp</span>;
      case 'high':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">🔥 Ưu Tiên Cao</span>;
      case 'medium':
        return <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">⚡ Trung Bình</span>;
      case 'low':
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200">Tiêu chuẩn</span>;
    }
  };

  const getStatusBadge = (s: SkillRequestStatus) => {
    switch (s) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-300 ring-1 ring-amber-200">
            <Clock className="w-3 h-3 animate-spin text-amber-600" />
            <span>Chờ Duyệt (Pending)</span>
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>Đã Duyệt (Active)</span>
          </span>
        );
      case 'in_training':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-800 border border-indigo-300">
            <GraduationCap className="w-3 h-3 text-indigo-600" />
            <span>Đang Đào Tạo</span>
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200 line-through">
            <XCircle className="w-3 h-3 text-slate-400" />
            <span>Từ chối</span>
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 no-print animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-slate-50 via-indigo-50/40 to-slate-50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-800 flex items-center justify-center text-white shadow-sm">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  Đề Xuất Kỹ Năng & Yêu Cầu Đào Tạo
                </h2>
                {stats.pending > 0 && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 animate-pulse">
                    {stats.pending} Chờ Duyệt
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">
                Cho phép kỹ sư đề xuất kỹ năng mới (Pending state) hoặc yêu cầu Lab Workshop nâng chuẩn L1-L2
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center justify-between px-6 border-b border-slate-200 bg-white">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('list')}
              className={`flex items-center gap-1.5 py-3 px-3 text-xs font-bold border-b-2 transition-all ${
                activeTab === 'list'
                  ? 'border-indigo-600 text-indigo-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Lightbulb className="w-3.5 h-3.5" />
              <span>Danh Sách Đề Xuất ({requests.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('propose')}
              className={`flex items-center gap-1.5 py-3 px-3 text-xs font-bold border-b-2 transition-all ${
                activeTab === 'propose'
                  ? 'border-indigo-600 text-indigo-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <PlusCircle className="w-3.5 h-3.5 text-indigo-600" />
              <span>Gửi Đề Xuất Mới</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('insights')}
              className={`flex items-center gap-1.5 py-3 px-3 text-xs font-bold border-b-2 transition-all ${
                activeTab === 'insights'
                  ? 'border-indigo-600 text-indigo-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
              <span>Nhu Cầu Đào Tạo</span>
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-3 text-xs text-slate-500 py-2">
            <span>Đang chờ: <strong className="text-amber-700">{stats.pending}</strong></span>
            <span>·</span>
            <span>Đã duyệt: <strong className="text-emerald-700">{stats.approved}</strong></span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5 bg-slate-50/40">
          
          {/* TAB 1: LIST & REVIEW PROPOSALS */}
          {activeTab === 'list' && (
            <div className="space-y-4">
              {/* Search & Filter Bar */}
              <div className="flex flex-wrap items-center justify-between gap-2.5 p-3 bg-white rounded-xl border border-slate-200">
                <div className="relative flex-1 min-w-[220px]">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Tìm theo tên kỹ năng, người đề xuất, domain..."
                    className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs placeholder:text-slate-400 focus:outline-hidden focus:border-indigo-500 focus:bg-white"
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

                <div className="flex items-center gap-2">
                  <select
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                    className="py-1.5 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 font-medium focus:outline-hidden"
                  >
                    <option value="all">Tất cả trạng thái ({requests.length})</option>
                    <option value="pending">⏳ Chờ duyệt ({stats.pending})</option>
                    <option value="approved">✅ Đã duyệt ({stats.approved})</option>
                    <option value="in_training">🎓 Đang đào tạo ({stats.inTraining})</option>
                    <option value="rejected">❌ Từ chối</option>
                  </select>

                  <select
                    value={typeFilter}
                    onChange={e => setTypeFilter(e.target.value)}
                    className="py-1.5 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 font-medium focus:outline-hidden"
                  >
                    <option value="all">Tất cả loại yêu cầu</option>
                    <option value="new_skill">✨ Đề xuất kỹ năng mới</option>
                    <option value="training_request">🎓 Yêu cầu đào tạo / Lab</option>
                  </select>

                  <button
                    type="button"
                    onClick={() => setActiveTab('propose')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors shrink-0"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Tạo Đề Xuất</span>
                  </button>
                </div>
              </div>

              {/* Request Cards Feed */}
              <div className="space-y-3">
                {filteredRequests.length === 0 ? (
                  <div className="py-16 text-center text-slate-400 bg-white rounded-2xl border border-slate-200 space-y-2">
                    <Lightbulb className="w-10 h-10 mx-auto text-slate-300 stroke-1" />
                    <p className="text-xs font-semibold text-slate-600">
                      Không tìm thấy đề xuất nào phù hợp với bộ lọc
                    </p>
                    <button
                      onClick={() => { setStatusFilter('all'); setTypeFilter('all'); setSearchQuery(''); }}
                      className="text-xs font-semibold text-indigo-600 hover:underline"
                    >
                      Xóa bộ lọc
                    </button>
                  </div>
                ) : (
                  filteredRequests.map(req => {
                    const isPending = req.status === 'pending';
                    const isNewSkill = req.requestType === 'new_skill';

                    return (
                      <div
                        key={req.id}
                        className={`p-4 bg-white rounded-xl border transition-all ${
                          isPending
                            ? 'border-amber-300/80 ring-1 ring-amber-100 shadow-xs'
                            : req.status === 'approved'
                            ? 'border-emerald-200'
                            : 'border-slate-200'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-2 flex-1">
                            {/* Badges strip */}
                            <div className="flex flex-wrap items-center gap-2">
                              {getStatusBadge(req.status)}

                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold ${
                                isNewSkill
                                  ? 'bg-purple-50 text-purple-800 border border-purple-200'
                                  : 'bg-sky-50 text-sky-800 border border-sky-200'
                              }`}>
                                {isNewSkill ? '✨ Kỹ Năng Mới' : '🎓 Yêu Cầu Đào Tạo'}
                              </span>

                              {getUrgencyBadge(req.urgency)}

                              <span className="text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded font-normal">
                                {req.domain}
                              </span>

                              <span className="text-[11px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-semibold">
                                Mục tiêu: {req.targetLevel}
                              </span>
                            </div>

                            {/* Title */}
                            <h3 className="text-sm font-bold text-slate-900 leading-snug">
                              {req.title}
                            </h3>

                            {/* Justification note */}
                            <p className="text-xs text-slate-600 bg-slate-50/80 p-2.5 rounded-lg border border-slate-100">
                              <strong className="text-slate-700 font-semibold">Lý do & Ứng dụng: </strong>
                              {req.justification}
                            </p>

                            {/* Requester & Interested Engineers */}
                            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
                              <div className="flex items-center gap-2 text-slate-500">
                                <span className="flex items-center gap-1">
                                  <User className="w-3.5 h-3.5 text-slate-400" />
                                  Đề xuất bởi: <strong className="text-slate-800">{req.requesterName}</strong>
                                </span>
                                <span>·</span>
                                <span className="text-slate-400">
                                  {new Date(req.createdAt).toLocaleDateString('vi-VN')}
                                </span>
                              </div>

                              {/* Upvote & Interested Engineers Group */}
                              <div className="flex items-center gap-2">
                                <div className="flex items-center -space-x-1">
                                  {req.interestedMembers.map(mName => (
                                    <span
                                      key={mName}
                                      className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 text-indigo-800 text-[10px] font-bold border-2 border-white"
                                      title={`Kỹ sư ${mName} cũng quan tâm/đăng ký tham gia`}
                                    >
                                      {mName.slice(0, 1)}
                                    </span>
                                  ))}
                                </div>
                                <span className="text-[11px] text-slate-500 font-medium">
                                  ({req.interestedMembers.length} kỹ sư quan tâm)
                                </span>

                                {/* Upvote Button */}
                                <button
                                  type="button"
                                  onClick={() => onToggleUpvote(req.id, members[0]?.name || 'Sang')}
                                  className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold text-slate-700 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 rounded-md transition-colors"
                                  title="Tôi cũng muốn đăng ký học / đề xuất kỹ năng này"
                                >
                                  <ThumbsUp className="w-3 h-3" />
                                  <span>+1 Quan tâm</span>
                                </button>
                              </div>
                            </div>

                            {/* Review Note if available */}
                            {req.reviewNotes && (
                              <div className="text-[11px] text-slate-600 bg-indigo-50/50 p-2 rounded-md border border-indigo-100 flex items-center gap-2">
                                <ShieldCheck className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                                <span>
                                  <strong>Phản hồi từ {req.reviewedBy || 'Quản lý'}:</strong> {req.reviewNotes}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Manager Quick Action Buttons */}
                          <div className="flex flex-col items-end gap-1.5 shrink-0 pl-2">
                            {isPending && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => onApproveRequest(req.id, reviewNoteInput[req.id])}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-2xs transition-colors"
                                  title="Phê duyệt đề xuất và đưa kỹ năng vào Ma Trận chính thức"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Duyệt & Đưa Vào Ma Trận</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => onSetInTraining(req.id)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-white hover:bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-semibold transition-colors"
                                  title="Mở buổi đào tạo / Lab workshop thực hành cho đề xuất này"
                                >
                                  <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
                                  <span>Mở Đào Tạo</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => onRejectRequest(req.id, reviewNoteInput[req.id])}
                                  className="inline-flex items-center gap-1 px-2 py-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded text-xs transition-colors"
                                  title="Từ chối đề xuất này"
                                >
                                  <X className="w-3.5 h-3.5" />
                                  <span>Từ chối</span>
                                </button>
                              </>
                            )}

                            {req.status === 'approved' && (
                              <div className="text-right">
                                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded border border-emerald-200 block">
                                  ✓ Đã kích hoạt trong ma trận
                                </span>
                              </div>
                            )}

                            {onDeleteRequest && (
                              <button
                                type="button"
                                onClick={() => onDeleteRequest(req.id)}
                                className="text-[10px] text-slate-400 hover:text-rose-600 p-1 rounded"
                                title="Xóa đề xuất này"
                              >
                                Xóa
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* TAB 2: PROPOSE NEW SKILL / TRAINING FORM */}
          {activeTab === 'propose' && (
            <form onSubmit={handleSubmitProposal} className="space-y-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <PlusCircle className="w-4 h-4 text-indigo-600" />
                  <span>Biểu Mẫu Đề Xuất Kỹ Năng / Yêu Cầu Đào Tạo Mới</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Kỹ năng được đề xuất sẽ xuất hiện ngay lập tức ở trạng thái <strong>Chờ Duyệt (Pending)</strong> trên bảng ma trận để toàn đội cùng thảo luận.
                </p>
              </div>

              {/* 1. Request Type Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  1. Loại Đề Xuất / Yêu Cầu:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div
                    onClick={() => setRequestType('new_skill')}
                    className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
                      requestType === 'new_skill'
                        ? 'border-indigo-600 bg-indigo-50/30'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-indigo-600" />
                        ✨ Đề Xuất Bổ Sung Kỹ Năng Mới
                      </span>
                      {requestType === 'new_skill' && <Check className="w-4 h-4 text-indigo-600" />}
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Tạo một mục kỹ năng công nghệ mới vào ma trận ở trạng thái Pending để đánh giá và phân công.
                    </p>
                  </div>

                  <div
                    onClick={() => setRequestType('training_request')}
                    className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
                      requestType === 'training_request'
                        ? 'border-indigo-600 bg-indigo-50/30'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                        <GraduationCap className="w-4 h-4 text-indigo-600" />
                        🎓 Yêu Cầu Tổ Chức Đào Tạo / Lab Workshop
                      </span>
                      {requestType === 'training_request' && <Check className="w-4 h-4 text-indigo-600" />}
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Yêu cầu Lead hoặc SME mở lớp đào tạo thực hành nội bộ để nâng cấp từ L0 lên L1/L2.
                    </p>
                  </div>
                </div>
              </div>

              {/* 2. Skill Title & Domain */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Tên Kỹ Năng / Chủ Đề Đào Tạo: <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="VD: Cilium eBPF Security, ArgoCD GitOps, AI Storage..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-hidden focus:border-indigo-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Phân Khúc Hạ Tầng (Domain): <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={domain}
                    onChange={e => setDomain(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-hidden focus:border-indigo-500 focus:bg-white"
                  >
                    {domains.map(d => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 3. Requester, Urgency & Target Level */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Người Đề Xuất:
                  </label>
                  <select
                    value={requesterName}
                    onChange={e => {
                      setRequesterName(e.target.value);
                      if (!interestedMembers.includes(e.target.value)) {
                        setInterestedMembers(prev => [...prev, e.target.value]);
                      }
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-hidden focus:border-indigo-500 focus:bg-white"
                  >
                    {members.map(m => (
                      <option key={m.name} value={m.name}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Mức Độ Cần Thiết:
                  </label>
                  <select
                    value={urgency}
                    onChange={e => setUrgency(e.target.value as SkillRequestUrgency)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-hidden focus:border-indigo-500 focus:bg-white"
                  >
                    <option value="low">Tiêu chuẩn (Lộ trình chung)</option>
                    <option value="medium">Trung bình (Dự án sắp tới)</option>
                    <option value="high">Ưu tiên cao (Dự án Q4/2026)</option>
                    <option value="critical">🚨 Khẩn cấp (SPOF / Đang thiếu)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Mục Tiêu Đạt Được:
                  </label>
                  <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                    <button
                      type="button"
                      onClick={() => setTargetLevel('L1')}
                      className={`py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all ${
                        targetLevel === 'L1'
                          ? 'bg-orange-50 text-orange-900 border-orange-300 ring-1 ring-orange-200'
                          : 'bg-slate-50 text-slate-600 border-slate-200'
                      }`}
                    >
                      L1 · Đã Biết
                    </button>
                    <button
                      type="button"
                      onClick={() => setTargetLevel('L2')}
                      className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition-all ${
                        targetLevel === 'L2'
                          ? 'bg-emerald-50 text-emerald-900 border-emerald-300 ring-1 ring-emerald-200'
                          : 'bg-slate-50 text-slate-600 border-slate-200'
                      }`}
                    >
                      L2 · Lab Thành Công
                    </button>
                  </div>
                </div>
              </div>

              {/* 4. Interested Engineers */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Đồng Nghiệp Cùng Quan Tâm / Tham Gia Đào Tạo:
                </label>
                <div className="flex flex-wrap items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
                  {members.map(m => {
                    const isSelected = interestedMembers.includes(m.name);
                    return (
                      <label
                        key={m.name}
                        onClick={() => handleToggleInterestedMember(m.name)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-indigo-600 text-white font-semibold shadow-2xs'
                            : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          className="sr-only"
                        />
                        <span>{m.name}</span>
                        {isSelected && <Check className="w-3 h-3" />}
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* 5. Justification */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Lý Do Đề Xuất & Bối Cảnh Dự Án Thực Tế: <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={justification}
                  onChange={e => setJustification(e.target.value)}
                  placeholder="Mô tả lý do tại sao kỹ năng này quan trọng đối với đội ngũ hạ tầng, ứng dụng vào dự án nào, hoặc vấn đề gì cần giải quyết..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-hidden focus:border-indigo-500 focus:bg-white resize-none"
                />
              </div>

              {/* 6. Checkbox to add pending state to Matrix directly */}
              {requestType === 'new_skill' && (
                <label className="flex items-center gap-2 p-3 bg-amber-50/60 rounded-xl border border-amber-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={addToMatrixAsPending}
                    onChange={e => setAddToMatrixAsPending(e.target.checked)}
                    className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4"
                  />
                  <div>
                    <span className="text-xs font-bold text-amber-950 block">
                      Thêm ngay vào Bảng Ma Trận ở trạng thái "Chờ Duyệt" (Pending State)
                    </span>
                    <span className="text-[11px] text-amber-800">
                      Kỹ năng này sẽ xuất hiện trên bảng ma trận với viền đứt nét và nhãn Chờ Duyệt để các kỹ sư khác cùng nhìn thấy và đánh giá trước.
                    </span>
                  </div>
                </label>
              )}

              {/* Submit Button */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setActiveTab('list')}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Gửi Đề Xuất Ngay</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: TRAINING DEMAND INSIGHTS */}
          {activeTab === 'insights' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 bg-white rounded-xl border border-slate-200">
                  <span className="text-xs text-slate-500 font-medium block">Tổng Nhu Cầu Đã Ghi Nhận</span>
                  <span className="text-2xl font-black text-slate-900 mt-1 block">{stats.total}</span>
                  <span className="text-[11px] text-slate-400">({stats.newSkills} kỹ năng mới · {stats.trainingRequests} buổi Lab)</span>
                </div>

                <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                  <span className="text-xs text-amber-800 font-medium block">Đang Chờ Quản Lý Duyệt</span>
                  <span className="text-2xl font-black text-amber-950 mt-1 block">{stats.pending}</span>
                  <span className="text-[11px] text-amber-700">Cần phê duyệt để đưa vào ma trận</span>
                </div>

                <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-200">
                  <span className="text-xs text-indigo-800 font-medium block">Domain Được Yêu Cầu Nhiều Nhất</span>
                  <span className="text-sm font-bold text-indigo-950 mt-1 block truncate">{stats.topDomain}</span>
                  <span className="text-[11px] text-indigo-600">Dựa trên số lượt đăng ký của kỹ sư</span>
                </div>
              </div>

              {/* Recommendations */}
              <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-3">
                <h4 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <span>Gợi Ý Cho Trưởng Nhóm / Quản Lý:</span>
                </h4>
                <div className="space-y-2 text-xs text-slate-600">
                  <div className="p-2.5 bg-slate-50 rounded-lg flex items-start gap-2">
                    <span className="text-indigo-600 font-bold">1.</span>
                    <span>
                      Các đề xuất có từ <strong>2 kỹ sư trở lên cùng quan tâm</strong> nên được ưu tiên tổ chức buổi thực hành Lab tập trung 1 buổi/tuần.
                    </span>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-lg flex items-start gap-2">
                    <span className="text-indigo-600 font-bold">2.</span>
                    <span>
                      Khi duyệt một đề xuất kỹ năng mới, hệ thống sẽ tự động cập nhật vào <strong>Ma Trận Kỹ Năng chính thức</strong> và ghi nhận vào <strong>Lịch Sử Audit Log</strong>.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-white flex items-center justify-between text-xs text-slate-500 shrink-0">
          <span className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-indigo-600" />
            <span>Mô hình đề xuất kỹ năng & đào tạo 2 chiều kỹ sư ↔ quản lý</span>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition-colors"
          >
            Đóng
          </button>
        </div>

      </div>
    </div>
  );
};
