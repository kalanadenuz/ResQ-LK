const db = require('../config/database');
const User = require('./User');

class EmergencyRequest {
  static async create(emergencyData) {
    const { 
      user_id, 
      location, 
      evacuation_time, 
      urgency_level, 
      description, 
      people_count 
    } = emergencyData;
    
    const sql = `
      INSERT INTO emergency_requests 
      (user_id, location, evacuation_time, urgency_level, description, people_count)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    try {
      const result = await db.query(sql, [
        user_id, 
        location, 
        evacuation_time, 
        urgency_level || 'medium', 
        description, 
        people_count || 1
      ]);
      
      const emergencyId = result.insertId;
      
      // Create notification for the user
      await User.createNotification(user_id, {
        title: 'Emergency Request Submitted',
        message: `Your emergency request has been submitted successfully. Request ID: ${emergencyId}`,
        type: 'emergency'
      });
      
      return await this.findById(emergencyId);
    } catch (error) {
      throw error;
    }
  }

  static async findById(id) {
    const sql = `
      SELECT er.*, u.name as user_name, u.phone_number as user_phone
      FROM emergency_requests er
      JOIN users u ON er.user_id = u.id
      WHERE er.id = ?
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
      evacuation_time, 
      urgency_level, 
      status, 
      description, 
      people_count 
    } = updateData;
    
    const sql = `
      UPDATE emergency_requests 
      SET location = ?, evacuation_time = ?, urgency_level = ?, status = ?, 
          description = ?, people_count = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    
    try {
      await db.query(sql, [
        location, 
        evacuation_time, 
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
      UPDATE emergency_requests 
      SET status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    
    try {
      await db.query(sql, [status, id]);
      
      // Get emergency details for notification
      const emergency = await this.findById(id);
      if (emergency) {
        await User.createNotification(emergency.user_id, {
          title: 'Emergency Status Updated',
          message: `Your emergency request status has been updated to: ${status}`,
          type: 'emergency'
        });
      }
      
      return await this.findById(id);
    } catch (error) {
      throw error;
    }
  }

  static async delete(id) {
    const sql = 'DELETE FROM emergency_requests WHERE id = ?';
    
    try {
      await db.query(sql, [id]);
      return true;
    } catch (error) {
      throw error;
    }
  }

  static async getAll(filters = {}) {
    let sql = `
      SELECT er.*, u.name as user_name, u.phone_number as user_phone
      FROM emergency_requests er
      JOIN users u ON er.user_id = u.id
    `;
    
    const params = [];
    const conditions = [];
    
    if (filters.status) {
      conditions.push('er.status = ?');
      params.push(filters.status);
    }
    
    if (filters.urgency_level) {
      conditions.push('er.urgency_level = ?');
      params.push(filters.urgency_level);
    }
    
    if (filters.location) {
      conditions.push('er.location LIKE ?');
      params.push(`%${filters.location}%`);
    }
    
    if (filters.date_from) {
      conditions.push('er.created_at >= ?');
      params.push(filters.date_from);
    }
    
    if (filters.date_to) {
      conditions.push('er.created_at <= ?');
      params.push(filters.date_to);
    }
    
    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }
    
    sql += ' ORDER BY er.created_at DESC';
    
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

  static async getPending() {
    const sql = `
      SELECT er.*, u.name as user_name, u.phone_number as user_phone
      FROM emergency_requests er
      JOIN users u ON er.user_id = u.id
      WHERE er.status = 'pending'
      ORDER BY er.urgency_level DESC, er.created_at ASC
    `;
    
    try {
      return await db.query(sql);
    } catch (error) {
      throw error;
    }
  }

  static async getByLocation(location) {
    const sql = `
      SELECT er.*, u.name as user_name, u.phone_number as user_phone
      FROM emergency_requests er
      JOIN users u ON er.user_id = u.id
      WHERE er.location LIKE ?
      ORDER BY er.created_at DESC
    `;
    
    try {
      return await db.query(sql, [`%${location}%`]);
    } catch (error) {
      throw error;
    }
  }

  static async getByUrgencyLevel(urgencyLevel) {
    const sql = `
      SELECT er.*, u.name as user_name, u.phone_number as user_phone
      FROM emergency_requests er
      JOIN users u ON er.user_id = u.id
      WHERE er.urgency_level = ?
      ORDER BY er.created_at DESC
    `;
    
    try {
      return await db.query(sql, [urgencyLevel]);
    } catch (error) {
      throw error;
    }
  }

  static async assignVolunteer(emergencyId, volunteerId) {
    const sql = `
      INSERT INTO emergency_assignments (emergency_id, volunteer_id)
      VALUES (?, ?)
    `;
    
    try {
      await db.query(sql, [emergencyId, volunteerId]);
      
      // Update emergency status to in_progress
      await this.updateStatus(emergencyId, 'in_progress');
      
      return true;
    } catch (error) {
      throw error;
    }
  }

  static async getAssignments(emergencyId) {
    const sql = `
      SELECT ea.*, v.id as volunteer_id, u.name as volunteer_name, u.phone_number as volunteer_phone
      FROM emergency_assignments ea
      JOIN volunteers v ON ea.volunteer_id = v.id
      JOIN users u ON v.user_id = u.id
      WHERE ea.emergency_id = ?
    `;
    
    try {
      return await db.query(sql, [emergencyId]);
    } catch (error) {
      throw error;
    }
  }

  static async getStatistics() {
    const sql = `
      SELECT 
        COUNT(*) as total_emergencies,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_emergencies,
        COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress_emergencies,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_emergencies,
        COUNT(CASE WHEN urgency_level = 'critical' THEN 1 END) as critical_emergencies,
        COUNT(CASE WHEN urgency_level = 'high' THEN 1 END) as high_emergencies,
        COUNT(CASE WHEN urgency_level = 'medium' THEN 1 END) as medium_emergencies,
        COUNT(CASE WHEN urgency_level = 'low' THEN 1 END) as low_emergencies
      FROM emergency_requests
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
        COUNT(*) as total_emergencies,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_emergencies,
        COUNT(CASE WHEN urgency_level = 'critical' THEN 1 END) as critical_emergencies
      FROM emergency_requests
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

  static async getLocationStatistics() {
    const sql = `
      SELECT 
        location,
        COUNT(*) as emergency_count,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_count,
        COUNT(CASE WHEN urgency_level = 'critical' THEN 1 END) as critical_count
      FROM emergency_requests
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY location
      ORDER BY emergency_count DESC
      LIMIT 10
    `;
    
    try {
      return await db.query(sql);
    } catch (error) {
      throw error;
    }
  }

  static async searchEmergencies(searchTerm) {
    const sql = `
      SELECT er.*, u.name as user_name, u.phone_number as user_phone
      FROM emergency_requests er
      JOIN users u ON er.user_id = u.id
      WHERE er.location LIKE ? OR er.description LIKE ? OR u.name LIKE ?
      ORDER BY er.created_at DESC
    `;
    
    const searchPattern = `%${searchTerm}%`;
    
    try {
      return await db.query(sql, [searchPattern, searchPattern, searchPattern]);
    } catch (error) {
      throw error;
    }
  }

  static async getNearbyEmergencies(latitude, longitude, radius = 10) {
    // This is a simplified version - in production you'd use proper geospatial queries
    const sql = `
      SELECT er.*, u.name as user_name, u.phone_number as user_phone
      FROM emergency_requests er
      JOIN users u ON er.user_id = u.id
      WHERE er.status IN ('pending', 'confirmed')
      ORDER BY er.urgency_level DESC, er.created_at ASC
      LIMIT 20
    `;
    
    try {
      return await db.query(sql);
    } catch (error) {
      throw error;
    }
  }

  static async cancelEmergency(emergencyId, userId) {
    const sql = `
      UPDATE emergency_requests 
      SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND user_id = ?
    `;
    
    try {
      const result = await db.query(sql, [emergencyId, userId]);
      
      if (result.affectedRows > 0) {
        await User.createNotification(userId, {
          title: 'Emergency Request Cancelled',
          message: 'Your emergency request has been cancelled successfully.',
          type: 'emergency'
        });
        return true;
      }
      return false;
    } catch (error) {
      throw error;
    }
  }

  static async getEmergencyWithDetails(emergencyId) {
    const sql = `
      SELECT 
        er.*,
        u.name as user_name,
        u.phone_number as user_phone,
        u.location as user_location,
        COUNT(ea.id) as assigned_volunteers
      FROM emergency_requests er
      JOIN users u ON er.user_id = u.id
      LEFT JOIN emergency_assignments ea ON er.id = ea.emergency_id
      WHERE er.id = ?
      GROUP BY er.id
    `;
    
    try {
      const results = await db.query(sql, [emergencyId]);
      return results[0] || null;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = EmergencyRequest;
