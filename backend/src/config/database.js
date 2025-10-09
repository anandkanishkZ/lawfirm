const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
});

// Test database connection
const connectDB = async () => {
  try {
    await prisma.$connect();
    console.log('✅ PostgreSQL Database connected successfully');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
};

// Graceful shutdown
const disconnectDB = async () => {
  await prisma.$disconnect();
  console.log('👋 Database disconnected');
};

process.on('beforeExit', disconnectDB);
process.on('SIGINT', disconnectDB);
process.on('SIGTERM', disconnectDB);

module.exports = { prisma, connectDB };