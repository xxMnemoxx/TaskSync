import { supabase } from './supabaseClient';
import { getUserName } from './userHelpers';

function generateCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

// --- Teams ---

export async function createTeam(name, currentUser) {
  const { data: team, error } = await supabase
    .from('teams')
    .insert({ name, code: generateCode() })
    .select()
    .single();
  if (error) throw error;

  const member = { team_id: team.id, user_id: currentUser.id, name: getUserName(currentUser), role: 'admin' };
  const { error: memberError } = await supabase.from('team_members').insert(member);
  if (memberError) throw memberError;

  return { ...team, members: [{ userId: currentUser.id, name: member.name, role: 'admin' }] };
}

export async function joinTeamByCode(code, currentUser) {
  const { data: team, error } = await supabase
    .from('teams')
    .select('*')
    .eq('code', code.trim().toUpperCase())
    .single();
  if (error || !team) throw new Error('No team found with that code.');

  const { data: existing } = await supabase
    .from('team_members')
    .select('*')
    .eq('team_id', team.id)
    .eq('user_id', currentUser.id)
    .maybeSingle();

  if (!existing) {
    await supabase.from('team_members').insert({
      team_id: team.id, user_id: currentUser.id, name: getUserName(currentUser), role: 'member',
    });
  }

  const { data: members } = await supabase.from('team_members').select('*').eq('team_id', team.id);
  return { ...team, members: members.map((m) => ({ userId: m.user_id, name: m.name, role: m.role })) };
}

export async function updateMemberRole(teamId, userId, role) {
  const { error } = await supabase
    .from('team_members')
    .update({ role })
    .eq('team_id', teamId)
    .eq('user_id', userId);
  if (error) throw error;
}

// --- Events / To-Dos ---

export async function fetchTeamEvents(teamId) {
  const { data, error } = await supabase
    .from('events').select('*').eq('team_id', teamId).eq('is_personal', false);
  if (error) throw error;
  return data;
}

export async function fetchMyTodos(teamId, userId) {
  const { data, error } = await supabase
    .from('events').select('*').eq('team_id', teamId).eq('assignee', userId).eq('is_personal', true);
  if (error) throw error;
  return data;
}

export async function addEvent(event) {
  const { data, error } = await supabase.from('events').insert(event).select();
  if (error) throw error;
  return data[0];
}

export async function updateEventStatus(id, status) {
  const { error } = await supabase.from('events').update({ status }).eq('id', id);
  if (error) throw error;
}