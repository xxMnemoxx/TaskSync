import { useEffect, useMemo, useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';

import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/react/daygrid';
import timeGridPlugin from '@fullcalendar/react/timegrid';
import listPlugin from '@fullcalendar/react/list';
import interactionPlugin from '@fullcalendar/react/interaction';

import '@fullcalendar/react/skeleton.css';

import { supabase } from '../data/supabaseClient';
import { fetchTeamEvents, fetchMyTodos, addEvent } from '../data/storage';

function CalendarView({ currentUser }) {
  const location = useLocation();

  const [team, setTeam] = useState(null);
  const [events, setEvents] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);

  const [title, setTitle] = useState('');
  const [project, setProject] = useState('');
  const [status, setStatus] = useState('To Do');
  const [isPersonal, setIsPersonal] = useState(true);

  const [saving, setSaving] = useState(false);

  // Helper to get local YYYY-MM-DD string without UTC offset issues
  const getTodayISOString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Consolidated fetch logic with unmount safety guard
  const refreshEvents = useCallback(async () => {
    if (!currentUser?.id) return;

    let isMounted = true;
    setLoading(true);
    setError('');

    try {
      // 1. Fetch team info
      const { data: teamData, error: teamError } = await supabase
        .from('team_members')
        .select('team_id, role')
        .eq('user_id', currentUser.id)
        .limit(1)
        .maybeSingle();

      if (teamError) throw teamError;

      if (!isMounted) return;
      setTeam(teamData || null);

      // 2. Fetch personal todos & team events concurrently
      const personalTodosPromise = fetchMyTodos(currentUser.id, null);
      const teamEventsPromise = teamData?.team_id
        ? fetchTeamEvents(teamData.team_id)
        : Promise.resolve([]);

      const [personalTodos, teamEvents] = await Promise.all([
        personalTodosPromise,
        teamEventsPromise,
      ]);

      if (isMounted) {
        setEvents([...teamEvents, ...personalTodos]);
      }
    } catch (err) {
      if (isMounted) {
        console.error('Error loading calendar:', err);
        setError(err?.message || 'Unable to load calendar events.');
      }
    } finally {
      if (isMounted) {
        setLoading(false);
      }
    }

    return () => {
      isMounted = false;
    };
  }, [currentUser?.id]);

  useEffect(() => {
    refreshEvents();
  }, [location.pathname, refreshEvents]);

  // Calendar events memoization
  const calendarEvents = useMemo(() => {
    return events.map((event) => {
      const personal = event.is_personal === true;

      return {
        id: String(event.id),
        title: event.title,
        start: event.date,
        allDay: true,
        extendedProps: {
          originalEvent: event,
          isPersonal: personal,
          project: event.project,
          status: event.status,
          assignee: event.assignee,
          teamId: event.team_id,
        },
      };
    });
  }, [events]);

  const resetForm = () => {
    setTitle('');
    setProject('');
    setStatus('To Do');
    setIsPersonal(true);
    setSelectedDate(null);
  };

  function openCreateForm(date) {
    setSelectedDate(date);
    setTitle('');
    setProject('');
    setStatus('To Do');
    setIsPersonal(true);
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    resetForm();
  }

  async function handleCreateEvent(e) {
    e.preventDefault();
    if (!title.trim() || !selectedDate) return;

    if (!isPersonal && team?.role === 'viewer') {
      setError('Viewers cannot create team events.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      await addEvent({
        title: title.trim(),
        date: selectedDate,
        team_id: isPersonal ? null : team?.team_id || null,
        assignee: currentUser.id,
        is_personal: isPersonal,
        project: project.trim() || null,
        status,
        user_id: currentUser.id,
      });

      closeForm();
      await refreshEvents();
    } catch (err) {
      setError(err?.message || 'Unable to create event.');
    } finally {
      setSaving(false);
    }
  }

  function handleEventClick(info) {
    const original = info.event.extendedProps.originalEvent;
    if (!original) return;

    const type = original.is_personal ? 'Personal To-Do' : 'Team Event';
    const projectText = original.project ? `\nProject: ${original.project}` : '';
    const statusText = original.status ? `\nStatus: ${original.status}` : '';

    window.alert(`${type}\n\n${original.title}${projectText}${statusText}`);
  }

  if (loading) {
    return (
      <div className="flex min-h-full items-center justify-center bg-gray-50 p-4 md:p-6">
        <div className="rounded-xl bg-white px-8 py-10 text-sm font-medium text-gray-500 shadow-sm">
          Loading calendar...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-gray-50 p-3 sm:p-4 md:p-6">
      <div className="mx-auto w-full max-w-7xl">
        {/* Header */}
        <div className="mb-4 flex flex-col gap-4 sm:mb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">Calendar</h1>
            <p className="mt-1 text-sm text-gray-500">
              {team ? 'Your team events and personal to-dos' : 'Your personal to-dos'}
            </p>
          </div>

          <button
            type="button"
            onClick={() => openCreateForm(getTodayISOString())}
            className="inline-flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto"
          >
            + Add To-Do
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Calendar Card */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto p-2 sm:p-4 md:p-5">
            <div className="min-w-[650px] md:min-w-0">
              <FullCalendar
                plugins={[
                  dayGridPlugin,
                  timeGridPlugin,
                  listPlugin,
                  interactionPlugin,
                ]}
                initialView="dayGridMonth"
                headerToolbar={{
                  left: 'prev,next today',
                  center: 'title',
                  right: 'dayGridMonth,timeGridWeek,listWeek',
                }}
                buttonText={{
                  today: 'Today',
                  month: 'Month',
                  week: 'Week',
                  list: 'List',
                }}
                events={calendarEvents}
                height="auto"
                dayMaxEvents={3}
                selectable={true}
                editable={false}
                dateClick={(info) => openCreateForm(info.dateStr)}
                eventClick={handleEventClick}
                eventDisplay="block"
                eventClassNames={(arg) => {
                  const isPersonalEvent = arg.event.extendedProps.isPersonal;
                  return [
                    'rounded-md',
                    'border-0',
                    isPersonalEvent ? '!bg-emerald-500 hover:!bg-emerald-600' : '!bg-blue-600 hover:!bg-blue-700',
                    'text-white',
                    'px-1.5',
                    'py-0.5',
                    'text-xs',
                    'font-medium',
                    'shadow-sm',
                  ];
                }}
                dayCellContent={(arg) => (
                  <span
                    className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-sm font-medium ${
                      arg.isToday ? 'bg-blue-600 text-white' : 'text-gray-700'
                    }`}
                  >
                    {arg.dayNumberText}
                  </span>
                )}
              />
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 px-1 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-blue-600" />
            <span>Team Event</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
            <span>Personal To-Do</span>
          </div>
        </div>
      </div>

      {/* Modal Form */}
      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-gray-900/40 p-4 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) closeForm();
          }}
        >
          <div className="my-auto w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl sm:p-6">
            <div className="mb-5 flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Add Calendar Item</h2>
                <p className="mt-1 text-sm text-gray-500">{selectedDate}</p>
              </div>

              <button
                type="button"
                onClick={closeForm}
                className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="What do you need to do?"
                  autoFocus
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setIsPersonal(true)}
                    className={`rounded-lg border px-3 py-2.5 text-sm font-medium transition ${
                      isPersonal
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    ✓ Personal
                  </button>

                  <button
                    type="button"
                    disabled={!team}
                    onClick={() => setIsPersonal(false)}
                    className={`rounded-lg border px-3 py-2.5 text-sm font-medium transition ${
                      !team
                        ? 'cursor-not-allowed border-gray-100 bg-gray-50 text-gray-300'
                        : !isPersonal
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    👥 Team
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Project <span className="ml-1 font-normal text-gray-400">optional</span>
                </label>
                <input
                  type="text"
                  value={project}
                  onChange={(e) => setProject(e.target.value)}
                  placeholder="Project name"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="To Do">To Do</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Done">Done</option>
                </select>
              </div>

              <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row">
                <button
                  type="button"
                  onClick={closeForm}
                  className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving || !title.trim()}
                  className="flex-1 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Add Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default CalendarView;