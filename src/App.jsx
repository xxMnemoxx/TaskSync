import { useState, useEffect } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate
} from 'react-router-dom';

import { supabase } from './data/supabaseClient';

import Login from './components/Login';
import SignUp from './components/SignUp';
import MainApp from './components/MainApp';
import CalendarView from './components/CalendarView';
import TodoView from './components/TodoView';
import TeamMembers from './components/TeamMembers';

import './App.css';

function SignUpWrapper() {
  const navigate = useNavigate();
  return <SignUp onBackToLogin={() => navigate('/login')} />;
}

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setCurrentUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>

        {/* LOGIN */}
        <Route
          path="/login"
          element={
            currentUser ? (
              <Navigate to="/calendar" replace />
            ) : (
              <div className="min-h-screen w-full flex items-center justify-center bg-gray-100 px-4 py-8">
                <Login onLogin={setCurrentUser} />
              </div>
            )
          }
        />

        {/* SIGN UP */}
        <Route
          path="/signup"
          element={
            currentUser ? (
              <Navigate to="/calendar" replace />
            ) : (
              <div className="min-h-screen w-full flex items-center justify-center bg-gray-100 px-4 py-8">
                <SignUpWrapper />
              </div>
            )
          }
        />

        {/* PROTECTED APP */}
        <Route
          path="/"
          element={
            currentUser ? (
              <MainApp
                currentUser={currentUser}
                onSignOut={async () => {
                  await supabase.auth.signOut();
                  setCurrentUser(null);
                }}
              />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        >
          <Route
            index
            element={<Navigate to="/calendar" replace />}
          />

          <Route
            path="calendar"
            element={<CalendarView currentUser={currentUser} />}
          />

          <Route
            path="todos"
            element={<TodoView currentUser={currentUser} />}
          />

          <Route
            path="team"
            element={<TeamMembers currentUser={currentUser} />}
          />
        </Route>

        {/* FALLBACK */}
        <Route
          path="*"
          element={
            <Navigate
              to={currentUser ? "/calendar" : "/login"}
              replace
            />
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;