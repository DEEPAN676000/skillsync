import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Star, ArrowRight, Video, Calendar, Sparkles } from 'lucide-react';
import { TeacherProfile } from '../../types/index.js';
import { Badge } from '../common/Badge.js';
import { StarRating } from '../common/StarRating.js';

interface FeaturedTeachersProps {
  teachers: TeacherProfile[];
}

export const FeaturedTeachers: React.FC<FeaturedTeachersProps> = ({ teachers }) => {
  return (
    <section className="py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" /> Top Mentors
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Learn From Verified Masters
            </h2>
            <p className="text-slate-600 mt-2 text-sm sm:text-base max-w-xl">
              Every instructor is vetted for genuine mastery, teaching pedagogy, and student satisfaction.
            </p>
          </div>
          <Link
            to="/teachers"
            className="mt-4 md:mt-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-brand shadow-md shadow-purple-500/20 hover:opacity-95 transition"
          >
            View all instructors <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {teachers.slice(0, 4).map((profile) => (
            <div
              key={profile._id}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-xl hover:shadow-purple-500/10 hover:-translate-y-1 transition duration-300 flex flex-col overflow-hidden"
            >
              {/* Profile Card Header */}
              <div className="p-6 flex flex-col items-center text-center pb-4 border-b border-slate-100 relative">
                <div className="relative mb-3">
                  <img
                    src={profile.user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300'}
                    alt={profile.user?.name}
                    className="w-20 h-20 rounded-2xl object-cover shadow-md ring-4 ring-purple-50"
                  />
                  {profile.verificationStatus === 'verified' && (
                    <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-1 rounded-full ring-2 ring-white" title="Verified Instructor">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                  )}
                </div>

                <h3 className="font-bold text-slate-900 text-base hover:text-purple-600 transition">
                  <Link to={`/teachers/${profile.user?._id || profile._id}`}>{profile.user?.name}</Link>
                </h3>
                <p className="text-xs text-purple-600 font-semibold mt-0.5 line-clamp-1">
                  {profile.title}
                </p>

                <div className="mt-2.5">
                  <StarRating rating={profile.rating || 5.0} reviewsCount={profile.numReviews} size="sm" />
                </div>
              </div>

              {/* Bio & Skills */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed mb-4">
                    {profile.bio}
                  </p>

                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {profile.skills?.slice(0, 3).map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-lg bg-slate-100 text-[11px] font-medium text-slate-600"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Footer Pricing & CTA */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-slate-400 block font-medium">1-on-1 Rate</span>
                    <span className="text-sm font-bold text-slate-900">₹{profile.hourlyRate}/hr</span>
                  </div>
                  <Link
                    to={`/teachers/${profile.user?._id || profile._id}`}
                    className="px-3.5 py-1.5 rounded-xl bg-purple-50 text-purple-700 text-xs font-bold hover:bg-purple-600 hover:text-white transition"
                  >
                    View Profile
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

