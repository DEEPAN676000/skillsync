import { Router } from 'express';
import {
  getLiveClasses,
  getLiveClassById,
  createLiveClass,
  updateLiveClass,
  cancelLiveClass,
} from '../controllers/liveClassController.js';
import { protect, authorize, optionalAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', getLiveClasses);
router.get('/:id', optionalAuth, getLiveClassById);
router.post('/', protect, authorize('teacher', 'admin'), createLiveClass);
router.put('/:id', protect, authorize('teacher', 'admin'), updateLiveClass);
router.post('/:id/cancel', protect, authorize('teacher', 'admin'), cancelLiveClass);

export default router;

