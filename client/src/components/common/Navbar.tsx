import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Compass,
  Video,
  Radio,
  Users,
  Sparkles,
  Menu,
  X,
  LogOut,
  LayoutDashboard,
  User as UserIcon,
  ChevronDown,
  ShieldAlert,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { NotificationBell } from './NotificationBell.js';
import { Badge } from './Badge.js';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/');
    setUserDropdownOpen(false);
  };

  const getDashboardLink = () => {
    if (!user) return '/login';
    if (user.role === 'admin') return '/dashboard/admin';
    if (user.role === 'teacher') return '/dashboard/teacher';
    return '/dashboard/learner';
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/85 backdrop-blur-md border-b border-slate-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-brand flex items-center justify-center text-white shadow-md shadow-purple-500/20 group-hover:scale-105 transition transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 group-hover:text-purple-700 transition">
                Skill<span className="text-gradient-brand">Sync</span>
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            <Link
              to="/explore"
              className={`px-3 py-2 rounded-xl text-sm font-semibold transition ${
                isActive('/explore')
                  ? 'text-purple-600 bg-purple-50'
                  : 'text-slate-600 hover:text-purple-600 hover:bg-slate-50'
              }`}
            >
              Explore Skills
            </Link>
            <Link
              to="/teachers"
              className={`px-3 py-2 rounded-xl text-sm font-semibold transition ${
                isActive('/teachers')
                  ? 'text-purple-600 bg-purple-50'
                  : 'text-slate-600 hover:text-purple-600 hover:bg-slate-50'
              }`}
            >
              Teachers
            </Link>
            <Link
              to="/showcase"
              className={`px-3 py-2 rounded-xl text-sm font-semibold transition flex items-center gap-1.5 ${
                isActive('/showcase')
                  ? 'text-purple-600 bg-purple-50'
                  : 'text-slate-600 hover:text-purple-600 hover:bg-slate-50'
              }`}
            >
              <Video className="w-4 h-4 text-purple-500" />
              Showcase Feed
            </Link>
            <Link
              to="/live"
              className={`px-3 py-2 rounded-xl text-sm font-semibold transition flex items-center gap-1.5 ${
                isActive('/live')
                  ? 'text-purple-600 bg-purple-50'
                  : 'text-slate-600 hover:text-purple-600 hover:bg-slate-50'
              }`}
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
              Live Classes
            </Link>
          </nav>

          {/* Action CTAs & Auth Controls */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <NotificationBell />

                <Link
                  to={getDashboardLink()}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 transition"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>

                {/* User Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition"
                  >
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-9 h-9 rounded-full object-cover ring-2 ring-purple-200"
                    />
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  </button>

                  {userDropdownOpen && (
                    <div
                      className="absolute right-0 mt-2 w-56 rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 z-50 py-2 border border-slate-100 divide-y divide-slate-100"
                      onMouseLeave={() => setUserDropdownOpen(false)}
                    >
                      <div className="px-4 py-2.5">
                        <p className="text-sm font-bold text-slate-800 truncate">{user.name}</p>
                        <p className="text-xs text-slate-500 truncate">{user.email}</p>
                        <div className="mt-1.5">
                          <Badge
                            type={user.role === 'admin' ? 'pro' : user.role === 'teacher' ? 'premium' : 'neutral'}
                            text={user.role.toUpperCase()}
                            size="sm"
                          />
                        </div>
                      </div>

                      <div className="py-1">
                        <Link
                          to={getDashboardLink()}
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-purple-50 hover:text-purple-700 transition"
                        >
                          <LayoutDashboard className="w-4 h-4 text-slate-400" />
                          Dashboard
                        </Link>
                        {user.role === 'teacher' && (
                          <Link
                            to={`/teachers/${user.id}`}
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-purple-50 hover:text-purple-700 transition"
                          >
                            <UserIcon className="w-4 h-4 text-slate-400" />
                            View Public Profile
                          </Link>
                        )}
                      </div>

                      <div className="py-1">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-purple-700 hover:bg-purple-50/60 rounded-xl transition"
                >
                  Log In
                </Link>
                <Link
                  to="/register?role=teacher"
                  className="hidden lg:inline-flex px-4 py-2 text-sm font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-xl transition"
                >
                  Become a Teacher
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-semibold text-white bg-gradient-brand hover:opacity-95 shadow-md shadow-purple-500/20 rounded-xl transition"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            {user && <NotificationBell />}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 pt-3 pb-6 space-y-2 shadow-xl animate-in slide-in-from-top-4">
          <Link
            to="/explore"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2.5 rounded-xl font-medium text-slate-700 hover:bg-purple-50 hover:text-purple-700"
          >
            Explore Skills
          </Link>
          <Link
            to="/teachers"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2.5 rounded-xl font-medium text-slate-700 hover:bg-purple-50 hover:text-purple-700"
          >
            Find Teachers
          </Link>
          <Link
            to="/showcase"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2.5 rounded-xl font-medium text-slate-700 hover:bg-purple-50 hover:text-purple-700"
          >
            Showcase Video Feed
          </Link>
          <Link
            to="/live"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2.5 rounded-xl font-medium text-slate-700 hover:bg-purple-50 hover:text-purple-700"
          >
            Live Classes
          </Link>

          {user ? (
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <Link
                to={getDashboardLink()}
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-white bg-gradient-brand shadow-sm"
              >
                <LayoutDashboard className="w-4 h-4" />
                Go to Dashboard
              </Link>
              <button
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-red-600 bg-red-50 hover:bg-red-100"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          ) : (
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full block text-center py-2.5 rounded-xl font-semibold text-slate-700 border border-slate-200"
              >
                Log In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full block text-center py-2.5 rounded-xl font-semibold text-white bg-gradient-brand"
              >
                Get Started Free
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

