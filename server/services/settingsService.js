const db = require('../database/db');

const getSettings = async (isDemo = 0) => {
  const demoFlag = isDemo ? 1 : 0;
  const [rows] = await db.query('SELECT * FROM settings WHERE is_demo = ? LIMIT 1', [demoFlag]);
  return rows[0] || null;
};

const updateSettings = async (data, isDemo = 0) => {
  const demoFlag = isDemo ? 1 : 0;
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    
    const [existing] = await connection.query('SELECT id FROM settings WHERE is_demo = ? LIMIT 1', [demoFlag]);
    
    if (existing.length === 0) {
      // Insert if not exists
      const fields = Object.keys(data).filter(key => !['id', 'created_at', 'updated_at'].includes(key));
      fields.push('is_demo');
      const values = [...fields.filter(f => f !== 'is_demo').map(key => data[key]), demoFlag];
      const placeholders = fields.map(() => '?').join(', ');
      
      await connection.query(
        `INSERT INTO settings (${fields.join(', ')}) VALUES (${placeholders})`,
        values
      );
    } else {
      // Update
      const fields = Object.keys(data).filter(key => !['id', 'created_at', 'updated_at', 'is_demo'].includes(key) && data[key] !== undefined);
      if (fields.length > 0) {
        const setClause = fields.map(key => `${key} = ?`).join(', ');
        const values = [...fields.map(key => data[key]), demoFlag];
        
        await connection.query(
          `UPDATE settings SET ${setClause} WHERE is_demo = ?`,
          values
        );
      }
    }
    
    await connection.commit();
    return await getSettings(isDemo);
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
