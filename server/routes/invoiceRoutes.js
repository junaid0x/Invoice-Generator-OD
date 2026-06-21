const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoiceController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
  .get(invoiceController.getInvoices)
  .post(invoiceController.createInvoice);

router.route('/:id')
  .get(invoiceController.getInvoice)
  .put(invoiceController.updateInvoice)
  .delete(invoiceController.deleteInvoice);

router.post('/:id/duplicate', invoiceController.duplicateInvoice);
router.post('/:id/email', invoiceController.emailInvoice);

module.exports = router;
