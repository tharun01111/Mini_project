import express from 'express';
import { processPayment, getMyPayments, getEventPayments } from '../controllers/paymentController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/process', authenticate, processPayment);
router.get('/my-payments', authenticate, getMyPayments);
router.get('/event/:eventId', authenticate, authorize(['ORGANIZER', 'ADMIN']), getEventPayments);

export default router;
