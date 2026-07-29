const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/login', authController.login);
router.post('/demo-login', authController.demoLogin);
router.post('/demo-reset', protect, authController.demoReset);
router.post('/logout', authController.logout);
router.get('/me', protect, authController.getMe);
router.put('/change-password', protect, authController.changePassword);

module.exports = router;
