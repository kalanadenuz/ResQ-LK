-- =====================================================
-- ResQ-LK Emergency Response System - Complete Database Dump
-- =====================================================
-- Created: 2025-01-15
-- Description: Complete database dump for ResQ-LK Emergency Response System
-- Includes: Schema, Sample Data, Stored Procedures, Triggers, Views
-- =====================================================

-- Drop database if exists and create new one
DROP DATABASE IF EXISTS resq_lk;
CREATE DATABASE resq_lk CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE resq_lk;

-- =====================================================
-- TABLE CREATION
-- =====================================================

-- Users table
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255),
    profile_picture VARCHAR(500),
    address TEXT,
    emergency_contact VARCHAR(20),
    blood_type ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'),
    medical_conditions TEXT,
    language_preference ENUM('en', 'si', 'ta') DEFAULT 'en',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_phone (phone),
    INDEX idx_email (email),
    INDEX idx_active (is_active)
);

-- Admin users table
CREATE TABLE admin_users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('super_admin', 'admin', 'moderator') DEFAULT 'admin',
    permissions JSON,
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_active (is_active)
);

-- Emergency locations table
CREATE TABLE emergency_locations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    type ENUM('hospital', 'police_station', 'fire_station', 'evacuation_center', 'relief_center', 'safe_zone') NOT NULL,
    address TEXT NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    contact_number VARCHAR(20),
    capacity INT,
    current_occupancy INT DEFAULT 0,
    is_available BOOLEAN DEFAULT TRUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_type (type),
    INDEX idx_location (latitude, longitude),
    INDEX idx_available (is_available)
);

-- Evacuation time slots table
CREATE TABLE evacuation_time_slots (
    id INT PRIMARY KEY AUTO_INCREMENT,
    location_id INT NOT NULL,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    max_capacity INT NOT NULL,
    current_bookings INT DEFAULT 0,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (location_id) REFERENCES emergency_locations(id) ON DELETE CASCADE,
    INDEX idx_location_date (location_id, date),
    INDEX idx_available (is_available)
);

-- Emergency requests table
CREATE TABLE emergency_requests (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    location_id INT,
    time_slot_id INT,
    emergency_type ENUM('medical', 'fire', 'flood', 'earthquake', 'tsunami', 'landslide', 'other') NOT NULL,
    urgency_level ENUM('low', 'medium', 'high', 'critical') NOT NULL,
    description TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    status ENUM('pending', 'approved', 'in_progress', 'completed', 'cancelled') DEFAULT 'pending',
    assigned_volunteer_id INT,
    response_time INT, -- in minutes
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (location_id) REFERENCES emergency_locations(id) ON DELETE SET NULL,
    FOREIGN KEY (time_slot_id) REFERENCES evacuation_time_slots(id) ON DELETE SET NULL,
    INDEX idx_user (user_id),
    INDEX idx_status (status),
    INDEX idx_urgency (urgency_level),
    INDEX idx_created (created_at)
);

-- Relief requests table
CREATE TABLE relief_requests (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    relief_type ENUM('food', 'water', 'shelter', 'medical', 'clothing', 'hygiene', 'other') NOT NULL,
    quantity INT NOT NULL,
    urgency_level ENUM('low', 'medium', 'high', 'critical') NOT NULL,
    description TEXT,
    delivery_address TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    status ENUM('pending', 'approved', 'in_progress', 'delivered', 'cancelled') DEFAULT 'pending',
    assigned_volunteer_id INT,
    delivery_time TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_status (status),
    INDEX idx_type (relief_type),
    INDEX idx_urgency (urgency_level)
);

-- Volunteers table
CREATE TABLE volunteers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    skills JSON NOT NULL, -- ['first_aid', 'search_rescue', 'cooking', 'driving']
    availability JSON NOT NULL, -- ['morning', 'afternoon', 'evening', 'night']
    experience_years INT DEFAULT 0,
    certifications TEXT,
    vehicle_type ENUM('none', 'car', 'motorcycle', 'truck', 'boat') DEFAULT 'none',
    vehicle_details TEXT,
    is_available BOOLEAN DEFAULT TRUE,
    status ENUM('pending', 'approved', 'suspended', 'inactive') DEFAULT 'pending',
    total_assignments INT DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_status (status),
    INDEX idx_available (is_available),
    INDEX idx_skills (skills(100))
);

-- Emergency assignments table
CREATE TABLE emergency_assignments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    emergency_id INT NOT NULL,
    volunteer_id INT NOT NULL,
    assignment_type ENUM('emergency_response', 'relief_delivery', 'evacuation_support') NOT NULL,
    status ENUM('assigned', 'accepted', 'in_progress', 'completed', 'cancelled') DEFAULT 'assigned',
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    accepted_at TIMESTAMP NULL,
    completed_at TIMESTAMP NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (emergency_id) REFERENCES emergency_requests(id) ON DELETE CASCADE,
    FOREIGN KEY (volunteer_id) REFERENCES volunteers(id) ON DELETE CASCADE,
    INDEX idx_emergency (emergency_id),
    INDEX idx_volunteer (volunteer_id),
    INDEX idx_status (status)
);

-- Notifications table
CREATE TABLE notifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    type ENUM('emergency_alert', 'relief_update', 'volunteer_assignment', 'system_announcement') NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    priority ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
    expires_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_type (type),
    INDEX idx_read (is_read),
    INDEX idx_created (created_at)
);

-- System settings table
CREATE TABLE system_settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT NOT NULL,
    description TEXT,
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_key (setting_key)
);

-- Emergency statistics table
CREATE TABLE emergency_statistics (
    id INT PRIMARY KEY AUTO_INCREMENT,
    date DATE NOT NULL,
    total_emergencies INT DEFAULT 0,
    total_relief_requests INT DEFAULT 0,
    active_volunteers INT DEFAULT 0,
    avg_response_time DECIMAL(5,2) DEFAULT 0.00,
    emergency_types JSON,
    relief_types JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_date (date),
    INDEX idx_date (date)
);

-- =====================================================
-- SAMPLE DATA INSERTION
-- =====================================================

-- Insert sample users
INSERT INTO users (name, phone, email, password_hash, address, emergency_contact, blood_type, language_preference) VALUES
('John Silva', '+94770000001', 'john.silva@email.com', '$2b$10$hashed_password_1', '123 Main St, Colombo 01', '+94770000002', 'O+', 'en'),
('Maria Fernando', '+94770000003', 'maria.fernando@email.com', '$2b$10$hashed_password_2', '456 Lake Rd, Kandy', '+94770000004', 'A+', 'si'),
('David Perera', '+94770000005', 'david.perera@email.com', '$2b$10$hashed_password_3', '789 Hill St, Galle', '+94770000006', 'B+', 'en'),
('Priya Rajapaksa', '+94770000007', 'priya.rajapaksa@email.com', '$2b$10$hashed_password_4', '321 Beach Rd, Matara', '+94770000008', 'AB+', 'ta'),
('Kumar Seneviratne', '+94770000009', 'kumar.seneviratne@email.com', '$2b$10$hashed_password_5', '654 Forest Ave, Anuradhapura', '+94770000010', 'O-', 'si'),
('Nimal Bandara', '+94770000011', 'nimal.bandara@email.com', '$2b$10$hashed_password_6', '987 Temple Rd, Polonnaruwa', '+94770000012', 'A-', 'si'),
('Sunil Jayasuriya', '+94770000013', 'sunil.jayasuriya@email.com', '$2b$10$hashed_password_7', '147 Market St, Jaffna', '+94770000014', 'B-', 'ta'),
('Lakshmi Wijesekara', '+94770000015', 'lakshmi.wijesekara@email.com', '$2b$10$hashed_password_8', '258 Garden Rd, Trincomalee', '+94770000016', 'AB-', 'en'),
('Ravi Mendis', '+94770000017', 'ravi.mendis@email.com', '$2b$10$hashed_password_9', '369 Port Rd, Batticaloa', '+94770000018', 'O+', 'ta'),
('Anjali Pathirana', '+94770000019', 'anjali.pathirana@email.com', '$2b$10$hashed_password_10', '741 River St, Ratnapura', '+94770000020', 'A+', 'si');

-- Insert admin users
INSERT INTO admin_users (name, email, phone, password_hash, role) VALUES
('Admin User', 'admin@resq-lk.com', '+94770000000', '$2b$10$hashed_admin_password', 'super_admin'),
('Moderator Silva', 'moderator.silva@resq-lk.com', '+94770000021', '$2b$10$hashed_moderator_password', 'moderator'),
('Manager Fernando', 'manager.fernando@resq-lk.com', '+94770000022', '$2b$10$hashed_manager_password', 'admin');

-- Insert emergency locations
INSERT INTO emergency_locations (name, type, address, latitude, longitude, contact_number, capacity, description) VALUES
('Colombo National Hospital', 'hospital', 'Regent St, Colombo 10', 6.9271, 79.8612, '+94112691111', 1000, 'Main emergency hospital in Colombo'),
('Kandy General Hospital', 'hospital', 'Peradeniya Rd, Kandy', 7.2906, 80.6337, '+94812222222', 500, 'Regional hospital in Kandy'),
('Galle District Hospital', 'hospital', 'Hospital Rd, Galle', 6.0535, 80.2210, '+94912233333', 300, 'District hospital in Galle'),
('Colombo Police Station', 'police_station', 'Maradana Rd, Colombo 10', 6.9271, 79.8612, '+94112691111', 50, 'Main police station in Colombo'),
('Kandy Police Station', 'police_station', 'Peradeniya Rd, Kandy', 7.2906, 80.6337, '+94812222222', 30, 'Regional police station in Kandy'),
('Colombo Fire Station', 'fire_station', 'Marine Dr, Colombo 1', 6.9271, 79.8612, '+94112691111', 100, 'Main fire station in Colombo'),
('Kandy Fire Station', 'fire_station', 'Peradeniya Rd, Kandy', 7.2906, 80.6337, '+94812222222', 50, 'Regional fire station in Kandy'),
('Colombo Evacuation Center', 'evacuation_center', 'Viharamahadevi Park, Colombo 7', 6.9271, 79.8612, '+94112691111', 2000, 'Large evacuation center in Colombo'),
('Kandy Evacuation Center', 'evacuation_center', 'Peradeniya University, Kandy', 7.2906, 80.6337, '+94812222222', 1000, 'University-based evacuation center'),
('Galle Relief Center', 'relief_center', 'Beach Rd, Galle', 6.0535, 80.2210, '+94912233333', 500, 'Relief distribution center in Galle'),
('Colombo Safe Zone', 'safe_zone', 'Independence Square, Colombo 7', 6.9271, 79.8612, '+94112691111', 5000, 'Large safe zone in Colombo'),
('Kandy Safe Zone', 'safe_zone', 'Temple of the Tooth, Kandy', 7.2906, 80.6337, '+94812222222', 2000, 'Temple-based safe zone in Kandy');

-- Insert evacuation time slots
INSERT INTO evacuation_time_slots (location_id, date, start_time, end_time, max_capacity) VALUES
(8, '2025-01-15', '08:00:00', '10:00:00', 500),
(8, '2025-01-15', '10:00:00', '12:00:00', 500),
(8, '2025-01-15', '12:00:00', '14:00:00', 500),
(8, '2025-01-15', '14:00:00', '16:00:00', 500),
(8, '2025-01-15', '16:00:00', '18:00:00', 500),
(8, '2025-01-15', '18:00:00', '20:00:00', 500),
(9, '2025-01-15', '08:00:00', '10:00:00', 250),
(9, '2025-01-15', '10:00:00', '12:00:00', 250),
(9, '2025-01-15', '12:00:00', '14:00:00', 250),
(9, '2025-01-15', '14:00:00', '16:00:00', 250);

-- Insert volunteers
INSERT INTO volunteers (user_id, skills, availability, experience_years, vehicle_type, status) VALUES
(1, '["first_aid", "search_rescue"]', '["morning", "afternoon"]', 3, 'car', 'approved'),
(2, '["cooking", "logistics"]', '["afternoon", "evening"]', 2, 'none', 'approved'),
(3, '["driving", "first_aid"]', '["morning", "night"]', 5, 'truck', 'approved'),
(4, '["medical", "counseling"]', '["morning", "afternoon", "evening"]', 8, 'car', 'approved'),
(5, '["search_rescue", "logistics"]', '["night"]', 4, 'motorcycle', 'approved'),
(6, '["cooking", "cleaning"]', '["morning", "afternoon"]', 1, 'none', 'pending'),
(7, '["driving", "logistics"]', '["afternoon", "evening"]', 6, 'truck', 'approved'),
(8, '["first_aid", "counseling"]', '["morning", "evening"]', 3, 'car', 'approved'),
(9, '["search_rescue", "driving"]', '["night"]', 7, 'boat', 'approved'),
(10, '["medical", "logistics"]', '["morning", "afternoon", "evening", "night"]', 10, 'car', 'approved');

-- Insert emergency requests
INSERT INTO emergency_requests (user_id, location_id, emergency_type, urgency_level, description, latitude, longitude, status, response_time) VALUES
(1, 1, 'medical', 'high', 'Chest pain and difficulty breathing', 6.9271, 79.8612, 'completed', 15),
(2, 2, 'fire', 'critical', 'House fire spreading to neighboring buildings', 7.2906, 80.6337, 'in_progress', 8),
(3, 3, 'flood', 'high', 'Flooded house, need immediate evacuation', 6.0535, 80.2210, 'approved', 25),
(4, 1, 'medical', 'medium', 'Broken arm from fall', 6.9271, 79.8612, 'completed', 30),
(5, 2, 'earthquake', 'critical', 'Building collapse, multiple injuries', 7.2906, 80.6337, 'in_progress', 5),
(6, 3, 'tsunami', 'critical', 'Tsunami warning, need immediate evacuation', 6.0535, 80.2210, 'approved', 10),
(7, 1, 'medical', 'low', 'Minor cut requiring stitches', 6.9271, 79.8612, 'completed', 45),
(8, 2, 'landslide', 'high', 'Landslide blocking main road', 7.2906, 80.6337, 'pending', NULL),
(9, 3, 'fire', 'medium', 'Small kitchen fire, now under control', 6.0535, 80.2210, 'completed', 20),
(10, 1, 'medical', 'critical', 'Heart attack symptoms', 6.9271, 79.8612, 'in_progress', 3);

-- Insert relief requests
INSERT INTO relief_requests (user_id, relief_type, quantity, urgency_level, description, delivery_address, latitude, longitude, status) VALUES
(1, 'food', 5, 'high', 'Family of 5 needs food supplies', '123 Main St, Colombo 01', 6.9271, 79.8612, 'delivered'),
(2, 'water', 10, 'critical', 'No clean water available', '456 Lake Rd, Kandy', 7.2906, 80.6337, 'in_progress'),
(3, 'shelter', 1, 'high', 'House destroyed, need temporary shelter', '789 Hill St, Galle', 6.0535, 80.2210, 'approved'),
(4, 'medical', 3, 'medium', 'Need medical supplies for elderly', '321 Beach Rd, Matara', 6.0535, 80.2210, 'delivered'),
(5, 'clothing', 8, 'low', 'Clothing for family affected by flood', '654 Forest Ave, Anuradhapura', 7.2906, 80.6337, 'pending'),
(6, 'hygiene', 4, 'medium', 'Hygiene supplies for children', '987 Temple Rd, Polonnaruwa', 7.2906, 80.6337, 'approved'),
(7, 'food', 3, 'high', 'Elderly couple needs food', '147 Market St, Jaffna', 6.9271, 79.8612, 'in_progress'),
(8, 'water', 6, 'critical', 'Water contamination in area', '258 Garden Rd, Trincomalee', 6.9271, 79.8612, 'delivered'),
(9, 'shelter', 2, 'high', 'Two families need shelter', '369 Port Rd, Batticaloa', 6.0535, 80.2210, 'pending'),
(10, 'medical', 5, 'medium', 'Medical supplies for community center', '741 River St, Ratnapura', 7.2906, 80.6337, 'approved');

-- Insert emergency assignments
INSERT INTO emergency_assignments (emergency_id, volunteer_id, assignment_type, status, accepted_at, completed_at) VALUES
(1, 1, 'emergency_response', 'completed', '2025-01-15 08:15:00', '2025-01-15 08:30:00'),
(2, 3, 'emergency_response', 'in_progress', '2025-01-15 08:08:00', NULL),
(3, 5, 'evacuation_support', 'accepted', '2025-01-15 08:25:00', NULL),
(4, 4, 'emergency_response', 'completed', '2025-01-15 08:30:00', '2025-01-15 09:00:00'),
(5, 7, 'emergency_response', 'in_progress', '2025-01-15 08:05:00', NULL),
(6, 9, 'evacuation_support', 'accepted', '2025-01-15 08:10:00', NULL),
(7, 8, 'emergency_response', 'completed', '2025-01-15 08:45:00', '2025-01-15 09:30:00'),
(8, 2, 'emergency_response', 'assigned', NULL, NULL),
(9, 6, 'emergency_response', 'completed', '2025-01-15 08:20:00', '2025-01-15 08:40:00'),
(10, 10, 'emergency_response', 'in_progress', '2025-01-15 08:03:00', NULL);

-- Insert notifications
INSERT INTO notifications (user_id, type, title, message, priority) VALUES
(1, 'emergency_alert', 'Emergency Response Complete', 'Your emergency request has been successfully resolved.', 'medium'),
(2, 'emergency_alert', 'Emergency Response in Progress', 'Emergency responders are on their way to your location.', 'high'),
(3, 'relief_update', 'Relief Request Approved', 'Your relief request has been approved and will be delivered soon.', 'medium'),
(4, 'volunteer_assignment', 'New Assignment Available', 'You have been assigned to an emergency response mission.', 'high'),
(5, 'system_announcement', 'System Maintenance', 'System will be under maintenance from 2-4 AM tonight.', 'low'),
(6, 'emergency_alert', 'Evacuation Order', 'Please evacuate to the nearest safe zone immediately.', 'critical'),
(7, 'relief_update', 'Relief Delivery Complete', 'Your relief supplies have been delivered successfully.', 'medium'),
(8, 'volunteer_assignment', 'Assignment Completed', 'Your emergency response assignment has been completed.', 'medium'),
(9, 'emergency_alert', 'Emergency Response Required', 'New emergency request in your area requires immediate attention.', 'high'),
(10, 'system_announcement', 'New Features Available', 'New features have been added to the ResQ-LK mobile app.', 'low');

-- Insert system settings
INSERT INTO system_settings (setting_key, setting_value, description, is_public) VALUES
('system_name', 'ResQ-LK Emergency Response System', 'Name of the emergency response system', TRUE),
('system_version', '1.0.0', 'Current version of the system', TRUE),
('emergency_response_timeout', '300', 'Emergency response timeout in seconds', FALSE),
('max_volunteers_per_emergency', '5', 'Maximum number of volunteers per emergency', FALSE),
('notification_retention_days', '30', 'Number of days to retain notifications', FALSE),
('auto_assign_volunteers', 'true', 'Automatically assign volunteers to emergencies', FALSE),
('emergency_priority_levels', '["low", "medium", "high", "critical"]', 'Available emergency priority levels', TRUE),
('relief_types', '["food", "water", "shelter", "medical", "clothing", "hygiene", "other"]', 'Available relief types', TRUE),
('volunteer_skills', '["first_aid", "search_rescue", "cooking", "driving", "medical", "counseling", "logistics", "cleaning"]', 'Available volunteer skills', TRUE),
('supported_languages', '["en", "si", "ta"]', 'Supported languages for the system', TRUE);

-- Insert emergency statistics
INSERT INTO emergency_statistics (date, total_emergencies, total_relief_requests, active_volunteers, avg_response_time, emergency_types, relief_types) VALUES
('2025-01-14', 25, 18, 45, 18.5, '{"medical": 8, "fire": 3, "flood": 5, "earthquake": 2, "tsunami": 1, "landslide": 2, "other": 4}', '{"food": 6, "water": 4, "shelter": 3, "medical": 2, "clothing": 2, "hygiene": 1}'),
('2025-01-13', 32, 22, 48, 22.3, '{"medical": 12, "fire": 4, "flood": 6, "earthquake": 1, "tsunami": 0, "landslide": 3, "other": 6}', '{"food": 8, "water": 5, "shelter": 4, "medical": 2, "clothing": 2, "hygiene": 1}'),
('2025-01-12', 28, 20, 42, 19.8, '{"medical": 10, "fire": 2, "flood": 7, "earthquake": 2, "tsunami": 1, "landslide": 1, "other": 5}', '{"food": 7, "water": 4, "shelter": 3, "medical": 3, "clothing": 2, "hygiene": 1}'),
('2025-01-11', 35, 25, 50, 24.1, '{"medical": 14, "fire": 5, "flood": 8, "earthquake": 1, "tsunami": 0, "landslide": 2, "other": 5}', '{"food": 9, "water": 6, "shelter": 4, "medical": 2, "clothing": 3, "hygiene": 1}'),
('2025-01-10', 30, 21, 46, 20.7, '{"medical": 11, "fire": 3, "flood": 6, "earthquake": 2, "tsunami": 1, "landslide": 2, "other": 5}', '{"food": 7, "water": 5, "shelter": 3, "medical": 2, "clothing": 2, "hygiene": 2}');

-- =====================================================
-- STORED PROCEDURES
-- =====================================================

DELIMITER //

-- Procedure to get emergency statistics
CREATE PROCEDURE GetEmergencyStatistics(IN start_date DATE, IN end_date DATE)
BEGIN
    SELECT 
        DATE(created_at) as date,
        COUNT(*) as total_emergencies,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_emergencies,
        COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as active_emergencies,
        AVG(response_time) as avg_response_time,
        COUNT(CASE WHEN urgency_level = 'critical' THEN 1 END) as critical_emergencies
    FROM emergency_requests 
    WHERE DATE(created_at) BETWEEN start_date AND end_date
    GROUP BY DATE(created_at)
    ORDER BY date;
END //

-- Procedure to assign volunteer to emergency
CREATE PROCEDURE AssignVolunteerToEmergency(IN emergency_id INT, IN volunteer_id INT)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;
    
    START TRANSACTION;
    
    -- Check if volunteer is available
    IF EXISTS (SELECT 1 FROM volunteers WHERE id = volunteer_id AND is_available = TRUE AND status = 'approved') THEN
        -- Create assignment
        INSERT INTO emergency_assignments (emergency_id, volunteer_id, assignment_type, status)
        VALUES (emergency_id, volunteer_id, 'emergency_response', 'assigned');
        
        -- Update volunteer availability
        UPDATE volunteers SET is_available = FALSE WHERE id = volunteer_id;
        
        -- Update emergency status
        UPDATE emergency_requests SET status = 'in_progress' WHERE id = emergency_id;
        
        COMMIT;
        SELECT 'Volunteer assigned successfully' as message;
    ELSE
        ROLLBACK;
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Volunteer not available or not approved';
    END IF;
END //

-- Procedure to get available volunteers by location
CREATE PROCEDURE GetAvailableVolunteersByLocation(IN latitude DECIMAL(10,8), IN longitude DECIMAL(11,8), IN radius_km DECIMAL(5,2))
BEGIN
    SELECT 
        v.id,
        u.name,
        u.phone,
        v.skills,
        v.availability,
        v.experience_years,
        v.vehicle_type,
        v.rating,
        (6371 * acos(cos(radians(latitude)) * cos(radians(u.latitude)) * cos(radians(u.longitude) - radians(longitude)) + sin(radians(latitude)) * sin(radians(u.latitude)))) AS distance_km
    FROM volunteers v
    JOIN users u ON v.user_id = u.id
    WHERE v.is_available = TRUE 
    AND v.status = 'approved'
    AND (6371 * acos(cos(radians(latitude)) * cos(radians(u.latitude)) * cos(radians(u.longitude) - radians(longitude)) + sin(radians(latitude)) * sin(radians(u.latitude)))) <= radius_km
    ORDER BY distance_km;
END //

-- Procedure to update emergency location occupancy
CREATE PROCEDURE UpdateLocationOccupancy(IN location_id INT)
BEGIN
    UPDATE emergency_locations 
    SET current_occupancy = (
        SELECT COUNT(*) 
        FROM evacuation_time_slots 
        WHERE location_id = location_id 
        AND current_bookings > 0
    )
    WHERE id = location_id;
END //

DELIMITER ;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Trigger to update emergency location occupancy when time slot bookings change
DELIMITER //
CREATE TRIGGER update_emergency_location_occupancy
AFTER UPDATE ON evacuation_time_slots
FOR EACH ROW
BEGIN
    CALL UpdateLocationOccupancy(NEW.location_id);
END //
DELIMITER ;

-- Trigger to create notification when emergency request is created
DELIMITER //
CREATE TRIGGER create_emergency_notification
AFTER INSERT ON emergency_requests
FOR EACH ROW
BEGIN
    INSERT INTO notifications (user_id, type, title, message, priority)
    VALUES (
        NEW.user_id,
        'emergency_alert',
        'Emergency Request Received',
        CONCAT('Your emergency request (ID: ', NEW.id, ') has been received and is being processed.'),
        CASE 
            WHEN NEW.urgency_level = 'critical' THEN 'critical'
            WHEN NEW.urgency_level = 'high' THEN 'high'
            ELSE 'medium'
        END
    );
END //
DELIMITER ;

-- Trigger to update volunteer statistics when assignment is completed
DELIMITER //
CREATE TRIGGER update_volunteer_stats
AFTER UPDATE ON emergency_assignments
FOR EACH ROW
BEGIN
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
        UPDATE volunteers 
        SET total_assignments = total_assignments + 1,
            is_available = TRUE
        WHERE id = NEW.volunteer_id;
    END IF;
END //
DELIMITER ;

-- =====================================================
-- VIEWS
-- =====================================================

-- View for active emergencies
CREATE VIEW active_emergencies AS
SELECT 
    er.id,
    er.emergency_type,
    er.urgency_level,
    er.description,
    er.status,
    er.created_at,
    u.name as requester_name,
    u.phone as requester_phone,
    el.name as location_name,
    COUNT(ea.id) as assigned_volunteers
FROM emergency_requests er
JOIN users u ON er.user_id = u.id
LEFT JOIN emergency_locations el ON er.location_id = el.id
LEFT JOIN emergency_assignments ea ON er.id = ea.emergency_id AND ea.status IN ('assigned', 'accepted', 'in_progress')
WHERE er.status IN ('pending', 'approved', 'in_progress')
GROUP BY er.id;

-- View for volunteer performance
CREATE VIEW volunteer_performance AS
SELECT 
    v.id,
    u.name,
    u.phone,
    v.experience_years,
    v.total_assignments,
    v.rating,
    COUNT(ea.id) as completed_assignments,
    AVG(TIMESTAMPDIFF(MINUTE, ea.assigned_at, ea.completed_at)) as avg_completion_time
FROM volunteers v
JOIN users u ON v.user_id = u.id
LEFT JOIN emergency_assignments ea ON v.id = ea.volunteer_id AND ea.status = 'completed'
WHERE v.status = 'approved'
GROUP BY v.id;

-- View for relief request summary
CREATE VIEW relief_request_summary AS
SELECT 
    rr.id,
    rr.relief_type,
    rr.urgency_level,
    rr.status,
    rr.created_at,
    u.name as requester_name,
    u.phone as requester_phone,
    COUNT(ea.id) as assigned_volunteers
FROM relief_requests rr
JOIN users u ON rr.user_id = u.id
LEFT JOIN emergency_assignments ea ON rr.id = ea.emergency_id AND ea.assignment_type = 'relief_delivery'
GROUP BY rr.id;

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Additional indexes for better performance
CREATE INDEX idx_emergency_created_status ON emergency_requests(created_at, status);
CREATE INDEX idx_relief_created_status ON relief_requests(created_at, status);
CREATE INDEX idx_volunteer_available_status ON volunteers(is_available, status);
CREATE INDEX idx_notification_user_read ON notifications(user_id, is_read);
CREATE INDEX idx_assignment_emergency_status ON emergency_assignments(emergency_id, status);

-- =====================================================
-- SAMPLE QUERIES FOR TESTING
-- =====================================================

-- Get all active emergencies with volunteer count
-- SELECT * FROM active_emergencies;

-- Get volunteer performance statistics
-- SELECT * FROM volunteer_performance ORDER BY completed_assignments DESC;

-- Get relief request summary
-- SELECT * FROM relief_request_summary WHERE status = 'pending';

-- Get emergency statistics for last 7 days
-- CALL GetEmergencyStatistics(DATE_SUB(CURDATE(), INTERVAL 7 DAY), CURDATE());

-- Get available volunteers within 10km of a location
-- CALL GetAvailableVolunteersByLocation(6.9271, 79.8612, 10.0);

-- =====================================================
-- DATABASE DUMP COMPLETE
-- =====================================================
-- 
-- This dump contains:
-- - Complete database schema with 11 tables
-- - Sample data for all tables
-- - Stored procedures for common operations
-- - Triggers for automated updates
-- - Views for simplified queries
-- - Performance indexes
-- - Sample queries for testing
--
-- Total records: 100+ sample records
-- File size: ~50KB
-- Created for ResQ-LK Emergency Response System
-- =====================================================
