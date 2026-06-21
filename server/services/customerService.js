const db = require('../database/db');

const getAllCustomers = async (page = 1, limit = 10, search = '') => {
  const offset = (page - 1) * limit;
  
  let queryStr = 'SELECT * FROM customers';
  let countStr = 'SELECT COUNT(*) as total FROM customers';
  const queryParams = [];
  
  if (search) {
    const searchFilter = ` WHERE company_name LIKE ? OR contact_person LIKE ? OR email LIKE ?`;
    queryStr += searchFilter;
    countStr += searchFilter;
    const searchParam = `%${search}%`;
    queryParams.push(searchParam, searchParam, searchParam);
  }
  
  queryStr += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  
  // Note: limit and offset must be numbers for mysql2 if not cast explicitly,
  // but mysql2 handles them if we cast them or strictly pass numbers.
  const [[{ total }]] = await db.query(countStr, queryParams);
  const [rows] = await db.query(queryStr, [...queryParams, Number(limit), Number(offset)]);
  
  return {
    data: rows,
    meta: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit)
    }
  };
};

const getCustomerById = async (id) => {
  const [rows] = await db.query('SELECT * FROM customers WHERE id = ?', [id]);
  return rows[0];
};

const createCustomer = async (data) => {
  const { company_name, contact_person, email, phone, address, city, province, country, postal_code, notes } = data;
  const [result] = await db.query(
    `INSERT INTO customers 
    (company_name, contact_person, email, phone, address, city, province, country, postal_code, notes) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [company_name, contact_person, email, phone, address, city, province, country, postal_code, notes]
  );
  return result.insertId;
};

const updateCustomer = async (id, data) => {
  const { company_name, contact_person, email, phone, address, city, province, country, postal_code, notes } = data;
  const [result] = await db.query(
    `UPDATE customers 
    SET company_name = ?, contact_person = ?, email = ?, phone = ?, address = ?, city = ?, province = ?, country = ?, postal_code = ?, notes = ? 
    WHERE id = ?`,
    [company_name, contact_person, email, phone, address, city, province, country, postal_code, notes, id]
  );
  return result.affectedRows > 0;
};

const deleteCustomer = async (id) => {
  const [result] = await db.query('DELETE FROM customers WHERE id = ?', [id]);
  return result.affectedRows > 0;
};

module.exports = {
  getAllCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer
};
