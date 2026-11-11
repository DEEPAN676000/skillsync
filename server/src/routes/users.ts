import { Router, Response } from 'express';
import mongoose from 'mongoose';
import { protect, AuthRequest } from '../middleware/auth.js';
import Enrollment from '../models/Enrollment.js';
import Course from '../models/Course.js';
import Progress from '../models/Progress.js';
import LiveClass from '../models/LiveClass.js';
import Booking from '../models/Booking.js';
import Payment from '../models/Payment.js';
import LearnerProfile from '../models/LearnerProfile.js';
import TeacherProfile from '../models/TeacherProfile.js';
import Notification from '../models/Notification.js';
import localStore from '../utils/localStore.js';

const router = Router();

// @desc    Get Learner Dashboard Data
// @route   GET /api/users/learner-dashboard
router.get('/learner-dashboard', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const learnerId = (req.user!._id || req.user!.id).toString();

    if (mongoose.connection.readyState === 1) {
      const enrollments = await Enrollment.find({ learner: req.user!._id })
        .populate({
          path: 'course',
          populate: [
            { path: 'teacher', select: 'name avatar email' },
            { path: 'category', select: 'name slug icon' },
          ],
        })
        .sort({ enrolledAt: -1 });

      const progressRecords = await Progress.find({ learner: req.user!._id });
      const progressMap = new Map();
      progressRecords.forEach((p) => {
        progressMap.set(p.course.toString(), p);
      });

      const enrolledCoursesWithProgress = enrollments
        .filter((e) => e.course)
        .map((e) => {
          const c = e.course as any;
          const prog = progressMap.get(c._id.toString());
          return {
            enrollmentId: e._id,
            enrolledAt: e.enrolledAt,
            status: e.status,
            course: c,
            progress: prog
              ? {
                  percentage: prog.progressPercentage,
                  completedLessonsCount: prog.completedLessons.length,
                  isCompleted: prog.isCompleted,
                  lastWatchedLesson: prog.lastWatchedLesson,
                }
              : {
                  percentage: 0,
                  completedLessonsCount: 0,
                  isCompleted: false,
                },
          };
        });

      const upcomingLiveClasses = await LiveClass.find({
        'enrolledLearners.learner': req.user!._id,
        scheduledAt: { $gte: new Date(Date.now() - 2 * 60 * 60 * 1000) },
        status: { $ne: 'cancelled' },
      })
        .populate('teacher', 'name avatar')
        .populate('category', 'name slug')
        .sort({ scheduledAt: 1 });

      const bookings = await Booking.find({ learner: req.user!._id })
        .populate('course', 'title price thumbnail')
        .populate('teacher', 'name avatar')
        .sort({ createdAt: -1 })
        .limit(10);

      const payments = await Payment.find({ user: req.user!._id }).sort({ createdAt: -1 }).limit(10);

      const profile = await LearnerProfile.findOne({ user: req.user!._id })
        .populate('savedCourses', 'title slug price thumbnail rating')
        .populate('savedTeachers', 'name avatar bio');

      const notifications = await Notification.find({ recipient: req.user!._id })
        .sort({ createdAt: -1 })
        .limit(5);

      const recommendedCourses = await Course.find({
        status: 'published',
        isApproved: true,
        _id: { $nin: enrollments.map((e) => (e.course as any)?._id) },
      })
        .populate('teacher', 'name avatar')
        .populate('category', 'name slug icon')
        .limit(6);

      res.status(200).json({
        success: true,
        data: {
          enrolledCourses: enrolledCoursesWithProgress,
          upcomingLiveClasses,
          bookings,
          payments,
          savedCourses: profile?.savedCourses || [],
          savedTeachers: profile?.savedTeachers || [],
          notifications,
          recommendedCourses,
          stats: {
            totalEnrolled: enrollments.length,
            completedCourses: enrollments.filter((e) => e.status === 'completed').length,
            upcomingClassesCount: upcomingLiveClasses.length,
          },
        },
      });
    } else {
      const enrollments = localStore.enrollments.filter(
        (e) => e.learner === learnerId || e.learner?._id === learnerId || e.learner?.id === learnerId
      );

      const enrolledCoursesWithProgress = enrollments.map((e) => {
        const c = localStore.courses.find((x) => x._id === (e.course?._id || e.course)) || e.course;
        const prog = localStore.progress.find(
          (p) =>
            (p.learner === learnerId || p.learner?._id === learnerId) &&
            p.course === (c?._id || c)
        );

        return {
          enrollmentId: e._id,
          enrolledAt: e.enrolledAt || e.createdAt,
          status: e.status || 'active',
          course: c,
          progress: prog
            ? {
                percentage: prog.progressPercentage || 0,
                completedLessonsCount: (prog.completedLessons || []).length,
                isCompleted: prog.isCompleted || false,
                lastWatchedLesson: prog.lastWatchedLesson,
              }
            : {
                percentage: 0,
                completedLessonsCount: 0,
                isCompleted: false,
              },
        };
      });

      const upcomingLiveClasses = localStore.liveClasses.filter((lc) =>
        (lc.enrolledLearners || []).some(
          (el: any) =>
            el.learner === learnerId ||
            el.learner?._id === learnerId ||
            el.learner?.id === learnerId
        )
      );

      const bookings = localStore.bookings.filter(
        (b) => b.learner === learnerId || b.learner?._id === learnerId || b.learner?.id === learnerId
      );

      const payments = localStore.payments.filter(
        (p) => p.user === learnerId || p.user?._id === learnerId || p.user?.id === learnerId
      );

      const notifications = localStore.notifications.filter(
        (n) => n.recipient === learnerId || n.recipient?._id === learnerId
      );

      const enrolledCourseIds = new Set(enrollments.map((e) => e.course?._id || e.course));
      const recommendedCourses = localStore.courses
        .filter((c) => !enrolledCourseIds.has(c._id))
        .slice(0, 6);

      res.status(200).json({
        success: true,
        data: {
          enrolledCourses: enrolledCoursesWithProgress,
          upcomingLiveClasses,
          bookings: bookings.slice(0, 10),
          payments: payments.slice(0, 10),
          savedCourses: localStore.courses.slice(0, 2),
          savedTeachers: localStore.teacherProfiles.slice(0, 2),
          notifications: notifications.slice(0, 5),
          recommendedCourses,
          stats: {
            totalEnrolled: enrollments.length,
            completedCourses: enrollments.filter((e) => e.status === 'completed').length,
            upcomingClassesCount: upcomingLiveClasses.length,
          },
        },
      });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get Teacher Dashboard Data
// @route   GET /api/users/teacher-dashboard
router.get('/teacher-dashboard', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const teacherId = (req.user!._id || req.user!.id).toString();

    if (mongoose.connection.readyState === 1) {
      const profile = await TeacherProfile.findOne({ user: req.user!._id }).populate('categories');

      const courses = await Course.find({ teacher: req.user!._id })
        .populate('category', 'name slug icon')
        .sort({ createdAt: -1 });

      const liveClasses = await LiveClass.find({ teacher: req.user!._id })
        .populate('category', 'name slug')
        .sort({ scheduledAt: 1 });

      const bookings = await Booking.find({ teacher: req.user!._id })
        .populate('learner', 'name email avatar phone')
        .populate('course', 'title price')
        .sort({ createdAt: -1 });

      const payments = await Payment.find({
        itemId: { $in: courses.map((c) => c._id) },
        status: 'paid',
      });

      const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
      const teacherEarnings = Math.round(totalRevenue * 0.85);

      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const monthlyPayments = payments.filter((p) => new Date(p.createdAt) >= startOfMonth);
      const monthlyEarnings = Math.round(monthlyPayments.reduce((sum, p) => sum + p.amount, 0) * 0.85);

      const distinctStudents = await Enrollment.distinct('learner', {
        course: { $in: courses.map((c) => c._id) },
      });

      const notifications = await Notification.find({ recipient: req.user!._id })
        .sort({ createdAt: -1 })
        .limit(6);

      res.status(200).json({
        success: true,
        data: {
          profile,
          courses,
          liveClasses,
          bookings: bookings.slice(0, 15),
          notifications,
          stats: {
            totalEarnings: teacherEarnings,
            monthlyEarnings,
            totalStudents: distinctStudents.length,
            activeCoursesCount: courses.filter((c) => c.status === 'published').length,
            avgRating: profile?.rating || 5.0,
            totalReviews: profile?.numReviews || 0,
            totalBookingsCount: bookings.length,
          },
        },
      });
    } else {
      const profile = localStore.teacherProfiles.find(
        (tp) => tp.user?._id === teacherId || tp.user?.id === teacherId || tp._id === teacherId
      );

      const courses = localStore.courses.filter(
        (c) => c.teacher?._id === teacherId || c.teacher?.id === teacherId || c.teacher === teacherId
      );

      const liveClasses = localStore.liveClasses.filter(
        (lc) => lc.teacher?._id === teacherId || lc.teacher?.id === teacherId || lc.teacher === teacherId
      );

      const bookings = localStore.bookings.filter(
        (b) => b.teacher?._id === teacherId || b.teacher?.id === teacherId || b.teacher === teacherId
      );

      const totalEarnings = profile?.totalEarnings || 42500;
      const monthlyEarnings = Math.round(totalEarnings * 0.35);

      const notifications = localStore.notifications.filter(
        (n) => n.recipient === teacherId || n.recipient?._id === teacherId
      );

      res.status(200).json({
        success: true,
        data: {
          profile: profile || {
            user: req.user,
            title: 'Master Instructor',
            bio: 'Passionate skill instructor.',
            skills: ['Teaching'],
            hourlyRate: 800,
            rating: 4.9,
            numReviews: 24,
            verificationStatus: 'verified',
            subscriptionTier: 'pro',
          },
          courses,
          liveClasses,
          bookings: bookings.slice(0, 15),
          notifications: notifications.slice(0, 6),
          stats: {
            totalEarnings,
            monthlyEarnings,
            totalStudents: profile?.totalStudentsCount || 85,
            activeCoursesCount: courses.length,
            avgRating: profile?.rating || 4.9,
            totalReviews: profile?.numReviews || 24,
            totalBookingsCount: bookings.length || 18,
          },
        },
      });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Bookmark or unbookmark course
// @route   POST /api/users/bookmark-course/:id
router.post('/bookmark-course/:id', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const courseId = req.params.id;
    const userId = (req.user!._id || req.user!.id).toString();

    if (mongoose.connection.readyState === 1) {
      let profile = await LearnerProfile.findOne({ user: req.user!._id });

      if (!profile) {
        profile = await LearnerProfile.create({ user: req.user!._id });
      }

      const index = profile.savedCourses.findIndex((c) => c.toString() === courseId);
      let bookmarked = false;

      if (index === -1) {
        profile.savedCourses.push(courseId as any);
        bookmarked = true;
      } else {
        profile.savedCourses.splice(index, 1);
        bookmarked = false;
      }

      await profile.save();

      res.status(200).json({ success: true, bookmarked });
    } else {
      let profile = localStore.learnerProfiles.find(
        (lp) => lp.user?._id === userId || lp.user?.id === userId || lp.user === userId
      );

      if (!profile) {
        profile = {
          _id: `lp_${userId}`,
          user: req.user,
          savedCourses: [],
          savedTeachers: [],
          savedVideos: [],
        };
        localStore.learnerProfiles.push(profile);
      }

      const index = profile.savedCourses.indexOf(courseId);
      let bookmarked = false;
      if (index === -1) {
        profile.savedCourses.push(courseId);
        bookmarked = true;
      } else {
        profile.savedCourses.splice(index, 1);
        bookmarked = false;
      }

      res.status(200).json({ success: true, bookmarked });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
