import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../services/api.js';
import { TeacherProfile, Course, VideoShowcase, Review } from '../types/index.js';
import { StarRating } from '../components/common/StarRating.js';
import { CourseCard } from '../components/course/CourseCard.js';
import { VideoModal } from '../components/video/VideoModal.js';
import { CheckoutModal } from '../components/payment/CheckoutModal.js';
import {
  ShieldCheck,
  Calendar,
  Clock,
  Award,
  Globe,
  Play,
  Video as VideoIcon,
  BookOpen,
  MessageSquare,
  Sparkles,
} from 'lucide-react';

export const TeacherProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [profile, setProfile] = useState<TeacherProfile | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [videos, setVideos] = useState<VideoShowcase[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeVideo, setActiveVideo] = useState<VideoShowcase | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);

  const fetchProfile = async () => {
    try {
      const res = await API.get(`/teachers/${id}`);
      if (res.data.success) {
        setProfile(res.data.profile);
        setCourses(res.data.courses || []);
        setVideos(res.data.videos || []);
        setReviews(res.data.reviews || []);
      }
    } catch (err) {
      console.error('Failed to load teacher profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-12 text-center">
        <h2 className="text-xl font-bold text-slate-800">Teacher Profile Not Found</h2>
        <Link to="/teachers" className="text-purple-600 font-bold text-xs mt-3 inline-block">
          Return to Teacher Directory
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Profile Header Hero Card */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-10 shadow-sm relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-slate-100">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
              <div className="relative">
                <img
                  src={profile.user?.avatar}
                  alt={profile.user?.name}
                  className="w-28 h-28 rounded-3xl object-cover ring-4 ring-purple-100 shadow-xl"
                />
                {profile.verificationStatus === 'verified' && (
                  <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-1.5 rounded-full ring-2 ring-white">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
                    {profile.user?.name}
                  </h1>
                  {profile.subscriptionTier === 'pro' && (
                    <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-700 font-black text-xs">
                      PRO
                    </span>
                  )}
                </div>

                <p className="text-sm font-bold text-purple-600">{profile.title}</p>

                <div className="flex items-center justify-center sm:justify-start gap-4 pt-1">
                  <StarRating rating={profile.rating || 5.0} reviewsCount={profile.numReviews} size="md" />
                  <span className="text-xs text-slate-400">•</span>
                  <span className="text-xs text-slate-600 font-medium">
                    {profile.experienceYears} Years Experience
                  </span>
                </div>
              </div>
            </div>

            {/* 1-on-1 Mentorship Booking Card */}
            <div className="w-full md:w-auto p-4 rounded-2xl bg-purple-50/70 border border-purple-200/60 flex sm:flex-col items-center justify-between sm:justify-center text-center gap-3">
              <div>
                <span className="text-xs font-bold text-purple-700 uppercase tracking-wider block">
                  1-on-1 Mentorship
                </span>
                <span className="text-2xl font-black text-slate-900">₹{profile.hourlyRate}</span>
                <span className="text-xs text-slate-500 font-medium ml-1">/ hour</span>
              </div>
              <button
                onClick={() => setShowBookingModal(true)}
                className="px-6 py-2.5 rounded-xl bg-gradient-brand text-white font-bold text-xs hover:opacity-95 shadow-md shadow-purple-500/25 transition"
              >
                Book 1-on-1 Session
              </button>
            </div>
          </div>

          {/* Details Row: Bio, Skills, Languages, Qualifications */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8">
            <div className="md:col-span-2 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
                Biography & Teaching Philosophy
              </h3>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                {profile.bio}
              </p>

              <div className="pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Core Skills & Specialties
                </h4>
                <div className="flex flex-wrap gap-2">
                  {profile.skills?.map((skill, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 rounded-xl bg-slate-100 text-xs font-semibold text-slate-700"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4 md:border-l md:border-slate-100 md:pl-8">
              {profile.qualifications && profile.qualifications.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-purple-600" /> Qualifications
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-600">
                    {profile.qualifications.map((q, i) => (
                      <li key={i}>• {q}</li>
                    ))}
                  </ul>
                </div>
              )}

              {profile.languages && profile.languages.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                    <Globe className="w-4 h-4 text-purple-600" /> Teaching Languages
                  </h4>
                  <p className="text-xs text-slate-600 font-medium">
                    {profile.languages.join(', ')}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Video Showcase Reels by Teacher */}
        {videos.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <VideoIcon className="w-6 h-6 text-purple-600" /> Skill Showcase Reels
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {videos.map((vid) => (
                <div
                  key={vid._id}
                  onClick={() => setActiveVideo(vid)}
                  className="group relative aspect-[9/12] rounded-2xl overflow-hidden bg-slate-900 cursor-pointer shadow-sm hover:shadow-xl transition"
                >
                  <img
                    src={vid.thumbnailUrl}
                    alt={vid.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500 opacity-90"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full bg-white/90 text-purple-700 flex items-center justify-center shadow-md pl-0.5 group-hover:scale-110 transition">
                      <Play className="w-4 h-4 fill-current" />
                    </div>
                  </div>
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <p className="text-xs font-bold line-clamp-2">{vid.title}</p>
                    <span className="text-[10px] text-white/70 block mt-1">{vid.views} views</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Courses Offered */}
        <div className="space-y-4">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-purple-600" /> Masterclasses & Courses ({courses.length})
          </h2>
          {courses.length === 0 ? (
            <p className="text-xs text-slate-400">No published courses at the moment.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((c) => (
                <CourseCard key={c._id} course={c} />
              ))}
            </div>
          )}
        </div>

        {/* Reviews */}
        <div className="space-y-4">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-purple-600" /> Verified Student Reviews ({reviews.length})
          </h2>
          {reviews.length === 0 ? (
            <p className="text-xs text-slate-400">No reviews yet for this instructor.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reviews.map((rev) => (
                <div key={rev._id} className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <img
                        src={rev.user?.avatar}
                        alt={rev.user?.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <div>
                        <span className="text-xs font-bold text-slate-900 block">{rev.user?.name}</span>
                        <StarRating rating={rev.rating} size="sm" showCount={false} />
                      </div>
                    </div>
                    <span className="text-[11px] text-slate-400">
                      {new Date(rev.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed italic">"{rev.comment}"</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Video Modal */}
      {activeVideo && (
        <VideoModal
          isOpen={Boolean(activeVideo)}
          onClose={() => setActiveVideo(null)}
          video={activeVideo}
          onToggleLike={() => {}}
          onToggleSave={() => {}}
        />
      )}

      {/* Booking Checkout Modal */}
      {showBookingModal && (
        <CheckoutModal
          isOpen={showBookingModal}
          onClose={() => setShowBookingModal(false)}
          itemType="booking"
          itemId={profile._id}
          itemTitle={`1-on-1 Mentorship with ${profile.user?.name}`}
          itemPrice={profile.hourlyRate}
          onSuccess={() => {
            alert('Your 1-on-1 session booking has been confirmed! Details sent to your email.');
          }}
        />
      )}
    </div>
  );
};

