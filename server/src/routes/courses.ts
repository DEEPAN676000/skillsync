import { Router } from 'express';
import {
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
} from '../controllers/courseController.js';
import { addLesson } from '../controllers/lessonController.js';
import { protect, authorize, optionalAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', getCourses);
router.get('/:id', optionalAuth, getCourseById);
router.post('/', protect, authorize('teacher', 'admin'), createCourse);
router.put('/:id', protect, authorize('teacher', 'admin'), updateCourse);
router.delete('/:id', protect, authorize('teacher', 'admin'), deleteCourse);

// Nested route for adding lesson to course
router.post('/:courseId/lessons', protect, authorize('teacher', 'admin'), addLesson);

export default router;

