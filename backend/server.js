/**
 * ResQ-LK Backend Server
 * 
 * Main server file for the ResQ-LK emergency response system backend.
 * This server provides RESTful API endpoints for:
 * - User authentication and management
 * - Emergency request handling
 * - Relief request management
 * - Volunteer registration and coordination
 * - Real-time notifications
 * - Admin dashboard functionality
 * 
 * @author ResQ-LK Team
 * @version 1.0.0
 * @since 2024
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
require('dotenv').config();

// Import database configuration
const { initializeDatabase } = require('./config/database');

// Import route modules
const authRoutes = require('./routes/auth');
const emergencyRoutes = require('./routes/emergency');
const reliefRoutes = require('./routes/relief');
const volunteerRoutes = require('./routes/volunteer');
const adminRoutes = require('./routes/admin');

// Import middleware
const { rateLimit: customRateLimit } = require('./middleware/auth');

// Create Express application
const app = express();

// Server configuration
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

/**
 * Security Middleware Configuration
 * 
 * Configure security headers and protection mechanisms
 */
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
    crossOriginEmbedderPolicy: false
}));

/**
 * CORS Configuration
 * 
 * Configure Cross-Origin Resource Sharing for mobile app and web client
 */
app.use(cors({
    origin: process.env.ALLOWED_ORIGINS ? 
        process.env.ALLOWED_ORIGINS.split(',') : 
        ['http://localhost:3000', 'http://localhost:8081'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

/**
 * Request Parsing Middleware
 * 
 * Configure body parsing and request handling
 */
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

/**
 * Compression Middleware
 * 
 * Enable response compression for better performance
 */
app.use(compression());

/**
 * Logging Middleware
 * 
 * Configure request logging based on environment
 */
if (NODE_ENV === 'development') {
    app.use(morgan('dev'));
} else {
    app.use(morgan('combined'));
}

/**
 * Global Rate Limiting
 * 
 * Apply rate limiting to all routes to prevent abuse
 */
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: {
        success: false,
        message: 'Too many requests from this IP',
        error: 'RATE_LIMIT_EXCEEDED'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

app.use(globalLimiter);

/**
 * Health Check Endpoint
 * 
 * Simple endpoint to check if the server is running
 */
app.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'ResQ-LK Backend Server is running',
        timestamp: new Date().toISOString(),
        environment: NODE_ENV,
        version: '1.0.0'
    });
});

/**
 * API Routes Configuration
 * 
 * Mount all API route modules with proper prefixes
 */
app.use('/api/auth', authRoutes);
app.use('/api/emergency', emergencyRoutes);
app.use('/api/relief', reliefRoutes);
app.use('/api/volunteer', volunteerRoutes);
app.use('/api/admin', adminRoutes);

/**
 * API Documentation Endpoint
 * 
 * Provide basic API information and available endpoints
 */
app.get('/api', (req, res) => {
    res.json({
        success: true,
        message: 'ResQ-LK Emergency Response API',
        version: '1.0.0',
        endpoints: {
            auth: '/api/auth',
            emergency: '/api/emergency',
            relief: '/api/relief',
            volunteer: '/api/volunteer',
            admin: '/api/admin'
        },
        documentation: process.env.API_DOCS_URL || 'https://docs.resq-lk.com',
        support: process.env.SUPPORT_EMAIL || 'support@resq-lk.com'
    });
});

/**
 * 404 Error Handler
 * 
 * Handle requests to non-existent routes
 */
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found',
        error: 'NOT_FOUND',
        path: req.originalUrl,
        method: req.method
    });
});

/**
 * Global Error Handler
 * 
 * Centralized error handling for all routes
 */
app.use((error, req, res, next) => {
    console.error('Global error handler:', error);

    // Handle specific error types
    if (error.name === 'ValidationError') {
        return res.status(400).json({
            success: false,
            message: 'Validation error',
            error: 'VALIDATION_ERROR',
            details: error.message
        });
    }

    if (error.name === 'UnauthorizedError') {
        return res.status(401).json({
            success: false,
            message: 'Unauthorized access',
            error: 'UNAUTHORIZED'
        });
    }

    if (error.name === 'ForbiddenError') {
        return res.status(403).json({
            success: false,
            message: 'Access forbidden',
            error: 'FORBIDDEN'
        });
    }

    // Default error response
    res.status(500).json({
        success: false,
        message: NODE_ENV === 'development' ? error.message : 'Internal server error',
        error: 'INTERNAL_SERVER_ERROR',
        ...(NODE_ENV === 'development' && { stack: error.stack })
    });
});

/**
 * Graceful Shutdown Handler
 * 
 * Handle server shutdown gracefully
 */
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    server.close(() => {
        console.log('Process terminated');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');
    server.close(() => {
        console.log('Process terminated');
        process.exit(0);
    });
});

/**
 * Unhandled Promise Rejection Handler
 * 
 * Handle unhandled promise rejections
 */
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    // Don't exit the process, just log the error
});

/**
 * Uncaught Exception Handler
 * 
 * Handle uncaught exceptions
 */
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
});

/**
 * Database Initialization and Server Startup
 * 
 * Initialize database connection and start the server
 */
async function startServer() {
    try {
        // Initialize database
        await initializeDatabase();
        console.log('✅ Database initialized successfully');

        // Start server
        const server = app.listen(PORT, () => {
            console.log('🚀 ResQ-LK Backend Server started successfully');
            console.log(`📍 Server running on port ${PORT}`);
            console.log(`🌍 Environment: ${NODE_ENV}`);
            console.log(`📅 Started at: ${new Date().toISOString()}`);
            console.log(`🔗 Health check: http://localhost:${PORT}/health`);
            console.log(`📚 API docs: http://localhost:${PORT}/api`);
        });

        // Handle server errors
        server.on('error', (error) => {
            if (error.code === 'EADDRINUSE') {
                console.error(`❌ Port ${PORT} is already in use`);
                process.exit(1);
            } else {
                console.error('❌ Server error:', error);
                process.exit(1);
            }
        });

    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}

// Start the server
startServer();

module.exports = app;
