/**
 * Volunteer Routes Module
 * 
 * This module handles all volunteer-related API endpoints including:
 * - Volunteer registration and profile management
 * - Task assignments and availability
 * - Volunteer statistics and reporting
 * - Admin volunteer management
 * 
 * @author ResQ-LK Team
 * @version 1.0.0
 */

const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const Volunteer = require('../models/Volunteer');
const User = require('../models/User');

/**
 * POST /api/volunteer/register
 * Register a new volunteer
 * 
 * @body {Object} volunteerData - Volunteer registration details
 * @body {string} volunteerData.name - Full name of volunteer
 * @body {string} volunteerData.national_id - National ID number
 * @body {string} volunteerData.mobile - Mobile phone number
 * @body {string} volunteerData.shift - Preferred shift (morning, afternoon, evening, night)
 * @body {Array} volunteerData.tasks - Array of preferred tasks (rescue, medical, logistics, communication)
 * @body {string} volunteerData.emergency_contact - Emergency contact number
 * @body {string} volunteerData.skills - Special skills or qualifications
 * @body {string} volunteerData.availability - Availability notes
 * 
 * @returns {Object} Created volunteer profile with status
 */
router.post('/register', async (req, res) => {
    try {
        const {
            name,
            national_id,
            mobile,
            shift,
            tasks,
            emergency_contact,
            skills,
            availability
        } = req.body;

        // Validate required fields
        if (!name || !national_id || !mobile || !shift || !tasks || !Array.isArray(tasks)) {
            return res.status(400).json({
                success: false,
                message: 'Name, national ID, mobile, shift, and tasks are required'
            });
        }

        // Check if volunteer already exists
        const existingVolunteer = await Volunteer.findByNationalId(national_id);
        if (existingVolunteer) {
            return res.status(409).json({
                success: false,
                message: 'Volunteer with this national ID already exists'
            });
        }

        // Create volunteer profile
        const volunteer = await Volunteer.create({
            name,
            national_id,
            mobile,
            shift,
            tasks: tasks.join(','),
            emergency_contact: emergency_contact || '',
            skills: skills || '',
            availability: availability || '',
            status: 'pending'
        });

        // Create notification for admin
        await Volunteer.createNotification(volunteer.id, 'volunteer_registered');

        res.status(201).json({
            success: true,
            message: 'Volunteer registration submitted successfully',
            data: volunteer
        });

    } catch (error) {
        console.error('Error registering volunteer:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to register volunteer',
            error: error.message
        });
    }
});

/**
 * GET /api/volunteer/profile/:id
 * Get volunteer profile by ID
 * 
 * @param {string} id - Volunteer ID
 * 
 * @returns {Object} Volunteer profile details
 */
router.get('/profile/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const volunteer = await Volunteer.findById(id);

        if (!volunteer) {
            return res.status(404).json({
                success: false,
                message: 'Volunteer not found'
            });
        }

        res.json({
            success: true,
            data: volunteer
        });

    } catch (error) {
        console.error('Error fetching volunteer profile:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch volunteer profile',
            error: error.message
        });
    }
});

/**
 * PUT /api/volunteer/profile/:id
 * Update volunteer profile
 * 
 * @param {string} id - Volunteer ID
 * @body {Object} updateData - Fields to update
 * 
 * @returns {Object} Updated volunteer profile
 */
router.put('/profile/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        // Check if volunteer exists
        const existingVolunteer = await Volunteer.findById(id);
        if (!existingVolunteer) {
            return res.status(404).json({
                success: false,
                message: 'Volunteer not found'
            });
        }

        const updatedVolunteer = await Volunteer.updateById(id, updateData);

        res.json({
            success: true,
            message: 'Volunteer profile updated successfully',
            data: updatedVolunteer
        });

    } catch (error) {
        console.error('Error updating volunteer profile:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update volunteer profile',
            error: error.message
        });
    }
});

/**
 * GET /api/volunteer/search
 * Search volunteers by criteria
 * 
 * @query {string} name - Search by name
 * @query {string} shift - Filter by shift
 * @query {string} status - Filter by status
 * @query {string} tasks - Filter by tasks (comma-separated)
 * @query {number} page - Page number for pagination (default: 1)
 * @query {number} limit - Items per page (default: 10)
 * 
 * @returns {Object} Paginated list of volunteers matching criteria
 */
router.get('/search', async (req, res) => {
    try {
        const { name, shift, status, tasks, page = 1, limit = 10 } = req.query;

        const volunteers = await Volunteer.search({
            name,
            shift,
            status,
            tasks: tasks ? tasks.split(',') : null,
            page: parseInt(page),
            limit: parseInt(limit)
        });

        res.json({
            success: true,
            data: volunteers
        });

    } catch (error) {
        console.error('Error searching volunteers:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to search volunteers',
            error: error.message
        });
    }
});

/**
 * GET /api/volunteer/available
 * Get available volunteers for emergency response
 * 
 * @query {string} shift - Required shift
 * @query {string} tasks - Required tasks (comma-separated)
 * @query {string} location - Location preference
 * 
 * @returns {Array} List of available volunteers
 */
router.get('/available', async (req, res) => {
    try {
        const { shift, tasks, location } = req.query;

        const availableVolunteers = await Volunteer.findAvailable({
            shift,
            tasks: tasks ? tasks.split(',') : null,
            location
        });

        res.json({
            success: true,
            data: availableVolunteers
        });

    } catch (error) {
        console.error('Error fetching available volunteers:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch available volunteers',
            error: error.message
        });
    }
});

/**
 * PUT /api/volunteer/:id/status
 * Update volunteer status (Admin only)
 * 
 * @param {string} id - Volunteer ID
 * @body {string} status - New status (pending, approved, active, inactive, suspended)
 * @body {string} notes - Admin notes for status change
 * 
 * @returns {Object} Updated volunteer with status
 */
router.put('/:id/status', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { status, notes } = req.body;

        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Admin access required'
            });
        }

        // Validate status
        const validStatuses = ['pending', 'approved', 'active', 'inactive', 'suspended'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status value'
            });
        }

        const updatedVolunteer = await Volunteer.updateStatus(id, status, notes);

        res.json({
            success: true,
            message: 'Volunteer status updated successfully',
            data: updatedVolunteer
        });

    } catch (error) {
        console.error('Error updating volunteer status:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update volunteer status',
            error: error.message
        });
    }
});

/**
 * GET /api/volunteer/statistics
 * Get volunteer statistics (Admin only)
 * 
 * @returns {Object} Statistics including total volunteers, status breakdown, etc.
 */
router.get('/statistics', authenticateToken, async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Admin access required'
            });
        }

        const statistics = await Volunteer.getStatistics();

        res.json({
            success: true,
            data: statistics
        });

    } catch (error) {
        console.error('Error fetching volunteer statistics:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch volunteer statistics',
            error: error.message
        });
    }
});

/**
 * GET /api/volunteer/shifts
 * Get available volunteer shifts
 * 
 * @returns {Array} List of available shifts
 */
router.get('/shifts', async (req, res) => {
    try {
        const shifts = [
            { id: 'morning', name: 'Morning (6 AM - 12 PM)', description: 'Early morning emergency response' },
            { id: 'afternoon', name: 'Afternoon (12 PM - 6 PM)', description: 'Daytime emergency response' },
            { id: 'evening', name: 'Evening (6 PM - 12 AM)', description: 'Evening emergency response' },
            { id: 'night', name: 'Night (12 AM - 6 AM)', description: 'Overnight emergency response' },
            { id: 'flexible', name: 'Flexible', description: 'Available for any shift' }
        ];

        res.json({
            success: true,
            data: shifts
        });

    } catch (error) {
        console.error('Error fetching shifts:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch shifts',
            error: error.message
        });
    }
});

/**
 * GET /api/volunteer/tasks
 * Get available volunteer tasks
 * 
 * @returns {Array} List of available tasks
 */
router.get('/tasks', async (req, res) => {
    try {
        const tasks = [
            { id: 'rescue', name: 'Search & Rescue', description: 'Emergency search and rescue operations' },
            { id: 'medical', name: 'Medical Aid', description: 'First aid and medical assistance' },
            { id: 'logistics', name: 'Logistics', description: 'Supply distribution and logistics support' },
            { id: 'communication', name: 'Communication', description: 'Emergency communication and coordination' },
            { id: 'transport', name: 'Transportation', description: 'Emergency transportation assistance' },
            { id: 'technical', name: 'Technical Support', description: 'Technical and equipment support' },
            { id: 'counseling', name: 'Counseling', description: 'Psychological support and counseling' },
            { id: 'coordination', name: 'Coordination', description: 'Emergency response coordination' }
        ];

        res.json({
            success: true,
            data: tasks
        });

    } catch (error) {
        console.error('Error fetching tasks:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch tasks',
            error: error.message
        });
    }
});

module.exports = router;
