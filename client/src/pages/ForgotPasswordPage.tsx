import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api.js';
import { Sparkles, Mail, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [resetTokenDev, setResetTokenDev] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await API.post('/auth/forgot-password', { email });
      if (res.data.success) {
        setSent(true);
        if (res.data.resetToken) {
          setResetTokenDev(res.data.resetToken);
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to process request');
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
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Forgot Password</h2>
          <p className="text-xs text-slate-500">
            Enter your registered email address and we'll send a secure password reset link.
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-50 text-red-600 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {sent ? (
          <div className="text-center space-y-4 py-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Check Your Inbox</h3>
            <p className="text-xs text-slate-500">
              We have dispatched a password reset link to <strong className="text-slate-800">{email}</strong>.
            </p>

            {resetTokenDev && (
              <div className="p-3 rounded-xl bg-purple-50 text-purple-700 text-xs font-medium text-left">
                <span className="font-bold block mb-1">Development Shortcut:</span>
                <Link
                  to={`/reset-password/${resetTokenDev}`}
                  className="underline break-all font-mono"
                >
                  Click to proceed directly to Reset Password screen
                </Link>
              </div>
            )}

            <Link
              to="/login"
              className="inline-block mt-4 text-xs font-bold text-purple-600 hover:text-purple-700"
            >
              Return to Login
            </Link>
          </div>
        ) : (
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
                  className="w-full text-xs sm:text-sm pl-10 pr-3 py-3 rounded-xl border border-slate-200 bg-slate-50 outline-none focus:ring-2 focus:ring-purple-500/20"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-bold text-sm text-white bg-gradient-brand hover:opacity-95 shadow-lg shadow-purple-500/25 transition disabled:opacity-50"
            >
              {loading ? 'Sending link...' : 'Send Reset Link'}
            </button>

            <p className="text-center text-xs text-slate-500 pt-2">
              Remembered your password?{' '}
              <Link to="/login" className="font-bold text-purple-600 hover:text-purple-700">
                Log In
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
};

