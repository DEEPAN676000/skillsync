import { Router } from 'express';
import {
  getAdminStats,
  getAllUsers,
  updateUserRole,
  deleteUser,
  getVerifications,
  handleVerification,
  getReports,
  handleReport,
} from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();

router.use(protect, authorize('admin'));

router.get('/stats', getAdminStats);
router.get('/users', getAllUsers);
router.put('/users/:id', updateUserRole);
router.delete('/users/:id', deleteUser);
router.get('/verifications', getVerifications);
router.put('/verifications/:profileId', handleVerification);
router.get('/reports', getReports);
router.put('/reports/:id', handleReport);

export default router;

