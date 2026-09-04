import { useState, useCallback } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';

function MainApp({ currentUser, onSignOut }) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [desktopCollapsed, setDesktopCollapsed] = useState(false);

  const location = useLocation();

  async function handleSignOut() {
    await onSignOut();
  }

  // ✅ Fixed: useCallback prevents recreation of class generator on every render
  const navItem = useCallback(
    ({ isActive }) => `
    group flex min-h-[44px] items-center rounded-xl
    text-sm font-medium transition-all duration-200
    ${
      isActive
        ? 'bg-blue-50 text-blue-700 font-semibold'
        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
    }
    ${desktopCollapsed ? 'justify-center px-2' : 'gap-3 px-3'}
  `,
    [desktopCollapsed]
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile header */}
      <header className="flex h-16 items-center border-b border-gray-700 bg-slate-800 px-4 lg:hidden">
        <button
          type="button"
          onClick={() => setMobileSidebarOpen(true)}
          aria-label="Open navigation"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-white transition hover:bg-white/10 active:bg-white/20"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <span className="ml-3 text-lg font-bold text-white">TaskSync</span>
      </header>

      {/* Mobile Overlay */}
      {mobileSidebarOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-gray-950/40 lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50
          flex flex-col
          border-r border-gray-200
          bg-white
          shadow-lg
          transition-all duration-300 ease-in-out

          ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
          ${desktopCollapsed ? 'lg:w-20' : 'lg:w-64'} 
        `}
      >
        {/* Sidebar header */}
        <div
          className={`
            flex h-16 shrink-0 items-center border-b border-gray-200
            ${desktopCollapsed ? 'justify-center px-2' : 'justify-between px-4'}
          `}
        >
          {!desktopCollapsed && (
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-xs font-bold text-white shadow-sm">
                TS
              </div>
              <span className="truncate text-lg font-bold text-gray-900">TaskSync</span>
            </div>
          )}

          <button
            type="button"
            onClick={() => setDesktopCollapsed((val) => !val)}
            aria-label={desktopCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 focus:outline-none lg:flex"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <button
            type="button"
            onClick={() => setMobileSidebarOpen(false)}
            aria-label="Close sidebar"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 lg:hidden"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        {/* User Badge */}
        <div className={`border-b border-gray-100 ${desktopCollapsed ? 'flex justify-center px-2 py-4' : 'px-4 py-4'}`}>
          {desktopCollapsed ? (
            <div
              title={currentUser?.email || 'User'}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-sm font-semibold text-blue-700"
            >
              {currentUser?.email?.charAt(0)?.toUpperCase() || 'U'}
            </div>
          ) : (
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Signed in as</p>
              <p className="mt-1 truncate text-sm font-semibold text-gray-800">{currentUser?.email || 'User'}</p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1.5 p-3">
          <NavLink
            to="/calendar"
            onClick={() => setMobileSidebarOpen(false)}
            className={navItem}
            title={desktopCollapsed ? 'Calendar' : undefined}
          >
            <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <rect x="3" y="4" width="18" height="17" rx="2" />
              <path d="M16 2v4M8 2v4M3 10h18" />
            </svg>
            {!desktopCollapsed && <span>Calendar</span>}
          </NavLink>

          <NavLink
            to="/todos"
            onClick={() => setMobileSidebarOpen(false)}
            className={navItem}
            title={desktopCollapsed ? 'My To-Dos' : undefined}
          >
            <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 11l3 3L20 6" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h.01M4 12h.01M4 18h.01" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 6h2M8 18h12" />
            </svg>
            {!desktopCollapsed && <span>My To-Dos</span>}
          </NavLink>

          <NavLink
            to="/team"
            onClick={() => setMobileSidebarOpen(false)}
            className={navItem}
            title={desktopCollapsed ? 'Team' : undefined}
          >
            <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M22 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
            </svg>
            {!desktopCollapsed && <span>Team</span>}
          </NavLink>
        </nav>

        {/* Sign Out */}
        <div className={`border-t border-gray-200 p-3 ${desktopCollapsed ? 'flex justify-center' : ''}`}>
          <button
            type="button"
            onClick={handleSignOut}
            title={desktopCollapsed ? 'Sign Out' : undefined}
            className={`
              flex min-h-[42px] items-center rounded-xl text-sm font-medium text-red-600 transition hover:bg-red-50
              ${desktopCollapsed ? 'h-10 w-10 justify-center' : 'w-full gap-3 px-3'}
            `}
          >
            <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 17l5-5-5-5" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12H3" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 19V5a2 2 0 00-2-2h-6" />
            </svg>
            {!desktopCollapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className={`min-h-screen transition-[padding] duration-300 ${desktopCollapsed ? 'lg:pl-20' : 'lg:pl-64'}`}>
        <Outlet key={location.key} context={{ currentUser }} />
      </main>
    </div>
  );
}

export default MainApp;