import * as XLSX from 'xlsx';
import { CompetencyLevel, Project, SkillItem, TeamMember } from '../types/skills';

export interface ParseResult {
  skills: SkillItem[];
  projects: Project[];
  detectedMembers: string[];
  sheetNames: string[];
  totalRows: number;
  errors: string[];
}

export async function parseUploadedExcel(file: File, existingMembers: TeamMember[]): Promise<ParseResult> {
  const errors: string[] = [];
  const parsedProjects: Project[] = [];

  try {
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data, { type: 'array' });
    const sheetNames = workbook.SheetNames;

    if (sheetNames.length === 0) {
      throw new Error('File Excel không có sheet nào.');
    }

    // 1. Try finding "Projects" / "Project" / "Dự Án" sheet
    const projectSheetName = sheetNames.find(n => /project|dự án|du an/i.test(n));
    if (projectSheetName && workbook.Sheets[projectSheetName]) {
      try {
        const projSheet = workbook.Sheets[projectSheetName];
        const rawProjRows = XLSX.utils.sheet_to_json<Record<string, any>>(projSheet, { defval: '' });

        rawProjRows.forEach((row, idx) => {
          const name = String(row['Name'] || row['Tên Dự Án'] || row['Tên dự án'] || row['Project Name'] || '').trim();
          if (!name) return;

          const code = String(row['Code'] || row['Mã Dự Án'] || row['Mã dự án'] || `PRJ-${idx + 1}`).trim();
          const client = String(row['Client'] || row['Khách Hàng'] || row['Khách hàng'] || 'Chưa cập nhật').trim();
          const status = String(row['Status'] || row['Trạng Thái'] || row['Trạng thái'] || 'In Progress').trim() as any;
          const lead = String(row['Lead'] || row['Trưởng Dự Án'] || row['Quản lý'] || '').trim();
          const desc = String(row['Description'] || row['Mô Tả'] || row['Mô tả'] || '').trim();
          const startDate = String(row['Start Date'] || row['Ngày Bắt Đầu'] || '2026-01-01').trim();
          const targetDate = String(row['Target Date'] || row['Ngày Hoàn Thành'] || '2026-12-31').trim();

          const membersStr = String(row['Assigned Members'] || row['Thành Viên'] || row['Kỹ Sư Tham Gia'] || '').trim();
          const assignedMembers = membersStr
            ? membersStr.split(/[,;\n]/).map(m => m.trim()).filter(Boolean)
            : lead ? [lead] : [];

          parsedProjects.push({
            id: `proj-import-${idx + 1}`,
            name,
            code,
            client,
            description: desc || `Dự án ${name} cho khách hàng ${client}`,
            status: status === 'Completed' || status === 'Planning' ? status : 'In Progress',
            lead,
            assignedMembers,
            startDate,
            targetDate,
            requiredSkills: []
          });
        });
      } catch (err: any) {
        errors.push(`Lỗi đọc sheet Projects: ${err.message}`);
      }
    }

    // 2. Try finding "Team Skill Matrix" or the first sheet for Skills
    const targetSheetName = sheetNames.find(n => n.toLowerCase().includes('skill matrix')) || sheetNames[0];
    const sheet = workbook.Sheets[targetSheetName];

    if (!sheet) {
      throw new Error(`Không tìm thấy sheet "${targetSheetName}".`);
    }

    // Convert sheet to json with header row
    const rawRows = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, { defval: '' });

    if (rawRows.length === 0) {
      throw new Error('Sheet không có dữ liệu dòng nào.');
    }

    // Detect column names from the first row keys
    const firstRow = rawRows[0];
    const keys = Object.keys(firstRow);

    const domainKey = keys.find(k => /domain|phân khúc|nhóm/i.test(k)) || keys[0];
    const skillKey = keys.find(k => /skill|kỹ năng|công nghệ|tên/i.test(k)) || keys[1];
    const ownerKey = keys.find(k => /owner|chủ quản/i.test(k));
    const backupKey = keys.find(k => /backup|dự phòng/i.test(k));
    const smeKey = keys.find(k => /sme|expert|chuyên gia/i.test(k));

    // Known metadata keys
    const metaKeys = new Set([domainKey, skillKey, ownerKey, backupKey, smeKey].filter(Boolean));

    // Other keys are candidate team members
    const candidateMembers = keys.filter(k => !metaKeys.has(k) && !/stt|no|id|notes|ghi chú/i.test(k));

    const finalMembers = candidateMembers.length > 0 ? candidateMembers : existingMembers.map(m => m.name);

    const parsedSkills: SkillItem[] = [];

    rawRows.forEach((row, index) => {
      const skillName = String(row[skillKey] || '').trim();
      const domainName = String(row[domainKey] || 'General').trim();

      if (!skillName) return; // Skip empty row

      const ratings: Record<string, CompetencyLevel> = {};

      finalMembers.forEach(mem => {
        let val = String(row[mem] || '').trim().toUpperCase();
        if (/^L[0-5]$/.test(val)) {
          ratings[mem] = val as CompetencyLevel;
        } else if (['0', '1', '2', '3', '4', '5'].includes(val)) {
          ratings[mem] = `L${val}` as CompetencyLevel;
        } else {
          ratings[mem] = 'L0';
        }
      });

      parsedSkills.push({
        id: index + 1,
        domain: domainName,
        skill: skillName,
        ratings,
        owner: ownerKey ? String(row[ownerKey] || '').trim() : '',
        backup: backupKey ? String(row[backupKey] || '').trim() : '',
        sme: smeKey ? String(row[smeKey] || '').trim() : ''
      });
    });

    return {
      skills: parsedSkills,
      projects: parsedProjects,
      detectedMembers: finalMembers,
      sheetNames,
      totalRows: parsedSkills.length,
      errors
    };
  } catch (err: any) {
    return {
      skills: [],
      projects: [],
      detectedMembers: [],
      sheetNames: [],
      totalRows: 0,
      errors: [err.message || 'Lỗi đọc file Excel']
    };
  }
}
