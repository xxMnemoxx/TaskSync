export const ROLES = {
  admin:  { label: 'Admin',           color: '#1e293b' }, // navy
  pm:     { label: 'Project Manager', color: '#7c3aed' }, // purple
  member: { label: 'Member',          color: '#2563eb' }, // blue
  viewer: { label: 'Viewer',          color: '#64748b' }, // slate gray
};

export const CAN_EDIT_ANY = ['admin', 'pm'];       // can edit/assign any event
export const CAN_MANAGE_TEAM = ['admin'];           // can change member roles