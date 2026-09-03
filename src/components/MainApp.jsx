import { useState } from 'react';
import { supabase } from '../data/supabaseClient';
import CalendarView from './CalendarView';
import TodoView from './TodoView';
import TeamMembers from './TeamMembers';
import RoleBadge from './RoleBadge';

function MainApp({ currentUser, team: initialTeam, onSignOut }) {
  const [view, setView] = useState('calendar'); // 'calendar' | 'todos' | 'team'
  const [team, setTeam] = useState(initialTeam);
  const myRole = team.members.find((m) => m.userId === currentUser.id)?.role;

  async function handleSignOut() {
    await supabase.auth.signOut();
    onSignOut();
  }

  return (
    <div className="main-app">
      <header>
        <h2>{team.name}</h2>
        <RoleBadge role={myRole} />
        <nav>
          <button onClick={() => setView('calendar')} className={view === 'calendar' ? 'active' : ''}>Calendar</button>
          <button onClick={() => setView('todos')} className={view === 'todos' ? 'active' : ''}>My To-Dos</button>
          <button onClick={() => setView('team')} className={view === 'team' ? 'active' : ''}>Team</button>
        </nav>
        <button onClick={handleSignOut}>Sign Out</button>
      </header>

      {view === 'calendar' && <CalendarView currentUser={currentUser} team={team} myRole={myRole} />}
      {view === 'todos' && <TodoView currentUser={currentUser} team={team} />}
      {view === 'team' && <TeamMembers currentUser={currentUser} team={team} onTeamUpdate={setTeam} />}
    </div>
  );
}

export default MainApp;