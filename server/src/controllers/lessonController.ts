import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Lesson from '../models/Lesson.js';
import Course from '../models/Course.js';
import Progress from '../models/Progress.js';
import Enrollment from '../models/Enrollment.js';
import { AuthRequest } from '../middleware/auth.js';
import { createNotification } from '../utils/notificationHelper.js';
import localStore from '../utils/localStore.js';

// @desc    Add lesson to course
// @route   POST /api/courses/:courseId/lessons
export const addLesson = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { courseId } = req.params;
    const userId = req.user!._id || req.user!.id;

    if (mongoose.connection.readyState === 1) {
      const course = await Course.findById(courseId);

      if (!course) {
        res.status(404).json({ success: false, message: 'Course not found' });
        return;
      }

      if (
        course.teacher.toString() !== userId.toString() &&
        req.user!.role !== 'admin'
      ) {
        res.status(403).json({ success: false, message: 'Not authorized to add lessons to this course' });
        return;
      }

      const lessonCount = await Lesson.countDocuments({ course: courseId });

      const lesson = await Lesson.create({
        course: courseId,
        title: req.body.title,
        description: req.body.description || '',
        orderIndex: req.body.orderIndex !== undefined ? req.body.orderIndex : lessonCount,
        durationMinutes: req.body.durationMinutes || 15,
        videoUrl: req.body.videoUrl || '',
        thumbnailUrl: req.body.thumbnailUrl || '',
        content: req.body.content || '',
        isFreePreview: req.body.isFreePreview || false,
        materials: req.body.materials || [],
      });

      course.lessonsCount = lessonCount + 1;
      await course.save();

      res.status(201).json({
        success: true,
        message: 'Lesson added successfully',
        data: lesson,
      });
    } else {
      const course = localStore.courses.find((c) => c._id === courseId);
      if (!course) {
        res.status(404).json({ success: false, message: 'Course not found' });
        return;
      }

      const teacherId = course.teacher?._id || course.teacher?.id || course.teacher;
      if (teacherId !== userId && req.user!.role !== 'admin') {
        res.status(403).json({ success: false, message: 'Not authorized to add lessons to this course' });
        return;
      }

      const existingLessons = localStore.lessons.filter((l) => l.course === courseId);
      const newLesson = {
        _id: `lsn_${Date.now()}`,
        course: courseId,
        title: req.body.title,
        description: req.body.description || '',
        orderIndex: req.body.orderIndex !== undefined ? req.body.orderIndex : existingLessons.length,
        durationMinutes: req.body.durationMinutes || 15,
        videoUrl: req.body.videoUrl || '',
        thumbnailUrl: req.body.thumbnailUrl || '',
        content: req.body.content || '',
        isFreePreview: req.body.isFreePreview || false,
        materials: req.body.materials || [],
        createdAt: new Date(),
      };

      localStore.lessons.push(newLesson);
      course.lessonsCount = (course.lessonsCount || existingLessons.length) + 1;

      res.status(201).json({
        success: true,
        message: 'Lesson added successfully',
        data: newLesson,
      });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update lesson
// @route   PUT /api/lessons/:id
export const updateLesson = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!._id || req.user!.id;

    if (mongoose.connection.readyState === 1) {
      const lesson = await Lesson.findById(req.params.id);
      if (!lesson) {
        res.status(404).json({ success: false, message: 'Lesson not found' });
        return;
      }

      const course = await Course.findById(lesson.course);
      if (
        course?.teacher.toString() !== userId.toString() &&
        req.user!.role !== 'admin'
      ) {
        res.status(403).json({ success: false, message: 'Not authorized' });
        return;
      }

      const updated = await Lesson.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      });

      res.status(200).json({
        success: true,
        message: 'Lesson updated successfully',
        data: updated,
      });
    } else {
      const lesson = localStore.lessons.find((l) => l._id === req.params.id);
      if (!lesson) {
        res.status(404).json({ success: false, message: 'Lesson not found' });
        return;
      }

      Object.assign(lesson, req.body);

      res.status(200).json({
        success: true,
        message: 'Lesson updated successfully',
        data: lesson,
      });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete lesson
// @route   DELETE /api/lessons/:id
export const deleteLesson = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!._id || req.user!.id;

    if (mongoose.connection.readyState === 1) {
      const lesson = await Lesson.findById(req.params.id);
      if (!lesson) {
        res.status(404).json({ success: false, message: 'Lesson not found' });
        return;
      }

      const course = await Course.findById(lesson.course);
      if (
        course?.teacher.toString() !== userId.toString() &&
        req.user!.role !== 'admin'
      ) {
        res.status(403).json({ success: false, message: 'Not authorized' });
        return;
      }

      await Lesson.findByIdAndDelete(req.params.id);

      if (course) {
        const remainingCount = await Lesson.countDocuments({ course: course._id });
        course.lessonsCount = remainingCount;
        await course.save();
      }

      res.status(200).json({
        success: true,
        message: 'Lesson deleted successfully',
      });
    } else {
      const lessonIndex = localStore.lessons.findIndex((l) => l._id === req.params.id);
      if (lessonIndex === -1) {
        res.status(404).json({ success: false, message: 'Lesson not found' });
        return;
      }

      const lesson = localStore.lessons[lessonIndex];
      const course = localStore.courses.find((c) => c._id === lesson.course);
      localStore.lessons.splice(lessonIndex, 1);

      if (course) {
        course.lessonsCount = localStore.lessons.filter((l) => l.course === course._id).length;
      }

      res.status(200).json({
        success: true,
        message: 'Lesson deleted successfully',
      });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Mark lesson as completed for learner
// @route   POST /api/lessons/:id/complete
export const markLessonComplete = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const learnerId = req.user!._id || req.user!.id;

    if (mongoose.connection.readyState === 1) {
      const lesson = await Lesson.findById(req.params.id);
      if (!lesson) {
        res.status(404).json({ success: false, message: 'Lesson not found' });
        return;
      }

      const courseId = lesson.course;

      const enrollment = await Enrollment.findOne({
        course: courseId,
        learner: learnerId,
        status: 'active',
      });

      if (!enrollment && req.user!.role !== 'admin') {
        res.status(403).json({ success: false, message: 'You must be enrolled to track progress' });
        return;
      }

      let progress = await Progress.findOne({
        course: courseId,
        learner: learnerId,
      });

      if (!progress) {
        progress = await Progress.create({
          course: courseId,
          learner: learnerId,
          completedLessons: [lesson._id],
          lastWatchedLesson: lesson._id,
        });
      } else {
        const alreadyCompleted = progress.completedLessons.some(
          (id) => id.toString() === lesson._id.toString()
        );
        if (!alreadyCompleted) {
          progress.completedLessons.push(lesson._id);
        }
        progress.lastWatchedLesson = lesson._id;
      }

      const totalLessons = await Lesson.countDocuments({ course: courseId });
      const completedCount = progress.completedLessons.length;
      progress.progressPercentage = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 100;

      if (progress.progressPercentage >= 100 && !progress.isCompleted) {
        progress.isCompleted = true;
        progress.completedAt = new Date();
        if (enrollment) {
          enrollment.status = 'completed';
          enrollment.completedAt = new Date();
          await enrollment.save();
        }

        await createNotification({
          recipientId: learnerId,
          title: 'Course Completed! 🎉',
          message: 'Congratulations! You have completed all lessons in this course.',
          type: 'course',
          link: `/learn/${courseId}`,
          sendEmailAlert: true,
        });
      }

      await progress.save();

      res.status(200).json({
        success: true,
        message: 'Lesson marked as completed',
        progress,
      });
    } else {
      const lesson = localStore.lessons.find((l) => l._id === req.params.id);
      if (!lesson) {
        res.status(404).json({ success: false, message: 'Lesson not found' });
        return;
      }

      const courseId = lesson.course;

      let progress = localStore.progress.find(
        (p) => (p.learner === learnerId || p.learner?._id === learnerId) && p.course === courseId
      );

      if (!progress) {
        progress = {
          _id: `prog_${Date.now()}`,
          learner: learnerId,
          course: courseId,
          completedLessons: [lesson._id],
          progressPercentage: 50,
          isCompleted: false,
          lastWatchedLesson: lesson._id,
          createdAt: new Date(),
        };
        localStore.progress.push(progress);
      } else {
        if (!progress.completedLessons.includes(lesson._id)) {
          progress.completedLessons.push(lesson._id);
        }
        progress.lastWatchedLesson = lesson._id;
      }

      const courseLessons = localStore.lessons.filter((l) => l.course === courseId);
      const totalLessons = courseLessons.length || 1;
      progress.progressPercentage = Math.round((progress.completedLessons.length / totalLessons) * 100);

      if (progress.progressPercentage >= 100) {
        progress.isCompleted = true;
        progress.completedAt = new Date();

        await createNotification({
          recipientId: learnerId,
          title: 'Course Completed! 🎉',
          message: 'Congratulations! You have completed all lessons in this course.',
          type: 'course',
          link: `/learn/${courseId}`,
          sendEmailAlert: true,
        });
      }

      res.status(200).json({
        success: true,
        message: 'Lesson marked as completed',
        progress,
      });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
