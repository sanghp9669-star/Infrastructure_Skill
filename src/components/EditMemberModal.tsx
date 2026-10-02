import React, { useState, useEffect } from 'react';
import { TeamMember } from '../types/skills';
import { X, User, Mail, Phone, Briefcase, Layers, Palette, Save, Trash2, Plus, Check } from 'lucide-react';

interface EditMemberModalProps {
  member: TeamMember | null;
  isOpen: boolean;
  onClose: () => void;
  availableDomains: string[];
  onSaveMember: (oldName: string, updatedMember: TeamMember) => void;
  onDeleteMember?: (memberName: string) => void;
}

const AVATAR_GRADIENTS = [
  { id: 'from-blue-600 to-indigo-700', label: 'Blue Indigo', class: 'bg-gradient-to-br from-blue-600 to-indigo-700' },
  { id: 'from-emerald-500 to-teal-700', label: 'Emerald Teal', class: 'bg-gradient-to-br from-emerald-500 to-teal-700' },
  { id: 'from-purple-600 to-pink-600', label: 'Purple Pink', class: 'bg-gradient-to-br from-purple-600 to-pink-600' },
  { id: 'from-amber-500 to-orange-600', label: 'Amber Orange', class: 'bg-gradient-to-br from-amber-500 to-orange-600' },
  { id: 'from-rose-500 to-red-700', label: 'Rose Red', class: 'bg-gradient-to-br from-rose-500 to-red-700' },
  { id: 'from-cyan-500 to-blue-600', label: 'Cyan Blue', class: 'bg-gradient-to-br from-cyan-500 to-blue-600' },
  { id: 'from-violet-600 to-purple-800', label: 'Violet Purple', class: 'bg-gradient-to-br from-violet-600 to-purple-800' },
  { id: 'from-slate-700 to-slate-900', label: 'Slate Dark', class: 'bg-gradient-to-br from-slate-700 to-slate-900' }
];

export const EditMemberModal: React.FC<EditMemberModalProps> = ({
  member,
  isOpen,
  onClose,
  availableDomains,
  onSaveMember,
  onDeleteMember
}) => {
  const [name, setName] = useState('');
  const [roleTitle, setRoleTitle] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [avatarColor, setAvatarColor] = useState('from-blue-600 to-indigo-700');
  const [selectedDomains, setSelectedDomains] = useState<string[]>([]);
  const [customDomainInput, setCustomDomainInput] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (member) {
      setName(member.name || '');
      setRoleTitle(member.roleTitle || 'Kỹ sư Hạ tầng');
      setEmail(member.email || '');
      setPhone(member.phone || '');
      setAvatarColor(member.avatarColor || 'from-blue-600 to-indigo-700');
      setSelectedDomains(member.primaryDomains || []);
      setErrorMsg(null);
    }
  }, [member, isOpen]);

  if (!isOpen || !member) return null;

  const handleToggleDomain = (domain: string) => {
    if (selectedDomains.includes(domain)) {
      setSelectedDomains(selectedDomains.filter(d => d !== domain));
    } else {
      setSelectedDomains([...selectedDomains, domain]);
    }
  };

  const handleAddCustomDomain = () => {
    const trimmed = customDomainInput.trim();
    if (trimmed && !selectedDomains.includes(trimmed)) {
      setSelectedDomains([...selectedDomains, trimmed]);
      setCustomDomainInput('');
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      setErrorMsg('Vui lòng nhập họ và tên thành viên.');
      return;
    }

    const updated: TeamMember = {
      ...member,
      name: trimmedName,
      roleTitle: roleTitle.trim() || 'Kỹ sư Hạ tầng',
      email: email.trim() || `${trimmedName.toLowerCase()}@viendat.com`,
      phone: phone.trim(),
      avatarColor,
      primaryDomains: selectedDomains.length > 0 ? selectedDomains : ['General Infrastructure']
    };

    onSaveMember(member.name, updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${avatarColor} flex items-center justify-center text-white font-black text-lg shadow-sm border border-white/20`}>
              {name ? name.charAt(0).toUpperCase() : 'V'}
            </div>
            <div>
              <h3 className="font-bold text-base text-white leading-tight">
                Chỉnh Sửa Thông Tin Thành Viên
              </h3>
              <p className="text-xs text-slate-300">
                Cập nhật thông tin kỹ sư {member.name}
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

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-4 text-xs flex-1">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 font-semibold text-xs">
              {errorMsg}
            </div>
          )}

          {/* Full Name & Job Title */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-slate-700 flex items-center gap-1.5 text-xs">
                <User className="w-3.5 h-3.5 text-indigo-600" />
                <span>Tên Hiển Thị / Bí Danh *</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Ví dụ: Sang, An, Cường..."
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:border-indigo-500 font-medium"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 flex items-center gap-1.5 text-xs">
                <Briefcase className="w-3.5 h-3.5 text-indigo-600" />
                <span>Chức Danh / Vị Trí</span>
              </label>
              <input
                type="text"
                value={roleTitle}
                onChange={e => setRoleTitle(e.target.value)}
                placeholder="Ví dụ: Senior Cloud Architect, Network Lead..."
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Email & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-slate-700 flex items-center gap-1.5 text-xs">
                <Mail className="w-3.5 h-3.5 text-indigo-600" />
                <span>Địa Chỉ Email</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="user@viendat.com"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 flex items-center gap-1.5 text-xs">
                <Phone className="w-3.5 h-3.5 text-indigo-600" />
                <span>Số Điện Thoại Liên Hệ</span>
              </label>
              <input
                type="text"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="09xx xxx xxx"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Avatar Color Palette Picker */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 flex items-center gap-1.5 text-xs">
              <Palette className="w-3.5 h-3.5 text-indigo-600" />
              <span>Màu Sắc Đại Diện (Avatar Gradient)</span>
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
              {AVATAR_GRADIENTS.map(grad => {
                const isSelected = avatarColor === grad.id;
                return (
                  <button
                    key={grad.id}
                    type="button"
                    onClick={() => setAvatarColor(grad.id)}
                    className={`h-9 rounded-xl ${grad.class} flex items-center justify-center text-white transition-all transform hover:scale-105 shadow-2xs relative ${
                      isSelected ? 'ring-2 ring-indigo-600 ring-offset-2 scale-105' : 'opacity-85 hover:opacity-100'
                    }`}
                    title={grad.label}
                  >
                    {isSelected && <Check className="w-4 h-4 text-white font-bold" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Primary Domain Expertise */}
          <div className="space-y-2 pt-1">
            <label className="font-bold text-slate-700 flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-indigo-600" />
                <span>Nhóm Kỹ Năng Thế Mạnh (Primary Domains)</span>
              </span>
              <span className="text-[10px] text-slate-400 font-normal">
                Đã chọn {selectedDomains.length} nhóm
              </span>
            </label>

            {/* Chips selector */}
            <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-2 bg-slate-50 rounded-xl border border-slate-200">
              {availableDomains.map(d => {
                const isSelected = selectedDomains.includes(d);
                return (
                  <button
                    key={d}
                    type="button"
                    onClick={() => handleToggleDomain(d)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-2xs'
                        : 'bg-white text-slate-700 border border-slate-200 hover:border-indigo-300'
                    }`}
                  >
                    {isSelected ? '✓ ' : '+ '}
                    {d}
                  </button>
                );
              })}
            </div>

            {/* Add custom domain input */}
            <div className="flex items-center gap-2 mt-1.5">
              <input
                type="text"
                value={customDomainInput}
                onChange={e => setCustomDomainInput(e.target.value)}
                placeholder="Hoặc nhập nhóm kỹ năng tùy chỉnh..."
                className="flex-1 px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:border-indigo-500"
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCustomDomain();
                  }
                }}
              />
              <button
                type="button"
                onClick={handleAddCustomDomain}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs border border-slate-300 transition-colors"
              >
                Thêm
              </button>
            </div>
          </div>
        </form>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div>
            {onDeleteMember && (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm(`Bạn có chắc chắn muốn xóa thành viên "${member.name}" khỏi danh sách đội ngũ?`)) {
                    onDeleteMember(member.name);
                    onClose();
                  }
                }}
                className="text-rose-600 hover:text-rose-800 text-xs font-semibold inline-flex items-center gap-1 hover:underline p-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Xóa Thành Viên</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-100 transition-colors"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 rounded-xl shadow-xs transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Lưu Thay Đổi</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
