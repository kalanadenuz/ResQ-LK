/**
 * Authentication Middleware Module
 * 
 * This module provides authentication and authorization middleware functions:
 * - JWT token verification
 * - Role-based access control
 * - Request validation
 * - Error handling for authentication failures
 * 
 * @author ResQ-LK Team
 * @version 1.0.0
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Middleware to verify JWT authentication token
 * 
 * This middleware extracts the JWT token from the Authorization header,
 * verifies its validity, and attaches the decoded user information to the request object.
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 * 
 * @returns {void}
 * 
 * @example
 * // Usage in routes
 * router.get('/protected', authenticateToken, (req, res) => {
 *   // req.user contains the decoded token payload
 *   res.json({ user: req.user });
 * });
 */
const authenticateToken = async (req, res, next) => {
    try {
        // Extract token from Authorization header
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access token required',
                error: 'MISSING_TOKEN'
            });
        }

        // Verify JWT token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'resq-lk-secret-key');
        
        // Check if user still exists in database
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User not found',
                error: 'USER_NOT_FOUND'
            });
        }

        // Check if user is active
        if (user.status !== 'active') {
            return res.status(401).json({
                success: false,
                message: 'User account is not active',
                error: 'INACTIVE_USER'
            });
        }

        // Attach user information to request object
        req.user = {
            id: user.id,
            phone: user.phone,
            name: user.name,
            role: user.role || 'user',
            status: user.status
        };

        next();

    } catch (error) {
        console.error('Authentication error:', error);

        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token',
                error: 'INVALID_TOKEN'
            });
        }

        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expired',
                error: 'TOKEN_EXPIRED'
            });
        }

        return res.status(500).json({
            success: false,
            message: 'Authentication failed',
            error: 'AUTH_ERROR'
        });
    }
};

/**
 * Middleware to require specific user roles
 * 
 * This middleware checks if the authenticated user has the required role(s)
 * to access the protected resource.
 * 
 * @param {string|Array} roles - Required role(s) for access
 * @returns {Function} Express middleware function
 * 
 * @example
 * // Require admin role
 * router.get('/admin', authenticateToken, requireRole('admin'), (req, res) => {
 *   // Only admins can access this route
 * });
 * 
 * // Require either admin or moderator role
 * router.get('/moderate', authenticateToken, requireRole(['admin', 'moderator']), (req, res) => {
 *   // Admins and moderators can access this route
 * });
 */
const requireRole = (roles) => {
    return (req, res, next) => {
        try {
            // Ensure user is authenticated
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: 'Authentication required',
                    error: 'AUTH_REQUIRED'
                });
            }

            // Convert single role to array for consistent handling
            const requiredRoles = Array.isArray(roles) ? roles : [roles];

            // Check if user has any of the required roles
            if (!requiredRoles.includes(req.user.role)) {
                return res.status(403).json({
                    success: false,
                    message: 'Insufficient permissions',
                    error: 'INSUFFICIENT_PERMISSIONS',
                    required: requiredRoles,
                    current: req.user.role
                });
            }

            next();

        } catch (error) {
            console.error('Role verification error:', error);
            return res.status(500).json({
                success: false,
                message: 'Role verification failed',
                error: 'ROLE_VERIFICATION_ERROR'
            });
        }
    };
};

/**
 * Middleware to require admin role specifically
 * 
 * Convenience middleware that requires the user to have admin role.
 * 
 * @returns {Function} Express middleware function
 * 
 * @example
 * router.get('/admin-only', authenticateToken, requireAdmin, (req, res) => {
 *   // Only admins can access this route
 * });
 */
const requireAdmin = requireRole('admin');

/**
 * Middleware to verify user ownership or admin access
 * 
 * This middleware ensures that a user can only access their own resources
 * unless they are an admin.
 * 
 * @param {string} resourceUserIdField - Field name containing the resource user ID (default: 'user_id')
 * @returns {Function} Express middleware function
 * 
 * @example
 * router.get('/profile/:id', authenticateToken, requireOwnership('user_id'), (req, res) => {
 *   // Users can only access their own profile, admins can access any profile
 * });
 */
const requireOwnership = (resourceUserIdField = 'user_id') => {
    return (req, res, next) => {
        try {
            // Ensure user is authenticated
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: 'Authentication required',
                    error: 'AUTH_REQUIRED'
                });
            }

            // Admins can access any resource
            if (req.user.role === 'admin') {
                return next();
            }

            // Get resource user ID from request
            const resourceUserId = req.body[resourceUserIdField] || req.params[resourceUserIdField] || req.query[resourceUserIdField];

            if (!resourceUserId) {
                return res.status(400).json({
                    success: false,
                    message: 'Resource user ID not found',
                    error: 'MISSING_RESOURCE_USER_ID'
                });
            }

            // Check if user owns the resource
            if (resourceUserId !== req.user.id) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied to this resource',
                    error: 'RESOURCE_ACCESS_DENIED'
                });
            }

            next();

        } catch (error) {
            console.error('Ownership verification error:', error);
            return res.status(500).json({
                success: false,
                message: 'Ownership verification failed',
                error: 'OWNERSHIP_VERIFICATION_ERROR'
            });
        }
    };
};

/**
 * Middleware to validate request body fields
 * 
 * This middleware validates that required fields are present in the request body.
 * 
 * @param {Array} requiredFields - Array of required field names
 * @returns {Function} Express middleware function
 * 
 * @example
 * router.post('/user', authenticateToken, validateFields(['name', 'email']), (req, res) => {
 *   // Request body must contain name and email fields
 * });
 */
const validateFields = (requiredFields) => {
    return (req, res, next) => {
        try {
            const missingFields = [];

            // Check each required field
            requiredFields.forEach(field => {
                if (!req.body[field] || req.body[field].toString().trim() === '') {
                    missingFields.push(field);
                }
            });

            if (missingFields.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Missing required fields',
                    error: 'MISSING_FIELDS',
                    missing: missingFields
                });
            }

            next();

        } catch (error) {
            console.error('Field validation error:', error);
            return res.status(500).json({
                success: false,
                message: 'Field validation failed',
                error: 'VALIDATION_ERROR'
            });
        }
    };
};

/**
 * Middleware to handle rate limiting
 * 
 * Basic rate limiting middleware to prevent abuse.
 * 
 * @param {number} maxRequests - Maximum requests per window
 * @param {number} windowMs - Time window in milliseconds (default: 15 minutes)
 * @returns {Function} Express middleware function
 * 
 * @example
 * router.post('/login', rateLimit(5, 15 * 60 * 1000), (req, res) => {
 *   // Allow maximum 5 login attempts per 15 minutes
 * });
 */
const rateLimit = (maxRequests, windowMs = 15 * 60 * 1000) => {
    const requests = new Map();

    return (req, res, next) => {
        try {
            const key = req.ip || req.connection.remoteAddress;
            const now = Date.now();
            const windowStart = now - windowMs;

            // Get existing requests for this IP
            const userRequests = requests.get(key) || [];

            // Remove old requests outside the window
            const recentRequests = userRequests.filter(timestamp => timestamp > windowStart);

            // Check if limit exceeded
            if (recentRequests.length >= maxRequests) {
                return res.status(429).json({
                    success: false,
                    message: 'Too many requests',
                    error: 'RATE_LIMIT_EXCEEDED',
                    retryAfter: Math.ceil(windowMs / 1000)
                });
            }

            // Add current request
            recentRequests.push(now);
            requests.set(key, recentRequests);

            next();

        } catch (error) {
            console.error('Rate limiting error:', error);
            // Continue without rate limiting if error occurs
            next();
        }
    };
};

module.exports = {
    authenticateToken,
    requireRole,
    requireAdmin,
    requireOwnership,
    validateFields,
    rateLimit
};
