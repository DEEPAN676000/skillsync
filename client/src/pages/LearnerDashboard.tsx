import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api.js';
import { useAuth } from '../context/AuthContext.js';
import { LiveClass, Booking, PaymentTransaction, Course } from '../types/index.js';
import { JitsiMeetingModal } from '../components/live/JitsiMeetingModal.js';
import {
  BookOpen,
  Video,
  Clock,
  Calendar,
  Award,
  Bookmark,
  CreditCard,
  Bell,
  Sparkles,
  ArrowRight,
  CheckCircle,
  ExternalLink,
} from 'lucide-react';

export const LearnerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'courses' | 'classes' | 'bookings' | 'saved' | 'payments'>('courses');

  // Live class conference modal
  const [activeMeetingClass, setActiveMeetingClass] = useState<LiveClass | null>(null);

  const fetchDashboardData = async () => {
    try {
      const res = await API.get('/users/learner-dashboard');
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load learner dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const {
    enrolledCourses = [],
    upcomingLiveClasses = [],
    bookings = [],
    payments = [],
    savedCourses = [],
    savedTeachers = [],
    recommendedCourses = [],
    stats = { totalEnrolled: 0, completedCourses: 0, upcomingClassesCount: 0 },
  } = data || {};

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Welcome Banner */}
        <div className="bg-gradient-brand text-white p-6 sm:p-8 rounded-3xl shadow-lg relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <img
              src={user?.avatar}
              alt={user?.name}
              className="w-16 h-16 rounded-2xl object-cover ring-4 ring-white/30 shadow-md"
            />
            <div>
              <span className="text-xs font-bold text-purple-200 uppercase tracking-wider">
                Learner Workspace
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-white">
                Welcome, {user?.name}!
              </h1>
              <p className="text-xs text-purple-100 mt-0.5">
                Continue your learning journey and explore live masterclasses.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/explore"
              className="px-5 py-2.5 rounded-xl bg-white text-purple-900 font-bold text-xs hover:bg-slate-100 shadow-md transition flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4 text-purple-600" /> Discover More Skills
            </Link>
          </div>
        </div>

        {/* Analytics KPI Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-slate-500 font-semibold block uppercase tracking-wider">
                Enrolled Courses
              </span>
              <span className="text-2xl font-black text-slate-900">{stats.totalEnrolled}</span>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-slate-500 font-semibold block uppercase tracking-wider">
                Completed
              </span>
              <span className="text-2xl font-black text-slate-900">{stats.completedCourses}</span>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold">
              <Video className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-slate-500 font-semibold block uppercase tracking-wider">
                Live Sessions
              </span>
              <span className="text-2xl font-black text-slate-900">{stats.upcomingClassesCount}</span>
            </div>
          </div>
        </div>

        {/* Dashboard Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
          {[
            { id: 'courses', label: 'My Enrolled Courses', count: enrolledCourses.length },
            { id: 'classes', label: 'Upcoming Live Classes', count: upcomingLiveClasses.length },
            { id: 'bookings', label: 'Booking History', count: bookings.length },
            { id: 'saved', label: 'Saved Courses & Teachers', count: savedCourses.length + savedTeachers.length },
            { id: 'payments', label: 'Payment Receipts', count: payments.length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold shrink-0 transition flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20'
                  : 'text-slate-600 hover:bg-white hover:text-slate-900'
              }`}
            >
              <span>{tab.label}</span>
              {tab.count > 0 && (
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                    activeTab === tab.id ? 'bg-purple-800 text-white' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab 1: My Courses with Progress Tracker */}
        {activeTab === 'courses' && (
          <div className="space-y-6">
            {enrolledCourses.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 shadow-sm space-y-3">
                <BookOpen className="w-12 h-12 text-purple-600 mx-auto" />
                <h3 className="text-base font-bold text-slate-800">You are not enrolled in any courses yet</h3>
                <p className="text-xs text-slate-500">Explore our skill marketplace to find courses that match your goals.</p>
                <Link
                  to="/explore"
                  className="inline-block mt-2 px-5 py-2.5 rounded-xl bg-gradient-brand text-white text-xs font-bold"
                >
                  Explore Courses
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {enrolledCourses.map((item: any) => (
                  <div
                    key={item.enrollmentId}
                    className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-lg transition"
                  >
                    <div>
                      <div className="relative aspect-[16/10] bg-slate-100">
                        <img
                          src={item.course?.thumbnail}
                          alt={item.course?.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-3 right-3">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold shadow-sm ${
                              item.status === 'completed'
                                ? 'bg-emerald-500 text-white'
                                : 'bg-purple-600 text-white'
                            }`}
                          >
                            {item.status === 'completed' ? 'Completed 🎉' : 'In Progress'}
                          </span>
                        </div>
                      </div>

                      <div className="p-5 space-y-3">
                        <span className="text-[10px] font-bold text-purple-600 uppercase">
                          {item.course?.category?.name}
                        </span>
                        <h3 className="font-bold text-slate-900 text-base line-clamp-2 leading-snug">
                          {item.course?.title}
                        </h3>

                        {/* Progress Bar */}
                        <div className="space-y-1.5 pt-2">
                          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
                            <span>Progress</span>
                            <span className="text-purple-700 font-bold">
                              {item.progress?.percentage || 0}%
                            </span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                            <div
                              className="h-full bg-gradient-brand transition-all duration-500"
                              style={{ width: `${item.progress?.percentage || 0}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-5 pt-0">
                      <Link
                        to={`/learn/${item.course?._id}`}
                        className="w-full py-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs transition flex items-center justify-center gap-1.5"
                      >
                        <span>{item.progress?.percentage > 0 ? 'Continue Learning' : 'Start Course'}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Upcoming Live Classes */}
        {activeTab === 'classes' && (
          <div className="space-y-4">
            {upcomingLiveClasses.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 shadow-sm space-y-3">
                <Video className="w-12 h-12 text-purple-600 mx-auto" />
                <h3 className="text-base font-bold text-slate-800">No registered upcoming live classes</h3>
                <p className="text-xs text-slate-500">Discover scheduled group workshops with interactive Jitsi video.</p>
                <Link
                  to="/live"
                  className="inline-block mt-2 px-5 py-2.5 rounded-xl bg-gradient-brand text-white text-xs font-bold"
                >
                  Browse Live Workshops
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {upcomingLiveClasses.map((cls: LiveClass) => (
                  <div
                    key={cls._id}
                    className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-bold">
                          {cls.category?.name || 'Live Class'}
                        </span>
                        <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                          <CheckCircle className="w-3.5 h-3.5" /> Enrolled
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-slate-900">{cls.title}</h3>
                      <p className="text-xs text-slate-500 line-clamp-2">{cls.description}</p>
                      <div className="p-3 rounded-xl bg-slate-50 text-xs text-slate-600 space-y-1">
                        <p className="font-semibold text-slate-800">
                          📅 {new Date(cls.scheduledAt).toLocaleString()}
                        </p>
                        <p>⏱️ Duration: {cls.durationMinutes} minutes</p>
                        <p>👨‍🏫 Instructor: {cls.teacher?.name}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => setActiveMeetingClass(cls)}
                      className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5"
                    >
                      <Video className="w-4 h-4" /> Enter Live Video Room (Jitsi)
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Bookings */}
        {activeTab === 'bookings' && (
          <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-100 font-bold text-xs text-slate-700 uppercase tracking-wider">
              Booking History
            </div>
            <div className="divide-y divide-slate-100">
              {bookings.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">No booking records found.</div>
              ) : (
                bookings.map((b: Booking) => (
                  <div key={b._id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition">
                    <div>
                      <p className="text-xs font-bold text-slate-900">
                        {b.course?.title || b.type.replace('_', ' ').toUpperCase()}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Teacher: {b.teacher?.name} • Booked on {new Date(b.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-slate-900 block">₹{b.amount}</span>
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          b.status === 'confirmed'
                            ? 'bg-emerald-50 text-emerald-700'
                            : b.status === 'cancelled'
                            ? 'bg-red-50 text-red-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {b.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Tab 4: Saved Courses & Teachers */}
        {activeTab === 'saved' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-3">
                Bookmarked Courses ({savedCourses.length})
              </h3>
              {savedCourses.length === 0 ? (
                <p className="text-xs text-slate-400">No saved courses yet.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {savedCourses.map((c: any) => (
                    <Link
                      key={c._id}
                      to={`/courses/${c.slug || c._id}`}
                      className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-sm hover:border-purple-300 transition flex items-center gap-3"
                    >
                      <img src={c.thumbnail} alt={c.title} className="w-12 h-12 rounded-lg object-cover" />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate">{c.title}</p>
                        <p className="text-[11px] text-purple-600 font-semibold">₹{c.price}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-3">
                Saved Instructors ({savedTeachers.length})
              </h3>
              {savedTeachers.length === 0 ? (
                <p className="text-xs text-slate-400">No saved teachers yet.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {savedTeachers.map((t: any) => (
                    <Link
                      key={t._id}
                      to={`/teachers/${t._id}`}
                      className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-sm hover:border-purple-300 transition flex items-center gap-3"
                    >
                      <img src={t.avatar} alt={t.name} className="w-10 h-10 rounded-full object-cover" />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate">{t.name}</p>
                        <p className="text-[11px] text-slate-500 truncate">{t.bio || 'Instructor'}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 5: Payment Receipts */}
        {activeTab === 'payments' && (
          <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-100 font-bold text-xs text-slate-700 uppercase tracking-wider">
              Transaction Records
            </div>
            <div className="divide-y divide-slate-100">
              {payments.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">No payment receipts found.</div>
              ) : (
                payments.map((p: PaymentTransaction) => (
                  <div key={p._id} className="p-4 flex items-center justify-between text-xs hover:bg-slate-50 transition">
                    <div>
                      <p className="font-bold text-slate-900">Receipt #{p.receipt || p._id.slice(-8)}</p>
                      <p className="text-slate-500 text-[11px] mt-0.5">
                        Order: {p.orderId} • {new Date(p.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-slate-900 block">₹{p.amount}</span>
                      <span className="text-emerald-600 font-bold text-[10px] uppercase">
                        {p.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Jitsi Meeting Modal */}
      {activeMeetingClass && (
        <JitsiMeetingModal
          isOpen={Boolean(activeMeetingClass)}
          onClose={() => setActiveMeetingClass(null)}
          liveClass={activeMeetingClass}
        />
      )}
    </div>
  );
};

