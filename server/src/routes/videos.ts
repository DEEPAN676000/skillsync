import { Router } from 'express';
import {
  getVideos,
  getVideoById,
  createVideo,
  updateVideo,
  deleteVideo,
  toggleLikeVideo,
  toggleSaveVideo,
} from '../controllers/videoController.js';
import { protect, authorize, optionalAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', optionalAuth, getVideos);
router.get('/:id', optionalAuth, getVideoById);
router.post('/', protect, authorize('teacher', 'admin'), createVideo);
router.put('/:id', protect, authorize('teacher', 'admin'), updateVideo);
router.delete('/:id', protect, authorize('teacher', 'admin'), deleteVideo);
router.post('/:id/like', protect, toggleLikeVideo);
router.post('/:id/save', protect, toggleSaveVideo);

export default router;

