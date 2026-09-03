// --- Events / To-Dos ---

// Fetch team events
export async function fetchTeamEvents(teamId) {
  if (!teamId) return [];

  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('team_id', teamId)
    .eq('is_personal', false);

  if (error) throw error;

  return data || [];
}


// Fetch the current user's personal to-dos
// Works whether the user has a team or not.
export async function fetchMyTodos(userId, teamId = null) {
  let query = supabase
    .from('events')
    .select('*')
    .eq('assignee', userId)
    .eq('is_personal', true);

  // If a team is provided, get personal todos for that team.
  // Otherwise, get personal todos with no team.
  if (teamId) {
    query = query.eq('team_id', teamId);
  } else {
    query = query.is('team_id', null);
  }

  const { data, error } = await query;

  if (error) throw error;

  return data || [];
}


// Add an event or personal to-do
export async function addEvent(event) {
  const { data, error } = await supabase
    .from('events')
    .insert(event)
    .select()
    .single();

  if (error) throw error;

  return data;
}


// Update event status
export async function updateEventStatus(id, status) {
  const { error } = await supabase
    .from('events')
    .update({ status })
    .eq('id', id);

  if (error) throw error;
}