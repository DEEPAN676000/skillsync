import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Video from '../models/Video.js';
import User from '../models/User.js';
import LearnerProfile from '../models/LearnerProfile.js';
import Subscription from '../models/Subscription.js';
import { AuthRequest } from '../middleware/auth.js';
import localStore from '../utils/localStore.js';

// @desc    Get showcase videos feed with filtering & pagination
// @route   GET /api/videos
export const getVideos = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { category, search, teacherId, page = 1, limit = 12 } = req.query;
    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 12;
    const skip = (pageNum - 1) * limitNum;
    const userId = req.user?._id?.toString() || req.user?.id?.toString();

    if (mongoose.connection.readyState === 1) {
      const query: any = { isModerated: false };

      if (category) query.category = category;
      if (teacherId) query.teacher = teacherId;

      if (search) {
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { tags: { $in: [new RegExp(String(search), 'i')] } },
        ];
      }

      const total = await Video.countDocuments(query);
      const videos = await Video.find(query)
        .populate('teacher', 'name avatar email bio')
        .populate('category', 'name slug icon')
        .populate('relatedCourse', 'title slug price thumbnail')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum);

      const enrichedVideos = videos.map((v) => {
        const obj = v.toObject();
        return {
          ...obj,
          likesCount: v.likes.length,
          isLiked: userId ? v.likes.some((id) => id.toString() === userId) : false,
          isSaved: userId ? v.saves.some((id) => id.toString() === userId) : false,
        };
      });

      res.status(200).json({
        success: true,
        data: enrichedVideos,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      });
    } else {
      let filtered = [...localStore.videos];

      if (teacherId) {
        filtered = filtered.filter(
          (v) => v.teacher?._id === teacherId || v.teacher?.id === teacherId || v.teacher === teacherId
        );
      }

      if (category) {
        filtered = filtered.filter(
          (v) => v.category?._id === category || v.category?.slug === category || v.category === category
        );
      }

      if (search) {
        const s = String(search).toLowerCase();
        filtered = filtered.filter(
          (v) =>
            v.title?.toLowerCase().includes(s) ||
            v.description?.toLowerCase().includes(s) ||
            v.tags?.some((t: string) => t.toLowerCase().includes(s))
        );
      }

      const total = filtered.length;
      const paginated = filtered.slice(skip, skip + limitNum);

      const enriched = paginated.map((v) => {
        const likes = v.likes || [];
        const saves = v.saves || [];
        return {
          ...v,
          likesCount: likes.length,
          isLiked: userId ? likes.some((id: any) => id.toString() === userId) : false,
          isSaved: userId ? saves.some((id: any) => id.toString() === userId) : false,
        };
      });

      res.status(200).json({
        success: true,
        data: enriched,
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

// @desc    Get video by ID & increment view count
// @route   GET /api/videos/:id
export const getVideoById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id?.toString() || req.user?.id?.toString();

    if (mongoose.connection.readyState === 1) {
      const video = await Video.findById(req.params.id)
        .populate('teacher', 'name avatar email bio')
        .populate('category', 'name slug icon')
        .populate('relatedCourse', 'title slug price thumbnail rating numReviews');

      if (!video) {
        res.status(404).json({ success: false, message: 'Video not found' });
        return;
      }

      video.views += 1;
      await video.save();

      const result = {
        ...video.toObject(),
        likesCount: video.likes.length,
        isLiked: userId ? video.likes.some((id) => id.toString() === userId) : false,
        isSaved: userId ? video.saves.some((id) => id.toString() === userId) : false,
      };

      res.status(200).json({ success: true, data: result });
    } else {
      const video = localStore.videos.find((v) => v._id === req.params.id);
      if (!video) {
        res.status(404).json({ success: false, message: 'Video not found' });
        return;
      }

      video.views = (video.views || 0) + 1;
      const likes = video.likes || [];
      const saves = video.saves || [];

      const result = {
        ...video,
        likesCount: likes.length,
        isLiked: userId ? likes.some((id: any) => id.toString() === userId) : false,
        isSaved: userId ? saves.some((id: any) => id.toString() === userId) : false,
      };

      res.status(200).json({ success: true, data: result });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Upload showcase video
// @route   POST /api/videos
export const createVideo = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const teacherId = req.user!._id || req.user!.id;
    const { title, description, category, videoUrl, thumbnailUrl, relatedCourse, tags, durationSeconds } = req.body;

    if (!title || !videoUrl || !category) {
      res.status(400).json({ success: false, message: 'Title, category, and video URL are required' });
      return;
    }

    if (mongoose.connection.readyState === 1) {
      const sub = await Subscription.findOne({ teacher: teacherId, status: 'active' });
      const maxVideos = sub?.features?.maxVideos || 5;
      const existingVideoCount = await Video.countDocuments({ teacher: teacherId });

      if (existingVideoCount >= maxVideos) {
        res.status(403).json({
          success: false,
          message: `Your current plan allows up to ${maxVideos} showcase videos. Upgrade your subscription to upload more.`,
        });
        return;
      }

      const video = await Video.create({
        teacher: teacherId,
        title,
        description: description || '',
        category,
        videoUrl,
        thumbnailUrl:
          thumbnailUrl ||
          'https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&q=80&w=600',
        relatedCourse: relatedCourse || undefined,
        tags: tags || [],
        durationSeconds: Number(durationSeconds) || 60,
      });

      const populated = await Video.findById(video._id)
        .populate('teacher', 'name avatar')
        .populate('category', 'name slug');

      res.status(201).json({
        success: true,
        message: 'Showcase video uploaded successfully',
        data: populated,
      });
    } else {
      const catObj = localStore.categories.find((c) => c._id === category || c.slug === category) || {
        _id: category,
        name: 'Skill Showcase',
        slug: 'skill-showcase',
      };

      const relCourse = relatedCourse ? localStore.courses.find((c) => c._id === relatedCourse) : undefined;

      const newVideo = {
        _id: `vid_${Date.now()}`,
        teacher: req.user,
        title,
        description: description || '',
        category: catObj,
        videoUrl,
        thumbnailUrl:
          thumbnailUrl ||
          'https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&q=80&w=600',
        relatedCourse: relCourse,
        durationSeconds: Number(durationSeconds) || 60,
        views: 0,
        likes: [],
        saves: [],
        tags: tags || [],
        isModerated: false,
        createdAt: new Date(),
      };

      localStore.videos.unshift(newVideo);

      res.status(201).json({
        success: true,
        message: 'Showcase video uploaded successfully',
        data: newVideo,
      });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update video
// @route   PUT /api/videos/:id
export const updateVideo = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!._id || req.user!.id;

    if (mongoose.connection.readyState === 1) {
      const video = await Video.findById(req.params.id);
      if (!video) {
        res.status(404).json({ success: false, message: 'Video not found' });
        return;
      }

      if (video.teacher.toString() !== userId.toString() && req.user!.role !== 'admin') {
        res.status(403).json({ success: false, message: 'Not authorized to edit this video' });
        return;
      }

      const updated = await Video.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      });

      res.status(200).json({ success: true, message: 'Video updated successfully', data: updated });
    } else {
      const video = localStore.videos.find((v) => v._id === req.params.id);
      if (!video) {
        res.status(404).json({ success: false, message: 'Video not found' });
        return;
      }

      const teacherId = video.teacher?._id || video.teacher?.id || video.teacher;
      if (teacherId !== userId && req.user!.role !== 'admin') {
        res.status(403).json({ success: false, message: 'Not authorized to edit this video' });
        return;
      }

      Object.assign(video, req.body);
      res.status(200).json({ success: true, message: 'Video updated successfully', data: video });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete video
// @route   DELETE /api/videos/:id
export const deleteVideo = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!._id || req.user!.id;

    if (mongoose.connection.readyState === 1) {
      const video = await Video.findById(req.params.id);
      if (!video) {
        res.status(404).json({ success: false, message: 'Video not found' });
        return;
      }

      if (video.teacher.toString() !== userId.toString() && req.user!.role !== 'admin') {
        res.status(403).json({ success: false, message: 'Not authorized' });
        return;
      }

      await Video.findByIdAndDelete(req.params.id);
      res.status(200).json({ success: true, message: 'Video deleted successfully' });
    } else {
      const index = localStore.videos.findIndex((v) => v._id === req.params.id);
      if (index === -1) {
        res.status(404).json({ success: false, message: 'Video not found' });
        return;
      }

      const video = localStore.videos[index];
      const teacherId = video.teacher?._id || video.teacher?.id || video.teacher;
      if (teacherId !== userId && req.user!.role !== 'admin') {
        res.status(403).json({ success: false, message: 'Not authorized' });
        return;
      }

      localStore.videos.splice(index, 1);
      res.status(200).json({ success: true, message: 'Video deleted successfully' });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Toggle like video
// @route   POST /api/videos/:id/like
export const toggleLikeVideo = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = (req.user!._id || req.user!.id).toString();

    if (mongoose.connection.readyState === 1) {
      const video = await Video.findById(req.params.id);
      if (!video) {
        res.status(404).json({ success: false, message: 'Video not found' });
        return;
      }

      const index = video.likes.indexOf(userId as any);
      let liked = false;
      if (index === -1) {
        video.likes.push(userId as any);
        liked = true;
      } else {
        video.likes.splice(index, 1);
        liked = false;
      }

      await video.save();

      res.status(200).json({
        success: true,
        liked,
        likesCount: video.likes.length,
      });
    } else {
      const video = localStore.videos.find((v) => v._id === req.params.id);
      if (!video) {
        res.status(404).json({ success: false, message: 'Video not found' });
        return;
      }

      if (!video.likes) video.likes = [];
      const index = video.likes.findIndex((id: any) => id.toString() === userId);
      let liked = false;

      if (index === -1) {
        video.likes.push(userId);
        liked = true;
      } else {
        video.likes.splice(index, 1);
        liked = false;
      }

      res.status(200).json({
        success: true,
        liked,
        likesCount: video.likes.length,
      });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Toggle save video to bookmarks
// @route   POST /api/videos/:id/save
export const toggleSaveVideo = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = (req.user!._id || req.user!.id).toString();

    if (mongoose.connection.readyState === 1) {
      const video = await Video.findById(req.params.id);
      if (!video) {
        res.status(404).json({ success: false, message: 'Video not found' });
        return;
      }

      const index = video.saves.indexOf(userId as any);
      let saved = false;
      if (index === -1) {
        video.saves.push(userId as any);
        saved = true;
      } else {
        video.saves.splice(index, 1);
        saved = false;
      }

      await video.save();

      const profile = await LearnerProfile.findOne({ user: userId });
      if (profile) {
        const pIdx = profile.savedVideos.indexOf(video._id);
        if (saved && pIdx === -1) {
          profile.savedVideos.push(video._id);
        } else if (!saved && pIdx !== -1) {
          profile.savedVideos.splice(pIdx, 1);
        }
        await profile.save();
      }

      res.status(200).json({
        success: true,
        saved,
      });
    } else {
      const video = localStore.videos.find((v) => v._id === req.params.id);
      if (!video) {
        res.status(404).json({ success: false, message: 'Video not found' });
        return;
      }

      if (!video.saves) video.saves = [];
      const index = video.saves.findIndex((id: any) => id.toString() === userId);
      let saved = false;

      if (index === -1) {
        video.saves.push(userId);
        saved = true;
      } else {
        video.saves.splice(index, 1);
        saved = false;
      }

      res.status(200).json({
        success: true,
        saved,
      });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
