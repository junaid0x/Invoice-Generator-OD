const db = require('../database/db');

const getAllCustomers = async (page = 1, limit = null, search = '', isDemo = 0) => {
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
  
  queryStr += ' ORDER BY created_at DESC';
  
  const queryCountParams = [...queryParams];

  if (limit !== null && limit !== undefined && Number(limit) > 0) {
    const validPage = Number(page) > 0 ? Number(page) : 1;
    const offset = (validPage - 1) * Number(limit);
    queryStr += ' LIMIT ? OFFSET ?';
    queryParams.push(Number(limit), Number(offset));
  }

  const [[{ total }]] = await db.query(countStr, queryCountParams);
  const [rows] = await db.query(queryStr, queryParams);
  
  return {
    data: rows,
    meta: {
      total,
      page: limit ? Number(page || 1) : 1,
      limit: limit ? Number(limit) : total,
      totalPages: limit ? Math.ceil(total / Number(limit)) : 1
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

