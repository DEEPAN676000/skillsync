import React from 'react';
import { Heart, Bookmark, Eye, Play, Sparkles, BookOpen, Flag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { VideoShowcase } from '../../types/index.js';

interface VideoCardProps {
  video: VideoShowcase;
  onPlay: (video: VideoShowcase) => void;
  onToggleLike: (id: string) => void;
  onToggleSave: (id: string) => void;
  onReport: (id: string) => void;
}

export const VideoCard: React.FC<VideoCardProps> = ({
  video,
  onPlay,
  onToggleLike,
  onToggleSave,
  onReport,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-xl hover:shadow-purple-500/10 transition duration-300 flex flex-col overflow-hidden group">
      {/* Thumbnail with Play Trigger */}
      <div
        className="relative aspect-[9/12] sm:aspect-[9/13] bg-slate-900 overflow-hidden cursor-pointer"
        onClick={() => onPlay(video)}
      >
        <img
          src={video.thumbnailUrl}
          alt={video.title}
          className="w-full h-full object-cover group-hover:scale-105 transition duration-500 opacity-90 group-hover:opacity-100"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/30 pointer-events-none" />

        {/* Category Pill */}
        <div className="absolute top-3 left-3 z-10">
          <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[11px] font-bold text-white border border-white/10">
            {video.category?.name || 'Showcase'}
          </span>
        </div>

        {/* Report Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onReport(video._id);
          }}
          className="absolute top-3 right-3 z-10 p-1.5 rounded-full bg-black/40 text-white/70 hover:text-red-400 hover:bg-black/80 transition"
          title="Report Video"
        >
          <Flag className="w-3.5 h-3.5" />
        </button>

        {/* Center Play Button Overlay */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-14 h-14 rounded-full bg-white/90 text-purple-700 flex items-center justify-center shadow-2xl pl-1 group-hover:scale-110 group-hover:bg-purple-600 group-hover:text-white transition duration-300">
            <Play className="w-6 h-6 fill-current" />
          </div>
        </div>

        {/* Bottom Details Overlay */}
        <div className="absolute bottom-3 left-3 right-3 z-10 text-white">
          <div className="flex items-center gap-2 mb-1.5">
            <img
              src={
                video.teacher?.avatar ||
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300'
              }
              alt={video.teacher?.name}
              className="w-6 h-6 rounded-full object-cover ring-2 ring-white/50"
            />
            <span className="text-xs font-semibold text-white/90 truncate">
              {video.teacher?.name}
            </span>
          </div>

          <h3 className="font-bold text-sm text-white line-clamp-2 leading-snug drop-shadow-sm">
            {video.title}
          </h3>

          <div className="mt-2 flex items-center justify-between text-[11px] text-white/70">
            <span className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" /> {video.views} views
            </span>
            <span>{video.durationSeconds}s</span>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="p-3.5 bg-white flex items-center justify-between border-t border-slate-100">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onToggleLike(video._id)}
            className={`flex items-center gap-1 text-xs font-semibold transition ${
              video.isLiked ? 'text-red-500' : 'text-slate-600 hover:text-red-500'
            }`}
          >
            <Heart className={`w-4 h-4 ${video.isLiked ? 'fill-red-500 text-red-500' : ''}`} />
            <span>{video.likesCount || 0}</span>
          </button>

          <button
            onClick={() => onToggleSave(video._id)}
            className={`text-slate-600 hover:text-purple-600 transition ${
              video.isSaved ? 'text-purple-600' : ''
            }`}
            title="Save video"
          >
            <Bookmark className={`w-4 h-4 ${video.isSaved ? 'fill-purple-600 text-purple-600' : ''}`} />
          </button>
        </div>

        {video.relatedCourse && (
          <Link
            to={`/courses/${(video.relatedCourse as any).slug || (video.relatedCourse as any)._id}`}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-50 text-[11px] font-bold text-purple-700 hover:bg-purple-100 transition"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>View Course</span>
          </Link>
        )}
      </div>
    </div>
  );
};

