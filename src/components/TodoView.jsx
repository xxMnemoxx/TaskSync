import { useEffect, useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import {
  fetchMyTodos,
  addEvent,
  updateEventStatus,
  deleteEvent,
} from '../data/storage';

function TodoView({ currentUser }) {
  const location = useLocation();

  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [showAddForm, setShowAddForm] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [priority, setPriority] = useState('normal');

  // Load todos with unmount protection
  const loadTodos = useCallback(async () => {
    if (!currentUser?.id) {
      setLoading(false);
      return;
    }

    let isMounted = true;
    try {
      setLoading(true);
      setError('');

      const data = await fetchMyTodos(currentUser.id);
      if (isMounted) {
        setTodos(data || []);
      }
    } catch (err) {
      if (isMounted) {
        console.error(err);
        setError('Failed to load your to-dos.');
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

  // Refreshes todos on route change / back navigation
  useEffect(() => {
    loadTodos();
  }, [location.pathname, loadTodos]);

  // Add todo
  async function handleAddTodo(e) {
    e.preventDefault();

    if (!currentUser?.id || !title.trim()) return;

    try {
      setSaving(true);
      setError('');

      const newTodo = await addEvent({
        title: title.trim(),
        description: description.trim() || null,
        assignee: currentUser.id,
        is_personal: true,
        team_id: null,
        status: 'pending',
        date: date || null,
        priority,
      });

      setTodos((current) => [newTodo, ...current]);

      setTitle('');
      setDescription('');
      setDate('');
      setPriority('normal');
      setShowAddForm(false);
    } catch (err) {
      console.error(err);
      setError('Failed to create the to-do.');
    } finally {
      setSaving(false);
    }
  }

  // Toggle todo
  async function handleToggle(todo) {
    const newStatus =
      todo.status === 'completed' ? 'pending' : 'completed';

    try {
      setError('');

      setTodos((current) =>
        current.map((item) =>
          item.id === todo.id
            ? { ...item, status: newStatus }
            : item
        )
      );

      await updateEventStatus(todo.id, newStatus);
    } catch (err) {
      console.error(err);

      await loadTodos();
      setError('Failed to update the to-do.');
    }
  }

  // Delete todo
  async function handleDelete(id) {
    try {
      setError('');

      setTodos((current) =>
        current.filter((todo) => todo.id !== id)
      );

      await deleteEvent(id);
    } catch (err) {
      console.error(err);

      await loadTodos();
      setError('Failed to delete the to-do.');
    }
  }

  function formatDate(dateValue) {
    if (!dateValue) return null;

    const parsedDate = new Date(dateValue);

    if (Number.isNaN(parsedDate.getTime())) {
      return dateValue;
    }

    return parsedDate.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  function getPriorityStyle(priorityValue) {
    switch (priorityValue) {
      case 'high':
        return 'bg-red-50 text-red-700 border-red-100';

      case 'low':
        return 'bg-gray-50 text-gray-600 border-gray-200';

      default:
        return 'bg-blue-50 text-blue-700 border-blue-100';
    }
  }

  const completedTodos = todos.filter(
    (todo) => todo.status === 'completed'
  );

  const pendingTodos = todos.filter(
    (todo) => todo.status !== 'completed'
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto w-full max-w-6xl px-4 py-5 sm:px-6 sm:py-7 lg:px-8 lg:py-8">

        {/* Header */}
        <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

            <div className="min-w-0">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-xl text-white shadow-sm">
                  ✓
                </div>

                <div className="min-w-0">
                  <h1 className="truncate text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
                    My To-Dos
                  </h1>

                  <p className="mt-0.5 text-sm text-gray-500">
                    Manage your personal tasks and stay organized.
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowAddForm(!showAddForm)}
              className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 active:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto"
            >
              <span className="mr-2 text-lg leading-none">
                {showAddForm ? '×' : '+'}
              </span>

              {showAddForm ? 'Close' : 'Add To-Do'}
            </button>

          </div>
        </div>

        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3.5 text-sm text-red-700">
            <span className="mt-0.5 shrink-0">⚠</span>
            <p>{error}</p>
          </div>
        )}

        {/* Form for adding todo */}
        {showAddForm && (
          <form
            onSubmit={handleAddTodo}
            className="mb-6 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
          >
            <div className="border-b border-gray-100 bg-gray-50/70 px-5 py-4 sm:px-6">
              <h2 className="text-base font-semibold text-gray-900">
                Create a new to-do
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Add the details for your personal task.
              </p>
            </div>

            <div className="space-y-5 p-5 sm:p-6">

              <div>
                <label
                  htmlFor="todo-title"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Title
                </label>

                <input
                  id="todo-title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="What needs to be done?"
                  required
                  className="min-h-11.5 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 hover:border-gray-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                />
              </div>

              <div>
                <label
                  htmlFor="todo-description"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Description
                  <span className="ml-1 font-normal text-gray-400">
                    (optional)
                  </span>
                </label>

                <textarea
                  id="todo-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add some details about this task..."
                  rows={4}
                  className="w-full resize-none rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 hover:border-gray-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                />
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

                <div>
                  <label
                    htmlFor="todo-date"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    Due Date
                  </label>

                  <input
                    id="todo-date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="min-h-11.5 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition hover:border-gray-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                  />
                </div>

                <div>
                  <label
                    htmlFor="todo-priority"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    Priority
                  </label>

                  <select
                    id="todo-priority"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="min-h-11.5 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition hover:border-gray-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                  >
                    <option value="low">Low Priority</option>
                    <option value="normal">Normal Priority</option>
                    <option value="high">High Priority</option>
                  </select>
                </div>

              </div>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-gray-100 bg-gray-50/50 p-5 sm:flex-row sm:justify-end sm:px-6">

              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="min-h-11 rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 active:bg-gray-100"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving || !title.trim()}
                className="min-h-11 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 active:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? 'Creating...' : 'Create To-Do'}
              </button>

            </div>
          </form>
        )}

        {!loading && (
          <div className="mb-6 grid grid-cols-1 gap-3 min-[400px]:grid-cols-3">

            {/* Total */}
            <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                    Total
                  </p>

                  <p className="mt-1 text-2xl font-bold text-gray-900">
                    {todos.length}
                  </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-sm">
                  ✓
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                    Pending
                  </p>

                  <p className="mt-1 text-2xl font-bold text-blue-600">
                    {pendingTodos.length}
                  </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  ○
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                    Completed
                  </p>

                  <p className="mt-1 text-2xl font-bold text-green-600">
                    {completedTodos.length}
                  </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-green-600">
                  ✓
                </div>
              </div>
            </div>

          </div>
        )}

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

          <div className="flex flex-col gap-2 border-b border-gray-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div>
              <h2 className="font-semibold text-gray-900">
                Your Tasks
              </h2>

              <p className="mt-0.5 text-xs text-gray-400">
                {todos.length === 0
                  ? 'No tasks yet'
                  : `${todos.length} task${todos.length === 1 ? '' : 's'}`}
              </p>
            </div>
          </div>

          {loading && (
            <div className="flex min-h-65 items-center justify-center px-5 py-12">
              <div className="flex flex-col items-center text-center">

                <div className="mb-4 h-8 w-8 animate-spin rounded-full border-[3px] border-gray-200 border-t-blue-600" />

                <p className="text-sm font-medium text-gray-600">
                  Loading your tasks...
                </p>

                <p className="mt-1 text-xs text-gray-400">
                  Please wait a moment
                </p>

              </div>
            </div>
          )}

          {!loading && todos.length === 0 && (
            <div className="flex min-h-80 flex-col items-center justify-center px-5 py-14 text-center">

              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-2xl text-blue-600">
                ✓
              </div>

              <h3 className="mt-5 text-base font-semibold text-gray-900">
                You're all caught up
              </h3>

              <p className="mt-2 max-w-sm text-sm leading-6 text-gray-500">
                You don't have any personal tasks yet.
                Create a to-do to start organizing your work.
              </p>

              <button
                type="button"
                onClick={() => setShowAddForm(true)}
                className="mt-5 min-h-10.5 rounded-xl bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-600 transition hover:bg-blue-100"
              >
                + Create a To-Do
              </button>

            </div>
          )}

          {!loading && todos.length > 0 && (
            <div className="divide-y divide-gray-100">

              {todos.map((todo) => {
                const completed = todo.status === 'completed';

                return (
                  <div
                    key={todo.id}
                    className={`group flex gap-3 px-4 py-4 transition sm:gap-4 sm:px-6 ${
                      completed
                        ? 'bg-gray-50/60'
                        : 'hover:bg-gray-50'
                    }`}
                  >

                    <button
                      type="button"
                      onClick={() => handleToggle(todo)}
                      aria-label={
                        completed
                          ? 'Mark as incomplete'
                          : 'Mark as complete'
                      }
                      className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition focus:outline-none focus:ring-4 focus:ring-blue-50 ${
                        completed
                          ? 'border-green-500 bg-green-500 text-white'
                          : 'border-gray-300 bg-white hover:border-blue-500 hover:bg-blue-50'
                      }`}
                    >
                      {completed && (
                        <span className="text-xs font-bold">
                          ✓
                        </span>
                      )}
                    </button>

                    <div className="min-w-0 flex-1">

                      <div className="flex flex-wrap items-center gap-2">

                        <h3
                          className={`wrap-break-word text-sm font-semibold leading-5 sm:text-[15px] ${
                            completed
                              ? 'text-gray-400 line-through'
                              : 'text-gray-900'
                          }`}
                        >
                          {todo.title}
                        </h3>

                        {todo.priority &&
                          todo.priority !== 'normal' && (
                            <span
                              className={`shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-semibold capitalize ${getPriorityStyle(
                                todo.priority
                              )}`}
                            >
                              {todo.priority}
                            </span>
                          )}

                      </div>

                      {todo.description && (
                        <p
                          className={`mt-1.5 wrap-break-word text-sm leading-5 ${
                            completed
                              ? 'text-gray-400'
                              : 'text-gray-500'
                          }`}
                        >
                          {todo.description}
                        </p>
                      )}

                      {todo.date && (
                        <div className="mt-2.5 inline-flex items-center gap-1.5 rounded-lg bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-500">
                          <span>📅</span>
                          <span>{formatDate(todo.date)}</span>
                        </div>
                      )}

                    </div>

                    {/* Delete */}
                    <button
                      type="button"
                      onClick={() => handleDelete(todo.id)}
                      aria-label="Delete to-do"
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-gray-400 transition hover:bg-red-50 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-100 sm:opacity-0 sm:group-hover:opacity-100"
                    >
                      <span className="text-base">
                        🗑
                      </span>
                    </button>

                  </div>
                );
              })}

            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default TodoView;