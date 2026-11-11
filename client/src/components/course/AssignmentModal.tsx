import React, { useState } from 'react';
import { Upload, FileText, CheckCircle2 } from 'lucide-react';
import { Modal } from '../common/Modal.js';
import API from '../../services/api.js';
import { Assignment } from '../../types/index.js';

interface AssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignment: Assignment | null;
  onSuccess: () => void;
}

export const AssignmentModal: React.FC<AssignmentModalProps> = ({
  isOpen,
  onClose,
  assignment,
  onSuccess,
}) => {
  const [content, setContent] = useState('');
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!isOpen || !assignment) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      setError('Please provide your submission response or project notes.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const res = await API.post(`/progress/assignment/${assignment._id}/submit`, {
        content,
        attachmentUrl,
      });

      if (res.data.success) {
        setSuccess(true);
        onSuccess();
        setTimeout(() => {
          setSuccess(false);
          setContent('');
          onClose();
        }, 1500);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit assignment');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Assignment: ${assignment.title}`} maxWidth="lg">
      {success ? (
        <div className="py-8 text-center space-y-3">
          <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center animate-bounce">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Assignment Submitted!</h3>
          <p className="text-xs text-slate-500">Your instructor has received your submission.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Instructions
            </p>
            <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
              {assignment.description}
            </p>
            <div className="mt-2 text-[11px] text-purple-700 font-bold flex items-center gap-2">
              <span>Max Score: {assignment.maxScore} pts</span>
              <span>•</span>
              <span>Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-50 text-red-600 text-xs font-semibold">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Your Submission & Explanations *
            </label>
            <textarea
              required
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Describe your solution, paste Github links, observations, or write-up here..."
              className="w-full text-xs rounded-xl border border-slate-200 p-2.5 outline-none focus:ring-2 focus:ring-purple-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Attachment or Project Link (optional)
            </label>
            <input
              type="url"
              value={attachmentUrl}
              onChange={(e) => setAttachmentUrl(e.target.value)}
              placeholder="https://drive.google.com/... or https://github.com/..."
              className="w-full text-xs rounded-xl border border-slate-200 p-2.5 outline-none focus:ring-2 focus:ring-purple-500/20"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 text-xs font-bold text-white bg-gradient-brand hover:opacity-95 shadow-md shadow-purple-500/20 rounded-xl transition disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Turn In Assignment'}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
};

