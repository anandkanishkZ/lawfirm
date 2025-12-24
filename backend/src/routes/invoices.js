const express = require('express');
const router = express.Router();
const {
  getAllInvoices,
  getInvoiceById,
  createInvoice,
  updateInvoice,
  recordPayment,
  deleteInvoice,
  getInvoiceStats,
} = require('../controllers/invoiceController');
const { authenticate } = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);

// Statistics
router.get('/stats', getInvoiceStats);

// Invoice operations
router.route('/')
  .get(getAllInvoices)
  .post(createInvoice);

router.route('/:id')
  .get(getInvoiceById)
  .put(updateInvoice)
  .delete(deleteInvoice);

// Record payment
router.post('/:id/payment', recordPayment);

module.exports = router;
