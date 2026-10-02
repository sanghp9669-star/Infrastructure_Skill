import { getSupabaseClient, isSupabaseConfigured } from '../lib/supabase';
import { SkillItem, TeamMember, AuditLogEntry } from '../types/skills';

export { isSupabaseConfigured };

/**
 * Fetch all skills from Supabase
 */
export async function fetchSkillsFromSupabase(): Promise<{ data: SkillItem[] | null; error?: string }> {
  const client = getSupabaseClient();
  if (!client) return { data: null, error: 'Chưa cấu hình Supabase URL hoặc API Key' };

  try {
    const { data, error } = await client
      .from('skills')
      .select('*')
      .order('id', { ascending: true });

    if (error) {
      console.warn('[Supabase] Error fetching skills:', error.message);
      return { data: null, error: error.message };
    }

    if (data && Array.isArray(data)) {
      const parsed = data.map(item => ({
        id: Number(item.id),
        domain: item.domain || 'General',
        skill: item.skill || '',
        ratings: item.ratings || {},
        owner: item.owner || '',
        backup: item.backup || '',
        sme: item.sme || '',
        evidence: item.evidence || '',
        memberEvidence: item.member_evidence || {}
      }));
      return { data: parsed };
    }
    return { data: [] };
  } catch (err: any) {
    console.warn('[Supabase] Exception fetching skills:', err);
    return { data: null, error: err?.message || String(err) };
  }
}

/**
 * Sync single skill to Supabase
 */
export async function syncSkillToSupabase(skill: SkillItem): Promise<{ success: boolean; error?: string }> {
  const client = getSupabaseClient();
  if (!client) return { success: false, error: 'Chưa cấu hình Supabase' };

  try {
    const { error } = await client
      .from('skills')
      .upsert({
        id: skill.id,
        domain: skill.domain,
        skill: skill.skill,
        ratings: skill.ratings || {},
        owner: skill.owner || '',
        backup: skill.backup || '',
        sme: skill.sme || '',
        evidence: skill.evidence || '',
        member_evidence: skill.memberEvidence || {},
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' });

    if (error) {
      console.warn(`[Supabase] Error syncing skill ${skill.id}:`, error.message);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    console.warn(`[Supabase] Exception syncing skill ${skill.id}:`, err);
    return { success: false, error: err?.message || String(err) };
  }
}

/**
 * Delete a skill from Supabase
 */
export async function deleteSkillFromSupabase(skillId: number): Promise<{ success: boolean; error?: string }> {
  const client = getSupabaseClient();
  if (!client) return { success: false, error: 'Chưa cấu hình Supabase' };

  try {
    const { error } = await client
      .from('skills')
      .delete()
      .eq('id', skillId);

    if (error) {
      console.warn(`[Supabase] Error deleting skill ${skillId}:`, error.message);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    console.warn(`[Supabase] Exception deleting skill ${skillId}:`, err);
    return { success: false, error: err?.message || String(err) };
  }
}

/**
 * Sync all skills in batch to Supabase
 */
export async function syncAllSkillsToSupabase(skills: SkillItem[]): Promise<{ success: boolean; count: number; error?: string }> {
  const client = getSupabaseClient();
  if (!client) {
    return { 
      success: false, 
      count: 0, 
      error: 'Chưa cấu hình Supabase URL hoặc API Key. Vui lòng kiểm tra lại URL và Anon Key.' 
    };
  }

  try {
    const records = skills.map(skill => ({
      id: skill.id,
      domain: skill.domain,
      skill: skill.skill,
      ratings: skill.ratings || {},
      owner: skill.owner || '',
      backup: skill.backup || '',
      sme: skill.sme || '',
      evidence: skill.evidence || '',
      member_evidence: skill.memberEvidence || {},
      updated_at: new Date().toISOString()
    }));

    // Batch upsert up to 1000 items
    const { error } = await client
      .from('skills')
      .upsert(records, { onConflict: 'id' });

    if (error) {
      console.warn('[Supabase] Error batch syncing skills:', error);
      return { success: false, count: 0, error: error.message };
    }

    return { success: true, count: records.length };
  } catch (err: any) {
    console.warn('[Supabase] Exception in batch sync:', err);
    return { success: false, count: 0, error: err?.message || String(err) };
  }
}

/**
 * Sync audit log entry to Supabase
 */
export async function addAuditLogToSupabase(log: AuditLogEntry): Promise<{ success: boolean; error?: string }> {
  const client = getSupabaseClient();
  if (!client) return { success: false, error: 'Chưa cấu hình Supabase' };

  try {
    const { error } = await client
      .from('audit_logs')
      .insert({
        id: log.id,
        timestamp: log.timestamp,
        member_name: log.memberName,
        skill_id: log.skillId,
        skill_name: log.skillName,
        domain: log.domain,
        old_value: log.oldValue,
        new_value: log.newValue,
        change_type: log.changeType,
        performed_by: log.performedBy,
        notes: log.notes || ''
      });

    if (error) {
      console.warn('[Supabase] Error saving audit log:', error.message);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    console.warn('[Supabase] Exception saving audit log:', err);
    return { success: false, error: err?.message || String(err) };
  }
}

/**
 * Fetch all team members from Supabase
 */
export async function fetchMembersFromSupabase(): Promise<{ data: TeamMember[] | null; error?: string }> {
  const client = getSupabaseClient();
  if (!client) return { data: null, error: 'Chưa cấu hình Supabase URL hoặc API Key' };

  try {
    const { data, error } = await client
      .from('team_members')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.warn('[Supabase] Error fetching members:', error.message);
      return { data: null, error: error.message };
    }

    if (data && Array.isArray(data) && data.length > 0) {
      const parsed: TeamMember[] = data.map(item => ({
        id: item.id || item.name.toLowerCase().replace(/\s+/g, '-'),
        name: item.name,
        email: item.email || `${item.name.toLowerCase()}@viendat.com`,
        roleTitle: item.role_title || 'Infrastructure Engineer',
        avatarColor: item.avatar_color || 'from-slate-600 to-slate-800',
        primaryDomains: Array.isArray(item.primary_domains) ? item.primary_domains : [],
        phone: item.phone || ''
      }));
      return { data: parsed };
    }
    return { data: [] };
  } catch (err: any) {
    console.warn('[Supabase] Exception fetching members:', err);
    return { data: null, error: err?.message || String(err) };
  }
}

/**
 * Sync all team members in batch to Supabase
 */
export async function syncAllMembersToSupabase(members: TeamMember[]): Promise<{ success: boolean; count: number; error?: string }> {
  const client = getSupabaseClient();
  if (!client) {
    return { success: false, count: 0, error: 'Chưa cấu hình Supabase URL hoặc API Key' };
  }

  try {
    const records = members.map(m => ({
      id: m.id || m.name.toLowerCase().replace(/\s+/g, '-'),
      name: m.name,
      email: m.email || '',
      role_title: m.roleTitle || 'Infrastructure Engineer',
      avatar_color: m.avatarColor || 'from-slate-600 to-slate-800',
      primary_domains: m.primaryDomains || [],
      updated_at: new Date().toISOString()
    }));

    const { error } = await client
      .from('team_members')
      .upsert(records, { onConflict: 'id' });

    if (error) {
      console.warn('[Supabase] Error batch syncing members:', error);
      return { success: false, count: 0, error: error.message };
    }

    return { success: true, count: records.length };
  } catch (err: any) {
    console.warn('[Supabase] Exception in batch members sync:', err);
    return { success: false, count: 0, error: err?.message || String(err) };
  }
}

/**
 * Delete a specific member from Supabase team_members table
 */
export async function deleteMemberFromSupabase(memberName: string): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client || !memberName) return false;
  try {
    const { error } = await client
      .from('team_members')
      .delete()
      .or(`name.eq.${memberName},id.eq.${memberName.toLowerCase()}`);
    if (error) {
      console.warn(`[Supabase] Error deleting member ${memberName}:`, error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn(`[Supabase] Exception deleting member ${memberName}:`, err);
    return false;
  }
}

/**
 * Combined sync: pushes both skills and team_members to Supabase
 */
export async function syncAllDataToSupabase(skills: SkillItem[], members: TeamMember[]): Promise<{
  success: boolean;
  skillCount: number;
  memberCount: number;
  error?: string;
}> {
  const [skillResult, memberResult] = await Promise.all([
    syncAllSkillsToSupabase(skills),
    syncAllMembersToSupabase(members)
  ]);

  if (!skillResult.success && !memberResult.success) {
    return {
      success: false,
      skillCount: 0,
      memberCount: 0,
      error: skillResult.error || memberResult.error
    };
  }

  return {
    success: true,
    skillCount: skillResult.count,
    memberCount: memberResult.count,
    error: skillResult.error || memberResult.error
  };
}

/**
 * Real-time subscription to Supabase skills table changes
 */
export function subscribeToSupabaseSkills(onUpdate: (skills: SkillItem[]) => void) {
  const client = getSupabaseClient();
  if (!client) return () => {};

  try {
    const channel = client
      .channel('public:skills')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'skills' },
        async () => {
          const res = await fetchSkillsFromSupabase();
          if (res.data && res.data.length > 0) {
            onUpdate(res.data);
          }
        }
      )
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  } catch (err) {
    console.warn('[Supabase] Realtime subscription error:', err);
    return () => {};
  }
}
