import express from 'express';
import {
  registerForEvent,
  getMyRegistrations,
  getTicketByCode,
  cancelRegistration,
} from '../controllers/registrationController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', authenticate, registerForEvent);
router.get('/my-registrations', authenticate, getMyRegistrations);
router.get('/ticket/:ticketCode', getTicketByCode);
router.delete('/:registrationId', authenticate, cancelRegistration);

export default router;
