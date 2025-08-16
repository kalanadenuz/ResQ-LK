/**
 * Relief Routes Module
 * 
 * This module handles all relief-related API endpoints including:
 * - Creating relief requests
 * - Managing relief bookings
 * - Tracking relief status
 * - Relief history and statistics
 * 
 * @author ResQ-LK Team
 * @version 1.0.0
 */

const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const ReliefRequest = require('../models/ReliefRequest');
const User = require('../models/User');
const EmergencyLocation = require('../models/EmergencyLocation');

/**
 * POST /api/relief/request
 * Create a new relief request
 * 
 * @body {Object} reliefData - Relief request details
 * @body {string} reliefData.location_id - Emergency location ID
 * @body {string} reliefData.request_type - Type of relief needed (food, water, shelter, medical)
 * @body {number} reliefData.quantity - Quantity needed
 * @body {string} reliefData.urgency_level - Urgency level (low, medium, high, critical)
 * @body {string} reliefData.description - Additional description
 * @body {string} reliefData.preferred_time - Preferred delivery time
 * 
 * @returns {Object} Created relief request with status
 */
router.post('/request', authenticateToken, async (req, res) => {
    try {
        const { location_id, request_type, quantity, urgency_level, description, preferred_time } = req.body;
        const user_id = req.user.id;

        // Validate required fields
        if (!location_id || !request_type || !urgency_level) {
            return res.status(400).json({
                success: false,
                message: 'Location, request type, and urgency level are required'
            });
        }

        // Check if location exists and is available
        const location = await EmergencyLocation.findById(location_id);
        if (!location) {
            return res.status(404).json({
                success: false,
                message: 'Emergency location not found'
            });
        }

        // Create relief request
        const reliefRequest = await ReliefRequest.create({
            user_id,
            location_id,
            request_type,
            quantity: quantity || 1,
            urgency_level,
            description: description || '',
            preferred_time: preferred_time || null,
            status: 'pending'
        });

        // Create notification for admin
        await ReliefRequest.createNotification(reliefRequest.id, 'relief_request_created');

        res.status(201).json({
            success: true,
            message: 'Relief request created successfully',
            data: reliefRequest
        });

    } catch (error) {
        console.error('Error creating relief request:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create relief request',
            error: error.message
        });
    }
});

/**
 * GET /api/relief/requests
 * Get all relief requests for the authenticated user
 * 
 * @query {string} status - Filter by status (pending, approved, in_progress, completed, cancelled)
 * @query {number} page - Page number for pagination (default: 1)
 * @query {number} limit - Items per page (default: 10)
 * 
 * @returns {Object} Paginated list of relief requests
 */
router.get('/requests', authenticateToken, async (req, res) => {
    try {
        const { status, page = 1, limit = 10 } = req.query;
        const user_id = req.user.id;

        const requests = await ReliefRequest.findByUserId(user_id, {
            status,
            page: parseInt(page),
            limit: parseInt(limit)
        });

        res.json({
            success: true,
            data: requests
        });

    } catch (error) {
        console.error('Error fetching relief requests:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch relief requests',
            error: error.message
        });
    }
});

/**
 * GET /api/relief/request/:id
 * Get specific relief request details
 * 
 * @param {string} id - Relief request ID
 * 
 * @returns {Object} Relief request details with location and user info
 */
router.get('/request/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const user_id = req.user.id;

        const request = await ReliefRequest.findByIdWithDetails(id, user_id);
        
        if (!request) {
            return res.status(404).json({
                success: false,
                message: 'Relief request not found'
            });
        }

        res.json({
            success: true,
            data: request
        });

    } catch (error) {
        console.error('Error fetching relief request:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch relief request',
            error: error.message
        });
    }
});

/**
 * PUT /api/relief/request/:id
 * Update relief request details
 * 
 * @param {string} id - Relief request ID
 * @body {Object} updateData - Fields to update
 * 
 * @returns {Object} Updated relief request
 */
router.put('/request/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const user_id = req.user.id;
        const updateData = req.body;

        // Check if request exists and belongs to user
        const existingRequest = await ReliefRequest.findById(id);
        if (!existingRequest || existingRequest.user_id !== user_id) {
            return res.status(404).json({
                success: false,
                message: 'Relief request not found'
            });
        }

        // Only allow updates if request is still pending
        if (existingRequest.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: 'Cannot update relief request that is not pending'
            });
        }

        const updatedRequest = await ReliefRequest.updateById(id, updateData);

        res.json({
            success: true,
            message: 'Relief request updated successfully',
            data: updatedRequest
        });

    } catch (error) {
        console.error('Error updating relief request:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update relief request',
            error: error.message
        });
    }
});

/**
 * DELETE /api/relief/request/:id
 * Cancel relief request
 * 
 * @param {string} id - Relief request ID
 * 
 * @returns {Object} Success message
 */
router.delete('/request/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const user_id = req.user.id;

        // Check if request exists and belongs to user
        const existingRequest = await ReliefRequest.findById(id);
        if (!existingRequest || existingRequest.user_id !== user_id) {
            return res.status(404).json({
                success: false,
                message: 'Relief request not found'
            });
        }

        // Only allow cancellation if request is pending or approved
        if (!['pending', 'approved'].includes(existingRequest.status)) {
            return res.status(400).json({
                success: false,
                message: 'Cannot cancel relief request in current status'
            });
        }

        await ReliefRequest.cancelById(id);

        res.json({
            success: true,
            message: 'Relief request cancelled successfully'
        });

    } catch (error) {
        console.error('Error cancelling relief request:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to cancel relief request',
            error: error.message
        });
    }
});

/**
 * GET /api/relief/statistics
 * Get relief request statistics for the user
 * 
 * @returns {Object} Statistics including total requests, status breakdown, etc.
 */
router.get('/statistics', authenticateToken, async (req, res) => {
    try {
        const user_id = req.user.id;
        const statistics = await ReliefRequest.getUserStatistics(user_id);

        res.json({
            success: true,
            data: statistics
        });

    } catch (error) {
        console.error('Error fetching relief statistics:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch relief statistics',
            error: error.message
        });
    }
});

/**
 * GET /api/relief/types
 * Get available relief request types
 * 
 * @returns {Array} List of available relief types
 */
router.get('/types', async (req, res) => {
    try {
        const reliefTypes = [
            { id: 'food', name: 'Food Supplies', description: 'Emergency food rations and supplies' },
            { id: 'water', name: 'Water', description: 'Clean drinking water' },
            { id: 'shelter', name: 'Shelter', description: 'Temporary shelter or housing assistance' },
            { id: 'medical', name: 'Medical Aid', description: 'Medical supplies and first aid' },
            { id: 'clothing', name: 'Clothing', description: 'Emergency clothing and blankets' },
            { id: 'hygiene', name: 'Hygiene Supplies', description: 'Sanitation and hygiene products' },
            { id: 'transport', name: 'Transportation', description: 'Emergency transportation assistance' },
            { id: 'other', name: 'Other', description: 'Other emergency relief needs' }
        ];

        res.json({
            success: true,
            data: reliefTypes
        });

    } catch (error) {
        console.error('Error fetching relief types:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch relief types',
            error: error.message
        });
    }
});

module.exports = router;
