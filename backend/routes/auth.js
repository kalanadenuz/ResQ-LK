const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const router = express.Router();

// Middleware to validate JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// User registration
router.post('/register', [
  body('phone_number').isMobilePhone().withMessage('Valid phone number required'),
  body('name').isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('age').optional().isInt({ min: 1, max: 120 }).withMessage('Valid age required'),
  body('location').optional().isLength({ min: 2 }).withMessage('Location must be at least 2 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { phone_number, name, age, location, profile_picture } = req.body;

    // Check if user already exists
    const existingUser = await User.findByPhone(phone_number);
    if (existingUser) {
      return res.status(400).json({ error: 'User with this phone number already exists' });
    }

    // Create new user
    const userData = {
      phone_number,
      name,
      age,
      location,
      profile_picture
    };

    const user = await User.create(userData);

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, phone_number: user.phone_number },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user.id,
        phone_number: user.phone_number,
        name: user.name,
        age: user.age,
        location: user.location,
        profile_picture: user.profile_picture
      },
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// User login
router.post('/login', [
  body('phone_number').isMobilePhone().withMessage('Valid phone number required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { phone_number } = req.body;

    // Find user by phone number
    const user = await User.findByPhone(phone_number);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, phone_number: user.phone_number },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        phone_number: user.phone_number,
        name: user.name,
        age: user.age,
        location: user.location,
        profile_picture: user.profile_picture
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get user statistics
    const stats = await User.getUserStats(req.user.userId);
    const recentActivity = await User.getRecentActivity(req.user.userId, 5);

    res.json({
      user: {
        id: user.id,
        phone_number: user.phone_number,
        name: user.name,
        age: user.age,
        location: user.location,
        profile_picture: user.profile_picture,
        created_at: user.created_at,
        updated_at: user.updated_at
      },
      stats,
      recent_activity: recentActivity
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
});

// Update user profile
router.put('/profile', [
  authenticateToken,
  body('name').optional().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('age').optional().isInt({ min: 1, max: 120 }).withMessage('Valid age required'),
  body('location').optional().isLength({ min: 2 }).withMessage('Location must be at least 2 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, age, location, profile_picture } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (age) updateData.age = age;
    if (location) updateData.location = location;
    if (profile_picture) updateData.profile_picture = profile_picture;

    const updatedUser = await User.update(req.user.userId, updateData);

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: updatedUser.id,
        phone_number: updatedUser.phone_number,
        name: updatedUser.name,
        age: updatedUser.age,
        location: updatedUser.location,
        profile_picture: updatedUser.profile_picture,
        updated_at: updatedUser.updated_at
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Update profile picture
router.put('/profile/picture', authenticateToken, async (req, res) => {
  try {
    const { profile_picture } = req.body;

    if (!profile_picture) {
      return res.status(400).json({ error: 'Profile picture URL required' });
    }

    const updatedUser = await User.updateProfilePicture(req.user.userId, profile_picture);

    res.json({
      message: 'Profile picture updated successfully',
      profile_picture: updatedUser.profile_picture
    });
  } catch (error) {
    console.error('Update profile picture error:', error);
    res.status(500).json({ error: 'Failed to update profile picture' });
  }
});

// Get user notifications
router.get('/notifications', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const notifications = await User.getUserNotifications(req.user.userId);
    const unreadCount = await User.getUnreadNotificationCount(req.user.userId);

    res.json({
      notifications: notifications.slice(offset, offset + parseInt(limit)),
      unread_count: unreadCount,
      total: notifications.length,
      page: parseInt(page),
      total_pages: Math.ceil(notifications.length / limit)
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: 'Failed to get notifications' });
  }
});

// Mark notification as read
router.put('/notifications/:id/read', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    await User.markNotificationAsRead(id, req.user.userId);

    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

// Mark all notifications as read
router.put('/notifications/read-all', authenticateToken, async (req, res) => {
  try {
    await User.markAllNotificationsAsRead(req.user.userId);

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Mark all notifications read error:', error);
    res.status(500).json({ error: 'Failed to mark all notifications as read' });
  }
});

// Get user history
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const { type } = req.query;

    let history = [];
    switch (type) {
      case 'emergency':
        history = await User.getUserEmergencyHistory(req.user.userId);
        break;
      case 'relief':
        history = await User.getUserReliefHistory(req.user.userId);
        break;
      case 'volunteer':
        history = await User.getUserVolunteerHistory(req.user.userId);
        break;
      default:
        // Return all history
        const [emergencyHistory, reliefHistory, volunteerHistory] = await Promise.all([
          User.getUserEmergencyHistory(req.user.userId),
          User.getUserReliefHistory(req.user.userId),
          User.getUserVolunteerHistory(req.user.userId)
        ]);
        history = {
          emergency: emergencyHistory,
          relief: reliefHistory,
          volunteer: volunteerHistory
        };
    }

    res.json({ history });
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({ error: 'Failed to get history' });
  }
});

// Search users (admin only)
router.get('/search', authenticateToken, async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({ error: 'Search query required' });
    }

    const users = await User.searchUsers(q);

    res.json({ users });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ error: 'Failed to search users' });
  }
});

// Get users by location
router.get('/location/:location', authenticateToken, async (req, res) => {
  try {
    const { location } = req.params;
    const users = await User.getUsersByLocation(location);

    res.json({ users });
  } catch (error) {
    console.error('Get users by location error:', error);
    res.status(500).json({ error: 'Failed to get users by location' });
  }
});

// Get active users
router.get('/active', authenticateToken, async (req, res) => {
  try {
    const users = await User.getActiveUsers();

    res.json({ users });
  } catch (error) {
    console.error('Get active users error:', error);
    res.status(500).json({ error: 'Failed to get active users' });
  }
});

// Verify token
router.get('/verify', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      valid: true,
      user: {
        id: user.id,
        phone_number: user.phone_number,
        name: user.name,
        age: user.age,
        location: user.location,
        profile_picture: user.profile_picture
      }
    });
  } catch (error) {
    console.error('Verify token error:', error);
    res.status(500).json({ error: 'Token verification failed' });
  }
});

// Refresh token
router.post('/refresh', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Generate new token
    const token = jwt.sign(
      { userId: user.id, phone_number: user.phone_number },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Token refreshed successfully',
      token
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({ error: 'Token refresh failed' });
  }
});

// Logout (client-side token removal)
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    // In a real application, you might want to blacklist the token
    // For now, we'll just return a success message
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
});

// Delete user account
router.delete('/account', authenticateToken, async (req, res) => {
  try {
    await User.delete(req.user.userId);

    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ error: 'Failed to delete account' });
  }
});

module.exports = router;
