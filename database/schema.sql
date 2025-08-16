-- ResQ-LK Emergency Response System Database Schema
-- Created for MySQL 8.0+
-- Author: ResQ-LK Team
-- Version: 1.0.0

-- Create database
CREATE DATABASE IF NOT EXISTS resq_lk CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE resq_lk;

-- Users table
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255),
    role ENUM('user', 'admin', 'volunteer') DEFAULT 'user',
    status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
    profile_picture VARCHAR(500),
    emergency_contact VARCHAR(20),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_phone (phone),
    INDEX idx_email (email),
    INDEX idx_status (status)
);

-- Emergency locations table
CREATE TABLE emergency_locations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    type ENUM('emergency', 'relief', 'safe', 'rescue', 'evacuation') NOT NULL,
    address TEXT NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    capacity INT,
    current_occupancy INT DEFAULT 0,
    status ENUM('active', 'inactive', 'full') DEFAULT 'active',
    contact_person VARCHAR(255),
    contact_phone VARCHAR(20),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_type (type),
    INDEX idx_status (status),
    INDEX idx_location (latitude, longitude)
);

-- Emergency requests table
CREATE TABLE emergency_requests (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    location_id INT,
    description TEXT NOT NULL,
    urgency_level ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
    status ENUM('pending', 'approved', 'in_progress', 'completed', 'cancelled') DEFAULT 'pending',
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    people_count INT DEFAULT 1,
    special_needs TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (location_id) REFERENCES emergency_locations(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_urgency (urgency_level),
    INDEX idx_created_at (created_at)
);

-- Relief requests table
CREATE TABLE relief_requests (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    location_id INT,
    request_type ENUM('food', 'water', 'shelter', 'medical', 'clothing', 'hygiene', 'transport', 'other') NOT NULL,
    quantity INT DEFAULT 1,
    urgency_level ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
    description TEXT,
    preferred_time DATETIME,
    status ENUM('pending', 'approved', 'in_progress', 'completed', 'cancelled') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (location_id) REFERENCES emergency_locations(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_type (request_type),
    INDEX idx_urgency (urgency_level)
);

-- Volunteers table
CREATE TABLE volunteers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    national_id VARCHAR(20) UNIQUE NOT NULL,
    mobile VARCHAR(20) NOT NULL,
    shift ENUM('morning', 'afternoon', 'evening', 'night', 'flexible') NOT NULL,
    tasks TEXT NOT NULL, -- Comma-separated list of tasks
    emergency_contact VARCHAR(20),
    skills TEXT,
    availability TEXT,
    status ENUM('pending', 'approved', 'active', 'inactive', 'suspended') DEFAULT 'pending',
    admin_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_national_id (national_id),
    INDEX idx_mobile (mobile),
    INDEX idx_status (status),
    INDEX idx_shift (shift)
);

-- Evacuation time slots table
CREATE TABLE evacuation_time_slots (
    id INT PRIMARY KEY AUTO_INCREMENT,
    location_id INT NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    max_capacity INT NOT NULL,
    current_bookings INT DEFAULT 0,
    status ENUM('available', 'full', 'cancelled') DEFAULT 'available',
    date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (location_id) REFERENCES emergency_locations(id) ON DELETE CASCADE,
    INDEX idx_location_date (location_id, date),
    INDEX idx_status (status),
    INDEX idx_time (start_time, end_time)
);

-- Emergency assignments table
CREATE TABLE emergency_assignments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    emergency_id INT NOT NULL,
    volunteer_id INT,
    assigned_by INT,
    assignment_type ENUM('emergency', 'relief', 'evacuation') NOT NULL,
    status ENUM('assigned', 'in_progress', 'completed', 'cancelled') DEFAULT 'assigned',
    notes TEXT,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    FOREIGN KEY (emergency_id) REFERENCES emergency_requests(id) ON DELETE CASCADE,
    FOREIGN KEY (volunteer_id) REFERENCES volunteers(id) ON DELETE SET NULL,
    FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_emergency_id (emergency_id),
    INDEX idx_volunteer_id (volunteer_id),
    INDEX idx_status (status)
);

-- Notifications table
CREATE TABLE notifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('emergency', 'relief', 'volunteer', 'system', 'update') NOT NULL,
    status ENUM('unread', 'read') DEFAULT 'unread',
    related_id INT, -- ID of related record (emergency, relief, etc.)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_type (type),
    INDEX idx_created_at (created_at)
);

-- Admin users table
CREATE TABLE admin_users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    admin_level ENUM('super_admin', 'admin', 'moderator') DEFAULT 'admin',
    permissions JSON,
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_admin_level (admin_level)
);

-- System settings table
CREATE TABLE system_settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    description TEXT,
    updated_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_setting_key (setting_key)
);

-- Emergency statistics table
CREATE TABLE emergency_statistics (
    id INT PRIMARY KEY AUTO_INCREMENT,
    date DATE NOT NULL,
    total_emergencies INT DEFAULT 0,
    total_relief_requests INT DEFAULT 0,
    total_volunteers INT DEFAULT 0,
    active_locations INT DEFAULT 0,
    completed_emergencies INT DEFAULT 0,
    completed_relief INT DEFAULT 0,
    response_time_avg DECIMAL(10, 2), -- Average response time in minutes
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_date (date),
    INDEX idx_date (date)
);

-- Insert default admin user
INSERT INTO users (name, phone, email, password_hash, role, status) VALUES
('System Administrator', '+94770000000', 'admin@resq-lk.com', '$2b$10$rQZ8K9mN2pL4vX7yJ1hG3qW5eR8tY0uI6oP9aB2cD4fE7gH1iJ3kL5mN8oP', 'admin', 'active');

-- Insert default system settings
INSERT INTO system_settings (setting_key, setting_value, description) VALUES
('system_name', 'ResQ-LK Emergency Response System', 'System display name'),
('emergency_contact', '+94770000000', 'Primary emergency contact number'),
('auto_approve_emergencies', 'false', 'Automatically approve emergency requests'),
('max_volunteers_per_emergency', '5', 'Maximum volunteers that can be assigned to one emergency'),
('response_time_threshold', '30', 'Response time threshold in minutes'),
('notification_enabled', 'true', 'Enable system notifications'),
('maintenance_mode', 'false', 'System maintenance mode');

-- Insert sample emergency locations
INSERT INTO emergency_locations (name, type, address, latitude, longitude, capacity, contact_person, contact_phone, description) VALUES
('Colombo Emergency Center', 'emergency', '123 Main Street, Colombo 01', 6.9271, 79.8612, 100, 'Dr. John Doe', '+94770000001', 'Main emergency response center in Colombo'),
('Kandy Relief Center', 'relief', '456 Lake Road, Kandy', 7.2906, 80.6337, 50, 'Jane Smith', '+94770000002', 'Relief distribution center in Kandy'),
('Galle Safe Zone', 'safe', '789 Beach Road, Galle', 6.0535, 80.2210, 200, 'Mike Johnson', '+94770000003', 'Safe evacuation zone in Galle'),
('Jaffna Rescue Base', 'rescue', '321 Temple Road, Jaffna', 9.6615, 80.0255, 75, 'Sarah Wilson', '+94770000004', 'Rescue team base in Jaffna');

-- Insert sample evacuation time slots
INSERT INTO evacuation_time_slots (location_id, start_time, end_time, max_capacity, date) VALUES
(1, '08:00:00', '10:00:00', 50, CURDATE()),
(1, '10:00:00', '12:00:00', 50, CURDATE()),
(1, '14:00:00', '16:00:00', 50, CURDATE()),
(2, '09:00:00', '11:00:00', 25, CURDATE()),
(2, '15:00:00', '17:00:00', 25, CURDATE());

-- Create views for easier querying
CREATE VIEW active_emergencies AS
SELECT er.*, u.name as user_name, u.phone as user_phone, el.name as location_name, el.address
FROM emergency_requests er
JOIN users u ON er.user_id = u.id
LEFT JOIN emergency_locations el ON er.location_id = el.id
WHERE er.status IN ('pending', 'approved', 'in_progress');

CREATE VIEW pending_relief_requests AS
SELECT rr.*, u.name as user_name, u.phone as user_phone, el.name as location_name
FROM relief_requests rr
JOIN users u ON rr.user_id = u.id
LEFT JOIN emergency_locations el ON rr.location_id = el.id
WHERE rr.status = 'pending';

CREATE VIEW available_volunteers AS
SELECT v.*, COUNT(ea.id) as current_assignments
FROM volunteers v
LEFT JOIN emergency_assignments ea ON v.id = ea.volunteer_id AND ea.status IN ('assigned', 'in_progress')
WHERE v.status = 'active'
GROUP BY v.id
HAVING current_assignments < 3;

-- Create stored procedures
DELIMITER //

CREATE PROCEDURE GetEmergencyStatistics(IN start_date DATE, IN end_date DATE)
BEGIN
    SELECT 
        DATE(created_at) as date,
        COUNT(*) as total_emergencies,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_emergencies,
        AVG(TIMESTAMPDIFF(MINUTE, created_at, updated_at)) as avg_response_time
    FROM emergency_requests 
    WHERE DATE(created_at) BETWEEN start_date AND end_date
    GROUP BY DATE(created_at)
    ORDER BY date;
END //

CREATE PROCEDURE AssignVolunteerToEmergency(IN emergency_id INT, IN volunteer_id INT, IN assigned_by INT)
BEGIN
    DECLARE current_assignments INT DEFAULT 0;
    
    -- Check current assignments for volunteer
    SELECT COUNT(*) INTO current_assignments 
    FROM emergency_assignments 
    WHERE volunteer_id = volunteer_id AND status IN ('assigned', 'in_progress');
    
    -- Only assign if volunteer has less than 3 active assignments
    IF current_assignments < 3 THEN
        INSERT INTO emergency_assignments (emergency_id, volunteer_id, assigned_by, assignment_type, status)
        VALUES (emergency_id, volunteer_id, assigned_by, 'emergency', 'assigned');
        
        -- Update emergency status to in_progress
        UPDATE emergency_requests SET status = 'in_progress' WHERE id = emergency_id;
        
        SELECT 'SUCCESS' as result;
    ELSE
        SELECT 'VOLUNTEER_BUSY' as result;
    END IF;
END //

DELIMITER ;

-- Create triggers for automatic updates
DELIMITER //

CREATE TRIGGER update_emergency_location_occupancy
AFTER INSERT ON emergency_requests
FOR EACH ROW
BEGIN
    IF NEW.location_id IS NOT NULL THEN
        UPDATE emergency_locations 
        SET current_occupancy = current_occupancy + 1
        WHERE id = NEW.location_id;
    END IF;
END //

CREATE TRIGGER update_evacuation_slot_bookings
AFTER INSERT ON evacuation_time_slots
FOR EACH ROW
BEGIN
    UPDATE evacuation_time_slots 
    SET status = CASE 
        WHEN current_bookings >= max_capacity THEN 'full'
        ELSE 'available'
    END
    WHERE id = NEW.id;
END //

DELIMITER ;

-- Grant permissions (adjust as needed for your setup)
-- GRANT ALL PRIVILEGES ON resq_lk.* TO 'resq_user'@'localhost';
-- FLUSH PRIVILEGES;
