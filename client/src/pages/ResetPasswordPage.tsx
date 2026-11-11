import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import API from '../services/api.js';
import { Sparkles, Lock, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';

export const ResetPasswordPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await API.post(`/auth/reset-password/${token}`, { password });
      if (res.data.success) {
        setSuccess(true);
        if (res.data.token) {
          localStorage.setItem('token', res.data.token);
        }
        setTimeout(() => {
          navigate('/dashboard/learner');
        }, 2000);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid or expired reset token');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 bg-slate-50">
      <div className="max-w-md w-full bg-white p-8 sm:p-10 rounded-3xl border border-slate-200/80 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-brand flex items-center justify-center text-white mx-auto shadow-md">
            <Sparkles className="w-5 h-5" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Set New Password</h2>
          <p className="text-xs text-slate-500">
            Please choose a strong password with at least 6 characters.
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-50 text-red-600 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="text-center space-y-3 py-6">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center animate-bounce">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Password Reset Successfully!</h3>
            <p className="text-xs text-slate-500">You are now logged in. Redirecting to your dashboard...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                New Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full text-xs sm:text-sm pl-10 pr-3 py-3 rounded-xl border border-slate-200 bg-slate-50 outline-none focus:ring-2 focus:ring-purple-500/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  className="w-full text-xs sm:text-sm pl-10 pr-3 py-3 rounded-xl border border-slate-200 bg-slate-50 outline-none focus:ring-2 focus:ring-purple-500/20"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-bold text-sm text-white bg-gradient-brand hover:opacity-95 shadow-lg shadow-purple-500/25 transition disabled:opacity-50"
            >
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

