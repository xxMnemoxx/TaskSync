import { useState } from 'react';
import { supabase } from '../data/supabaseClient';

function Login({ onLogin }) {
  const [mode, setMode] = useState('signin'); // 'signin' or 'signup'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setNotice('');

    if (mode === 'signup') {
      const { data, error } = await supabase.auth.signUp({
        email, password, options: { data: { name } },
      });
      if (error) { setError(error.message); return; }
      if (!data.session) {
        // Email confirmation is required — there's no active session yet
        setNotice('Check your email to confirm your account, then sign in.');
        return;
      }
      onLogin(data.user);
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) { setError(error.message); return; }
      onLogin(data.user);
    }
  }

  return (
    <div className="felex flex-col ">
      <h1>Team Calendar</h1>
      {/* <div className="tabs">
        <button onClick={() => setMode('signin')} className={mode === 'signin' ? 'active' : ''}>Sign In</button>
        <button onClick={() => setMode('signup')} className={mode === 'signup' ? 'active' : ''}>Sign Up</button>
      </div> */}
      <form onSubmit={handleSubmit}>
        {mode === 'signup' && (
          <div>
            <input placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
        )}
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button type="submit">{mode === 'signup' ? 'Create Account' : 'Sign In'}</button>
        {error && <p className="error">{error}</p>}
        {notice && <p className="notice">{notice}</p>}
      </form>
    </div>
  );
}

export default Login;