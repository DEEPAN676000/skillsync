import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Review from '../models/Review.js';
import Course from '../models/Course.js';
import TeacherProfile from '../models/TeacherProfile.js';
import Enrollment from '../models/Enrollment.js';
import Report from '../models/Report.js';
import { AuthRequest } from '../middleware/auth.js';
import localStore from '../utils/localStore.js';

// @desc    Add a review for a course
// @route   POST /api/reviews
export const createReview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { courseId, rating, comment } = req.body;
    const learnerId = (req.user!._id || req.user!.id).toString();

    if (!courseId || !rating || !comment) {
      res.status(400).json({ success: false, message: 'Course ID, rating, and comment are required' });
      return;
    }

    if (mongoose.connection.readyState === 1) {
      const course = await Course.findById(courseId);
      if (!course) {
        res.status(404).json({ success: false, message: 'Course not found' });
        return;
      }

      const enrollment = await Enrollment.findOne({
        learner: learnerId,
        course: courseId,
        status: { $in: ['active', 'completed'] },
      });

      if (!enrollment && req.user!.role !== 'admin') {
        res.status(403).json({
          success: false,
          message: 'Only verified learners who have enrolled in this course can submit a review.',
        });
        return;
      }

      const existing = await Review.findOne({ user: learnerId, course: courseId });
      if (existing) {
        res.status(400).json({ success: false, message: 'You have already reviewed this course.' });
        return;
      }

      const review = await Review.create({
        user: learnerId,
        course: courseId,
        teacher: course.teacher,
        rating: Number(rating),
        comment,
        isVerifiedLearner: true,
      });

      const allCourseReviews = await Review.find({ course: courseId });
      const avgRating =
        allCourseReviews.reduce((acc, item) => acc + item.rating, 0) / allCourseReviews.length;

      course.rating = Number(avgRating.toFixed(1));
      course.numReviews = allCourseReviews.length;
      await course.save();

      const allTeacherReviews = await Review.find({ teacher: course.teacher });
      const teacherAvgRating =
        allTeacherReviews.reduce((acc, item) => acc + item.rating, 0) / allTeacherReviews.length;

      await TeacherProfile.findOneAndUpdate(
        { user: course.teacher },
        {
          rating: Number(teacherAvgRating.toFixed(1)),
          numReviews: allTeacherReviews.length,
        }
      );

      const populated = await Review.findById(review._id).populate('user', 'name avatar');

      res.status(201).json({
        success: true,
        message: 'Review submitted successfully',
        data: populated,
      });
    } else {
      const course = localStore.courses.find((c) => c._id === courseId || c.slug === courseId);
      if (!course) {
        res.status(404).json({ success: false, message: 'Course not found' });
        return;
      }

      const teacherId = course.teacher?._id || course.teacher?.id || course.teacher;

      const review = {
        _id: `rev_${Date.now()}`,
        user: req.user,
        course: course._id,
        teacher: teacherId,
        rating: Number(rating),
        comment,
        isVerifiedLearner: true,
        createdAt: new Date(),
      };

      localStore.reviews.unshift(review);

      const allCourseReviews = localStore.reviews.filter((r) => r.course === course._id);
      const avgRating =
        allCourseReviews.reduce((acc, item) => acc + item.rating, 0) / allCourseReviews.length;

      course.rating = Number(avgRating.toFixed(1));
      course.numReviews = allCourseReviews.length;

      res.status(201).json({
        success: true,
        message: 'Review submitted successfully',
        data: review,
      });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Report inappropriate content / user
// @route   POST /api/reviews/report
export const submitReport = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { targetType, targetId, reason } = req.body;

    if (!targetType || !targetId || !reason) {
      res.status(400).json({ success: false, message: 'Target type, target ID, and reason are required' });
      return;
    }

    if (mongoose.connection.readyState === 1) {
      const report = await Report.create({
        reporter: req.user!._id,
        targetType,
        targetId,
        reason,
        status: 'pending',
      });

      res.status(201).json({
        success: true,
        message: 'Report submitted. Our moderation team will review this shortly.',
        data: report,
      });
    } else {
      const report = {
        _id: `rep_${Date.now()}`,
        reporter: req.user,
        targetType,
        targetId,
        reason,
        status: 'pending',
        createdAt: new Date(),
      };
      localStore.reports.unshift(report);

      res.status(201).json({
        success: true,
        message: 'Report submitted. Our moderation team will review this shortly.',
        data: report,
      });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
