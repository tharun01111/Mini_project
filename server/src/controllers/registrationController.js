import prisma from '../config/db.js';
import crypto from 'crypto';

export const registerForEvent = async (req, res) => {
  try {
    const { eventId } = req.body;
    const userId = req.user.id;

    if (!eventId) {
      return res.status(400).json({ message: 'Event ID is required for registration.' });
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        symposium: true,
        registrations: {
          where: { status: { in: ['CONFIRMED', 'PENDING'] } },
        },
      },
    });

    if (!event) {
      return res.status(404).json({ message: 'Event not found.' });
    }

    if (!event.isPublished) {
      return res.status(400).json({ message: 'This event is not published yet.' });
    }

    // 1. Check Registration Deadline
    if (event.registrationDeadline && new Date() > new Date(event.registrationDeadline)) {
      return res.status(400).json({ message: 'Registration deadline for this event has passed.' });
    }

    // 2. Check Event Capacity
    if (event.registrations.length >= event.capacity) {
      return res.status(400).json({ message: 'Event capacity has been reached. Registrations are full.' });
    }

    // 3. Check Duplicate Registration
    const existingReg = await prisma.registration.findUnique({
      where: {
        userId_eventId: {
          userId,
          eventId,
        },
      },
    });

    if (existingReg && existingReg.status !== 'CANCELLED') {
      return res.status(400).json({ message: 'You have already registered for this event.' });
    }

    // 4. Fee & Payment Status Determination
    const isPaidEvent = event.fee > 0;
    const initialStatus = isPaidEvent ? 'PENDING' : 'CONFIRMED';
    const initialPaymentStatus = isPaidEvent ? 'PENDING' : 'EXEMPT';

    const ticketCode = `TCK-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

    // Create or update registration if previously cancelled
    let registration;
    if (existingReg && existingReg.status === 'CANCELLED') {
      registration = await prisma.registration.update({
        where: { id: existingReg.id },
        data: {
          status: initialStatus,
          paymentStatus: initialPaymentStatus,
          ticketCode,
          registeredAt: new Date(),
        },
        include: {
          event: { include: { symposium: true } },
          user: { select: { id: true, name: true, email: true, college: true, phone: true } },
          payment: true,
          attendance: true,
        },
      });
    } else {
      registration = await prisma.registration.create({
        data: {
          userId,
          eventId,
          status: initialStatus,
          paymentStatus: initialPaymentStatus,
          ticketCode,
        },
        include: {
          event: { include: { symposium: true } },
          user: { select: { id: true, name: true, email: true, college: true, phone: true } },
          payment: true,
          attendance: true,
        },
      });
    }

    return res.status(201).json({
      message: isPaidEvent
        ? 'Registration initiated! Please complete payment to confirm your ticket.'
        : 'Successfully registered for event! Digital ticket generated.',
      registration,
      isPaidEvent,
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ message: 'Error registering for event.', error: error.message });
  }
};

export const getMyRegistrations = async (req, res) => {
  try {
    const userId = req.user.id;
    const registrations = await prisma.registration.findMany({
      where: { userId },
      include: {
        event: {
          include: { symposium: true },
        },
        payment: true,
        attendance: true,
        certificate: true,
      },
      orderBy: { registeredAt: 'desc' },
    });

    return res.json({ registrations });
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching user registrations.', error: error.message });
  }
};

export const getTicketByCode = async (req, res) => {
  try {
    const { ticketCode } = req.params;
    const registration = await prisma.registration.findUnique({
      where: { ticketCode },
      include: {
        event: { include: { symposium: true } },
        user: { select: { id: true, name: true, email: true, college: true, phone: true } },
        payment: true,
        attendance: true,
        certificate: true,
      },
    });

    if (!registration) {
      return res.status(404).json({ message: 'Digital ticket not found for the given code.' });
    }

    return res.json({ registration });
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching ticket details.', error: error.message });
  }
};

export const cancelRegistration = async (req, res) => {
  try {
    const { registrationId } = req.params;
    const userId = req.user.id;

    const registration = await prisma.registration.findUnique({
      where: { id: registrationId },
    });

    if (!registration) {
      return res.status(404).json({ message: 'Registration not found.' });
    }

    if (registration.userId !== userId && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Not authorized to cancel this registration.' });
    }

    const updated = await prisma.registration.update({
      where: { id: registrationId },
      data: { status: 'CANCELLED' },
    });

    return res.json({ message: 'Registration cancelled successfully.', registration: updated });
  } catch (error) {
    return res.status(500).json({ message: 'Error cancelling registration.', error: error.message });
  }
};
