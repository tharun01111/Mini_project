import prisma from '../config/db.js';
import crypto from 'crypto';

export const generateCertificate = async (req, res) => {
  try {
    const { registrationId } = req.body;
    const currentUserId = req.user.id;

    if (!registrationId) {
      return res.status(400).json({ message: 'Registration ID is required.' });
    }

    const registration = await prisma.registration.findUnique({
      where: { id: registrationId },
      include: {
        event: { include: { symposium: true } },
        user: { select: { id: true, name: true, email: true, college: true } },
        attendance: true,
        payment: true,
        certificate: true,
      },
    });

    if (!registration) {
      return res.status(404).json({ message: 'Registration not found.' });
    }

    // Check authorization: participant themselves, event organizer, or admin
    if (
      registration.userId !== currentUserId &&
      registration.event.symposium.organizerId !== currentUserId &&
      req.user.role !== 'ADMIN'
    ) {
      return res.status(403).json({ message: 'Not authorized to generate certificate for this registration.' });
    }

    // 1. Eligibility Check: Registration Status
    if (registration.status !== 'CONFIRMED') {
      return res.status(400).json({ message: 'Certificate generation failed: Registration is not confirmed.' });
    }

    // 2. Eligibility Check: Payment Status
    if (registration.paymentStatus === 'PENDING') {
      return res.status(400).json({ message: 'Certificate generation failed: Payment pending for this event.' });
    }

    // 3. Eligibility Check: Attendance Verification
    if (!registration.attendance) {
      return res.status(400).json({
        message: 'Certificate generation failed: Attendance has not been recorded for this event.',
        eligible: false,
      });
    }

    // If certificate already exists, return it
    if (registration.certificate) {
      return res.json({
        message: 'Certificate already generated!',
        certificate: registration.certificate,
        registration,
      });
    }

    // Generate unique Certificate Code
    const certificateCode = `CERT-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
    const qrCodeData = `${process.env.CLIENT_URL || 'http://localhost:5173'}/verify-certificate/${certificateCode}`;

    const certificate = await prisma.certificate.create({
      data: {
        certificateCode,
        registrationId: registration.id,
        userId: registration.userId,
        eventId: registration.eventId,
        qrCodeData,
      },
    });

    return res.status(201).json({
      message: 'Certificate generated successfully!',
      certificate,
      registration,
    });
  } catch (error) {
    console.error('Generate certificate error:', error);
    return res.status(500).json({ message: 'Error generating certificate.', error: error.message });
  }
};

export const getMyCertificates = async (req, res) => {
  try {
    const userId = req.user.id;

    const certificates = await prisma.certificate.findMany({
      where: { userId },
      include: {
        registration: {
          include: {
            event: { include: { symposium: true } },
            user: { select: { id: true, name: true, email: true, college: true } },
            attendance: true,
          },
        },
      },
      orderBy: { issueDate: 'desc' },
    });

    return res.json({ certificates });
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching certificates.', error: error.message });
  }
};

// PUBLIC CERTIFICATE VERIFICATION (NO AUTH REQUIRED)
export const verifyCertificatePublic = async (req, res) => {
  try {
    const { certificateCode } = req.params;

    if (!certificateCode) {
      return res.status(400).json({ valid: false, message: 'Certificate code is required.' });
    }

    const certificate = await prisma.certificate.findUnique({
      where: { certificateCode },
      include: {
        registration: {
          include: {
            user: { select: { name: true, college: true } },
            event: { include: { symposium: true } },
            attendance: true,
          },
        },
      },
    });

    if (!certificate) {
      return res.status(404).json({
        valid: false,
        message: 'Invalid Certificate Code. No verified record found in the Unified Symposium Platform registry.',
      });
    }

    // Fetch custom template if exists for symposium/event
    const template = await prisma.certificateTemplate.findFirst({
      where: {
        OR: [
          { eventId: certificate.eventId },
          { symposiumId: certificate.registration.event.symposiumId },
        ],
      },
    });

    return res.json({
      valid: true,
      message: 'Certificate Verified Authentic!',
      certificateDetails: {
        certificateCode: certificate.certificateCode,
        issueDate: certificate.issueDate,
        participantName: certificate.registration.user.name,
        participantCollege: certificate.registration.user.college || 'Engineering College',
        eventName: certificate.registration.event.title,
        eventCategory: certificate.registration.event.category,
        symposiumName: certificate.registration.event.symposium.title,
        symposiumCollege: certificate.registration.event.symposium.college,
        venue: certificate.registration.event.venue,
        attendedAt: certificate.registration.attendance?.markedAt,
        template: {
          title: template?.title || 'Certificate of Participation',
          signatoryName: template?.signatoryName || 'Dr. R. Arunkumar',
          signatoryTitle: template?.signatoryTitle || 'Symposium Convener & HOD',
        },
      },
    });
  } catch (error) {
    return res.status(500).json({ valid: false, message: 'Error verifying certificate.', error: error.message });
  }
};

export const saveTemplate = async (req, res) => {
  try {
    const { symposiumId, eventId, title, contentTemplate, signatoryName, signatoryTitle } = req.body;

    let existing = null;
    if (eventId) {
      existing = await prisma.certificateTemplate.findFirst({ where: { eventId } });
    } else if (symposiumId) {
      existing = await prisma.certificateTemplate.findFirst({ where: { symposiumId } });
    }

    let template;
    if (existing) {
      template = await prisma.certificateTemplate.update({
        where: { id: existing.id },
        data: {
          title: title || existing.title,
          contentTemplate: contentTemplate || existing.contentTemplate,
          signatoryName: signatoryName || existing.signatoryName,
          signatoryTitle: signatoryTitle || existing.signatoryTitle,
        },
      });
    } else {
      template = await prisma.certificateTemplate.create({
        data: {
          symposiumId: symposiumId || null,
          eventId: eventId || null,
          title: title || 'Certificate of Participation',
          contentTemplate: contentTemplate || 'This is to certify that {{participantName}} has actively participated in {{eventName}}.',
          signatoryName: signatoryName || 'Convener',
          signatoryTitle: signatoryTitle || 'Event Coordinator',
        },
      });
    }

    return res.json({ message: 'Certificate template saved successfully!', template });
  } catch (error) {
    return res.status(500).json({ message: 'Error saving certificate template.', error: error.message });
  }
};

export const bulkGenerateCertificates = async (req, res) => {
  try {
    const { eventId } = req.params;

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: { symposium: true },
    });

    if (!event) {
      return res.status(404).json({ message: 'Event not found.' });
    }

    const isAuthorized = req.user.role === 'ADMIN' || event.symposium.organizerId === req.user.id || (req.user.college && event.symposium.college && req.user.college.toLowerCase().includes(event.symposium.college.toLowerCase()));
    if (!isAuthorized) {
      return res.status(403).json({ message: 'Not authorized to issue certificates for this event.' });
    }

    // Find all confirmed registrations with recorded attendance and completed/exempt payment
    const eligibleRegistrations = await prisma.registration.findMany({
      where: {
        eventId,
        status: 'CONFIRMED',
        paymentStatus: { in: ['COMPLETED', 'EXEMPT'] },
        attendance: { isNot: null },
      },
      include: {
        certificate: true,
        user: { select: { id: true, name: true, email: true } },
      },
    });

    if (eligibleRegistrations.length === 0) {
      return res.status(400).json({
        message: 'No eligible attended participants found for this event yet.',
        totalEligible: 0,
        issuedCount: 0,
      });
    }

    const newCertificates = [];
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

    // Build records for registrations that don't yet have a certificate
    const toCreate = eligibleRegistrations
      .filter((reg) => !reg.certificate)
      .map((reg) => ({
        certificateCode: `CERT-${crypto.randomBytes(4).toString('hex').toUpperCase()}`,
        registrationId: reg.id,
        userId: reg.userId,
        eventId: reg.eventId,
        qrCodeData: `${clientUrl}/verify-certificate/PLACEHOLDER`, // updated below
      }));

    // Issue in a conflict-safe batch; skipDuplicates handles concurrent requests on the same registrationId
    let newlyIssued = 0;
    if (toCreate.length > 0) {
      // Generate qrCodeData per-record now that we have the code
      const recordsWithQr = toCreate.map((r) => ({
        ...r,
        qrCodeData: `${clientUrl}/verify-certificate/${r.certificateCode}`,
      }));

      const result = await prisma.certificate.createMany({
        data: recordsWithQr,
        skipDuplicates: true,
      });
      newlyIssued = result.count;
    }

    return res.json({
      message: `Batch generation complete! ${newlyIssued} new certificate(s) issued (${eligibleRegistrations.length} total attendees eligible).`,
      totalEligible: eligibleRegistrations.length,
      newlyIssued,
      previouslyIssued: eligibleRegistrations.length - newlyIssued,
    });
  } catch (error) {
    console.error('Bulk generate error:', error);
    return res.status(500).json({ message: 'Error during bulk certificate generation.' });
  }
};

