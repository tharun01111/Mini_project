import express from 'express';
import {
  getOrganizers,
  approveOrganizer,
  getPlatformStats,
  getAllUsers,
  toggleUserStatus,
  getAdminSymposiums,
  approveSymposium,
  approveEvent,
} from '../controllers/adminController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);
router.use(authorize('ADMIN'));

router.get('/stats', getPlatformStats);
router.get('/organizers', getOrganizers);
router.patch('/organizers/:id/approve', approveOrganizer);

// Full User Management
router.get('/users', getAllUsers);
router.patch('/users/:id/status', toggleUserStatus);

// Symposium and Event Approvals
router.get('/symposiums', getAdminSymposiums);
router.patch('/symposiums/:id/approve', approveSymposium);
router.patch('/events/:id/approve', approveEvent);

export default router;
