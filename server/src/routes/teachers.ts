import { Router } from 'express';
import {
  getTeachers,
  getTeacherById,
  updateTeacherProfile,
  requestVerification,
} from '../controllers/teacherController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();

router.get('/', getTeachers);
router.get('/:id', getTeacherById);
router.put('/profile', protect, authorize('teacher', 'admin'), updateTeacherProfile);
router.post('/verify-request', protect, authorize('teacher'), requestVerification);

export default router;

