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
    const pendingSymposiums = await prisma.symposium.count({ where: { isApproved: false } });

    return res.json({
      stats: {
        totalUsers,
        totalOrganizers,
        pendingOrganizers,
        totalSymposiums,
        totalEvents,
        totalRegistrations,
        pendingSymposiums,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching platform statistics.', error: error.message });
  }
};

// GET ALL USERS (PARTICIPANTS, ORGANIZERS, ADMINS) WITH FILTERS
export const getAllUsers = async (req, res) => {
  try {
    const { role, search } = req.query;
    const where = {};

    if (role && ['ADMIN', 'ORGANIZER', 'PARTICIPANT'].includes(role.toUpperCase())) {
      where.role = role.toUpperCase();
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { college: { contains: search, mode: 'insensitive' } },
      ];
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        college: true,
        phone: true,
        isApproved: true,
        createdAt: true,
        _count: {
          select: {
            registrations: true,
            symposiums: true,
          },
        },
        organizerProfile: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({ users });
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching platform users.', error: error.message });
  }
};

// TOGGLE USER ACTIVE / APPROVED STATUS
export const toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({ where: { id } });

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { isApproved: !user.isApproved },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isApproved: true,
      },
    });

    return res.json({
      message: `User ${updatedUser.name} status updated to ${updatedUser.isApproved ? 'ACTIVE' : 'DEACTIVATED'}.`,
      user: updatedUser,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error updating user status.', error: error.message });
  }
};

// GET ALL SYMPOSIUMS FOR ADMIN REVIEW (INCLUDING PENDING / DRAFTS)
export const getAdminSymposiums = async (req, res) => {
  try {
    const symposiums = await prisma.symposium.findMany({
      include: {
        organizer: {
          select: { id: true, name: true, email: true, college: true },
        },
        events: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return res.json({ symposiums });
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching symposiums for administration.', error: error.message });
  }
};

// APPROVE OR REJECT A SYMPOSIUM
export const approveSymposium = async (req, res) => {
  try {
    const { id } = req.params;
    const { isApproved } = req.body;

    const symposium = await prisma.symposium.findUnique({ where: { id } });
    if (!symposium) {
      return res.status(404).json({ message: 'Symposium not found.' });
    }

    const updated = await prisma.symposium.update({
      where: { id },
      data: { isApproved: Boolean(isApproved) },
      include: { organizer: { select: { name: true, email: true } } },
    });

    return res.json({
      message: `Symposium "${updated.title}" ${updated.isApproved ? 'Approved & Verified' : 'Rejected / Unapproved'}.`,
      symposium: updated,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error updating symposium approval status.', error: error.message });
  }
};

// APPROVE OR REJECT AN EVENT
export const approveEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { isApproved } = req.body;

    const event = await prisma.event.findUnique({ where: { id }, include: { symposium: true } });
    if (!event) {
      return res.status(404).json({ message: 'Event not found.' });
    }

    const updated = await prisma.event.update({
      where: { id },
      data: { isApproved: Boolean(isApproved) },
    });

    return res.json({
      message: `Event "${updated.title}" ${updated.isApproved ? 'Approved' : 'Rejected / Unapproved'}.`,
      event: updated,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error updating event approval status.', error: error.message });
  }
};
