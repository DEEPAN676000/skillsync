import { Router } from 'express';
import {
  getMyBookings,
  getBookingById,
  cancelBooking,
} from '../controllers/bookingController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.get('/', protect, getMyBookings);
router.get('/:id', protect, getBookingById);
router.post('/:id/cancel', protect, cancelBooking);

export default router;

