import React, { useState } from 'react';
import { CompetencyLevel, SkillItem, TeamMember } from '../types/skills';
import { COMPETENCY_DEFINITIONS } from '../data/initialData';
import { PlusCircle, Layers, Wrench, X, Check, UserCheck, Shield } from 'lucide-react';

interface AddSkillModalProps {
  isOpen: boolean;
  onClose: () => void;
  domains: string[];
  members: TeamMember[];
  onAddSkill: (newSkill: Omit<SkillItem, 'id'>) => void;
}

export const AddSkillModal: React.FC<AddSkillModalProps> = ({
  isOpen,
  onClose,
  domains,
  members,
  onAddSkill
}) => {
  const [domainMode, setDomainMode] = useState<'existing' | 'new'>('existing');
  const [selectedDomain, setSelectedDomain] = useState<string>(domains[0] || 'Virtualization');
  const [newDomainName, setNewDomainName] = useState<string>('');
  const [skillName, setSkillName] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [evidence, setEvidence] = useState<string>('');
  const [owner, setOwner] = useState<string>('');
  const [backup, setBackup] = useState<string>('');
  const [sme, setSme] = useState<string>('');

  const [ratings, setRatings] = useState<Record<string, CompetencyLevel>>(() => {
    const init: Record<string, CompetencyLevel> = {};
    members.forEach(m => {
      init[m.name] = 'L1';
    });
    return init;
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalDomain = domainMode === 'new' ? newDomainName.trim() : selectedDomain.trim();
    if (!finalDomain) {
      alert('Vui lòng chọn hoặc nhập tên Phân Khúc Domain');
      return;
    }
    if (!skillName.trim()) {
      alert('Vui lòng nhập tên Kỹ Năng Hạ Tầng');
      return;
    }

    onAddSkill({
      domain: finalDomain,
      skill: skillName.trim(),
      ratings,
      owner,
      backup,
      sme,
      notes: notes.trim(),
      evidence: evidence.trim()
    });

    // Reset form
    setSkillName('');
    setNotes('');
    setEvidence('');
    setNewDomainName('');
    onClose();
  };

  const handleLevelChange = (memberName: string, lvl: CompetencyLevel) => {
    setRatings(prev => ({ ...prev, [memberName]: lvl }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
              <PlusCircle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                Thêm Kỹ Năng Hạ Tầng Mới Vào Ma Trận & Excel
              </h3>
              <p className="text-[11px] text-slate-500">
                Bổ sung công nghệ, thiết lập năng lực thành viên và phân quyền phụ trách
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs text-slate-700">
          {/* Domain Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-indigo-600" />
              <span>Phân Khúc Domain Hạ Tầng:</span>
            </label>
            <div className="flex items-center gap-4 mb-2">
              <label className="inline-flex items-center gap-1.5 cursor-pointer font-medium">
                <input
                  type="radio"
                  name="domainMode"
                  checked={domainMode === 'existing'}
                  onChange={() => setDomainMode('existing')}
                  className="text-indigo-600 focus:ring-indigo-500"
                />
                <span>Chọn từ Domain hiện có ({domains.length})</span>
              </label>
              <label className="inline-flex items-center gap-1.5 cursor-pointer font-medium">
                <input
                  type="radio"
                  name="domainMode"
                  checked={domainMode === 'new'}
                  onChange={() => setDomainMode('new')}
                  className="text-indigo-600 focus:ring-indigo-500"
                />
                <span>Tạo Phân Khúc Domain Mới</span>
              </label>
            </div>

            {domainMode === 'existing' ? (
              <select
                value={selectedDomain}
                onChange={e => setSelectedDomain(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-semibold focus:outline-hidden"
              >
                {domains.map(d => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={newDomainName}
                onChange={e => setNewDomainName(e.target.value)}
                placeholder="VD: Public Cloud & Hybrid, Datacenter Facility, AI Networking..."
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                required
              />
            )}
          </div>

          {/* Skill Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1 flex items-center gap-1.5">
              <Wrench className="w-3.5 h-3.5 text-indigo-600" />
              <span>Tên Kỹ Năng / Giải Pháp Hạ Tầng:</span>
            </label>
            <input
              type="text"
              value={skillName}
              onChange={e => setSkillName(e.target.value)}
              placeholder="VD: AWS Transit Gateway, Fortinet SD-WAN, Dell PowerStore, ArgoCD..."
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-bold focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
              required
            />
          </div>

          {/* Roles Assignment */}
          <div className="grid grid-cols-3 gap-3 pt-2 border-t border-slate-100">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Chủ Quản (Owner)
              </label>
              <select
                value={owner}
                onChange={e => setOwner(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium"
              >
                <option value="">(Chưa chọn)</option>
                {members.map(m => (
                  <option key={m.name} value={m.name}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1 text-amber-700">
                Dự Phòng (Backup)
              </label>
              <select
                value={backup}
                onChange={e => setBackup(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium"
              >
                <option value="">(Chưa chọn)</option>
                {members.map(m => (
                  <option key={m.name} value={m.name}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1 text-purple-700">
                Chuyên Gia (SME L2)
              </label>
              <select
                value={sme}
                onChange={e => setSme(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium"
              >
                <option value="">(Chưa chọn)</option>
                {members.map(m => (
                  <option key={m.name} value={m.name}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Member ratings */}
          <div className="pt-2 border-t border-slate-100">
            <label className="block text-xs font-semibold text-slate-800 mb-2">
              Khởi tạo mức năng lực của 8 Kỹ sư (L0 đến L2):
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {members.map(m => {
                const curLvl = ratings[m.name] || 'L1';
                const def = COMPETENCY_DEFINITIONS[curLvl];
                return (
                  <div key={m.name} className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-1">
                      <span>{m.name}</span>
                      <span className={`px-1.5 py-0.2 rounded text-[10px] ${def.bgClass} ${def.textClass} border ${def.borderClass}`}>
                        {curLvl}
                      </span>
                    </div>
                    <select
                      value={curLvl}
                      onChange={e => handleLevelChange(m.name, e.target.value as CompetencyLevel)}
                      className="w-full text-[11px] bg-white border border-slate-200 rounded py-1 px-1 font-semibold"
                    >
                      {(['L0', 'L1', 'L2'] as CompetencyLevel[]).map(lvl => (
                        <option key={lvl} value={lvl}>
                          {lvl} ({COMPETENCY_DEFINITIONS[lvl].name})
                        </option>
                      ))}
                    </select>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Evidence / Certification */}
          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1">
              Minh Chứng / Chứng Chỉ Yêu Cầu (Evidence / Certification):
            </label>
            <input
              type="text"
              value={evidence}
              onChange={e => setEvidence(e.target.value)}
              placeholder="VD: VMware VCP-DCV, AWS Solutions Architect, Cisco CCNP, link Credly..."
              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium focus:outline-hidden focus:ring-1 focus:ring-purple-500"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              Ghi Chú Công Nghệ / Tài Liệu SOP:
            </label>
            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="VD: Đang áp dụng cho dự án Ngân hàng ACB, chứng chỉ CCNA/CCNP yêu cầu..."
              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs"
            >
              Lưu Kỹ Năng Vào Hệ Thống
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
