const { prisma } = require('../config/database');

/**
 * Create an audit log entry
 * @param {Object} params - Audit log parameters
 * @param {string} params.userId - User ID performing the action (optional)
 * @param {string} params.action - Action performed (from AuditAction enum)
 * @param {boolean} params.success - Whether the action was successful
 * @param {Object} params.details - Additional details about the action
 * @param {string} params.ipAddress - IP address of the request
 * @param {string} params.userAgent - User agent of the request
 * @param {string} params.errorMessage - Error message if action failed
 * @param {Object} params.metadata - Additional metadata
 * @returns {Promise<Object>} Created audit log entry
 */
const createAuditLog = async ({
  userId = null,
  action,
  success = true,
  details = null,
  ipAddress = null,
  userAgent = null,
  errorMessage = null,
  metadata = null,
}) => {
  try {
    const auditLog = await prisma.auditLog.create({
      data: {
        userId,
        action,
        success,
        details,
        ipAddress,
        userAgent,
        errorMessage,
        metadata,
      },
    });

    // Also log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[AUDIT] ${action} - User: ${userId || 'Anonymous'} - Success: ${success}`);
    }

    return auditLog;
  } catch (error) {
    console.error('Error creating audit log:', error);
    // Don't throw error to prevent disrupting the main operation
    return null;
  }
};

/**
 * Log authentication attempts
 */
const logAuthAttempt = async (email, userId, success, req, errorMessage = null) => {
  return createAuditLog({
    userId: success ? userId : null,
    action: success ? 'LOGIN_SUCCESS' : 'LOGIN_FAILED',
    success,
    details: { email },
    ipAddress: getClientIp(req),
    userAgent: req.headers['user-agent'],
    errorMessage,
  });
};

/**
 * Log logout
 */
const logLogout = async (userId, req) => {
  return createAuditLog({
    userId,
    action: 'LOGOUT',
    success: true,
    ipAddress: getClientIp(req),
    userAgent: req.headers['user-agent'],
  });
};

/**
 * Log registration
 */
const logRegistration = async (userId, email, req) => {
  return createAuditLog({
    userId,
    action: 'REGISTER',
    success: true,
    details: { email },
    ipAddress: getClientIp(req),
    userAgent: req.headers['user-agent'],
  });
};

/**
 * Log password change
 */
const logPasswordChange = async (userId, req, success = true, errorMessage = null) => {
  return createAuditLog({
    userId,
    action: 'PASSWORD_CHANGE',
    success,
    ipAddress: getClientIp(req),
    userAgent: req.headers['user-agent'],
    errorMessage,
  });
};

/**
 * Log account lockout
 */
const logAccountLocked = async (userId, email, req) => {
  return createAuditLog({
    userId,
    action: 'ACCOUNT_LOCKED',
    success: true,
    details: { email, reason: 'Multiple failed login attempts' },
    ipAddress: getClientIp(req),
    userAgent: req.headers['user-agent'],
  });
};

/**
 * Log account unlock
 */
const logAccountUnlocked = async (userId, unlockedBy, req) => {
  return createAuditLog({
    userId,
    action: 'ACCOUNT_UNLOCKED',
    success: true,
    details: { unlockedBy },
    ipAddress: getClientIp(req),
    userAgent: req.headers['user-agent'],
  });
};

/**
 * Log data modifications (clients, cases, etc.)
 */
const logDataModification = async (userId, action, entityType, entityId, changes, req) => {
  return createAuditLog({
    userId,
    action,
    success: true,
    details: {
      entityType,
      entityId,
      changes,
    },
    ipAddress: getClientIp(req),
    userAgent: req.headers['user-agent'],
  });
};

/**
 * Get client IP address from request
 */
const getClientIp = (req) => {
  return (
    req.headers['x-forwarded-for']?.split(',')[0] ||
    req.headers['x-real-ip'] ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    null
  );
};

/**
 * Get recent audit logs for a user
 */
const getUserAuditLogs = async (userId, limit = 50) => {
  try {
    return await prisma.auditLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        action: true,
        success: true,
        ipAddress: true,
        createdAt: true,
        details: true,
      },
    });
  } catch (error) {
    console.error('Error fetching user audit logs:', error);
    return [];
  }
};

/**
 * Get security events (failed logins, lockouts, etc.)
 */
const getSecurityEvents = async (limit = 100) => {
  try {
    return await prisma.auditLog.findMany({
      where: {
        action: {
          in: ['LOGIN_FAILED', 'ACCOUNT_LOCKED', 'ACCOUNT_UNLOCKED'],
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });
  } catch (error) {
    console.error('Error fetching security events:', error);
    return [];
  }
};

/**
 * Clean up old audit logs (run periodically)
 * Keep logs for specified number of days
 */
const cleanupOldAuditLogs = async (daysToKeep = 90) => {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const result = await prisma.auditLog.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate,
        },
      },
    });

    console.log(`Cleaned up ${result.count} audit logs older than ${daysToKeep} days`);
    return result.count;
  } catch (error) {
    console.error('Error cleaning up audit logs:', error);
    return 0;
  }
};

module.exports = {
  createAuditLog,
  logAuthAttempt,
  logLogout,
  logRegistration,
  logPasswordChange,
  logAccountLocked,
  logAccountUnlocked,
  logDataModification,
  getUserAuditLogs,
  getSecurityEvents,
  cleanupOldAuditLogs,
  getClientIp,
};
