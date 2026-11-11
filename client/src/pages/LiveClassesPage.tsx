import React, { useState, useEffect } from 'react';
import API from '../services/api.js';
import { LiveClass } from '../types/index.js';
import { useAuth } from '../context/AuthContext.js';
import { JitsiMeetingModal } from '../components/live/JitsiMeetingModal.js';
import { CheckoutModal } from '../components/payment/CheckoutModal.js';
import {
  Radio,
  Calendar,
  Clock,
  Users,
  Video,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

export const LiveClassesPage: React.FC = () => {
  const { user } = useAuth();
  const [classes, setClasses] = useState<LiveClass[]>([]);
  const [loading, setLoading] = useState(true);

  // Active meeting modal
  const [activeMeetingClass, setActiveMeetingClass] = useState<LiveClass | null>(null);

  // Booking / payment modal
  const [bookingClass, setBookingClass] = useState<LiveClass | null>(null);

  const fetchLiveClasses = async () => {
    setLoading(true);
    try {
      const res = await API.get('/live-classes?status=scheduled');
      if (res.data.success) {
        setClasses(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load live classes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveClasses();
  }, []);

  const handleActionClick = (liveClass: LiveClass) => {
    if (!user) {
      window.location.href = '/login';
      return;
    }

    const userId = user.id;
    const isTeacher = liveClass.teacher?._id === userId || (liveClass.teacher as any)?.id === userId;
    const isEnrolled = liveClass.enrolledLearners?.some(
      (e) => (e.learner as any)?._id === userId || (e.learner as any)?.id === userId
    );

    if (isTeacher || isEnrolled || user.role === 'admin' || liveClass.price === 0) {
      // Authorized to join conference immediately!
      setActiveMeetingClass(liveClass);
    } else {
      // Needs to register / purchase seat
      setBookingClass(liveClass);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-10 text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 text-red-600 text-xs font-bold uppercase tracking-wider mb-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
            Real-Time Interactive Workshops
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Upcoming Live Masterclasses
          </h1>
          <p className="text-sm text-slate-500 mt-2">
            Join small-group live video sessions with real-time feedback, interactive Q&A, and Jitsi high-definition video.
          </p>
        </div>

        {/* Classes List */}
        {loading ? (
          <div className="min-h-[400px] flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : classes.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 shadow-sm max-w-md mx-auto space-y-3">
            <Radio className="w-12 h-12 text-purple-600 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">No scheduled live classes right now</h3>
            <p className="text-xs text-slate-500">
              Check back soon! Teachers regularly schedule new workshops and clinics.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {classes.map((c) => {
              const dateObj = new Date(c.scheduledAt);
              const seatsLeft = Math.max(0, c.maxCapacity - (c.enrolledLearners?.length || 0));

              const isUserEnrolled = user
                ? (c.teacher as any)?._id === user.id ||
                  c.enrolledLearners?.some((e) => (e.learner as any)?._id === user.id)
                : false;

              return (
                <div
                  key={c._id}
                  className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm hover:shadow-xl hover:shadow-purple-500/10 transition duration-300 flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    {/* Header tags */}
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 text-xs font-bold">
                        {c.category?.name || 'Live Class'}
                      </span>
                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                          seatsLeft <= 3
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-emerald-50 text-emerald-700'
                        }`}
                      >
                        {seatsLeft > 0 ? `${seatsLeft} seats left` : 'Sold out'}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 leading-snug">{c.title}</h3>
                    <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">
                      {c.description}
                    </p>

                    {/* Schedule & Timezone */}
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-2 text-xs text-slate-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-purple-600 shrink-0" />
                        <span className="font-semibold text-slate-800">
                          {dateObj.toLocaleDateString([], {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-purple-600 shrink-0" />
                        <span>
                          {dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}{' '}
                          ({Intl.DateTimeFormat().resolvedOptions().timeZone}) • {c.durationMinutes} min
                        </span>
                      </div>
                    </div>

                    {/* Teacher Byline */}
                    <div className="flex items-center gap-3 pt-2">
                      <img
                        src={
                          c.teacher?.avatar ||
                          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300'
                        }
                        alt={c.teacher?.name}
                        className="w-9 h-9 rounded-full object-cover ring-2 ring-purple-100"
                      />
                      <div>
                        <span className="text-xs font-bold text-slate-900 block truncate">
                          {c.teacher?.name}
                        </span>
                        <span className="text-[11px] text-slate-400">Instructor</span>
                      </div>
                    </div>
                  </div>

                  {/* Price & CTA */}
                  <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-bold uppercase">
                        Admission Fee
                      </span>
                      <span className="text-lg font-black text-slate-900">
                        {c.price === 0 ? 'FREE' : `₹${c.price}`}
                      </span>
                    </div>

                    <button
                      onClick={() => handleActionClick(c)}
                      className={`px-5 py-2.5 rounded-xl font-bold text-xs shadow-md transition flex items-center gap-1.5 ${
                        isUserEnrolled
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20'
                          : 'bg-gradient-brand hover:opacity-95 text-white shadow-purple-500/20'
                      }`}
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>{isUserEnrolled ? 'Join Jitsi Room' : c.price === 0 ? 'Register Free' : `Book Seat • ₹${c.price}`}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Jitsi Meeting Conference Modal */}
      {activeMeetingClass && (
        <JitsiMeetingModal
          isOpen={Boolean(activeMeetingClass)}
          onClose={() => setActiveMeetingClass(null)}
          liveClass={activeMeetingClass}
        />
      )}

      {/* Booking / Checkout Modal */}
      {bookingClass && (
        <CheckoutModal
          isOpen={Boolean(bookingClass)}
          onClose={() => setBookingClass(null)}
          itemType="live_class"
          itemId={bookingClass._id}
          itemTitle={bookingClass.title}
          itemPrice={bookingClass.price}
          onSuccess={() => {
            fetchLiveClasses();
            setActiveMeetingClass(bookingClass);
          }}
        />
      )}
    </div>
  );
};

