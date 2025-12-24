const { prisma } = require('../config/database');
const { catchAsync, AppError } = require('../middleware/errorHandler');
const { sanitizeInput } = require('../utils/validation');
const { logDataModification } = require('../utils/auditLogger');

/**
 * Get all hearings with filters
 */
const getAllHearings = catchAsync(async (req, res) => {
  const {
    page = 1,
    limit = 50,
    search = '',
    caseId = '',
    lawyerId = '',
    status = '',
    type = '',
    startDate = '',
    endDate = '',
    sortBy = 'hearingDate',
    sortOrder = 'asc'
  } = req.query;

  // Build where clause
  const where = {};

  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { caseName: { contains: search, mode: 'insensitive' } },
      { court: { contains: search, mode: 'insensitive' } },
      { judge: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (caseId) where.caseId = caseId;
  if (lawyerId) where.lawyerId = lawyerId;
  if (status) where.status = status.toUpperCase();
  if (type) where.type = type.toUpperCase();

  if (startDate || endDate) {
    where.hearingDate = {};
    if (startDate) where.hearingDate.gte = new Date(startDate);
    if (endDate) where.hearingDate.lte = new Date(endDate);
  }

  // Get total count
  const total = await prisma.hearing.count({ where });

  // Get hearings
  const hearings = await prisma.hearing.findMany({
    where,
    include: {
      case: {
        select: {
          id: true,
          caseNumber: true,
          title: true,
          status: true,
        },
      },
      lawyer: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
        },
      },
    },
    orderBy: { [sortBy]: sortOrder },
    skip: (parseInt(page) - 1) * parseInt(limit),
    take: parseInt(limit),
  });

  res.status(200).json({
    status: 'success',
    data: {
      hearings,
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
 * Get hearing by ID
 */
const getHearingById = catchAsync(async (req, res) => {
  const { id } = req.params;

  const hearing = await prisma.hearing.findUnique({
    where: { id },
    include: {
      case: {
        select: {
          id: true,
          caseNumber: true,
          title: true,
          type: true,
          status: true,
          client: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
        },
      },
      lawyer: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
          role: true,
        },
      },
    },
  });

  if (!hearing) {
    throw new AppError('Hearing not found', 404);
  }

  res.status(200).json({
    status: 'success',
    data: { hearing },
  });
});

/**
 * Create new hearing
 */
const createHearing = catchAsync(async (req, res) => {
  const {
    caseId,
    title,
    type = 'PRELIMINARY',
    hearingDate,
    startTime,
    endTime,
    duration,
    court,
    courtroom,
    judge,
    notes,
    reminderDate,
  } = req.body;

  // Validate required fields
  if (!caseId || !title || !hearingDate || !startTime || !court) {
    throw new AppError('Case ID, title, hearing date, start time, and court are required', 400);
  }

  // Get case details
  const caseData = await prisma.case.findUnique({
    where: { id: caseId },
    select: {
      id: true,
      title: true,
      assignedLawyerId: true,
      assignedLawyer: true,
    },
  });

  if (!caseData) {
    throw new AppError('Case not found', 404);
  }

  if (!caseData.assignedLawyerId) {
    throw new AppError('Case must have an assigned lawyer', 400);
  }

  // Check for scheduling conflicts
  const conflictingHearing = await prisma.hearing.findFirst({
    where: {
      lawyerId: caseData.assignedLawyerId,
      hearingDate: new Date(hearingDate),
      status: { not: 'CANCELLED' },
      OR: [
        { startTime: { lte: startTime }, endTime: { gte: startTime } },
        { startTime: { lte: endTime || startTime }, endTime: { gte: endTime || startTime } },
      ],
    },
  });

  if (conflictingHearing) {
    throw new AppError('Lawyer has a conflicting hearing at this time', 400);
  }

  // Create hearing
  const hearing = await prisma.hearing.create({
    data: {
      caseId,
      title: sanitizeInput(title),
      type: type.toUpperCase(),
      hearingDate: new Date(hearingDate),
      startTime,
      endTime,
      duration: duration ? parseInt(duration) : null,
      court: sanitizeInput(court),
      courtroom: courtroom ? sanitizeInput(courtroom) : null,
      judge: judge ? sanitizeInput(judge) : null,
      notes: notes ? sanitizeInput(notes) : null,
      caseName: caseData.title,
      lawyerId: caseData.assignedLawyerId,
      lawyerName: caseData.assignedLawyer,
      reminderDate: reminderDate ? new Date(reminderDate) : null,
    },
    include: {
      case: {
        select: {
          id: true,
          caseNumber: true,
          title: true,
        },
      },
      lawyer: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  // Log hearing creation
  await logDataModification(
    req.user.id,
    'CASE_CREATE',
    'hearing',
    hearing.id,
    { title, caseId, hearingDate, court },
    req
  );

  res.status(201).json({
    status: 'success',
    message: 'Hearing created successfully',
    data: { hearing },
  });
});

/**
 * Update hearing
 */
const updateHearing = catchAsync(async (req, res) => {
  const { id } = req.params;
  const {
    title,
    type,
    status,
    hearingDate,
    startTime,
    endTime,
    duration,
    court,
    courtroom,
    judge,
    notes,
    outcome,
    nextHearingDate,
    reminderDate,
    reminderSent,
  } = req.body;

  // Check if hearing exists
  const existingHearing = await prisma.hearing.findUnique({
    where: { id },
  });

  if (!existingHearing) {
    throw new AppError('Hearing not found', 404);
  }

  // Build update data
  const updateData = {};
  if (title) updateData.title = sanitizeInput(title);
  if (type) updateData.type = type.toUpperCase();
  if (status) updateData.status = status.toUpperCase();
  if (hearingDate) updateData.hearingDate = new Date(hearingDate);
  if (startTime) updateData.startTime = startTime;
  if (endTime !== undefined) updateData.endTime = endTime;
  if (duration) updateData.duration = parseInt(duration);
  if (court) updateData.court = sanitizeInput(court);
  if (courtroom !== undefined) updateData.courtroom = courtroom ? sanitizeInput(courtroom) : null;
  if (judge !== undefined) updateData.judge = judge ? sanitizeInput(judge) : null;
  if (notes !== undefined) updateData.notes = notes ? sanitizeInput(notes) : null;
  if (outcome !== undefined) updateData.outcome = outcome ? sanitizeInput(outcome) : null;
  if (nextHearingDate) updateData.nextHearingDate = new Date(nextHearingDate);
  if (reminderDate) updateData.reminderDate = new Date(reminderDate);
  if (reminderSent !== undefined) updateData.reminderSent = reminderSent;

  // Update hearing
  const hearing = await prisma.hearing.update({
    where: { id },
    data: updateData,
    include: {
      case: {
        select: {
          id: true,
          caseNumber: true,
          title: true,
        },
      },
      lawyer: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  // Log modification
  await logDataModification(
    req.user.id,
    'CASE_UPDATE',
    'hearing',
    id,
    updateData,
    req
  );

  res.status(200).json({
    status: 'success',
    message: 'Hearing updated successfully',
    data: { hearing },
  });
});

/**
 * Delete hearing (soft delete)
 */
const deleteHearing = catchAsync(async (req, res) => {
  const { id } = req.params;

  // Check if hearing exists
  const hearing = await prisma.hearing.findUnique({
    where: { id },
  });

  if (!hearing) {
    throw new AppError('Hearing not found', 404);
  }

  // Delete hearing
  await prisma.hearing.delete({
    where: { id },
  });

  // Log deletion
  await logDataModification(
    req.user.id,
    'CASE_DELETE',
    'hearing',
    id,
    { hearingId: id },
    req
  );

  res.status(200).json({
    status: 'success',
    message: 'Hearing deleted successfully',
  });
});

/**
 * Get upcoming hearings (next 7 days)
 */
const getUpcomingHearings = catchAsync(async (req, res) => {
  const { lawyerId } = req.query;

  const where = {
    hearingDate: {
      gte: new Date(),
      lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
    status: 'SCHEDULED',
  };

  if (lawyerId) {
    where.lawyerId = lawyerId;
  }

  const hearings = await prisma.hearing.findMany({
    where,
    include: {
      case: {
        select: {
          id: true,
          caseNumber: true,
          title: true,
        },
      },
      lawyer: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: { hearingDate: 'asc' },
  });

  res.status(200).json({
    status: 'success',
    data: { hearings },
  });
});

/**
 * Get hearing statistics
 */
const getHearingStats = catchAsync(async (req, res) => {
  const { lawyerId, startDate, endDate } = req.query;

  const where = {};
  if (lawyerId) where.lawyerId = lawyerId;
  if (startDate || endDate) {
    where.hearingDate = {};
    if (startDate) where.hearingDate.gte = new Date(startDate);
    if (endDate) where.hearingDate.lte = new Date(endDate);
  }

  const [
    totalHearings,
    scheduledHearings,
    completedHearings,
    postponedHearings,
    cancelledHearings,
    upcomingHearings,
  ] = await Promise.all([
    prisma.hearing.count({ where }),
    prisma.hearing.count({ where: { ...where, status: 'SCHEDULED' } }),
    prisma.hearing.count({ where: { ...where, status: 'COMPLETED' } }),
    prisma.hearing.count({ where: { ...where, status: 'POSTPONED' } }),
    prisma.hearing.count({ where: { ...where, status: 'CANCELLED' } }),
    prisma.hearing.count({
      where: {
        ...where,
        hearingDate: { gte: new Date() },
        status: 'SCHEDULED',
      },
    }),
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      stats: {
        totalHearings,
        scheduledHearings,
        completedHearings,
        postponedHearings,
        cancelledHearings,
        upcomingHearings,
      },
    },
  });
});

module.exports = {
  getAllHearings,
  getHearingById,
  createHearing,
  updateHearing,
  deleteHearing,
  getUpcomingHearings,
  getHearingStats,
};
