import React, { useState } from 'react';
import { Compass, Calendar, Award, Video, DollarSign, Sparkles, CheckCircle2 } from 'lucide-react';

export const HowItWorks: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'learner' | 'teacher'>('learner');

  return (
    <section className="py-20 bg-gradient-to-b from-slate-50 to-purple-50/30 border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-purple-600">
            How SkillSync Works
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-1 tracking-tight">
            Designed for Learners & Creators
          </h2>
          <p className="text-slate-600 mt-2 text-sm sm:text-base">
            Whether you want to acquire an inspiring new craft or turn your specialized skills into income.
          </p>

          {/* Toggle Tab */}
          <div className="mt-8 inline-flex p-1.5 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <button
              onClick={() => setActiveTab('learner')}
              className={`px-6 py-2.5 rounded-xl font-bold text-sm transition ${
                activeTab === 'learner'
                  ? 'bg-gradient-brand text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              For Learners
            </button>
            <button
              onClick={() => setActiveTab('teacher')}
              className={`px-6 py-2.5 rounded-xl font-bold text-sm transition ${
                activeTab === 'teacher'
                  ? 'bg-gradient-brand text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              For Teachers & Instructors
            </button>
          </div>
        </div>

        {activeTab === 'learner' ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-sm relative hover:border-purple-300 transition">
              <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-black text-lg mb-6 shadow-sm">
                1
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Discover Verified Skills</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Filter by instrument, coding language, dance style, or cuisine. Watch short video showcases to preview teaching style before committing.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-sm relative hover:border-purple-300 transition">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-lg mb-6 shadow-sm">
                2
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Flexible Booking & Video Rooms</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Book on-demand video courses or join interactive live masterclasses powered by seamless Jitsi video conferencing right in your browser.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-sm relative hover:border-purple-300 transition">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black text-lg mb-6 shadow-sm">
                3
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Track Real Mastery</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Complete assignments, pass knowledge-check quizzes, track completion percentages on your dashboard, and leave verified reviews.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-sm relative hover:border-purple-300 transition">
              <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-black text-lg mb-6 shadow-sm">
                1
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Showcase Your Talent</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Upload short skill showcase reels, intro videos, and credentials. Get verified with our teacher verification badge to build instant trust.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-sm relative hover:border-purple-300 transition">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-lg mb-6 shadow-sm">
                2
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Set Your Schedule & Pricing</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Upload structured courses, arrange lesson videos and materials, or schedule recurring live workshops with automated attendee limits.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-sm relative hover:border-purple-300 transition">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black text-lg mb-6 shadow-sm">
                3
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Keep Up to 95% of Earnings</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Receive direct payouts through automated Razorpay settlements with comprehensive analytics on student enrollments and monthly revenues.
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

