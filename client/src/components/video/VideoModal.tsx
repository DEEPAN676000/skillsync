import React from 'react';
import { X, Heart, Bookmark, Eye, BookOpen, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { VideoShowcase } from '../../types/index.js';

interface VideoModalProps {
  video: VideoShowcase | null;
  isOpen: boolean;
  onClose: () => void;
  onToggleLike: (id: string) => void;
  onToggleSave: (id: string) => void;
}

export const VideoModal: React.FC<VideoModalProps> = ({
  video,
  isOpen,
  onClose,
  onToggleLike,
  onToggleSave,
}) => {
  if (!isOpen || !video) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/85 backdrop-blur-md transition-opacity" onClick={onClose} />

      <div className="flex min-h-full items-center justify-center p-2 sm:p-4">
        <div
          className="relative w-full max-w-4xl bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-slate-800 flex flex-col md:flex-row max-h-[90vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/60 text-white/80 hover:text-white hover:bg-black transition"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Video Player Column */}
          <div className="flex-1 bg-black flex items-center justify-center min-h-[350px] md:min-h-[500px]">
            <video
              src={video.videoUrl}
              controls
              autoPlay
              className="w-full h-full max-h-[550px] object-contain"
            >
              Your browser does not support HTML5 video.
            </video>
          </div>

          {/* Details Sidebar Column */}
          <div className="w-full md:w-80 bg-slate-900 text-white p-5 flex flex-col justify-between overflow-y-auto">
            <div>
              {/* Teacher Info */}
              <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
                <img
                  src={
                    video.teacher?.avatar ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300'
                  }
                  alt={video.teacher?.name}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-purple-500"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-sm text-white truncate">{video.teacher?.name}</h4>
                  <Link
                    to={`/teachers/${video.teacher?._id}`}
                    className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 transition"
                  >
                    View Instructor <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>

              {/* Title & Description */}
              <div className="py-4 space-y-2">
                <span className="px-2 py-0.5 rounded bg-purple-900/60 text-purple-300 text-xs font-semibold">
                  {video.category?.name || 'Skill'}
                </span>
                <h3 className="text-base font-bold text-white leading-snug">{video.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed whitespace-pre-line">
                  {video.description || 'No description provided.'}
                </p>

                {video.tags && video.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {video.tags.map((tag, i) => (
                      <span key={i} className="text-[11px] text-slate-500">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Actions & Course Link */}
            <div className="pt-4 border-t border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => onToggleLike(video._id)}
                    className={`flex items-center gap-1.5 font-bold transition ${
                      video.isLiked ? 'text-red-500' : 'text-slate-300 hover:text-red-400'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${video.isLiked ? 'fill-red-500' : ''}`} />
                    <span>{video.likesCount || 0} Likes</span>
                  </button>
                  <button
                    onClick={() => onToggleSave(video._id)}
                    className={`flex items-center gap-1 transition ${
                      video.isSaved ? 'text-purple-400' : 'text-slate-400 hover:text-purple-300'
                    }`}
                  >
                    <Bookmark className={`w-4 h-4 ${video.isSaved ? 'fill-purple-400' : ''}`} />
                    <span>Save</span>
                  </button>
                </div>
                <span>{video.views} views</span>
              </div>

              {video.relatedCourse && (
                <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60">
                  <p className="text-[11px] text-slate-400 mb-1">Related Masterclass:</p>
                  <p className="text-xs font-bold text-white line-clamp-1">
                    {(video.relatedCourse as any).title}
                  </p>
                  <Link
                    to={`/courses/${(video.relatedCourse as any).slug || (video.relatedCourse as any)._id}`}
                    onClick={onClose}
                    className="mt-2 w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-gradient-brand text-xs font-bold text-white hover:opacity-95 transition"
                  >
                    <BookOpen className="w-3.5 h-3.5" /> Explore Course Details
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

