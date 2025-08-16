const express = require('express');
const { body, validationResult } = require('express-validator');
const EmergencyRequest = require('../models/EmergencyRequest');
const EmergencyLocation = require('../models/EmergencyLocation');
const EvacuationTimeSlot = require('../models/EvacuationTimeSlot');
const User = require('../models/User');

const router = express.Router();

// Middleware to validate JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  const jwt = require('jsonwebtoken');
  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Create emergency request
router.post('/request', [
  authenticateToken,
  body('location').isLength({ min: 2 }).withMessage('Location is required'),
  body('urgency_level').optional().isIn(['low', 'medium', 'high', 'critical']).withMessage('Valid urgency level required'),
  body('description').optional().isLength({ min: 1 }).withMessage('Description is required'),
  body('people_count').optional().isInt({ min: 1 }).withMessage('Valid people count required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { location, evacuation_time, urgency_level, description, people_count } = req.body;

    const emergencyData = {
      user_id: req.user.userId,
      location,
      evacuation_time,
      urgency_level: urgency_level || 'medium',
      description,
      people_count: people_count || 1
    };

    const emergency = await EmergencyRequest.create(emergencyData);

    res.status(201).json({
      message: 'Emergency request created successfully',
      emergency: {
        id: emergency.id,
        location: emergency.location,
        evacuation_time: emergency.evacuation_time,
        urgency_level: emergency.urgency_level,
        status: emergency.status,
        created_at: emergency.created_at
      }
    });
  } catch (error) {
    console.error('Create emergency error:', error);
    res.status(500).json({ error: 'Failed to create emergency request' });
  }
});

// Get all emergency requests (with filters)
router.get('/requests', authenticateToken, async (req, res) => {
  try {
    const { status, urgency_level, location, date_from, date_to, limit } = req.query;
    
    const filters = {};
    if (status) filters.status = status;
    if (urgency_level) filters.urgency_level = urgency_level;
    if (location) filters.location = location;
    if (date_from) filters.date_from = date_from;
    if (date_to) filters.date_to = date_to;
    if (limit) filters.limit = parseInt(limit);

    const emergencies = await EmergencyRequest.getAll(filters);

    res.json({ emergencies });
  } catch (error) {
    console.error('Get emergencies error:', error);
    res.status(500).json({ error: 'Failed to get emergency requests' });
  }
});

// Get emergency request by ID
router.get('/requests/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const emergency = await EmergencyRequest.findById(id);

    if (!emergency) {
      return res.status(404).json({ error: 'Emergency request not found' });
    }

    res.json({ emergency });
  } catch (error) {
    console.error('Get emergency error:', error);
    res.status(500).json({ error: 'Failed to get emergency request' });
  }
});

// Update emergency request
router.put('/requests/:id', [
  authenticateToken,
  body('location').optional().isLength({ min: 2 }).withMessage('Location must be at least 2 characters'),
  body('urgency_level').optional().isIn(['low', 'medium', 'high', 'critical']).withMessage('Valid urgency level required'),
  body('description').optional().isLength({ min: 1 }).withMessage('Description is required'),
  body('people_count').optional().isInt({ min: 1 }).withMessage('Valid people count required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { location, evacuation_time, urgency_level, description, people_count } = req.body;

    // Check if emergency exists and belongs to user
    const existingEmergency = await EmergencyRequest.findById(id);
    if (!existingEmergency) {
      return res.status(404).json({ error: 'Emergency request not found' });
    }

    if (existingEmergency.user_id !== req.user.userId) {
      return res.status(403).json({ error: 'Not authorized to update this emergency request' });
    }

    const updateData = {};
    if (location) updateData.location = location;
    if (evacuation_time) updateData.evacuation_time = evacuation_time;
    if (urgency_level) updateData.urgency_level = urgency_level;
    if (description) updateData.description = description;
    if (people_count) updateData.people_count = people_count;

    const updatedEmergency = await EmergencyRequest.update(id, updateData);

    res.json({
      message: 'Emergency request updated successfully',
      emergency: updatedEmergency
    });
  } catch (error) {
    console.error('Update emergency error:', error);
    res.status(500).json({ error: 'Failed to update emergency request' });
  }
});

// Cancel emergency request
router.put('/requests/:id/cancel', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const success = await EmergencyRequest.cancelEmergency(id, req.user.userId);

    if (!success) {
      return res.status(404).json({ error: 'Emergency request not found or not authorized' });
    }

    res.json({ message: 'Emergency request cancelled successfully' });
  } catch (error) {
    console.error('Cancel emergency error:', error);
    res.status(500).json({ error: 'Failed to cancel emergency request' });
  }
});

// Get user's emergency requests
router.get('/my-requests', authenticateToken, async (req, res) => {
  try {
    const emergencies = await EmergencyRequest.getByUserId(req.user.userId);

    res.json({ emergencies });
  } catch (error) {
    console.error('Get my emergencies error:', error);
    res.status(500).json({ error: 'Failed to get your emergency requests' });
  }
});

// Get pending emergency requests
router.get('/pending', authenticateToken, async (req, res) => {
  try {
    const emergencies = await EmergencyRequest.getPending();

    res.json({ emergencies });
  } catch (error) {
    console.error('Get pending emergencies error:', error);
    res.status(500).json({ error: 'Failed to get pending emergency requests' });
  }
});

// Get emergency requests by location
router.get('/location/:location', authenticateToken, async (req, res) => {
  try {
    const { location } = req.params;
    const emergencies = await EmergencyRequest.getByLocation(location);

    res.json({ emergencies });
  } catch (error) {
    console.error('Get emergencies by location error:', error);
    res.status(500).json({ error: 'Failed to get emergency requests by location' });
  }
});

// Get emergency requests by urgency level
router.get('/urgency/:level', authenticateToken, async (req, res) => {
  try {
    const { level } = req.params;
    const emergencies = await EmergencyRequest.getByUrgencyLevel(level);

    res.json({ emergencies });
  } catch (error) {
    console.error('Get emergencies by urgency error:', error);
    res.status(500).json({ error: 'Failed to get emergency requests by urgency level' });
  }
});

// Search emergency requests
router.get('/search', authenticateToken, async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({ error: 'Search query required' });
    }

    const emergencies = await EmergencyRequest.searchEmergencies(q);

    res.json({ emergencies });
  } catch (error) {
    console.error('Search emergencies error:', error);
    res.status(500).json({ error: 'Failed to search emergency requests' });
  }
});

// Get nearby emergency requests
router.get('/nearby', authenticateToken, async (req, res) => {
  try {
    const { latitude, longitude, radius } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({ error: 'Latitude and longitude required' });
    }

    const emergencies = await EmergencyRequest.getNearbyEmergencies(
      parseFloat(latitude),
      parseFloat(longitude),
      radius ? parseInt(radius) : 10
    );

    res.json({ emergencies });
  } catch (error) {
    console.error('Get nearby emergencies error:', error);
    res.status(500).json({ error: 'Failed to get nearby emergency requests' });
  }
});

// Get emergency statistics
router.get('/statistics', authenticateToken, async (req, res) => {
  try {
    const stats = await EmergencyRequest.getStatistics();

    res.json({ statistics: stats });
  } catch (error) {
    console.error('Get emergency statistics error:', error);
    res.status(500).json({ error: 'Failed to get emergency statistics' });
  }
});

// Get daily emergency statistics
router.get('/statistics/daily', authenticateToken, async (req, res) => {
  try {
    const stats = await EmergencyRequest.getDailyStatistics();

    res.json({ statistics: stats });
  } catch (error) {
    console.error('Get daily emergency statistics error:', error);
    res.status(500).json({ error: 'Failed to get daily emergency statistics' });
  }
});

// Get location-based emergency statistics
router.get('/statistics/location', authenticateToken, async (req, res) => {
  try {
    const stats = await EmergencyRequest.getLocationStatistics();

    res.json({ statistics: stats });
  } catch (error) {
    console.error('Get location emergency statistics error:', error);
    res.status(500).json({ error: 'Failed to get location-based emergency statistics' });
  }
});

// Emergency Locations Routes

// Get all emergency locations
router.get('/locations', authenticateToken, async (req, res) => {
  try {
    const { location_type, status, name, limit } = req.query;
    
    const filters = {};
    if (location_type) filters.location_type = location_type;
    if (status) filters.status = status;
    if (name) filters.name = name;
    if (limit) filters.limit = parseInt(limit);

    const locations = await EmergencyLocation.getAll(filters);

    res.json({ locations });
  } catch (error) {
    console.error('Get emergency locations error:', error);
    res.status(500).json({ error: 'Failed to get emergency locations' });
  }
});

// Get emergency locations by type
router.get('/locations/type/:type', authenticateToken, async (req, res) => {
  try {
    const { type } = req.params;
    const locations = await EmergencyLocation.getByType(type);

    res.json({ locations });
  } catch (error) {
    console.error('Get emergency locations by type error:', error);
    res.status(500).json({ error: 'Failed to get emergency locations by type' });
  }
});

// Get available emergency locations
router.get('/locations/available', authenticateToken, async (req, res) => {
  try {
    const locations = await EmergencyLocation.getAvailable();

    res.json({ locations });
  } catch (error) {
    console.error('Get available emergency locations error:', error);
    res.status(500).json({ error: 'Failed to get available emergency locations' });
  }
});

// Get full emergency locations
router.get('/locations/full', authenticateToken, async (req, res) => {
  try {
    const locations = await EmergencyLocation.getFull();

    res.json({ locations });
  } catch (error) {
    console.error('Get full emergency locations error:', error);
    res.status(500).json({ error: 'Failed to get full emergency locations' });
  }
});

// Search emergency locations
router.get('/locations/search', authenticateToken, async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({ error: 'Search query required' });
    }

    const locations = await EmergencyLocation.searchLocations(q);

    res.json({ locations });
  } catch (error) {
    console.error('Search emergency locations error:', error);
    res.status(500).json({ error: 'Failed to search emergency locations' });
  }
});

// Get nearby emergency locations
router.get('/locations/nearby', authenticateToken, async (req, res) => {
  try {
    const { latitude, longitude, radius } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({ error: 'Latitude and longitude required' });
    }

    const locations = await EmergencyLocation.getNearbyLocations(
      parseFloat(latitude),
      parseFloat(longitude),
      radius ? parseInt(radius) : 10
    );

    res.json({ locations });
  } catch (error) {
    console.error('Get nearby emergency locations error:', error);
    res.status(500).json({ error: 'Failed to get nearby emergency locations' });
  }
});

// Get emergency location statistics
router.get('/locations/statistics', authenticateToken, async (req, res) => {
  try {
    const stats = await EmergencyLocation.getStatistics();

    res.json({ statistics: stats });
  } catch (error) {
    console.error('Get emergency location statistics error:', error);
    res.status(500).json({ error: 'Failed to get emergency location statistics' });
  }
});

// Evacuation Time Slots Routes

// Get evacuation time slots
router.get('/time-slots', authenticateToken, async (req, res) => {
  try {
    const { date, status, time_slot, limit } = req.query;
    
    const filters = {};
    if (date) filters.date = date;
    if (status) filters.status = status;
    if (time_slot) filters.time_slot = time_slot;
    if (limit) filters.limit = parseInt(limit);

    const timeSlots = await EvacuationTimeSlot.getAll(filters);

    res.json({ time_slots: timeSlots });
  } catch (error) {
    console.error('Get evacuation time slots error:', error);
    res.status(500).json({ error: 'Failed to get evacuation time slots' });
  }
});

// Get time slots for a specific date
router.get('/time-slots/date/:date', authenticateToken, async (req, res) => {
  try {
    const { date } = req.params;
    const timeSlots = await EvacuationTimeSlot.getByDate(date);

    res.json({ time_slots: timeSlots });
  } catch (error) {
    console.error('Get time slots by date error:', error);
    res.status(500).json({ error: 'Failed to get time slots for date' });
  }
});

// Get available time slots
router.get('/time-slots/available', authenticateToken, async (req, res) => {
  try {
    const timeSlots = await EvacuationTimeSlot.getAvailable();

    res.json({ time_slots: timeSlots });
  } catch (error) {
    console.error('Get available time slots error:', error);
    res.status(500).json({ error: 'Failed to get available time slots' });
  }
});

// Book a time slot
router.post('/time-slots/:id/book', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const timeSlot = await EvacuationTimeSlot.bookSlot(id);

    if (!timeSlot) {
      return res.status(400).json({ error: 'Time slot not available for booking' });
    }

    res.json({
      message: 'Time slot booked successfully',
      time_slot: timeSlot
    });
  } catch (error) {
    console.error('Book time slot error:', error);
    res.status(500).json({ error: 'Failed to book time slot' });
  }
});

// Cancel time slot booking
router.post('/time-slots/:id/cancel', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const timeSlot = await EvacuationTimeSlot.cancelBooking(id);

    res.json({
      message: 'Time slot booking cancelled successfully',
      time_slot: timeSlot
    });
  } catch (error) {
    console.error('Cancel time slot booking error:', error);
    res.status(500).json({ error: 'Failed to cancel time slot booking' });
  }
});

// Get today's time slots
router.get('/time-slots/today', authenticateToken, async (req, res) => {
  try {
    const timeSlots = await EvacuationTimeSlot.getTodaySlots();

    res.json({ time_slots: timeSlots });
  } catch (error) {
    console.error('Get today time slots error:', error);
    res.status(500).json({ error: 'Failed to get today\'s time slots' });
  }
});

// Get upcoming time slots
router.get('/time-slots/upcoming', authenticateToken, async (req, res) => {
  try {
    const { days } = req.query;
    const timeSlots = await EvacuationTimeSlot.getUpcomingSlots(days ? parseInt(days) : 7);

    res.json({ time_slots: timeSlots });
  } catch (error) {
    console.error('Get upcoming time slots error:', error);
    res.status(500).json({ error: 'Failed to get upcoming time slots' });
  }
});

// Get time slot statistics
router.get('/time-slots/statistics', authenticateToken, async (req, res) => {
  try {
    const stats = await EvacuationTimeSlot.getStatistics();

    res.json({ statistics: stats });
  } catch (error) {
    console.error('Get time slot statistics error:', error);
    res.status(500).json({ error: 'Failed to get time slot statistics' });
  }
});

module.exports = router;
