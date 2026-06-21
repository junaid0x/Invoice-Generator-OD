const db = require('../database/db');

const getSettings = async () => {
  const [rows] = await db.query('SELECT * FROM settings WHERE id = 1');
  return rows[0] || null;
};

const updateSettings = async (data) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    
    const [existing] = await connection.query('SELECT id FROM settings WHERE id = 1');
    
    if (existing.length === 0) {
      // Insert if not exists
      const fields = Object.keys(data).filter(key => key !== 'id');
      const values = fields.map(key => data[key]);
      const placeholders = fields.map(() => '?').join(', ');
      
      if (fields.length > 0) {
        await connection.query(
          `INSERT INTO settings (id, ${fields.join(', ')}) VALUES (1, ${placeholders})`,
          values
        );
      }
    } else {
      // Update
      const fields = Object.keys(data).filter(key => key !== 'id' && data[key] !== undefined);
      if (fields.length > 0) {
        const setClause = fields.map(key => `${key} = ?`).join(', ');
        const values = fields.map(key => data[key]);
        
        await connection.query(
          `UPDATE settings SET ${setClause} WHERE id = 1`,
          values
        );
      }
    }
    
    await connection.commit();
    return await getSettings();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

module.exports = {
  getSettings,
  updateSettings
};
