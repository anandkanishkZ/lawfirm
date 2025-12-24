const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

/**
 * Hash password using bcrypt
 * @param {string} password - Plain text password
 * @returns {Promise<string>} - Hashed password
 */
const hashPassword = async (password) => {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
};

/**
 * Compare password with hashed password
 * @param {string} password - Plain text password
 * @param {string} hashedPassword - Hashed password
 * @returns {Promise<boolean>} - True if passwords match
 */
const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

/**
 * Generate JWT token
 * @param {string} userId - User ID
 * @param {string} email - User email
 * @param {string} role - User role
 * @returns {string} - JWT token
 */
const generateToken = (userId, email, role) => {
  const payload = {
    userId,
    email,
    role,
  };

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    issuer: 'law-firm-management',
  });
};

/**
 * Verify JWT token
 * @param {string} token - JWT token
 * @returns {object} - Decoded token payload
 */
const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

/**
 * Generate a secure random password for new users
 * @returns {string} - Random password
 */
const generateRandomPassword = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {object} - Validation result
 */
const validatePasswordStrength = (password) => {
  const minLength = 12; // Increased from 8
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  // Common passwords blacklist
  const commonPasswords = [
    'password', 'password123', '12345678', '123456789', '12345678910',
    'qwerty', 'abc123', 'monkey', '1234567', 'letmein',
    'trustno1', 'dragon', 'baseball', 'iloveyou', 'master',
    'sunshine', 'ashley', 'bailey', 'passw0rd', 'shadow',
    'admin', 'admin123', 'root', 'toor', 'pass', 'test',
    'welcome', 'login', 'access', 'secret', 'password1'
  ];

  const isCommonPassword = commonPasswords.includes(password.toLowerCase());

  const errors = [];
  if (password.length < minLength) {
    errors.push(`Password must be at least ${minLength} characters long`);
  }
  if (!hasUpperCase) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!hasLowerCase) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!hasNumbers) {
    errors.push('Password must contain at least one number');
  }
  if (!hasSpecialChar) {
    errors.push('Password must contain at least one special character (!@#$%^&*(),.?":{}|<>)');
  }
  if (isCommonPassword) {
    errors.push('This password is too common. Please choose a more unique password');
  }

  const isValid = errors.length === 0;

  return {
    isValid,
    errors,
    score: [
      password.length >= minLength,
      hasUpperCase,
      hasLowerCase,
      hasNumbers,
      hasSpecialChar,
      !isCommonPassword,
    ].filter(Boolean).length,
  };
};

/**
 * Check if password was used recently
 * @param {string} password - New password
 * @param {Array<string>} passwordHistory - Array of previous password hashes
 * @returns {Promise<boolean>} - True if password was used before
 */
const isPasswordInHistory = async (password, passwordHistory) => {
  if (!passwordHistory || passwordHistory.length === 0) {
    return false;
  }

  for (const oldHash of passwordHistory) {
    const match = await comparePassword(password, oldHash);
    if (match) {
      return true;
    }
  }

  return false;
};

/**
 * Generate refresh token
 * @param {string} userId - User ID
 * @returns {string} - Refresh token
 */
const generateRefreshToken = (userId) => {
  const payload = {
    userId,
    type: 'refresh',
  };

  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    issuer: 'law-firm-management',
  });
};

/**
 * Verify refresh token
 * @param {string} token - Refresh token
 * @returns {object} - Decoded token payload
 */
const verifyRefreshToken = (token) => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);
};

module.exports = {
  hashPassword,
  comparePassword,
  generateToken,
  verifyToken,
  generateRandomPassword,
  validatePasswordStrength,
  isPasswordInHistory,
  generateRefreshToken,
  verifyRefreshToken,
};