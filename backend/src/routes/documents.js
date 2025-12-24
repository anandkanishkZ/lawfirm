const express = require('express');
const router = express.Router();
const {
  getAllDocuments,
  getDocumentById,
  uploadDocument,
  updateDocument,
  deleteDocument,
  getDocumentStats,
  shareDocument,
} = require('../controllers/documentController');
const { authenticate } = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);

// Statistics
router.get('/stats', getDocumentStats);

// Document operations
router.route('/')
  .get(getAllDocuments)
  .post(uploadDocument);

router.route('/:id')
  .get(getDocumentById)
  .put(updateDocument)
  .delete(deleteDocument);

// Share document
router.post('/:id/share', shareDocument);

module.exports = router;
