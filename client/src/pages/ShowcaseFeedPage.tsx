import React, { useState, useEffect } from 'react';
import API from '../services/api.js';
import { VideoShowcase, Category, Course } from '../types/index.js';
import { VideoCard } from '../components/video/VideoCard.js';
import { VideoModal } from '../components/video/VideoModal.js';
import { VideoUploadModal } from '../components/video/VideoUploadModal.js';
import { useAuth } from '../context/AuthContext.js';
import { Video as VideoIcon, Plus, Search, Sparkles, Flag } from 'lucide-react';

export const ShowcaseFeedPage: React.FC = () => {
  const { user } = useAuth();
  const [videos, setVideos] = useState<VideoShowcase[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [teacherCourses, setTeacherCourses] = useState<Course[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const [activeVideo, setActiveVideo] = useState<VideoShowcase | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [reportingVideoId, setReportingVideoId] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState('');

  const fetchVideos = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (selectedCategory) params.category = selectedCategory;
      if (search) params.search = search;

      const res = await API.get('/videos', { params });
      if (res.data.success) {
        setVideos(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load showcase videos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await API.get('/categories');
        if (res.data.success) setCategories(res.data.data);
      } catch (e) {
        // ignore
      }
    };
    fetchCats();
  }, []);

  useEffect(() => {
    fetchVideos();
  }, [selectedCategory, search]);

  useEffect(() => {
    // If logged in teacher, load courses to link videos
    if (user && user.role === 'teacher') {
      API.get(`/courses?teacherId=${user.id}`).then((res) => {
        if (res.data.success) setTeacherCourses(res.data.data);
      }).catch(() => {});
    }
  }, [user]);

  const handleToggleLike = async (id: string) => {
    if (!user) {
      alert('Please log in to like showcase videos.');
      return;
    }
    try {
      const res = await API.post(`/videos/${id}/like`);
      if (res.data.success) {
        setVideos((prev) =>
          prev.map((v) =>
            v._id === id
              ? {
                  ...v,
                  isLiked: res.data.liked,
                  likesCount: res.data.likesCount,
                }
              : v
          )
        );
      }
    } catch (e) {
      // ignore
    }
  };

  const handleToggleSave = async (id: string) => {
    if (!user) {
      alert('Please log in to save videos to your bookmarks.');
      return;
    }
    try {
      const res = await API.post(`/videos/${id}/save`);
      if (res.data.success) {
        setVideos((prev) =>
          prev.map((v) => (v._id === id ? { ...v, isSaved: res.data.saved } : v))
        );
      }
    } catch (e) {
      // ignore
    }
  };

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportingVideoId || !reportReason) return;
    try {
      await API.post('/reviews/report', {
        targetType: 'video',
        targetId: reportingVideoId,
        reason: reportReason,
      });
      alert('Thank you. The video has been reported to administrators for moderation.');
      setReportingVideoId(null);
      setReportReason('');
    } catch {
      alert('Failed to submit report');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-purple-700 uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4" /> Skill Reels & Showcases
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Skill Showcase Feed
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Quick bite-sized techniques, performance clips, and tutorials directly from teachers.
            </p>
          </div>

          {user && user.role === 'teacher' && (
            <button
              onClick={() => setShowUploadModal(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-brand shadow-lg shadow-purple-500/25 hover:opacity-95 transition"
            >
              <Plus className="w-4 h-4" /> Upload Skill Reel
            </button>
          )}
        </div>

        {/* Category Filter Pills & Search */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-2 overflow-x-auto w-full pb-2 sm:pb-0 scrollbar-none">
            <button
              onClick={() => setSelectedCategory('')}
              className={`px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition ${
                selectedCategory === ''
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              All Reels
            </button>
            {categories.map((c) => (
              <button
                key={c._id}
                onClick={() => setSelectedCategory(c._id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition ${
                  selectedCategory === c._id
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64 shrink-0">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search reels..."
              className="w-full text-xs rounded-xl bg-white border border-slate-200 pl-9 pr-3 py-2.5 outline-none focus:ring-2 focus:ring-purple-500/20"
            />
          </div>
        </div>

        {/* Video Grid */}
        {loading ? (
          <div className="min-h-[400px] flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : videos.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <VideoIcon className="w-12 h-12 text-purple-600 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">No showcase reels found</h3>
            <p className="text-xs text-slate-500">Check back soon or upload a skill reel as an instructor.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {videos.map((vid) => (
              <VideoCard
                key={vid._id}
                video={vid}
                onPlay={(v) => setActiveVideo(v)}
                onToggleLike={handleToggleLike}
                onToggleSave={handleToggleSave}
                onReport={(id) => setReportingVideoId(id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Video Player Modal */}
      {activeVideo && (
        <VideoModal
          isOpen={Boolean(activeVideo)}
          onClose={() => setActiveVideo(null)}
          video={activeVideo}
          onToggleLike={handleToggleLike}
          onToggleSave={handleToggleSave}
        />
      )}

      {/* Upload Video Modal */}
      {showUploadModal && (
        <VideoUploadModal
          isOpen={showUploadModal}
          onClose={() => setShowUploadModal(false)}
          categories={categories}
          courses={teacherCourses}
          onSuccess={fetchVideos}
        />
      )}

      {/* Report Modal */}
      {reportingVideoId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="relative w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-2 text-red-600 font-bold text-sm">
              <Flag className="w-5 h-5" /> Report Content
            </div>
            <p className="text-xs text-slate-500">
              Please let our moderation team know why this video violates community guidelines:
            </p>
            <form onSubmit={handleReportSubmit} className="space-y-4">
              <textarea
                required
                rows={3}
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                placeholder="Inappropriate content, copyright infringement, spam, etc."
                className="w-full text-xs rounded-xl border border-slate-200 p-2.5 outline-none focus:ring-2 focus:ring-purple-500/20"
              />
              <div className="flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setReportingVideoId(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow"
                >
                  Submit Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

