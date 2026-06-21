const db = require('./database/db');

(async () => {
  try {
    console.log('Seeding demo data...');

    // 1. Customers
    const customers = [
      { name: 'Apex Solutions', email: 'billing@apexsolutions.com', phone: '555-0101' },
      { name: 'Quantum Dynamics', email: 'finance@quantumdynamics.net', phone: '555-0102' },
      { name: 'Horizon Ventures', email: 'accounts@horizonventures.org', phone: '555-0103' },
      { name: 'Nexus Logistics', email: 'payables@nexuslogistics.com', phone: '555-0104' },
      { name: 'Stellar Tech', email: 'billing@stellartech.io', phone: '555-0105' },
    ];

    const customerIds = [];
    for (const c of customers) {
      const [res] = await db.query(
        'INSERT INTO customers (company_name, email, phone, address, contact_person) VALUES (?, ?, ?, ?, ?)',
        [c.name, c.email, c.phone, '123 Business Rd', 'John Doe']
      );
      customerIds.push(res.insertId);
    }
    console.log('Created 5 customers.');

    // 2. Invoices
    const currentYear = new Date().getFullYear();
    const statuses = ['paid', 'paid', 'paid', 'pending', 'pending', 'draft']; // Weighted towards paid and pending
    
    let invoiceCounter = 100;
    
    for (let i = 0; i < 40; i++) {
      const customer_id = customerIds[Math.floor(Math.random() * customerIds.length)];
      
      // Random date this year
      const month = Math.floor(Math.random() * 12); // 0-11
      const day = Math.floor(Math.random() * 28) + 1; // 1-28
      const invoice_date = new Date(currentYear, month, day);
      
      // Due date 30 days later
      const due_date = new Date(invoice_date);
      due_date.setDate(due_date.getDate() + 30);
      
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      
      const subtotal = Math.floor(Math.random() * 5000) + 500;
      const tax = 5;
      const total = subtotal * 1.05;

      const invoice_number = `DEMO-${invoiceCounter++}`;

      const [res] = await db.query(
        `INSERT INTO invoices 
        (invoice_number, customer_id, invoice_date, due_date, currency, subtotal, tax, discount, shipping, total, status, notes, terms) 
        VALUES (?, ?, ?, ?, 'CAD', ?, ?, 0, 0, ?, ?, '', '')`,
        [invoice_number, customer_id, invoice_date, due_date, subtotal, tax, total, status]
      );
      
      const invoice_id = res.insertId;
      
      // Add a couple items
      await db.query(
        `INSERT INTO invoice_items (invoice_id, description, quantity, rate, amount) VALUES (?, ?, ?, ?, ?)`,
        [invoice_id, 'Consulting Services', 1, subtotal * 0.5, subtotal * 0.5]
      );
      await db.query(
        `INSERT INTO invoice_items (invoice_id, description, quantity, rate, amount) VALUES (?, ?, ?, ?, ?)`,
        [invoice_id, 'Software License', 1, subtotal * 0.5, subtotal * 0.5]
      );
    }
    console.log('Created 40 invoices.');
    
    console.log('Demo data seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Failed to seed data:', error);
    process.exit(1);
  }
})();
