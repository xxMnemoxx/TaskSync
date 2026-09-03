import { useState } from 'react';
import { supabase } from '../data/supabaseClient';
import logo from '../assets/logo.png';

function Login({ onLogin, onSignUp  }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false); 
  
  function validateForm() { 
    const newErrors = {}; 

    // Email validation 
    if (!email.trim()) { 
      newErrors.email = 'Email is required.'; 
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { 
      newErrors.email = 'Please enter a valid email address.'; 
    } 
    // Password validation 
    if (!password) { 
      newErrors.password = 'Password is required.'; 
    } else if (password.length < 6) { 
        newErrors.password = 'Password must be at least 6 characters.'; 
    } 
    
    setErrors(newErrors); 
    
    return Object.keys(newErrors).length === 0; 
  }

  async function handleSubmit(e) {
    e.preventDefault();
    
    if (!validateForm()) {
       return; 
    }

    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({ 
      email: email.trim(), 
      password 
    });

    if (error) { 
      setErrors({
        form: error.message,
      }); 

      setLoading(false);
      return; 
    }

    setLoading(false);
    onLogin(data.user);
  }

  return (
    <div className="w-full max-w-md border border-gray-200 rounded-2xl p-6 sm:p-8 bg-white shadow-xl">
      <div className="flex justify-center mb-6">
        <img
          src={logo}
          alt="TaskSync Logo"
          className="w-32 sm:w-40 h-auto object-contain"
        />
      </div>
      <form onSubmit={handleSubmit} className="w-full flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <label htmlFor="email" className="font-semibold text-sm text-gray-700">
            Email
          </label>
          <input type="email" id="email" name="email" value={email} 
            onChange={(e) => {
              setEmail(e.target.value); 
              if (errors.email) { 
                setErrors((prev) => ({ ...prev, email: '', }));
              }
            }} 
            placeholder="Enter your email"
            className={`w-full px-4 py-3 border rounded-lg outline-none transition ${ errors.email ? 'border-red-500 focus:ring-2 focus:ring-red-100' : 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100' }`}
          />
          {errors.email && ( <p className="text-xs text-red-500"> {errors.email} </p> )}
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="password" className="font-semibold text-sm text-grat-700">
            Password
          </label>
          <input type="password" id="password" name="password" value={password} 
            onChange={(e) => { 
              setPassword(e.target.value);
              if (errors.password) { 
                setErrors((prev) => ({ ...prev, password: '', })); 
              } 
            }}
            placeholder="Enter your password"
            className={`w-full px-4 py-3 border rounded-lg outline-none transition ${ errors.password ? 'border-red-500 focus:ring-2 focus:ring-red-100' : 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100' }`}
          />
          {errors.password && ( <p className="text-xs text-red-500"> {errors.password} </p> )}
          <p className="text-xs text-gray-500 text-right cursor-pointer hover:text-blue-500">
            Forgot Password?
          </p>
        </div>
        <button className="w-full py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 active:bg-blue-700 font-semibold transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed" type="submit">
          {loading ? 'Logging in...' : 'Login'}
        </button>
        <p className="text-sm text-gray-500 text-center">
          Doesn't have an account? {" "}
          <span
            onClick={onSignUp}
            className="text-blue-500 font-semibold cursor-pointer hover:text-blue-700"
          >
            Sign Up
          </span>
        </p>
        {errors.form && ( <p className="text-sm text-red-500 text-center"> {errors.form} </p> )}
      </form>
    </div>
  );
}

export default Login;