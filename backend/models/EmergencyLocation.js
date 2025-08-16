const db = require('../config/database');

class EmergencyLocation {
  static async create(locationData) {
    const { 
      name, 
      latitude, 
      longitude, 
      location_type, 
      capacity, 
      contact_number, 
      address 
    } = locationData;
    
    const sql = `
      INSERT INTO emergency_locations 
      (name, latitude, longitude, location_type, capacity, contact_number, address)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    try {
      const result = await db.query(sql, [
        name, 
        latitude, 
        longitude, 
        location_type, 
        capacity, 
        contact_number, 
        address
      ]);
      
      return await this.findById(result.insertId);
    } catch (error) {
      throw error;
    }
  }

  static async findById(id) {
    const sql = 'SELECT * FROM emergency_locations WHERE id = ?';
    
    try {
      const results = await db.query(sql, [id]);
      return results[0] || null;
    } catch (error) {
      throw error;
    }
  }

  static async update(id, updateData) {
    const { 
      name, 
      latitude, 
      longitude, 
      location_type, 
      capacity, 
      current_occupancy,
      status, 
      contact_number, 
      address 
    } = updateData;
    
    const sql = `
      UPDATE emergency_locations 
      SET name = ?, latitude = ?, longitude = ?, location_type = ?, 
          capacity = ?, current_occupancy = ?, status = ?, contact_number = ?, 
          address = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    
    try {
      await db.query(sql, [
        name, 
        latitude, 
        longitude, 
        location_type, 
        capacity, 
        current_occupancy,
        status, 
        contact_number, 
        address, 
        id
      ]);
      
      return await this.findById(id);
    } catch (error) {
      throw error;
    }
  }

  static async delete(id) {
    const sql = 'DELETE FROM emergency_locations WHERE id = ?';
    
    try {
      await db.query(sql, [id]);
      return true;
    } catch (error) {
      throw error;
    }
  }

  static async getAll(filters = {}) {
    let sql = 'SELECT * FROM emergency_locations';
    
    const params = [];
    const conditions = [];
    
    if (filters.location_type) {
      conditions.push('location_type = ?');
      params.push(filters.location_type);
    }
    
    if (filters.status) {
      conditions.push('status = ?');
      params.push(filters.status);
    }
    
    if (filters.name) {
      conditions.push('name LIKE ?');
      params.push(`%${filters.name}%`);
    }
    
    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }
    
    sql += ' ORDER BY name ASC';
    
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

  static async getByType(locationType) {
    const sql = `
      SELECT * FROM emergency_locations 
      WHERE location_type = ? AND status = 'active'
      ORDER BY name ASC
    `;
    
    try {
      return await db.query(sql, [locationType]);
    } catch (error) {
      throw error;
    }
  }

  static async getActive() {
    const sql = `
      SELECT * FROM emergency_locations 
      WHERE status = 'active'
      ORDER BY name ASC
    `;
    
    try {
      return await db.query(sql);
    } catch (error) {
      throw error;
    }
  }

  static async getAvailable() {
    const sql = `
      SELECT * FROM emergency_locations 
      WHERE status = 'active' AND current_occupancy < capacity
      ORDER BY (capacity - current_occupancy) DESC
    `;
    
    try {
      return await db.query(sql);
    } catch (error) {
      throw error;
    }
  }

  static async getFull() {
    const sql = `
      SELECT * FROM emergency_locations 
      WHERE current_occupancy >= capacity
      ORDER BY name ASC
    `;
    
    try {
      return await db.query(sql);
    } catch (error) {
      throw error;
    }
  }

  static async updateOccupancy(id, occupancy) {
    const sql = `
      UPDATE emergency_locations 
      SET current_occupancy = ?, 
          status = CASE WHEN ? >= capacity THEN 'full' ELSE 'active' END,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    
    try {
      await db.query(sql, [occupancy, occupancy, id]);
      return await this.findById(id);
    } catch (error) {
      throw error;
    }
  }

  static async incrementOccupancy(id) {
    const sql = `
      UPDATE emergency_locations 
      SET current_occupancy = current_occupancy + 1,
          status = CASE WHEN (current_occupancy + 1) >= capacity THEN 'full' ELSE 'active' END,
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

  static async decrementOccupancy(id) {
    const sql = `
      UPDATE emergency_locations 
      SET current_occupancy = GREATEST(current_occupancy - 1, 0),
          status = 'active',
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

  static async searchLocations(searchTerm) {
    const sql = `
      SELECT * FROM emergency_locations 
      WHERE name LIKE ? OR address LIKE ? OR location_type LIKE ?
      ORDER BY name ASC
    `;
    
    const searchPattern = `%${searchTerm}%`;
    
    try {
      return await db.query(sql, [searchPattern, searchPattern, searchPattern]);
    } catch (error) {
      throw error;
    }
  }

  static async getNearbyLocations(latitude, longitude, radius = 10) {
    // This is a simplified version - in production you'd use proper geospatial queries
    const sql = `
      SELECT * FROM emergency_locations 
      WHERE status = 'active'
      ORDER BY name ASC
      LIMIT 20
    `;
    
    try {
      return await db.query(sql);
    } catch (error) {
      throw error;
    }
  }

  static async getStatistics() {
    const sql = `
      SELECT 
        COUNT(*) as total_locations,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_locations,
        COUNT(CASE WHEN status = 'full' THEN 1 END) as full_locations,
        COUNT(CASE WHEN status = 'inactive' THEN 1 END) as inactive_locations,
        SUM(capacity) as total_capacity,
        SUM(current_occupancy) as total_occupancy,
        COUNT(CASE WHEN location_type = 'relief_center' THEN 1 END) as relief_centers,
        COUNT(CASE WHEN location_type = 'safe_zone' THEN 1 END) as safe_zones,
        COUNT(CASE WHEN location_type = 'rescue_team' THEN 1 END) as rescue_teams,
        COUNT(CASE WHEN location_type = 'hospital' THEN 1 END) as hospitals,
        COUNT(CASE WHEN location_type = 'shelter' THEN 1 END) as shelters
      FROM emergency_locations
    `;
    
    try {
      const results = await db.query(sql);
      return results[0];
    } catch (error) {
      throw error;
    }
  }

  static async getTypeStatistics() {
    const sql = `
      SELECT 
        location_type,
        COUNT(*) as location_count,
        SUM(capacity) as total_capacity,
        SUM(current_occupancy) as total_occupancy,
        AVG(current_occupancy / capacity * 100) as occupancy_percentage
      FROM emergency_locations
      WHERE status = 'active'
      GROUP BY location_type
      ORDER BY location_count DESC
    `;
    
    try {
      return await db.query(sql);
    } catch (error) {
      throw error;
    }
  }

  static async getLocationSummary() {
    const sql = `
      SELECT 
        location_type,
        status,
        COUNT(*) as count
      FROM emergency_locations
      GROUP BY location_type, status
      ORDER BY location_type, status
    `;
    
    try {
      return await db.query(sql);
    } catch (error) {
      throw error;
    }
  }

  static async getCapacityUtilization() {
    const sql = `
      SELECT 
        name,
        location_type,
        capacity,
        current_occupancy,
        ROUND((current_occupancy / capacity) * 100, 2) as utilization_percentage
      FROM emergency_locations
      WHERE status = 'active'
      ORDER BY utilization_percentage DESC
    `;
    
    try {
      return await db.query(sql);
    } catch (error) {
      throw error;
    }
  }
}

module.exports = EmergencyLocation;
