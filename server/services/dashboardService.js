const db = require('../database/db');

const getDashboardData = async () => {
  try {
    // 1. Total Customers
    const [[{ total_customers }]] = await db.query(`SELECT COUNT(*) as total_customers FROM customers`);

    // Get currency from settings
    const [[settings]] = await db.query(`SELECT currency FROM settings WHERE id = 1`);
    const currency = settings?.currency || 'CAD';

    // 2. Total Invoices
    const [[{ total_invoices }]] = await db.query(`SELECT COUNT(*) as total_invoices FROM invoices`);

    // 3. Pending Invoices
    const [[{ pending_invoices }]] = await db.query(`SELECT COUNT(*) as pending_invoices FROM invoices WHERE status = 'pending'`);

    // 4. Overdue Invoices
    // Due Date < Today AND Status = Pending
    const [[{ overdue_invoices }]] = await db.query(`
      SELECT COUNT(*) as overdue_invoices 
      FROM invoices 
      WHERE status = 'pending' AND due_date < CURRENT_DATE()
    `);

    // 5. Total Revenue
    // Only count Paid invoices
    const [[{ total_revenue }]] = await db.query(`
      SELECT COALESCE(SUM(total), 0) as total_revenue 
      FROM invoices 
      WHERE status = 'paid'
    `);

    // 6. Recent Invoices (Latest 5)
    const [recent_invoices] = await db.query(`
      SELECT 
        i.id, 
        i.invoice_number, 
        i.invoice_date as date, 
        i.total as amount, 
        i.status, 
        c.company_name as customer 
      FROM invoices i 
      LEFT JOIN customers c ON i.customer_id = c.id 
      ORDER BY i.created_at DESC 
      LIMIT 5
    `);

    // 7. Recent Customers (Latest 5)
    const [recent_customers] = await db.query(`
      SELECT 
        id, 
        company_name, 
        contact_person, 
        email 
      FROM customers 
      ORDER BY created_at DESC 
      LIMIT 5
    `);

    return {
      topStats: {
        total_customers: parseInt(total_customers, 10),
        total_invoices: parseInt(total_invoices, 10),
        pending_invoices: parseInt(pending_invoices, 10),
        overdue_invoices: parseInt(overdue_invoices, 10),
        total_revenue: parseFloat(total_revenue),
        currency
      },
      recent_invoices,
      recent_customers
    };
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    throw error;
  }
};

module.exports = {
  getDashboardData
};
