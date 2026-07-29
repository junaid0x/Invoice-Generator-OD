const db = require('../database/db');
const subscriptionService = require('./subscriptionService');

const getReportSummary = async (startDate, endDate, isDemo = 0) => {
  const demoFlag = isDemo ? 1 : 0;
  const whereConditions = ['is_demo = ?'];
  const queryParams = [demoFlag];

  if (startDate && endDate) {
    whereConditions.push('invoice_date BETWEEN ? AND ?');
    queryParams.push(startDate, endDate);
  }

  const dateFilter = 'WHERE ' + whereConditions.join(' AND ');

  // 1. Summary Cards
  const sqlSummary = `
    SELECT 
      SUM(CASE WHEN status = 'paid' THEN total ELSE 0 END) AS paid_amount,
      SUM(CASE WHEN status = 'pending' AND (due_date IS NULL OR due_date >= CURRENT_DATE()) THEN total ELSE 0 END) AS pending_amount,
      SUM(CASE WHEN status != 'paid' AND due_date IS NOT NULL AND due_date < CURRENT_DATE() THEN total ELSE 0 END) AS overdue_amount
    FROM invoices
    ${dateFilter}
  `;
  const [[summaryRows]] = await db.query(sqlSummary, queryParams);
  
  const paid_amount = parseFloat(summaryRows.paid_amount || 0);
  const pending_amount = parseFloat(summaryRows.pending_amount || 0);
  const overdue_amount = parseFloat(summaryRows.overdue_amount || 0);
  const outstanding_amount = pending_amount + overdue_amount;
  const total_revenue = paid_amount;

  // 2. Invoice Statistics
  const sqlStats = `
    SELECT 
      COUNT(*) AS total_created,
      SUM(CASE WHEN status = 'draft' AND (due_date IS NULL OR due_date >= CURRENT_DATE()) THEN 1 ELSE 0 END) AS draft_count,
      SUM(CASE WHEN status = 'pending' AND (due_date IS NULL OR due_date >= CURRENT_DATE()) THEN 1 ELSE 0 END) AS pending_count,
      SUM(CASE WHEN status = 'paid' THEN 1 ELSE 0 END) AS paid_count,
      SUM(CASE WHEN status != 'paid' AND due_date IS NOT NULL AND due_date < CURRENT_DATE() THEN 1 ELSE 0 END) AS overdue_count
    FROM invoices
    ${dateFilter}
  `;
  const [[statsRows]] = await db.query(sqlStats, queryParams);

  // 3. Top Customers
  const custConditions = ['i.is_demo = ?'];
  const custQueryParams = [demoFlag];
  if (startDate && endDate) {
    custConditions.push('i.invoice_date BETWEEN ? AND ?');
    custQueryParams.push(startDate, endDate);
  }
  
  const sqlCustomers = `
    SELECT 
      c.company_name,
      COUNT(i.id) AS invoices_count,
      SUM(CASE WHEN i.status = 'paid' THEN i.total ELSE 0 END) AS revenue_generated
    FROM customers c
    JOIN invoices i ON c.id = i.customer_id
    WHERE ${custConditions.join(' AND ')}
    GROUP BY c.id
    ORDER BY revenue_generated DESC
    LIMIT 5
  `;
  const [topCustomers] = await db.query(sqlCustomers, custQueryParams);

  // 4. Currency
  const [[settings]] = await db.query(`SELECT currency FROM settings WHERE is_demo = ? LIMIT 1`, [demoFlag]);
  const currency = settings?.currency || 'CAD';

  // 5. Subscription Stats
  const allSubs = await subscriptionService.getAllSubscriptions(isDemo);
  const subscriptionStats = {
    total: allSubs.length,
    hosting: allSubs.filter(s => s.service_type === 'Hosting').length,
    email: allSubs.filter(s => s.service_type === 'Business Email').length,
    maintenance: allSubs.filter(s => s.service_type === 'Website Maintenance').length,
    expiring_soon: allSubs.filter(s => ['Expiring Soon', 'Free Maintenance ending soon'].includes(s.status) || (s.days_remaining !== null && s.days_remaining <= 30 && s.days_remaining >= 0)).length,
    expired: allSubs.filter(s => ['Expired', 'Maintenance Contract Expired', 'No Active Contract'].includes(s.status) || (s.days_remaining !== null && s.days_remaining < 0)).length,
  };

  return {
    summary: {
      total_revenue,
      outstanding_amount,
      paid_amount,
      pending_amount,
      overdue_amount
    },
    statistics: {
      total_created: parseInt(statsRows.total_created || 0, 10),
      draft_count: parseInt(statsRows.draft_count || 0, 10),
      pending_count: parseInt(statsRows.pending_count || 0, 10),
      paid_count: parseInt(statsRows.paid_count || 0, 10),
      overdue_count: parseInt(statsRows.overdue_count || 0, 10)
    },
    topCustomers: topCustomers.map(c => ({
      ...c,
      revenue_generated: parseFloat(c.revenue_generated || 0)
    })),
    currency,
    subscriptionStats
  };
};

const getRevenueBreakdown = async (isDemo = 0) => {
  const demoFlag = isDemo ? 1 : 0;
  const currentYear = new Date().getFullYear();
  
  const sql = `
    SELECT 
      MONTH(invoice_date) AS month,
      SUM(total) AS revenue
    FROM invoices
    WHERE status = 'paid' AND YEAR(invoice_date) = ? AND is_demo = ?
    GROUP BY MONTH(invoice_date)
    ORDER BY month ASC
  `;
  const [rows] = await db.query(sql, [currentYear, demoFlag]);
  
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const revenueData = monthNames.map((name, index) => {
    const monthData = rows.find(r => r.month === index + 1);
    return {
      month: name,
      revenue: monthData ? parseFloat(monthData.revenue) : 0
    };
  });

  return revenueData;
};

module.exports = {
  getReportSummary,
  getRevenueBreakdown
};

