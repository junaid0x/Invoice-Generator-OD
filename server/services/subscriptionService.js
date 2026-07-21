const db = require('../database/db');

// Helper to calculate status on the fly
const calculateStatus = (sub) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (sub.service_type === 'Website Maintenance') {
    if (sub.contract_start && sub.contract_end) {
      const contractEnd = new Date(sub.contract_end);
      if (contractEnd >= today) return 'Active Contract';
      return 'Maintenance Contract Expired';
    } else {
      const purchaseDate = new Date(sub.purchase_date);
      // Complimentary period is 3 months
      const compEnd = new Date(purchaseDate);
      compEnd.setMonth(compEnd.getMonth() + 3);
      if (compEnd >= today) return 'Free Maintenance';
      return 'No Active Contract';
    }
  } else {
    // Hosting & Business Email
    if (!sub.renewal_date) return 'Active';
    const renewalDate = new Date(sub.renewal_date);
    const diffTime = renewalDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'Expired';
    if (diffDays <= 30) return 'Expiring Soon';
    return 'Active';
  }
};

const getDaysRemaining = (sub) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let targetDate = null;

  if (sub.service_type === 'Website Maintenance') {
    if (sub.contract_start && sub.contract_end) {
      targetDate = new Date(sub.contract_end);
    } else {
      const purchaseDate = new Date(sub.purchase_date);
      targetDate = new Date(purchaseDate);
      targetDate.setMonth(targetDate.getMonth() + 3);
    }
  } else {
    if (!sub.renewal_date) return null;
    targetDate = new Date(sub.renewal_date);
  }

  const diffTime = targetDate - today;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

const getAllSubscriptions = async () => {
  const [rows] = await db.query(`
    SELECT s.*, c.company_name as customer_name, c.email as customer_email 
    FROM subscriptions s 
    LEFT JOIN customers c ON s.customer_id = c.id 
    ORDER BY s.created_at DESC
  `);
  
  // Compute statuses dynamically
  const enhanced = rows.map(r => ({
    ...r,
    status: calculateStatus(r),
    days_remaining: getDaysRemaining(r)
  }));

  return enhanced;
};

const getSubscriptionById = async (id) => {
  const [rows] = await db.query(`
    SELECT s.*, c.company_name as customer_name 
    FROM subscriptions s 
    LEFT JOIN customers c ON s.customer_id = c.id 
    WHERE s.id = ?
  `, [id]);

  if (rows.length === 0) return null;
  const sub = rows[0];
  sub.status = calculateStatus(sub);
  sub.days_remaining = getDaysRemaining(sub);

  const [history] = await db.query(`SELECT * FROM subscription_history WHERE subscription_id = ? ORDER BY created_at DESC`, [id]);
  sub.history = history;

  return sub;
};

const createSubscription = async (data) => {
  const { customer_id, service_type, service_name, service_identifier, provider, price, purchase_date, renewal_date, notes } = data;
  
  const [result] = await db.query(
    `INSERT INTO subscriptions (customer_id, service_type, service_name, service_identifier, provider, price, purchase_date, renewal_date, notes) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [customer_id, service_type, service_name, service_identifier, provider, price || 0, purchase_date, renewal_date || null, notes || '']
  );
  return result.insertId;
};

const updateSubscription = async (id, data) => {
  const { customer_id, service_type, service_name, service_identifier, provider, price, purchase_date, renewal_date, contract_start, contract_end, notes } = data;
  
  const fields = [];
  const values = [];

  if (customer_id !== undefined) { fields.push('customer_id = ?'); values.push(customer_id); }
  if (service_type !== undefined) { fields.push('service_type = ?'); values.push(service_type); }
  if (service_name !== undefined) { fields.push('service_name = ?'); values.push(service_name); }
  if (service_identifier !== undefined) { fields.push('service_identifier = ?'); values.push(service_identifier); }
  if (provider !== undefined) { fields.push('provider = ?'); values.push(provider); }
  if (price !== undefined) { fields.push('price = ?'); values.push(price); }
  if (purchase_date !== undefined) { fields.push('purchase_date = ?'); values.push(purchase_date); }
  if (renewal_date !== undefined) { fields.push('renewal_date = ?'); values.push(renewal_date); }
  if (contract_start !== undefined) { fields.push('contract_start = ?'); values.push(contract_start); }
  if (contract_end !== undefined) { fields.push('contract_end = ?'); values.push(contract_end); }
  if (notes !== undefined) { fields.push('notes = ?'); values.push(notes); }

  if (fields.length === 0) return true;

  values.push(id);
  const [result] = await db.query(`UPDATE subscriptions SET ${fields.join(', ')} WHERE id = ?`, values);
  return result.affectedRows > 0;
};

const deleteSubscription = async (id) => {
  const [result] = await db.query('DELETE FROM subscriptions WHERE id = ?', [id]);
  return result.affectedRows > 0;
};

const renewSubscription = async (id, data) => {
  const { renewal_date, price, notes } = data;
  
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    
    // Save to history
    await connection.query(
      `INSERT INTO subscription_history (subscription_id, renewal_date, amount, notes) VALUES (?, ?, ?, ?)`,
      [id, renewal_date, price || 0, notes || '']
    );

    // Update main subscription
    await connection.query(
      `UPDATE subscriptions SET renewal_date = ?, price = ? WHERE id = ?`,
      [renewal_date, price || 0, id]
    );

    await connection.commit();
    return true;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const activateMaintenanceContract = async (id, data) => {
  const { contract_start, contract_end, price, notes } = data;
  
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    await connection.query(
      `INSERT INTO subscription_history (subscription_id, renewal_date, amount, notes) VALUES (?, ?, ?, ?)`,
      [id, contract_start, price || 0, notes || 'Maintenance Contract Activated']
    );

    await connection.query(
      `UPDATE subscriptions SET contract_start = ?, contract_end = ?, price = ? WHERE id = ?`,
      [contract_start, contract_end, price || 0, id]
    );

    await connection.commit();
    return true;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

module.exports = {
  getAllSubscriptions,
  getSubscriptionById,
  createSubscription,
  updateSubscription,
  deleteSubscription,
  renewSubscription,
  activateMaintenanceContract,
  calculateStatus,
  getDaysRemaining
};
