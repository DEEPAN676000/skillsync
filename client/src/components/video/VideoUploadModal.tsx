import React, { useState } from 'react';
import { Upload, X, Film, Sparkles } from 'lucide-react';
import { Modal } from '../common/Modal.js';
import API from '../../services/api.js';
import { Category, Course } from '../../types/index.js';

interface VideoUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  courses: Course[];
  onSuccess: () => void;
}

export const VideoUploadModal: React.FC<VideoUploadModalProps> = ({
  isOpen,
  onClose,
  categories,
  courses,
  onSuccess,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(categories[0]?._id || '');
  const [videoUrl, setVideoUrl] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [relatedCourse, setRelatedCourse] = useState('');
  const [durationSeconds, setDurationSeconds] = useState(60);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'showcase');

    setUploading(true);
    setError('');

    try {
      const res = await API.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success) {
        setVideoUrl(res.data.data.url);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'File upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !videoUrl || !category) {
      setError('Title, category, and video are required');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const res = await API.post('/videos', {
        title,
        description,
        category,
        videoUrl,
        thumbnailUrl:
          thumbnailUrl ||
          'https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&q=80&w=600',
        relatedCourse: relatedCourse || undefined,
        durationSeconds: Number(durationSeconds) || 60,
      });

      if (res.data.success) {
        onSuccess();
        onClose();
        setTitle('');
        setDescription('');
        setVideoUrl('');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to publish video');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Upload Skill Showcase Reel" maxWidth="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-red-50 text-red-600 text-xs font-semibold">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Video Title *
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Master the Violin Bow Hold in 60 Seconds"
            className="w-full text-sm rounded-xl border border-slate-200 p-2.5 outline-none focus:ring-2 focus:ring-purple-500/20"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Category *
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full text-sm rounded-xl border border-slate-200 p-2.5 outline-none focus:ring-2 focus:ring-purple-500/20"
          >
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Video Upload or Direct URL */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Video Source *
          </label>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <label className="cursor-pointer inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-50 text-purple-700 text-xs font-bold hover:bg-purple-100 transition">
                <Upload className="w-3.5 h-3.5" />
                {uploading ? 'Uploading...' : 'Upload Video File'}
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={uploading}
                />
              </label>
              <span className="text-xs text-slate-400">or paste direct video URL below:</span>
            </div>

            <input
              type="url"
              required
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://... (.mp4, .webm, Cloudinary URL)"
              className="w-full text-xs rounded-xl border border-slate-200 p-2.5 outline-none focus:ring-2 focus:ring-purple-500/20"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Thumbnail Image URL (optional)
          </label>
          <input
            type="url"
            value={thumbnailUrl}
            onChange={(e) => setThumbnailUrl(e.target.value)}
            placeholder="https://images.unsplash.com/..."
            className="w-full text-xs rounded-xl border border-slate-200 p-2.5 outline-none focus:ring-2 focus:ring-purple-500/20"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Link to Course (optional)
          </label>
          <select
            value={relatedCourse}
            onChange={(e) => setRelatedCourse(e.target.value)}
            className="w-full text-xs rounded-xl border border-slate-200 p-2.5 outline-none focus:ring-2 focus:ring-purple-500/20"
          >
            <option value="">None (Standalone Showcase)</option>
            {courses.map((c) => (
              <option key={c._id} value={c._id}>
                {c.title}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Description
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What does this reel demonstrate? Share tips and context..."
            className="w-full text-xs rounded-xl border border-slate-200 p-2.5 outline-none focus:ring-2 focus:ring-purple-500/20"
          />
        </div>

        <div className="pt-2 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting || uploading}
            className="px-5 py-2.5 text-xs font-bold text-white bg-gradient-brand hover:opacity-95 shadow-md shadow-purple-500/20 rounded-xl transition disabled:opacity-50"
          >
            {submitting ? 'Publishing...' : 'Publish Reel'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

