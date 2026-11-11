import { Request, Response } from 'express';
import mongoose from 'mongoose';
import LiveClass from '../models/LiveClass.js';
import User from '../models/User.js';
import Booking from '../models/Booking.js';
import { AuthRequest } from '../middleware/auth.js';
import { generateJitsiRoom } from '../services/jitsiService.js';
import { createNotification } from '../utils/notificationHelper.js';
import localStore from '../utils/localStore.js';

// @desc    Get all upcoming public live classes
// @route   GET /api/live-classes
export const getLiveClasses = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category, teacherId, status = 'scheduled', page = 1, limit = 10 } = req.query;
    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 10;
    const skip = (pageNum - 1) * limitNum;

    if (mongoose.connection.readyState === 1) {
      const query: any = {};
      if (status && status !== 'all') {
        query.status = status;
      }
      if (category) {
        query.category = category;
      }
      if (teacherId) {
        query.teacher = teacherId;
      }

      const total = await LiveClass.countDocuments(query);
      const classes = await LiveClass.find(query)
        .populate('teacher', 'name avatar email bio')
        .populate('category', 'name slug icon')
        .sort({ scheduledAt: 1 })
        .skip(skip)
        .limit(limitNum);

      res.status(200).json({
        success: true,
        data: classes,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      });
    } else {
      let filtered = [...localStore.liveClasses];

      if (status && status !== 'all') {
        filtered = filtered.filter((lc) => lc.status === status);
      }
      if (category) {
        filtered = filtered.filter(
          (lc) => lc.category?._id === category || lc.category?.slug === category || lc.category === category
        );
      }
      if (teacherId) {
        filtered = filtered.filter(
          (lc) => lc.teacher?._id === teacherId || lc.teacher?.id === teacherId || lc.teacher === teacherId
        );
      }

      filtered.sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());

      const total = filtered.length;
      const paginated = filtered.slice(skip, skip + limitNum);

      res.status(200).json({
        success: true,
        data: paginated,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum) || 1,
        },
      });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single live class details
// @route   GET /api/live-classes/:id
export const getLiveClassById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const currentUserId = req.user?._id?.toString() || req.user?.id?.toString();

    if (mongoose.connection.readyState === 1) {
      const liveClass = await LiveClass.findById(req.params.id)
        .populate('teacher', 'name avatar email bio')
        .populate('category', 'name slug icon')
        .populate('course', 'title slug thumbnail')
        .populate('enrolledLearners.learner', 'name avatar email');

      if (!liveClass) {
        res.status(404).json({ success: false, message: 'Live class not found' });
        return;
      }

      let isAuthorizedToJoin = false;
      if (req.user) {
        const isTeacher = liveClass.teacher._id.toString() === currentUserId;
        const isAdmin = req.user.role === 'admin';
        const isEnrolled = liveClass.enrolledLearners.some(
          (e) => e.learner && (e.learner as any)._id?.toString() === currentUserId
        );

        if (isTeacher || isAdmin || isEnrolled || liveClass.price === 0) {
          isAuthorizedToJoin = true;
        }
      }

      res.status(200).json({
        success: true,
        data: liveClass,
        isAuthorizedToJoin,
      });
    } else {
      const liveClass = localStore.liveClasses.find((lc) => lc._id === req.params.id);
      if (!liveClass) {
        res.status(404).json({ success: false, message: 'Live class not found' });
        return;
      }

      let isAuthorizedToJoin = false;
      if (req.user) {
        const teacherId = liveClass.teacher?._id?.toString() || liveClass.teacher?.id?.toString() || liveClass.teacher?.toString();
        const isTeacher = teacherId === currentUserId;
        const isAdmin = req.user.role === 'admin';
        const isEnrolled = (liveClass.enrolledLearners || []).some(
          (e: any) =>
            e.learner?.toString() === currentUserId ||
            e.learner?._id?.toString() === currentUserId ||
            e.learner?.id?.toString() === currentUserId
        );

        if (isTeacher || isAdmin || isEnrolled || liveClass.price === 0) {
          isAuthorizedToJoin = true;
        }
      }

      res.status(200).json({
        success: true,
        data: liveClass,
        isAuthorizedToJoin,
      });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create live class session
// @route   POST /api/live-classes
export const createLiveClass = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, description, category, course, scheduledAt, durationMinutes, price, maxCapacity } = req.body;
    const userId = (req.user!._id || req.user!.id).toString();

    if (!title || !category || !scheduledAt) {
      res.status(400).json({ success: false, message: 'Title, category, and scheduled date/time are required' });
      return;
    }

    const classDate = new Date(scheduledAt);
    if (isNaN(classDate.getTime())) {
      res.status(400).json({ success: false, message: 'Invalid scheduled date/time format' });
      return;
    }

    const room = generateJitsiRoom(title, userId);

    if (mongoose.connection.readyState === 1) {
      const liveClass = await LiveClass.create({
        teacher: req.user!._id,
        title,
        description: description || '',
        category,
        course: course || undefined,
        scheduledAt: classDate,
        durationMinutes: Number(durationMinutes) || 60,
        price: Number(price) || 0,
        maxCapacity: Number(maxCapacity) || 20,
        meetingRoomId: room.roomName,
        meetingUrl: room.meetingUrl,
        status: 'scheduled',
      });

      res.status(201).json({
        success: true,
        message: 'Live class scheduled successfully',
        data: liveClass,
      });
    } else {
      const catObj = localStore.categories.find((c) => c._id === category || c.slug === category) || {
        _id: category,
        name: 'Live Workshop',
        slug: 'live-workshop',
      };

      const newClass = {
        _id: `lc_${Date.now()}`,
        teacher: req.user,
        title,
        description: description || '',
        category: catObj,
        course: course || undefined,
        scheduledAt: classDate,
        durationMinutes: Number(durationMinutes) || 60,
        price: Number(price) || 0,
        maxCapacity: Number(maxCapacity) || 20,
        meetingRoomId: room.roomName,
        meetingUrl: room.meetingUrl,
        status: 'scheduled',
        enrolledLearners: [],
        createdAt: new Date(),
      };

      localStore.liveClasses.push(newClass);

      res.status(201).json({
        success: true,
        message: 'Live class scheduled successfully',
        data: newClass,
      });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update / Reschedule live class
// @route   PUT /api/live-classes/:id
export const updateLiveClass = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = (req.user!._id || req.user!.id).toString();

    if (mongoose.connection.readyState === 1) {
      const liveClass = await LiveClass.findById(req.params.id);
      if (!liveClass) {
        res.status(404).json({ success: false, message: 'Live class not found' });
        return;
      }

      if (liveClass.teacher.toString() !== userId && req.user!.role !== 'admin') {
        res.status(403).json({ success: false, message: 'Not authorized to update this live class' });
        return;
      }

      const { scheduledAt, durationMinutes, title, description, maxCapacity, status } = req.body;
      const oldDate = liveClass.scheduledAt;

      if (title) liveClass.title = title;
      if (description !== undefined) liveClass.description = description;
      if (durationMinutes) liveClass.durationMinutes = Number(durationMinutes);
      if (maxCapacity) liveClass.maxCapacity = Number(maxCapacity);
      if (status) liveClass.status = status;
      if (scheduledAt) liveClass.scheduledAt = new Date(scheduledAt);

      await liveClass.save();

      if (scheduledAt && new Date(scheduledAt).getTime() !== oldDate.getTime()) {
        for (const item of liveClass.enrolledLearners) {
          await createNotification({
            recipientId: item.learner,
            title: 'Live Class Rescheduled ⏰',
            message: `The live class "${liveClass.title}" has been rescheduled to ${new Date(scheduledAt).toLocaleString()}.`,
            type: 'live_class',
            link: `/live/${liveClass._id}`,
            sendEmailAlert: true,
          });
        }
      }

      res.status(200).json({
        success: true,
        message: 'Live class updated successfully',
        data: liveClass,
      });
    } else {
      const liveClass = localStore.liveClasses.find((lc) => lc._id === req.params.id);
      if (!liveClass) {
        res.status(404).json({ success: false, message: 'Live class not found' });
        return;
      }

      const teacherId = liveClass.teacher?._id?.toString() || liveClass.teacher?.id?.toString() || liveClass.teacher?.toString();
      if (teacherId !== userId && req.user!.role !== 'admin') {
        res.status(403).json({ success: false, message: 'Not authorized to update this live class' });
        return;
      }

      const { scheduledAt, durationMinutes, title, description, maxCapacity, status } = req.body;
      if (title) liveClass.title = title;
      if (description !== undefined) liveClass.description = description;
      if (durationMinutes) liveClass.durationMinutes = Number(durationMinutes);
      if (maxCapacity) liveClass.maxCapacity = Number(maxCapacity);
      if (status) liveClass.status = status;
      if (scheduledAt) liveClass.scheduledAt = new Date(scheduledAt);

      res.status(200).json({
        success: true,
        message: 'Live class updated successfully',
        data: liveClass,
      });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Cancel live class
// @route   POST /api/live-classes/:id/cancel
export const cancelLiveClass = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = (req.user!._id || req.user!.id).toString();

    if (mongoose.connection.readyState === 1) {
      const liveClass = await LiveClass.findById(req.params.id);
      if (!liveClass) {
        res.status(404).json({ success: false, message: 'Live class not found' });
        return;
      }

      if (liveClass.teacher.toString() !== userId && req.user!.role !== 'admin') {
        res.status(403).json({ success: false, message: 'Not authorized' });
        return;
      }

      liveClass.status = 'cancelled';
      liveClass.cancellationReason = req.body.reason || 'Instructor cancelled the session';
      await liveClass.save();

      for (const item of liveClass.enrolledLearners) {
        await createNotification({
          recipientId: item.learner,
          title: 'Class Cancelled',
          message: `The live class "${liveClass.title}" was cancelled. Reason: ${liveClass.cancellationReason}. If you paid a booking fee, a refund will be processed.`,
          type: 'live_class',
          sendEmailAlert: true,
        });
      }

      res.status(200).json({
        success: true,
        message: 'Live class cancelled and enrolled learners notified.',
      });
    } else {
      const liveClass = localStore.liveClasses.find((lc) => lc._id === req.params.id);
      if (!liveClass) {
        res.status(404).json({ success: false, message: 'Live class not found' });
        return;
      }

      const teacherId = liveClass.teacher?._id?.toString() || liveClass.teacher?.id?.toString() || liveClass.teacher?.toString();
      if (teacherId !== userId && req.user!.role !== 'admin') {
        res.status(403).json({ success: false, message: 'Not authorized' });
        return;
      }

      liveClass.status = 'cancelled';
      liveClass.cancellationReason = req.body.reason || 'Instructor cancelled the session';

      for (const item of liveClass.enrolledLearners || []) {
        await createNotification({
          recipientId: item.learner,
          title: 'Class Cancelled',
          message: `The live class "${liveClass.title}" was cancelled. Reason: ${liveClass.cancellationReason}.`,
          type: 'live_class',
          sendEmailAlert: true,
        });
      }

      res.status(200).json({
        success: true,
        message: 'Live class cancelled and enrolled learners notified.',
      });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
