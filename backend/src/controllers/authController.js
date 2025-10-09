const { prisma } = require('../config/database');
const { hashPassword, comparePassword, generateToken, validatePasswordStrength } = require('../utils/auth');
const { catchAsync, AppError } = require('../middleware/errorHandler');
const { sanitizeInput } = require('../utils/validation');

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

  // Create new user
  const newUser = await prisma.user.create({
    data: {
      email: sanitizedEmail,
      password: hashedPassword,
      name: sanitizedName,
      role: role.toUpperCase(),
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

  // Generate JWT token
  const token = generateToken(newUser.id, newUser.email, newUser.role);

  // Set secure cookie
  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  };

  res.cookie('token', token, cookieOptions);

  res.status(201).json({
    status: 'success',
    message: 'User registered successfully',
    data: {
      user: newUser,
      token,
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
    throw new AppError('Invalid email or password', 401);
  }

  // Check if user is active
  if (!user.isActive) {
    throw new AppError('Account has been deactivated. Please contact administrator.', 401);
  }

  // Verify password
  const isPasswordValid = await comparePassword(password, user.password);
  if (!isPasswordValid) {
    throw new AppError('Invalid email or password', 401);
  }

  // Generate JWT token
  const token = generateToken(user.id, user.email, user.role);

  // Remove password from response
  const { password: _, ...userWithoutPassword } = user;

  // Set secure cookie
  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  };

  res.cookie('token', token, cookieOptions);

  res.status(200).json({
    status: 'success',
    message: 'Login successful',
    data: {
      user: userWithoutPassword,
      token,
    },
  });
});

/**
 * Logout user
 */
const logout = catchAsync(async (req, res) => {
  // Clear cookie
  res.cookie('token', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000), // 10 seconds
    httpOnly: true,
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

  // Get user with password
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Verify current password
  const isCurrentPasswordValid = await comparePassword(currentPassword, user.password);
  if (!isCurrentPasswordValid) {
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

  // Hash new password
  const hashedNewPassword = await hashPassword(newPassword);

  // Update password
  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedNewPassword },
  });

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
  const userId = req.user.id;

  // Get fresh user data
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      avatar: true,
      isActive: true,
      createdAt: true,
    },
  });

  if (!user || !user.isActive) {
    throw new AppError('User not found or account deactivated', 404);
  }

  // Generate new token
  const token = generateToken(user.id, user.email, user.role);

  // Set secure cookie
  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  };

  res.cookie('token', token, cookieOptions);

  res.status(200).json({
    status: 'success',
    message: 'Token refreshed successfully',
    data: {
      user,
      token,
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
};