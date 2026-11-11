import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Progress from '../models/Progress.js';
import Enrollment from '../models/Enrollment.js';
import Course from '../models/Course.js';
import Lesson from '../models/Lesson.js';
import Quiz from '../models/Quiz.js';
import Assignment from '../models/Assignment.js';
import { AuthRequest } from '../middleware/auth.js';
import { createNotification } from '../utils/notificationHelper.js';
import localStore from '../utils/localStore.js';

// @desc    Get progress for a specific course for logged in learner
// @route   GET /api/progress/:courseId
export const getCourseProgress = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { courseId } = req.params;
    const learnerId = (req.user!._id || req.user!.id).toString();

    if (mongoose.connection.readyState === 1) {
      const progress = await Progress.findOne({
        course: courseId,
        learner: learnerId,
      }).populate('completedLessons');

      const totalLessons = await Lesson.countDocuments({ course: courseId });
      const quizzes = await Quiz.find({ course: courseId });
      const assignments = await Assignment.find({ course: courseId });

      const quizStats = quizzes.map((q) => {
        const myAttempt = q.attempts.find((a) => a.learner.toString() === learnerId);
        return {
          quizId: q._id,
          title: q.title,
          passingScore: q.passingScore,
          attempt: myAttempt || null,
        };
      });

      const assignmentStats = assignments.map((a) => {
        const mySub = a.submissions.find((s) => s.learner.toString() === learnerId);
        return {
          assignmentId: a._id,
          title: a.title,
          dueDate: a.dueDate,
          maxScore: a.maxScore,
          submission: mySub || null,
        };
      });

      res.status(200).json({
        success: true,
        progress: progress || {
          completedLessons: [],
          progressPercentage: 0,
          isCompleted: false,
        },
        totalLessons,
        quizStats,
        assignmentStats,
      });
    } else {
      const progress = localStore.progress.find(
        (p) => (p.learner === learnerId || p.learner?._id === learnerId) && p.course === courseId
      );

      const totalLessons = localStore.lessons.filter((l) => l.course === courseId).length;
      const quizzes = localStore.quizzes.filter((q) => q.course === courseId);
      const assignments = localStore.assignments.filter((a) => a.course === courseId);

      const quizStats = quizzes.map((q) => {
        const attempts = q.attempts || [];
        const myAttempt = attempts.find(
          (a: any) =>
            a.learner?.toString() === learnerId ||
            a.learner?._id?.toString() === learnerId ||
            a.learner?.id?.toString() === learnerId
        );
        return {
          quizId: q._id,
          title: q.title,
          passingScore: q.passingScore,
          attempt: myAttempt || null,
        };
      });

      const assignmentStats = assignments.map((a) => {
        const submissions = a.submissions || [];
        const mySub = submissions.find(
          (s: any) =>
            s.learner?.toString() === learnerId ||
            s.learner?._id?.toString() === learnerId ||
            s.learner?.id?.toString() === learnerId
        );
        return {
          assignmentId: a._id,
          title: a.title,
          dueDate: a.dueDate,
          maxScore: a.maxScore,
          submission: mySub || null,
        };
      });

      res.status(200).json({
        success: true,
        progress: progress || {
          completedLessons: [],
          progressPercentage: 0,
          isCompleted: false,
        },
        totalLessons,
        quizStats,
        assignmentStats,
      });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Submit Quiz attempt
// @route   POST /api/progress/quiz/:quizId/submit
export const submitQuiz = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { answers } = req.body;
    const learnerId = (req.user!._id || req.user!.id).toString();

    if (mongoose.connection.readyState === 1) {
      const quiz = await Quiz.findById(req.params.quizId);

      if (!quiz) {
        res.status(404).json({ success: false, message: 'Quiz not found' });
        return;
      }

      let correctCount = 0;
      quiz.questions.forEach((q, idx) => {
        if (answers && answers[idx] === q.correctAnswerIndex) {
          correctCount += 1;
        }
      });

      const score = Math.round((correctCount / quiz.questions.length) * 100);
      const passed = score >= quiz.passingScore;

      quiz.attempts = quiz.attempts.filter(
        (a) => a.learner.toString() !== learnerId
      );

      quiz.attempts.push({
        learner: req.user!._id,
        answers: answers || [],
        score,
        passed,
        attemptedAt: new Date(),
      });

      await quiz.save();

      res.status(200).json({
        success: true,
        score,
        passed,
        passingScore: quiz.passingScore,
        correctCount,
        totalQuestions: quiz.questions.length,
        feedback: passed
          ? 'Congratulations! You passed the quiz.'
          : 'You did not meet the passing score. Review the material and try again.',
      });
    } else {
      const quiz = localStore.quizzes.find((q) => q._id === req.params.quizId);
      if (!quiz) {
        res.status(404).json({ success: false, message: 'Quiz not found' });
        return;
      }

      let correctCount = 0;
      quiz.questions.forEach((q: any, idx: number) => {
        if (answers && answers[idx] === q.correctAnswerIndex) {
          correctCount += 1;
        }
      });

      const score = Math.round((correctCount / quiz.questions.length) * 100);
      const passed = score >= quiz.passingScore;

      if (!quiz.attempts) quiz.attempts = [];
      quiz.attempts = quiz.attempts.filter(
        (a: any) =>
          a.learner?.toString() !== learnerId &&
          a.learner?._id?.toString() !== learnerId
      );

      quiz.attempts.push({
        learner: learnerId,
        answers: answers || [],
        score,
        passed,
        attemptedAt: new Date(),
      });

      res.status(200).json({
        success: true,
        score,
        passed,
        passingScore: quiz.passingScore,
        correctCount,
        totalQuestions: quiz.questions.length,
        feedback: passed
          ? 'Congratulations! You passed the quiz.'
          : 'You did not meet the passing score. Review the material and try again.',
      });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Submit Assignment
// @route   POST /api/progress/assignment/:assignmentId/submit
export const submitAssignment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { content, attachmentUrl } = req.body;
    const learnerId = (req.user!._id || req.user!.id).toString();

    if (!content) {
      res.status(400).json({ success: false, message: 'Submission content or notes are required.' });
      return;
    }

    if (mongoose.connection.readyState === 1) {
      const assignment = await Assignment.findById(req.params.assignmentId);

      if (!assignment) {
        res.status(404).json({ success: false, message: 'Assignment not found' });
        return;
      }

      assignment.submissions = assignment.submissions.filter(
        (s) => s.learner.toString() !== learnerId
      );

      assignment.submissions.push({
        learner: req.user!._id,
        content,
        attachmentUrl: attachmentUrl || '',
        status: 'submitted',
        submittedAt: new Date(),
      });

      await assignment.save();

      res.status(200).json({
        success: true,
        message: 'Assignment submitted successfully!',
      });
    } else {
      const assignment = localStore.assignments.find((a) => a._id === req.params.assignmentId);
      if (!assignment) {
        res.status(404).json({ success: false, message: 'Assignment not found' });
        return;
      }

      if (!assignment.submissions) assignment.submissions = [];
      assignment.submissions = assignment.submissions.filter(
        (s: any) =>
          s.learner?.toString() !== learnerId &&
          s.learner?._id?.toString() !== learnerId
      );

      assignment.submissions.push({
        learner: learnerId,
        content,
        attachmentUrl: attachmentUrl || '',
        status: 'submitted',
        submittedAt: new Date(),
      });

      res.status(200).json({
        success: true,
        message: 'Assignment submitted successfully!',
      });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
