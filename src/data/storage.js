import { supabase } from './supabaseClient';
import { getUserName } from './userHelpers';

function generateCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

// =====================================================
// TEAMS
// =====================================================

export async function createTeam(name, currentUser) {
  // 1. Insert into 'teams' using 'code'
  const { data: team, error } = await supabase
    .from('teams')
    .insert({
      name,
      code: generateCode(),
    })
    .select()
    .single();

  if (error) throw error;

  // 2. Insert creator into 'team_members' matching your schema fields
  const member = {
    team_id: team.id,
    user_id: currentUser.id,
    name: getUserName(currentUser),
    role: 'admin',
  };

  const { error: memberError } = await supabase
    .from('team_members')
    .insert(member);

  if (memberError) throw memberError;

  return {
    ...team,
    members: [
      {
        userId: currentUser.id,
        name: member.name,
        role: 'admin',
      },
    ],
  };
}

export async function joinTeamByCode(code, currentUser) {
  const formattedCode = code.trim().toUpperCase();

  // 1. Find team by 'code'
  const { data: team, error } = await supabase
    .from('teams')
    .select('*')
    .eq('code', formattedCode)
    .single();

  if (error || !team) {
    throw new Error('No team found with that code.');
  }

  // 2. Check if already a member
  const { data: existing } = await supabase
    .from('team_members')
    .select('*')
    .eq('team_id', team.id)
    .eq('user_id', currentUser.id)
    .maybeSingle();

  if (!existing) {
    const { error: insertError } = await supabase
      .from('team_members')
      .insert({
        team_id: team.id,
        user_id: currentUser.id,
        name: getUserName(currentUser),
        role: 'member',
      });

    if (insertError) throw insertError;
  }

  // 3. Fetch members directly from 'team_members'
  const { data: members, error: membersError } = await supabase
    .from('team_members')
    .select('*')
    .eq('team_id', team.id);

  if (membersError) throw membersError;

  return {
    ...team,
    members: members.map((m) => ({
      userId: m.user_id,
      name: m.name,
      role: m.role,
    })),
  };
}

export async function updateMemberRole(teamId, userId, role) {
  const { error } = await supabase
    .from('team_members')
    .update({ role })
    .eq('team_id', teamId)
    .eq('user_id', userId);

  if (error) throw error;
}

export async function fetchTeamMembers(userId) {
  if (!userId) return [];

  // Find user's team membership first
  const { data: userTeams, error: userTeamError } = await supabase
    .from('team_members')
    .select('team_id')
    .eq('user_id', userId);

  if (userTeamError || !userTeams || userTeams.length === 0) {
    return [];
  }

  const teamIds = userTeams.map((t) => t.team_id);

  // Fetch all members associated with those teams
  const { data, error } = await supabase
    .from('team_members')
    .select('id, name, role, user_id, team_id')
    .in('team_id', teamIds);

  if (error) throw error;

  return data || [];
}

// =====================================================
// EVENTS / TO-DOS
// =====================================================

export async function fetchTeamEvents(teamId) {
  if (!teamId) return [];

  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('team_id', teamId)
    .eq('is_personal', false)
    .order('date', { ascending: true });

  if (error) throw error;

  return data || [];
}

export async function fetchMyTodos(userId, teamId = null) {
  if (!userId) return [];

  let query = supabase
    .from('events')
    .select('*')
    .eq('assignee', userId)
    .eq('is_personal', true);

  if (teamId) {
    query = query.eq('team_id', teamId);
  } else {
    query = query.is('team_id', null);
  }

  const { data, error } = await query.order('date', { ascending: true });

  if (error) throw error;

  return data || [];
}

export async function addEvent(eventData) {
  const { data: { user } } = await supabase.auth.getUser();

  const payload = {
    ...eventData,
    created_by: eventData.created_by || user?.id,
  };

  const { data, error } = await supabase
    .from('events')
    .insert(payload)
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function updateEventStatus(id, status) {
  const { error } = await supabase
    .from('events')
    .update({ status })
    .eq('id', id);

  if (error) throw error;
}

export async function deleteEvent(id) {
  const { error } = await supabase
    .from('events')
    .delete()
    .eq('id', id);

  if (error) throw error;
}