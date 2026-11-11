import { Router } from 'express';
import {
  getSubscriptionPlans,
  getMySubscription,
} from '../controllers/subscriptionController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();

router.get('/plans', getSubscriptionPlans);
router.get('/my', protect, authorize('teacher'), getMySubscription);

export default router;

