import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, Sparkles, ArrowRight, Play, ShieldCheck, Users, Star, Award } from 'lucide-react';

export const Hero: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/explore?search=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      navigate('/explore');
    }
  };

  return (
    <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 bg-gradient-to-b from-purple-50/60 via-white to-slate-50">
      {/* Background Decorative Blobs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-tr from-purple-300/20 via-blue-200/20 to-pink-200/20 blur-3xl -z-10 rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto space-y-6">
          {/* Top Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-purple-200/80 shadow-sm text-xs font-semibold text-purple-700 animate-in fade-in">
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span>The Two-Way Skill-Sharing Marketplace</span>
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
            <span className="text-slate-500 font-normal">Learn or Teach on Your Terms</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 tracking-tight leading-[1.15]">
            Discover Skills. <br className="hidden sm:inline" />
            <span className="text-gradient-brand">Share Talent.</span>{' '}
            <br className="hidden sm:inline" />
            Grow Together.
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg md:text-xl text-slate-600 max-w-2xl mx-auto font-normal leading-relaxed">
            Connect with passionate, verified instructors for 1-on-1 sessions, live group masterclasses, and on-demand video courses. Learn what you love, at your pace and budget.
          </p>

          {/* Search Box */}
          <form
            onSubmit={handleSearch}
            className="max-w-2xl mx-auto relative flex items-center shadow-xl shadow-purple-500/10 rounded-2xl bg-white border border-slate-200/80 p-2 sm:p-2.5 transition focus-within:ring-4 focus-within:ring-purple-500/10 focus-within:border-purple-500"
          >
            <div className="pl-3 pr-2 text-slate-400">
              <Search className="w-5 h-5 text-purple-600" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search skills (e.g. Classical Violin, React, Kathak, Sourdough Bread)..."
              className="w-full text-sm sm:text-base text-slate-800 placeholder-slate-400 bg-transparent outline-none pr-3"
            />
            <button
              type="submit"
              className="px-5 py-3 rounded-xl bg-gradient-brand text-white font-semibold text-sm hover:opacity-95 shadow-md shadow-purple-500/25 flex items-center gap-1.5 shrink-0 transition"
            >
              Explore <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Hero CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              to="/explore"
              className="px-6 py-3.5 rounded-xl font-bold text-sm sm:text-base text-white bg-gradient-brand shadow-lg shadow-purple-600/25 hover:shadow-purple-600/40 hover:-translate-y-0.5 transition"
            >
              Explore Skills
            </Link>
            <Link
              to="/register?role=teacher"
              className="px-6 py-3.5 rounded-xl font-bold text-sm sm:text-base text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200/60 hover:-translate-y-0.5 transition"
            >
              Become a Teacher
            </Link>
            <Link
              to="/showcase"
              className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl font-semibold text-sm sm:text-base text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition shadow-sm"
            >
              <Play className="w-4 h-4 text-purple-600 fill-purple-600" />
              Watch Showcase Reels
            </Link>
          </div>

          {/* Trust Highlights */}
          <div className="pt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto text-left">
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white/70 border border-slate-100 shadow-sm">
              <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Verified Teachers</p>
                <p className="text-[11px] text-slate-500">Screened credentials</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white/70 border border-slate-100 shadow-sm">
              <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">4.9 / 5 Rating</p>
                <p className="text-[11px] text-slate-500">From verified learners</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white/70 border border-slate-100 shadow-sm">
              <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                <Play className="w-5 h-5 fill-purple-600 text-purple-600" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Live & Recorded</p>
                <p className="text-[11px] text-slate-500">Learn at your pace</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white/70 border border-slate-100 shadow-sm">
              <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Secure Payments</p>
                <p className="text-[11px] text-slate-500">Razorpay verified</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

