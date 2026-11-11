import { Request, Response } from 'express';
import crypto from 'crypto';
import mongoose from 'mongoose';
import Payment from '../models/Payment.js';
import Booking from '../models/Booking.js';
import Course from '../models/Course.js';
import LiveClass from '../models/LiveClass.js';
import Enrollment from '../models/Enrollment.js';
import Progress from '../models/Progress.js';
import TeacherProfile from '../models/TeacherProfile.js';
import Subscription from '../models/Subscription.js';
import { AuthRequest } from '../middleware/auth.js';
import razorpayInstance, {
  isRazorpayConfigured,
  verifyPaymentSignature,
  verifyWebhookSignature,
} from '../config/razorpay.js';
import { createNotification } from '../utils/notificationHelper.js';
import localStore from '../utils/localStore.js';

// @desc    Create Razorpay Order for Course, Live Class, 1-on-1, or Subscription
// @route   POST /api/payments/create-order
export const createOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { itemType, itemId, scheduledStartTime, scheduledEndTime, notes } = req.body;
    const learnerId = (req.user!._id || req.user!.id).toString();

    if (!itemType || !itemId) {
      res.status(400).json({ success: false, message: 'itemType and itemId are required' });
      return;
    }

    let amount = 0;
    let teacherId: any = null;
    let title = '';
    let bookingType: 'course_enrollment' | 'live_class' | '1_on_1_session' = 'course_enrollment';

    if (mongoose.connection.readyState === 1) {
      if (itemType === 'course') {
        const course = await Course.findById(itemId);
        if (!course) {
          res.status(404).json({ success: false, message: 'Course not found' });
          return;
        }

        const existing = await Enrollment.findOne({ learner: learnerId, course: course._id, status: 'active' });
        if (existing) {
          res.status(400).json({ success: false, message: 'You are already enrolled in this course.' });
          return;
        }

        amount = course.price;
        teacherId = course.teacher;
        title = course.title;
        bookingType = 'course_enrollment';
      } else if (itemType === 'live_class') {
        const liveClass = await LiveClass.findById(itemId);
        if (!liveClass) {
          res.status(404).json({ success: false, message: 'Live class not found' });
          return;
        }

        const alreadyEnrolled = liveClass.enrolledLearners.some(
          (e) => e.learner.toString() === learnerId
        );
        if (alreadyEnrolled) {
          res.status(400).json({ success: false, message: 'You are already registered for this live class.' });
          return;
        }

        if (liveClass.enrolledLearners.length >= liveClass.maxCapacity) {
          res.status(400).json({ success: false, message: 'This live class has reached full capacity.' });
          return;
        }

        amount = liveClass.price;
        teacherId = liveClass.teacher;
        title = liveClass.title;
        bookingType = 'live_class';
      } else if (itemType === 'booking') {
        const teacherProfile = await TeacherProfile.findById(itemId);
        if (!teacherProfile) {
          res.status(404).json({ success: false, message: 'Teacher profile not found' });
          return;
        }

        amount = teacherProfile.hourlyRate;
        teacherId = teacherProfile.user;
        title = `1-on-1 Mentorship with Teacher`;
        bookingType = '1_on_1_session';
      } else if (itemType === 'subscription') {
        const plan = itemId;
        amount = plan === 'pro' ? 2499 : 999;
        teacherId = learnerId;
        title = `SkillSync ${plan.toUpperCase()} Plan Subscription`;
      }

      const receipt = `rcpt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

      if (amount === 0 && itemType !== 'subscription') {
        const booking = await Booking.create({
          learner: learnerId,
          teacher: teacherId,
          course: itemType === 'course' ? itemId : undefined,
          liveClass: itemType === 'live_class' ? itemId : undefined,
          type: bookingType,
          status: 'confirmed',
          amount: 0,
          notes: notes || 'Free enrollment',
        });

        if (itemType === 'course') {
          await Enrollment.create({
            learner: learnerId,
            course: itemId,
            booking: booking._id,
            status: 'active',
          });
          await Progress.create({
            learner: learnerId,
            course: itemId,
          });
          await Course.findByIdAndUpdate(itemId, { $inc: { enrolledCount: 1 } });
        } else if (itemType === 'live_class') {
          await LiveClass.findByIdAndUpdate(itemId, {
            $push: { enrolledLearners: { learner: learnerId, booking: booking._id } },
          });
        }

        if (teacherId) {
          await TeacherProfile.findOneAndUpdate(
            { user: teacherId },
            { $inc: { totalStudentsCount: 1 } }
          );
        }

        await createNotification({
          recipientId: learnerId,
          title: 'Enrollment Confirmed!',
          message: `You have successfully enrolled in "${title}".`,
          type: 'course',
          link: itemType === 'course' ? `/learn/${itemId}` : `/live/${itemId}`,
          sendEmailAlert: true,
        });

        res.status(200).json({
          success: true,
          isFree: true,
          message: 'Successfully enrolled for free!',
          bookingId: booking._id,
        });
        return;
      }

      let orderId = '';
      if (isRazorpayConfigured()) {
        try {
          const order = await razorpayInstance.orders.create({
            amount: Math.round(amount * 100),
            currency: 'INR',
            receipt,
            notes: {
              itemType,
              itemId: itemId.toString(),
              userId: learnerId,
            },
          });
          orderId = order.id;
        } catch (err: any) {
          console.error('[Razorpay Order Creation Error]:', err.message);
          orderId = `order_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        }
      } else {
        orderId = `order_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      }

      const payment = await Payment.create({
        user: learnerId,
        orderId,
        amount,
        currency: 'INR',
        status: 'created',
        itemType,
        itemId,
        receipt,
      });

      let bookingId: any = null;
      if (itemType !== 'subscription') {
        const booking = await Booking.create({
          learner: learnerId,
          teacher: teacherId,
          course: itemType === 'course' ? itemId : undefined,
          liveClass: itemType === 'live_class' ? itemId : undefined,
          type: bookingType,
          status: 'pending',
          amount,
          payment: payment._id,
          scheduledStartTime: scheduledStartTime ? new Date(scheduledStartTime) : undefined,
          scheduledEndTime: scheduledEndTime ? new Date(scheduledEndTime) : undefined,
          notes: notes || '',
        });
        bookingId = booking._id;
      }

      res.status(200).json({
        success: true,
        isFree: false,
        orderId,
        amount,
        currency: 'INR',
        keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_SkillSync2026',
        paymentId: payment._id,
        bookingId,
        itemTitle: title,
      });
    } else {
      // LocalStore fallback
      if (itemType === 'course') {
        const course = localStore.courses.find((c) => c._id === itemId || c.slug === itemId);
        if (!course) {
          res.status(404).json({ success: false, message: 'Course not found' });
          return;
        }

        const isAlreadyEnrolled = localStore.enrollments.some(
          (e) => (e.learner === learnerId || e.learner?._id === learnerId) && e.course === course._id && e.status === 'active'
        );
        if (isAlreadyEnrolled) {
          res.status(400).json({ success: false, message: 'You are already enrolled in this course.' });
          return;
        }

        amount = course.price;
        teacherId = course.teacher?._id || course.teacher?.id || course.teacher;
        title = course.title;
        bookingType = 'course_enrollment';
      } else if (itemType === 'live_class') {
        const liveClass = localStore.liveClasses.find((lc) => lc._id === itemId);
        if (!liveClass) {
          res.status(404).json({ success: false, message: 'Live class not found' });
          return;
        }

        amount = liveClass.price;
        teacherId = liveClass.teacher?._id || liveClass.teacher?.id || liveClass.teacher;
        title = liveClass.title;
        bookingType = 'live_class';
      } else if (itemType === 'subscription') {
        const plan = itemId;
        amount = plan === 'pro' ? 2499 : 999;
        teacherId = learnerId;
        title = `SkillSync ${plan.toUpperCase()} Plan Subscription`;
      } else {
        amount = 500;
        title = '1-on-1 Mentorship';
        bookingType = '1_on_1_session';
      }

      const receipt = `rcpt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

      if (amount === 0 && itemType !== 'subscription') {
        const booking = {
          _id: `bkg_${Date.now()}`,
          learner: req.user,
          teacher: teacherId,
          course: itemType === 'course' ? itemId : undefined,
          liveClass: itemType === 'live_class' ? itemId : undefined,
          type: bookingType,
          status: 'confirmed',
          amount: 0,
          createdAt: new Date(),
        };
        localStore.bookings.unshift(booking);

        if (itemType === 'course') {
          localStore.enrollments.push({
            _id: `enr_${Date.now()}`,
            learner: req.user,
            course: itemId,
            status: 'active',
            enrolledAt: new Date(),
          });
          localStore.progress.push({
            _id: `prog_${Date.now()}`,
            learner: req.user,
            course: itemId,
            completedLessons: [],
            progressPercentage: 0,
            isCompleted: false,
          });
          const c = localStore.courses.find((x) => x._id === itemId);
          if (c) c.enrolledCount = (c.enrolledCount || 0) + 1;
        }

        await createNotification({
          recipientId: learnerId,
          title: 'Enrollment Confirmed!',
          message: `You have successfully enrolled in "${title}".`,
          type: 'course',
          link: itemType === 'course' ? `/learn/${itemId}` : `/live/${itemId}`,
          sendEmailAlert: true,
        });

        res.status(200).json({
          success: true,
          isFree: true,
          message: 'Successfully enrolled for free!',
          bookingId: booking._id,
        });
        return;
      }

      const orderId = `order_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const payment = {
        _id: `pay_${Date.now()}`,
        user: req.user,
        orderId,
        amount,
        currency: 'INR',
        status: 'created',
        itemType,
        itemId,
        receipt,
        createdAt: new Date(),
      };
      localStore.payments.unshift(payment);

      const booking = {
        _id: `bkg_${Date.now()}`,
        learner: req.user,
        teacher: teacherId,
        course: itemType === 'course' ? itemId : undefined,
        liveClass: itemType === 'live_class' ? itemId : undefined,
        type: bookingType,
        status: 'pending',
        amount,
        payment: payment._id,
        createdAt: new Date(),
      };
      localStore.bookings.unshift(booking);

      res.status(200).json({
        success: true,
        isFree: false,
        orderId,
        amount,
        currency: 'INR',
        keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_SkillSync2026',
        paymentId: payment._id,
        bookingId: booking._id,
        itemTitle: title,
      });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Verify Razorpay Payment Signature on Server
// @route   POST /api/payments/verify
export const verifyPayment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId, paymentId } = req.body;
    const currentUserId = (req.user!._id || req.user!.id).toString();

    if (!razorpay_order_id) {
      res.status(400).json({ success: false, message: 'Missing order details for verification.' });
      return;
    }

    if (mongoose.connection.readyState === 1) {
      const payment = await Payment.findOne({
        $or: [{ orderId: razorpay_order_id }, { _id: paymentId }],
      });

      if (!payment) {
        res.status(404).json({ success: false, message: 'Payment record not found' });
        return;
      }

      if (isRazorpayConfigured() && razorpay_payment_id && razorpay_signature) {
        const isValid = verifyPaymentSignature(
          razorpay_order_id,
          razorpay_payment_id,
          razorpay_signature
        );

        if (!isValid) {
          payment.status = 'failed';
          await payment.save();
          res.status(400).json({ success: false, message: 'Payment signature verification failed. Possible tampering.' });
          return;
        }
      }

      payment.status = 'paid';
      payment.paymentId = razorpay_payment_id || `pay_${Date.now()}`;
      payment.signature = razorpay_signature || 'verified_signature';
      await payment.save();

      if (payment.itemType === 'subscription') {
        const plan = payment.itemId.toString() as 'premium' | 'pro';
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + 1);

        const features =
          plan === 'pro'
            ? { maxCourses: 50, maxVideos: 100, commissionRate: 5, priorityDiscovery: true, analyticsEnabled: true }
            : { maxCourses: 15, maxVideos: 30, commissionRate: 10, priorityDiscovery: true, analyticsEnabled: true };

        await Subscription.findOneAndUpdate(
          { teacher: payment.user },
          { plan, startDate: new Date(), endDate, status: 'active', price: payment.amount, payment: payment._id, features },
          { upsert: true, new: true }
        );

        await TeacherProfile.findOneAndUpdate(
          { user: payment.user },
          { subscriptionTier: plan, subscriptionExpiresAt: endDate }
        );

        await createNotification({
          recipientId: payment.user,
          title: 'Subscription Activated! 🌟',
          message: `Your SkillSync ${plan.toUpperCase()} plan is now active until ${endDate.toLocaleDateString()}. Enjoy expanded limits and priority features!`,
          type: 'subscription',
          link: '/dashboard/teacher',
          sendEmailAlert: true,
        });

        res.status(200).json({
          success: true,
          message: 'Subscription payment verified and plan activated!',
          payment,
        });
        return;
      }

      const booking = await Booking.findOne({
        $or: [{ payment: payment._id }, { _id: bookingId }],
      });

      if (booking) {
        booking.status = 'confirmed';
        await booking.save();

        if (booking.course) {
          await Enrollment.create({
            learner: booking.learner,
            course: booking.course,
            booking: booking._id,
            status: 'active',
          });

          await Progress.create({
            learner: booking.learner,
            course: booking.course,
          });

          await Course.findByIdAndUpdate(booking.course, { $inc: { enrolledCount: 1 } });
        }

        if (booking.liveClass) {
          await LiveClass.findByIdAndUpdate(booking.liveClass, {
            $push: { enrolledLearners: { learner: booking.learner, booking: booking._id } },
          });
        }

        if (booking.teacher) {
          await TeacherProfile.findOneAndUpdate(
            { user: booking.teacher },
            {
              $inc: {
                totalEarnings: Math.round(payment.amount * 0.85),
                totalStudentsCount: 1,
              },
            }
          );
        }

        await createNotification({
          recipientId: booking.learner,
          title: 'Payment & Booking Confirmed! 🎉',
          message: `Your payment of ₹${payment.amount} was successful. Booking #${booking._id.toString().slice(-6)} is confirmed.`,
          type: 'payment',
          link: booking.course ? `/learn/${booking.course}` : `/live/${booking.liveClass}`,
          sendEmailAlert: true,
        });

        await createNotification({
          recipientId: booking.teacher,
          title: 'New Student Enrollment! 💰',
          message: `A student has booked your session. You earned ₹${Math.round(payment.amount * 0.85)}!`,
          type: 'booking',
          link: '/dashboard/teacher',
          sendEmailAlert: true,
        });
      }

      res.status(200).json({
        success: true,
        message: 'Payment verified and booking confirmed successfully!',
        payment,
        booking,
      });
    } else {
      // LocalStore fallback
      const payment = localStore.payments.find((p) => p.orderId === razorpay_order_id || p._id === paymentId);
      if (payment) {
        payment.status = 'paid';
        payment.paymentId = razorpay_payment_id || `pay_${Date.now()}`;
        payment.signature = razorpay_signature || 'verified_mock';
      }

      const booking = localStore.bookings.find((b) => b.payment === payment?._id || b._id === bookingId);
      if (booking) {
        booking.status = 'confirmed';

        if (booking.course) {
          const courseId = booking.course?._id || booking.course;
          localStore.enrollments.push({
            _id: `enr_${Date.now()}`,
            learner: req.user,
            course: courseId,
            booking: booking._id,
            status: 'active',
            enrolledAt: new Date(),
          });

          localStore.progress.push({
            _id: `prog_${Date.now()}`,
            learner: req.user,
            course: courseId,
            completedLessons: [],
            progressPercentage: 0,
            isCompleted: false,
          });

          const c = localStore.courses.find((x) => x._id === courseId);
          if (c) c.enrolledCount = (c.enrolledCount || 0) + 1;
        }

        if (booking.liveClass) {
          const lc = localStore.liveClasses.find((x) => x._id === booking.liveClass);
          if (lc) {
            if (!lc.enrolledLearners) lc.enrolledLearners = [];
            lc.enrolledLearners.push({ learner: req.user, booking: booking._id });
          }
        }

        await createNotification({
          recipientId: currentUserId,
          title: 'Payment & Booking Confirmed! 🎉',
          message: `Your payment was successful. Booking confirmed.`,
          type: 'payment',
          link: booking.course ? `/learn/${booking.course}` : `/live/${booking.liveClass}`,
          sendEmailAlert: true,
        });
      }

      res.status(200).json({
        success: true,
        message: 'Payment verified and booking confirmed successfully!',
        payment,
        booking,
      });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Razorpay Webhook Handler
// @route   POST /api/payments/webhook
export const handleWebhook = async (req: Request, res: Response): Promise<void> => {
  try {
    const signature = req.headers['x-razorpay-signature'] as string;
    const bodyStr = JSON.stringify(req.body);

    if (isRazorpayConfigured() && signature) {
      const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || 'rzp_webhook_secret_dev';
      const isValid = verifyWebhookSignature(bodyStr, signature, webhookSecret);
      if (!isValid) {
        res.status(400).json({ success: false, message: 'Invalid webhook signature' });
        return;
      }
    }

    const event = req.body.event;
    console.log(`[Razorpay Webhook] Received event: ${event}`);

    res.status(200).json({ status: 'ok', received: true });
  } catch (error: any) {
    console.error('[Razorpay Webhook Error]:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get transaction history
// @route   GET /api/payments/transactions
export const getTransactions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = (req.user!._id || req.user!.id).toString();
    const isAdmin = req.user!.role === 'admin';

    if (mongoose.connection.readyState === 1) {
      const query = isAdmin ? {} : { user: userId };

      const transactions = await Payment.find(query)
        .populate('user', 'name email avatar')
        .sort({ createdAt: -1 });

      res.status(200).json({ success: true, data: transactions });
    } else {
      const transactions = localStore.payments.filter((p) => {
        if (isAdmin) return true;
        const pUserId = p.user?._id?.toString() || p.user?.id?.toString() || p.user?.toString();
        return pUserId === userId;
      });

      res.status(200).json({ success: true, data: transactions });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
