import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../services/api.js';
import { Course, Lesson, Quiz, Assignment } from '../types/index.js';
import { useAuth } from '../context/AuthContext.js';
import { QuizModal } from '../components/course/QuizModal.js';
import { AssignmentModal } from '../components/course/AssignmentModal.js';
import {
  Play,
  CheckCircle,
  Circle,
  FileText,
  Download,
  HelpCircle,
  Award,
  Star,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

export const CourseLearnPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>([]);
  const [progressPercentage, setProgressPercentage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);

  // Modals
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [activeAssignment, setActiveAssignment] = useState<Assignment | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  const fetchCourseAndProgress = async () => {
    try {
      const [courseRes, progRes] = await Promise.all([
        API.get(`/courses/${id}`),
        API.get(`/progress/${id}`),
      ]);

      if (courseRes.data.success) {
        setCourse(courseRes.data.course);
        const lList: Lesson[] = courseRes.data.lessons;
        setLessons(lList);
        setQuizzes(courseRes.data.quizzes || []);
        setAssignments(courseRes.data.assignments || []);

        if (lList.length > 0) {
          // If learner has a lastWatchedLesson, activate it
          const lastWatchedId = progRes.data?.progress?.lastWatchedLesson;
          const targetLesson = lList.find((l) => l._id === lastWatchedId) || lList[0];
          setActiveLesson(targetLesson);
        }
      }

      if (progRes.data.success && progRes.data.progress) {
        const cIds = (progRes.data.progress.completedLessons || []).map((item: any) =>
          typeof item === 'string' ? item : item._id
        );
        setCompletedLessonIds(cIds);
        setProgressPercentage(progRes.data.progress.progressPercentage || 0);
      }
    } catch (err) {
      console.error('Failed to load course learning data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourseAndProgress();
  }, [id]);

  const handleMarkComplete = async () => {
    if (!activeLesson) return;
    setCompleting(true);
    try {
      const res = await API.post(`/lessons/${activeLesson._id}/complete`);
      if (res.data.success) {
        if (!completedLessonIds.includes(activeLesson._id)) {
          setCompletedLessonIds((prev) => [...prev, activeLesson._id]);
        }
        setProgressPercentage(res.data.progress.progressPercentage);

        // Auto advance to next lesson if available
        const currentIndex = lessons.findIndex((l) => l._id === activeLesson._id);
        if (currentIndex < lessons.length - 1) {
          setActiveLesson(lessons[currentIndex + 1]);
        }
      }
    } catch (err) {
      console.error('Failed to mark lesson complete:', err);
    } finally {
      setCompleting(false);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewComment.trim()) return;
    setSubmittingReview(true);
    try {
      const res = await API.post('/reviews', {
        courseId: id,
        rating: reviewRating,
        comment: reviewComment,
      });
      if (res.data.success) {
        setReviewSuccess(true);
        setTimeout(() => {
          setShowReviewModal(false);
          setReviewSuccess(false);
          setReviewComment('');
        }, 1500);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="p-8 text-center">
        <p>Course not found or unauthorized.</p>
      </div>
    );
  }

  const isCurrentLessonComplete = activeLesson
    ? completedLessonIds.includes(activeLesson._id)
    : false;

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      {/* Top Header */}
      <header className="h-16 px-4 sm:px-6 bg-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Link
            to={`/courses/${course.slug || course._id}`}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-white truncate max-w-md">{course.title}</h2>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span>{completedLessonIds.length} of {lessons.length} lessons completed</span>
              <span>•</span>
              <span className="text-purple-400 font-bold">{progressPercentage}%</span>
            </div>
          </div>
        </div>

        {/* Progress Bar & Actions */}
        <div className="flex items-center gap-4">
          <div className="hidden md:block w-36 h-2 rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-gradient-brand transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>

          <button
            onClick={() => setShowReviewModal(true)}
            className="px-3.5 py-1.5 rounded-xl bg-purple-600/30 text-purple-300 border border-purple-500/30 hover:bg-purple-600 hover:text-white text-xs font-bold transition flex items-center gap-1.5"
          >
            <Star className="w-3.5 h-3.5 fill-current" />
            <span>Leave Review</span>
          </button>
        </div>
      </header>

      {/* Main Learning Classroom Layout */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Column: Video & Lesson Materials */}
        <div className="flex-1 flex flex-col overflow-y-auto bg-slate-900 p-4 sm:p-6">
          {/* Video Player */}
          <div className="aspect-video w-full bg-black rounded-2xl overflow-hidden shadow-2xl relative border border-slate-800">
            {activeLesson?.videoUrl ? (
              <video
                key={activeLesson._id}
                src={activeLesson.videoUrl}
                controls
                autoPlay
                className="w-full h-full object-contain"
              >
                Your browser does not support HTML5 video.
              </video>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center space-y-3 bg-slate-950">
                <FileText className="w-12 h-12 text-slate-600" />
                <h4 className="text-base font-bold text-slate-300">Text & Reading Module</h4>
                <p className="text-xs text-slate-500 max-w-sm">
                  This lesson focuses on reference notes and downloadable attachments. Follow the guide below.
                </p>
              </div>
            )}
          </div>

          {/* Lesson Title & Mark Complete CTA */}
          <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white">{activeLesson?.title}</h1>
              <p className="text-xs text-slate-400 mt-1">
                Duration: {activeLesson?.durationMinutes} minutes • Instructor: {course.teacher?.name}
              </p>
            </div>

            <button
              onClick={handleMarkComplete}
              disabled={completing}
              className={`px-6 py-3 rounded-xl font-bold text-xs flex items-center gap-2 shadow-lg transition ${
                isCurrentLessonComplete
                  ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-600/30'
                  : 'bg-gradient-brand text-white hover:opacity-95'
              }`}
            >
              <CheckCircle className="w-4 h-4" />
              {completing
                ? 'Saving...'
                : isCurrentLessonComplete
                ? 'Completed (Click to Re-verify)'
                : 'Mark Lesson as Completed'}
            </button>
          </div>

          {/* Lesson Content / Notes */}
          <div className="py-6 space-y-6">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-purple-400 mb-2">
                Lesson Notes & Overview
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                {activeLesson?.content || activeLesson?.description || 'No additional notes provided for this lesson.'}
              </p>
            </div>

            {/* Downloadable Materials */}
            {activeLesson?.materials && activeLesson.materials.length > 0 && (
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-purple-400 mb-2">
                  Lesson Materials & Downloads
                </h3>
                <div className="space-y-2">
                  {activeLesson.materials.map((mat, i) => (
                    <a
                      key={i}
                      href={mat.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-between hover:bg-slate-800 transition"
                    >
                      <div className="flex items-center gap-2.5">
                        <FileText className="w-4 h-4 text-purple-400" />
                        <div>
                          <p className="text-xs font-bold text-white">{mat.title}</p>
                          <span className="text-[10px] text-slate-400 uppercase font-medium">
                            {mat.fileType} • {mat.fileSize || '1 MB'}
                          </span>
                        </div>
                      </div>
                      <Download className="w-4 h-4 text-purple-400" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar: Curriculum, Quizzes & Tasks */}
        <div className="w-full lg:w-96 bg-slate-950 border-l border-slate-800 flex flex-col shrink-0 overflow-y-auto">
          <div className="p-4 border-b border-slate-800 bg-slate-900/60">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-300">
              Course Syllabus
            </h3>
          </div>

          {/* Lessons List */}
          <div className="divide-y divide-slate-850">
            {lessons.map((lesson, idx) => {
              const isSelected = activeLesson?._id === lesson._id;
              const isCompleted = completedLessonIds.includes(lesson._id);

              return (
                <button
                  key={lesson._id}
                  onClick={() => setActiveLesson(lesson)}
                  className={`w-full text-left p-4 transition flex items-start gap-3 ${
                    isSelected ? 'bg-purple-950/40 border-l-4 border-purple-500' : 'hover:bg-slate-900/60'
                  }`}
                >
                  <div className="mt-0.5">
                    {isCompleted ? (
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Circle className="w-4 h-4 text-slate-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-bold ${isSelected ? 'text-purple-300' : 'text-slate-200'}`}>
                      {idx + 1}. {lesson.title}
                    </p>
                    <span className="text-[10px] text-slate-500 block mt-1">
                      {lesson.durationMinutes} min
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Quizzes & Assignments Section */}
          <div className="p-4 border-t border-slate-800 space-y-4 bg-slate-900/40">
            {quizzes.length > 0 && (
              <div>
                <h4 className="text-[11px] font-bold text-purple-400 uppercase tracking-wider mb-2">
                  Knowledge Check Quizzes
                </h4>
                <div className="space-y-2">
                  {quizzes.map((quiz) => (
                    <button
                      key={quiz._id}
                      onClick={() => setActiveQuiz(quiz)}
                      className="w-full text-left p-3 rounded-xl bg-slate-800/80 border border-slate-700/70 hover:bg-slate-800 transition flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <HelpCircle className="w-4 h-4 text-purple-400" />
                        <span className="text-xs font-bold text-slate-200">{quiz.title}</span>
                      </div>
                      <span className="text-[10px] text-purple-400 font-bold">Start</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {assignments.length > 0 && (
              <div>
                <h4 className="text-[11px] font-bold text-blue-400 uppercase tracking-wider mb-2">
                  Course Assignments
                </h4>
                <div className="space-y-2">
                  {assignments.map((assignment) => (
                    <button
                      key={assignment._id}
                      onClick={() => setActiveAssignment(assignment)}
                      className="w-full text-left p-3 rounded-xl bg-slate-800/80 border border-slate-700/70 hover:bg-slate-800 transition flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-blue-400" />
                        <span className="text-xs font-bold text-slate-200">{assignment.title}</span>
                      </div>
                      <span className="text-[10px] text-blue-400 font-bold">Submit</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quiz Modal */}
      {activeQuiz && (
        <QuizModal
          isOpen={Boolean(activeQuiz)}
          onClose={() => setActiveQuiz(null)}
          quiz={activeQuiz}
          onSuccess={() => fetchCourseAndProgress()}
        />
      )}

      {/* Assignment Modal */}
      {activeAssignment && (
        <AssignmentModal
          isOpen={Boolean(activeAssignment)}
          onClose={() => setActiveAssignment(null)}
          assignment={activeAssignment}
          onSuccess={() => fetchCourseAndProgress()}
        />
      )}

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-2xl text-white">
            <h3 className="text-lg font-bold mb-1">Rate & Review this Course</h3>
            <p className="text-xs text-slate-400 mb-4">
              Your verified review helps other learners discover quality courses.
            </p>

            {reviewSuccess ? (
              <div className="py-6 text-center text-emerald-400 font-bold text-sm">
                Thank you! Your verified review has been submitted.
              </div>
            ) : (
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">
                    Rating (1 to 5 Stars)
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewRating(star)}
                        className="p-1 text-amber-400 hover:scale-110 transition"
                      >
                        <Star
                          className={`w-7 h-7 ${
                            star <= reviewRating ? 'fill-amber-400 text-amber-400' : 'text-slate-600'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">
                    Written Feedback
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="What did you think of the teaching style, pacing, and materials?"
                    className="w-full text-xs rounded-xl bg-slate-800 border border-slate-700 p-2.5 text-white outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowReviewModal(false)}
                    className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="px-5 py-2.5 rounded-xl bg-gradient-brand text-xs font-bold text-white hover:opacity-95 shadow-md"
                  >
                    {submittingReview ? 'Submitting...' : 'Post Verified Review'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

