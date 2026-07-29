const db = require('../database/db');

const getAllCustomers = async (page = 1, limit = 10, search = '', isDemo = 0) => {
  const offset = (page - 1) * limit;
  const demoFlag = isDemo ? 1 : 0;
  
  let queryStr = 'SELECT * FROM customers WHERE is_demo = ?';
  let countStr = 'SELECT COUNT(*) as total FROM customers WHERE is_demo = ?';
  const queryParams = [demoFlag];
  
  if (search) {
    const searchFilter = ` AND (company_name LIKE ? OR contact_person LIKE ? OR email LIKE ?)`;
    queryStr += searchFilter;
    countStr += searchFilter;
    const searchParam = `%${search}%`;
    queryParams.push(searchParam, searchParam, searchParam);
  }
  
  queryStr += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  
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

const getCustomerById = async (id, isDemo = 0) => {
  const demoFlag = isDemo ? 1 : 0;
  const [rows] = await db.query('SELECT * FROM customers WHERE id = ? AND is_demo = ?', [id, demoFlag]);
  return rows[0];
};

const createCustomer = async (data, isDemo = 0) => {
  const demoFlag = isDemo ? 1 : 0;
  const { company_name, contact_person, email, phone, address, city, province, country, postal_code, notes } = data;
  const [result] = await db.query(
    `INSERT INTO customers 
    (company_name, contact_person, email, phone, address, city, province, country, postal_code, notes, is_demo) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [company_name, contact_person, email, phone, address, city, province, country, postal_code, notes, demoFlag]
  );
  return result.insertId;
};

const updateCustomer = async (id, data, isDemo = 0) => {
  const demoFlag = isDemo ? 1 : 0;
  const { company_name, contact_person, email, phone, address, city, province, country, postal_code, notes } = data;
  const [result] = await db.query(
    `UPDATE customers 
    SET company_name = ?, contact_person = ?, email = ?, phone = ?, address = ?, city = ?, province = ?, country = ?, postal_code = ?, notes = ? 
    WHERE id = ? AND is_demo = ?`,
    [company_name, contact_person, email, phone, address, city, province, country, postal_code, notes, id, demoFlag]
  );
  return result.affectedRows > 0;
};

const deleteCustomer = async (id, isDemo = 0) => {
  const demoFlag = isDemo ? 1 : 0;
  const [result] = await db.query('DELETE FROM customers WHERE id = ? AND is_demo = ?', [id, demoFlag]);
  return result.affectedRows > 0;
};

module.exports = {
  getAllCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer
};

