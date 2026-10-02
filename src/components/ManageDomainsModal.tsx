import React, { useState } from 'react';
import { SkillItem } from '../types/skills';
import { Layers, Edit3, Trash2, Plus, ArrowRight, Save, X, Check, AlertTriangle, ShieldCheck, HelpCircle } from 'lucide-react';

interface ManageDomainsModalProps {
  isOpen: boolean;
  onClose: () => void;
  skills: SkillItem[];
  onRenameDomain: (oldDomain: string, newDomain: string) => void;
  onAddDomainWithSkill: (domainName: string, initialSkillName: string) => void;
  onDeleteDomain: (domainName: string) => void;
  onReassignSkillDomain: (skillId: number, newDomain: string) => void;
}

export const ManageDomainsModal: React.FC<ManageDomainsModalProps> = ({
  isOpen,
  onClose,
  skills,
  onRenameDomain,
  onAddDomainWithSkill,
  onDeleteDomain,
  onReassignSkillDomain
}) => {
  const [editingDomain, setEditingDomain] = useState<string | null>(null);
  const [renamedDomainInput, setRenamedDomainInput] = useState<string>('');

  const [newDomainName, setNewDomainName] = useState<string>('');
  const [initialSkillName, setInitialSkillName] = useState<string>('');

  const [selectedSkillId, setSelectedSkillId] = useState<number | null>(null);
  const [targetDomainForSkill, setTargetDomainForSkill] = useState<string>('');

  if (!isOpen) return null;

  // Extract current unique domains dynamically
  const currentDomains = Array.from(new Set(skills.map(s => s.domain))).sort();

  const handleStartRename = (domain: string) => {
    setEditingDomain(domain);
    setRenamedDomainInput(domain);
  };

  const handleSaveRename = (oldDomain: string) => {
    const trimmed = renamedDomainInput.trim();
    if (trimmed && trimmed !== oldDomain) {
      onRenameDomain(oldDomain, trimmed);
    }
    setEditingDomain(null);
  };

  const handleCreateNewDomain = (e: React.FormEvent) => {
    e.preventDefault();
    const domainTrimmed = newDomainName.trim();
    const skillTrimmed = initialSkillName.trim();

    if (!domainTrimmed) {
      alert('Vui lòng nhập tên Domain phân khúc mới.');
      return;
    }
    if (!skillTrimmed) {
      alert('Vui lòng nhập tên kỹ năng khởi tạo đầu tiên cho Domain này.');
      return;
    }

    onAddDomainWithSkill(domainTrimmed, skillTrimmed);
    setNewDomainName('');
    setInitialSkillName('');
  };

  const handleMoveSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSkillId || !targetDomainForSkill) return;
    onReassignSkillDomain(selectedSkillId, targetDomainForSkill);
    setSelectedSkillId(null);
    setTargetDomainForSkill('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-xs">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white leading-tight">
                Quản Lý Danh Mục Domains (Phân Khúc Công Nghệ)
              </h3>
              <p className="text-xs text-slate-300">
                Thêm/sửa/xóa Domain linh hoạt. Mọi thay đổi đều tự động cập nhật ngay trên toàn bộ Biểu đồ & Ma trận.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-white/70 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6 text-xs flex-1">
          {/* Section 1: Add New Domain Form */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <h4 className="font-bold text-slate-900 text-xs flex items-center gap-2">
              <Plus className="w-4 h-4 text-emerald-600" />
              <span>Thêm Domain Phân Khúc Mới</span>
            </h4>

            <form onSubmit={handleCreateNewDomain} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
              <div className="sm:col-span-5 space-y-1">
                <label className="font-bold text-slate-700 text-[11px]">Tên Domain Mới *</label>
                <input
                  type="text"
                  value={newDomainName}
                  onChange={e => setNewDomainName(e.target.value)}
                  placeholder="Ví dụ: AI Infrastructure & GPU Cluster"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:border-indigo-500 font-medium"
                />
              </div>

              <div className="sm:col-span-5 space-y-1">
                <label className="font-bold text-slate-700 text-[11px]">Kỹ Năng Khởi Tạo Đầu Tiên *</label>
                <input
                  type="text"
                  value={initialSkillName}
                  onChange={e => setInitialSkillName(e.target.value)}
                  placeholder="Ví dụ: NVIDIA HGX / InfiniBand Fabric..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div className="sm:col-span-2">
                <button
                  type="submit"
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-colors shadow-xs"
                >
                  + Tạo Mới
                </button>
              </div>
            </form>
          </div>

          {/* Section 2: List of Existing Domains with Rename & Delete */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-900 text-xs flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-600" />
                <span>Danh Sách {currentDomains.length} Domains Hiện Có Trong Ma Trận</span>
              </h4>
              <span className="text-[10px] text-slate-500">
                Tổng cộng {skills.length} kỹ năng
              </span>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {currentDomains.map((dom, idx) => {
                const domainSkillCount = skills.filter(s => s.domain === dom).length;
                const isEditing = editingDomain === dom;

                return (
                  <div
                    key={dom}
                    className="p-3 bg-white rounded-xl border border-slate-200/90 flex flex-wrap items-center justify-between gap-3 hover:border-indigo-300 transition-colors shadow-2xs"
                  >
                    {isEditing ? (
                      <div className="flex-1 flex items-center gap-2">
                        <input
                          type="text"
                          value={renamedDomainInput}
                          onChange={e => setRenamedDomainInput(e.target.value)}
                          className="flex-1 px-3 py-1.5 text-xs border border-indigo-500 rounded-lg font-bold text-slate-900 focus:outline-hidden"
                          autoFocus
                          onKeyDown={e => {
                            if (e.key === 'Enter') handleSaveRename(dom);
                            if (e.key === 'Escape') setEditingDomain(null);
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => handleSaveRename(dom)}
                          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs flex items-center gap-1"
                        >
                          <Save className="w-3.5 h-3.5" />
                          <span>Lưu</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingDomain(null)}
                          className="px-2.5 py-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg text-xs"
                        >
                          Hủy
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-2.5">
                          <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-700 font-bold text-[11px] flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          <div>
                            <span className="font-bold text-slate-900 text-xs block leading-tight">
                              {dom}
                            </span>
                            <span className="text-[10px] text-slate-500">
                              Bao gồm <strong>{domainSkillCount}</strong> kỹ năng công nghệ
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleStartRename(dom)}
                            className="px-2.5 py-1.5 bg-slate-50 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 font-bold rounded-lg border border-slate-200 hover:border-indigo-300 transition-colors flex items-center gap-1 text-[11px]"
                            title="Đổi tên Domain trên toàn bộ ma trận & biểu đồ"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                            <span>Đổi Tên</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm(`Bạn có chắc chắn muốn xóa Domain "${dom}" và toàn bộ ${domainSkillCount} kỹ năng thuộc domain này?`)) {
                                onDeleteDomain(dom);
                              }
                            }}
                            className="px-2.5 py-1.5 bg-slate-50 hover:bg-rose-50 text-slate-500 hover:text-rose-700 font-bold rounded-lg border border-slate-200 hover:border-rose-300 transition-colors flex items-center gap-1 text-[11px]"
                            title="Xóa Domain này khỏi ma trận"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 3: Move a Skill to another Domain */}
          <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-200 space-y-3">
            <h4 className="font-bold text-indigo-950 text-xs flex items-center gap-2">
              <ArrowRight className="w-4 h-4 text-indigo-600" />
              <span>Di Chuyển Kỹ Năng Sang Domain Khác</span>
            </h4>

            <form onSubmit={handleMoveSkill} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
              <div className="sm:col-span-5 space-y-1">
                <label className="font-bold text-slate-700 text-[11px]">Chọn Kỹ Năng Cần Chuyển *</label>
                <select
                  value={selectedSkillId || ''}
                  onChange={e => setSelectedSkillId(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:border-indigo-500 font-medium bg-white"
                >
                  <option value="">-- Chọn Kỹ Năng --</option>
                  {skills.map(s => (
                    <option key={s.id} value={s.id}>
                      [{s.domain}] {s.skill}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-5 space-y-1">
                <label className="font-bold text-slate-700 text-[11px]">Domain Đích Sang *</label>
                <select
                  value={targetDomainForSkill}
                  onChange={e => setTargetDomainForSkill(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:border-indigo-500 font-medium bg-white"
                >
                  <option value="">-- Chọn Domain Đích --</option>
                  {currentDomains.map(d => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <button
                  type="submit"
                  disabled={!selectedSkillId || !targetDomainForSkill}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-lg transition-colors shadow-xs"
                >
                  Di Chuyển
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-slate-500">
            💡 <em>Dữ liệu ma trận và biểu đồ trực quan sẽ cập nhật thời gian thực ngay lập tức.</em>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-xs transition-all"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
