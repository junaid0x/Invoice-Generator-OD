const db = require('../database/db');

const generateInvoiceNumber = async () => {
  const [settings] = await db.query('SELECT invoice_prefix, starting_number FROM settings WHERE id = 1');
  const prefix = settings[0]?.invoice_prefix || 'OD-';
  const startNum = settings[0]?.starting_number || 1;
  
  const [rows] = await db.query(
    `SELECT invoice_number FROM invoices WHERE invoice_number LIKE ? ORDER BY id DESC LIMIT 1`,
    [`${prefix}%`]
  );
  
  if (rows.length === 0) {
    return `${prefix}${String(startNum).padStart(4, '0')}`;
  }
  
  const lastNumberStr = rows[0].invoice_number.replace(prefix, '');
  const nextNumber = Math.max(parseInt(lastNumberStr, 10) + 1, startNum);
  const paddedNumber = String(nextNumber).padStart(4, '0');
  return `${prefix}${paddedNumber}`;
};

const getAllInvoices = async (page = 1, limit = 10, search = '', status = 'All') => {
  const offset = (page - 1) * limit;
  let queryStr = `
    SELECT i.*, c.company_name as customer_name 
    FROM invoices i 
    LEFT JOIN customers c ON i.customer_id = c.id
  `;
  let countStr = `
    SELECT COUNT(*) as total 
    FROM invoices i 
    LEFT JOIN customers c ON i.customer_id = c.id
  `;
  
  const queryParams = [];
  const whereClauses = [];

  if (search) {
    whereClauses.push(`(i.invoice_number LIKE ? OR c.company_name LIKE ?)`);
    const searchParam = `%${search}%`;
    queryParams.push(searchParam, searchParam);
  }

  if (status && status !== 'All') {
    whereClauses.push(`i.status = ?`);
    queryParams.push(status.toLowerCase());
  }

  if (whereClauses.length > 0) {
    const whereStr = ` WHERE ` + whereClauses.join(' AND ');
    queryStr += whereStr;
    countStr += whereStr;
  }
  
  queryStr += ` ORDER BY i.created_at DESC LIMIT ? OFFSET ?`;

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

const getInvoiceById = async (id) => {
  const [invoices] = await db.query(`
    SELECT i.*, c.company_name as customer_name, c.email as customer_email, c.address as customer_address 
    FROM invoices i 
    LEFT JOIN customers c ON i.customer_id = c.id 
    WHERE i.id = ?
  `, [id]);
  
  if (invoices.length === 0) return null;
  const invoice = invoices[0];
  
  const [items] = await db.query(`SELECT * FROM invoice_items WHERE invoice_id = ?`, [id]);
  invoice.items = items;
  
  return invoice;
};

const createInvoice = async (data) => {
  const { customer_id, invoice_date, due_date, currency, subtotal, tax, discount, shipping, total, status, notes, terms, items } = data;
  
  const invoice_number = await generateInvoiceNumber();
  
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    
    const [settings] = await connection.query('SELECT currency FROM settings WHERE id = 1');
    const defaultCurrency = settings[0]?.currency || 'CAD';

    const [result] = await connection.query(
      `INSERT INTO invoices 
      (invoice_number, customer_id, invoice_date, due_date, currency, subtotal, tax, discount, shipping, total, status, notes, terms) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [invoice_number, customer_id, invoice_date, due_date, currency || defaultCurrency, subtotal || 0, tax || 0, discount || 0, shipping || 0, total || 0, status || 'draft', notes || '', terms || '']
    );
    
    const invoiceId = result.insertId;
    
    if (items && items.length > 0) {
      for (const item of items) {
        await connection.query(
          `INSERT INTO invoice_items (invoice_id, description, quantity, rate, amount) VALUES (?, ?, ?, ?, ?)`,
          [invoiceId, item.description, item.quantity, item.rate, item.amount]
        );
      }
    }
    
    await connection.commit();
    return invoiceId;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const updateInvoice = async (id, data) => {
  const { customer_id, invoice_date, due_date, currency, subtotal, tax, discount, shipping, total, status, notes, terms, items } = data;
  
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    
    const fields = [];
    const values = [];
    
    if (customer_id !== undefined) { fields.push('customer_id = ?'); values.push(customer_id); }
    if (invoice_date !== undefined) { fields.push('invoice_date = ?'); values.push(invoice_date); }
    if (due_date !== undefined) { fields.push('due_date = ?'); values.push(due_date); }
    if (currency !== undefined) { fields.push('currency = ?'); values.push(currency); }
    if (subtotal !== undefined) { fields.push('subtotal = ?'); values.push(subtotal); }
    if (tax !== undefined) { fields.push('tax = ?'); values.push(tax); }
    if (discount !== undefined) { fields.push('discount = ?'); values.push(discount); }
    if (shipping !== undefined) { fields.push('shipping = ?'); values.push(shipping); }
    if (total !== undefined) { fields.push('total = ?'); values.push(total); }
    if (status !== undefined) { fields.push('status = ?'); values.push(status); }
    if (notes !== undefined) { fields.push('notes = ?'); values.push(notes); }
    if (terms !== undefined) { fields.push('terms = ?'); values.push(terms); }
    
    if (fields.length > 0) {
      values.push(id);
      await connection.query(
        `UPDATE invoices SET ${fields.join(', ')} WHERE id = ?`,
        values
      );
    }
    
    if (items !== undefined) {
      await connection.query(`DELETE FROM invoice_items WHERE invoice_id = ?`, [id]);
      if (items.length > 0) {
        for (const item of items) {
          await connection.query(
            `INSERT INTO invoice_items (invoice_id, description, quantity, rate, amount) VALUES (?, ?, ?, ?, ?)`,
            [id, item.description, item.quantity, item.rate, item.amount]
          );
        }
      }
    }
    
    await connection.commit();
    return true;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const duplicateInvoice = async (id) => {
  const original = await getInvoiceById(id);
  if (!original) throw new Error('Invoice not found');
  
  const invoiceData = {
    ...original,
    invoice_date: new Date().toISOString().split('T')[0],
    status: 'draft',
  };
  
  const newId = await createInvoice(invoiceData);
  return newId;
};

const deleteInvoice = async (id) => {
  const [result] = await db.query('DELETE FROM invoices WHERE id = ?', [id]);
  return result.affectedRows > 0;
};

module.exports = {
  getAllInvoices,
  getInvoiceById,
  createInvoice,
  updateInvoice,
  duplicateInvoice,
  deleteInvoice
};
