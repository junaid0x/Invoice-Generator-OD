const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { protect } = require('../middleware/authMiddleware');

// Protect dashboard route
router.get('/', protect, dashboardController.getDashboardData);

module.exports = router;
