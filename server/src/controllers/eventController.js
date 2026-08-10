import prisma from '../config/db.js';

export const createEvent = async (req, res) => {
  try {
    const { symposiumId } = req.params;
    const {
      title,
      category,
      description,
      venue,
      eventDate,
      startTime,
      endTime,
      capacity,
      fee,
      eligibility,
      rules,
    } = req.body;

    const symposium = await prisma.symposium.findUnique({ where: { id: symposiumId } });
    if (!symposium) {
      return res.status(404).json({ message: 'Parent Symposium not found.' });
    }

    if (symposium.organizerId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Not authorized to add events to this symposium.' });
    }

    if (!title || !category || !description || !venue || !eventDate || !startTime || !endTime) {
      return res.status(400).json({
        message: 'Title, category, description, venue, eventDate, startTime, and endTime are required.',
      });
    }

    const event = await prisma.event.create({
      data: {
        symposiumId,
        title,
        category,
        description,
        venue,
        eventDate: new Date(eventDate),
        startTime,
        endTime,
        capacity: capacity ? parseInt(capacity, 10) : 100,
        fee: fee ? parseFloat(fee) : 0.0,
        eligibility: eligibility || 'All Students',
        rules: rules || '',
      },
    });

    return res.status(201).json({
      message: 'Event created successfully!',
      event,
    });
  } catch (error) {
    console.error('Create event error:', error);
    return res.status(500).json({ message: 'Error creating event.', error: error.message });
  }
};

export const getEventsBySymposium = async (req, res) => {
  try {
    const { symposiumId } = req.params;
    const events = await prisma.event.findMany({
      where: { symposiumId },
      orderBy: { eventDate: 'asc' },
    });
    return res.json({ events });
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching events.', error: error.message });
  }
};

export const getEventById = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        symposium: {
          select: { id: true, title: true, college: true, startDate: true, endDate: true },
        },
      },
    });

    if (!event) {
      return res.status(404).json({ message: 'Event not found.' });
    }

    return res.json({ event });
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching event.', error: error.message });
  }
};

export const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      category,
      description,
      venue,
      eventDate,
      startTime,
      endTime,
      capacity,
      fee,
      eligibility,
      rules,
      isPublished,
    } = req.body;

    const existingEvent = await prisma.event.findUnique({
      where: { id },
      include: { symposium: true },
    });

    if (!existingEvent) {
      return res.status(404).json({ message: 'Event not found.' });
    }

    if (existingEvent.symposium.organizerId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Not authorized to edit this event.' });
    }

    const dataToUpdate = {};
    if (title) dataToUpdate.title = title;
    if (category) dataToUpdate.category = category;
    if (description) dataToUpdate.description = description;
    if (venue) dataToUpdate.venue = venue;
    if (eventDate) dataToUpdate.eventDate = new Date(eventDate);
    if (startTime) dataToUpdate.startTime = startTime;
    if (endTime) dataToUpdate.endTime = endTime;
    if (capacity !== undefined) dataToUpdate.capacity = parseInt(capacity, 10);
    if (fee !== undefined) dataToUpdate.fee = parseFloat(fee);
    if (eligibility) dataToUpdate.eligibility = eligibility;
    if (rules !== undefined) dataToUpdate.rules = rules;
    if (isPublished !== undefined) dataToUpdate.isPublished = Boolean(isPublished);

    const updatedEvent = await prisma.event.update({
      where: { id },
      data: dataToUpdate,
    });

    return res.json({
      message: 'Event updated successfully!',
      event: updatedEvent,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error updating event.', error: error.message });
  }
};

export const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;

    const existingEvent = await prisma.event.findUnique({
      where: { id },
      include: { symposium: true },
    });

    if (!existingEvent) {
      return res.status(404).json({ message: 'Event not found.' });
    }

    if (existingEvent.symposium.organizerId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Not authorized to delete this event.' });
    }

    await prisma.event.delete({ where: { id } });

    return res.json({ message: 'Event deleted successfully!' });
  } catch (error) {
    return res.status(500).json({ message: 'Error deleting event.', error: error.message });
  }
};
