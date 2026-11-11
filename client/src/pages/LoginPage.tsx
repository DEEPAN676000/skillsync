import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { Sparkles, Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(email, password);
      const from = (location.state as any)?.from?.pathname;
      if (from) {
        navigate(from, { replace: true });
      } else {
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        if (storedUser.role === 'teacher') {
          navigate('/dashboard/teacher');
        } else if (storedUser.role === 'admin') {
          navigate('/dashboard/admin');
        } else {
          navigate('/dashboard/learner');
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-3xl border border-slate-200/80 shadow-xl shadow-purple-500/5">
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-brand flex items-center justify-center text-white shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="text-2xl font-black text-slate-900">
              Skill<span className="text-purple-600">Sync</span>
            </span>
          </Link>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Welcome Back</h2>
          <p className="text-xs text-slate-500">Sign in to access your dashboard, courses, and classes</p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 text-red-600 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Demo Credentials Helper Pill */}
        <div className="p-3.5 rounded-2xl bg-purple-50/70 border border-purple-100 text-[11px] text-purple-900 space-y-1">
          <p className="font-bold flex items-center gap-1 text-purple-700">
            <Sparkles className="w-3.5 h-3.5" /> Quick Demo Logins:
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            <button
              type="button"
              onClick={() => {
                setEmail('david@example.com');
                setPassword('password123');
              }}
              className="px-2 py-1 rounded bg-white text-purple-700 font-bold border border-purple-200 hover:bg-purple-100 transition"
            >
              Learner (David)
            </button>
            <button
              type="button"
              onClick={() => {
                setEmail('elena.violin@skillsync.com');
                setPassword('password123');
              }}
              className="px-2 py-1 rounded bg-white text-purple-700 font-bold border border-purple-200 hover:bg-purple-100 transition"
            >
              Teacher (Elena)
            </button>
            <button
              type="button"
              onClick={() => {
                setEmail('admin@skillsync.com');
                setPassword('admin123');
              }}
              className="px-2 py-1 rounded bg-white text-purple-700 font-bold border border-purple-200 hover:bg-purple-100 transition"
            >
              Admin
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full text-xs sm:text-sm pl-10 pr-3 py-3 rounded-xl border border-slate-200 bg-slate-50 outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-xs font-semibold text-purple-600 hover:text-purple-700"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full text-xs sm:text-sm pl-10 pr-3 py-3 rounded-xl border border-slate-200 bg-slate-50 outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl font-bold text-sm text-white bg-gradient-brand hover:opacity-95 shadow-lg shadow-purple-500/25 transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="text-center text-xs text-slate-500 pt-2">
          Don't have an account yet?{' '}
          <Link to="/register" className="font-bold text-purple-600 hover:text-purple-700">
            Create an Account Free
          </Link>
        </p>
      </div>
    </div>
  );
};

