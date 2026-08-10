import express from 'express';
import { getOrganizers, approveOrganizer, getPlatformStats } from '../controllers/adminController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);
router.use(authorize('ADMIN'));

router.get('/organizers', getOrganizers);
router.patch('/organizers/:id/approve', approveOrganizer);
router.get('/stats', getPlatformStats);

export default router;
