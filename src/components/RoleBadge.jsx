import { ROLES } from '../data/roles';

function RoleBadge({ role }) {
  const info = ROLES[role] || { label: role, color: '#94a3b8' };
  return (
    <span 
      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold text-white shadow-sm"
      style={{ backgroundColor: info.color }}
    >
      {info.label}
    </span>
  );
}

export default RoleBadge;