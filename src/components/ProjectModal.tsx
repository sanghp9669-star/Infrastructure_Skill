import React, { useState, useEffect } from 'react';
import { CompetencyLevel, Project, ProjectRequirement, SkillItem, TeamMember } from '../types/skills';
import { 
  FolderPlus, 
  X, 
  Check, 
  Plus, 
  Trash2, 
  Building, 
  Calendar, 
  User, 
  Layers, 
  Sparkles,
  Award,
  AlertCircle
} from 'lucide-react';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectToEdit?: Project | null;
  skills: SkillItem[];
  members: TeamMember[];
  onSaveProject: (project: Project) => void;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({
  isOpen,
  onClose,
  projectToEdit,
  skills,
  members,
  onSaveProject
}) => {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [client, setClient] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'Planning' | 'In Progress' | 'Delivered'>('In Progress');
  const [lead, setLead] = useState(members[0]?.name || 'Sang');
  const [assignedMembers, setAssignedMembers] = useState<string[]>([]);
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [targetDate, setTargetDate] = useState(
    new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  );
  const [requiredSkills, setRequiredSkills] = useState<ProjectRequirement[]>([]);

  // Sync state when modal opens or editing project changes
  useEffect(() => {
    if (projectToEdit) {
      setName(projectToEdit.name);
      setCode(projectToEdit.code);
      setClient(projectToEdit.client);
      setDescription(projectToEdit.description || '');
      setStatus(projectToEdit.status);
      setLead(projectToEdit.lead || members[0]?.name || 'Sang');
      setAssignedMembers(projectToEdit.assignedMembers || []);
      setStartDate(projectToEdit.startDate || new Date().toISOString().slice(0, 10));
      setTargetDate(projectToEdit.targetDate || new Date().toISOString().slice(0, 10));
      setRequiredSkills(projectToEdit.requiredSkills || []);
    } else {
      setName('');
      setCode(`PRJ-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`);
      setClient('');
      setDescription('');
      setStatus('In Progress');
      setLead(members[0]?.name || 'Sang');
      setAssignedMembers(members.slice(0, 3).map(m => m.name));
      setStartDate(new Date().toISOString().slice(0, 10));
      setTargetDate(new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10));
      // Auto-suggest initial required skills from top skills if empty
      if (skills.length > 0) {
        setRequiredSkills(
          skills.slice(0, 4).map(s => ({
            skillName: s.skill,
            domain: s.domain,
            minLevel: 'L2',
            weight: 4
          }))
        );
      } else {
        setRequiredSkills([]);
      }
    }
  }, [projectToEdit, isOpen, skills, members]);

  // Toggle member assignment
  const handleToggleMember = (memberName: string) => {
    setAssignedMembers(prev =>
      prev.includes(memberName) ? prev.filter(m => m !== memberName) : [...prev, memberName]
    );
  };

  // Add a new required skill row
  const handleAddRequirement = () => {
    const firstUnusedSkill = skills.find(
      s => !requiredSkills.some(r => r.skillName.toLowerCase() === s.skill.toLowerCase())
    ) || skills[0];

    if (!firstUnusedSkill) return;

    setRequiredSkills(prev => [
      ...prev,
      {
        skillName: firstUnusedSkill.skill,
        domain: firstUnusedSkill.domain,
        minLevel: 'L2',
        weight: 4
      }
    ]);
  };

  // Update a requirement row
  const handleUpdateRequirement = (
    index: number,
    field: keyof ProjectRequirement,
    value: any
  ) => {
    setRequiredSkills(prev => {
      const updated = [...prev];
      if (field === 'skillName') {
        const found = skills.find(s => s.skill === value);
        updated[index] = {
          ...updated[index],
          skillName: value,
          domain: found ? found.domain : updated[index].domain
        };
      } else {
        updated[index] = { ...updated[index], [field]: value };
      }
      return updated;
    });
  };

  // Remove a requirement row
  const handleRemoveRequirement = (index: number) => {
    setRequiredSkills(prev => prev.filter((_, i) => i !== index));
  };

  // Form submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) return;

    const finalProject: Project = {
      id: projectToEdit ? projectToEdit.id : `proj-${Date.now()}`,
      name: name.trim(),
      code: code.trim().toUpperCase(),
      client: client.trim() || 'Doanh Nghiệp',
      description: description.trim(),
      status,
      lead,
      assignedMembers,
      startDate,
      targetDate,
      requiredSkills
    };

    onSaveProject(finalProject);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 no-print animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-xs">
              <FolderPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                {projectToEdit ? 'Chỉnh Sửa Dự Án' : 'Thêm Dự Án Mới'}
              </h2>
              <p className="text-xs text-slate-500">
                Cấu hình thông tin dự án, phân bổ nhân sự và thiết lập danh mục kỹ năng yêu cầu
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            title="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* 1. Basic Info */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 border-b pb-1.5">
              <span>1. Thông Tin Cơ Bản Dự Án</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tên Dự Án: <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Nâng Cấp Hệ Thống Hạ Tầng Data Center 2026"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-hidden focus:border-indigo-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mã Dự Án (Code): <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="PRJ-DC-2026"
                  value={code}
                  onChange={e => setCode(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold uppercase focus:outline-hidden focus:border-indigo-500 focus:bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Khách Hàng / Đối Tác:
                </label>
                <input
                  type="text"
                  placeholder="Tên công ty / khách hàng"
                  value={client}
                  onChange={e => setClient(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-hidden focus:border-indigo-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Trưởng Dự Án (Lead):
                </label>
                <select
                  value={lead}
                  onChange={e => setLead(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-hidden focus:border-indigo-500 focus:bg-white"
                >
                  {members.map(m => (
                    <option key={m.name} value={m.name}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Trạng Thái Triển Khai:
                </label>
                <select
                  value={status}
                  onChange={e => setStatus(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-hidden focus:border-indigo-500 focus:bg-white"
                >
                  <option value="Planning">Giai Đoạn Chuẩn Bị (Planning)</option>
                  <option value="In Progress">Đang Triển Khai (In Progress)</option>
                  <option value="Delivered">Đã Nghiệm Thu (Delivered)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Ngày Bắt Đầu:
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-hidden focus:border-indigo-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Hạn Hoàn Thành / Nghiệm Thu:
                </label>
                <input
                  type="date"
                  value={targetDate}
                  onChange={e => setTargetDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-hidden focus:border-indigo-500 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Mô Tả Mục Tiêu & Phạm Vi Triển Khai:
              </label>
              <textarea
                rows={2}
                placeholder="Mô tả tóm tắt nội dung công việc và giải pháp hạ tầng..."
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-hidden focus:border-indigo-500 focus:bg-white resize-none"
              />
            </div>
          </div>

          {/* 2. Assigned Members */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b pb-1.5">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                2. Phân Bổ Nhân Sự Tham Gia ({assignedMembers.length} thành viên đã chọn)
              </h3>
              <div className="flex items-center gap-2 text-[11px]">
                <button
                  type="button"
                  onClick={() => setAssignedMembers(members.map(m => m.name))}
                  className="text-indigo-600 hover:text-indigo-800 font-semibold"
                >
                  Chọn tất cả
                </button>
                <span>·</span>
                <button
                  type="button"
                  onClick={() => setAssignedMembers([])}
                  className="text-slate-500 hover:text-slate-700 font-medium"
                >
                  Bỏ chọn
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {members.map(m => {
                const isAssigned = assignedMembers.includes(m.name);
                return (
                  <div
                    key={m.name}
                    onClick={() => handleToggleMember(m.name)}
                    className={`p-2.5 rounded-xl border cursor-pointer flex items-center justify-between transition-all select-none ${
                      isAssigned
                        ? 'bg-indigo-50 border-indigo-300 text-indigo-950 font-bold shadow-2xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 font-medium'
                    }`}
                  >
                    <span className="text-xs">{m.name}</span>
                    <input
                      type="checkbox"
                      checked={isAssigned}
                      onChange={() => {}}
                      className="rounded text-indigo-600 focus:ring-indigo-500 pointer-events-none"
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3. Required Skills Configuration */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b pb-1.5">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                3. Danh Mục Kỹ Năng Yêu Cầu Cho Dự Án ({requiredSkills.length} kỹ năng)
              </h3>
              <button
                type="button"
                onClick={handleAddRequirement}
                className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-lg transition-colors border border-indigo-200"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Thêm Kỹ Năng Yêu Cầu</span>
              </button>
            </div>

            {requiredSkills.length === 0 ? (
              <div className="p-6 text-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                <AlertCircle className="w-6 h-6 mx-auto mb-1 text-slate-300" />
                <p className="text-xs">Chưa có kỹ năng nào được yêu cầu cho dự án này.</p>
                <button
                  type="button"
                  onClick={handleAddRequirement}
                  className="mt-2 text-xs text-indigo-600 font-bold underline"
                >
                  Nhấp để thêm kỹ năng yêu cầu
                </button>
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {requiredSkills.map((req, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 bg-slate-50/80 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex-1 min-w-[200px]">
                      <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">
                        Tên Kỹ Năng:
                      </label>
                      <select
                        value={req.skillName}
                        onChange={e => handleUpdateRequirement(idx, 'skillName', e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-900 focus:outline-hidden"
                      >
                        {skills.map(s => (
                          <option key={s.id} value={s.skill}>
                            [{s.domain}] {s.skill}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="w-32">
                      <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">
                        Mức Đòi Hỏi:
                      </label>
                      <select
                        value={req.minLevel}
                        onChange={e => handleUpdateRequirement(idx, 'minLevel', e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-900 focus:outline-hidden"
                      >
                        <option value="L1">L1 · Đã biết</option>
                        <option value="L2">L2 · Đã làm thực tế</option>
                      </select>
                    </div>

                    <div className="w-28">
                      <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">
                        Trọng Số:
                      </label>
                      <select
                        value={req.weight}
                        onChange={e => handleUpdateRequirement(idx, 'weight', Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-900 focus:outline-hidden"
                      >
                        <option value={5}>5 · Rất cốt lõi</option>
                        <option value={4}>4 · Quan trọng</option>
                        <option value={3}>3 · Tiêu chuẩn</option>
                        <option value={2}>2 · Bổ trợ</option>
                        <option value={1}>1 · Tùy chọn</option>
                      </select>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveRequirement(idx)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors mt-3"
                      title="Xóa yêu cầu này"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </form>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Hủy Bỏ
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 rounded-lg shadow-sm transition-all"
          >
            <Check className="w-4 h-4" />
            <span>{projectToEdit ? 'Lưu Thay Đổi Dự Án' : 'Tạo Dự Án Mới'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
