const db = require('../config/database');
const User = require('./User');

class ReliefRequest {
  static async create(reliefData) {
    const { 
      user_id, 
      location, 
      relief_type, 
      urgency_level, 
      description, 
      people_count 
    } = reliefData;
    
    const sql = `
      INSERT INTO relief_requests 
      (user_id, location, relief_type, urgency_level, description, people_count)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    try {
      const result = await db.query(sql, [
        user_id, 
        location, 
        relief_type, 
        urgency_level || 'medium', 
        description, 
        people_count || 1
      ]);
      
      const reliefId = result.insertId;
      
      // Create notification for the user
      await User.createNotification(user_id, {
        title: 'Relief Request Submitted',
        message: `Your relief request for ${relief_type} has been submitted successfully. Request ID: ${reliefId}`,
        type: 'relief'
      });
      
      return await this.findById(reliefId);
    } catch (error) {
      throw error;
    }
  }

  static async findById(id) {
    const sql = `
      SELECT rr.*, u.name as user_name, u.phone_number as user_phone
      FROM relief_requests rr
      JOIN users u ON rr.user_id = u.id
      WHERE rr.id = ?
    `;
    
    try {
      const results = await db.query(sql, [id]);
      return results[0] || null;
    } catch (error) {
      throw error;
    }
  }

  static async update(id, updateData) {
    const { 
      location, 
      relief_type, 
      urgency_level, 
      status, 
      description, 
      people_count 
    } = updateData;
    
    const sql = `
      UPDATE relief_requests 
      SET location = ?, relief_type = ?, urgency_level = ?, status = ?, 
          description = ?, people_count = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    
    try {
      await db.query(sql, [
        location, 
        relief_type, 
        urgency_level, 
        status, 
        description, 
        people_count, 
        id
      ]);
      
      return await this.findById(id);
    } catch (error) {
      throw error;
    }
  }

  static async updateStatus(id, status) {
    const sql = `
      UPDATE relief_requests 
      SET status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    
    try {
      await db.query(sql, [status, id]);
      
      // Get relief details for notification
      const relief = await this.findById(id);
      if (relief) {
        await User.createNotification(relief.user_id, {
          title: 'Relief Request Status Updated',
          message: `Your relief request status has been updated to: ${status}`,
          type: 'relief'
        });
      }
      
      return await this.findById(id);
    } catch (error) {
      throw error;
    }
  }

  static async delete(id) {
    const sql = 'DELETE FROM relief_requests WHERE id = ?';
    
    try {
      await db.query(sql, [id]);
      return true;
    } catch (error) {
      throw error;
    }
  }

  static async getAll(filters = {}) {
    let sql = `
      SELECT rr.*, u.name as user_name, u.phone_number as user_phone
      FROM relief_requests rr
      JOIN users u ON rr.user_id = u.id
    `;
    
    const params = [];
    const conditions = [];
    
    if (filters.status) {
      conditions.push('rr.status = ?');
      params.push(filters.status);
    }
    
    if (filters.relief_type) {
      conditions.push('rr.relief_type = ?');
      params.push(filters.relief_type);
    }
    
    if (filters.urgency_level) {
      conditions.push('rr.urgency_level = ?');
      params.push(filters.urgency_level);
    }
    
    if (filters.location) {
      conditions.push('rr.location LIKE ?');
      params.push(`%${filters.location}%`);
    }
    
    if (filters.date_from) {
      conditions.push('rr.created_at >= ?');
      params.push(filters.date_from);
    }
    
    if (filters.date_to) {
      conditions.push('rr.created_at <= ?');
      params.push(filters.date_to);
    }
    
    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }
    
    sql += ' ORDER BY rr.created_at DESC';
    
    if (filters.limit) {
      sql += ' LIMIT ?';
      params.push(filters.limit);
    }
    
    try {
      return await db.query(sql, params);
    } catch (error) {
      throw error;
    }
  }

  static async getByUserId(userId) {
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

  static async getPending() {
    const sql = `
      SELECT rr.*, u.name as user_name, u.phone_number as user_phone
      FROM relief_requests rr
      JOIN users u ON rr.user_id = u.id
      WHERE rr.status = 'pending'
      ORDER BY rr.urgency_level DESC, rr.created_at ASC
    `;
    
    try {
      return await db.query(sql);
    } catch (error) {
      throw error;
    }
  }

  static async getByReliefType(reliefType) {
    const sql = `
      SELECT rr.*, u.name as user_name, u.phone_number as user_phone
      FROM relief_requests rr
      JOIN users u ON rr.user_id = u.id
      WHERE rr.relief_type = ?
      ORDER BY rr.created_at DESC
    `;
    
    try {
      return await db.query(sql, [reliefType]);
    } catch (error) {
      throw error;
    }
  }

  static async getByLocation(location) {
    const sql = `
      SELECT rr.*, u.name as user_name, u.phone_number as user_phone
      FROM relief_requests rr
      JOIN users u ON rr.user_id = u.id
      WHERE rr.location LIKE ?
      ORDER BY rr.created_at DESC
    `;
    
    try {
      return await db.query(sql, [`%${location}%`]);
    } catch (error) {
      throw error;
    }
  }

  static async getByUrgencyLevel(urgencyLevel) {
    const sql = `
      SELECT rr.*, u.name as user_name, u.phone_number as user_phone
      FROM relief_requests rr
      JOIN users u ON rr.user_id = u.id
      WHERE rr.urgency_level = ?
      ORDER BY rr.created_at DESC
    `;
    
    try {
      return await db.query(sql, [urgencyLevel]);
    } catch (error) {
      throw error;
    }
  }

  static async getStatistics() {
    const sql = `
      SELECT 
        COUNT(*) as total_relief_requests,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_requests,
        COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress_requests,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_requests,
        COUNT(CASE WHEN relief_type = 'food' THEN 1 END) as food_requests,
        COUNT(CASE WHEN relief_type = 'water' THEN 1 END) as water_requests,
        COUNT(CASE WHEN relief_type = 'medicine' THEN 1 END) as medicine_requests,
        COUNT(CASE WHEN relief_type = 'shelter' THEN 1 END) as shelter_requests,
        COUNT(CASE WHEN relief_type = 'clothing' THEN 1 END) as clothing_requests,
        COUNT(CASE WHEN relief_type = 'other' THEN 1 END) as other_requests
      FROM relief_requests
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
    `;
    
    try {
      const results = await db.query(sql);
      return results[0];
    } catch (error) {
      throw error;
    }
  }

  static async getDailyStatistics() {
    const sql = `
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as total_requests,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_requests,
        COUNT(CASE WHEN urgency_level = 'critical' THEN 1 END) as critical_requests
      FROM relief_requests
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `;
    
    try {
      return await db.query(sql);
    } catch (error) {
      throw error;
    }
  }

  static async getReliefTypeStatistics() {
    const sql = `
      SELECT 
        relief_type,
        COUNT(*) as request_count,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_count,
        COUNT(CASE WHEN urgency_level = 'critical' THEN 1 END) as critical_count
      FROM relief_requests
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY relief_type
      ORDER BY request_count DESC
    `;
    
    try {
      return await db.query(sql);
    } catch (error) {
      throw error;
    }
  }

  static async getLocationStatistics() {
    const sql = `
      SELECT 
        location,
        COUNT(*) as request_count,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_count,
        COUNT(CASE WHEN urgency_level = 'critical' THEN 1 END) as critical_count
      FROM relief_requests
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY location
      ORDER BY request_count DESC
      LIMIT 10
    `;
    
    try {
      return await db.query(sql);
    } catch (error) {
      throw error;
    }
  }

  static async searchReliefRequests(searchTerm) {
    const sql = `
      SELECT rr.*, u.name as user_name, u.phone_number as user_phone
      FROM relief_requests rr
      JOIN users u ON rr.user_id = u.id
      WHERE rr.location LIKE ? OR rr.description LIKE ? OR u.name LIKE ? OR rr.relief_type LIKE ?
      ORDER BY rr.created_at DESC
    `;
    
    const searchPattern = `%${searchTerm}%`;
    
    try {
      return await db.query(sql, [searchPattern, searchPattern, searchPattern, searchPattern]);
    } catch (error) {
      throw error;
    }
  }

  static async getNearbyReliefRequests(latitude, longitude, radius = 10) {
    // This is a simplified version - in production you'd use proper geospatial queries
    const sql = `
      SELECT rr.*, u.name as user_name, u.phone_number as user_phone
      FROM relief_requests rr
      JOIN users u ON rr.user_id = u.id
      WHERE rr.status IN ('pending', 'confirmed')
      ORDER BY rr.urgency_level DESC, rr.created_at ASC
      LIMIT 20
    `;
    
    try {
      return await db.query(sql);
    } catch (error) {
      throw error;
    }
  }

  static async cancelReliefRequest(reliefId, userId) {
    const sql = `
      UPDATE relief_requests 
      SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND user_id = ?
    `;
    
    try {
      const result = await db.query(sql, [reliefId, userId]);
      
      if (result.affectedRows > 0) {
        await User.createNotification(userId, {
          title: 'Relief Request Cancelled',
          message: 'Your relief request has been cancelled successfully.',
          type: 'relief'
        });
        return true;
      }
      return false;
    } catch (error) {
      throw error;
    }
  }

  static async getReliefWithDetails(reliefId) {
    const sql = `
      SELECT 
        rr.*,
        u.name as user_name,
        u.phone_number as user_phone,
        u.location as user_location
      FROM relief_requests rr
      JOIN users u ON rr.user_id = u.id
      WHERE rr.id = ?
    `;
    
    try {
      const results = await db.query(sql, [reliefId]);
      return results[0] || null;
    } catch (error) {
      throw error;
    }
  }

  static async getReliefTypes() {
    const sql = `
      SELECT DISTINCT relief_type, COUNT(*) as count
      FROM relief_requests
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY relief_type
      ORDER BY count DESC
    `;
    
    try {
      return await db.query(sql);
    } catch (error) {
      throw error;
    }
  }

  static async getUrgentRequests() {
    const sql = `
      SELECT rr.*, u.name as user_name, u.phone_number as user_phone
      FROM relief_requests rr
      JOIN users u ON rr.user_id = u.id
      WHERE rr.urgency_level IN ('high', 'critical') AND rr.status = 'pending'
      ORDER BY rr.urgency_level DESC, rr.created_at ASC
      LIMIT 20
    `;
    
    try {
      return await db.query(sql);
    } catch (error) {
      throw error;
    }
  }

  static async getCompletedRequests() {
    const sql = `
      SELECT rr.*, u.name as user_name, u.phone_number as user_phone
      FROM relief_requests rr
      JOIN users u ON rr.user_id = u.id
      WHERE rr.status = 'completed'
      ORDER BY rr.updated_at DESC
      LIMIT 50
    `;
    
    try {
      return await db.query(sql);
    } catch (error) {
      throw error;
    }
  }

  static async getReliefSummary() {
    const sql = `
      SELECT 
        relief_type,
        urgency_level,
        status,
        COUNT(*) as count
      FROM relief_requests
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      GROUP BY relief_type, urgency_level, status
      ORDER BY relief_type, urgency_level, status
    `;
    
    try {
      return await db.query(sql);
    } catch (error) {
      throw error;
    }
  }
}

module.exports = ReliefRequest;
