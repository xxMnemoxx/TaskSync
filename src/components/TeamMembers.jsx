import { useState } from 'react';
import { updateMemberRole } from '../data/storage';
import { ROLES, CAN_MANAGE_TEAM } from '../data/roles';
import RoleBadge from './RoleBadge';

function TeamMembers({ currentUser, team, onTeamUpdate }) {
  const [members, setMembers] = useState(team.members);
  const myRole = members.find((m) => m.userId === currentUser.id)?.role;
  const canManage = CAN_MANAGE_TEAM.includes(myRole);

  async function changeRole(userId, newRole) {
    await updateMemberRole(team.id, userId, newRole);
    const updated = members.map((m) => (m.userId === userId ? { ...m, role: newRole } : m));
    setMembers(updated);
    onTeamUpdate({ ...team, members: updated });
  }

  return (
    <div className="team-members">
      <h3>Team Members</h3>
      <ul>
        {members.map((m) => (
          <li key={m.userId} className="member-row">
            <span className="member-name">{m.name}</span>
            {canManage && m.userId !== currentUser.id ? (
              <select value={m.role} onChange={(e) => changeRole(m.userId, e.target.value)}>
                {Object.keys(ROLES).map((r) => <option key={r} value={r}>{ROLES[r].label}</option>)}
              </select>
            ) : (
              <RoleBadge role={m.role} />
            )}
          </li>
        ))}
      </ul>
      {!canManage && <p className="hint">Only Admins can change team member roles.</p>}
    </div>
  );
}

export default TeamMembers;