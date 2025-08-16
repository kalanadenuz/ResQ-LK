const db = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

class User {
  static async create(userData) {
    const { phone_number, name, age, location, profile_picture } = userData;
    
    const sql = `
      INSERT INTO users (phone_number, name, age, location, profile_picture)
      VALUES (?, ?, ?, ?, ?)
    `;
    
    try {
      const result = await db.query(sql, [phone_number, name, age, location, profile_picture]);
      return { id: result.insertId, ...userData };
    } catch (error) {
      throw error;
    }
  }

  static async findByPhone(phone_number) {
    const sql = 'SELECT * FROM users WHERE phone_number = ?';
    
    try {
      const results = await db.query(sql, [phone_number]);
      return results[0] || null;
    } catch (error) {
      throw error;
    }
  }

  static async findById(id) {
    const sql = 'SELECT * FROM users WHERE id = ?';
    
    try {
      const results = await db.query(sql, [id]);
      return results[0] || null;
    } catch (error) {
      throw error;
    }
  }

  static async update(id, updateData) {
    const { name, age, location, profile_picture } = updateData;
    
    const sql = `
      UPDATE users 
      SET name = ?, age = ?, location = ?, profile_picture = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    
    try {
      await db.query(sql, [name, age, location, profile_picture, id]);
      return await this.findById(id);
    } catch (error) {
      throw error;
    }
  }

  static async delete(id) {
    const sql = 'DELETE FROM users WHERE id = ?';
    
    try {
      await db.query(sql, [id]);
      return true;
    } catch (error) {
      throw error;
    }
  }

  static async getAll() {
    const sql = 'SELECT * FROM users ORDER BY created_at DESC';
    
    try {
      return await db.query(sql);
    } catch (error) {
      throw error;
    }
  }

  static async getProfileWithStats(userId) {
    const sql = `
      SELECT 
        u.*,
        COUNT(DISTINCT er.id) as total_emergencies,
        COUNT(DISTINCT rr.id) as total_relief_requests,
        COUNT(DISTINCT v.id) as volunteer_offers
      FROM users u
      LEFT JOIN emergency_requests er ON u.id = er.user_id
      LEFT JOIN relief_requests rr ON u.id = rr.user_id
      LEFT JOIN volunteers v ON u.id = v.user_id
      WHERE u.id = ?
      GROUP BY u.id
    `;
    
    try {
      const results = await db.query(sql, [userId]);
      return results[0] || null;
    } catch (error) {
      throw error;
    }
  }

  static async searchUsers(searchTerm) {
    const sql = `
      SELECT * FROM users 
      WHERE name LIKE ? OR phone_number LIKE ? OR location LIKE ?
      ORDER BY name
    `;
    
    const searchPattern = `%${searchTerm}%`;
    
    try {
      return await db.query(sql, [searchPattern, searchPattern, searchPattern]);
    } catch (error) {
      throw error;
    }
  }

  static async getUsersByLocation(location) {
    const sql = `
      SELECT * FROM users 
      WHERE location LIKE ?
      ORDER BY created_at DESC
    `;
    
    try {
      return await db.query(sql, [`%${location}%`]);
    } catch (error) {
      throw error;
    }
  }

  static async getActiveUsers() {
    const sql = `
      SELECT u.* FROM users u
      WHERE EXISTS (
        SELECT 1 FROM emergency_requests er 
        WHERE er.user_id = u.id AND er.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      ) OR EXISTS (
        SELECT 1 FROM relief_requests rr 
        WHERE rr.user_id = u.id AND rr.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      )
      ORDER BY u.updated_at DESC
    `;
    
    try {
      return await db.query(sql);
    } catch (error) {
      throw error;
    }
  }

  static async getUserNotifications(userId) {
    const sql = `
      SELECT * FROM notifications 
      WHERE user_id = ? 
      ORDER BY created_at DESC 
      LIMIT 50
    `;
    
    try {
      return await db.query(sql, [userId]);
    } catch (error) {
      throw error;
    }
  }

  static async markNotificationAsRead(notificationId, userId) {
    const sql = `
      UPDATE notifications 
      SET read_status = TRUE 
      WHERE id = ? AND user_id = ?
    `;
    
    try {
      await db.query(sql, [notificationId, userId]);
      return true;
    } catch (error) {
      throw error;
    }
  }

  static async markAllNotificationsAsRead(userId) {
    const sql = `
      UPDATE notifications 
      SET read_status = TRUE 
      WHERE user_id = ? AND read_status = FALSE
    `;
    
    try {
      await db.query(sql, [userId]);
      return true;
    } catch (error) {
      throw error;
    }
  }

  static async getUnreadNotificationCount(userId) {
    const sql = `
      SELECT COUNT(*) as count 
      FROM notifications 
      WHERE user_id = ? AND read_status = FALSE
    `;
    
    try {
      const results = await db.query(sql, [userId]);
      return results[0].count;
    } catch (error) {
      throw error;
    }
  }

  static async createNotification(userId, notificationData) {
    const { title, message, type } = notificationData;
    
    const sql = `
      INSERT INTO notifications (user_id, title, message, type)
      VALUES (?, ?, ?, ?)
    `;
    
    try {
      const result = await db.query(sql, [userId, title, message, type]);
      return { id: result.insertId, ...notificationData };
    } catch (error) {
      throw error;
    }
  }

  static async getUserEmergencyHistory(userId) {
    const sql = `
      SELECT * FROM emergency_requests 
      WHERE user_id = ? 
      ORDER BY created_at DESC
    `;
    
    try {
      return await db.query(sql, [userId]);
    } catch (error) {
      throw error;
    }
  }

  static async getUserReliefHistory(userId) {
    const sql = `
      SELECT * FROM relief_requests 
      WHERE user_id = ? 
      ORDER BY created_at DESC
    `;
    
    try {
      return await db.query(sql, [userId]);
    } catch (error) {
      throw error;
    }
  }

  static async getUserVolunteerHistory(userId) {
    const sql = `
      SELECT v.*, vt.task_type 
      FROM volunteers v
      LEFT JOIN volunteer_tasks vt ON v.id = vt.volunteer_id
      WHERE v.user_id = ?
      ORDER BY v.created_at DESC
    `;
    
    try {
      return await db.query(sql, [userId]);
    } catch (error) {
      throw error;
    }
  }

  static async updateProfilePicture(userId, profilePicture) {
    const sql = `
      UPDATE users 
      SET profile_picture = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    
    try {
      await db.query(sql, [profilePicture, userId]);
      return await this.findById(userId);
    } catch (error) {
      throw error;
    }
  }

  static async getUserStats(userId) {
    const sql = `
      SELECT 
        (SELECT COUNT(*) FROM emergency_requests WHERE user_id = ?) as emergency_count,
        (SELECT COUNT(*) FROM relief_requests WHERE user_id = ?) as relief_count,
        (SELECT COUNT(*) FROM volunteers WHERE user_id = ?) as volunteer_count,
        (SELECT COUNT(*) FROM emergency_requests WHERE user_id = ? AND status = 'completed') as completed_emergencies,
        (SELECT COUNT(*) FROM relief_requests WHERE user_id = ? AND status = 'completed') as completed_relief
    `;
    
    try {
      const results = await db.query(sql, [userId, userId, userId, userId, userId]);
      return results[0];
    } catch (error) {
      throw error;
    }
  }

  static async getRecentActivity(userId, limit = 10) {
    const sql = `
      (SELECT 'emergency' as type, id, status, created_at, location as description
       FROM emergency_requests 
       WHERE user_id = ?)
      UNION ALL
      (SELECT 'relief' as type, id, status, created_at, relief_type as description
       FROM relief_requests 
       WHERE user_id = ?)
      UNION ALL
      (SELECT 'volunteer' as type, v.id, v.status, v.created_at, v.shift_preference as description
       FROM volunteers v
       WHERE v.user_id = ?)
      ORDER BY created_at DESC
      LIMIT ?
    `;
    
    try {
      return await db.query(sql, [userId, userId, userId, limit]);
    } catch (error) {
      throw error;
    }
  }
}

module.exports = User;
