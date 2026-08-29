import prisma from '../config/db.js';
import crypto from 'crypto';

export const processPayment = async (req, res) => {
  try {
    const { registrationId, paymentMethod } = req.body;
    const userId = req.user.id;

    if (!registrationId) {
      return res.status(400).json({ message: 'Registration ID is required.' });
    }

    const registration = await prisma.registration.findUnique({
      where: { id: registrationId },
      include: { event: { include: { symposium: true } } },
    });

    if (!registration) {
      return res.status(404).json({ message: 'Registration record not found.' });
    }

    if (registration.userId !== userId && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Not authorized to make payment for this registration.' });
    }

    if (registration.paymentStatus === 'COMPLETED') {
      return res.status(400).json({ message: 'Payment for this registration has already been completed.' });
    }

    const transactionId = `TXN-${crypto.randomBytes(6).toString('hex').toUpperCase()}`;
    const amount = registration.event.fee;

    // Create payment record & update registration status atomically
    const [payment, updatedRegistration] = await prisma.$transaction([
      prisma.payment.upsert({
        where: { registrationId },
        update: {
          transactionId,
          amount,
          status: 'COMPLETED',
          paymentDate: new Date(),
        },
        create: {
          registrationId,
          transactionId,
          amount,
          status: 'COMPLETED',
          paymentDate: new Date(),
        },
      }),
      prisma.registration.update({
        where: { id: registrationId },
        data: {
          status: 'CONFIRMED',
          paymentStatus: 'COMPLETED',
        },
        include: {
          event: { include: { symposium: true } },
          payment: true,
          attendance: true,
        },
      }),
    ]);

    return res.status(200).json({
      message: 'Payment completed successfully! Digital ticket confirmed.',
      payment,
      registration: updatedRegistration,
    });
  } catch (error) {
    console.error('Payment processing error:', error);
    return res.status(500).json({ message: 'Error processing payment.', error: error.message });
  }
};

export const getMyPayments = async (req, res) => {
  try {
    const userId = req.user.id;
    const payments = await prisma.payment.findMany({
      where: {
        registration: {
          userId,
        },
      },
      include: {
        registration: {
          include: {
            event: { include: { symposium: true } },
          },
        },
      },
      orderBy: { paymentDate: 'desc' },
    });

    return res.json({ payments });
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching payment history.', error: error.message });
  }
};

export const getEventPayments = async (req, res) => {
  try {
    const { eventId } = req.params;

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: { symposium: true },
    });

    if (!event) {
      return res.status(404).json({ message: 'Event not found.' });
    }

    if (event.symposium.organizerId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Not authorized to view payments for this event.' });
    }

    const payments = await prisma.payment.findMany({
      where: {
        registration: {
          eventId,
        },
      },
      include: {
        registration: {
          include: {
            user: { select: { id: true, name: true, email: true, phone: true, college: true } },
          },
        },
      },
      orderBy: { paymentDate: 'desc' },
    });

    return res.json({ payments });
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching event payment records.', error: error.message });
  }
};
