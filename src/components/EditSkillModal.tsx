import React, { useState, useEffect } from 'react';
import { SkillItem, TeamMember, CompetencyLevel } from '../types/skills';
import { COMPETENCY_DEFINITIONS } from '../data/initialData';
import { 
  Edit3, 
  Trash2, 
  X, 
  Check, 
  Layers, 
  Wrench, 
  Shield, 
  Award, 
  ExternalLink, 
  FileCheck2, 
  Link2, 
  ChevronDown, 
  ChevronUp, 
  Sparkles,
  UserCheck
} from 'lucide-react';

interface EditSkillModalProps {
  skill: SkillItem | null;
  isOpen: boolean;
  onClose: () => void;
  domains: string[];
  members: TeamMember[];
  onSaveSkill: (updatedSkill: SkillItem) => void;
  onDeleteSkill: (skillId: number) => void;
}

export const EditSkillModal: React.FC<EditSkillModalProps> = ({
  skill,
  isOpen,
  onClose,
  domains,
  members,
  onSaveSkill,
  onDeleteSkill
}) => {
  const [skillName, setSkillName] = useState<string>('');
  const [domain, setDomain] = useState<string>('');
  const [owner, setOwner] = useState<string>('');
  const [backup, setBackup] = useState<string>('');
  const [sme, setSme] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [evidence, setEvidence] = useState<string>('');
  const [memberEvidence, setMemberEvidence] = useState<Record<string, string>>({});
  const [showMemberEvidence, setShowMemberEvidence] = useState<boolean>(false);

  useEffect(() => {
    if (skill) {
      setSkillName(skill.skill);
      setDomain(skill.domain);
      setOwner(skill.owner || '');
      setBackup(skill.backup || '');
      setSme(skill.sme || '');
      setNotes(skill.notes || '');
      setEvidence(skill.evidence || '');
      setMemberEvidence(skill.memberEvidence || {});
    }
  }, [skill]);

  if (!isOpen || !skill) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!skillName.trim() || !domain.trim()) return;

    onSaveSkill({
      ...skill,
      skill: skillName.trim(),
      domain: domain.trim(),
      owner,
      backup,
      sme,
      notes: notes.trim(),
      evidence: evidence.trim(),
      memberEvidence
    });
    onClose();
  };

  const handleDelete = () => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa kỹ năng "${skill.skill}" khỏi ma trận?`)) {
      onDeleteSkill(skill.id);
      onClose();
    }
  };

  const handleMemberEvidenceChange = (memberName: string, val: string) => {
    setMemberEvidence(prev => ({
      ...prev,
      [memberName]: val
    }));
  };

  // Helper to test if a string contains a valid link
  const isValidUrl = (text: string) => {
    return /^https?:\/\//i.test(text.trim());
  };

  // Certificate preset suggestions based on domain/skill
  const getCertPresets = () => {
    const dLower = domain.toLowerCase();
    const sLower = skillName.toLowerCase();

    if (dLower.includes('virt') || sLower.includes('vmware') || sLower.includes('proxmox')) {
      return ['VMware VCP-DCV', 'VMware VCF Architect', 'Nutanix NCP-MCI', 'Proxmox Certified Administrator'];
    }
    if (dLower.includes('net') || sLower.includes('cisco') || sLower.includes('bgp') || sLower.includes('switch')) {
      return ['Cisco CCNA', 'Cisco CCNP Enterprise', 'Cisco CCIE Enterprise', 'Aruba Certified Network Professional (ACNP)'];
    }
    if (dLower.includes('sec') || sLower.includes('palo') || sLower.includes('forti') || sLower.includes('firewall')) {
      return ['Fortinet NSE 4 / 7 Network Security', 'Palo Alto PCNSE', 'Check Point CCSA / CCSE', 'CompTIA Security+'];
    }
    if (dLower.includes('container') || sLower.includes('k8s') || sLower.includes('docker')) {
      return ['Certified Kubernetes Administrator (CKA)', 'Certified Kubernetes Application Developer (CKAD)', 'Red Hat Certified OpenShift Admin'];
    }
    if (dLower.includes('cloud') || sLower.includes('aws') || sLower.includes('azure')) {
      return ['AWS Certified Solutions Architect (SAA/SAP)', 'Microsoft Certified: Azure Solutions Architect Expert (AZ-305)', 'Google Cloud Professional Cloud Architect'];
    }
    if (dLower.includes('storage') || dLower.includes('backup') || sLower.includes('veeam')) {
      return ['Veeam Certified Engineer (VMCE)', 'NetApp Certified Technology Associate (NCTA)', 'Dell Certified Associate - Storage'];
    }
    if (dLower.includes('linux') || sLower.includes('ubuntu') || sLower.includes('rhel')) {
      return ['Red Hat Certified System Administrator (RHCSA)', 'Red Hat Certified Engineer (RHCE)', 'Linux Foundation Certified System Administrator (LFCS)'];
    }
    if (dLower.includes('win') || dLower.includes('365') || sLower.includes('active directory')) {
      return ['Microsoft Certified: Windows Server Hybrid Administrator Associate', 'Microsoft 365 Certified: Enterprise Administrator Expert'];
    }
    return ['CompTIA Server+', 'ITIL 4 Foundation', 'Certified Information Systems Security Professional (CISSP)'];
  };

  const certPresets = getCertPresets();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
              <Edit3 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                Chỉnh Sửa Kỹ Năng & Minh Chứng Chứng Chỉ (Evidence/Certification)
              </h3>
              <p className="text-[11px] text-slate-500 font-mono">
                ID #{skill.id} · {skill.domain}
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

        {/* Body */}
        <form onSubmit={handleSave} className="p-6 space-y-4 text-xs text-slate-700 overflow-y-auto">
          {/* Domain & Skill Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-indigo-600" />
                <span>Phân Khúc Domain:</span>
              </label>
              <input
                type="text"
                value={domain}
                onChange={e => setDomain(e.target.value)}
                list="domain-options"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                required
              />
              <datalist id="domain-options">
                {domains.map(d => (
                  <option key={d} value={d} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1 flex items-center gap-1.5">
                <Wrench className="w-3.5 h-3.5 text-indigo-600" />
                <span>Tên Kỹ Năng:</span>
              </label>
              <input
                type="text"
                value={skillName}
                onChange={e => setSkillName(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-bold focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                required
              />
            </div>
          </div>

          {/* Roles Assignment */}
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Owner (Chủ quản)
              </label>
              <select
                value={owner}
                onChange={e => setOwner(e.target.value)}
                className="w-full px-2 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg font-medium"
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
                Backup (Dự phòng)
              </label>
              <select
                value={backup}
                onChange={e => setBackup(e.target.value)}
                className="w-full px-2 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg font-medium"
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
                SME (Chuyên gia)
              </label>
              <select
                value={sme}
                onChange={e => setSme(e.target.value)}
                className="w-full px-2 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg font-medium"
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

          {/* Evidence / Certification Field (The Requested Feature) */}
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-purple-600" />
                <span>Minh Chứng & Chứng Chỉ Kỹ Năng (Evidence / Certification):</span>
              </label>
              {isValidUrl(evidence) && (
                <a
                  href={evidence}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-800"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>Mở liên kết chứng chỉ</span>
                </a>
              )}
            </div>

            <div className="relative">
              <input
                type="text"
                value={evidence}
                onChange={e => setEvidence(e.target.value)}
                placeholder="Nhập liên kết Credly, Microsoft Learn, Cisco verification hoặc tên chứng chỉ quốc tế..."
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium focus:outline-hidden focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 pr-8"
              />
              <FileCheck2 className="w-4 h-4 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
            </div>

            {/* Quick preset badges */}
            <div className="flex flex-wrap items-center gap-1 pt-1">
              <span className="text-[10px] text-slate-400 font-medium">Gợi ý chứng chỉ chuẩn:</span>
              {certPresets.map(cert => (
                <button
                  type="button"
                  key={cert}
                  onClick={() => {
                    if (!evidence) {
                      setEvidence(cert);
                    } else if (!evidence.includes(cert)) {
                      setEvidence(`${evidence} | ${cert}`);
                    }
                  }}
                  className="text-[10px] px-2 py-0.5 rounded bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 transition-colors"
                >
                  + {cert}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-500">
              Minh chứng hoặc tài liệu bài Lab hỗ trợ bảo vệ năng lực L2 (Đã biết và Lab thành công).
            </p>
          </div>

          {/* Member-Specific Evidence (Expandable Section) */}
          <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200 space-y-2">
            <button
              type="button"
              onClick={() => setShowMemberEvidence(!showMemberEvidence)}
              className="w-full flex items-center justify-between text-xs font-semibold text-slate-800 hover:text-indigo-600 transition-colors"
            >
              <div className="flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-indigo-600" />
                <span>Minh Chứng Từng Kỹ Sư Cụ Thể (Member-Specific Verification)</span>
                {Object.values(memberEvidence).filter(Boolean).length > 0 && (
                  <span className="text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.2 rounded-full font-bold">
                    {Object.values(memberEvidence).filter(Boolean).length} đã gán
                  </span>
                )}
              </div>
              {showMemberEvidence ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showMemberEvidence && (
              <div className="space-y-2 pt-2 border-t border-slate-200">
                <p className="text-[11px] text-slate-500">
                  Gán liên kết xác thực huy hiệu chứng chỉ (Credly / Badgr / Certificate ID) riêng cho từng kỹ sư:
                </p>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {members.map(m => {
                    const memberLevel = skill.ratings[m.name] || 'L0';
                    const def = COMPETENCY_DEFINITIONS[memberLevel];
                    const val = memberEvidence[m.name] || '';

                    return (
                      <div key={m.name} className="flex items-center gap-2 p-1.5 bg-white rounded-lg border border-slate-200 text-xs">
                        <div className="w-20 shrink-0 font-bold text-slate-800 flex items-center gap-1">
                          <span>{m.name}</span>
                          <span className={`px-1 py-0.2 rounded text-[10px] ${def.bgClass} ${def.textClass} border ${def.borderClass}`}>
                            {memberLevel}
                          </span>
                        </div>
                        <input
                          type="text"
                          value={val}
                          onChange={e => handleMemberEvidenceChange(m.name, e.target.value)}
                          placeholder={`Link chứng chỉ của ${m.name} (Credly URL, Cert ID)...`}
                          className="flex-1 px-2 py-1 text-[11px] bg-slate-50 border border-slate-200 rounded text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                        />
                        {isValidUrl(val) && (
                          <a
                            href={val}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-600 hover:text-indigo-800 p-1"
                            title="Kiểm tra liên kết"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              Ghi Chú Công Nghệ / Tài Liệu Quy Trình SOP:
            </label>
            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="VD: Áp dụng dự án Ngân hàng ACB, định kỳ kiểm tra backup mỗi tuần..."
              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
            <button
              type="button"
              onClick={handleDelete}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors font-semibold"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Xóa Kỹ Năng</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs"
              >
                Lưu Thay Đổi & Chứng Chỉ
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
