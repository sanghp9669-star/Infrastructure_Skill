import React, { useState } from 'react';
import { CURATED_INFRA_SKILLS, SuggestedSkill } from '../data/suggestedSkills';
import { SkillItem, TeamMember } from '../types/skills';
import { Sparkles, CheckSquare, Square, Check, X, Shield, Plus, Filter } from 'lucide-react';

interface CuratedSkillsModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingSkills: SkillItem[];
  members: TeamMember[];
  onBatchAddSkills: (skillsToAdd: SuggestedSkill[]) => void;
}

export const CuratedSkillsModal: React.FC<CuratedSkillsModalProps> = ({
  isOpen,
  onClose,
  existingSkills,
  members,
  onBatchAddSkills
}) => {
  const [selectedDomain, setSelectedDomain] = useState<string>('all');
  const [selectedItems, setSelectedItems] = useState<Record<string, boolean>>({});

  if (!isOpen) return null;

  const existingNames = new Set(existingSkills.map(s => s.skill.toLowerCase()));

  // Filter skills
  const filteredSkills = CURATED_INFRA_SKILLS.filter(s => {
    if (selectedDomain !== 'all' && s.domain !== selectedDomain) return false;
    return true;
  });

  const availableToAdd = filteredSkills.filter(s => !existingNames.has(s.skill.toLowerCase()));

  const toggleSelect = (skillName: string) => {
    setSelectedItems(prev => ({ ...prev, [skillName]: !prev[skillName] }));
  };

  const selectAll = () => {
    const updated: Record<string, boolean> = {};
    availableToAdd.forEach(s => {
      updated[s.skill] = true;
    });
    setSelectedItems(updated);
  };

  const deselectAll = () => {
    setSelectedItems({});
  };

  const handleConfirmAdd = () => {
    const toAdd = CURATED_INFRA_SKILLS.filter(s => selectedItems[s.skill] && !existingNames.has(s.skill.toLowerCase()));
    if (toAdd.length === 0) return;
    onBatchAddSkills(toAdd);
    onClose();
  };

  const selectedCount = Object.values(selectedItems).filter(Boolean).length;
  const domains = Array.from(new Set(CURATED_INFRA_SKILLS.map(s => s.domain))).sort();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-indigo-50/60 to-purple-50/60">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                Gợi Ý & Bổ Sung Kỹ Năng Hạ Tầng Tiêu Chuẩn Doanh Nghiệp 2026
              </h3>
              <p className="text-[11px] text-slate-500">
                Tuyển chọn các công nghệ Public Cloud, SD-WAN, Zero-Trust, Observability, AI cluster
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

        {/* Toolbar */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <span className="font-medium text-slate-600">Lọc theo nhóm:</span>
            <select
              value={selectedDomain}
              onChange={e => setSelectedDomain(e.target.value)}
              className="px-2.5 py-1 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 font-semibold"
            >
              <option value="all">Tất cả Nhóm Công Nghệ ({CURATED_INFRA_SKILLS.length} gợi ý)</option>
              {domains.map(d => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={selectAll}
              className="text-indigo-600 hover:text-indigo-800 font-semibold transition-colors"
            >
              Chọn tất cả ({availableToAdd.length})
            </button>
            <span className="text-slate-300">|</span>
            <button
              onClick={deselectAll}
              className="text-slate-500 hover:text-slate-700 transition-colors"
            >
              Bỏ chọn
            </button>
          </div>
        </div>

        {/* Skills List */}
        <div className="p-6 overflow-y-auto space-y-2 text-xs text-slate-700">
          {filteredSkills.map(s => {
            const isAlreadyAdded = existingNames.has(s.skill.toLowerCase());
            const isChecked = !!selectedItems[s.skill];

            return (
              <div
                key={s.skill}
                onClick={() => !isAlreadyAdded && toggleSelect(s.skill)}
                className={`p-3 rounded-xl border transition-all flex items-start justify-between gap-3 ${
                  isAlreadyAdded
                    ? 'bg-slate-50 border-slate-200 opacity-60 cursor-not-allowed'
                    : isChecked
                    ? 'bg-indigo-50/60 border-indigo-300 shadow-2xs cursor-pointer'
                    : 'bg-white hover:bg-slate-50 border-slate-200 cursor-pointer'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 shrink-0">
                    {isAlreadyAdded ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : isChecked ? (
                      <CheckSquare className="w-4 h-4 text-indigo-600" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-300" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{s.skill}</span>
                      <span className="text-[10px] font-semibold px-2 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200">
                        {s.domain}
                      </span>
                      {s.importance === 'Critical' && (
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-rose-50 text-rose-700 border border-rose-200">
                          Trọng yếu
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">{s.description}</p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  {isAlreadyAdded ? (
                    <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Đã có trong ma trận
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-500">
                      Gợi ý Lead: <strong>{s.recommendedOwner || 'Sang'}</strong>
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            Đã chọn <strong className="text-indigo-600 font-bold">{selectedCount}</strong> kỹ năng mới để bổ sung
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Hủy
            </button>
            <button
              onClick={handleConfirmAdd}
              disabled={selectedCount === 0}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Bổ Sung {selectedCount > 0 ? `(${selectedCount}) Kỹ Năng` : ''} Vào Ma Trận</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
