const express = require('express');
const {
  createClient,
  getAllClients,
  getClientById,
  updateClient,
  deleteClient,
  getClientStats
} = require('../controllers/clientController');
const { authenticate } = require('../middleware/auth');
// const { validateCreateClient, validateUpdateClient } = require('../utils/validation'); // Temporarily disabled

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// Client management routes
router.post('/', createClient);
router.get('/', getAllClients);
router.get('/stats', getClientStats);
router.get('/:id', getClientById);
router.put('/:id', updateClient);
router.delete('/:id', deleteClient);

module.exports = router;