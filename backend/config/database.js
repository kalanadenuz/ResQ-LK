const mysql = require('mysql2');
require('dotenv').config();

const connection = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'resq_lk',
  port: process.env.DB_PORT || 3306,
  charset: 'utf8mb4'
});

// Database initialization function
const initializeDatabase = () => {
  const createTables = `
    -- Users table
    CREATE TABLE IF NOT EXISTS users (
      id INT PRIMARY KEY AUTO_INCREMENT,
      phone_number VARCHAR(15) UNIQUE NOT NULL,
      name VARCHAR(100),
      age INT,
      location VARCHAR(200),
      profile_picture VARCHAR(500),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );

    -- Emergency requests table
    CREATE TABLE IF NOT EXISTS emergency_requests (
      id INT PRIMARY KEY AUTO_INCREMENT,
      user_id INT NOT NULL,
      location VARCHAR(200) NOT NULL,
      evacuation_time VARCHAR(50),
      urgency_level ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
      status ENUM('pending', 'confirmed', 'in_progress', 'completed', 'cancelled') DEFAULT 'pending',
      description TEXT,
      people_count INT DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Relief requests table
    CREATE TABLE IF NOT EXISTS relief_requests (
      id INT PRIMARY KEY AUTO_INCREMENT,
      user_id INT NOT NULL,
      location VARCHAR(200) NOT NULL,
      relief_type ENUM('food', 'water', 'medicine', 'shelter', 'clothing', 'other') NOT NULL,
      urgency_level ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
      status ENUM('pending', 'confirmed', 'in_progress', 'completed', 'cancelled') DEFAULT 'pending',
      description TEXT,
      people_count INT DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Volunteers table
    CREATE TABLE IF NOT EXISTS volunteers (
      id INT PRIMARY KEY AUTO_INCREMENT,
      user_id INT NOT NULL,
      shift_preference ENUM('morning', 'afternoon', 'evening', 'night') NOT NULL,
      skills TEXT,
      availability BOOLEAN DEFAULT TRUE,
      status ENUM('pending', 'approved', 'rejected', 'inactive') DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Volunteer tasks table
    CREATE TABLE IF NOT EXISTS volunteer_tasks (
      id INT PRIMARY KEY AUTO_INCREMENT,
      volunteer_id INT NOT NULL,
      task_type ENUM('medical_aids', 'supply_distribution', 'field_rescue_support') NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (volunteer_id) REFERENCES volunteers(id) ON DELETE CASCADE
    );

    -- Emergency locations table
    CREATE TABLE IF NOT EXISTS emergency_locations (
      id INT PRIMARY KEY AUTO_INCREMENT,
      name VARCHAR(200) NOT NULL,
      latitude DECIMAL(10, 8),
      longitude DECIMAL(11, 8),
      location_type ENUM('relief_center', 'safe_zone', 'rescue_team', 'hospital', 'shelter') NOT NULL,
      capacity INT,
      current_occupancy INT DEFAULT 0,
      status ENUM('active', 'inactive', 'full') DEFAULT 'active',
      contact_number VARCHAR(15),
      address TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );

    -- Evacuation time slots table
    CREATE TABLE IF NOT EXISTS evacuation_time_slots (
      id INT PRIMARY KEY AUTO_INCREMENT,
      time_slot VARCHAR(50) NOT NULL,
      available_slots INT DEFAULT 10,
      booked_slots INT DEFAULT 0,
      date DATE NOT NULL,
      status ENUM('available', 'full', 'closed') DEFAULT 'available',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );

    -- Emergency assignments table
    CREATE TABLE IF NOT EXISTS emergency_assignments (
      id INT PRIMARY KEY AUTO_INCREMENT,
      emergency_id INT NOT NULL,
      volunteer_id INT,
      assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      status ENUM('assigned', 'in_progress', 'completed') DEFAULT 'assigned',
      notes TEXT,
      FOREIGN KEY (emergency_id) REFERENCES emergency_requests(id) ON DELETE CASCADE,
      FOREIGN KEY (volunteer_id) REFERENCES volunteers(id) ON DELETE SET NULL
    );

    -- Notifications table
    CREATE TABLE IF NOT EXISTS notifications (
      id INT PRIMARY KEY AUTO_INCREMENT,
      user_id INT NOT NULL,
      title VARCHAR(200) NOT NULL,
      message TEXT NOT NULL,
      type ENUM('emergency', 'relief', 'volunteer', 'system') NOT NULL,
      read_status BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Admin users table
    CREATE TABLE IF NOT EXISTS admin_users (
      id INT PRIMARY KEY AUTO_INCREMENT,
      username VARCHAR(50) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      role ENUM('admin', 'super_admin', 'coordinator') NOT NULL,
      permissions JSON,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );

    -- System settings table
    CREATE TABLE IF NOT EXISTS system_settings (
      id INT PRIMARY KEY AUTO_INCREMENT,
      setting_key VARCHAR(100) UNIQUE NOT NULL,
      setting_value TEXT,
      description TEXT,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );

    -- Emergency statistics table
    CREATE TABLE IF NOT EXISTS emergency_statistics (
      id INT PRIMARY KEY AUTO_INCREMENT,
      date DATE NOT NULL,
      total_emergencies INT DEFAULT 0,
      total_relief_requests INT DEFAULT 0,
      active_volunteers INT DEFAULT 0,
      completed_emergencies INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  return new Promise((resolve, reject) => {
    connection.query(createTables, (err, results) => {
      if (err) {
        console.error('Error creating tables:', err);
        reject(err);
      } else {
        console.log('Database tables initialized successfully');
        resolve(results);
      }
    });
  });
};

// Insert default data
const insertDefaultData = () => {
  const defaultData = `
    -- Insert default emergency locations
    INSERT IGNORE INTO emergency_locations (name, latitude, longitude, location_type, capacity, contact_number, address) VALUES
    ('Colombo Relief Center', 6.9271, 79.8612, 'relief_center', 500, '+94112345678', 'Colombo Central'),
    ('Galle Safe Zone', 6.0535, 80.2210, 'safe_zone', 300, '+94112345679', 'Galle Fort'),
    ('Kandy Rescue Team', 7.2906, 80.6337, 'rescue_team', 50, '+94112345680', 'Kandy City'),
    ('Jaffna Hospital', 9.6615, 80.0255, 'hospital', 200, '+94112345681', 'Jaffna Central'),
    ('Nuwara Eliya Shelter', 6.9497, 80.7891, 'shelter', 150, '+94112345682', 'Nuwara Eliya Hills');

    -- Insert default evacuation time slots for today
    INSERT IGNORE INTO evacuation_time_slots (time_slot, date) VALUES
    ('00:00-02:00 AM', CURDATE()),
    ('02:00-04:00 AM', CURDATE()),
    ('04:00-06:00 AM', CURDATE()),
    ('06:00-08:00 AM', CURDATE()),
    ('08:00-10:00 AM', CURDATE()),
    ('10:00-12:00 AM', CURDATE()),
    ('12:00-14:00 PM', CURDATE()),
    ('14:00-16:00 PM', CURDATE()),
    ('16:00-18:00 PM', CURDATE()),
    ('18:00-20:00 PM', CURDATE()),
    ('20:00-22:00 PM', CURDATE()),
    ('22:00-00:00 PM', CURDATE());

    -- Insert default system settings
    INSERT IGNORE INTO system_settings (setting_key, setting_value, description) VALUES
    ('emergency_contact', '119', 'Emergency contact number'),
    ('sms_enabled', 'true', 'Enable SMS notifications'),
    ('max_volunteers_per_emergency', '5', 'Maximum volunteers per emergency'),
    ('emergency_response_time', '15', 'Emergency response time in minutes');
  `;

  return new Promise((resolve, reject) => {
    connection.query(defaultData, (err, results) => {
      if (err) {
        console.error('Error inserting default data:', err);
        reject(err);
      } else {
        console.log('Default data inserted successfully');
        resolve(results);
      }
    });
  });
};

// Connect to database and initialize
const connect = (callback) => {
  connection.connect((err) => {
    if (err) {
      console.error('Error connecting to database:', err);
      if (callback) callback(err);
      return;
    }
    
    console.log('Connected to MySQL database');
    
    // Initialize database tables and default data
    initializeDatabase()
      .then(() => insertDefaultData())
      .then(() => {
        console.log('Database initialization completed');
        if (callback) callback(null);
      })
      .catch((err) => {
        console.error('Database initialization failed:', err);
        if (callback) callback(err);
      });
  });
};

// Helper function for executing queries
const query = (sql, params) => {
  return new Promise((resolve, reject) => {
    connection.query(sql, params, (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
};

// Helper function for executing transactions
const transaction = (queries) => {
  return new Promise((resolve, reject) => {
    connection.beginTransaction((err) => {
      if (err) {
        reject(err);
        return;
      }

      let completed = 0;
      const results = [];

      queries.forEach((queryObj, index) => {
        connection.query(queryObj.sql, queryObj.params, (err, result) => {
          if (err) {
            connection.rollback(() => {
              reject(err);
            });
            return;
          }

          results[index] = result;
          completed++;

          if (completed === queries.length) {
            connection.commit((err) => {
              if (err) {
                connection.rollback(() => {
                  reject(err);
                });
                return;
              }
              resolve(results);
            });
          }
        });
      });
    });
  });
};

module.exports = {
  connection,
  connect,
  query,
  transaction
};
