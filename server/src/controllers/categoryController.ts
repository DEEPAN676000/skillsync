import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Category from '../models/Category.js';
import Course from '../models/Course.js';
import TeacherProfile from '../models/TeacherProfile.js';
import localStore from '../utils/localStore.js';

export const getCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    if (mongoose.connection.readyState === 1) {
      const categories = await Category.find().sort({ order: 1, name: 1 });
      const enriched = await Promise.all(
        categories.map(async (cat) => {
          const courseCount = await Course.countDocuments({ category: cat._id, status: 'published' });
          const teacherCount = await TeacherProfile.countDocuments({ categories: cat._id });
          return {
            ...cat.toObject(),
            courseCount,
            teacherCount,
          };
        })
      );
      res.status(200).json({ success: true, data: enriched });
    } else {
      res.status(200).json({ success: true, data: localStore.categories });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getCategoryBySlug = async (req: Request, res: Response): Promise<void> => {
  try {
    const slug = req.params.slug;
    if (mongoose.connection.readyState === 1) {
      const category = await Category.findOne({ slug });
      if (!category) {
        res.status(404).json({ success: false, message: 'Category not found' });
        return;
      }
      const courses = await Course.find({ category: category._id, status: 'published' })
        .populate('teacher', 'name avatar')
        .limit(12);
      res.status(200).json({ success: true, category, courses });
    } else {
      const category = localStore.categories.find((c) => c.slug === slug || c._id === slug);
      const courses = localStore.courses.filter((c) => c.category?.slug === slug || c.category?._id === slug);
      res.status(200).json({ success: true, category, courses });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    if (mongoose.connection.readyState === 1) {
      const category = await Category.create(req.body);
      res.status(201).json({ success: true, data: category });
    } else {
      const newCat = { _id: `cat_${Date.now()}`, ...req.body };
      localStore.categories.push(newCat);
      res.status(201).json({ success: true, data: newCat });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    if (mongoose.connection.readyState === 1) {
      const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
      res.status(200).json({ success: true, data: category });
    } else {
      const idx = localStore.categories.findIndex((c) => c._id === req.params.id);
      if (idx !== -1) localStore.categories[idx] = { ...localStore.categories[idx], ...req.body };
      res.status(200).json({ success: true, data: localStore.categories[idx] });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    if (mongoose.connection.readyState === 1) {
      await Category.findByIdAndDelete(req.params.id);
    } else {
      localStore.categories = localStore.categories.filter((c) => c._id !== req.params.id);
    }
    res.status(200).json({ success: true, message: 'Category deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
