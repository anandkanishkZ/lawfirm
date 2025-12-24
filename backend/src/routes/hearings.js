const express = require('express');
const router = express.Router();
const {
  getAllHearings,
  getHearingById,
  createHearing,
  updateHearing,
  deleteHearing,
  getUpcomingHearings,
  getHearingStats,
} = require('../controllers/hearingController');
const { authenticate } = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);

// Statistics and upcoming hearings
router.get('/stats', getHearingStats);
router.get('/upcoming', getUpcomingHearings);

// Hearing CRUD operations
router.route('/')
  .get(getAllHearings)
  .post(createHearing);

router.route('/:id')
  .get(getHearingById)
  .put(updateHearing)
  .delete(deleteHearing);

module.exports = router;
