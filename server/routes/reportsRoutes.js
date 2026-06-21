const express = require('express');
const router = express.Router();
const reportsController = require('../controllers/reportsController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, reportsController.getReports);
router.get('/revenue', protect, reportsController.getRevenue);

module.exports = router;
