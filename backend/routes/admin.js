const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const db = require('../config/database');

const router = express.Router();

// Middleware to verify JWT token and admin access
const authenticateAdmin = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'resq-lk-secret-key');
    if (decoded.userType !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid token' });
  }
};

// Get dashboard overview
router.get('/dashboard', authenticateAdmin, async (req, res) => {
  try {
    // Get relief request statistics
    const [reliefStats] = await db.promise().query(
      `SELECT 
        COUNT(*) as total_requests,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_requests,
        SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END) as confirmed_requests,
        SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress_requests,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_requests,
        SUM(CASE WHEN urgency_level = 'critical' THEN 1 ELSE 0 END) as critical_requests
       FROM relief_requests`
    );
    
    // Get volunteer statistics
    const [volunteerStats] = await db.promise().query(
      `SELECT 
        COUNT(*) as total_offers,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_offers,
        SUM(CASE WHEN status = 'accepted' THEN 1 ELSE 0 END) as accepted_offers,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_offers
       FROM volunteer_offers`
    );
    
    // Get team statistics
    const [teamStats] = await db.promise().query(
      `SELECT 
        COUNT(*) as total_teams,
        SUM(CASE WHEN status = 'available' THEN 1 ELSE 0 END) as available_teams,
        SUM(CASE WHEN status = 'deployed' THEN 1 ELSE 0 END) as deployed_teams,
        SUM(CASE WHEN status = 'busy' THEN 1 ELSE 0 END) as busy_teams
       FROM emergency_teams`
    );
    
    // Get recent activities
    const [recentRequests] = await db.promise().query(
      `SELECT r.*, u.name as requester_name, u.phone as requester_phone
       FROM relief_requests r
       LEFT JOIN users u ON r.user_id = u.id
       ORDER BY r.created_at DESC
       LIMIT 10`
    );
    
    const [recentVolunteers] = await db.promise().query(
      `SELECT v.*, u.name as volunteer_name, u.phone as volunteer_phone
       FROM volunteer_offers v
       LEFT JOIN users u ON v.user_id = u.id
       ORDER BY v.created_at DESC
       LIMIT 10`
    );
    
    res.json({
      success: true,
      dashboard: {
        relief: reliefStats[0],
        volunteers: volunteerStats[0],
        teams: teamStats[0],
        recentRequests,
        recentVolunteers
      }
    });
    
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

// Emergency Teams Management

// Create new emergency team
router.post('/teams', [
  body('name').notEmpty().withMessage('Team name is required'),
  body('teamType').isIn(['medical', 'rescue', 'logistics', 'communication']).withMessage('Valid team type required'),
  body('location').notEmpty().withMessage('Location is required')
], authenticateAdmin, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, teamType, location } = req.body;
    
    const [result] = await db.promise().query(
      'INSERT INTO emergency_teams (name, team_type, location, status) VALUES (?, ?, ?, ?)',
      [name, teamType, location, 'available']
    );
    
    res.json({
      success: true,
      message: 'Emergency team created successfully',
      team: {
        id: result.insertId,
        name,
        teamType,
        location,
        status: 'available'
      }
    });
    
  } catch (error) {
    console.error('Create team error:', error);
    res.status(500).json({ error: 'Failed to create team' });
  }
});

// Get all emergency teams
router.get('/teams', authenticateAdmin, async (req, res) => {
  try {
    const [teams] = await db.promise().query(
      'SELECT * FROM emergency_teams ORDER BY created_at DESC'
    );
    
    res.json({
      success: true,
      teams: teams
    });
    
  } catch (error) {
    console.error('Get teams error:', error);
    res.status(500).json({ error: 'Failed to fetch teams' });
  }
});

// Update team status
router.put('/teams/:id/status', [
  body('status').isIn(['available', 'deployed', 'busy']).withMessage('Valid status required')
], authenticateAdmin, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { status } = req.body;
    
    await db.promise().query(
      'UPDATE emergency_teams SET status = ? WHERE id = ?',
      [status, id]
    );
    
    res.json({
      success: true,
      message: 'Team status updated successfully',
      status: status
    });
    
  } catch (error) {
    console.error('Update team status error:', error);
    res.status(500).json({ error: 'Failed to update team status' });
  }
});

// Assign team to relief request
router.post('/teams/:teamId/assign/:requestId', authenticateAdmin, async (req, res) => {
  try {
    const { teamId, requestId } = req.params;
    
    // Check if team and request exist
    const [teams] = await db.promise().query(
      'SELECT * FROM emergency_teams WHERE id = ? AND status = "available"',
      [teamId]
    );
    
    const [requests] = await db.promise().query(
      'SELECT * FROM relief_requests WHERE id = ? AND status = "pending"',
      [requestId]
    );
    
    if (teams.length === 0) {
      return res.status(404).json({ error: 'Team not found or not available' });
    }
    
    if (requests.length === 0) {
      return res.status(404).json({ error: 'Request not found or not pending' });
    }
    
    // Create team assignment
    await db.promise().query(
      'INSERT INTO team_assignments (team_id, relief_request_id, status) VALUES (?, ?, ?)',
      [teamId, requestId, 'assigned']
    );
    
    // Update team status to deployed
    await db.promise().query(
      'UPDATE emergency_teams SET status = "deployed" WHERE id = ?',
      [teamId]
    );
    
    // Update request status to confirmed
    await db.promise().query(
      'UPDATE relief_requests SET status = "confirmed" WHERE id = ?',
      [requestId]
    );
    
    res.json({
      success: true,
      message: 'Team assigned to relief request successfully'
    });
    
  } catch (error) {
    console.error('Assign team error:', error);
    res.status(500).json({ error: 'Failed to assign team' });
  }
});

// Get team assignments
router.get('/assignments', authenticateAdmin, async (req, res) => {
  try {
    const [assignments] = await db.promise().query(
      `SELECT ta.*, t.name as team_name, t.team_type, t.location as team_location,
              r.location as request_location, r.urgency_level, r.needs,
              u.name as requester_name, u.phone as requester_phone
       FROM team_assignments ta
       LEFT JOIN emergency_teams t ON ta.team_id = t.id
       LEFT JOIN relief_requests r ON ta.relief_request_id = r.id
       LEFT JOIN users u ON r.user_id = u.id
       ORDER BY ta.assigned_at DESC`
    );
    
    res.json({
      success: true,
      assignments: assignments
    });
    
  } catch (error) {
    console.error('Get assignments error:', error);
    res.status(500).json({ error: 'Failed to fetch assignments' });
  }
});

// Update assignment status
router.put('/assignments/:id/status', [
  body('status').isIn(['assigned', 'in_progress', 'completed']).withMessage('Valid status required')
], authenticateAdmin, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { status } = req.body;
    
    // Get assignment details
    const [assignments] = await db.promise().query(
      'SELECT * FROM team_assignments WHERE id = ?',
      [id]
    );
    
    if (assignments.length === 0) {
      return res.status(404).json({ error: 'Assignment not found' });
    }
    
    const assignment = assignments[0];
    
    // Update assignment status
    await db.promise().query(
      'UPDATE team_assignments SET status = ? WHERE id = ?',
      [status, id]
    );
    
    // Update related records based on status
    if (status === 'completed') {
      // Mark team as available again
      await db.promise().query(
        'UPDATE emergency_teams SET status = "available" WHERE id = ?',
        [assignment.team_id]
      );
      
      // Mark request as completed
      await db.promise().query(
        'UPDATE relief_requests SET status = "completed" WHERE id = ?',
        [assignment.relief_request_id]
      );
    } else if (status === 'in_progress') {
      // Mark request as in progress
      await db.promise().query(
        'UPDATE relief_requests SET status = "in_progress" WHERE id = ?',
        [assignment.relief_request_id]
      );
    }
    
    res.json({
      success: true,
      message: 'Assignment status updated successfully',
      status: status
    });
    
  } catch (error) {
    console.error('Update assignment status error:', error);
    res.status(500).json({ error: 'Failed to update assignment status' });
  }
});

// Get emergency map data
router.get('/map-data', authenticateAdmin, async (req, res) => {
  try {
    // Get all relief requests with coordinates
    const [requests] = await db.promise().query(
      `SELECT id, location, latitude, longitude, urgency_level, status, created_at
       FROM relief_requests 
       WHERE latitude IS NOT NULL AND longitude IS NOT NULL`
    );
    
    // Get all volunteer offers with coordinates
    const [volunteers] = await db.promise().query(
      `SELECT id, location, latitude, longitude, skills, status, created_at
       FROM volunteer_offers 
       WHERE latitude IS NOT NULL AND longitude IS NOT NULL`
    );
    
    // Get all emergency teams
    const [teams] = await db.promise().query(
      `SELECT id, name, team_type, location, status
       FROM emergency_teams`
    );
    
    res.json({
      success: true,
      mapData: {
        requests,
        volunteers,
        teams
      }
    });
    
  } catch (error) {
    console.error('Get map data error:', error);
    res.status(500).json({ error: 'Failed to fetch map data' });
  }
});

// Get system logs
router.get('/logs', authenticateAdmin, async (req, res) => {
  try {
    const { type, limit = 100 } = req.query;
    
    let query = '';
    let params = [];
    
    if (type === 'sms') {
      query = 'SELECT * FROM sms_logs ORDER BY created_at DESC LIMIT ?';
      params = [parseInt(limit)];
    } else {
      // Default to recent relief requests
      query = `
        SELECT 'relief_request' as type, id, created_at, status, location
        FROM relief_requests 
        ORDER BY created_at DESC 
        LIMIT ?
      `;
      params = [parseInt(limit)];
    }
    
    const [logs] = await db.promise().query(query, params);
    
    res.json({
      success: true,
      logs: logs
    });
    
  } catch (error) {
    console.error('Get logs error:', error);
    res.status(500).json({ error: 'Failed to fetch logs' });
  }
});

module.exports = router;
