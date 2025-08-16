const db = require('../config/database');

class EvacuationTimeSlot {
  static async create(timeSlotData) {
    const { 
      time_slot, 
      available_slots, 
      date 
    } = timeSlotData;
    
    const sql = `
      INSERT INTO evacuation_time_slots 
      (time_slot, available_slots, date)
      VALUES (?, ?, ?)
    `;
    
    try {
      const result = await db.query(sql, [
        time_slot, 
        available_slots || 10, 
        date
      ]);
      
      return await this.findById(result.insertId);
    } catch (error) {
      throw error;
    }
  }

  static async findById(id) {
    const sql = 'SELECT * FROM evacuation_time_slots WHERE id = ?';
    
    try {
      const results = await db.query(sql, [id]);
      return results[0] || null;
    } catch (error) {
      throw error;
    }
  }

  static async update(id, updateData) {
    const { 
      time_slot, 
      available_slots, 
      booked_slots, 
      date, 
      status 
    } = updateData;
    
    const sql = `
      UPDATE evacuation_time_slots 
      SET time_slot = ?, available_slots = ?, booked_slots = ?, 
          date = ?, status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    
    try {
      await db.query(sql, [
        time_slot, 
        available_slots, 
        booked_slots, 
        date, 
        status, 
        id
      ]);
      
      return await this.findById(id);
    } catch (error) {
      throw error;
    }
  }

  static async delete(id) {
    const sql = 'DELETE FROM evacuation_time_slots WHERE id = ?';
    
    try {
      await db.query(sql, [id]);
      return true;
    } catch (error) {
      throw error;
    }
  }

  static async getAll(filters = {}) {
    let sql = 'SELECT * FROM evacuation_time_slots';
    
    const params = [];
    const conditions = [];
    
    if (filters.date) {
      conditions.push('date = ?');
      params.push(filters.date);
    }
    
    if (filters.status) {
      conditions.push('status = ?');
      params.push(filters.status);
    }
    
    if (filters.time_slot) {
      conditions.push('time_slot LIKE ?');
      params.push(`%${filters.time_slot}%`);
    }
    
    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }
    
    sql += ' ORDER BY date ASC, time_slot ASC';
    
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

  static async getByDate(date) {
    const sql = `
      SELECT * FROM evacuation_time_slots 
      WHERE date = ?
      ORDER BY time_slot ASC
    `;
    
    try {
      return await db.query(sql, [date]);
    } catch (error) {
      throw error;
    }
  }

  static async getAvailable() {
    const sql = `
      SELECT * FROM evacuation_time_slots 
      WHERE status = 'available' AND available_slots > booked_slots
      ORDER BY date ASC, time_slot ASC
    `;
    
    try {
      return await db.query(sql);
    } catch (error) {
      throw error;
    }
  }

  static async getFull() {
    const sql = `
      SELECT * FROM evacuation_time_slots 
      WHERE status = 'full' OR available_slots <= booked_slots
      ORDER BY date ASC, time_slot ASC
    `;
    
    try {
      return await db.query(sql);
    } catch (error) {
      throw error;
    }
  }

  static async getClosed() {
    const sql = `
      SELECT * FROM evacuation_time_slots 
      WHERE status = 'closed'
      ORDER BY date ASC, time_slot ASC
    `;
    
    try {
      return await db.query(sql);
    } catch (error) {
      throw error;
    }
  }

  static async bookSlot(id) {
    const sql = `
      UPDATE evacuation_time_slots 
      SET booked_slots = booked_slots + 1,
          status = CASE WHEN (booked_slots + 1) >= available_slots THEN 'full' ELSE 'available' END,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND available_slots > booked_slots
    `;
    
    try {
      const result = await db.query(sql, [id]);
      if (result.affectedRows > 0) {
        return await this.findById(id);
      }
      return null;
    } catch (error) {
      throw error;
    }
  }

  static async cancelBooking(id) {
    const sql = `
      UPDATE evacuation_time_slots 
      SET booked_slots = GREATEST(booked_slots - 1, 0),
          status = 'available',
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    
    try {
      await db.query(sql, [id]);
      return await this.findById(id);
    } catch (error) {
      throw error;
    }
  }

  static async updateStatus(id, status) {
    const sql = `
      UPDATE evacuation_time_slots 
      SET status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    
    try {
      await db.query(sql, [status, id]);
      return await this.findById(id);
    } catch (error) {
      throw error;
    }
  }

  static async getTodaySlots() {
    const sql = `
      SELECT * FROM evacuation_time_slots 
      WHERE date = CURDATE()
      ORDER BY time_slot ASC
    `;
    
    try {
      return await db.query(sql);
    } catch (error) {
      throw error;
    }
  }

  static async getUpcomingSlots(days = 7) {
    const sql = `
      SELECT * FROM evacuation_time_slots 
      WHERE date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL ? DAY)
      ORDER BY date ASC, time_slot ASC
    `;
    
    try {
      return await db.query(sql, [days]);
    } catch (error) {
      throw error;
    }
  }

  static async getAvailableSlotsForDate(date) {
    const sql = `
      SELECT * FROM evacuation_time_slots 
      WHERE date = ? AND status = 'available' AND available_slots > booked_slots
      ORDER BY time_slot ASC
    `;
    
    try {
      return await db.query(sql, [date]);
    } catch (error) {
      throw error;
    }
  }

  static async getStatistics() {
    const sql = `
      SELECT 
        COUNT(*) as total_slots,
        COUNT(CASE WHEN status = 'available' THEN 1 END) as available_slots,
        COUNT(CASE WHEN status = 'full' THEN 1 END) as full_slots,
        COUNT(CASE WHEN status = 'closed' THEN 1 END) as closed_slots,
        SUM(available_slots) as total_capacity,
        SUM(booked_slots) as total_booked,
        AVG(booked_slots / available_slots * 100) as average_utilization
      FROM evacuation_time_slots
      WHERE date >= CURDATE()
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
        date,
        COUNT(*) as total_slots,
        COUNT(CASE WHEN status = 'available' THEN 1 END) as available_slots,
        COUNT(CASE WHEN status = 'full' THEN 1 END) as full_slots,
        SUM(available_slots) as total_capacity,
        SUM(booked_slots) as total_booked
      FROM evacuation_time_slots
      WHERE date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
      GROUP BY date
      ORDER BY date DESC
    `;
    
    try {
      return await db.query(sql);
    } catch (error) {
      throw error;
    }
  }

  static async getTimeSlotStatistics() {
    const sql = `
      SELECT 
        time_slot,
        COUNT(*) as slot_count,
        COUNT(CASE WHEN status = 'available' THEN 1 END) as available_count,
        COUNT(CASE WHEN status = 'full' THEN 1 END) as full_count,
        AVG(booked_slots / available_slots * 100) as average_utilization
      FROM evacuation_time_slots
      WHERE date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
      GROUP BY time_slot
      ORDER BY time_slot
    `;
    
    try {
      return await db.query(sql);
    } catch (error) {
      throw error;
    }
  }

  static async searchTimeSlots(searchTerm) {
    const sql = `
      SELECT * FROM evacuation_time_slots 
      WHERE time_slot LIKE ? OR date LIKE ?
      ORDER BY date ASC, time_slot ASC
    `;
    
    const searchPattern = `%${searchTerm}%`;
    
    try {
      return await db.query(sql, [searchPattern, searchPattern]);
    } catch (error) {
      throw error;
    }
  }

  static async createDefaultSlotsForDate(date) {
    const timeSlots = [
      '00:00-02:00 AM',
      '02:00-04:00 AM',
      '04:00-06:00 AM',
      '06:00-08:00 AM',
      '08:00-10:00 AM',
      '10:00-12:00 AM',
      '12:00-14:00 PM',
      '14:00-16:00 PM',
      '16:00-18:00 PM',
      '18:00-20:00 PM',
      '20:00-22:00 PM',
      '22:00-00:00 PM'
    ];
    
    const queries = timeSlots.map(timeSlot => ({
      sql: `
        INSERT IGNORE INTO evacuation_time_slots (time_slot, date, available_slots)
        VALUES (?, ?, 10)
      `,
      params: [timeSlot, date]
    }));
    
    try {
      await db.transaction(queries);
      return await this.getByDate(date);
    } catch (error) {
      throw error;
    }
  }

  static async getSlotUtilization() {
    const sql = `
      SELECT 
        time_slot,
        date,
        available_slots,
        booked_slots,
        ROUND((booked_slots / available_slots) * 100, 2) as utilization_percentage
      FROM evacuation_time_slots
      WHERE date >= CURDATE()
      ORDER BY date ASC, time_slot ASC
    `;
    
    try {
      return await db.query(sql);
    } catch (error) {
      throw error;
    }
  }

  static async getSlotSummary() {
    const sql = `
      SELECT 
        status,
        COUNT(*) as count
      FROM evacuation_time_slots
      WHERE date >= CURDATE()
      GROUP BY status
      ORDER BY status
    `;
    
    try {
      return await db.query(sql);
    } catch (error) {
      throw error;
    }
  }
}

module.exports = EvacuationTimeSlot;
