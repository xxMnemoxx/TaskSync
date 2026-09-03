import { useState } from 'react';
import { createTeam, joinTeamByCode } from '../data/storage';

function TeamSetup({ currentUser, onTeamReady }) {
  const [mode, setMode] = useState('create');
  const [teamName, setTeamName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [error, setError] = useState('');

  async function handleCreate() {
    if (!teamName.trim()) return;
    const team = await createTeam(teamName.trim(), currentUser);
    onTeamReady(team);
  }

  async function handleJoin() {
    setError('');
    try {
      const team = await joinTeamByCode(joinCode, currentUser);
      onTeamReady(team);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="team-setup">
      <div className="tabs">
        <button onClick={() => setMode('create')} className={mode === 'create' ? 'active' : ''}>Create Team</button>
        <button onClick={() => setMode('join')} className={mode === 'join' ? 'active' : ''}>Join Team</button>
      </div>

      {mode === 'create' ? (
        <div>
          <input placeholder="Team name" value={teamName} onChange={(e) => setTeamName(e.target.value)} />
          <button onClick={handleCreate}>Create</button>
        </div>
      ) : (
        <div>
          <input placeholder="Team code" value={joinCode} onChange={(e) => setJoinCode(e.target.value)} />
          <button onClick={handleJoin}>Join</button>
          {error && <p className="error">{error}</p>}
        </div>
      )}
    </div>
  );
}

export default TeamSetup;