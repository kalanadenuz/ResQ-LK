const db = require('../config/database');
const User = require('./User');

class Volunteer {
  static async create(volunteerData) {
    const { 
      user_id, 
      shift_preference, 
      skills, 
      availability 
    } = volunteerData;
    
    const sql = `
      INSERT INTO volunteers 
      (user_id, shift_preference, skills, availability)
      VALUES (?, ?, ?, ?)
    `;
    
    try {
      const result = await db.query(sql, [
        user_id, 
        shift_preference, 
        skills, 
        availability !== undefined ? availability : true
      ]);
      
      const volunteerId = result.insertId;
      
      // Create notification for the user
      await User.createNotification(user_id, {
        title: 'Volunteer Registration Submitted',
        message: 'Your volunteer registration has been submitted successfully. We will review and get back to you soon.',
        type: 'volunteer'
      });
      
      return await this.findById(volunteerId);
    } catch (error) {
      throw error;
    }
  }

  static async findById(id) {
    const sql = `
      SELECT v.*, u.name as user_name, u.phone_number as user_phone, u.location as user_location
      FROM volunteers v
      JOIN users u ON v.user_id = u.id
      WHERE v.id = ?
    `;
    
    try {
      const results = await db.query(sql, [id]);
      return results[0] || null;
    } catch (error) {
      throw error;
    }
  }

  static async findByUserId(userId) {
    const sql = `
      SELECT v.*, u.name as user_name, u.phone_number as user_phone, u.location as user_location
      FROM volunteers v
      JOIN users u ON v.user_id = u.id
      WHERE v.user_id = ?
    `;
    
    try {
      const results = await db.query(sql, [userId]);
      return results[0] || null;
    } catch (error) {
      throw error;
    }
  }

  static async update(id, updateData) {
    const { 
      shift_preference, 
      skills, 
      availability, 
      status 
    } = updateData;
    
    const sql = `
      UPDATE volunteers 
      SET shift_preference = ?, skills = ?, availability = ?, status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    
    try {
      await db.query(sql, [
        shift_preference, 
        skills, 
        availability, 
        status, 
        id
      ]);
      
      return await this.findById(id);
    } catch (error) {
      throw error;
    }
  }

  static async updateStatus(id, status) {
    const sql = `
      UPDATE volunteers 
      SET status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    
    try {
      await db.query(sql, [status, id]);
      
      // Get volunteer details for notification
      const volunteer = await this.findById(id);
      if (volunteer) {
        await User.createNotification(volunteer.user_id, {
          title: 'Volunteer Status Updated',
          message: `Your volunteer application status has been updated to: ${status}`,
          type: 'volunteer'
        });
      }
      
      return await this.findById(id);
    } catch (error) {
      throw error;
    }
  }

  static async delete(id) {
    const sql = 'DELETE FROM volunteers WHERE id = ?';
    
    try {
      await db.query(sql, [id]);
      return true;
    } catch (error) {
      throw error;
    }
  }

  static async getAll(filters = {}) {
    let sql = `
      SELECT v.*, u.name as user_name, u.phone_number as user_phone, u.location as user_location
      FROM volunteers v
      JOIN users u ON v.user_id = u.id
    `;
    
    const params = [];
    const conditions = [];
    
    if (filters.status) {
      conditions.push('v.status = ?');
      params.push(filters.status);
    }
    
    if (filters.shift_preference) {
      conditions.push('v.shift_preference = ?');
      params.push(filters.shift_preference);
    }
    
    if (filters.availability !== undefined) {
      conditions.push('v.availability = ?');
      params.push(filters.availability);
    }
    
    if (filters.location) {
      conditions.push('u.location LIKE ?');
      params.push(`%${filters.location}%`);
    }
    
    if (filters.skills) {
      conditions.push('v.skills LIKE ?');
      params.push(`%${filters.skills}%`);
    }
    
    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }
    
    sql += ' ORDER BY v.created_at DESC';
    
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

  static async getApproved() {
    const sql = `
      SELECT v.*, u.name as user_name, u.phone_number as user_phone, u.location as user_location
      FROM volunteers v
      JOIN users u ON v.user_id = u.id
      WHERE v.status = 'approved' AND v.availability = TRUE
      ORDER BY v.created_at DESC
    `;
    
    try {
      return await db.query(sql);
    } catch (error) {
      throw error;
    }
  }

  static async getPending() {
    const sql = `
      SELECT v.*, u.name as user_name, u.phone_number as user_phone, u.location as user_location
      FROM volunteers v
      JOIN users u ON v.user_id = u.id
      WHERE v.status = 'pending'
      ORDER BY v.created_at ASC
    `;
    
    try {
      return await db.query(sql);
    } catch (error) {
      throw error;
    }
  }

  static async getByShiftPreference(shiftPreference) {
    const sql = `
      SELECT v.*, u.name as user_name, u.phone_number as user_phone, u.location as user_location
      FROM volunteers v
      JOIN users u ON v.user_id = u.id
      WHERE v.shift_preference = ? AND v.status = 'approved' AND v.availability = TRUE
      ORDER BY v.created_at DESC
    `;
    
    try {
      return await db.query(sql, [shiftPreference]);
    } catch (error) {
      throw error;
    }
  }

  static async getByLocation(location) {
    const sql = `
      SELECT v.*, u.name as user_name, u.phone_number as user_phone, u.location as user_location
      FROM volunteers v
      JOIN users u ON v.user_id = u.id
      WHERE u.location LIKE ? AND v.status = 'approved' AND v.availability = TRUE
      ORDER BY v.created_at DESC
    `;
    
    try {
      return await db.query(sql, [`%${location}%`]);
    } catch (error) {
      throw error;
    }
  }

  static async getBySkills(skills) {
    const sql = `
      SELECT v.*, u.name as user_name, u.phone_number as user_phone, u.location as user_location
      FROM volunteers v
      JOIN users u ON v.user_id = u.id
      WHERE v.skills LIKE ? AND v.status = 'approved' AND v.availability = TRUE
      ORDER BY v.created_at DESC
    `;
    
    try {
      return await db.query(sql, [`%${skills}%`]);
    } catch (error) {
      throw error;
    }
  }

  static async addTask(volunteerId, taskType) {
    const sql = `
      INSERT INTO volunteer_tasks (volunteer_id, task_type)
      VALUES (?, ?)
    `;
    
    try {
      await db.query(sql, [volunteerId, taskType]);
      return true;
    } catch (error) {
      throw error;
    }
  }

  static async getTasks(volunteerId) {
    const sql = `
      SELECT * FROM volunteer_tasks 
      WHERE volunteer_id = ?
      ORDER BY created_at DESC
    `;
    
    try {
      return await db.query(sql, [volunteerId]);
    } catch (error) {
      throw error;
    }
  }

  static async removeTask(volunteerId, taskType) {
    const sql = `
      DELETE FROM volunteer_tasks 
      WHERE volunteer_id = ? AND task_type = ?
    `;
    
    try {
      await db.query(sql, [volunteerId, taskType]);
      return true;
    } catch (error) {
      throw error;
    }
  }

  static async getVolunteerWithTasks(volunteerId) {
    const sql = `
      SELECT 
        v.*,
        u.name as user_name,
        u.phone_number as user_phone,
        u.location as user_location,
        GROUP_CONCAT(vt.task_type) as tasks
      FROM volunteers v
      JOIN users u ON v.user_id = u.id
      LEFT JOIN volunteer_tasks vt ON v.id = vt.volunteer_id
      WHERE v.id = ?
      GROUP BY v.id
    `;
    
    try {
      const results = await db.query(sql, [volunteerId]);
      return results[0] || null;
    } catch (error) {
      throw error;
    }
  }

  static async getStatistics() {
    const sql = `
      SELECT 
        COUNT(*) as total_volunteers,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_volunteers,
        COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_volunteers,
        COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected_volunteers,
        COUNT(CASE WHEN availability = TRUE THEN 1 END) as available_volunteers,
        COUNT(CASE WHEN shift_preference = 'morning' THEN 1 END) as morning_volunteers,
        COUNT(CASE WHEN shift_preference = 'afternoon' THEN 1 END) as afternoon_volunteers,
        COUNT(CASE WHEN shift_preference = 'evening' THEN 1 END) as evening_volunteers,
        COUNT(CASE WHEN shift_preference = 'night' THEN 1 END) as night_volunteers
      FROM volunteers
    `;
    
    try {
      const results = await db.query(sql);
      return results[0];
    } catch (error) {
      throw error;
    }
  }

  static async getShiftStatistics() {
    const sql = `
      SELECT 
        shift_preference,
        COUNT(*) as volunteer_count,
        COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_count,
        COUNT(CASE WHEN availability = TRUE THEN 1 END) as available_count
      FROM volunteers
      GROUP BY shift_preference
      ORDER BY volunteer_count DESC
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
        u.location,
        COUNT(*) as volunteer_count,
        COUNT(CASE WHEN v.status = 'approved' THEN 1 END) as approved_count,
        COUNT(CASE WHEN v.availability = TRUE THEN 1 END) as available_count
      FROM volunteers v
      JOIN users u ON v.user_id = u.id
      GROUP BY u.location
      ORDER BY volunteer_count DESC
      LIMIT 10
    `;
    
    try {
      return await db.query(sql);
    } catch (error) {
      throw error;
    }
  }

  static async searchVolunteers(searchTerm) {
    const sql = `
      SELECT v.*, u.name as user_name, u.phone_number as user_phone, u.location as user_location
      FROM volunteers v
      JOIN users u ON v.user_id = u.id
      WHERE u.name LIKE ? OR u.phone_number LIKE ? OR u.location LIKE ? OR v.skills LIKE ?
      ORDER BY v.created_at DESC
    `;
    
    const searchPattern = `%${searchTerm}%`;
    
    try {
      return await db.query(sql, [searchPattern, searchPattern, searchPattern, searchPattern]);
    } catch (error) {
      throw error;
    }
  }

  static async getAvailableVolunteers() {
    const sql = `
      SELECT v.*, u.name as user_name, u.phone_number as user_phone, u.location as user_location
      FROM volunteers v
      JOIN users u ON v.user_id = u.id
      WHERE v.status = 'approved' AND v.availability = TRUE
      ORDER BY v.created_at DESC
    `;
    
    try {
      return await db.query(sql);
    } catch (error) {
      throw error;
    }
  }

  static async getVolunteerAssignments(volunteerId) {
    const sql = `
      SELECT ea.*, er.location as emergency_location, er.urgency_level, er.status as emergency_status
      FROM emergency_assignments ea
      JOIN emergency_requests er ON ea.emergency_id = er.id
      WHERE ea.volunteer_id = ?
      ORDER BY ea.assigned_at DESC
    `;
    
    try {
      return await db.query(sql, [volunteerId]);
    } catch (error) {
      throw error;
    }
  }

  static async updateAvailability(volunteerId, availability) {
    const sql = `
      UPDATE volunteers 
      SET availability = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    
    try {
      await db.query(sql, [availability, volunteerId]);
      
      // Get volunteer details for notification
      const volunteer = await this.findById(volunteerId);
      if (volunteer) {
        await User.createNotification(volunteer.user_id, {
          title: 'Availability Updated',
          message: `Your availability has been updated to: ${availability ? 'Available' : 'Unavailable'}`,
          type: 'volunteer'
        });
      }
      
      return await this.findById(volunteerId);
    } catch (error) {
      throw error;
    }
  }

  static async getVolunteerHistory(userId) {
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

  static async getVolunteerSummary() {
    const sql = `
      SELECT 
        status,
        shift_preference,
        availability,
        COUNT(*) as count
      FROM volunteers
      GROUP BY status, shift_preference, availability
      ORDER BY status, shift_preference, availability
    `;
    
    try {
      return await db.query(sql);
    } catch (error) {
      throw error;
    }
  }

  static async getRecentVolunteers(limit = 10) {
    const sql = `
      SELECT v.*, u.name as user_name, u.phone_number as user_phone, u.location as user_location
      FROM volunteers v
      JOIN users u ON v.user_id = u.id
      ORDER BY v.created_at DESC
      LIMIT ?
    `;
    
    try {
      return await db.query(sql, [limit]);
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Volunteer;
