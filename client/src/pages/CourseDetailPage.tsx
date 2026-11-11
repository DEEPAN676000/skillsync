import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import API from '../services/api.js';
import { Course, Lesson, TeacherProfile, Review } from '../types/index.js';
import { useAuth } from '../context/AuthContext.js';
import { StarRating } from '../components/common/StarRating.js';
import { CheckoutModal } from '../components/payment/CheckoutModal.js';
import {
  BookOpen,
  Clock,
  Users,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Play,
  FileText,
  AlertCircle,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

export const CourseDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [course, setCourse] = useState<Course | null>(null);
  const [teacherProfile, setTeacherProfile] = useState<TeacherProfile | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showCheckout, setShowCheckout] = useState(false);
  const [previewVideoUrl, setPreviewVideoUrl] = useState<string | null>(null);

  const fetchCourseData = async () => {
    try {
      const res = await API.get(`/courses/${id}`);
      if (res.data.success) {
        setCourse(res.data.course);
        setTeacherProfile(res.data.teacherProfile);
        setLessons(res.data.lessons);
        setReviews(res.data.reviews);
        setIsEnrolled(res.data.isEnrolled);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Course not found');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourseData();
  }, [id, user]);

  const handleEnrollClick = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setShowCheckout(true);
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-4">
        <AlertCircle className="w-12 h-12 text-red-500 mb-3" />
        <h2 className="text-xl font-bold text-slate-800">{error || 'Course not found'}</h2>
        <Link to="/explore" className="mt-4 px-4 py-2 rounded-xl bg-purple-50 text-purple-700 text-xs font-bold">
          Back to Courses
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Course Header Banner */}
        <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-10 mb-10 shadow-xl border border-slate-800 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
            <div className="lg:col-span-2 space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold border border-purple-500/30">
                  {course.category?.name}
                </span>
                <span className="capitalize px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-semibold">
                  {course.difficulty?.replace('_', ' ')}
                </span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-black text-white leading-tight">
                {course.title}
              </h1>

              <p className="text-slate-300 text-sm sm:text-base leading-relaxed line-clamp-3">
                {course.description}
              </p>

              <div className="flex flex-wrap items-center gap-6 pt-2 text-xs sm:text-sm text-slate-300">
                <StarRating rating={course.rating || 5.0} reviewsCount={course.numReviews} size="md" />
                <div className="flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-purple-400" />
                  <span>{course.enrolledCount || 0} students enrolled</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-purple-400" />
                  <span>{course.durationMinutes} minutes</span>
                </div>
              </div>

              {/* Teacher Byline */}
              <div className="pt-2 flex items-center gap-3">
                <img
                  src={course.teacher?.avatar}
                  alt={course.teacher?.name}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-purple-400"
                />
                <div>
                  <p className="text-xs text-slate-400">Created by</p>
                  <Link
                    to={`/teachers/${course.teacher?._id}`}
                    className="text-sm font-bold text-white hover:text-purple-300 transition"
                  >
                    {course.teacher?.name}
                  </Link>
                </div>
              </div>
            </div>

            {/* Thumbnail Preview Card */}
            <div className="lg:col-span-1">
              <div className="relative aspect-[16/10] rounded-2xl overflow-hidden shadow-2xl bg-black border border-slate-700 group">
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500 opacity-90"
                />
                {course.promoVideo && (
                  <button
                    onClick={() => setPreviewVideoUrl(course.promoVideo || null)}
                    className="absolute inset-0 flex items-center justify-center bg-black/40 hover:bg-black/20 transition"
                  >
                    <div className="w-12 h-12 rounded-full bg-white text-purple-700 flex items-center justify-center shadow-lg pl-1 group-hover:scale-110 transition">
                      <Play className="w-5 h-5 fill-current" />
                    </div>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content & Sticky Enrollment Card Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left Column: What you'll learn, Curriculum, Requirements, Reviews */}
          <div className="lg:col-span-2 space-y-10">
            {/* What you will learn */}
            {course.whatYouWillLearn && course.whatYouWillLearn.length > 0 && (
              <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-4">
                <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-600" /> What You Will Learn
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {course.whatYouWillLearn.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Curriculum / Lessons Accordion */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-purple-600" /> Course Curriculum
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {lessons.length} lessons • All learning materials and assignments included
                  </p>
                </div>
              </div>

              <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden">
                {lessons.map((lesson, idx) => (
                  <div
                    key={lesson._id}
                    className="p-4 flex items-center justify-between hover:bg-slate-50 transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-bold shrink-0">
                        {idx + 1}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-800">{lesson.title}</h4>
                        <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                          {lesson.description || 'Instructional video and downloadable notes.'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-400">{lesson.durationMinutes} min</span>
                      {isEnrolled || lesson.isFreePreview ? (
                        <button
                          onClick={() => {
                            if (isEnrolled) {
                              navigate(`/learn/${course._id}`);
                            } else if (lesson.videoUrl) {
                              setPreviewVideoUrl(lesson.videoUrl);
                            }
                          }}
                          className="px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 text-xs font-bold hover:bg-purple-100 transition flex items-center gap-1"
                        >
                          <Play className="w-3 h-3 fill-current" /> Preview
                        </button>
                      ) : (
                        <span className="p-1.5 text-slate-400" title="Locked lesson">
                          <Lock className="w-4 h-4" />
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Requirements */}
            {course.requirements && course.requirements.length > 0 && (
              <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-3">
                <h3 className="text-lg font-extrabold text-slate-900">Requirements & Prerequisites</h3>
                <ul className="space-y-2 text-xs text-slate-600 list-disc list-inside">
                  {course.requirements.map((req, i) => (
                    <li key={i}>{req}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Instructor Card */}
            {teacherProfile && (
              <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-4">
                <h3 className="text-lg font-extrabold text-slate-900">About the Instructor</h3>
                <div className="flex items-start gap-4">
                  <img
                    src={teacherProfile.user?.avatar}
                    alt={teacherProfile.user?.name}
                    className="w-16 h-16 rounded-2xl object-cover ring-2 ring-purple-100 shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-base font-bold text-slate-900">
                        {teacherProfile.user?.name}
                      </h4>
                      {teacherProfile.verificationStatus === 'verified' && (
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      )}
                    </div>
                    <p className="text-xs text-purple-600 font-semibold mt-0.5">
                      {teacherProfile.title}
                    </p>
                    <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                      {teacherProfile.bio}
                    </p>
                    <Link
                      to={`/teachers/${teacherProfile.user?._id || teacherProfile._id}`}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-700 mt-3 hover:text-purple-800"
                    >
                      View full teacher profile <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* Student Reviews */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-4">
              <h3 className="text-lg font-extrabold text-slate-900">
                Verified Student Reviews ({reviews.length})
              </h3>

              {reviews.length === 0 ? (
                <p className="text-xs text-slate-400">
                  No reviews yet. Be the first verified student to review this course!
                </p>
              ) : (
                <div className="space-y-4 divide-y divide-slate-100">
                  {reviews.map((rev) => (
                    <div key={rev._id} className="pt-4 first:pt-0 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <img
                            src={rev.user?.avatar}
                            alt={rev.user?.name}
                            className="w-7 h-7 rounded-full object-cover"
                          />
                          <span className="text-xs font-bold text-slate-900">{rev.user?.name}</span>
                          {rev.isVerifiedLearner && (
                            <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                              Verified Student
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-400">
                          {new Date(rev.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <StarRating rating={rev.rating} size="sm" showCount={false} />
                      <p className="text-xs text-slate-700 leading-relaxed">{rev.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Sticky Pricing & Enrollment Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 bg-white p-6 rounded-2xl border border-slate-200 shadow-xl space-y-6">
              <div className="flex items-baseline justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Course Fee
                </span>
                <span className="text-3xl font-black text-slate-900">
                  {course.price === 0 ? 'FREE' : `₹${course.price}`}
                </span>
              </div>

              {isEnrolled ? (
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>You are enrolled in this course!</span>
                  </div>
                  <Link
                    to={`/learn/${course._id}`}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm text-white bg-gradient-brand shadow-lg shadow-purple-500/25 hover:opacity-95 transition"
                  >
                    Continue Learning <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  <button
                    onClick={handleEnrollClick}
                    className="w-full py-3.5 rounded-xl font-bold text-sm text-white bg-gradient-brand shadow-lg shadow-purple-500/25 hover:opacity-95 hover:-translate-y-0.5 transition flex items-center justify-center gap-2"
                  >
                    {course.price === 0 ? 'Enroll for Free' : `Enroll Now • ₹${course.price}`}
                  </button>
                  <p className="text-[11px] text-center text-slate-400">
                    Instant full lifetime access • Verified Certificate
                  </p>
                </div>
              )}

              <div className="pt-4 border-t border-slate-100 space-y-2.5 text-xs text-slate-600">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-purple-600" /> Total Lessons
                  </span>
                  <span className="font-bold text-slate-800">{lessons.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-purple-600" /> Duration
                  </span>
                  <span className="font-bold text-slate-800">{course.durationMinutes} min</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-purple-600" /> Quizzes & Tasks
                  </span>
                  <span className="font-bold text-slate-800">Included</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-purple-600" /> 100% Refund Guarantee
                  </span>
                  <span className="font-bold text-emerald-600">Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Checkout Modal */}
      {showCheckout && (
        <CheckoutModal
          isOpen={showCheckout}
          onClose={() => setShowCheckout(false)}
          itemType="course"
          itemId={course._id}
          itemTitle={course.title}
          itemPrice={course.price}
          onSuccess={() => {
            setIsEnrolled(true);
            fetchCourseData();
          }}
        />
      )}

      {/* Free Lesson Video Preview Modal */}
      {previewVideoUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="relative w-full max-w-3xl bg-black rounded-2xl overflow-hidden shadow-2xl">
            <button
              onClick={() => setPreviewVideoUrl(null)}
              className="absolute top-3 right-3 z-10 p-2 rounded-full bg-black/60 text-white"
            >
              ✕
            </button>
            <video src={previewVideoUrl} controls autoPlay className="w-full h-auto max-h-[70vh]">
              Your browser does not support HTML5 video.
            </video>
          </div>
        </div>
      )}
    </div>
  );
};

