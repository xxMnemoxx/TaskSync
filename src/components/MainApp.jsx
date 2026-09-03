import { NavLink, Outlet } from 'react-router-dom';
import { useState } from 'react';

function MainApp({ currentUser, onSignOut }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  async function handleSignOut() {
    await onSignOut();
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">

      {/* SIDEBAR */}
      <aside
        className={`
          bg-white border-r border-gray-200
          transition-all duration-300
          flex flex-col
          ${sidebarOpen ? 'w-64' : 'w-20'}
        `}
      >

        {/* HEADER */}
        <div className="h-16 flex items-center justify-between px-4 border-b">

          {sidebarOpen && (
            <h1 className="text-xl font-bold text-gray-800">
              TaskSync
            </h1>
          )}

          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            {sidebarOpen ? '◀' : '▶'}
          </button>

        </div>

        {/* USER */}
        {sidebarOpen && (
          <div className="px-4 py-4 border-b">
            <p className="text-xs text-gray-500">
              Signed in as
            </p>

            <p className="text-sm font-medium text-gray-800 truncate">
              {currentUser?.email}
            </p>
          </div>
        )}

        {/* NAVIGATION */}
        <nav className="flex-1 p-3 space-y-2">

          <NavLink
            to="/calendar"
            className={({ isActive }) =>
              `
              flex items-center gap-3 px-3 py-3 rounded-lg
              transition
              ${
                isActive
                  ? 'bg-blue-100 text-blue-700 font-semibold'
                  : 'text-gray-700 hover:bg-gray-100'
              }
              `
            }
          >
            <span>📅</span>

            {sidebarOpen && (
              <span>Calendar</span>
            )}
          </NavLink>

          <NavLink
            to="/todos"
            className={({ isActive }) =>
              `
              flex items-center gap-3 px-3 py-3 rounded-lg
              transition
              ${
                isActive
                  ? 'bg-blue-100 text-blue-700 font-semibold'
                  : 'text-gray-700 hover:bg-gray-100'
              }
              `
            }
          >
            <span>✓</span>

            {sidebarOpen && (
              <span>My To-Dos</span>
            )}
          </NavLink>

          <NavLink
            to="/team"
            className={({ isActive }) =>
              `
              flex items-center gap-3 px-3 py-3 rounded-lg
              transition
              ${
                isActive
                  ? 'bg-blue-100 text-blue-700 font-semibold'
                  : 'text-gray-700 hover:bg-gray-100'
              }
              `
            }
          >
            <span>👥</span>

            {sidebarOpen && (
              <span>Team</span>
            )}
          </NavLink>

        </nav>

        {/* SIGN OUT */}
        <div className="p-3 border-t">

          <button
            onClick={handleSignOut}
            className="
              w-full flex items-center gap-3
              px-3 py-3 rounded-lg
              text-red-600
              hover:bg-red-50
              transition
            "
          >
            <span>↪</span>

            {sidebarOpen && (
              <span>Sign Out</span>
            )}
          </button>

        </div>

      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 min-w-0 overflow-auto">

        <Outlet />

      </main>

    </div>
  );
}

export default MainApp;