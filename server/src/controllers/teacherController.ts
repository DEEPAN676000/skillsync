import { Request, Response } from 'express';
import mongoose from 'mongoose';
import TeacherProfile from '../models/TeacherProfile.js';
import User from '../models/User.js';
import Course from '../models/Course.js';
import Review from '../models/Review.js';
import Video from '../models/Video.js';
import { AuthRequest } from '../middleware/auth.js';
import localStore from '../utils/localStore.js';

export const getTeachers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { search, category, minRate, maxRate, rating, verifiedOnly, sort = 'rating' } = req.query;

    if (mongoose.connection.readyState === 1) {
      const query: any = {};
      if (category) query.categories = category;
      if (minRate || maxRate) {
        query.hourlyRate = {};
        if (minRate) query.hourlyRate.$gte = Number(minRate);
        if (maxRate) query.hourlyRate.$lte = Number(maxRate);
      }
      if (rating) query.rating = { $gte: Number(rating) };
      if (verifiedOnly === 'true') query.verificationStatus = 'verified';

      const total = await TeacherProfile.countDocuments(query);
      const teachers = await TeacherProfile.find(query)
        .populate('user', 'name avatar email phone bio')
        .populate('categories', 'name slug icon')
        .sort({ rating: -1 });

      res.status(200).json({
        success: true,
        data: teachers,
        pagination: { page: 1, limit: 12, total, pages: Math.ceil(total / 12) },
      });
    } else {
      let filtered = [...localStore.teacherProfiles];
      if (verifiedOnly === 'true') {
        filtered = filtered.filter((t) => t.verificationStatus === 'verified');
      }
      if (search) {
        const s = String(search).toLowerCase();
        filtered = filtered.filter(
          (t) =>
            t.user?.name?.toLowerCase().includes(s) ||
            t.title?.toLowerCase().includes(s) ||
            t.skills?.some((sk: string) => sk.toLowerCase().includes(s))
        );
      }
      if (category) {
        filtered = filtered.filter((t) => t.categories?.some((c: any) => c._id === category || c.slug === category));
      }
      if (minRate) filtered = filtered.filter((t) => t.hourlyRate >= Number(minRate));
      if (maxRate) filtered = filtered.filter((t) => t.hourlyRate <= Number(maxRate));
      if (rating) filtered = filtered.filter((t) => t.rating >= Number(rating));

      res.status(200).json({
        success: true,
        data: filtered,
        pagination: { page: 1, limit: 12, total: filtered.length, pages: 1 },
      });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getTeacherById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (mongoose.connection.readyState === 1) {
      const profile = await TeacherProfile.findOne({
        $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { user: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }],
      })
        .populate('user', 'name avatar email phone bio createdAt')
        .populate('categories', 'name slug icon');

      if (!profile) {
        res.status(404).json({ success: false, message: 'Teacher profile not found' });
        return;
      }

      const courses = await Course.find({ teacher: profile.user._id, status: 'published' });
      const videos = await Video.find({ teacher: profile.user._id });
      const reviews = await Review.find({ teacher: profile.user._id }).populate('user', 'name avatar');

      res.status(200).json({ success: true, profile, courses, videos, reviews });
    } else {
      const profile = localStore.teacherProfiles.find(
        (tp) => tp._id === id || tp.user?._id === id || tp.user?.id === id
      );

      if (!profile) {
        res.status(404).json({ success: false, message: 'Teacher profile not found' });
        return;
      }

      const teacherUserId = profile.user?._id || profile.user?.id;
      const courses = localStore.courses.filter(
        (c) => c.teacher?._id === teacherUserId || c.teacher?.id === teacherUserId
      );
      const videos = localStore.videos.filter(
        (v) => v.teacher?._id === teacherUserId || v.teacher?.id === teacherUserId
      );
      const reviews = localStore.reviews.filter((r) => r.teacher === teacherUserId);

      res.status(200).json({ success: true, profile, courses, videos, reviews });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateTeacherProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user._id || req.user.id;

    if (mongoose.connection.readyState === 1) {
      let profile = await TeacherProfile.findOne({ user: userId });
      if (!profile) {
        profile = await TeacherProfile.create({ user: userId, ...req.body });
      } else {
        Object.assign(profile, req.body);
        await profile.save();
      }
      res.status(200).json({ success: true, message: 'Teacher profile updated successfully', data: profile });
    } else {
      let profile = localStore.teacherProfiles.find((tp) => tp.user?._id === userId || tp.user?.id === userId);
      if (!profile) {
        profile = { _id: `tp_${userId}`, user: req.user, ...req.body };
        localStore.teacherProfiles.push(profile);
      } else {
        Object.assign(profile, req.body);
      }
      res.status(200).json({ success: true, message: 'Teacher profile updated successfully', data: profile });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const requestVerification = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user._id || req.user.id;
    if (mongoose.connection.readyState === 1) {
      const profile = await TeacherProfile.findOne({ user: userId });
      if (profile) {
        profile.verificationStatus = 'pending';
        profile.verificationNote = req.body.note || '';
        await profile.save();
      }
      res.status(200).json({ success: true, message: 'Verification request submitted for admin review' });
    } else {
      const profile = localStore.teacherProfiles.find((tp) => tp.user?._id === userId || tp.user?.id === userId);
      if (profile) {
        profile.verificationStatus = 'pending';
        profile.verificationNote = req.body.note || '';
      }
      res.status(200).json({ success: true, message: 'Verification request submitted for admin review' });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
