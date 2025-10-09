/**
 * Custom Application Error class
 */
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Handle Prisma errors
 */
const handlePrismaError = (err) => {
  let message = 'Database operation failed';
  let statusCode = 500;

  if (err.code === 'P2002') {
    // Unique constraint violation
    const field = err.meta?.target?.[0] || 'field';
    message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
    statusCode = 400;
  } else if (err.code === 'P2025') {
    // Record not found
    message = 'Record not found';
    statusCode = 404;
  } else if (err.code === 'P2003') {
    // Foreign key constraint violation
    message = 'Invalid reference to related record';
    statusCode = 400;
  } else if (err.code === 'P2014') {
    // Required relation violation
    message = 'Required relation is missing';
    statusCode = 400;
  }

  return new AppError(message, statusCode);
};

/**
 * Handle JWT errors
 */
const handleJWTError = () => new AppError('Invalid token. Please log in again!', 401);

const handleJWTExpiredError = () => new AppError('Your token has expired! Please log in again.', 401);

/**
 * Send error response for development
 */
const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

/**
 * Send error response for production
 */
const sendErrorProd = (err, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } 
  // Programming or other unknown error: don't leak error details
  else {
    // Log error for debugging
    console.error('ERROR 💥', err);

    // Send generic message
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong on our end. Please try again later.',
    });
  }
};

/**
 * Global error handling middleware
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  error.statusCode = err.statusCode || 500;
  error.status = err.status || 'error';

  // Handle specific error types
  if (err.name === 'PrismaClientKnownRequestError') {
    error = handlePrismaError(err);
  } else if (err.name === 'JsonWebTokenError') {
    error = handleJWTError();
  } else if (err.name === 'TokenExpiredError') {
    error = handleJWTExpiredError();
  } else if (err.name === 'ValidationError') {
    error = new AppError(err.message, 400);
  } else if (err.name === 'CastError') {
    error = new AppError('Invalid data format', 400);
  }

  // Send error response based on environment
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(error, res);
  } else {
    sendErrorProd(error, res);
  }
};

/**
 * Async error handler wrapper
 */
const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

/**
 * Handle 404 errors
 */
const notFound = (req, res, next) => {
  const error = new AppError(`Not found - ${req.originalUrl}`, 404);
  next(error);
};

module.exports = {
  AppError,
  errorHandler,
  catchAsync,
  notFound,
};