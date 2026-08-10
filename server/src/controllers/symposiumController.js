import prisma from '../config/db.js';

export const getAllSymposiums = async (req, res) => {
  try {
    const { college, publishedOnly } = req.query;

    const whereClause = {};
    if (publishedOnly === 'true' || publishedOnly === undefined) {
      whereClause.isPublished = true;
    }
    if (college) {
      whereClause.college = { contains: college, mode: 'insensitive' };
    }

    const symposiums = await prisma.symposium.findMany({
      where: whereClause,
      include: {
        organizer: {
          select: { id: true, name: true, email: true, college: true },
        },
        events: true,
      },
      orderBy: { startDate: 'asc' },
    });

    return res.json({ symposiums });
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching symposiums.', error: error.message });
  }
};

export const getSymposiumById = async (req, res) => {
  try {
    const { id } = req.params;

    const symposium = await prisma.symposium.findUnique({
      where: { id },
      include: {
        organizer: {
          select: { id: true, name: true, email: true, college: true, phone: true, organizerProfile: true },
        },
        events: {
          orderBy: { eventDate: 'asc' },
        },
      },
    });

    if (!symposium) {
      return res.status(404).json({ message: 'Symposium not found.' });
    }

    return res.json({ symposium });
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching symposium details.', error: error.message });
  }
};

export const getMySymposiums = async (req, res) => {
  try {
    const organizerId = req.user.id;
    const symposiums = await prisma.symposium.findMany({
      where: { organizerId },
      include: {
        events: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({ symposiums });
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching organizer symposiums.', error: error.message });
  }
};

export const createSymposium = async (req, res) => {
  try {
    const { title, description, college, venue, startDate, endDate, bannerUrl, isPublished } = req.body;
    const organizerId = req.user.id;

    if (!title || !description || !college || !startDate || !endDate || !venue) {
      return res.status(400).json({ message: 'Title, description, college, venue, start date, and end date are required.' });
    }

    const symposium = await prisma.symposium.create({
      data: {
        title,
        description,
        college,
        venue,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        bannerUrl: bannerUrl || null,
        isPublished: isPublished === true || isPublished === 'true',
        organizerId,
      },
      include: {
        events: true,
      },
    });

    return res.status(201).json({
      message: 'Symposium created successfully!',
      symposium,
    });
  } catch (error) {
    console.error('Create symposium error:', error);
    return res.status(500).json({ message: 'Error creating symposium.', error: error.message });
  }
};

export const updateSymposium = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, college, venue, startDate, endDate, bannerUrl, isPublished } = req.body;

    const existing = await prisma.symposium.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ message: 'Symposium not found.' });
    }

    if (existing.organizerId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Not authorized to update this symposium.' });
    }

    const dataToUpdate = {};
    if (title) dataToUpdate.title = title;
    if (description) dataToUpdate.description = description;
    if (college) dataToUpdate.college = college;
    if (venue) dataToUpdate.venue = venue;
    if (startDate) dataToUpdate.startDate = new Date(startDate);
    if (endDate) dataToUpdate.endDate = new Date(endDate);
    if (bannerUrl !== undefined) dataToUpdate.bannerUrl = bannerUrl;
    if (isPublished !== undefined) dataToUpdate.isPublished = Boolean(isPublished);

    const updated = await prisma.symposium.update({
      where: { id },
      data: dataToUpdate,
      include: { events: true },
    });

    return res.json({
      message: 'Symposium updated successfully!',
      symposium: updated,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error updating symposium.', error: error.message });
  }
};

export const togglePublishSymposium = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await prisma.symposium.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ message: 'Symposium not found.' });
    }

    if (existing.organizerId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Not authorized.' });
    }

    const updated = await prisma.symposium.update({
      where: { id },
      data: { isPublished: !existing.isPublished },
    });

    return res.json({
      message: `Symposium ${updated.isPublished ? 'published' : 'unpublished'} successfully!`,
      isPublished: updated.isPublished,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error toggling publish state.', error: error.message });
  }
};

export const deleteSymposium = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await prisma.symposium.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ message: 'Symposium not found.' });
    }

    if (existing.organizerId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Not authorized to delete this symposium.' });
    }

    await prisma.symposium.delete({ where: { id } });

    return res.json({ message: 'Symposium deleted successfully!' });
  } catch (error) {
    return res.status(500).json({ message: 'Error deleting symposium.', error: error.message });
  }
};
