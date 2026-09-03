import { useState, useEffect } from 'react';

import {
  fetchTeamEvents,
  fetchMyTodos,
} from '../data/storage';

import { CAN_EDIT_ANY } from '../data/roles';
import EventForm from './EventForm';

function getMonthDays(year, month) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  const days = [];

  for (let d = 1; d <= lastDay.getDate(); d++) {
    days.push(new Date(year, month, d));
  }

  return {
    days,
    startWeekday: firstDay.getDay(),
  };
}

function CalendarView({ currentUser, team = null, myRole = null }) {
  const today = new Date();

  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  const [events, setEvents] = useState([]);
  const [personalTodos, setPersonalTodos] = useState([]);

  const [filterProject, setFilterProject] = useState('all');
  const [filterAssignee, setFilterAssignee] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const [showForm, setShowForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);

  // Load calendar data
  useEffect(() => {
    refreshEvents();
  }, [team?.id, currentUser.id]);

  async function refreshEvents() {
    try {
      // Always load personal todos
      const todos = await fetchMyTodos(
        currentUser.id,
        team?.id || null
      );

      setPersonalTodos(todos);

      // Only load team events if user has a team
      if (team?.id) {
        const teamEvents = await fetchTeamEvents(team.id);
        setEvents(teamEvents);
      } else {
        setEvents([]);
      }
    } catch (error) {
      console.error('Error loading calendar:', error);
    }
  }

  const { days, startWeekday } = getMonthDays(year, month);

  // Combine team events and personal todos
  const allEvents = [
    ...events,
    ...personalTodos,
  ];

  const filtered = allEvents.filter((event) => {
    if (
      filterProject !== 'all' &&
      event.project !== filterProject
    ) {
      return false;
    }

    if (
      filterAssignee !== 'all' &&
      event.assignee !== filterAssignee
    ) {
      return false;
    }

    if (
      filterStatus !== 'all' &&
      event.status !== filterStatus
    ) {
      return false;
    }

    return true;
  });

  const projects = [
    ...new Set(
      allEvents
        .map((event) => event.project)
        .filter(Boolean)
    ),
  ];

  function prevMonth() {
    if (month === 0) {
      setMonth(11);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
  }

  function nextMonth() {
    if (month === 11) {
      setMonth(0);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
  }

  function canEdit(event) {
    return (
      CAN_EDIT_ANY.includes(myRole) ||
      event.assignee === currentUser.id
    );
  }

  function openNewEvent(date) {
    // Everyone can create a personal todo.
    setSelectedDate(date);
    setShowForm(true);
  }

  return (
    <div className="calendar-view">

      {/* Calendar Controls */}
      <div className="calendar-controls">
        <button onClick={prevMonth}>
          ◀
        </button>

        <h3>
          {new Date(year, month).toLocaleString(
            'default',
            {
              month: 'long',
              year: 'numeric',
            }
          )}
        </h3>

        <button onClick={nextMonth}>
          ▶
        </button>
      </div>


      {/* Filters */}
      <div className="filters">

        <select
          value={filterProject}
          onChange={(e) =>
            setFilterProject(e.target.value)
          }
        >
          <option value="all">
            All Projects
          </option>

          {projects.map((project) => (
            <option
              key={project}
              value={project}
            >
              {project}
            </option>
          ))}
        </select>


        {team && (
          <select
            value={filterAssignee}
            onChange={(e) =>
              setFilterAssignee(e.target.value)
            }
          >
            <option value="all">
              All Members
            </option>

            {team.members.map((member) => (
              <option
                key={member.userId}
                value={member.userId}
              >
                {member.name}
              </option>
            ))}
          </select>
        )}


        <select
          value={filterStatus}
          onChange={(e) =>
            setFilterStatus(e.target.value)
          }
        >
          <option value="all">
            All Statuses
          </option>

          <option>To Do</option>
          <option>In Progress</option>
          <option>Done</option>
        </select>

      </div>


      {/* Calendar */}
      <div className="grid">

        {[
          'Sun',
          'Mon',
          'Tue',
          'Wed',
          'Thu',
          'Fri',
          'Sat',
        ].map((day) => (
          <div
            key={day}
            className="grid-header"
          >
            {day}
          </div>
        ))}


        {Array(startWeekday)
          .fill(null)
          .map((_, index) => (
            <div
              key={'empty' + index}
              className="cell empty"
            />
          ))}


        {days.map((day) => {
          const dateStr = day
            .toISOString()
            .slice(0, 10);

          const dayEvents = filtered.filter(
            (event) => event.date === dateStr
          );

          return (
            <div
              key={dateStr}
              className="cell"
              onClick={() =>
                openNewEvent(dateStr)
              }
            >
              <span className="day-number">
                {day.getDate()}
              </span>


              {dayEvents.map((event) => (
                <div
                  key={event.id}
                  className={`event-chip ${
                    event.is_personal
                      ? 'personal-event'
                      : `status-${event.status
                          ?.replace(' ', '-')
                          .toLowerCase()}`
                  }`}
                >
                  {event.title}
                </div>
              ))}

            </div>
          );
        })}

      </div>


      {/* Add Event / Todo Form */}
      {showForm && (
        <EventForm
          date={selectedDate}
          team={team}
          currentUser={currentUser}
          onClose={() =>
            setShowForm(false)
          }
          onSaved={() => {
            setShowForm(false);
            refreshEvents();
          }}
        />
      )}

    </div>
  );
}

export default CalendarView;