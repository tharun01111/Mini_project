import prisma from '../config/db.js';

export const getOrganizers = async (req, res) => {
  try {
    const organizers = await prisma.user.findMany({
      where: { role: 'ORGANIZER' },
      include: { organizerProfile: true, symposiums: true },
      orderBy: { createdAt: 'desc' },
    });
    return res.json({ organizers });
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching organizers.', error: error.message });
  }
};

export const approveOrganizer = async (req, res) => {
  try {
    const { id } = req.params; // User ID of organizer
    const { status } = req.body; // 'APPROVED' or 'REJECTED'

    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ message: "Status must be either 'APPROVED' or 'REJECTED'." });
    }

    const isApproved = status === 'APPROVED';

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        isApproved,
        organizerProfile: {
          update: {
            status,
          },
        },
      },
      include: { organizerProfile: true },
    });

    return res.json({
      message: `Organizer status updated to ${status}.`,
      user: updatedUser,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error updating organizer status.', error: error.message });
  }
};

export const getPlatformStats = async (req, res) => {
  try {
    const totalUsers = await prisma.user.count();
    const totalOrganizers = await prisma.user.count({ where: { role: 'ORGANIZER' } });
    const pendingOrganizers = await prisma.organizerProfile.count({ where: { status: 'PENDING' } });
    const totalSymposiums = await prisma.symposium.count();
    const totalEvents = await prisma.event.count();
    const totalRegistrations = await prisma.registration.count();

    return res.json({
      stats: {
        totalUsers,
        totalOrganizers,
        pendingOrganizers,
        totalSymposiums,
        totalEvents,
        totalRegistrations,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching platform statistics.', error: error.message });
  }
};
