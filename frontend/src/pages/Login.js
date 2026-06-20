import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { FaEnvelope, FaLock, FaGoogle } from 'react-icons/fa';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const clearError = () => setError('');

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    clearError();

    if (!email.trim() || !password) {
      setError('Email and password are required.');
      return;
    }

    setLoading(true);
    try {
      const result = await login(email, password);
      if (result.success) {
        redirectAfterLogin(result.user);
      } else {
        setError(result.error || 'Invalid email or password.');
      }
    } catch (err) {
      setError('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    clearError();
    if (typeof loginWithGoogle !== 'function') {
      setError('Google sign-in is not available yet.');
      return;
    }
    setLoading(true);
    try {
      const result = await loginWithGoogle();
      if (result.success) {
        redirectAfterLogin(result.user);
      } else {
        setError(result.error || 'Google sign-in failed.');
      }
    } catch (err) {
      setError('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const redirectAfterLogin = (user) => {
    if (!user || !user.orgId) {
      navigate('/org-setup', { replace: true });
    } else {
      navigate(`/${user.orgId}/dashboard`, { replace: true });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-2xl shadow-2xl border border-neutral-100 p-6 sm:p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight">
              Maniesta Campus OS
            </h1>
            <p className="text-neutral-500 mt-2 text-sm">
              Sign in to your campus portal
            </p>
          </div>

          {/* Error alert */}
          {error && (
            <div
              className="mb-5 bg-danger-50 border border-danger-200 text-danger-700 px-4 py-3 rounded-lg text-sm"
              role="alert"
            >
              {error}
            </div>
          )}

          {/* Email / Password form */}
          <form onSubmit={handleEmailLogin} noValidate>
            <div className="mb-4">
              <label htmlFor="login-email" className="block text-sm font-medium text-neutral-700 mb-1.5">
                Email
              </label>
              <div className="relative">
                <FaEnvelope
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400"
                  aria-hidden="true"
                />
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    clearError();
                  }}
                  className="w-full pl-10 pr-4 py-2.5 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition"
                  placeholder="you@example.com"
                  required
                  aria-required="true"
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="mb-6">
              <label htmlFor="login-password" className="block text-sm font-medium text-neutral-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <FaLock
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400"
                  aria-hidden="true"
                />
                <input
                  id="login-password"
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    clearError();
                  }}
                  className="w-full pl-10 pr-4 py-2.5 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition"
                  placeholder="••••••••"
                  required
                  aria-required="true"
                  autoComplete="current-password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 text-sm font-semibold mb-4"
            >
              {loading ? 'Signing in...' : 'Sign in with Email'}
            </button>
          </form>

          {/* Forgot password */}
          <div className="text-center mb-5">
            <button
              type="button"
              onClick={() =>
                alert('Password reset is not yet available. Contact your administrator.')
              }
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              Forgot password?
            </button>
          </div>

          {/* Divider */}
          <div className="relative mb-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-neutral-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-white text-neutral-400 text-xs font-medium">OR</span>
            </div>
          </div>

          {/* Google sign‑in */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading || typeof loginWithGoogle !== 'function'}
            className="w-full flex items-center justify-center gap-2.5 bg-white border border-neutral-300 text-neutral-700 py-2.5 rounded-lg text-sm font-medium hover:bg-neutral-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            title={
              typeof loginWithGoogle !== 'function'
                ? 'Google sign-in is not yet configured'
                : 'Sign in with Google'
            }
          >
            <FaGoogle className="text-red-500 text-lg" />
            <span>Continue with Google</span>
          </button>

          {/* Help text */}
          <p className="mt-6 text-center text-xs text-neutral-400">
            Contact your institute administrator if you need an account.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;