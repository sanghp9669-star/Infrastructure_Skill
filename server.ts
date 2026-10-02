import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as XLSX from 'xlsx';

const execAsync = promisify(exec);

const app = express();
const isProd = process.env.NODE_ENV === 'production';
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));

const DATA_DIR = path.resolve(process.cwd(), 'data');
const STATE_FILE = path.resolve(DATA_DIR, 'sync_state.json');
const SKILLS_FILE = path.resolve(DATA_DIR, 'skills_current.json');
const EXCEL_OUTPUT_FILE = path.resolve(DATA_DIR, 'Infrastructure_Skill_Matrix_Updated.xlsx');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function getSyncState() {
  if (fs.existsSync(STATE_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8'));
    } catch {
      // fallback
    }
  }
  return {
    url: 'https://viendatvidaco-my.sharepoint.com/:x:/g/personal/sanghp_viendat_com/IQB36SrdN_ydQreldzHIPv0_AZRCQAFKmucHJgqTLElvuoI?download=1',
    webhookUrl: '',
    autoPushOnEdit: true,
    lastChecksum: '',
    lastCheckTime: '',
    lastSyncTime: '',
    lastPushTime: '',
    lastPushStatus: '',
    status: 'idle',
    intervalMinutes: 5,
    enabled: true,
    history: []
  };
}

function saveSyncState(state: any) {
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), 'utf-8');
}

// Reusable instant push to SharePoint / Power Automate / Excel generator
async function executePushToSharePoint(skills: any[], customWebhook?: string) {
  const excelBuffer = generateExcelBuffer(skills);
  fs.writeFileSync(EXCEL_OUTPUT_FILE, excelBuffer);

  const state = getSyncState();
  const targetWebhook = customWebhook || state.webhookUrl;
  let webhookResponseStatus = 'local_ready';
  let webhookMessage = 'Đã cập nhật file Excel ma trận kỹ năng trên máy chủ.';

  if (targetWebhook && targetWebhook.startsWith('http')) {
    try {
      const resp = await fetch(targetWebhook, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'X-Filename': 'Infrastructure_Skill_Matrix_Updated.xlsx',
          'X-Updated-At': new Date().toISOString()
        },
        body: excelBuffer
      });

      if (resp.ok) {
        webhookResponseStatus = 'webhook_success';
        webhookMessage = 'Đã tự động cập nhật ngay lập tức xuống File Excel SharePoint!';
      } else {
        webhookResponseStatus = 'webhook_warning';
        webhookMessage = `Đã tạo file Excel, nhưng Webhook phản hồi HTTP ${resp.status}.`;
      }
    } catch (we: any) {
      webhookResponseStatus = 'webhook_error';
      webhookMessage = `Lỗi kết nối Webhook: ${we.message}`;
    }
  }

  state.lastPushTime = new Date().toISOString();
  state.lastPushStatus = webhookResponseStatus;
  if (targetWebhook) {
    state.webhookUrl = targetWebhook;
  }
  state.history = [
    {
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      status: webhookResponseStatus === 'webhook_error' ? 'error' : 'updated',
      message: `[Cập nhật ➔ SharePoint] ${webhookMessage} (${skills.length} kỹ năng)`
    },
    ...(state.history || []).slice(0, 49)
  ];
  saveSyncState(state);

  return {
    success: true,
    timestamp: state.lastPushTime,
    status: webhookResponseStatus,
    message: webhookMessage,
    state
  };
}

// 1. GET /api/matrix
app.get('/api/matrix', (req: Request, res: Response) => {
  const state = getSyncState();
  let skills = [];
  if (fs.existsSync(SKILLS_FILE)) {
    try {
      skills = JSON.parse(fs.readFileSync(SKILLS_FILE, 'utf-8'));
    } catch {
      // ignore
    }
  }
  const memberSet = new Set<string>();
  skills.forEach((s: any) => {
    if (s.ratings) {
      Object.keys(s.ratings).forEach(m => {
        if (m && m !== 'Thi') memberSet.add(m);
      });
    }
  });
  res.json({
    success: true,
    skills,
    members: Array.from(memberSet),
    state
  });
});

function generateExcelBuffer(skills: any[]) {
  const wb = XLSX.utils.book_new();
  
  // Dynamically extract all unique member names from skills ratings
  const memberSet = new Set<string>();
  skills.forEach(s => {
    if (s.ratings) {
      Object.keys(s.ratings).forEach(m => {
        if (m && m !== 'Thi') memberSet.add(m);
      });
    }
  });
  let members = Array.from(memberSet);
  if (members.length === 0) {
    members = ['Toàn', 'Long', 'Tuấn', 'Duy', 'Sang', 'Bảo', 'Thông', 'Khánh', 'NV.A'];
  }

  // Sheet 1: Team Skill Matrix
  const matrixData = skills.map((s, idx) => {
    const rowObj: Record<string, any> = {
      'No.': idx + 1,
      'Domain': s.domain,
      'Skill': s.skill,
    };
    members.forEach(m => {
      rowObj[m] = s.ratings?.[m] || 'L0';
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

  return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
}

// 2. POST /api/matrix (save inline updates from client, auto-push to SharePoint immediately, and generate Excel file)
app.post('/api/matrix', async (req: Request, res: Response) => {
  const { skills } = req.body;
  if (!Array.isArray(skills)) {
    return res.status(400).json({ success: false, error: 'Invalid skills payload' });
  }

  try {
    fs.writeFileSync(SKILLS_FILE, JSON.stringify(skills, null, 2), 'utf-8');
    
    // Only trigger auto-push to SharePoint if explicitly enabled by user (default is manual)
    const state = getSyncState();
    let pushResult: any = null;

    if (state.autoPushOnEdit === true) {
      try {
        pushResult = await executePushToSharePoint(skills);
      } catch (pe: any) {
        console.error('Error auto-pushing to SharePoint:', pe.message);
      }
    } else {
      try {
        const excelBuffer = generateExcelBuffer(skills);
        fs.writeFileSync(EXCEL_OUTPUT_FILE, excelBuffer);
      } catch (e: any) {
        console.error('Error generating Excel file on disk:', e.message);
      }
    }

    const updatedState = getSyncState();
    updatedState.lastSaveTime = new Date().toISOString();
    saveSyncState(updatedState);

    res.json({ 
      success: true, 
      count: skills.length,
      autoPushed: Boolean(pushResult?.status === 'webhook_success'),
      pushStatus: pushResult?.status || 'saved_locally',
      pushMessage: pushResult?.message || 'Đã lưu và cập nhật file Excel ma trận kỹ năng.',
      state: updatedState
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2b. GET /api/download-excel (Download real Excel .xlsx file with all newly added skills)
app.get('/api/download-excel', (req: Request, res: Response) => {
  try {
    let skills = [];
    if (fs.existsSync(SKILLS_FILE)) {
      skills = JSON.parse(fs.readFileSync(SKILLS_FILE, 'utf-8'));
    }
    const buffer = generateExcelBuffer(skills);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="Infrastructure_Skill_Matrix_15Domains_Updated.xlsx"');
    res.send(buffer);
  } catch (err: any) {
    res.status(500).send('Error generating Excel file: ' + err.message);
  }
});

// 3. GET /api/sync-status
app.get('/api/sync-status', (req: Request, res: Response) => {
  const state = getSyncState();
  res.json({
    success: true,
    state
  });
});

// 4. POST /api/sync (trigger manual or forced sync from SharePoint)
app.post('/api/sync', async (req: Request, res: Response) => {
  const { force, url } = req.body || {};
  try {
    const cmd = `python3 scripts/sync_sharepoint.py ${force ? '--force' : ''} ${url ? `"${url}"` : ''}`;
    const { stdout, stderr } = await execAsync(cmd);
    
    if (stderr && !stdout) {
      return res.status(500).json({ success: false, error: stderr });
    }

    const result = JSON.parse(stdout.trim());
    let currentSkills = [];
    if (fs.existsSync(SKILLS_FILE)) {
      try {
        currentSkills = JSON.parse(fs.readFileSync(SKILLS_FILE, 'utf-8'));
      } catch {}
    }

    res.json({
      ...result,
      skills: currentSkills
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4b. POST /api/manual-sync (instant manual check and sync from SharePoint or uploaded file)
app.post('/api/manual-sync', async (req: Request, res: Response) => {
  const { force = true, url, fileBase64 } = req.body || {};
  try {
    let localFilePath = '';
    if (fileBase64) {
      const cleanBase64 = fileBase64.replace(/^data:.*?;base64,/, '');
      const buffer = Buffer.from(cleanBase64, 'base64');
      localFilePath = path.resolve(DATA_DIR, 'manual_uploaded.xlsx');
      fs.writeFileSync(localFilePath, buffer);
    }

    const cmd = `python3 scripts/sync_sharepoint.py ${force ? '--force' : ''} ${localFilePath ? `--file "${localFilePath}"` : ''} ${url && !localFilePath ? `"${url}"` : ''}`;
    const { stdout, stderr } = await execAsync(cmd);

    if (stderr && !stdout) {
      return res.status(500).json({ success: false, error: stderr });
    }

    const result = JSON.parse(stdout.trim());
    let currentSkills = [];
    if (fs.existsSync(SKILLS_FILE)) {
      try {
        currentSkills = JSON.parse(fs.readFileSync(SKILLS_FILE, 'utf-8'));
      } catch {}
    }

    // Refresh updated Excel file on disk
    try {
      const excelBuffer = generateExcelBuffer(currentSkills);
      fs.writeFileSync(EXCEL_OUTPUT_FILE, excelBuffer);
    } catch {}

    const state = getSyncState();
    res.json({
      ...result,
      skills: currentSkills,
      state
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4c. POST /api/push-sharepoint (Push Web Data back to SharePoint Excel via Webhook / Flow / Direct Export)
app.post('/api/push-sharepoint', async (req: Request, res: Response) => {
  const { webhookUrl, skills: payloadSkills } = req.body || {};
  try {
    let skills = payloadSkills;
    if (!skills || !Array.isArray(skills)) {
      if (fs.existsSync(SKILLS_FILE)) {
        skills = JSON.parse(fs.readFileSync(SKILLS_FILE, 'utf-8'));
      } else {
        skills = [];
      }
    }

    const result = await executePushToSharePoint(skills, webhookUrl);
    res.json({
      ...result,
      itemCount: skills.length,
      downloadUrl: '/api/download-excel'
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 5. POST /api/sync-config (update interval, SharePoint URL, webhookUrl, autoPushOnEdit)
app.post('/api/sync-config', (req: Request, res: Response) => {
  const { intervalMinutes, enabled, url, webhookUrl, autoPushOnEdit } = req.body;
  const state = getSyncState();

  if (typeof intervalMinutes === 'number' && intervalMinutes >= 1) {
    state.intervalMinutes = intervalMinutes;
  }
  if (typeof enabled === 'boolean') {
    state.enabled = enabled;
  }
  if (typeof url === 'string' && url.trim()) {
    state.url = url.trim();
  }
  if (typeof webhookUrl === 'string') {
    state.webhookUrl = webhookUrl.trim();
  }
  if (typeof autoPushOnEdit === 'boolean') {
    state.autoPushOnEdit = autoPushOnEdit;
  }

  saveSyncState(state);
  setupBackgroundSyncTimer();

  res.json({ success: true, state });
});

// Background periodic sync worker
let syncTimer: NodeJS.Timeout | null = null;

function setupBackgroundSyncTimer() {
  if (syncTimer) {
    clearInterval(syncTimer);
    syncTimer = null;
  }

  const state = getSyncState();
  if (!state.enabled) {
    console.log('[Auto-Sync] Background sync is currently disabled.');
    return;
  }

  const intervalMs = Math.max(1, state.intervalMinutes || 5) * 60 * 1000;
  console.log(`[Auto-Sync] Background worker scheduled: checking every ${state.intervalMinutes || 5} minute(s).`);

  syncTimer = setInterval(async () => {
    try {
      console.log('[Auto-Sync] Running periodic check for Excel file changes on SharePoint...');
      const { stdout } = await execAsync('python3 scripts/sync_sharepoint.py');
      const result = JSON.parse(stdout.trim());
      if (result.changed) {
        console.log(`[Auto-Sync] Changes detected! Synced ${result.itemCount} skills at ${result.lastSyncTime}.`);
      } else {
        console.log(`[Auto-Sync] Check completed at ${result.lastCheckTime}. No changes detected.`);
      }
    } catch (e: any) {
      console.error('[Auto-Sync] Error during periodic sync:', e.message);
    }
  }, intervalMs);
}

// Start Vite middleware in dev or static files in prod
async function startServer() {
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(process.cwd(), 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(process.cwd(), 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
    // Start background sync timer
    setupBackgroundSyncTimer();
  });
}

startServer();
