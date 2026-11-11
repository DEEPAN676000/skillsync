import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Booking from '../models/Booking.js';
import Course from '../models/Course.js';
import LiveClass from '../models/LiveClass.js';
import TeacherProfile from '../models/TeacherProfile.js';
import Enrollment from '../models/Enrollment.js';
import Payment from '../models/Payment.js';
import User from '../models/User.js';
import { AuthRequest } from '../middleware/auth.js';
import { createNotification } from '../utils/notificationHelper.js';
import localStore from '../utils/localStore.js';

// @desc    Get bookings for current logged in user (learner or teacher)
// @route   GET /api/bookings
export const getMyBookings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = (req.user!._id || req.user!.id).toString();
    const isTeacher = req.user!.role === 'teacher';

    if (mongoose.connection.readyState === 1) {
      const query = isTeacher ? { teacher: userId } : { learner: userId };

      const bookings = await Booking.find(query)
        .populate('learner', 'name email avatar phone')
        .populate('teacher', 'name email avatar phone')
        .populate('course', 'title slug thumbnail price')
        .populate('liveClass', 'title scheduledAt durationMinutes meetingUrl meetingRoomId')
        .populate('payment')
        .sort({ createdAt: -1 });

      res.status(200).json({ success: true, data: bookings });
    } else {
      const bookings = localStore.bookings.filter((b) => {
        const learnerId = b.learner?._id?.toString() || b.learner?.id?.toString() || b.learner?.toString();
        const teacherId = b.teacher?._id?.toString() || b.teacher?.id?.toString() || b.teacher?.toString();
        return isTeacher ? teacherId === userId : learnerId === userId;
      });

      res.status(200).json({ success: true, data: bookings });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get booking by ID
// @route   GET /api/bookings/:id
export const getBookingById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = (req.user!._id || req.user!.id).toString();
    const isAdmin = req.user!.role === 'admin';

    if (mongoose.connection.readyState === 1) {
      const booking = await Booking.findById(req.params.id)
        .populate('learner', 'name email avatar phone')
        .populate('teacher', 'name email avatar phone')
        .populate('course')
        .populate('liveClass')
        .populate('payment');

      if (!booking) {
        res.status(404).json({ success: false, message: 'Booking not found' });
        return;
      }

      const isLearner = booking.learner._id.toString() === userId;
      const isTeacher = booking.teacher._id.toString() === userId;

      if (!isLearner && !isTeacher && !isAdmin) {
        res.status(403).json({ success: false, message: 'Not authorized to view this booking' });
        return;
      }

      res.status(200).json({ success: true, data: booking });
    } else {
      const booking = localStore.bookings.find((b) => b._id === req.params.id);
      if (!booking) {
        res.status(404).json({ success: false, message: 'Booking not found' });
        return;
      }

      const learnerId = booking.learner?._id?.toString() || booking.learner?.id?.toString() || booking.learner?.toString();
      const teacherId = booking.teacher?._id?.toString() || booking.teacher?.id?.toString() || booking.teacher?.toString();

      if (learnerId !== userId && teacherId !== userId && !isAdmin) {
        res.status(403).json({ success: false, message: 'Not authorized to view this booking' });
        return;
      }

      res.status(200).json({ success: true, data: booking });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Cancel booking & request refund
// @route   POST /api/bookings/:id/cancel
export const cancelBooking = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = (req.user!._id || req.user!.id).toString();
    const isAdmin = req.user!.role === 'admin';

    if (mongoose.connection.readyState === 1) {
      const booking = await Booking.findById(req.params.id);
      if (!booking) {
        res.status(404).json({ success: false, message: 'Booking not found' });
        return;
      }

      const isLearner = booking.learner.toString() === userId;
      const isTeacher = booking.teacher.toString() === userId;

      if (!isLearner && !isTeacher && !isAdmin) {
        res.status(403).json({ success: false, message: 'Not authorized' });
        return;
      }

      if (booking.status === 'cancelled' || booking.status === 'refunded') {
        res.status(400).json({ success: false, message: 'Booking is already cancelled' });
        return;
      }

      booking.status = 'cancelled';
      booking.cancellationReason = req.body.reason || 'Cancelled by user';
      await booking.save();

      if (booking.course) {
        await Enrollment.findOneAndDelete({
          learner: booking.learner,
          course: booking.course,
        });
        const course = await Course.findById(booking.course);
        if (course && course.enrolledCount > 0) {
          course.enrolledCount -= 1;
          await course.save();
        }
      }

      if (booking.liveClass) {
        await LiveClass.findByIdAndUpdate(booking.liveClass, {
          $pull: { enrolledLearners: { learner: booking.learner } },
        });
      }

      if (booking.payment) {
        const payment = await Payment.findById(booking.payment);
        if (payment && payment.status === 'paid') {
          payment.status = 'refunded';
          payment.refundAmount = payment.amount;
          payment.refundReason = booking.cancellationReason;
          await payment.save();
        }
      }

      await createNotification({
        recipientId: booking.learner,
        title: 'Booking Cancelled',
        message: `Your booking #${booking._id.toString().slice(-6)} has been cancelled.`,
        type: 'booking',
        sendEmailAlert: true,
      });

      res.status(200).json({
        success: true,
        message: 'Booking cancelled successfully',
        data: booking,
      });
    } else {
      const booking = localStore.bookings.find((b) => b._id === req.params.id);
      if (!booking) {
        res.status(404).json({ success: false, message: 'Booking not found' });
        return;
      }

      const learnerId = booking.learner?._id?.toString() || booking.learner?.id?.toString() || booking.learner?.toString();
      const teacherId = booking.teacher?._id?.toString() || booking.teacher?.id?.toString() || booking.teacher?.toString();

      if (learnerId !== userId && teacherId !== userId && !isAdmin) {
        res.status(403).json({ success: false, message: 'Not authorized' });
        return;
      }

      booking.status = 'cancelled';
      booking.cancellationReason = req.body.reason || 'Cancelled by user';

      if (booking.course) {
        const courseId = booking.course?._id || booking.course;
        localStore.enrollments = localStore.enrollments.filter(
          (e) => !(e.course === courseId && (e.learner === userId || e.learner?._id === userId))
        );
      }

      await createNotification({
        recipientId: learnerId,
        title: 'Booking Cancelled',
        message: `Your booking #${booking._id.slice(-6)} has been cancelled.`,
        type: 'booking',
        sendEmailAlert: true,
      });

      res.status(200).json({
        success: true,
        message: 'Booking cancelled successfully',
        data: booking,
      });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
