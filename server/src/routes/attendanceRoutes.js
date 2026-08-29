import express from 'express';
import {
  scanTicketAttendance,
  markManualAttendance,
  getEventAttendance,
} from '../controllers/attendanceController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/scan', authenticate, authorize(['ORGANIZER', 'ADMIN']), scanTicketAttendance);
router.post('/manual', authenticate, authorize(['ORGANIZER', 'ADMIN']), markManualAttendance);
router.get('/event/:eventId', authenticate, authorize(['ORGANIZER', 'ADMIN']), getEventAttendance);

export default router;
