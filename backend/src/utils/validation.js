const { body, validationResult } = require('express-validator');

/**
 * Handle validation errors
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors: errors.array().map(error => ({
        field: error.param,
        message: error.msg,
        value: error.value,
      })),
    });
  }
  next();
};

/**
 * Validation rules for user registration
 */
const validateRegister = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('password')
    .isLength({ min: 12 })
    .withMessage('Password must be at least 12 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character'),
  
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Name must contain only letters and spaces'),
  
  body('role')
    .optional()
    .isIn(['ADMIN', 'LAWYER', 'STAFF', 'CLIENT'])
    .withMessage('Role must be one of: ADMIN, LAWYER, STAFF, CLIENT'),

  handleValidationErrors,
];

/**
 * Validation rules for user login
 */
const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),

  handleValidationErrors,
];

/**
 * Validation rules for password change
 */
const validatePasswordChange = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  
  body('newPassword')
    .isLength({ min: 12 })
    .withMessage('New password must be at least 12 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])/)
    .withMessage('New password must contain at least one lowercase letter, one uppercase letter, one number, and one special character'),
  
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Password confirmation does not match new password');
      }
      return true;
    }),

  handleValidationErrors,
];

/**
 * Validation rules for profile update
 */
const validateProfileUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Name must contain only letters and spaces'),
  
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),

  body('avatar')
    .optional()
    .isURL()
    .withMessage('Avatar must be a valid URL'),

  handleValidationErrors,
];

/**
 * Sanitize user input to prevent XSS
 */
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  return input
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .trim(); // Remove leading/trailing whitespace
};

/**
 * Validate user role permissions
 */
const validateRole = (allowedRoles) => {
  return (req, res, next) => {
    const { role } = req.user;
    
    if (!allowedRoles.includes(role)) {
      return res.status(403).json({
        status: 'error',
        message: 'Insufficient permissions to access this resource',
      });
    }
    
    next();
  };
};

/**
 * Validation rules for client creation
 */
const validateCreateClient = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z\s.]+$/)
    .withMessage('Name must contain only letters, spaces, and dots'),
  
  body('email')
    .optional({ nullable: true })
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('phone')
    .matches(/^[0-9+\-\s()]+$/)
    .withMessage('Please provide a valid phone number'),
  
  body('alternatePhone')
    .optional({ nullable: true })
    .matches(/^[0-9+\-\s()]+$/)
    .withMessage('Please provide a valid alternate phone number'),
  
  body('address')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Address must be between 5 and 200 characters'),
  
  body('city')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('City must be between 2 and 50 characters'),
  
  body('state')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('State/Province must be between 2 and 50 characters'),
  
  body('pincode')
    .trim()
    .matches(/^\d{5}$/)
    .withMessage('Pincode must be 5 digits'),
  
  body('clientType')
    .optional()
    .isIn(['INDIVIDUAL', 'COMPANY', 'PARTNERSHIP', 'TRUST', 'SOCIETY'])
    .withMessage('Invalid client type'),
  
  body('priority')
    .optional()
    .isIn(['LOW', 'MEDIUM', 'HIGH', 'URGENT'])
    .withMessage('Invalid priority level'),

  handleValidationErrors,
];

/**
 * Validation rules for client update
 */
const validateUpdateClient = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z\s.]+$/)
    .withMessage('Name must contain only letters, spaces, and dots'),
  
  body('email')
    .optional({ nullable: true })
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('phone')
    .optional()
    .matches(/^[0-9+\-\s()]+$/)
    .withMessage('Please provide a valid phone number'),
  
  body('alternatePhone')
    .optional({ nullable: true })
    .matches(/^[0-9+\-\s()]+$/)
    .withMessage('Please provide a valid alternate phone number'),
  
  body('clientType')
    .optional()
    .isIn(['INDIVIDUAL', 'COMPANY', 'PARTNERSHIP', 'TRUST', 'SOCIETY'])
    .withMessage('Invalid client type'),
  
  body('priority')
    .optional()
    .isIn(['LOW', 'MEDIUM', 'HIGH', 'URGENT'])
    .withMessage('Invalid priority level'),
  
  body('kycStatus')
    .optional()
    .isIn(['PENDING', 'UNDER_REVIEW', 'VERIFIED', 'REJECTED', 'INCOMPLETE'])
    .withMessage('Invalid KYC status'),

  handleValidationErrors,
];

module.exports = {
  validateRegister,
  validateLogin,
  validatePasswordChange,
  validateProfileUpdate,
  validateCreateClient,
  validateUpdateClient,
  handleValidationErrors,
  sanitizeInput,
  validateRole,
};