const { prisma } = require('../config/database');
const { catchAsync, AppError } = require('../middleware/errorHandler');
const { sanitizeInput } = require('../utils/validation');

/**
 * Generate unique case number
 * Format: CS/YYYY/XXX (e.g., CS/2025/001)
 */
const generateCaseNumber = async () => {
  const year = new Date().getFullYear();
  const prefix = `CS/${year}/`;
  
  // Get count of cases created this year
  const startOfYear = new Date(year, 0, 1);
  const endOfYear = new Date(year, 11, 31, 23, 59, 59);
  
  const count = await prisma.case.count({
    where: {
      createdAt: {
        gte: startOfYear,
        lte: endOfYear,
      },
    },
  });
  
  // Increment and pad to 3 digits
  const number = (count + 1).toString().padStart(3, '0');
  return `${prefix}${number}`;
};

/**
 * Create new case
 */
const createCase = catchAsync(async (req, res) => {
  const {
    title,
    type,
    status,
    clientId,
    assignedLawyerId,
    court,
    filingDate,
    nextHearing,
    description,
    plaintiff,
    defendant,
    priority,
    tags,
  } = req.body;

  // Validate required fields
  if (!title || !clientId || !court || !filingDate) {
    throw new AppError('Title, client, court, and filing date are required', 400);
  }

  // Sanitize string inputs
  const sanitizedTitle = sanitizeInput(title);
  const sanitizedCourt = sanitizeInput(court);
  const sanitizedDescription = description ? sanitizeInput(description) : null;

  // Verify client exists
  const client = await prisma.client.findUnique({
    where: { id: clientId },
  });

  if (!client) {
    throw new AppError('Client not found', 404);
  }

  // Validate assigned lawyer if provided
  let lawyer = null;
  if (assignedLawyerId) {
    lawyer = await prisma.user.findUnique({
      where: { id: assignedLawyerId },
    });
    
    if (!lawyer || !['ADMIN', 'LAWYER'].includes(lawyer.role)) {
      throw new AppError('Invalid assigned lawyer', 400);
    }
  }

  // Generate unique case number
  const caseNumber = await generateCaseNumber();

  // Create case
  const newCase = await prisma.case.create({
    data: {
      caseNumber,
      title: sanitizedTitle,
      type: type || 'CIVIL',
      status: status || 'PENDING',
      clientId,
      clientName: client.name,
      assignedLawyerId: assignedLawyerId || null,
      assignedLawyer: lawyer ? lawyer.name : null,
      court: sanitizedCourt,
      filingDate: new Date(filingDate),
      nextHearing: nextHearing ? new Date(nextHearing) : null,
      description: sanitizedDescription,
      plaintiff: plaintiff || [client.name],
      defendant: defendant || [],
      priority: priority || 'MEDIUM',
      tags: tags || [],
      createdById: req.user.id,
    },
    include: {
      client: {
        select: {
          id: true,
          clientId: true,
          name: true,
          email: true,
          phone: true,
        },
      },
      assignedLawyerUser: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
      createdBy: {
        select: {
          id: true,
          name: true,
          role: true,
        },
      },
    },
  });

  res.status(201).json({
    status: 'success',
    message: 'Case created successfully',
    data: {
      case: newCase,
    },
  });
});

/**
 * Get all cases with filters and pagination
 */
const getAllCases = catchAsync(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    search,
    type,
    status,
    priority,
    clientId,
    assignedLawyerId,
    isActive,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = req.query;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const take = Math.min(parseInt(limit), 100);

  // Build where clause
  const whereClause = { isActive: isActive !== 'false' };

  // Apply role-based filtering
  if (req.user.role === 'LAWYER') {
    whereClause.assignedLawyerId = req.user.id;
  } else if (req.user.role === 'CLIENT') {
    // Clients see only their own cases
    const clientRecord = await prisma.client.findFirst({
      where: { email: req.user.email },
    });
    if (clientRecord) {
      whereClause.clientId = clientRecord.id;
    }
  }

  // Search across multiple fields
  if (search) {
    whereClause.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { caseNumber: { contains: search, mode: 'insensitive' } },
      { clientName: { contains: search, mode: 'insensitive' } },
      { court: { contains: search, mode: 'insensitive' } },
    ];
  }

  // Apply filters
  if (type) whereClause.type = type;
  if (status) whereClause.status = status;
  if (priority) whereClause.priority = priority;
  if (clientId) whereClause.clientId = clientId;
  if (assignedLawyerId && req.user.role !== 'LAWYER') {
    whereClause.assignedLawyerId = assignedLawyerId;
  }

  // Execute queries
  const [cases, totalCount] = await Promise.all([
    prisma.case.findMany({
      where: whereClause,
      skip,
      take,
      orderBy: { [sortBy]: sortOrder },
      include: {
        client: {
          select: {
            id: true,
            clientId: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        assignedLawyerUser: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    }),
    prisma.case.count({ where: whereClause }),
  ]);

  const totalPages = Math.ceil(totalCount / take);

  res.json({
    status: 'success',
    data: {
      cases,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalCount,
        limit: take,
        hasNextPage: parseInt(page) < totalPages,
        hasPrevPage: parseInt(page) > 1,
      },
    },
  });
});

/**
 * Get case by ID
 */
const getCaseById = catchAsync(async (req, res) => {
  const { id } = req.params;

  const caseData = await prisma.case.findUnique({
    where: { id },
    include: {
      client: {
        select: {
          id: true,
          clientId: true,
          name: true,
          email: true,
          phone: true,
          address: true,
          city: true,
          state: true,
        },
      },
      assignedLawyerUser: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          avatar: true,
        },
      },
      createdBy: {
        select: {
          id: true,
          name: true,
          role: true,
        },
      },
    },
  });

  if (!caseData) {
    throw new AppError('Case not found', 404);
  }

  // Check permissions
  if (req.user.role === 'LAWYER' && caseData.assignedLawyerId !== req.user.id) {
    throw new AppError('You can only view cases assigned to you', 403);
  } else if (req.user.role === 'CLIENT') {
    const clientRecord = await prisma.client.findFirst({
      where: { email: req.user.email },
    });
    if (!clientRecord || caseData.clientId !== clientRecord.id) {
      throw new AppError('You can only view your own cases', 403);
    }
  }

  res.json({
    status: 'success',
    data: {
      case: caseData,
    },
  });
});

/**
 * Update case
 */
const updateCase = catchAsync(async (req, res) => {
  const { id } = req.params;
  const updateData = { ...req.body };

  // Remove fields that shouldn't be updated directly
  delete updateData.id;
  delete updateData.caseNumber;
  delete updateData.createdById;
  delete updateData.createdAt;

  // Check if case exists
  const existingCase = await prisma.case.findUnique({
    where: { id },
  });

  if (!existingCase) {
    throw new AppError('Case not found', 404);
  }

  // Check permissions
  if (req.user.role === 'LAWYER' && existingCase.assignedLawyerId !== req.user.id) {
    throw new AppError('You can only update cases assigned to you', 403);
  } else if (req.user.role === 'STAFF') {
    throw new AppError('Staff cannot update cases', 403);
  } else if (req.user.role === 'CLIENT') {
    throw new AppError('Clients cannot update cases', 403);
  }

  // Sanitize string inputs
  const stringFields = ['title', 'court', 'description'];
  stringFields.forEach(field => {
    if (updateData[field]) {
      updateData[field] = sanitizeInput(updateData[field]);
    }
  });

  // Validate assigned lawyer if being updated
  if (updateData.assignedLawyerId) {
    const lawyer = await prisma.user.findUnique({
      where: { id: updateData.assignedLawyerId },
    });
    
    if (!lawyer || !['ADMIN', 'LAWYER'].includes(lawyer.role)) {
      throw new AppError('Invalid assigned lawyer', 400);
    }
    
    updateData.assignedLawyer = lawyer.name;
  }

  // Convert date strings to Date objects
  if (updateData.filingDate) {
    updateData.filingDate = new Date(updateData.filingDate);
  }
  if (updateData.nextHearing) {
    updateData.nextHearing = new Date(updateData.nextHearing);
  }

  // Update case
  const updatedCase = await prisma.case.update({
    where: { id },
    data: {
      ...updateData,
      updatedAt: new Date(),
    },
    include: {
      client: {
        select: {
          id: true,
          clientId: true,
          name: true,
          email: true,
          phone: true,
        },
      },
      assignedLawyerUser: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
      createdBy: {
        select: {
          id: true,
          name: true,
          role: true,
        },
      },
    },
  });

  res.json({
    status: 'success',
    message: 'Case updated successfully',
    data: {
      case: updatedCase,
    },
  });
});

/**
 * Delete (soft delete) case
 */
const deleteCase = catchAsync(async (req, res) => {
  const { id } = req.params;

  // Check if case exists
  const caseData = await prisma.case.findUnique({
    where: { id },
  });

  if (!caseData) {
    throw new AppError('Case not found', 404);
  }

  // Only admins can delete cases
  if (req.user.role !== 'ADMIN') {
    throw new AppError('Only administrators can delete cases', 403);
  }

  // Soft delete (deactivate) case
  await prisma.case.update({
    where: { id },
    data: {
      isActive: false,
      updatedAt: new Date(),
    },
  });

  res.json({
    status: 'success',
    message: 'Case deleted successfully',
  });
});

/**
 * Get case statistics
 */
const getCaseStats = catchAsync(async (req, res) => {
  const whereClause = { isActive: true };
  
  // Apply role-based filtering
  if (req.user.role === 'LAWYER') {
    whereClause.assignedLawyerId = req.user.id;
  } else if (req.user.role === 'CLIENT') {
    const clientRecord = await prisma.client.findFirst({
      where: { email: req.user.email },
    });
    if (clientRecord) {
      whereClause.clientId = clientRecord.id;
    }
  }

  const [
    totalCases,
    activeCases,
    pendingCases,
    closedCases,
    highPriorityCases,
    urgentCases,
    casesWithUpcomingHearings,
  ] = await Promise.all([
    prisma.case.count({ where: whereClause }),
    prisma.case.count({ where: { ...whereClause, status: 'ACTIVE' } }),
    prisma.case.count({ where: { ...whereClause, status: 'PENDING' } }),
    prisma.case.count({ where: { ...whereClause, status: 'CLOSED' } }),
    prisma.case.count({ where: { ...whereClause, priority: 'HIGH' } }),
    prisma.case.count({ where: { ...whereClause, priority: 'URGENT' } }),
    prisma.case.count({
      where: {
        ...whereClause,
        nextHearing: { gte: new Date() },
      },
    }),
  ]);

  res.json({
    status: 'success',
    data: {
      stats: {
        totalCases,
        activeCases,
        pendingCases,
        closedCases,
        highPriorityCases,
        urgentCases,
        casesWithUpcomingHearings,
      },
    },
  });
});

module.exports = {
  createCase,
  getAllCases,
  getCaseById,
  updateCase,
  deleteCase,
  getCaseStats,
};
