const { prisma } = require('../config/database');
const { 
  hashPassword, 
  comparePassword, 
  generateToken, 
  generateRefreshToken,
  verifyRefreshToken,
  validatePasswordStrength,
  isPasswordInHistory 
} = require('../utils/auth');
const { catchAsync, AppError } = require('../middleware/errorHandler');
const { sanitizeInput } = require('../utils/validation');
const {
  logAuthAttempt,
  logLogout,
  logRegistration,
  logPasswordChange,
  logAccountLocked,
  logAccountUnlocked,
} = require('../utils/auditLogger');

// Configuration constants
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MINUTES = 30;
const PASSWORD_HISTORY_COUNT = 5;

/**
 * Register a new user
 */
const register = catchAsync(async (req, res) => {
  const { email, password, name, role = 'CLIENT' } = req.body;

  // Sanitize inputs
  const sanitizedName = sanitizeInput(name);
  const sanitizedEmail = sanitizeInput(email.toLowerCase());

  // Validate password strength
  const passwordValidation = validatePasswordStrength(password);
  if (!passwordValidation.isValid) {
    return res.status(400).json({
      status: 'error',
      message: 'Password does not meet security requirements',
      errors: passwordValidation.errors,
    });
  }

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: sanitizedEmail },
  });

  if (existingUser) {
    throw new AppError('User with this email already exists', 400);
  }

  // Hash password
  const hashedPassword = await hashPassword(password);

  // Create new user with security fields
  const newUser = await prisma.user.create({
    data: {
      email: sanitizedEmail,
      password: hashedPassword,
      name: sanitizedName,
      role: role.toUpperCase(),
      lastPasswordChange: new Date(),
      passwordHistory: [hashedPassword], // Store initial password in history
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      avatar: true,
      createdAt: true,
    },
  });

  // Generate tokens
  const token = generateToken(newUser.id, newUser.email, newUser.role);
  const refreshToken = generateRefreshToken(newUser.id);
  
  // Store refresh token
  await prisma.user.update({
    where: { id: newUser.id },
    data: {
      refreshToken,
      refreshTokenExpiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    },
  });

  // Log registration
  await logRegistration(newUser.id, sanitizedEmail, req);

  // Set secure cookie
  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  };

  res.cookie('token', token, cookieOptions);
  res.cookie('refreshToken', refreshToken, { ...cookieOptions, path: '/api/auth/refresh' });

  res.status(201).json({
    status: 'success',
    message: 'User registered successfully',
    data: {
      user: newUser,
      token,
      refreshToken,
    },
  });
});

/**
 * Login user
 */
const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;

  // Sanitize email
  const sanitizedEmail = sanitizeInput(email.toLowerCase());

  // Find user by email
  const user = await prisma.user.findUnique({
    where: { email: sanitizedEmail },
  });

  if (!user) {
    // Log failed attempt without user ID
    await logAuthAttempt(sanitizedEmail, null, false, req, 'User not found');
    throw new AppError('Invalid email or password', 401);
  }

  // Check if account is locked
  if (user.lockedUntil && user.lockedUntil > new Date()) {
    const minutesLeft = Math.ceil((user.lockedUntil - new Date()) / 60000);
    await logAuthAttempt(sanitizedEmail, user.id, false, req, 'Account locked');
    throw new AppError(
      `Account is locked due to multiple failed login attempts. Please try again in ${minutesLeft} minutes.`,
      403
    );
  }

  // If lockout period has passed, reset failed attempts
  if (user.lockedUntil && user.lockedUntil <= new Date()) {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts: 0,
        lockedUntil: null,
      },
    });
  }

  // Check if user is active
  if (!user.isActive) {
    await logAuthAttempt(sanitizedEmail, user.id, false, req, 'Account deactivated');
    throw new AppError('Account has been deactivated. Please contact administrator.', 401);
  }

  // Verify password
  const isPasswordValid = await comparePassword(password, user.password);
  
  if (!isPasswordValid) {
    // Increment failed login attempts
    const updatedFailedAttempts = user.failedLoginAttempts + 1;
    const updateData = {
      failedLoginAttempts: updatedFailedAttempts,
      lastLoginAttempt: new Date(),
    };

    // Lock account if max attempts reached
    if (updatedFailedAttempts >= MAX_FAILED_ATTEMPTS) {
      updateData.lockedUntil = new Date(Date.now() + LOCKOUT_DURATION_MINUTES * 60 * 1000);
      await prisma.user.update({
        where: { id: user.id },
        data: updateData,
      });
      
      // Log account lockout
      await logAccountLocked(user.id, sanitizedEmail, req);
      await logAuthAttempt(sanitizedEmail, user.id, false, req, 'Password incorrect - Account locked');
      
      throw new AppError(
        `Account locked due to ${MAX_FAILED_ATTEMPTS} failed login attempts. Please try again in ${LOCKOUT_DURATION_MINUTES} minutes.`,
        403
      );
    }

    await prisma.user.update({
      where: { id: user.id },
      data: updateData,
    });

    const attemptsLeft = MAX_FAILED_ATTEMPTS - updatedFailedAttempts;
    await logAuthAttempt(sanitizedEmail, user.id, false, req, 'Password incorrect');
    
    throw new AppError(
      `Invalid email or password. ${attemptsLeft} attempt(s) remaining before account lockout.`,
      401
    );
  }

  // Successful login - reset failed attempts
  await prisma.user.update({
    where: { id: user.id },
    data: {
      failedLoginAttempts: 0,
      lockedUntil: null,
      lastLoginAttempt: new Date(),
      lastLoginSuccess: new Date(),
    },
  });

  // Generate tokens
  const token = generateToken(user.id, user.email, user.role);
  const refreshToken = generateRefreshToken(user.id);

  // Store refresh token
  await prisma.user.update({
    where: { id: user.id },
    data: {
      refreshToken,
      refreshTokenExpiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    },
  });

  // Log successful login
  await logAuthAttempt(sanitizedEmail, user.id, true, req);

  // Remove password from response
  const { password: _, passwordHistory, refreshToken: __, refreshTokenExpiry: _rt, ...userWithoutSensitiveData } = user;

  // Set secure cookies
  const accessTokenExpiry = process.env.JWT_EXPIRES_IN || '15m';
  const refreshTokenExpiryConfig = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
  
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  };

  res.cookie('token', token, {
    ...cookieOptions,
    maxAge: parseExpiry(accessTokenExpiry),
  });

  res.cookie('refreshToken', refreshToken, {
    ...cookieOptions,
    maxAge: parseExpiry(refreshTokenExpiryConfig),
    path: '/api/auth/refresh',
  });

  res.status(200).json({
    status: 'success',
    message: 'Login successful',
    data: {
      user: userWithoutSensitiveData,
      token,
      refreshToken,
    },
  });
});

/**
 * Helper function to parse JWT expiry string to milliseconds
 */
const parseExpiry = (expiry) => {
  const match = expiry.match(/^(\d+)([smhd])$/);
  if (!match) return 15 * 60 * 1000; // Default 15 minutes

  const value = parseInt(match[1]);
  const unit = match[2];

  switch (unit) {
    case 's': return value * 1000;
    case 'm': return value * 60 * 1000;
    case 'h': return value * 60 * 60 * 1000;
    case 'd': return value * 24 * 60 * 60 * 1000;
    default: return 15 * 60 * 1000;
  }
};

/**
 * Logout user
 */
const logout = catchAsync(async (req, res) => {
  const userId = req.user?.id;

  // Invalidate refresh token in database
  if (userId) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        refreshToken: null,
        refreshTokenExpiry: null,
      },
    });

    // Log logout
    await logLogout(userId, req);
  }

  // Clear cookies
  res.cookie('token', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000), // 10 seconds
    httpOnly: true,
  });

  res.cookie('refreshToken', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
    path: '/api/auth/refresh',
  });

  res.status(200).json({
    status: 'success',
    message: 'Logged out successfully',
  });
});

/**
 * Get current user profile
 */
const getMe = catchAsync(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      avatar: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
});

/**
 * Update user profile
 */
const updateProfile = catchAsync(async (req, res) => {
  const { name, avatar } = req.body;
  const userId = req.user.id;

  // Prepare update data
  const updateData = {};
  if (name) updateData.name = sanitizeInput(name);
  if (avatar) updateData.avatar = sanitizeInput(avatar);

  // Update user
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: updateData,
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      avatar: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  res.status(200).json({
    status: 'success',
    message: 'Profile updated successfully',
    data: {
      user: updatedUser,
    },
  });
});

/**
 * Change password
 */
const changePassword = catchAsync(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user.id;

  // Get user with password and history
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      password: true,
      passwordHistory: true,
    },
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Verify current password
  const isCurrentPasswordValid = await comparePassword(currentPassword, user.password);
  if (!isCurrentPasswordValid) {
    await logPasswordChange(userId, req, false, 'Current password incorrect');
    throw new AppError('Current password is incorrect', 400);
  }

  // Validate new password strength
  const passwordValidation = validatePasswordStrength(newPassword);
  if (!passwordValidation.isValid) {
    return res.status(400).json({
      status: 'error',
      message: 'New password does not meet security requirements',
      errors: passwordValidation.errors,
    });
  }

  // Check if new password was used recently
  const usedBefore = await isPasswordInHistory(newPassword, user.passwordHistory || []);
  if (usedBefore) {
    return res.status(400).json({
      status: 'error',
      message: 'Password was used recently. Please choose a different password.',
      errors: ['Cannot reuse any of your last 5 passwords'],
    });
  }

  // Hash new password
  const hashedNewPassword = await hashPassword(newPassword);

  // Update password history (keep last 5)
  const updatedHistory = [hashedNewPassword, ...(user.passwordHistory || [])].slice(0, PASSWORD_HISTORY_COUNT);

  // Update password and history
  await prisma.user.update({
    where: { id: userId },
    data: { 
      password: hashedNewPassword,
      passwordHistory: updatedHistory,
      lastPasswordChange: new Date(),
    },
  });

  // Log password change
  await logPasswordChange(userId, req, true);

  res.status(200).json({
    status: 'success',
    message: 'Password changed successfully',
  });
});

/**
 * Check if email exists (for frontend validation)
 */
const checkEmail = catchAsync(async (req, res) => {
  const { email } = req.query;

  if (!email) {
    throw new AppError('Email parameter is required', 400);
  }

  const sanitizedEmail = sanitizeInput(email.toLowerCase());
  
  const existingUser = await prisma.user.findUnique({
    where: { email: sanitizedEmail },
    select: { id: true },
  });

  res.status(200).json({
    status: 'success',
    data: {
      exists: !!existingUser,
    },
  });
});

/**
 * Refresh token (extend session)
 */
const refreshToken = catchAsync(async (req, res) => {
  const oldRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

  if (!oldRefreshToken) {
    throw new AppError('Refresh token not provided', 401);
  }

  // Verify refresh token
  let decoded;
  try {
    decoded = verifyRefreshToken(oldRefreshToken);
  } catch (error) {
    throw new AppError('Invalid or expired refresh token', 401);
  }

  // Get user and verify refresh token
  const user = await prisma.user.findUnique({
    where: { id: decoded.userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      avatar: true,
      isActive: true,
      refreshToken: true,
      refreshTokenExpiry: true,
      createdAt: true,
    },
  });

  if (!user || !user.isActive) {
    throw new AppError('User not found or account deactivated', 404);
  }

  // Verify stored refresh token matches
  if (user.refreshToken !== oldRefreshToken) {
    throw new AppError('Invalid refresh token', 401);
  }

  // Check if refresh token expired
  if (user.refreshTokenExpiry && user.refreshTokenExpiry < new Date()) {
    throw new AppError('Refresh token expired', 401);
  }

  // Generate new tokens
  const newToken = generateToken(user.id, user.email, user.role);
  const newRefreshToken = generateRefreshToken(user.id);

  // Update refresh token in database
  await prisma.user.update({
    where: { id: user.id },
    data: {
      refreshToken: newRefreshToken,
      refreshTokenExpiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  // Set secure cookies
  const accessTokenExpiry = process.env.JWT_EXPIRES_IN || '15m';
  const refreshTokenExpiryConfig = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
  
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  };

  res.cookie('token', newToken, {
    ...cookieOptions,
    maxAge: parseExpiry(accessTokenExpiry),
  });

  res.cookie('refreshToken', newRefreshToken, {
    ...cookieOptions,
    maxAge: parseExpiry(refreshTokenExpiryConfig),
    path: '/api/auth/refresh',
  });

  const { refreshToken: __, refreshTokenExpiry: ___, ...userWithoutSensitiveData } = user;

  res.status(200).json({
    status: 'success',
    message: 'Token refreshed successfully',
    data: {
      user: userWithoutSensitiveData,
      token: newToken,
      refreshToken: newRefreshToken,
    },
  });
});

/**
 * Unlock user account (Admin only)
 */
const unlockAccount = catchAsync(async (req, res) => {
  const { userId } = req.params;
  const adminId = req.user.id;

  // Check if requester is admin
  if (req.user.role !== 'ADMIN') {
    throw new AppError('Only administrators can unlock accounts', 403);
  }

  // Get user to unlock
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      lockedUntil: true,
      failedLoginAttempts: true,
    },
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  if (!user.lockedUntil) {
    return res.status(400).json({
      status: 'error',
      message: 'Account is not locked',
    });
  }

  // Unlock account
  await prisma.user.update({
    where: { id: userId },
    data: {
      failedLoginAttempts: 0,
      lockedUntil: null,
    },
  });

  // Log unlock action
  await logAccountUnlocked(userId, adminId, req);

  res.status(200).json({
    status: 'success',
    message: `Account for ${user.email} has been unlocked successfully`,
    data: {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    },
  });
});

/**
 * Get account security status
 */
const getSecurityStatus = catchAsync(async (req, res) => {
  const userId = req.user.id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      lastPasswordChange: true,
      lastLoginSuccess: true,
      lastLoginAttempt: true,
      failedLoginAttempts: true,
      lockedUntil: true,
    },
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Calculate password age
  const passwordAge = user.lastPasswordChange 
    ? Math.floor((new Date() - user.lastPasswordChange) / (1000 * 60 * 60 * 24))
    : null;

  res.status(200).json({
    status: 'success',
    data: {
      lastPasswordChange: user.lastPasswordChange,
      passwordAgeDays: passwordAge,
      lastLoginSuccess: user.lastLoginSuccess,
      lastLoginAttempt: user.lastLoginAttempt,
      failedLoginAttempts: user.failedLoginAttempts,
      isLocked: user.lockedUntil ? user.lockedUntil > new Date() : false,
      lockedUntil: user.lockedUntil,
      passwordChangeRecommended: passwordAge && passwordAge > 90, // Recommend change after 90 days
    },
  });
});

module.exports = {
  register,
  login,
  logout,
  getMe,
  updateProfile,
  changePassword,
  checkEmail,
  refreshToken,
  unlockAccount,
  getSecurityStatus,
};