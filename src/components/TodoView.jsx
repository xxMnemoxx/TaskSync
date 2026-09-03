import { useState, useEffect } from 'react';
import { fetchMyTodos, addEvent, updateEventStatus } from '../data/storage';

function TodoView({ currentUser, team }) {
  const [events, setEvents] = useState([]);
  const [title, setTitle] = useState('');
  const [project, setProject] = useState('');
  const [date, setDate] = useState('');

  useEffect(() => {
    async function load() {
      const mine = await fetchMyTodos(team.id, currentUser.id);
      setEvents(mine);
    }
    load();
  }, [team.id, currentUser.id]);

  async function addTodo() {
    if (!title.trim()) return;
    const newTodo = await addEvent({
      team_id: team.id,
      title: title.trim(),
      date: date || null,
      project: project.trim() || 'General',
      assignee: currentUser.id,
      status: 'To Do',
      is_personal: true,
      created_by: currentUser.id,
    });
    setEvents([...events, newTodo]);
    setTitle(''); setProject(''); setDate('');
  }

  async function updateStatus(id, status) {
    await updateEventStatus(id, status);
    setEvents(events.map((e) => (e.id === id ? { ...e, status } : e)));
  }

  return (
    <div className="todo-view">
      <div className="add-todo">
        <input placeholder="Task title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <input placeholder="Project" value={project} onChange={(e) => setProject(e.target.value)} />
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        <button onClick={addTodo}>Add</button>
      </div>

      <ul className="todo-list">
        {events.map((e) => (
          <li key={e.id} className={`status-${e.status.replace(' ', '-').toLowerCase()}`}>
            <span>{e.title}</span>
            <span className="tag">{e.project}</span>
            {e.date && <span className="date">{e.date}</span>}
            <select value={e.status} onChange={(ev) => updateStatus(e.id, ev.target.value)}>
              <option>To Do</option>
              <option>In Progress</option>
              <option>Done</option>
            </select>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default TodoView;