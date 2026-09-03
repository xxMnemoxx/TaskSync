import { useState, useEffect } from 'react';
import { fetchTeamEvents } from '../data/storage';
import { CAN_EDIT_ANY } from '../data/roles';
import EventForm from './EventForm';

function getMonthDays(year, month) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const days = [];
  for (let d = 1; d <= lastDay.getDate(); d++) days.push(new Date(year, month, d));
  return { days, startWeekday: firstDay.getDay() };
}

function CalendarView({ currentUser, team, myRole }) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [events, setEvents] = useState([]);
  const [filterProject, setFilterProject] = useState('all');
  const [filterAssignee, setFilterAssignee] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => { refreshEvents(); }, [team.id]);

  async function refreshEvents() {
    const teamEvents = await fetchTeamEvents(team.id);
    setEvents(teamEvents);
  }

  const { days, startWeekday } = getMonthDays(year, month);

  const filtered = events.filter((e) => {
    if (filterProject !== 'all' && e.project !== filterProject) return false;
    if (filterAssignee !== 'all' && e.assignee !== filterAssignee) return false;
    if (filterStatus !== 'all' && e.status !== filterStatus) return false;
    return true;
  });

  const projects = [...new Set(events.map((e) => e.project))];

  function prevMonth() { if (month === 0) { setMonth(11); setYear(year - 1); } else setMonth(month - 1); }
  function nextMonth() { if (month === 11) { setMonth(0); setYear(year + 1); } else setMonth(month + 1); }

  function canEdit(event) {
    return CAN_EDIT_ANY.includes(myRole) || event.assignee === currentUser.id;
  }

  function openNewEvent(date) {
    if (myRole === 'viewer') return;
    setSelectedDate(date);
    setShowForm(true);
  }

  return (
    <div className="calendar-view">
      <div className="calendar-controls">
        <button onClick={prevMonth}>◀</button>
        <h3>{new Date(year, month).toLocaleString('default', { month: 'long', year: 'numeric' })}</h3>
        <button onClick={nextMonth}>▶</button>
      </div>

      <div className="filters">
        <select value={filterProject} onChange={(e) => setFilterProject(e.target.value)}>
          <option value="all">All Projects</option>
          {projects.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
        <select value={filterAssignee} onChange={(e) => setFilterAssignee(e.target.value)}>
          <option value="all">All Members</option>
          {team.members.map((m) => <option key={m.userId} value={m.userId}>{m.name}</option>)}
        </select>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="all">All Statuses</option>
          <option>To Do</option><option>In Progress</option><option>Done</option>
        </select>
      </div>

      <div className="grid">
        {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map((d) => <div key={d} className="grid-header">{d}</div>)}
        {Array(startWeekday).fill(null).map((_, i) => <div key={'empty'+i} className="cell empty" />)}
        {days.map((day) => {
          const dateStr = day.toISOString().slice(0, 10);
          const dayEvents = filtered.filter((e) => e.date === dateStr);
          return (
            <div key={dateStr} className="cell" onClick={() => openNewEvent(dateStr)}>
              <span className="day-number">{day.getDate()}</span>
              {dayEvents.map((e) => (
                <div key={e.id} className={`event-chip status-${e.status.replace(' ','-').toLowerCase()}`}>{e.title}</div>
              ))}
            </div>
          );
        })}
      </div>

      {showForm && (
        <EventForm
          date={selectedDate}
          team={team}
          currentUser={currentUser}
          onClose={() => setShowForm(false)}
          onSaved={() => { setShowForm(false); refreshEvents(); }}
        />
      )}
    </div>
  );
}

export default CalendarView;