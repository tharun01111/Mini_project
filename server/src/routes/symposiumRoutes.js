import express from 'express';
import {
  getAllSymposiums,
  getSymposiumById,
  getMySymposiums,
  createSymposium,
  updateSymposium,
  togglePublishSymposium,
  deleteSymposium,
} from '../controllers/symposiumController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', getAllSymposiums);
router.get('/:id', getSymposiumById);

// Protected routes (Organizers & Admins)
router.get('/organizer/my-symposiums', authenticate, authorize('ORGANIZER', 'ADMIN'), getMySymposiums);
router.post('/', authenticate, authorize('ORGANIZER', 'ADMIN'), createSymposium);
router.put('/:id', authenticate, authorize('ORGANIZER', 'ADMIN'), updateSymposium);
router.patch('/:id/publish', authenticate, authorize('ORGANIZER', 'ADMIN'), togglePublishSymposium);
router.delete('/:id', authenticate, authorize('ORGANIZER', 'ADMIN'), deleteSymposium);

export default router;
