import { Request, Response } from 'express';
import mongoose from 'mongoose';
import User from '../models/User.js';
import TeacherProfile from '../models/TeacherProfile.js';
import Course from '../models/Course.js';
import Video from '../models/Video.js';
import Booking from '../models/Booking.js';
import Payment from '../models/Payment.js';
import Report from '../models/Report.js';
import Subscription from '../models/Subscription.js';
import Category from '../models/Category.js';
import { AuthRequest } from '../middleware/auth.js';
import { createNotification } from '../utils/notificationHelper.js';
import localStore from '../utils/localStore.js';

// @desc    Get aggregate platform statistics
// @route   GET /api/admin/stats
export const getAdminStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (mongoose.connection.readyState === 1) {
      const totalUsers = await User.countDocuments();
      const totalTeachers = await User.countDocuments({ role: 'teacher' });
      const totalLearners = await User.countDocuments({ role: 'learner' });
      const totalCourses = await Course.countDocuments();
      const totalVideos = await Video.countDocuments();
      const totalBookings = await Booking.countDocuments();
      const pendingVerifications = await TeacherProfile.countDocuments({ verificationStatus: 'pending' });
      const pendingReports = await Report.countDocuments({ status: 'pending' });

      const payments = await Payment.find({ status: 'paid' });
      const totalRevenue = payments.reduce((acc, curr) => acc + curr.amount, 0);

      const recentPayments = await Payment.find({ status: 'paid' })
        .populate('user', 'name email avatar')
        .sort({ createdAt: -1 })
        .limit(5);

      res.status(200).json({
        success: true,
        data: {
          totalUsers,
          totalTeachers,
          totalLearners,
          totalCourses,
          totalVideos,
          totalBookings,
          totalRevenue,
          pendingVerifications,
          pendingReports,
          recentPayments,
        },
      });
    } else {
      const totalUsers = localStore.users.length;
      const totalTeachers = localStore.users.filter((u) => u.role === 'teacher').length;
      const totalLearners = localStore.users.filter((u) => u.role === 'learner').length;
      const totalCourses = localStore.courses.length;
      const totalVideos = localStore.videos.length;
      const totalBookings = localStore.bookings.length;
      const pendingVerifications = localStore.teacherProfiles.filter((t) => t.verificationStatus === 'pending').length;
      const pendingReports = localStore.reports.filter((r) => r.status === 'pending').length;

      const paidPayments = localStore.payments.filter((p) => p.status === 'paid');
      const totalRevenue = paidPayments.reduce((acc, curr) => acc + curr.amount, 0);
      const recentPayments = paidPayments.slice(0, 5);

      res.status(200).json({
        success: true,
        data: {
          totalUsers,
          totalTeachers,
          totalLearners,
          totalCourses,
          totalVideos,
          totalBookings,
          totalRevenue,
          pendingVerifications,
          pendingReports,
          recentPayments,
        },
      });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all users with search & role filter
// @route   GET /api/admin/users
export const getAllUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { role, search, page = 1, limit = 20 } = req.query;
    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 20;
    const skip = (pageNum - 1) * limitNum;

    if (mongoose.connection.readyState === 1) {
      const query: any = {};
      if (role && role !== 'all') {
        query.role = role;
      }
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
        ];
      }

      const total = await User.countDocuments(query);
      const users = await User.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum);

      res.status(200).json({
        success: true,
        data: users,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      });
    } else {
      let filtered = [...localStore.users];

      if (role && role !== 'all') {
        filtered = filtered.filter((u) => u.role === role);
      }
      if (search) {
        const s = String(search).toLowerCase();
        filtered = filtered.filter((u) => u.name?.toLowerCase().includes(s) || u.email?.toLowerCase().includes(s));
      }

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

// @desc    Update user status / role
// @route   PUT /api/admin/users/:id
export const updateUserRole = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { role } = req.body;

    if (mongoose.connection.readyState === 1) {
      const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
      if (!user) {
        res.status(404).json({ success: false, message: 'User not found' });
        return;
      }
      res.status(200).json({ success: true, data: user });
    } else {
      const user = localStore.users.find((u) => u._id === req.params.id || u.id === req.params.id);
      if (!user) {
        res.status(404).json({ success: false, message: 'User not found' });
        return;
      }
      user.role = role;
      res.status(200).json({ success: true, data: user });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
export const deleteUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (mongoose.connection.readyState === 1) {
      await User.findByIdAndDelete(req.params.id);
      await TeacherProfile.findOneAndDelete({ user: req.params.id });
      res.status(200).json({ success: true, message: 'User deleted successfully' });
    } else {
      localStore.users = localStore.users.filter((u) => u._id !== req.params.id && u.id !== req.params.id);
      localStore.teacherProfiles = localStore.teacherProfiles.filter(
        (tp) => tp.user?._id !== req.params.id && tp.user !== req.params.id
      );
      res.status(200).json({ success: true, message: 'User deleted successfully' });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get teacher verification requests
// @route   GET /api/admin/verifications
export const getVerifications = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (mongoose.connection.readyState === 1) {
      const requests = await TeacherProfile.find({
        verificationStatus: { $in: ['pending', 'verified', 'rejected'] },
      })
        .populate('user', 'name email avatar phone bio createdAt')
        .sort({ updatedAt: -1 });

      res.status(200).json({ success: true, data: requests });
    } else {
      res.status(200).json({ success: true, data: localStore.teacherProfiles });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Approve or reject teacher verification
// @route   PUT /api/admin/verifications/:profileId
export const handleVerification = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, note } = req.body;
    if (!['verified', 'rejected'].includes(status)) {
      res.status(400).json({ success: false, message: 'Status must be verified or rejected' });
      return;
    }

    if (mongoose.connection.readyState === 1) {
      const profile = await TeacherProfile.findById(req.params.profileId).populate('user', 'name email');
      if (!profile) {
        res.status(404).json({ success: false, message: 'Profile not found' });
        return;
      }

      profile.verificationStatus = status;
      profile.verificationNote = note || '';
      await profile.save();

      await createNotification({
        recipientId: profile.user._id,
        title: status === 'verified' ? 'Instructor Profile Verified! 🛡️' : 'Verification Status Update',
        message:
          status === 'verified'
            ? 'Congratulations! Your SkillSync instructor credentials have been verified. A verified badge now appears on your public profile.'
            : `Your verification request was reviewed. Feedback: ${note || 'Document requirements not met.'}`,
        type: 'system',
        link: '/dashboard/teacher',
        sendEmailAlert: true,
      });

      res.status(200).json({
        success: true,
        message: `Teacher status set to ${status}`,
        data: profile,
      });
    } else {
      const profile = localStore.teacherProfiles.find((tp) => tp._id === req.params.profileId);
      if (!profile) {
        res.status(404).json({ success: false, message: 'Profile not found' });
        return;
      }

      profile.verificationStatus = status;
      profile.verificationNote = note || '';

      const teacherUserId = profile.user?._id || profile.user?.id;
      if (teacherUserId) {
        await createNotification({
          recipientId: teacherUserId,
          title: status === 'verified' ? 'Instructor Profile Verified! 🛡️' : 'Verification Status Update',
          message:
            status === 'verified'
              ? 'Congratulations! Your SkillSync instructor credentials have been verified.'
              : `Verification feedback: ${note || 'Document requirements not met.'}`,
          type: 'system',
          link: '/dashboard/teacher',
          sendEmailAlert: true,
        });
      }

      res.status(200).json({
        success: true,
        message: `Teacher status set to ${status}`,
        data: profile,
      });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get moderation reports
// @route   GET /api/admin/reports
export const getReports = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (mongoose.connection.readyState === 1) {
      const reports = await Report.find()
        .populate('reporter', 'name email avatar')
        .sort({ createdAt: -1 });

      res.status(200).json({ success: true, data: reports });
    } else {
      res.status(200).json({ success: true, data: localStore.reports });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Resolve moderation report
// @route   PUT /api/admin/reports/:id
export const handleReport = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, adminNotes, actionTaken } = req.body;

    if (mongoose.connection.readyState === 1) {
      const report = await Report.findById(req.params.id);

      if (!report) {
        res.status(404).json({ success: false, message: 'Report not found' });
        return;
      }

      report.status = status || 'resolved';
      report.adminNotes = adminNotes || '';
      await report.save();

      if (actionTaken === 'hide_content') {
        if (report.targetType === 'video') {
          await Video.findByIdAndUpdate(report.targetId, { isModerated: true });
        } else if (report.targetType === 'course') {
          await Course.findByIdAndUpdate(report.targetId, { isApproved: false });
        }
      }

      res.status(200).json({
        success: true,
        message: 'Report status updated',
        data: report,
      });
    } else {
      const report = localStore.reports.find((r) => r._id === req.params.id);
      if (!report) {
        res.status(404).json({ success: false, message: 'Report not found' });
        return;
      }

      report.status = status || 'resolved';
      report.adminNotes = adminNotes || '';

      if (actionTaken === 'hide_content') {
        if (report.targetType === 'video') {
          const v = localStore.videos.find((x) => x._id === report.targetId);
          if (v) v.isModerated = true;
        } else if (report.targetType === 'course') {
          const c = localStore.courses.find((x) => x._id === report.targetId);
          if (c) c.isApproved = false;
        }
      }

      res.status(200).json({
        success: true,
        message: 'Report status updated',
        data: report,
      });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
