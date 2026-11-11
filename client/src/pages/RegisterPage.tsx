import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { Sparkles, User as UserIcon, Mail, Phone, Lock, Image, ArrowRight, AlertCircle, Check } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [role, setRole] = useState<'learner' | 'teacher'>('learner');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [avatar, setAvatar] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (searchParams.get('role') === 'teacher') {
      setRole('teacher');
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await register({
        name,
        email,
        phone,
        password,
        role,
        avatar: avatar || undefined,
      });

      if (role === 'teacher') {
        navigate('/dashboard/teacher');
      } else {
        navigate('/dashboard/learner');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-md w-full space-y-6 bg-white p-8 sm:p-10 rounded-3xl border border-slate-200/80 shadow-xl shadow-purple-500/5">
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 mb-1">
            <div className="w-10 h-10 rounded-xl bg-gradient-brand flex items-center justify-center text-white shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="text-2xl font-black text-slate-900">
              Skill<span className="text-purple-600">Sync</span>
            </span>
          </Link>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Create Your Account</h2>
          <p className="text-xs text-slate-500">Join SkillSync as a learner or an instructor</p>
        </div>

        {/* Role Selector Tabs */}
        <div className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl bg-slate-100 border border-slate-200">
          <button
            type="button"
            onClick={() => setRole('learner')}
            className={`py-2.5 rounded-xl font-bold text-xs transition flex items-center justify-center gap-1.5 ${
              role === 'learner'
                ? 'bg-white text-purple-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {role === 'learner' && <Check className="w-3.5 h-3.5 text-purple-600" />}
            I want to Learn
          </button>
          <button
            type="button"
            onClick={() => setRole('teacher')}
            className={`py-2.5 rounded-xl font-bold text-xs transition flex items-center justify-center gap-1.5 ${
              role === 'teacher'
                ? 'bg-white text-purple-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {role === 'teacher' && <Check className="w-3.5 h-3.5 text-purple-600" />}
            I want to Teach
          </button>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 text-red-600 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Full Name *
            </label>
            <div className="relative">
              <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Doe"
                className="w-full text-xs sm:text-sm pl-10 pr-3 py-3 rounded-xl border border-slate-200 bg-slate-50 outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Email Address *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jane@example.com"
                className="w-full text-xs sm:text-sm pl-10 pr-3 py-3 rounded-xl border border-slate-200 bg-slate-50 outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Phone Number
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full text-xs sm:text-sm pl-10 pr-3 py-3 rounded-xl border border-slate-200 bg-slate-50 outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Password *
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
                className="w-full text-xs sm:text-sm pl-10 pr-3 py-3 rounded-xl border border-slate-200 bg-slate-50 outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Profile Picture URL (optional)
            </label>
            <div className="relative">
              <Image className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
              <input
                type="url"
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full text-xs sm:text-sm pl-10 pr-3 py-3 rounded-xl border border-slate-200 bg-slate-50 outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl font-bold text-sm text-white bg-gradient-brand hover:opacity-95 shadow-lg shadow-purple-500/25 transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? 'Creating Account...' : `Join as ${role === 'teacher' ? 'Teacher' : 'Learner'}`}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="text-center text-xs text-slate-500 pt-2">
          Already registered?{' '}
          <Link to="/login" className="font-bold text-purple-600 hover:text-purple-700">
            Sign In here
          </Link>
        </p>
      </div>
    </div>
  );
};

