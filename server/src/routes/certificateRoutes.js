import express from 'express';
import {
  generateCertificate,
  getMyCertificates,
  verifyCertificatePublic,
  saveTemplate,
  bulkGenerateCertificates,
} from '../controllers/certificateController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public route for QR scan / direct link verification
router.get('/verify/:certificateCode', verifyCertificatePublic);

// Authenticated routes
router.post('/generate', authenticate, generateCertificate);
router.get('/my-certificates', authenticate, getMyCertificates);
router.post('/template', authenticate, authorize('ORGANIZER', 'ADMIN'), saveTemplate);
router.post('/bulk-generate/:eventId', authenticate, authorize('ORGANIZER', 'ADMIN'), bulkGenerateCertificates);

export default router;
