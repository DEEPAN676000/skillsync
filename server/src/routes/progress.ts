import { Router } from 'express';
import {
  getCourseProgress,
  submitQuiz,
  submitAssignment,
} from '../controllers/progressController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.get('/:courseId', protect, getCourseProgress);
router.post('/quiz/:quizId/submit', protect, submitQuiz);
router.post('/assignment/:assignmentId/submit', protect, submitAssignment);

export default router;

