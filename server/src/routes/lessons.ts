import { Router } from 'express';
import {
  updateLesson,
  deleteLesson,
  markLessonComplete,
} from '../controllers/lessonController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();

router.put('/:id', protect, authorize('teacher', 'admin'), updateLesson);
router.delete('/:id', protect, authorize('teacher', 'admin'), deleteLesson);
router.post('/:id/complete', protect, markLessonComplete);

export default router;

