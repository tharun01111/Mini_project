import express from 'express';
import {
  createEvent,
  getEventsBySymposium,
  getEventById,
  updateEvent,
  deleteEvent,
} from '../controllers/eventController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/symposium/:symposiumId', getEventsBySymposium);
router.get('/:id', getEventById);

// Protected routes (Organizers & Admins)
router.post('/symposium/:symposiumId', authenticate, authorize('ORGANIZER', 'ADMIN'), createEvent);
router.put('/:id', authenticate, authorize('ORGANIZER', 'ADMIN'), updateEvent);
router.delete('/:id', authenticate, authorize('ORGANIZER', 'ADMIN'), deleteEvent);

export default router;
