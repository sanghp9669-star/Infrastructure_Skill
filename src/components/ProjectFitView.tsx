import React, { useState } from 'react';
import { CompetencyLevel, Project, SkillItem, TeamMember } from '../types/skills';
import { COMPETENCY_DEFINITIONS } from '../data/initialData';
import { ProjectModal } from './ProjectModal';
import { ProjectGapForecastSection } from './ProjectGapForecastSection';
import { VisualSkillGapChart } from './VisualSkillGapChart';
import { 
  FolderKanban, 
  CheckCircle2, 
  AlertCircle, 
  Users, 
  ExternalLink, 
  Calendar, 
  Building, 
  Sparkles,
  Plus,
  Edit3,
  Trash2,
  RotateCcw,
  Layers,
  FileCheck2
} from 'lucide-react';

interface ProjectFitViewProps {
  projects: Project[];
  skills: SkillItem[];
  members: TeamMember[];
  onSelectProjectFilter: (projectId: string) => void;
  onAddProject: (project: Project) => void;
  onUpdateProject: (project: Project) => void;
  onDeleteProject: (projectId: string) => void;
  onClearDemoProjects?: () => void;
  onRestoreDemoProjects?: () => void;
}

export const ProjectFitView: React.FC<ProjectFitViewProps> = ({
  projects,
  skills,
  members,
  onSelectProjectFilter,
  onAddProject,
  onUpdateProject,
  onDeleteProject,
  onClearDemoProjects,
  onRestoreDemoProjects
}) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id || '');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);

  const activeProject = projects.find(p => p.id === selectedProjectId) || projects[0];

  const handleOpenAddModal = () => {
    setProjectToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = () => {
    if (activeProject) {
      setProjectToEdit(activeProject);
      setIsModalOpen(true);
    }
  };

  const handleDeleteCurrentProject = () => {
    if (!activeProject) return;
    if (window.confirm(`Bạn có chắc chắn muốn xóa dự án "${activeProject.name}" [${activeProject.code}]?`)) {
      onDeleteProject(activeProject.id);
      // Select next available project
      const remaining = projects.filter(p => p.id !== activeProject.id);
      if (remaining.length > 0) {
        setSelectedProjectId(remaining[0].id);
      } else {
        setSelectedProjectId('');
      }
    }
  };

  const handleSaveProject = (savedProject: Project) => {
    if (projectToEdit) {
      onUpdateProject(savedProject);
    } else {
      onAddProject(savedProject);
      setSelectedProjectId(savedProject.id);
    }
  };

  // If no projects exist (e.g. user cleared demo data)
  if (!activeProject || projects.length === 0) {
    return (
      <div className="space-y-6">
        {/* Header toolbar */}
        <div className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-3 no-print">
          <div className="flex items-center gap-2">
            <FolderKanban className="w-5 h-5 text-indigo-600" />
            <h2 className="text-sm font-bold text-slate-900">
              Quản Lý & Đánh Giá Phù Hợp Dự Án
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenAddModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-2xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Tạo Dự Án Mới</span>
            </button>

            {onRestoreDemoProjects && (
              <button
                onClick={onRestoreDemoProjects}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                <span>Nạp Dự Án Mẫu</span>
              </button>
            )}
          </div>
        </div>

        {/* Empty State Card */}
        <div className="bg-white rounded-2xl p-12 border border-slate-200/90 shadow-2xs text-center max-w-2xl mx-auto my-8">
          <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-indigo-100 shadow-xs">
            <FolderKanban className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">
            Chưa Có Dự Án Nào Được Tạo
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mb-6 leading-relaxed">
            Hệ thống không bắt buộc dùng dữ liệu mẫu. Bạn có thể tự do thêm các dự án thực tế của công ty để phân bổ nhân sự và đối chiếu ma trận kỹ năng đáp ứng.
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={handleOpenAddModal}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 rounded-xl shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Tạo Dự Án Đầu Tiên Của Bạn</span>
            </button>
            {onRestoreDemoProjects && (
              <button
                onClick={onRestoreDemoProjects}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Xem Dữ Liệu Mẫu</span>
              </button>
            )}
          </div>
        </div>

        {/* Project Modal */}
        <ProjectModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          projectToEdit={projectToEdit}
          skills={skills}
          members={members}
          onSaveProject={handleSaveProject}
        />
      </div>
    );
  }

  // Calculate project readiness
  let totalWeightedScore = 0;
  let maxPossibleWeightedScore = 0;
  const skillAnalysis = (activeProject.requiredSkills || []).map(req => {
    const skillItem = skills.find(s => s.skill.toLowerCase() === req.skillName.toLowerCase()) ||
      skills.find(s => s.skill.toLowerCase().includes(req.skillName.toLowerCase()));

    const targetDef = COMPETENCY_DEFINITIONS[req.minLevel] || COMPETENCY_DEFINITIONS['L2'];
    const targetScore = targetDef.score;
    maxPossibleWeightedScore += targetScore * (req.weight || 3);

    // Highest score among assigned members
    let bestAssignedMember = '';
    let bestAssignedScore = 0;
    let bestAssignedLevel: CompetencyLevel = 'L0';

    (activeProject.assignedMembers || []).forEach(memName => {
      if (skillItem) {
        const lvl = skillItem.ratings[memName] || 'L0';
        const sc = COMPETENCY_DEFINITIONS[lvl]?.score || 0;
        if (sc > bestAssignedScore) {
          bestAssignedScore = sc;
          bestAssignedLevel = lvl;
          bestAssignedMember = memName;
        }
      }
    });

    // Best member in the whole team
    let bestTeamMember = '';
    let bestTeamScore = 0;
    let bestTeamLevel: CompetencyLevel = 'L0';

    members.forEach(m => {
      if (skillItem) {
        const lvl = skillItem.ratings[m.name] || 'L0';
        const sc = COMPETENCY_DEFINITIONS[lvl]?.score || 0;
        if (sc > bestTeamScore) {
          bestTeamScore = sc;
          bestTeamLevel = lvl;
          bestTeamMember = m.name;
        }
      }
    });

    const isMet = bestAssignedScore >= targetScore;
    totalWeightedScore += Math.min(bestAssignedScore, targetScore) * (req.weight || 3);

    return {
      requirement: req,
      skillItem,
      targetScore,
      targetLevel: req.minLevel,
      bestAssignedMember,
      bestAssignedLevel,
      bestAssignedScore,
      bestTeamMember,
      bestTeamLevel,
      bestTeamScore,
      isMet,
      gap: targetScore - bestAssignedScore
    };
  });

  const readinessPercent = maxPossibleWeightedScore > 0
    ? Math.round((totalWeightedScore / maxPossibleWeightedScore) * 100)
    : 100;

  const metCount = skillAnalysis.filter(s => s.isMet).length;
  const totalCount = skillAnalysis.length;

  return (
    <div className="space-y-6">
      {/* Project Selector Bar & Actions */}
      <div className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-3 no-print">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <FolderKanban className="w-5 h-5 text-indigo-600" />
            <h2 className="text-sm font-bold text-slate-900">
              Đánh Giá Mức Độ Phù Hợp Nhân Sự Cho Dự Án
            </h2>
          </div>

          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            <span className="text-xs font-semibold text-slate-600">Dự án:</span>
            <select
              value={activeProject.id}
              onChange={e => setSelectedProjectId(e.target.value)}
              className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-bold focus:outline-hidden"
            >
              {projects.map(p => (
                <option key={p.id} value={p.id}>
                  [{p.code}] {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Action Buttons for CRUD */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-2xs transition-colors"
            title="Tạo dự án mới thực tế"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Thêm Dự Án Mới</span>
          </button>

          <button
            onClick={handleOpenEditModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors shadow-2xs"
            title="Chỉnh sửa thông tin, nhân sự hoặc yêu cầu kỹ năng của dự án này"
          >
            <Edit3 className="w-3.5 h-3.5 text-indigo-600" />
            <span>Chỉnh Sửa Dự Án</span>
          </button>

          <button
            onClick={handleDeleteCurrentProject}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors"
            title="Xóa dự án này"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-600" />
            <span>Xóa</span>
          </button>

          {onClearDemoProjects && (
            <button
              onClick={onClearDemoProjects}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors"
              title="Xóa tất cả dự án để tạo lại danh sách dự án thực tế"
            >
              <span>Xóa Hết</span>
            </button>
          )}
        </div>
      </div>

      {/* Project Banner & KPI Summary */}
      <div className="bg-white rounded-xl p-6 border border-slate-200/90 shadow-2xs">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Project Details */}
          <div className="lg:col-span-8 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                {activeProject.code}
              </span>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
                activeProject.status === 'In Progress'
                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                  : activeProject.status === 'Delivered'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-slate-100 text-slate-700 border border-slate-200'
              }`}>
                {activeProject.status === 'In Progress' ? 'Đang Triển Khai' : activeProject.status === 'Delivered' ? 'Đã Nghiệm Thu' : 'Giai Đoạn Chuẩn Bị'}
              </span>
            </div>

            <h3 className="text-lg font-bold text-slate-900 leading-snug">
              {activeProject.name}
            </h3>

            {activeProject.description && (
              <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
                {activeProject.description}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-2 border-t border-slate-100">
              <div className="flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-slate-400" />
                <span>Khách hàng: <strong className="text-slate-700">{activeProject.client || 'Nội bộ'}</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Thời hạn: <strong className="text-slate-700">{activeProject.startDate} đến {activeProject.targetDate}</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-slate-400" />
                <span>Phụ trách chính (Lead): <strong className="text-indigo-700 font-bold">{activeProject.lead}</strong></span>
              </div>
            </div>

            {/* Assigned Team Chips */}
            <div className="flex items-center gap-2 pt-1 text-xs">
              <span className="text-slate-500 font-medium">Đội ngũ phân bổ ({activeProject.assignedMembers?.length || 0}):</span>
              <div className="flex flex-wrap gap-1.5">
                {(activeProject.assignedMembers || []).length === 0 ? (
                  <span className="text-slate-400 italic">Chưa phân bổ nhân sự</span>
                ) : (
                  activeProject.assignedMembers.map(m => (
                    <span
                      key={m}
                      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200"
                    >
                      {m}
                    </span>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Readiness Meter Card */}
          <div className="lg:col-span-4 bg-slate-50 rounded-xl p-5 border border-slate-200/80 flex flex-col items-center justify-center text-center">
            <span className="text-xs font-semibold text-slate-600 mb-1">
              Mức Độ Đáp Ứng Kỹ Năng Của Dự Án
            </span>
            <div className="flex items-baseline gap-1 my-2">
              <span className={`text-4xl font-extrabold tracking-tight tabular-nums ${
                readinessPercent >= 80 ? 'text-emerald-600' : readinessPercent >= 60 ? 'text-indigo-600' : 'text-amber-600'
              }`}>
                {readinessPercent}%
              </span>
            </div>

            <div className="w-full bg-slate-200 rounded-full h-2.5 my-2 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  readinessPercent >= 80 ? 'bg-emerald-500' : readinessPercent >= 60 ? 'bg-indigo-500' : 'bg-amber-500'
                }`}
                style={{ width: `${readinessPercent}%` }}
              />
            </div>

            <div className="text-xs text-slate-500 mt-1">
              Đạt chuẩn <strong className="text-slate-900 font-semibold">{metCount}</strong> / {totalCount} yêu cầu kỹ năng
            </div>

            <button
              onClick={() => onSelectProjectFilter(activeProject.id)}
              className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-white border border-indigo-200 rounded-lg hover:bg-indigo-50 transition-colors shadow-2xs"
            >
              <span>Xem kỹ năng dự án trên bảng ma trận</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Visual Skill Gap Analysis Chart (Comparison against Project & Enterprise Standards) */}
      <VisualSkillGapChart
        activeProject={activeProject}
        skills={skills}
        members={members}
        skillAnalysis={skillAnalysis}
      />

      {/* Skill Gap Analysis Table */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="px-4 py-3 bg-slate-50/80 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-600" />
            <h4 className="font-bold text-slate-800">
              Chi Tiết Năng Lực Đáp Ứng & Lỗ Hổng Kỹ Năng ({skillAnalysis.length} kỹ năng)
            </h4>
          </div>
          <button
            onClick={handleOpenEditModal}
            className="text-xs text-indigo-600 font-bold hover:text-indigo-800 inline-flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Thêm/Bớt Kỹ Năng Yêu Cầu</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-300">
              <tr>
                <th className="py-2.5 px-3 w-10 text-center text-slate-500">#</th>
                <th className="py-2.5 px-3 w-32">Nhóm Kỹ Năng</th>
                <th className="py-2.5 px-3 min-w-[180px]">Kỹ Năng Yêu Cầu</th>
                <th className="py-2.5 px-3 w-28 text-center">Chuẩn Tối Thiểu</th>
                <th className="py-2.5 px-3 w-40">Kỹ Sư Đã Phân Bổ Tốt Nhất</th>
                <th className="py-2.5 px-3 w-28 text-center">Trạng Thái</th>
                <th className="py-2.5 px-3 min-w-[200px]">Đề Xuất Hỗ Trợ Từ Đội Ngũ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {skillAnalysis.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Chưa có kỹ năng nào được yêu cầu cho dự án này.
                  </td>
                </tr>
              ) : (
                skillAnalysis.map((item, idx) => {
                  const targetDef = COMPETENCY_DEFINITIONS[item.targetLevel] || COMPETENCY_DEFINITIONS['L2'];
                  const assignedDef = COMPETENCY_DEFINITIONS[item.bestAssignedLevel] || COMPETENCY_DEFINITIONS['L0'];

                  return (
                    <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-3 text-center text-slate-400 font-mono text-[11px] tabular-nums">
                        {idx + 1}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 font-medium whitespace-nowrap">
                        {item.requirement.domain}
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-slate-900">
                        {item.requirement.skillName}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded font-bold text-xs border ${targetDef.bgClass} ${targetDef.textClass} ${targetDef.borderClass}`}>
                          {item.targetLevel}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        {item.bestAssignedMember ? (
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-slate-900">{item.bestAssignedMember}</span>
                            <span className={`px-1.5 py-0.2 rounded text-[11px] font-bold border ${assignedDef.bgClass} ${assignedDef.textClass} ${assignedDef.borderClass}`}>
                              {item.bestAssignedLevel}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Chưa ai trong nhóm đạt</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        {item.isMet ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-semibold text-[11px] border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Đạt Chuẩn</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-50 px-2 py-0.5 rounded font-semibold text-[11px] border border-amber-200">
                            <AlertCircle className="w-3.5 h-3.5" />
                            <span>Thiếu {item.gap} Cấp</span>
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3">
                        {!item.isMet && item.bestTeamMember && item.bestTeamScore >= item.targetScore ? (
                          <div className="flex items-center gap-1.5 text-indigo-700 font-medium">
                            <Sparkles className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                            <span>Huy động thêm <strong>{item.bestTeamMember}</strong> ({item.bestTeamLevel}) hỗ trợ</span>
                          </div>
                        ) : !item.isMet ? (
                          <span className="text-rose-700 font-medium text-[11px]">
                            Cần đào tạo nâng cao hoặc thuê đối tác
                          </span>
                        ) : (
                          <span className="text-slate-500 text-[11px]">
                            Đã tự chủ triển khai độc lập
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Gap Analysis Forecast based on planned team size & safety standard */}
      <ProjectGapForecastSection
        skills={skills}
        members={members}
        projects={projects}
        activeProject={activeProject}
      />

      {/* Project Modal */}
      <ProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        projectToEdit={projectToEdit}
        skills={skills}
        members={members}
        onSaveProject={handleSaveProject}
      />
    </div>
  );
};
