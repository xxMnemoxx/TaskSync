import { useState } from 'react';
import { addEvent } from '../data/storage';
import { CAN_EDIT_ANY } from '../data/roles';

function EventForm({ date, team, currentUser, onClose, onSaved }) {
  const [title, setTitle] = useState('');
  const [project, setProject] = useState('');
  const [assignee, setAssignee] = useState(currentUser.id);
  const [status, setStatus] = useState('To Do');
  const [error, setError] = useState('');

  async function handleSave() {
    if (!title.trim()) return;
    const myRole = team.members.find((m) => m.userId === currentUser.id)?.role;
    if (!CAN_EDIT_ANY.includes(myRole) && assignee !== currentUser.id) {
      setError('Only Admins and Project Managers can assign events to other people.');
      return;
    }
    await addEvent({
      team_id: team.id,
      title: title.trim(),
      date,
      project: project.trim() || 'General',
      assignee,
      status,
      is_personal: false,
      created_by: currentUser.id,
    });
    onSaved();
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>New Event — {date}</h3>
        <input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <input placeholder="Project" value={project} onChange={(e) => setProject(e.target.value)} />
        <select value={assignee} onChange={(e) => setAssignee(e.target.value)}>
          {team.members.map((m) => <option key={m.userId} value={m.userId}>{m.name}</option>)}
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option>To Do</option><option>In Progress</option><option>Done</option>
        </select>
        {error && <p className="error">{error}</p>}
        <div className="modal-actions">
          <button onClick={onClose}>Cancel</button>
          <button onClick={handleSave}>Save</button>
        </div>
      </div>
    </div>
  );
}

export default EventForm;