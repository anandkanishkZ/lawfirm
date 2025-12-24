const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const {
  createCase,
  getAllCases,
  getCaseById,
  updateCase,
  deleteCase,
  getCaseStats,
} = require('../controllers/caseController');

// All case routes require authentication
router.use(authenticate);

// Case statistics
router.get('/stats', getCaseStats);

// CRUD operations
router.post('/', createCase);
router.get('/', getAllCases);
router.get('/:id', getCaseById);
router.put('/:id', updateCase);
router.delete('/:id', deleteCase);

module.exports = router;
