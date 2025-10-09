const express = require('express');
const rateLimit = require('express-rate-limit');

const {
  register,
  login,
  logout,
  getMe,
  updateProfile,
  changePassword,
  checkEmail,
  refreshToken,
} = require('../controllers/authController');

const { authenticate } = require('../middleware/auth');
const {
  validateRegister,
  validateLogin,
  validatePasswordChange,
  validateProfileUpdate,
} = require('../utils/validation');

const router = express.Router();

// Rate limiting for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  message: {
    status: 'error',
    message: 'Too many authentication attempts. Please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter rate limiting for login attempts
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 login attempts per windowMs
  message: {
    status: 'error',
    message: 'Too many login attempts. Please try again in 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Public routes (no authentication required)
router.post('/register', authLimiter, validateRegister, register);
router.post('/login', loginLimiter, validateLogin, login);
router.post('/logout', logout);
router.get('/check-email', checkEmail);

// Protected routes (authentication required)
router.use(authenticate); // All routes below this line require authentication

router.get('/me', getMe);
router.put('/profile', validateProfileUpdate, updateProfile);
router.put('/change-password', validatePasswordChange, changePassword);
router.post('/refresh-token', refreshToken);

module.exports = router;