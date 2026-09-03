import { useState, useEffect } from 'react';
import { supabase } from './data/supabaseClient';
import Login from './components/Login';
import TeamSetup from './components/TeamSetup';
import MainApp from './components/MainApp';
import './App.css';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentTeam, setCurrentTeam] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setCurrentUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUser(session?.user ?? null);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (!currentUser) return <Login onLogin={setCurrentUser} />;
  if (!currentTeam) return <TeamSetup currentUser={currentUser} onTeamReady={setCurrentTeam} />;

  return (
    <MainApp
      currentUser={currentUser}
      team={currentTeam}
      onSignOut={() => setCurrentTeam(null)}
    />
  );
}

export default App;