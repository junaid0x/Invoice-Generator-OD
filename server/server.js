const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const healthRoutes = require('./routes/health');
const authRoutes = require('./routes/authRoutes');
const customerRoutes = require('./routes/customerRoutes');
const invoiceRoutes = require('./routes/invoiceRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const reportsRoutes = require('./routes/reportsRoutes');
const subscriptionRoutes = require('./routes/subscriptionRoutes');
const { initDemoUser } = require('./utils/demoDataSeeder');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Security Middleware
app.use(helmet());
app.use(cors());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Increased limit for development
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' }
});
app.use('/api', limiter);

app.use(express.json({ limit: '5mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const errorHandler = require('./middleware/errorHandler');

// Routes
app.use('/api', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/subscriptions', subscriptionRoutes);

// Serve client dist static files and SPA wildcard fallback
const clientDistPath = path.join(__dirname, '../client/dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
}

app.use((req, res, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/api') && !req.path.startsWith('/uploads')) {
    const indexPath = path.join(clientDistPath, 'index.html');
    if (fs.existsSync(indexPath)) {
      return res.sendFile(indexPath);
    }
  }
  next();
});

// Error Handler Middleware (Must be last)
app.use(errorHandler);

const initAdmin = async () => {
  try {
    const bcrypt = require('bcrypt');
    const db = require('./database/db');
    const [users] = await db.query('SELECT id FROM users WHERE email = ?', ['info@oceandevelopersltd.com']);
    if (users.length === 0) {
      const hashedPassword = await bcrypt.hash('Ocean123', 10);
      await db.query(
        'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
        ['Administrator', 'info@oceandevelopersltd.com', hashedPassword, 'admin']
      );
      console.log('Seeded default admin user: info@oceandevelopersltd.com');
    }

    await initDemoUser();
  } catch (error) {
    console.error('Failed to seed admin user:', error);
  }
};

initAdmin().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});

