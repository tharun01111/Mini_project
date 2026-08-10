import bcrypt from 'bcryptjs';
import prisma from '../config/db.js';
import { generateToken } from '../utils/jwt.js';

export const register = async (req, res) => {
  try {
    const { name, email, password, role, college, phone, department, designation } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required.' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email address is already registered.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const userRole = role === 'ORGANIZER' ? 'ORGANIZER' : 'PARTICIPANT';
    const isApproved = userRole === 'PARTICIPANT'; // Organizers require admin approval

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: userRole,
        college: college || null,
        phone: phone || null,
        isApproved,
        organizerProfile: userRole === 'ORGANIZER'
          ? {
              create: {
                college: college || 'Bannari Amman Institute of Technology',
                department: department || 'Computer Science & Engineering',
                designation: designation || 'Event Chair',
                phone: phone || '9876543210',
                status: 'PENDING',
              },
            }
          : undefined,
      },
      include: {
        organizerProfile: true,
      },
    });

    const token = generateToken({ userId: user.id, role: user.role });

    return res.status(201).json({
      message: userRole === 'ORGANIZER'
        ? 'Organizer account registered successfully! Pending Administrator approval.'
        : 'Participant account registered successfully!',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isApproved: user.isApproved,
        organizerProfile: user.organizerProfile,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ message: 'Error registering user.', error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: { organizerProfile: true },
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const token = generateToken({ userId: user.id, role: user.role });

    return res.json({
      message: 'Login successful!',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        college: user.college,
        phone: user.phone,
        isApproved: user.isApproved,
        organizerProfile: user.organizerProfile,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Error logging in.', error: error.message });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = req.user;
    return res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        college: user.college,
        phone: user.phone,
        isApproved: user.isApproved,
        organizerProfile: user.organizerProfile,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching user profile.', error: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name, college, phone, currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    const dataToUpdate = {};
    if (name) dataToUpdate.name = name;
    if (college) dataToUpdate.college = college;
    if (phone) dataToUpdate.phone = phone;

    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ message: 'Current password is required to set a new password.' });
      }
      const isMatch = await bcrypt.compare(currentPassword, req.user.passwordHash);
      if (!isMatch) {
        return res.status(400).json({ message: 'Current password does not match.' });
      }
      dataToUpdate.passwordHash = await bcrypt.hash(newPassword, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: dataToUpdate,
      include: { organizerProfile: true },
    });

    return res.json({
      message: 'Profile updated successfully!',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        college: updatedUser.college,
        phone: updatedUser.phone,
        isApproved: updatedUser.isApproved,
        organizerProfile: updatedUser.organizerProfile,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error updating profile.', error: error.message });
  }
};
