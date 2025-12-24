const { prisma } = require('../config/database');
const { catchAsync, AppError } = require('../middleware/errorHandler');
const { hashPassword, validatePasswordStrength } = require('../utils/auth');
const { sanitizeInput } = require('../utils/validation');
const { logDataModification, createAuditLog } = require('../utils/auditLogger');

/**
 * Get all users (Admin only)
 */
const getAllUsers = catchAsync(async (req, res) => {
  // Check if requester is admin
  if (req.user.role !== 'ADMIN') {
    throw new AppError('Only administrators can view all users', 403);
  }

  const {
    page = 1,
    limit = 50,
    search = '',
    role = '',
    isActive = '',
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query;

  // Build where clause
  const where = {};

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (role) {
    where.role = role.toUpperCase();
  }

  if (isActive !== '') {
    where.isActive = isActive === 'true';
  }

  // Get total count
  const total = await prisma.user.count({ where });

  // Get users
  const users = await prisma.user.findMany({
    where,
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      avatar: true,
      isActive: true,
      lastLoginSuccess: true,
      lastLoginAttempt: true,
      failedLoginAttempts: true,
      lockedUntil: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: { [sortBy]: sortOrder },
    skip: (parseInt(page) - 1) * parseInt(limit),
    take: parseInt(limit),
  });

  res.status(200).json({
    status: 'success',
    data: {
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    },
  });
});

/**
 * Get user by ID (Admin only)
 */
const getUserById = catchAsync(async (req, res) => {
  const { id } = req.params;

  // Check if requester is admin or requesting their own profile
  if (req.user.role !== 'ADMIN' && req.user.id !== id) {
    throw new AppError('You do not have permission to view this user', 403);
  }

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      avatar: true,
      isActive: true,
      lastLoginSuccess: true,
      lastLoginAttempt: true,
      lastPasswordChange: true,
      failedLoginAttempts: true,
      lockedUntil: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: {
          assignedClients: true,
          assignedCases: true,
          createdClients: true,
          createdCases: true,
        },
      },
    },
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  res.status(200).json({
    status: 'success',
    data: { user },
  });
});

/**
 * Create new user (Admin only)
 */
const createUser = catchAsync(async (req, res) => {
  // Check if requester is admin
  if (req.user.role !== 'ADMIN') {
    throw new AppError('Only administrators can create users', 403);
  }

  const { email, password, name, role = 'CLIENT', avatar } = req.body;

  // Validate required fields
  if (!email || !password || !name) {
    throw new AppError('Email, password, and name are required', 400);
  }

  // Sanitize inputs
  const sanitizedEmail = sanitizeInput(email.toLowerCase());
  const sanitizedName = sanitizeInput(name);

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

  // Create user
  const newUser = await prisma.user.create({
    data: {
      email: sanitizedEmail,
      password: hashedPassword,
      name: sanitizedName,
      role: role.toUpperCase(),
      avatar: avatar || null,
      lastPasswordChange: new Date(),
      passwordHistory: [hashedPassword],
    },
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

  // Log user creation
  await logDataModification(
    req.user.id,
    'REGISTER',
    'user',
    newUser.id,
    { email: sanitizedEmail, name: sanitizedName, role: role.toUpperCase() },
    req
  );

  res.status(201).json({
    status: 'success',
    message: 'User created successfully',
    data: { user: newUser },
  });
});

/**
 * Update user (Admin only or own profile)
 */
const updateUser = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { name, avatar, role, isActive } = req.body;

  // Check permissions
  const isAdmin = req.user.role === 'ADMIN';
  const isSelf = req.user.id === id;

  if (!isAdmin && !isSelf) {
    throw new AppError('You do not have permission to update this user', 403);
  }

  // Only admin can change role and isActive
  if ((role || isActive !== undefined) && !isAdmin) {
    throw new AppError('Only administrators can change user role or status', 403);
  }

  // Get existing user
  const existingUser = await prisma.user.findUnique({
    where: { id },
  });

  if (!existingUser) {
    throw new AppError('User not found', 404);
  }

  // Build update data
  const updateData = {};
  if (name) updateData.name = sanitizeInput(name);
  if (avatar !== undefined) updateData.avatar = avatar ? sanitizeInput(avatar) : null;
  if (role && isAdmin) updateData.role = role.toUpperCase();
  if (isActive !== undefined && isAdmin) updateData.isActive = isActive;

  // Update user
  const updatedUser = await prisma.user.update({
    where: { id },
    data: updateData,
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      avatar: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  // Log modification
  await logDataModification(
    req.user.id,
    'PROFILE_UPDATE',
    'user',
    id,
    updateData,
    req
  );

  res.status(200).json({
    status: 'success',
    message: 'User updated successfully',
    data: { user: updatedUser },
  });
});

/**
 * Delete user (Admin only - soft delete)
 */
const deleteUser = catchAsync(async (req, res) => {
  const { id } = req.params;

  // Check if requester is admin
  if (req.user.role !== 'ADMIN') {
    throw new AppError('Only administrators can delete users', 403);
  }

  // Prevent admin from deleting themselves
  if (req.user.id === id) {
    throw new AppError('You cannot delete your own account', 400);
  }

  // Check if user exists
  const user = await prisma.user.findUnique({
    where: { id },
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Soft delete by deactivating
  await prisma.user.update({
    where: { id },
    data: { isActive: false },
  });

  // Log deletion
  await createAuditLog({
    userId: req.user.id,
    action: 'ROLE_CHANGE',
    success: true,
    details: { deletedUserId: id, email: user.email },
    ipAddress: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
    userAgent: req.headers['user-agent'],
  });

  res.status(200).json({
    status: 'success',
    message: 'User deactivated successfully',
  });
});

/**
 * Get user statistics (Admin only)
 */
const getUserStats = catchAsync(async (req, res) => {
  // Check if requester is admin
  if (req.user.role !== 'ADMIN') {
    throw new AppError('Only administrators can view user statistics', 403);
  }

  const [
    totalUsers,
    activeUsers,
    adminCount,
    lawyerCount,
    staffCount,
    clientCount,
    lockedAccounts,
    recentlyCreated,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { isActive: true } }),
    prisma.user.count({ where: { role: 'ADMIN' } }),
    prisma.user.count({ where: { role: 'LAWYER' } }),
    prisma.user.count({ where: { role: 'STAFF' } }),
    prisma.user.count({ where: { role: 'CLIENT' } }),
    prisma.user.count({
      where: {
        lockedUntil: { gt: new Date() },
      },
    }),
    prisma.user.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
        },
      },
    }),
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      stats: {
        totalUsers,
        activeUsers,
        inactiveUsers: totalUsers - activeUsers,
        roles: {
          admin: adminCount,
          lawyer: lawyerCount,
          staff: staffCount,
          client: clientCount,
        },
        lockedAccounts,
        recentlyCreated,
      },
    },
  });
});

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getUserStats,
};
