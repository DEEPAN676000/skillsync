import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api.js';
import { useAuth } from '../context/AuthContext.js';
import { Course, LiveClass, Booking, Category } from '../types/index.js';
import { JitsiMeetingModal } from '../components/live/JitsiMeetingModal.js';
import { VideoUploadModal } from '../components/video/VideoUploadModal.js';
import { SubscriptionModal } from '../components/payment/SubscriptionModal.js';
import {
  DollarSign,
  Users,
  BookOpen,
  Star,
  Plus,
  Video,
  Calendar,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Sparkles,
  Zap,
} from 'lucide-react';

export const TeacherDashboard: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'courses' | 'classes' | 'bookings' | 'profile' | 'verification'>('overview');

  // Modals
  const [showCreateCourseModal, setShowCreateCourseModal] = useState(false);
  const [showCreateClassModal, setShowCreateClassModal] = useState(false);
  const [showUploadVideoModal, setShowUploadVideoModal] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [activeLiveMeeting, setActiveLiveMeeting] = useState<LiveClass | null>(null);

  // Add lesson to course modal
  const [selectedCourseForLesson, setSelectedCourseForLesson] = useState<Course | null>(null);
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonDuration, setLessonDuration] = useState(15);
  const [lessonVideoUrl, setLessonVideoUrl] = useState('');
  const [lessonContent, setLessonContent] = useState('');
  const [isLessonPreview, setIsLessonPreview] = useState(false);
  const [addingLesson, setAddingLesson] = useState(false);

  // New Course Form State
  const [newCourseTitle, setNewCourseTitle] = useState('');
  const [newCourseDesc, setNewCourseDesc] = useState('');
  const [newCourseCat, setNewCourseCat] = useState('');
  const [newCoursePrice, setNewCoursePrice] = useState('999');
  const [newCourseDifficulty, setNewCourseDifficulty] = useState('beginner');
  const [newCourseThumbnail, setNewCourseThumbnail] = useState('');
  const [creatingCourse, setCreatingCourse] = useState(false);

  // New Live Class Form State
  const [classTitle, setClassTitle] = useState('');
  const [classDesc, setClassDesc] = useState('');
  const [classCat, setClassCat] = useState('');
  const [classTime, setClassTime] = useState('');
  const [classDuration, setClassDuration] = useState('60');
  const [classPrice, setClassPrice] = useState('499');
  const [classCapacity, setClassCapacity] = useState('15');
  const [schedulingClass, setSchedulingClass] = useState(false);

  // Profile Edit State
  const [profileTitle, setProfileTitle] = useState('');
  const [profileBio, setProfileBio] = useState('');
  const [profileSkills, setProfileSkills] = useState('');
  const [profileRate, setProfileRate] = useState('500');
  const [savingProfile, setSavingProfile] = useState(false);

  // Verification request form state
  const [verificationNote, setVerificationNote] = useState('');
  const [verificationDocUrl, setVerificationDocUrl] = useState('');
  const [submittingVerification, setSubmittingVerification] = useState(false);

  const fetchDashboard = async () => {
    try {
      const [dashRes, catRes] = await Promise.all([
        API.get('/users/teacher-dashboard'),
        API.get('/categories'),
      ]);

      if (dashRes.data.success) {
        setData(dashRes.data.data);
        const p = dashRes.data.data.profile;
        if (p) {
          setProfileTitle(p.title || '');
          setProfileBio(p.bio || '');
          setProfileSkills(p.skills?.join(', ') || '');
          setProfileRate(String(p.hourlyRate || 500));
        }
      }

      if (catRes.data.success) {
        setCategories(catRes.data.data);
        if (catRes.data.data.length > 0) {
          setNewCourseCat(catRes.data.data[0]._id);
          setClassCat(catRes.data.data[0]._id);
        }
      }
    } catch (err) {
      console.error('Failed to load teacher dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingCourse(true);
    try {
      const res = await API.post('/courses', {
        title: newCourseTitle,
        description: newCourseDesc,
        category: newCourseCat,
        price: Number(newCoursePrice) || 0,
        difficulty: newCourseDifficulty,
        thumbnail:
          newCourseThumbnail ||
          'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=600',
      });
      if (res.data.success) {
        setShowCreateCourseModal(false);
        setNewCourseTitle('');
        setNewCourseDesc('');
        fetchDashboard();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create course');
    } finally {
      setCreatingCourse(false);
    }
  };

  const handleAddLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourseForLesson) return;
    setAddingLesson(true);
    try {
      const res = await API.post(`/courses/${selectedCourseForLesson._id}/lessons`, {
        title: lessonTitle,
        durationMinutes: Number(lessonDuration) || 15,
        videoUrl: lessonVideoUrl,
        content: lessonContent,
        isFreePreview: isLessonPreview,
      });
      if (res.data.success) {
        setSelectedCourseForLesson(null);
        setLessonTitle('');
        setLessonVideoUrl('');
        setLessonContent('');
        fetchDashboard();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to add lesson');
    } finally {
      setAddingLesson(false);
    }
  };

  const handleScheduleClass = async (e: React.FormEvent) => {
    e.preventDefault();
    setSchedulingClass(true);
    try {
      const res = await API.post('/live-classes', {
        title: classTitle,
        description: classDesc,
        category: classCat,
        scheduledAt: classTime,
        durationMinutes: Number(classDuration) || 60,
        price: Number(classPrice) || 0,
        maxCapacity: Number(classCapacity) || 15,
      });
      if (res.data.success) {
        setShowCreateClassModal(false);
        setClassTitle('');
        setClassDesc('');
        fetchDashboard();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to schedule live class');
    } finally {
      setSchedulingClass(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const skillsArray = profileSkills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const res = await API.put('/teachers/profile', {
        title: profileTitle,
        bio: profileBio,
        skills: skillsArray,
        hourlyRate: Number(profileRate) || 500,
      });
      if (res.data.success) {
        alert('Teacher profile updated successfully!');
        fetchDashboard();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to save profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleVerificationRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingVerification(true);
    try {
      const res = await API.post('/teachers/verify-request', {
        note: verificationNote,
        documents: verificationDocUrl
          ? [{ title: 'Certificate/Credential Document', fileUrl: verificationDocUrl }]
          : [],
      });
      if (res.data.success) {
        alert('Verification request submitted for admin review!');
        fetchDashboard();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to submit verification request');
    } finally {
      setSubmittingVerification(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const {
    profile,
    courses = [],
    liveClasses = [],
    bookings = [],
    stats = {
      totalEarnings: 0,
      monthlyEarnings: 0,
      totalStudents: 0,
      activeCoursesCount: 0,
      avgRating: 5.0,
      totalReviews: 0,
      totalBookingsCount: 0,
    },
  } = data || {};

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Top Header Card */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={user?.avatar}
                alt={user?.name}
                className="w-16 h-16 rounded-2xl object-cover ring-4 ring-purple-100 shadow-md"
              />
              {profile?.verificationStatus === 'verified' && (
                <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-1 rounded-full ring-2 ring-white">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-slate-900">{user?.name}</h1>
                <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-700 text-xs font-bold uppercase">
                  {profile?.subscriptionTier || 'Basic'} Plan
                </span>
                {profile?.verificationStatus === 'verified' ? (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-200">
                    Verified
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[11px] font-bold border border-amber-200">
                    {profile?.verificationStatus === 'pending' ? 'Verification Pending' : 'Unverified'}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">{profile?.title || 'Instructor'}</p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowSubscriptionModal(true)}
              className="px-4 py-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs transition flex items-center gap-1.5"
            >
              <Zap className="w-4 h-4 text-purple-600" /> Subscription Plan
            </button>
            <button
              onClick={() => setShowUploadVideoModal(true)}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition flex items-center gap-1.5"
            >
              <Video className="w-4 h-4 text-purple-600" /> Upload Reel
            </button>
            <button
              onClick={() => setShowCreateCourseModal(true)}
              className="px-4 py-2.5 rounded-xl bg-gradient-brand text-white font-bold text-xs shadow-md shadow-purple-500/20 hover:opacity-95 transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Create Course
            </button>
          </div>
        </div>

        {/* Database-Calculated KPI Statistics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">Total Earnings</span>
              <DollarSign className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900">
              ₹{stats.totalEarnings.toLocaleString()}
            </div>
            <p className="text-[11px] text-emerald-600 font-semibold">
              ₹{stats.monthlyEarnings.toLocaleString()} this month
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">Total Students</span>
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900">
              {stats.totalStudents}
            </div>
            <p className="text-[11px] text-slate-500">Across all courses & sessions</p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">Active Courses</span>
              <BookOpen className="w-5 h-5 text-purple-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900">
              {stats.activeCoursesCount}
            </div>
            <p className="text-[11px] text-slate-500">Published on marketplace</p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">Rating & Reviews</span>
              <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900">
              {stats.avgRating.toFixed(1)} ★
            </div>
            <p className="text-[11px] text-slate-500">{stats.totalReviews} verified reviews</p>
          </div>
        </div>

        {/* Dashboard Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview & Activity' },
            { id: 'courses', label: `My Courses (${courses.length})` },
            { id: 'classes', label: `Live Classes (${liveClasses.length})` },
            { id: 'bookings', label: `Student Bookings (${bookings.length})` },
            { id: 'profile', label: 'Manage Profile & Rate' },
            { id: 'verification', label: 'Teacher Verification' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold shrink-0 transition ${
                activeTab === tab.id
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20'
                  : 'text-slate-600 hover:bg-white hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-slate-900">Recent Bookings & Students</h3>
                  <button onClick={() => setActiveTab('bookings')} className="text-xs text-purple-600 font-bold">
                    View All
                  </button>
                </div>
                {bookings.length === 0 ? (
                  <p className="text-xs text-slate-400 py-6 text-center">No student bookings yet.</p>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {bookings.slice(0, 5).map((b: Booking) => (
                      <div key={b._id} className="py-3 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-3">
                          <img
                            src={b.learner?.avatar}
                            alt={b.learner?.name}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                          <div>
                            <p className="font-bold text-slate-900">{b.learner?.name}</p>
                            <p className="text-slate-500 text-[11px]">
                              {b.course?.title || b.type.replace('_', ' ')}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-slate-900 block">₹{b.amount}</span>
                          <span className="text-[10px] text-emerald-600 font-bold uppercase">{b.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions & Subscription Card */}
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-purple-900 to-indigo-950 text-white p-6 rounded-2xl shadow-lg space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-purple-300 uppercase">Subscription Status</span>
                  <span className="px-2 py-0.5 rounded-full bg-purple-500/30 text-white text-[11px] font-bold">
                    {profile?.subscriptionTier?.toUpperCase()}
                  </span>
                </div>
                <div>
                  <h4 className="text-lg font-bold">Monetize Your Craft</h4>
                  <p className="text-xs text-purple-200 mt-1 leading-relaxed">
                    Enjoy up to 50 courses, priority search matching, and the lowest 5% platform fee with PRO.
                  </p>
                </div>
                <button
                  onClick={() => setShowSubscriptionModal(true)}
                  className="w-full py-2.5 rounded-xl bg-white text-purple-950 font-bold text-xs hover:bg-slate-100 shadow-md transition"
                >
                  Manage / Upgrade Plan
                </button>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700">Quick Shortcuts</h4>
                <div className="space-y-2">
                  <button
                    onClick={() => setShowCreateClassModal(true)}
                    className="w-full text-left p-3 rounded-xl bg-slate-50 hover:bg-purple-50 text-xs font-semibold text-slate-700 hover:text-purple-700 border border-slate-100 transition flex items-center justify-between"
                  >
                    <span>Schedule Live Workshop</span>
                    <Calendar className="w-4 h-4 text-purple-600" />
                  </button>
                  <Link
                    to={`/teachers/${user?.id}`}
                    className="w-full text-left p-3 rounded-xl bg-slate-50 hover:bg-purple-50 text-xs font-semibold text-slate-700 hover:text-purple-700 border border-slate-100 transition flex items-center justify-between"
                  >
                    <span>View Public Profile</span>
                    <ExternalLink className="w-4 h-4 text-purple-600" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Courses Management & Add Lessons */}
        {activeTab === 'courses' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-slate-900">Your Masterclasses & Courses</h3>
                <p className="text-xs text-slate-500">Create curriculums, organize video lessons, and attach learning materials.</p>
              </div>
              <button
                onClick={() => setShowCreateCourseModal(true)}
                className="px-4 py-2 rounded-xl bg-gradient-brand text-white text-xs font-bold shadow-md"
              >
                + New Course
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((c: Course) => (
                <div
                  key={c._id}
                  className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col justify-between"
                >
                  <div>
                    <img src={c.thumbnail} alt={c.title} className="w-full aspect-[16/10] object-cover" />
                    <div className="p-5 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-purple-600 uppercase">
                          {c.category?.name}
                        </span>
                        <span className="font-bold text-slate-900 text-xs">₹{c.price}</span>
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm leading-snug">{c.title}</h4>
                      <p className="text-xs text-slate-500 line-clamp-2">{c.description}</p>
                      <div className="pt-2 flex items-center justify-between text-xs text-slate-400">
                        <span>{c.lessonsCount || 0} lessons</span>
                        <span>{c.enrolledCount || 0} students</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 pt-0 flex items-center gap-2">
                    <button
                      onClick={() => setSelectedCourseForLesson(c)}
                      className="flex-1 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold transition"
                    >
                      + Add Lesson
                    </button>
                    <Link
                      to={`/courses/${c.slug || c._id}`}
                      className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
                      title="Preview course"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Live Classes Management */}
        {activeTab === 'classes' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-slate-900">Live Video Classes</h3>
                <p className="text-xs text-slate-500">Host interactive real-time classes powered by Jitsi conferencing.</p>
              </div>
              <button
                onClick={() => setShowCreateClassModal(true)}
                className="px-4 py-2 rounded-xl bg-gradient-brand text-white text-xs font-bold shadow-md"
              >
                + Schedule Live Class
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {liveClasses.map((cls: LiveClass) => (
                <div
                  key={cls._id}
                  className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full">
                        {cls.category?.name || 'Class'}
                      </span>
                      <span className="text-xs font-bold text-slate-800">
                        {cls.enrolledLearners?.length || 0} / {cls.maxCapacity} Enrolled
                      </span>
                    </div>
                    <h4 className="text-base font-bold text-slate-900">{cls.title}</h4>
                    <p className="text-xs text-slate-500">{cls.description}</p>
                    <div className="p-3 rounded-xl bg-slate-50 text-xs text-slate-600">
                      <p className="font-semibold text-slate-800">📅 {new Date(cls.scheduledAt).toLocaleString()}</p>
                      <p>⏱️ Duration: {cls.durationMinutes} min • Admission: ₹{cls.price}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveLiveMeeting(cls)}
                    className="w-full py-2.5 rounded-xl bg-gradient-brand text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5"
                  >
                    <Video className="w-4 h-4" /> Start / Join Room (Jitsi)
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Student Bookings */}
        {activeTab === 'bookings' && (
          <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-100 font-bold text-xs text-slate-700 uppercase tracking-wider">
              Student Bookings & Enrollment History
            </div>
            <div className="divide-y divide-slate-100">
              {bookings.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">No student bookings yet.</div>
              ) : (
                bookings.map((b: Booking) => (
                  <div key={b._id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition">
                    <div className="flex items-center gap-3">
                      <img src={b.learner?.avatar} alt={b.learner?.name} className="w-9 h-9 rounded-full object-cover" />
                      <div>
                        <p className="text-xs font-bold text-slate-900">{b.learner?.name}</p>
                        <p className="text-[11px] text-slate-500">{b.learner?.email} • {b.course?.title || b.type}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-slate-900 block">₹{b.amount}</span>
                      <span className="text-[10px] font-bold text-emerald-600 uppercase">{b.status}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Tab 5: Manage Profile & Rate */}
        {activeTab === 'profile' && (
          <div className="max-w-2xl bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Edit Teaching Profile</h3>
              <p className="text-xs text-slate-500">Update your public headline, biography, skills tags, and 1-on-1 hourly rate.</p>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Professional Title / Headline
                </label>
                <input
                  type="text"
                  required
                  value={profileTitle}
                  onChange={(e) => setProfileTitle(e.target.value)}
                  placeholder="e.g. Master Classical Guitarist & Audio Engineer"
                  className="w-full text-xs rounded-xl border border-slate-200 p-2.5 outline-none focus:ring-2 focus:ring-purple-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  1-on-1 Hourly Rate (₹ INR)
                </label>
                <input
                  type="number"
                  required
                  value={profileRate}
                  onChange={(e) => setProfileRate(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-200 p-2.5 outline-none focus:ring-2 focus:ring-purple-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Skills (comma-separated)
                </label>
                <input
                  type="text"
                  value={profileSkills}
                  onChange={(e) => setProfileSkills(e.target.value)}
                  placeholder="Classical Guitar, Music Theory, Audio Production"
                  className="w-full text-xs rounded-xl border border-slate-200 p-2.5 outline-none focus:ring-2 focus:ring-purple-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Biography & Pedagogy
                </label>
                <textarea
                  rows={5}
                  value={profileBio}
                  onChange={(e) => setProfileBio(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-200 p-2.5 outline-none focus:ring-2 focus:ring-purple-500/20"
                />
              </div>

              <button
                type="submit"
                disabled={savingProfile}
                className="px-6 py-2.5 rounded-xl bg-gradient-brand text-white font-bold text-xs hover:opacity-95 shadow-md disabled:opacity-50"
              >
                {savingProfile ? 'Saving...' : 'Save Profile Changes'}
              </button>
            </form>
          </div>
        )}

        {/* Tab 6: Teacher Verification Workflow */}
        {activeTab === 'verification' && (
          <div className="max-w-2xl bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Teacher Verification Status</h3>
                <p className="text-xs text-slate-500">
                  Current Status:{' '}
                  <strong className="uppercase text-purple-700">{profile?.verificationStatus || 'Unverified'}</strong>
                </p>
              </div>
            </div>

            {profile?.verificationStatus === 'verified' ? (
              <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-800 text-xs font-medium space-y-2">
                <p className="font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Your teacher account is verified!
                </p>
                <p>A green verified badge appears on your public profile and your courses receive higher trust ranking.</p>
              </div>
            ) : (
              <form onSubmit={handleVerificationRequest} className="space-y-4">
                <p className="text-xs text-slate-600 leading-relaxed">
                  Submit proof of your qualifications (degree, certification, performance portfolio, or resume link) to receive the official SkillSync Verified Instructor badge.
                </p>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Document or Portfolio URL
                  </label>
                  <input
                    type="url"
                    required
                    value={verificationDocUrl}
                    onChange={(e) => setVerificationDocUrl(e.target.value)}
                    placeholder="https://drive.google.com/... or https://linkedin.com/in/..."
                    className="w-full text-xs rounded-xl border border-slate-200 p-2.5 outline-none focus:ring-2 focus:ring-purple-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Note for Administrators
                  </label>
                  <textarea
                    rows={3}
                    value={verificationNote}
                    onChange={(e) => setVerificationNote(e.target.value)}
                    placeholder="Provide details about your years of teaching experience, university credentials, or awards..."
                    className="w-full text-xs rounded-xl border border-slate-200 p-2.5 outline-none focus:ring-2 focus:ring-purple-500/20"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingVerification}
                  className="px-6 py-2.5 rounded-xl bg-gradient-brand text-white font-bold text-xs hover:opacity-95 shadow-md disabled:opacity-50"
                >
                  {submittingVerification ? 'Submitting...' : 'Submit Verification Request'}
                </button>
              </form>
            )}
          </div>
        )}
      </div>

      {/* Create Course Modal */}
      {showCreateCourseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4 my-8">
            <h3 className="text-lg font-bold text-slate-900">Create New Masterclass Course</h3>
            <form onSubmit={handleCreateCourse} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Title *</label>
                <input
                  type="text"
                  required
                  value={newCourseTitle}
                  onChange={(e) => setNewCourseTitle(e.target.value)}
                  placeholder="e.g. Master Classical Piano in 30 Days"
                  className="w-full text-xs rounded-xl border border-slate-200 p-2.5 outline-none focus:ring-2 focus:ring-purple-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Category *</label>
                  <select
                    value={newCourseCat}
                    onChange={(e) => setNewCourseCat(e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-200 p-2.5 outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Price (₹) *</label>
                  <input
                    type="number"
                    required
                    value={newCoursePrice}
                    onChange={(e) => setNewCoursePrice(e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-200 p-2.5 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Thumbnail URL</label>
                <input
                  type="url"
                  value={newCourseThumbnail}
                  onChange={(e) => setNewCourseThumbnail(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full text-xs rounded-xl border border-slate-200 p-2.5 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Description *</label>
                <textarea
                  required
                  rows={4}
                  value={newCourseDesc}
                  onChange={(e) => setNewCourseDesc(e.target.value)}
                  placeholder="Comprehensive course overview, requirements, and outcomes..."
                  className="w-full text-xs rounded-xl border border-slate-200 p-2.5 outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateCourseModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingCourse}
                  className="px-6 py-2.5 rounded-xl bg-gradient-brand text-white font-bold text-xs shadow-md"
                >
                  {creatingCourse ? 'Creating...' : 'Publish Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Lesson Modal */}
      {selectedCourseForLesson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4 my-8">
            <h3 className="text-lg font-bold text-slate-900">
              Add Lesson to "{selectedCourseForLesson.title}"
            </h3>
            <form onSubmit={handleAddLesson} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Lesson Title *</label>
                <input
                  type="text"
                  required
                  value={lessonTitle}
                  onChange={(e) => setLessonTitle(e.target.value)}
                  placeholder="e.g. Lesson 1: Introduction to Hand Positioning"
                  className="w-full text-xs rounded-xl border border-slate-200 p-2.5 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Duration (min)</label>
                  <input
                    type="number"
                    value={lessonDuration}
                    onChange={(e) => setLessonDuration(Number(e.target.value))}
                    className="w-full text-xs rounded-xl border border-slate-200 p-2.5 outline-none"
                  />
                </div>
                <div className="flex items-center pt-6">
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isLessonPreview}
                      onChange={(e) => setIsLessonPreview(e.target.checked)}
                      className="rounded text-purple-600"
                    />
                    <span>Free Preview Lesson</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Video URL (Cloudinary or MP4)</label>
                <input
                  type="url"
                  value={lessonVideoUrl}
                  onChange={(e) => setLessonVideoUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full text-xs rounded-xl border border-slate-200 p-2.5 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Lesson Content / Notes</label>
                <textarea
                  rows={4}
                  value={lessonContent}
                  onChange={(e) => setLessonContent(e.target.value)}
                  placeholder="Add detailed markdown instructions or sheet music references..."
                  className="w-full text-xs rounded-xl border border-slate-200 p-2.5 outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedCourseForLesson(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addingLesson}
                  className="px-6 py-2.5 rounded-xl bg-gradient-brand text-white font-bold text-xs shadow-md"
                >
                  {addingLesson ? 'Adding...' : 'Add Lesson'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Schedule Live Class Modal */}
      {showCreateClassModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4 my-8">
            <h3 className="text-lg font-bold text-slate-900">Schedule Live Masterclass Session</h3>
            <form onSubmit={handleScheduleClass} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Class Title *</label>
                <input
                  type="text"
                  required
                  value={classTitle}
                  onChange={(e) => setClassTitle(e.target.value)}
                  placeholder="e.g. Live Q&A and Technique Clinic"
                  className="w-full text-xs rounded-xl border border-slate-200 p-2.5 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Category *</label>
                  <select
                    value={classCat}
                    onChange={(e) => setClassCat(e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-200 p-2.5 outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Scheduled Date & Time *</label>
                  <input
                    type="datetime-local"
                    required
                    value={classTime}
                    onChange={(e) => setClassTime(e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-200 p-2.5 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Duration (min)</label>
                  <input
                    type="number"
                    value={classDuration}
                    onChange={(e) => setClassDuration(e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-200 p-2.5 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Fee (₹)</label>
                  <input
                    type="number"
                    value={classPrice}
                    onChange={(e) => setClassPrice(e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-200 p-2.5 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Max Capacity</label>
                  <input
                    type="number"
                    value={classCapacity}
                    onChange={(e) => setClassCapacity(e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-200 p-2.5 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Description</label>
                <textarea
                  rows={3}
                  value={classDesc}
                  onChange={(e) => setClassDesc(e.target.value)}
                  placeholder="Outline what will be covered in this live session..."
                  className="w-full text-xs rounded-xl border border-slate-200 p-2.5 outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateClassModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={schedulingClass}
                  className="px-6 py-2.5 rounded-xl bg-gradient-brand text-white font-bold text-xs shadow-md"
                >
                  {schedulingClass ? 'Scheduling...' : 'Schedule Class'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Video Upload Modal */}
      {showUploadVideoModal && (
        <VideoUploadModal
          isOpen={showUploadVideoModal}
          onClose={() => setShowUploadVideoModal(false)}
          categories={categories}
          courses={courses}
          onSuccess={fetchDashboard}
        />
      )}

      {/* Subscription Modal */}
      {showSubscriptionModal && (
        <SubscriptionModal
          isOpen={showSubscriptionModal}
          onClose={() => setShowSubscriptionModal(false)}
          currentPlan={profile?.subscriptionTier || 'basic'}
          onSuccess={fetchDashboard}
        />
      )}

      {/* Live Jitsi Room */}
      {activeLiveMeeting && (
        <JitsiMeetingModal
          isOpen={Boolean(activeLiveMeeting)}
          onClose={() => setActiveLiveMeeting(null)}
          liveClass={activeLiveMeeting}
        />
      )}
    </div>
  );
};

