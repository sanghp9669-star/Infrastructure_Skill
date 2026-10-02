import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Normalizes any Supabase URL format:
 * - https://supabase.com/dashboard/project/abcdef -> https://abcdef.supabase.co
 * - https://abcdef.supabase.co/rest/v1 -> https://abcdef.supabase.co
 * - https://abcdef.supabase.co/ -> https://abcdef.supabase.co
 * - abcdef.supabase.co -> https://abcdef.supabase.co
 * - abcdef -> https://abcdef.supabase.co
 */
export const normalizeSupabaseUrl = (raw: string): string => {
  if (!raw) return '';
  let str = raw.trim();

  // If user pasted dashboard browser URL: e.g. https://supabase.com/dashboard/project/xyz123...
  const dashboardMatch = str.match(/supabase\.com\/dashboard\/project\/([a-zA-Z0-9_-]+)/i);
  if (dashboardMatch && dashboardMatch[1]) {
    return `https://${dashboardMatch[1]}.supabase.co`;
  }

  // If user entered just the project ID: e.g. 'abcdefghijklmnopqrst'
  if (/^[a-zA-Z0-9_-]{12,32}$/.test(str)) {
    return `https://${str}.supabase.co`;
  }

  // Add https:// if missing
  if (!str.startsWith('http://') && !str.startsWith('https://')) {
    str = 'https://' + str;
  }

  try {
    const parsed = new URL(str);
    // Project URL must ONLY be protocol + host (NO sub-path like /rest/v1 or /dashboard)
    return `${parsed.protocol}//${parsed.host}`;
  } catch {
    const match = str.match(/https?:\/\/[a-zA-Z0-9_-]+\.supabase\.co/i);
    if (match) return match[0];
    return str.replace(/\/+$/, '');
  }
};

/**
 * Normalizes API Key (removes surrounding whitespace, quotes, or newlines)
 */
export const normalizeSupabaseKey = (raw: string): string => {
  if (!raw) return '';
  return raw.trim().replace(/^["']|["']$/g, '');
};

// Get credentials from environment or localStorage
export const getSupabaseConfig = () => {
  let url = import.meta.env.VITE_SUPABASE_URL || '';
  let key = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
  if (!url || !key) {
    try {
      url = localStorage.getItem('skill_matrix_supabase_url') || url;
      key = localStorage.getItem('skill_matrix_supabase_anon_key') || key;
    } catch {}
  }
  return { 
    url: normalizeSupabaseUrl(url), 
    key: normalizeSupabaseKey(key) 
  };
};

export const setSupabaseConfig = (url: string, key: string) => {
  const cleanUrl = normalizeSupabaseUrl(url);
  const cleanKey = normalizeSupabaseKey(key);
  try {
    localStorage.setItem('skill_matrix_supabase_url', cleanUrl);
    localStorage.setItem('skill_matrix_supabase_anon_key', cleanKey);
  } catch {}
  supabaseInstance = null; // reset singleton
  return { url: cleanUrl, key: cleanKey };
};

// Check if Supabase credentials are valid
export const isSupabaseConfigured = (): boolean => {
  const { url, key } = getSupabaseConfig();
  return Boolean(url && key && url.startsWith('https://') && url.includes('.supabase.co'));
};

// Singleton instance
let supabaseInstance: SupabaseClient | null = null;

export const getSupabaseClient = (): SupabaseClient | null => {
  const { url, key } = getSupabaseConfig();
  if (!url || !key || !url.startsWith('https://')) {
    return null;
  }
  if (!supabaseInstance) {
    supabaseInstance = createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true
      }
    });
  }
  return supabaseInstance;
};

/**
 * SQL Schema script to run in Supabase SQL Editor to initialize the database tables
 */
export const SUPABASE_SQL_SCHEMA = `-- ====================================================================
-- SUPABASE POSTGRESQL SCHEMA FOR VIENDAT INFRASTRUCTURE SKILL MATRIX
-- ====================================================================

-- 1. Bảng lưu trữ 118 kỹ năng hạ tầng
CREATE TABLE IF NOT EXISTS public.skills (
  id BIGINT PRIMARY KEY,
  domain VARCHAR(200) NOT NULL,
  skill VARCHAR(200) NOT NULL,
  ratings JSONB DEFAULT '{}'::jsonb,
  owner VARCHAR(100) DEFAULT '',
  backup VARCHAR(100) DEFAULT '',
  sme VARCHAR(100) DEFAULT '',
  evidence TEXT DEFAULT '',
  member_evidence JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Bảng thông tin đội ngũ kỹ sư
CREATE TABLE IF NOT EXISTS public.team_members (
  id VARCHAR(100) PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  email VARCHAR(150),
  role_title VARCHAR(150) DEFAULT 'Infrastructure Engineer',
  avatar_color VARCHAR(100) DEFAULT 'from-slate-600 to-slate-800',
  primary_domains JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Bảng nhật ký thay đổi (Audit Trail)
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id VARCHAR(128) PRIMARY KEY,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  member_name VARCHAR(100),
  skill_id BIGINT,
  skill_name VARCHAR(200),
  domain VARCHAR(200),
  old_value VARCHAR(100),
  new_value VARCHAR(100),
  change_type VARCHAR(50),
  performed_by VARCHAR(100),
  notes TEXT DEFAULT ''
);

-- 4. Bật phân quyền Row Level Security (RLS)
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Dọn dẹp chính sách cũ nếu có
DROP POLICY IF EXISTS "Allow read skills to all" ON public.skills;
DROP POLICY IF EXISTS "Allow insert/update skills" ON public.skills;
DROP POLICY IF EXISTS "Cho phép đọc dữ liệu kỹ năng" ON public.skills;
DROP POLICY IF EXISTS "Cho phép ghi/sửa kỹ năng" ON public.skills;
DROP POLICY IF EXISTS "Cho phép thêm và cập nhật kỹ năng" ON public.skills;
DROP POLICY IF EXISTS "Allow read team_members to all" ON public.team_members;
DROP POLICY IF EXISTS "Allow insert/update team_members" ON public.team_members;
DROP POLICY IF EXISTS "Cho phép đọc danh sách kỹ sư" ON public.team_members;
DROP POLICY IF EXISTS "Cho phép ghi/sửa danh sách kỹ sư" ON public.team_members;
DROP POLICY IF EXISTS "Allow read audit_logs to all" ON public.audit_logs;
DROP POLICY IF EXISTS "Allow insert audit_logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Cho phép đọc audit log" ON public.audit_logs;
DROP POLICY IF EXISTS "Cho phép ghi audit log" ON public.audit_logs;

-- Tạo chính sách cho phép ĐỌC, THÊM và CẬP NHẬT (UPSERT)
CREATE POLICY "Cho phép đọc dữ liệu kỹ năng" 
  ON public.skills FOR SELECT 
  USING (true);

CREATE POLICY "Cho phép thêm và cập nhật kỹ năng" 
  ON public.skills FOR ALL 
  USING (true) 
  WITH CHECK (true);

CREATE POLICY "Cho phép đọc danh sách kỹ sư" 
  ON public.team_members FOR SELECT 
  USING (true);

CREATE POLICY "Cho phép ghi danh sách kỹ sư" 
  ON public.team_members FOR ALL 
  USING (true) 
  WITH CHECK (true);

CREATE POLICY "Cho phép đọc audit log" 
  ON public.audit_logs FOR SELECT 
  USING (true);

CREATE POLICY "Cho phép ghi audit log" 
  ON public.audit_logs FOR ALL 
  USING (true) 
  WITH CHECK (true);

-- 5. Kích hoạt tính năng Realtime cho bảng skills
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'skills'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.skills;
  END IF;
END $$;
`;
