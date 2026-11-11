import { Router } from 'express';
import {
  createOrder,
  verifyPayment,
  getTransactions,
  handleWebhook,
} from '../controllers/paymentController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.post('/create-order', protect, createOrder);
router.post('/verify', protect, verifyPayment);
router.post('/webhook', handleWebhook);
router.get('/transactions', protect, getTransactions);

export default router;
