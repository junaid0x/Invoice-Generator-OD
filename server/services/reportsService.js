const db = require('../database/db');

const getReportSummary = async (startDate, endDate) => {
  let dateFilter = '';
  const queryParams = [];

  if (startDate && endDate) {
    dateFilter = 'WHERE invoice_date BETWEEN ? AND ?';
    queryParams.push(startDate, endDate);
  }

  // 1. Summary Cards
  const sqlSummary = `
    SELECT 
      SUM(CASE WHEN status = 'paid' THEN total ELSE 0 END) AS paid_amount,
      SUM(CASE WHEN status = 'pending' AND due_date >= CURRENT_DATE() THEN total ELSE 0 END) AS pending_amount,
      SUM(CASE WHEN status = 'pending' AND due_date < CURRENT_DATE() THEN total ELSE 0 END) AS overdue_amount
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
      SUM(CASE WHEN status = 'draft' THEN 1 ELSE 0 END) AS draft_count,
      SUM(CASE WHEN status = 'pending' AND due_date >= CURRENT_DATE() THEN 1 ELSE 0 END) AS pending_count,
      SUM(CASE WHEN status = 'paid' THEN 1 ELSE 0 END) AS paid_count,
      SUM(CASE WHEN status = 'pending' AND due_date < CURRENT_DATE() THEN 1 ELSE 0 END) AS overdue_count
    FROM invoices
    ${dateFilter}
  `;
  const [[statsRows]] = await db.query(sqlStats, queryParams);

  // 3. Top Customers
  let customerDateFilter = '';
  if (startDate && endDate) {
    customerDateFilter = 'WHERE i.invoice_date BETWEEN ? AND ?';
  }
  
  const sqlCustomers = `
    SELECT 
      c.company_name,
      COUNT(i.id) AS invoices_count,
      SUM(CASE WHEN i.status = 'paid' THEN i.total ELSE 0 END) AS revenue_generated
    FROM customers c
    JOIN invoices i ON c.id = i.customer_id
    ${customerDateFilter}
    GROUP BY c.id
    ORDER BY revenue_generated DESC
    LIMIT 5
  `;
  const [topCustomers] = await db.query(sqlCustomers, queryParams);

  // 4. Currency
  const [[settings]] = await db.query(`SELECT currency FROM settings WHERE id = 1`);
  const currency = settings?.currency || 'CAD';

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
    currency
  };
};

const getRevenueBreakdown = async () => {
  // Current year only
  const currentYear = new Date().getFullYear();
  
  const sql = `
    SELECT 
      MONTH(invoice_date) AS month,
      SUM(total) AS revenue
    FROM invoices
    WHERE status = 'paid' AND YEAR(invoice_date) = ?
    GROUP BY MONTH(invoice_date)
    ORDER BY month ASC
  `;
  const [rows] = await db.query(sql, [currentYear]);
  
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
