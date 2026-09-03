import { ROLES } from '../data/roles';

function RoleBadge({ role }) {
  const info = ROLES[role] || { label: role, color: '#94a3b8' };
  return (
    <span className="role-badge" style={{ backgroundColor: info.color }}>
      {info.label}
    </span>
  );
}

export default RoleBadge;