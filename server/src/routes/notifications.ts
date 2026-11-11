import { Router } from 'express';
import {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from '../controllers/notificationController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.get('/', protect, getMyNotifications);
router.put('/:id/read', protect, markAsRead);
router.put('/read-all', protect, markAllAsRead);
router.delete('/:id', protect, deleteNotification);

export default router;

