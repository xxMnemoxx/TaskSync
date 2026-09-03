import { useState } from 'react';
import { supabase } from '../data/supabaseClient';
import logo from '../assets/logo.png';

function SignUp({ onBackToLogin, onSignUp }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  function validateForm() {
    const newErrors = {};

    // Name validation
    if (!name.trim()) {
      newErrors.name = 'Name is required.';
    } else if (name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters.';
    }

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

    // Confirm password validation
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password.';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
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
    setErrors({});

    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          name: name.trim(),
        },
      },
    });

    if (error) {
      setErrors({
        form: error.message,
      });

      setLoading(false);
      return;
    }

    setLoading(false);

    // Send the created user back to the parent component
    if (onSignUp) {
      onSignUp(data.user);
    }
  }

  return (
    <div className="w-full max-w-md border border-gray-200 rounded-2xl p-6 sm:p-8 bg-white shadow-xl">

      {/* Logo */}
      <div className="flex justify-center mb-6">
        <img
          src={logo}
          alt="TaskSync Logo"
          className="w-32 sm:w-40 h-auto object-contain"
        />
      </div>

      <form onSubmit={handleSubmit} className="w-full flex flex-col gap-5">

        {/* Name */}
        <div className="flex flex-col gap-2">
          <label
            htmlFor="name"
            className="font-semibold text-sm text-gray-700"
          >
            Name
          </label>

          <input
            type="text"
            id="name"
            name="name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);

              if (errors.name) {
                setErrors((prev) => ({
                  ...prev,
                  name: '',
                }));
              }
            }}
            placeholder="Enter your name"
            className={`w-full px-4 py-3 border rounded-lg outline-none transition ${
              errors.name
                ? 'border-red-500 focus:ring-2 focus:ring-red-100'
                : 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
            }`}
          />

          {errors.name && (
            <p className="text-xs text-red-500">
              {errors.name}
            </p>
          )}
        </div>

        {/* Email */}
        <div className="flex flex-col gap-2">
          <label
            htmlFor="email"
            className="font-semibold text-sm text-gray-700"
          >
            Email
          </label>

          <input
            type="email"
            id="email"
            name="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);

              if (errors.email) {
                setErrors((prev) => ({
                  ...prev,
                  email: '',
                }));
              }
            }}
            placeholder="Enter your email"
            className={`w-full px-4 py-3 border rounded-lg outline-none transition ${
              errors.email
                ? 'border-red-500 focus:ring-2 focus:ring-red-100'
                : 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
            }`}
          />

          {errors.email && (
            <p className="text-xs text-red-500">
              {errors.email}
            </p>
          )}
        </div>

        {/* Password */}
        <div className="flex flex-col gap-2">
          <label
            htmlFor="password"
            className="font-semibold text-sm text-gray-700"
          >
            Password
          </label>

          <input
            type="password"
            id="password"
            name="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);

              if (errors.password) {
                setErrors((prev) => ({
                  ...prev,
                  password: '',
                }));
              }
            }}
            placeholder="Create a password"
            className={`w-full px-4 py-3 border rounded-lg outline-none transition ${
              errors.password
                ? 'border-red-500 focus:ring-2 focus:ring-red-100'
                : 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
            }`}
          />

          {errors.password && (
            <p className="text-xs text-red-500">
              {errors.password}
            </p>
          )}
        </div>

        {/* Confirm Password */}
        <div className="flex flex-col gap-2">
          <label
            htmlFor="confirmPassword"
            className="font-semibold text-sm text-gray-700"
          >
            Confirm Password
          </label>

          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);

              if (errors.confirmPassword) {
                setErrors((prev) => ({
                  ...prev,
                  confirmPassword: '',
                }));
              }
            }}
            placeholder="Confirm your password"
            className={`w-full px-4 py-3 border rounded-lg outline-none transition ${
              errors.confirmPassword
                ? 'border-red-500 focus:ring-2 focus:ring-red-100'
                : 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
            }`}
          />

          {errors.confirmPassword && (
            <p className="text-xs text-red-500">
              {errors.confirmPassword}
            </p>
          )}
        </div>

        {/* Supabase error */}
        {errors.form && (
          <p className="text-sm text-red-500 text-center">
            {errors.form}
          </p>
        )}

        {/* Sign Up button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 active:bg-blue-700 font-semibold transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Creating account...' : 'Sign Up'}
        </button>

        {/* Back to Login */}
        <p className="text-sm text-gray-500 text-center">
          Already have an account?{' '}

          <span
            className="text-blue-500 font-semibold cursor-pointer hover:text-blue-700"
            onClick={onBackToLogin}
          >
            Login
          </span>
        </p>

      </form>
    </div>
  );
}

export default SignUp;