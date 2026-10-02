import * as XLSX from 'xlsx';
import { COMPETENCY_DEFINITIONS, INITIAL_PROJECTS } from '../data/initialData';
import { CompetencyLevel, Project, SkillItem, TeamMember } from '../types/skills';

/**
 * Exports skills matrix to CSV with UTF-8 BOM for perfect Excel Vietnamese display
 */
export function exportSkillsToCSV(
  skills: SkillItem[],
  members: TeamMember[],
  filename: string = 'Viendat_Infrastructure_Skill_Matrix.csv'
) {
  const headers = [
    'STT',
    'Domain (Phân khúc)',
    'Kỹ năng (Skill)',
    ...members.map(m => m.name),
    'Chủ quản (Owner)',
    'Dự phòng (Backup)',
    'Chuyên gia (SME)',
    'Minh chứng / Chứng chỉ (Evidence/Cert)',
    'Điểm TB (0-5)'
  ];

  const rows = skills.map((item, index) => {
    const scores = members.map(m => {
      const lvl = item.ratings[m.name] || 'L0';
      const def = COMPETENCY_DEFINITIONS[lvl];
      return `${lvl} (${def ? def.score : 0})`;
    });

    const numScores = members.map(m => {
      const lvl = item.ratings[m.name] || 'L0';
      return COMPETENCY_DEFINITIONS[lvl]?.score || 0;
    });
    const avg = (numScores.reduce((a, b) => a + b, 0) / (members.length || 1)).toFixed(1);

    return [
      String(index + 1),
      `"${item.domain.replace(/"/g, '""')}"`,
      `"${item.skill.replace(/"/g, '""')}"`,
      ...scores.map(s => `"${s}"`),
      `"${item.owner || '-'}"`,
      `"${item.backup || '-'}"`,
      `"${item.sme || '-'}"`,
      `"${(item.evidence || '-').replace(/"/g, '""')}"`,
      avg
    ];
  });

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Exports skills matrix to real Excel .xlsx format with multiple sheets
 */
export function exportSkillsToExcel(
  skills: SkillItem[],
  members: TeamMember[],
  projects: Project[] = INITIAL_PROJECTS,
  filename: string = 'Viendat_Infrastructure_Skill_Matrix.xlsx'
) {
  const wb = XLSX.utils.book_new();

  // Sheet 1: Team Skill Matrix
  const matrixData = skills.map((s, idx) => {
    const rowObj: Record<string, string | number> = {
      'No.': idx + 1,
      'Domain': s.domain,
      'Skill': s.skill,
    };
    members.forEach(m => {
      rowObj[m.name] = s.ratings[m.name] || 'L0';
    });
    rowObj['Owner'] = s.owner || '';
    rowObj['Backup'] = s.backup || '';
    rowObj['SME'] = s.sme || '';
    rowObj['Evidence / Certification'] = s.evidence || '';
    return rowObj;
  });

  const ws1 = XLSX.utils.json_to_sheet(matrixData);
  XLSX.utils.book_append_sheet(wb, ws1, 'Team Skill Matrix');

  // Sheet 2: Competency Definition (Chuẩn Hóa Khung Năng Lực Hạ Tầng L0 - L2)
  const compData = [
    {
      'Mức Độ (Level)': 'L0',
      'Tên Mức Năng Lực': 'Chưa biết gì',
      'Mô Tả Năng Lực': 'Chưa biết gì',
      'Tiêu Chí Thực Chiến (Core Criteria)': 'Chưa tiếp cận công nghệ, chưa có kiến thức lý thuyết hay kinh nghiệm thực hành.',
      'Mức Độ Tự Chủ & Trách Nhiệm': 'Cần đào tạo và hướng dẫn từ đầu.',
      'Vai Trò Dự Án': 'Chưa tham gia phân công liên quan',
      'Điểm Số (Score)': 0
    },
    {
      'Mức Độ (Level)': 'L1',
      'Tên Mức Năng Lực': 'Đã biết nhưng lab chưa thành công hoặc chưa lab',
      'Mô Tả Năng Lực': 'Đã biết nhưng lab chưa thành công hoặc chưa lab',
      'Tiêu Chí Thực Chiến (Core Criteria)': 'Đã nắm khái niệm/lý thuyết hoặc đang thực hành lab dở dang, chưa dựng thành công bài Lab.',
      'Mức Độ Tự Chủ & Trách Nhiệm': 'Cần hướng dẫn và hỗ trợ xử lý lỗi khi thực hành lab.',
      'Vai Trò Dự Án': 'Đang tự học / Thực hành bài Lab',
      'Điểm Số (Score)': 1
    },
    {
      'Mức Độ (Level)': 'L2',
      'Tên Mức Năng Lực': 'Đã biết và Lab thành công',
      'Mô Tả Năng Lực': 'Đã biết và Lab thành công',
      'Tiêu Chí Thực Chiến (Core Criteria)': 'Đã nắm vững lý thuyết và tự tay triển khai Lab thành công, xác thực hoạt động thực tế.',
      'Mức Độ Tự Chủ & Trách Nhiệm': 'Tự chủ thực hành, triển khai độc lập và chịu trách nhiệm về kết quả cấu hình.',
      'Vai Trò Dự Án': 'Kỹ sư thực chiến / Sẵn sàng triển khai',
      'Điểm Số (Score)': 2
    }
  ];
  const ws2 = XLSX.utils.json_to_sheet(compData);
  ws2['!cols'] = [
    { wch: 15 }, // Mức Độ
    { wch: 28 }, // Tên Mức Năng Lực
    { wch: 50 }, // Mô Tả Năng Lực
    { wch: 60 }, // Tiêu Chí Thực Chiến
    { wch: 45 }, // Mức Độ Tự Chủ
    { wch: 40 }, // Vai Trò Dự Án
    { wch: 15 }  // Điểm Số
  ];
  XLSX.utils.book_append_sheet(wb, ws2, 'Competency Definition');

  // Sheet 3: Coverage Risk Summary
  const riskData = skills
    .filter(s => !s.sme || !s.backup)
    .map((s, idx) => ({
      'No.': idx + 1,
      'Domain': s.domain,
      'Skill': s.skill,
      'Owner': s.owner || 'CHƯA CÓ',
      'Backup': s.backup || 'CHƯA CÓ',
      'SME': s.sme || 'CHƯA CÓ',
      'Rủi ro': !s.sme && !s.backup ? 'SPOF NGUY HIỂM (Không SME & Backup)' : !s.sme ? 'Thiếu SME' : 'Thiếu Backup'
    }));
  const ws3 = XLSX.utils.json_to_sheet(riskData);
  XLSX.utils.book_append_sheet(wb, ws3, 'Coverage Risk');

  // Sheet 4: Projects & Gap Analysis
  const projectsData = projects.map((p, idx) => ({
    'No.': idx + 1,
    'Code': p.code,
    'Name': p.name,
    'Client': p.client,
    'Status': p.status,
    'Lead': p.lead || 'Chưa gán',
    'Assigned Members': (p.assignedMembers || []).join(', '),
    'Start Date': p.startDate,
    'Target Date': p.targetDate,
    'Description': p.description
  }));
  const ws4 = XLSX.utils.json_to_sheet(projectsData);
  ws4['!cols'] = [
    { wch: 6 },
    { wch: 18 },
    { wch: 45 },
    { wch: 35 },
    { wch: 15 },
    { wch: 18 },
    { wch: 35 },
    { wch: 12 },
    { wch: 12 },
    { wch: 60 }
  ];
  XLSX.utils.book_append_sheet(wb, ws4, 'Projects');

  XLSX.writeFile(wb, filename);
}

/**
 * Triggers PDF generation via browser print styles
 */
export function printPDFReport() {
  window.print();
}
