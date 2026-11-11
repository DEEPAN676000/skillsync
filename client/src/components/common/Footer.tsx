import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Heart, Mail, Shield, CheckCircle } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-brand flex items-center justify-center text-white shadow-md">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="text-2xl font-black text-white">
                Skill<span className="text-purple-400">Sync</span>
              </span>
            </Link>
            <p className="text-slate-400 text-sm max-w-sm leading-relaxed">
              "Discover Skills. Share Talent. Grow Together."
              SkillSync is the premier two-way skill-sharing marketplace empowering teachers to monetize talent and learners to master lifelong crafts with flexibility.
            </p>
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <Shield className="w-4 h-4 text-emerald-400" /> Verified Teachers
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-purple-400" /> Secure Payments
              </span>
            </div>
          </div>

          {/* Explore Skills */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Explore Categories
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/explore?category=Music" className="hover:text-purple-400 transition">
                  Music & Instruments
                </Link>
              </li>
              <li>
                <Link to="/explore?category=Programming" className="hover:text-purple-400 transition">
                  Programming & AI
                </Link>
              </li>
              <li>
                <Link to="/explore?category=Dance" className="hover:text-purple-400 transition">
                  Dance & Movement
                </Link>
              </li>
              <li>
                <Link to="/explore?category=Cooking" className="hover:text-purple-400 transition">
                  Culinary Arts & Baking
                </Link>
              </li>
              <li>
                <Link to="/explore?category=Fitness" className="hover:text-purple-400 transition">
                  Fitness & Yoga
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Platform
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/explore" className="hover:text-purple-400 transition">
                  Find Courses
                </Link>
              </li>
              <li>
                <Link to="/teachers" className="hover:text-purple-400 transition">
                  Verified Instructors
                </Link>
              </li>
              <li>
                <Link to="/showcase" className="hover:text-purple-400 transition">
                  Showcase Reels
                </Link>
              </li>
              <li>
                <Link to="/live" className="hover:text-purple-400 transition">
                  Live Workshops
                </Link>
              </li>
              <li>
                <Link to="/register?role=teacher" className="hover:text-purple-400 transition">
                  Teach on SkillSync
                </Link>
              </li>
            </ul>
          </div>

          {/* Trust & Support */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Trust & Security
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li>Razorpay Verified Checkouts</li>
              <li>Verified Student Reviews</li>
              <li>Jitsi Encrypted Video Rooms</li>
              <li>100% Refund Protection</li>
              <li className="pt-2 text-xs">
                Email: support@skillsync.com
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} SkillSync Inc. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built with <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" /> for instructors and learners worldwide.
          </p>
        </div>
      </div>
    </footer>
  );
};

