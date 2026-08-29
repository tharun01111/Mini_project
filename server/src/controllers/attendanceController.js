import prisma from '../config/db.js';

export const scanTicketAttendance = async (req, res) => {
  try {
    const { ticketCode, eventId } = req.body;
    const scannerUserId = req.user.id;

    if (!ticketCode) {
      return res.status(400).json({ message: 'Ticket code is required for scanning.' });
    }

    const registration = await prisma.registration.findUnique({
      where: { ticketCode },
      include: {
        event: { include: { symposium: true } },
        user: { select: { id: true, name: true, email: true, college: true, phone: true } },
        attendance: true,
      },
    });

    if (!registration) {
      return res.status(404).json({ message: 'Invalid QR Code or ticket not found.' });
    }

    // Verify Event Match if specified
    if (eventId && registration.eventId !== eventId) {
      return res.status(400).json({
        message: `Ticket mismatch! Ticket is for "${registration.event.title}", not the selected event.`,
      });
    }

    // Check organizer authorization for event
    if (req.user.role !== 'ORGANIZER' && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Not authorized to record attendance for this symposium event.' });
    }

    // Check Ticket Status & Payment Status
    if (registration.status !== 'CONFIRMED') {
      return res.status(400).json({ message: 'Cannot mark attendance. Registration status is not confirmed.' });
    }

    if (registration.paymentStatus === 'PENDING') {
      return res.status(400).json({ message: 'Cannot mark attendance. Payment is still pending for this ticket.' });
    }

    // Check Duplicate Attendance
    if (registration.attendance) {
      return res.status(400).json({
        message: `Duplicate Attendance Alert! Attendance was already marked on ${new Date(registration.attendance.markedAt).toLocaleString()}.`,
        alreadyMarked: true,
        attendance: registration.attendance,
        participant: registration.user,
      });
    }

    // Mark Attendance
    const attendance = await prisma.attendance.create({
      data: {
        registrationId: registration.id,
        eventId: registration.eventId,
        userId: registration.userId,
        markedByUserId: scannerUserId,
        method: 'QR',
      },
    });

    return res.status(200).json({
      message: `Attendance marked successfully for ${registration.user.name}!`,
      attendance,
      participant: registration.user,
      event: registration.event,
    });
  } catch (error) {
    console.error('Scan attendance error:', error);
    return res.status(500).json({ message: 'Error recording attendance.', error: error.message });
  }
};

export const markManualAttendance = async (req, res) => {
  try {
    const { registrationId } = req.body;
    const scannerUserId = req.user.id;

    if (!registrationId) {
      return res.status(400).json({ message: 'Registration ID is required.' });
    }

    const registration = await prisma.registration.findUnique({
      where: { id: registrationId },
      include: {
        event: { include: { symposium: true } },
        user: { select: { id: true, name: true, email: true, college: true, phone: true } },
        attendance: true,
      },
    });

    if (!registration) {
      return res.status(404).json({ message: 'Registration not found.' });
    }

    if (req.user.role !== 'ORGANIZER' && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Not authorized to record attendance.' });
    }

    if (registration.attendance) {
      return res.status(400).json({ message: 'Attendance already marked for this participant.' });
    }

    const attendance = await prisma.attendance.create({
      data: {
        registrationId: registration.id,
        eventId: registration.eventId,
        userId: registration.userId,
        markedByUserId: scannerUserId,
        method: 'MANUAL',
      },
    });

    return res.json({
      message: `Manual attendance marked for ${registration.user.name}!`,
      attendance,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error marking manual attendance.', error: error.message });
  }
};

export const getEventAttendance = async (req, res) => {
  try {
    const { eventId } = req.params;

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: { symposium: true },
    });

    if (!event) {
      return res.status(404).json({ message: 'Event not found.' });
    }

    if (req.user.role !== 'ORGANIZER' && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Not authorized.' });
    }

    const registrations = await prisma.registration.findMany({
      where: { eventId, status: 'CONFIRMED' },
      include: {
        user: { select: { id: true, name: true, email: true, college: true, phone: true } },
        attendance: true,
        payment: true,
      },
      orderBy: { registeredAt: 'asc' },
    });

    const totalConfirmed = registrations.length;
    const totalAttended = registrations.filter((r) => r.attendance !== null).length;

    return res.json({
      stats: {
        totalConfirmed,
        totalAttended,
        attendanceRate: totalConfirmed > 0 ? ((totalAttended / totalConfirmed) * 100).toFixed(1) + '%' : '0%',
      },
      registrations,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching event attendance.', error: error.message });
  }
};
