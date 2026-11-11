import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Course from '../models/Course.js';
import Lesson from '../models/Lesson.js';
import Enrollment from '../models/Enrollment.js';
import Progress from '../models/Progress.js';
import Quiz from '../models/Quiz.js';
import Assignment from '../models/Assignment.js';
import Review from '../models/Review.js';
import TeacherProfile from '../models/TeacherProfile.js';
import Subscription from '../models/Subscription.js';
import { AuthRequest } from '../middleware/auth.js';
import { createNotification } from '../utils/notificationHelper.js';
import localStore from '../utils/localStore.js';

// @desc    Get courses with filters, sorting, search, pagination
// @route   GET /api/courses
export const getCourses = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      search,
      category,
      difficulty,
      minPrice,
      maxPrice,
      rating,
      sort = 'popular',
      page = 1,
      limit = 12,
      teacherId,
    } = req.query;

    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 12;
    const skip = (pageNum - 1) * limitNum;

    if (mongoose.connection.readyState === 1) {
      const query: any = { status: 'published', isApproved: true };

      if (teacherId) {
        query.teacher = teacherId;
        delete query.status;
      }

      if (category) {
        query.category = category;
      }

      if (difficulty && difficulty !== 'all') {
        query.difficulty = difficulty;
      }

      if (minPrice !== undefined || maxPrice !== undefined) {
        query.price = {};
        if (minPrice !== undefined && minPrice !== '') query.price.$gte = Number(minPrice);
        if (maxPrice !== undefined && maxPrice !== '') query.price.$lte = Number(maxPrice);
      }

      if (rating) {
        query.rating = { $gte: Number(rating) };
      }

      if (search) {
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { tags: { $in: [new RegExp(String(search), 'i')] } },
        ];
      }

      let sortOptions: any = { enrolledCount: -1, rating: -1 };
      if (sort === 'price_asc') sortOptions = { price: 1 };
      if (sort === 'price_desc') sortOptions = { price: -1 };
      if (sort === 'rating') sortOptions = { rating: -1, numReviews: -1 };
      if (sort === 'newest') sortOptions = { createdAt: -1 };

      const total = await Course.countDocuments(query);
      const courses = await Course.find(query)
        .populate('teacher', 'name avatar email')
        .populate('category', 'name slug icon')
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum);

      res.status(200).json({
        success: true,
        data: courses,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      });
    } else {
      let filtered = [...localStore.courses];

      if (teacherId) {
        filtered = filtered.filter(
          (c) => c.teacher?._id === teacherId || c.teacher?.id === teacherId || c.teacher === teacherId
        );
      } else {
        filtered = filtered.filter((c) => c.status === 'published' && c.isApproved);
      }

      if (category) {
        filtered = filtered.filter(
          (c) => c.category?._id === category || c.category?.slug === category || c.category === category
        );
      }

      if (difficulty && difficulty !== 'all') {
        filtered = filtered.filter((c) => c.difficulty === difficulty);
      }

      if (minPrice !== undefined && minPrice !== '') {
        filtered = filtered.filter((c) => c.price >= Number(minPrice));
      }
      if (maxPrice !== undefined && maxPrice !== '') {
        filtered = filtered.filter((c) => c.price <= Number(maxPrice));
      }

      if (rating) {
        filtered = filtered.filter((c) => (c.rating || 0) >= Number(rating));
      }

      if (search) {
        const s = String(search).toLowerCase();
        filtered = filtered.filter(
          (c) =>
            c.title?.toLowerCase().includes(s) ||
            c.description?.toLowerCase().includes(s) ||
            c.tags?.some((t: string) => t.toLowerCase().includes(s))
        );
      }

      if (sort === 'price_asc') filtered.sort((a, b) => a.price - b.price);
      else if (sort === 'price_desc') filtered.sort((a, b) => b.price - a.price);
      else if (sort === 'rating') filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      else if (sort === 'newest') filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      else filtered.sort((a, b) => (b.enrolledCount || 0) - (a.enrolledCount || 0));

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

// @desc    Get single course by id or slug
// @route   GET /api/courses/:id
export const getCourseById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const currentUserId = req.user?._id || req.user?.id;

    if (mongoose.connection.readyState === 1) {
      const isObjectId = id.match(/^[0-9a-fA-F]{24}$/);

      const course = await Course.findOne(
        isObjectId ? { $or: [{ _id: id }, { slug: id }] } : { slug: id }
      )
        .populate('teacher', 'name avatar email bio')
        .populate('category', 'name slug icon');

      if (!course) {
        res.status(404).json({ success: false, message: 'Course not found' });
        return;
      }

      const teacherProfile = await TeacherProfile.findOne({ user: course.teacher._id });

      let isEnrolled = false;
      let userProgress = null;

      if (req.user) {
        if (
          req.user.role === 'admin' ||
          course.teacher._id.toString() === req.user._id.toString()
        ) {
          isEnrolled = true;
        } else {
          const enrollment = await Enrollment.findOne({
            learner: req.user._id,
            course: course._id,
            status: 'active',
          });
          if (enrollment) {
            isEnrolled = true;
            userProgress = await Progress.findOne({
              learner: req.user._id,
              course: course._id,
            });
          }
        }
      }

      const lessons = await Lesson.find({ course: course._id }).sort({ orderIndex: 1 });

      const sanitizedLessons = lessons.map((lesson) => {
        if (isEnrolled || lesson.isFreePreview) {
          return lesson;
        }
        return {
          _id: lesson._id,
          course: lesson.course,
          title: lesson.title,
          description: lesson.description,
          orderIndex: lesson.orderIndex,
          durationMinutes: lesson.durationMinutes,
          isFreePreview: lesson.isFreePreview,
          materialsCount: lesson.materials ? lesson.materials.length : 0,
          videoUrl: '',
          content: '',
          materials: [],
        };
      });

      const quizzes = await Quiz.find({ course: course._id });
      const assignments = await Assignment.find({ course: course._id });

      const reviews = await Review.find({ course: course._id })
        .populate('user', 'name avatar')
        .sort({ createdAt: -1 });

      res.status(200).json({
        success: true,
        course,
        teacherProfile,
        lessons: sanitizedLessons,
        quizzes,
        assignments,
        reviews,
        isEnrolled,
        progress: userProgress,
      });
    } else {
      const course = localStore.courses.find((c) => c._id === id || c.slug === id);
      if (!course) {
        res.status(404).json({ success: false, message: 'Course not found' });
        return;
      }

      const teacherId = course.teacher?._id || course.teacher?.id || course.teacher;
      const teacherProfile = localStore.teacherProfiles.find(
        (t) => t.user?._id === teacherId || t.user?.id === teacherId || t._id === teacherId
      );

      let isEnrolled = false;
      let userProgress = null;

      if (req.user) {
        if (
          req.user.role === 'admin' ||
          teacherId === currentUserId
        ) {
          isEnrolled = true;
        } else {
          const enrollment = localStore.enrollments.find(
            (e) =>
              (e.learner === currentUserId || e.learner?._id === currentUserId) &&
              e.course === course._id &&
              e.status === 'active'
          );
          if (enrollment) {
            isEnrolled = true;
            userProgress = localStore.progress.find(
              (p) =>
                (p.learner === currentUserId || p.learner?._id === currentUserId) &&
                p.course === course._id
            );
          }
        }
      }

      const courseLessons = localStore.lessons.filter((l) => l.course === course._id);
      const sanitizedLessons = courseLessons.map((lesson) => {
        if (isEnrolled || lesson.isFreePreview) {
          return lesson;
        }
        return {
          ...lesson,
          videoUrl: '',
          content: '',
          materials: [],
        };
      });

      const quizzes = localStore.quizzes.filter((q) => q.course === course._id);
      const assignments = localStore.assignments.filter((a) => a.course === course._id);
      const reviews = localStore.reviews.filter((r) => r.course === course._id);

      res.status(200).json({
        success: true,
        course,
        teacherProfile,
        lessons: sanitizedLessons,
        quizzes,
        assignments,
        reviews,
        isEnrolled,
        progress: userProgress,
      });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create course
// @route   POST /api/courses
export const createCourse = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const teacherId = req.user!._id || req.user!.id;

    if (mongoose.connection.readyState === 1) {
      const sub = await Subscription.findOne({
        teacher: teacherId,
        status: 'active',
      });

      const maxCoursesAllowed = sub?.features?.maxCourses || 3;
      const existingCoursesCount = await Course.countDocuments({ teacher: teacherId });

      if (existingCoursesCount >= maxCoursesAllowed) {
        res.status(403).json({
          success: false,
          message: `Your current plan allows up to ${maxCoursesAllowed} courses. Upgrade your subscription to publish more courses.`,
        });
        return;
      }

      const {
        title,
        description,
        category,
        subCategory,
        thumbnail,
        promoVideo,
        price,
        durationMinutes,
        difficulty,
        requirements,
        whatYouWillLearn,
        tags,
      } = req.body;

      const course = await Course.create({
        teacher: teacherId,
        title,
        description,
        category,
        subCategory: subCategory || '',
        thumbnail:
          thumbnail ||
          'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=600',
        promoVideo: promoVideo || '',
        price: Number(price) || 0,
        durationMinutes: Number(durationMinutes) || 60,
        difficulty: difficulty || 'beginner',
        requirements: requirements || [],
        whatYouWillLearn: whatYouWillLearn || [],
        tags: tags || [],
        status: 'published',
        isApproved: true,
      });

      res.status(201).json({
        success: true,
        message: 'Course created successfully',
        data: course,
      });
    } else {
      const {
        title,
        description,
        category,
        subCategory,
        thumbnail,
        promoVideo,
        price,
        durationMinutes,
        difficulty,
        requirements,
        whatYouWillLearn,
        tags,
      } = req.body;

      const catObj = localStore.categories.find((c) => c._id === category || c.slug === category) || {
        _id: category,
        name: 'Skill',
        slug: 'skill',
        icon: 'BookOpen',
      };

      const newId = `crs_${Date.now()}`;
      const slug = (title || 'course')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

      const course = {
        _id: newId,
        id: newId,
        title,
        slug: `${slug}-${Math.floor(1000 + Math.random() * 9000)}`,
        description,
        category: catObj,
        subCategory: subCategory || '',
        teacher: req.user,
        thumbnail:
          thumbnail ||
          'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=600',
        promoVideo: promoVideo || '',
        price: Number(price) || 0,
        durationMinutes: Number(durationMinutes) || 60,
        difficulty: difficulty || 'beginner',
        requirements: requirements || [],
        whatYouWillLearn: whatYouWillLearn || [],
        tags: tags || [],
        rating: 5.0,
        numReviews: 0,
        lessonsCount: 0,
        enrolledCount: 0,
        status: 'published',
        isApproved: true,
        createdAt: new Date(),
      };

      localStore.courses.unshift(course);

      res.status(201).json({
        success: true,
        message: 'Course created successfully',
        data: course,
      });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update course
// @route   PUT /api/courses/:id
export const updateCourse = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!._id || req.user!.id;

    if (mongoose.connection.readyState === 1) {
      const course = await Course.findById(req.params.id);

      if (!course) {
        res.status(404).json({ success: false, message: 'Course not found' });
        return;
      }

      if (
        course.teacher.toString() !== userId.toString() &&
        req.user!.role !== 'admin'
      ) {
        res.status(403).json({ success: false, message: 'Not authorized to edit this course' });
        return;
      }

      const updated = await Course.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      });

      res.status(200).json({
        success: true,
        message: 'Course updated successfully',
        data: updated,
      });
    } else {
      const course = localStore.courses.find((c) => c._id === req.params.id);
      if (!course) {
        res.status(404).json({ success: false, message: 'Course not found' });
        return;
      }

      const teacherId = course.teacher?._id || course.teacher?.id || course.teacher;
      if (teacherId !== userId && req.user!.role !== 'admin') {
        res.status(403).json({ success: false, message: 'Not authorized to edit this course' });
        return;
      }

      Object.assign(course, req.body);

      res.status(200).json({
        success: true,
        message: 'Course updated successfully',
        data: course,
      });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete course
// @route   DELETE /api/courses/:id
export const deleteCourse = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!._id || req.user!.id;

    if (mongoose.connection.readyState === 1) {
      const course = await Course.findById(req.params.id);

      if (!course) {
        res.status(404).json({ success: false, message: 'Course not found' });
        return;
      }

      if (
        course.teacher.toString() !== userId.toString() &&
        req.user!.role !== 'admin'
      ) {
        res.status(403).json({ success: false, message: 'Not authorized to delete this course' });
        return;
      }

      await Lesson.deleteMany({ course: course._id });
      await Quiz.deleteMany({ course: course._id });
      await Assignment.deleteMany({ course: course._id });
      await Course.findByIdAndDelete(course._id);

      res.status(200).json({
        success: true,
        message: 'Course and related content deleted successfully',
      });
    } else {
      const courseIndex = localStore.courses.findIndex((c) => c._id === req.params.id);
      if (courseIndex === -1) {
        res.status(404).json({ success: false, message: 'Course not found' });
        return;
      }

      const course = localStore.courses[courseIndex];
      const teacherId = course.teacher?._id || course.teacher?.id || course.teacher;
      if (teacherId !== userId && req.user!.role !== 'admin') {
        res.status(403).json({ success: false, message: 'Not authorized to delete this course' });
        return;
      }

      localStore.courses.splice(courseIndex, 1);
      localStore.lessons = localStore.lessons.filter((l) => l.course !== req.params.id);
      localStore.quizzes = localStore.quizzes.filter((q) => q.course !== req.params.id);
      localStore.assignments = localStore.assignments.filter((a) => a.course !== req.params.id);

      res.status(200).json({
        success: true,
        message: 'Course and related content deleted successfully',
      });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
