const db = require('../database/db');
const bcrypt = require('bcrypt');

/**
 * Ensures the demo user admin@example.com exists in the users table.
 */
const initDemoUser = async () => {
  try {
    const [users] = await db.query('SELECT id FROM users WHERE email = ?', ['admin@example.com']);
    if (users.length === 0) {
      const hashedPassword = await bcrypt.hash('admin', 10);
      await db.query(
        'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
        ['Demo Admin', 'admin@example.com', hashedPassword, 'admin']
      );
      console.log('Seeded default demo user: admin@example.com');
    }
  } catch (error) {
    console.error('Failed to seed demo user:', error);
  }
};

/**
 * Recreates or restores the isolated demo dataset (is_demo = 1).
 */
const seedOrResetDemoData = async () => {
  try {
    // 1. Clear old demo data safely
    const [demoInvoices] = await db.query('SELECT id FROM invoices WHERE is_demo = 1');
    const demoInvoiceIds = demoInvoices.map(inv => inv.id);
    if (demoInvoiceIds.length > 0) {
      await db.query('DELETE FROM invoice_items WHERE invoice_id IN (?)', [demoInvoiceIds]);
    }
    await db.query('DELETE FROM invoices WHERE is_demo = 1');
    await db.query('DELETE FROM subscriptions WHERE is_demo = 1');
    await db.query('DELETE FROM customers WHERE is_demo = 1');
    await db.query('DELETE FROM settings WHERE is_demo = 1');

    // 2. Insert 5 Demo Customers
    const customerList = [
      { company_name: 'Apex Digital Solutions', contact_person: 'John Doe', email: 'john@apexdigital.com', phone: '(555) 234-5678', address: '100 Main St', city: 'Toronto', province: 'ON', country: 'Canada', postal_code: 'M5V 2T6', notes: 'Key enterprise client for custom development' },
      { company_name: 'BlueWave Technologies', contact_person: 'Sarah Smith', email: 'sarah@bluewave.io', phone: '(555) 345-6789', address: '250 Tech Alley', city: 'Vancouver', province: 'BC', country: 'Canada', postal_code: 'V6B 1A1', notes: 'Retainer client for web application maintenance' },
      { company_name: 'Crestview Media', contact_person: 'Michael Brown', email: 'michael@crestviewmedia.com', phone: '(555) 456-7890', address: '45 Creative Way', city: 'Montreal', province: 'QC', country: 'Canada', postal_code: 'H3B 2Y5', notes: 'Marketing agency partner' },
      { company_name: 'Nova Core Labs', contact_person: 'Emily Davis', email: 'emily@novacore.com', phone: '(555) 567-8901', address: '88 Innovation Blvd', city: 'Ottawa', province: 'ON', country: 'Canada', postal_code: 'K1P 1J1', notes: 'Biotech startup - web & email management' },
      { company_name: 'Zenith Enterprises', contact_person: 'Robert Wilson', email: 'robert@zenithenterprises.com', phone: '(555) 678-9012', address: '500 Corporate Dr', city: 'Calgary', province: 'AB', country: 'Canada', postal_code: 'T2P 2M5', notes: 'Cloud infrastructure hosting client' }
    ];

    const customerIds = [];
    for (const cust of customerList) {
      const [res] = await db.query(
        `INSERT INTO customers 
        (company_name, contact_person, email, phone, address, city, province, country, postal_code, notes, is_demo)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
        [cust.company_name, cust.contact_person, cust.email, cust.phone, cust.address, cust.city, cust.province, cust.country, cust.postal_code, cust.notes]
      );
      customerIds.push({ name: cust.company_name, id: res.insertId });
    }

    const custMap = Object.fromEntries(customerIds.map(item => [item.name, item.id]));

    // 3. Insert 10 Demo Invoices with items
    const today = new Date();
    const formatDateStr = (daysOffset) => {
      const d = new Date(today);
      d.setDate(d.getDate() + daysOffset);
      return d.toISOString().split('T')[0];
    };

    const invoiceList = [
      {
        invoice_number: 'DEMO-INV-001',
        customer_id: custMap['Apex Digital Solutions'],
        invoice_date: formatDateStr(-30),
        due_date: formatDateStr(-15),
        currency: 'CAD',
        status: 'paid',
        subtotal: 4500.00, tax: 585.00, discount: 0, shipping: 0, total: 5085.00,
        items: [
          { description: 'Custom Web Application Development - Phase 1', quantity: 1, rate: 3500.00, amount: 3500.00 },
          { description: 'Cloud Infrastructure Setup & CI/CD Pipeline', quantity: 1, rate: 1000.00, amount: 1000.00 }
        ]
      },
      {
        invoice_number: 'DEMO-INV-002',
        customer_id: custMap['BlueWave Technologies'],
        invoice_date: formatDateStr(-25),
        due_date: formatDateStr(-10),
        currency: 'CAD',
        status: 'paid',
        subtotal: 1800.00, tax: 234.00, discount: 100.00, shipping: 0, total: 1934.00,
        items: [
          { description: 'UI/UX Redesign & Frontend Modernization', quantity: 20, rate: 90.00, amount: 1800.00 }
        ]
      },
      {
        invoice_number: 'DEMO-INV-003',
        customer_id: custMap['Crestview Media'],
        invoice_date: formatDateStr(-20),
        due_date: formatDateStr(-5),
        currency: 'CAD',
        status: 'overdue',
        subtotal: 2200.00, tax: 286.00, discount: 0, shipping: 0, total: 2486.00,
        items: [
          { description: 'E-commerce Platform Migration & Payment Gateway Integration', quantity: 1, rate: 2200.00, amount: 2200.00 }
        ]
      },
      {
        invoice_number: 'DEMO-INV-004',
        customer_id: custMap['Nova Core Labs'],
        invoice_date: formatDateStr(-15),
        due_date: formatDateStr(15),
        currency: 'CAD',
        status: 'pending',
        subtotal: 1250.00, tax: 162.50, discount: 0, shipping: 0, total: 1412.50,
        items: [
          { description: 'RESTful API Development & Third-party Service Sync', quantity: 10, rate: 125.00, amount: 1250.00 }
        ]
      },
      {
        invoice_number: 'DEMO-INV-005',
        customer_id: custMap['Zenith Enterprises'],
        invoice_date: formatDateStr(-10),
        due_date: formatDateStr(20),
        currency: 'CAD',
        status: 'pending',
        subtotal: 6800.00, tax: 884.00, discount: 300.00, shipping: 0, total: 7384.00,
        items: [
          { description: 'Enterprise Portal Architecture & Security Audit', quantity: 1, rate: 5000.00, amount: 5000.00 },
          { description: 'Database Clustering & Performance Tuning', quantity: 1, rate: 1800.00, amount: 1800.00 }
        ]
      },
      {
        invoice_number: 'DEMO-INV-006',
        customer_id: custMap['Apex Digital Solutions'],
        invoice_date: formatDateStr(-5),
        due_date: formatDateStr(25),
        currency: 'CAD',
        status: 'pending',
        subtotal: 950.00, tax: 123.50, discount: 0, shipping: 0, total: 1073.50,
        items: [
          { description: 'Monthly System Maintenance & Security Patches', quantity: 1, rate: 950.00, amount: 950.00 }
        ]
      },
      {
        invoice_number: 'DEMO-INV-007',
        customer_id: custMap['BlueWave Technologies'],
        invoice_date: formatDateStr(-2),
        due_date: formatDateStr(28),
        currency: 'CAD',
        status: 'draft',
        subtotal: 3100.00, tax: 403.00, discount: 0, shipping: 0, total: 3503.00,
        items: [
          { description: 'Mobile Application Companion Development', quantity: 1, rate: 3100.00, amount: 3100.00 }
        ]
      },
      {
        invoice_number: 'DEMO-INV-008',
        customer_id: custMap['Crestview Media'],
        invoice_date: formatDateStr(-40),
        due_date: formatDateStr(-10),
        currency: 'CAD',
        status: 'overdue',
        subtotal: 1400.00, tax: 182.00, discount: 0, shipping: 0, total: 1582.00,
        items: [
          { description: 'SEO Optimization & Core Web Vitals Performance Audit', quantity: 1, rate: 1400.00, amount: 1400.00 }
        ]
      },
      {
        invoice_number: 'DEMO-INV-009',
        customer_id: custMap['Nova Core Labs'],
        invoice_date: formatDateStr(-1),
        due_date: formatDateStr(29),
        currency: 'CAD',
        status: 'draft',
        subtotal: 750.00, tax: 97.50, discount: 0, shipping: 0, total: 847.50,
        items: [
          { description: 'Domain Setup & Business Email Migrations', quantity: 5, rate: 150.00, amount: 750.00 }
        ]
      },
      {
        invoice_number: 'DEMO-INV-10',
        customer_id: custMap['Zenith Enterprises'],
        invoice_date: formatDateStr(-60),
        due_date: formatDateStr(-45),
        currency: 'CAD',
        status: 'paid',
        subtotal: 10500.00, tax: 1365.00, discount: 500.00, shipping: 0, total: 11365.00,
        items: [
          { description: 'Full Platform Initial Build & Scalability Enhancements', quantity: 1, rate: 10500.00, amount: 10500.00 }
        ]
      }
    ];

    for (const inv of invoiceList) {
      const [res] = await db.query(
        `INSERT INTO invoices 
        (invoice_number, customer_id, invoice_date, due_date, currency, status, subtotal, tax, discount, shipping, total, is_demo)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
        [inv.invoice_number, inv.customer_id, inv.invoice_date, inv.due_date, inv.currency, inv.status, inv.subtotal, inv.tax, inv.discount, inv.shipping, inv.total]
      );
      
      const invId = res.insertId;
      for (const item of inv.items) {
        await db.query(
          `INSERT INTO invoice_items (invoice_id, description, quantity, rate, amount) VALUES (?, ?, ?, ?, ?)`,
          [invId, item.description, item.quantity, item.rate, item.amount]
        );
      }
    }

    // 4. Insert 7 Demo Subscriptions (3 Hosting, 2 Email, 2 Maintenance)
    const subscriptionList = [
      { customer_id: custMap['Apex Digital Solutions'], service_type: 'Hosting', service_name: 'Cloud Hosting Pro', service_identifier: 'apex-cloud-01.oceandev.com', provider: 'AWS Canada', price: 120.00, purchase_date: formatDateStr(-180), renewal_date: formatDateStr(15) },
      { customer_id: custMap['BlueWave Technologies'], service_type: 'Hosting', service_name: 'Managed VPS Server', service_identifier: 'vps.bluewave.io', provider: 'DigitalOcean', price: 85.00, purchase_date: formatDateStr(-200), renewal_date: formatDateStr(45) },
      { customer_id: custMap['Zenith Enterprises'], service_type: 'Hosting', service_name: 'Enterprise Dedicated Server', service_identifier: 'dedicated.zenith.com', provider: 'Linode', price: 250.00, purchase_date: formatDateStr(-300), renewal_date: formatDateStr(-5) }, // Expired
      { customer_id: custMap['Apex Digital Solutions'], service_type: 'Business Email', service_name: 'Google Workspace (5 Users)', service_identifier: 'gsuite.apexdigital.com', provider: 'Google', price: 45.00, purchase_date: formatDateStr(-150), renewal_date: formatDateStr(30) },
      { customer_id: custMap['Nova Core Labs'], service_type: 'Business Email', service_name: 'Microsoft 365 Business Premium', service_identifier: 'm365.novacore.com', provider: 'Microsoft', price: 60.00, purchase_date: formatDateStr(-90), renewal_date: formatDateStr(5) }, // Expiring soon
      { customer_id: custMap['Crestview Media'], service_type: 'Website Maintenance', service_name: 'Monthly Security & Backups', service_identifier: 'crestviewmedia.com', provider: 'Ocean Developers', price: 150.00, purchase_date: formatDateStr(-120), contract_start: formatDateStr(-120), contract_end: formatDateStr(60) },
      { customer_id: custMap['BlueWave Technologies'], service_type: 'Website Maintenance', service_name: 'Priority Support & SLA Contract', service_identifier: 'app.bluewave.io', provider: 'Ocean Developers', price: 300.00, purchase_date: formatDateStr(-365), contract_start: formatDateStr(-365), contract_end: formatDateStr(-10) } // Maintenance contract expired
    ];

    for (const sub of subscriptionList) {
      await db.query(
        `INSERT INTO subscriptions 
        (customer_id, service_type, service_name, service_identifier, provider, price, purchase_date, renewal_date, contract_start, contract_end, is_demo)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
        [sub.customer_id, sub.service_type, sub.service_name, sub.service_identifier, sub.provider, sub.price, sub.purchase_date, sub.renewal_date || null, sub.contract_start || null, sub.contract_end || null]
      );
    }

    // 5. Insert Demo Settings
    await db.query(
      `INSERT INTO settings 
      (company_name, company_email, company_phone, company_address, currency, default_tax, invoice_prefix, starting_number, is_demo)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      ['Ocean Developers Demo Studio', 'admin@example.com', '(555) 000-DEMO', '100 Tech Park, Suite 400', 'CAD', 13.00, 'DEMO-INV-', 1001]
    );

    console.log('Successfully seeded demo workspace data!');
  } catch (error) {
    console.error('Error seeding demo workspace data:', error);
  }
};

module.exports = {
  initDemoUser,
  seedOrResetDemoData
};
