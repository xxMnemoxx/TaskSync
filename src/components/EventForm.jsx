import { useState } from 'react';
import { addEvent } from '../data/storage';
import { CAN_EDIT_ANY } from '../data/roles';

function EventForm({ date, team, currentUser, onClose, onSaved }) {
  const [title, setTitle] = useState('');
  const [project, setProject] = useState('');
  const [assignee, setAssignee] = useState(currentUser.id);
  const [status, setStatus] = useState('To Do');
  const [error, setError] = useState('');

  async function handleSave(e) {
    e.preventDefault();
    if (!title.trim()) return;

    const myRole = team.members.find((m) => m.userId === currentUser.id)?.role;
    if (!CAN_EDIT_ANY.includes(myRole) && assignee !== currentUser.id) {
      setError('Only Admins and Project Managers can assign events to other people.');
      return;
    }

    try {
      await addEvent({
        team_id: team.id,
        title: title.trim(),
        date,
        project: project.trim() || 'General',
        assignee,
        status,
        is_personal: false,
        user_id: currentUser.id,
      });
      onSaved();
    } catch (err) {
      setError(err.message || 'Failed to save event.');
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-xl font-bold text-gray-900 mb-4">New Event — {date}</h3>
        {error && <p className="mb-3 text-xs text-red-500">{error}</p>}
        <form onSubmit={handleSave} className="space-y-4">
          <input className="w-full rounded-lg border border-gray-300 p-2.5 text-sm" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          <input className="w-full rounded-lg border border-gray-300 p-2.5 text-sm" placeholder="Project" value={project} onChange={(e) => setProject(e.target.value)} />
          <select className="w-full rounded-lg border border-gray-300 p-2.5 text-sm" value={assignee} onChange={(e) => setAssignee(e.target.value)}>
            {team.members.map((m) => <option key={m.userId} value={m.userId}>{m.name}</option>)}
          </select>
          <select className="w-full rounded-lg border border-gray-300 p-2.5 text-sm" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option>To Do</option><option>In Progress</option><option>Done</option>
          </select>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="rounded-lg border px-4 py-2 text-sm">Cancel</button>
            <button type="submit" className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EventForm;