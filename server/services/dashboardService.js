const db = require('../database/db');
const subscriptionService = require('./subscriptionService');

const getDashboardData = async (isDemo = 0) => {
  try {
    const demoFlag = isDemo ? 1 : 0;

    // 1. Total Customers
    const [[{ total_customers }]] = await db.query(`SELECT COUNT(*) as total_customers FROM customers WHERE is_demo = ?`, [demoFlag]);

    // Get currency from settings
    const [[settings]] = await db.query(`SELECT currency FROM settings WHERE is_demo = ? LIMIT 1`, [demoFlag]);
    const currency = settings?.currency || 'CAD';

    // 2. Total Invoices
    const [[{ total_invoices }]] = await db.query(`SELECT COUNT(*) as total_invoices FROM invoices WHERE is_demo = ?`, [demoFlag]);

    // 3. Pending Invoices
    const [[{ pending_invoices }]] = await db.query(`SELECT COUNT(*) as pending_invoices FROM invoices WHERE status = 'pending' AND is_demo = ?`, [demoFlag]);

    // 4. Overdue Invoices
    const [[{ overdue_invoices }]] = await db.query(`
      SELECT COUNT(*) as overdue_invoices 
      FROM invoices 
      WHERE (status = 'overdue' OR (status = 'pending' AND due_date < CURRENT_DATE())) AND is_demo = ?
    `, [demoFlag]);

    // 5. Total Revenue
    const [[{ total_revenue }]] = await db.query(`
      SELECT COALESCE(SUM(total), 0) as total_revenue 
      FROM invoices 
      WHERE status = 'paid' AND is_demo = ?
    `, [demoFlag]);

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
      WHERE i.is_demo = ?
      ORDER BY i.created_at DESC 
      LIMIT 5
    `, [demoFlag]);

    // 7. Recent Customers (Latest 5)
    const [recent_customers] = await db.query(`
      SELECT 
        id, 
        company_name, 
        contact_person, 
        email 
      FROM customers 
      WHERE is_demo = ?
      ORDER BY created_at DESC 
      LIMIT 5
    `, [demoFlag]);

    // 8. Upcoming Renewals (Subscriptions expiring within 30 days)
    const allSubs = await subscriptionService.getAllSubscriptions(isDemo);
    const upcoming_renewals = allSubs
      .filter(s => s.days_remaining !== null && s.days_remaining >= 0 && s.days_remaining <= 30)
      .sort((a, b) => a.days_remaining - b.days_remaining)
      .slice(0, 5);

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
      recent_customers,
      upcoming_renewals
    };
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    throw error;
  }
};

module.exports = {
  getDashboardData
};
