const { prisma } = require('../config/database');
const { catchAsync, AppError } = require('../middleware/errorHandler');
const { sanitizeInput } = require('../utils/validation');

/**
 * Generate unique client ID
 */
const generateClientId = async () => {
  const year = new Date().getFullYear();
  const count = await prisma.client.count();
  const nextNumber = (count + 1).toString().padStart(3, '0');
  return `CLT-${year}-${nextNumber}`;
};

/**
 * Create a new client
 */
const createClient = catchAsync(async (req, res) => {
  const {
    name,
    email,
    phone,
    alternatePhone,
    address,
    city,
    state,
    pincode,
    country = 'Nepal',
    panNumber,
    citizenshipNo,
    nationalId,
    passportNo,
    companyName,
    companyType,
    cinNumber,
    clientType = 'INDIVIDUAL',
    priority = 'MEDIUM',
    assignedLawyerId,
    notes,
    tags = []
  } = req.body;

  // Validate required fields
  if (!name || !phone || !address || !city || !state) {
    throw new AppError('Name, phone, address, city, and state are required', 400);
  }

  // Sanitize inputs
  const sanitizedData = {
    name: sanitizeInput(name),
    email: email ? sanitizeInput(email.toLowerCase()) : null,
    phone: sanitizeInput(phone),
    alternatePhone: alternatePhone ? sanitizeInput(alternatePhone) : null,
    address: sanitizeInput(address),
    city: sanitizeInput(city),
    state: sanitizeInput(state),
    pincode: sanitizeInput(pincode),
    country: sanitizeInput(country),
    panNumber: panNumber ? sanitizeInput(panNumber) : null,
    citizenshipNo: citizenshipNo ? sanitizeInput(citizenshipNo) : null,
    nationalId: nationalId ? sanitizeInput(nationalId) : null,
    passportNo: passportNo ? sanitizeInput(passportNo) : null,
    companyName: companyName ? sanitizeInput(companyName) : null,
    companyType: companyType ? sanitizeInput(companyType) : null,
    cinNumber: cinNumber ? sanitizeInput(cinNumber) : null,
    notes: notes ? sanitizeInput(notes) : null
  };

  // Check if client with email already exists
  if (sanitizedData.email) {
    const existingClient = await prisma.client.findFirst({
      where: { 
        email: sanitizedData.email,
        isActive: true 
      }
    });
    
    if (existingClient) {
      throw new AppError('Client with this email already exists', 400);
    }
  }

  // Check if client with phone already exists
  const existingPhone = await prisma.client.findFirst({
    where: { 
      phone: sanitizedData.phone,
      isActive: true 
    }
  });
  
  if (existingPhone) {
    throw new AppError('Client with this phone number already exists', 400);
  }

  // Validate assigned lawyer exists
  if (assignedLawyerId) {
    const lawyer = await prisma.user.findUnique({
      where: { id: assignedLawyerId }
    });
    
    if (!lawyer || !['ADMIN', 'LAWYER'].includes(lawyer.role)) {
      throw new AppError('Invalid assigned lawyer', 400);
    }
  }

  // Generate unique client ID
  const clientId = await generateClientId();

  // Create client
  const newClient = await prisma.client.create({
    data: {
      clientId,
      ...sanitizedData,
      clientType: clientType.toUpperCase(),
      priority: priority.toUpperCase(),
      assignedLawyerId,
      createdById: req.user.id,
      tags: Array.isArray(tags) ? tags : []
    },
    include: {
      assignedLawyer: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true
        }
      },
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true
        }
      }
    }
  });

  res.status(201).json({
    status: 'success',
    message: 'Client created successfully',
    data: {
      client: newClient
    }
  });
});

/**
 * Get all clients with filtering and pagination
 */
const getAllClients = catchAsync(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    search,
    clientType,
    kycStatus,
    priority,
    assignedLawyerId,
    isActive = true,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  
  // Build where clause
  const whereClause = {
    isActive: isActive === 'true' || isActive === true
  };

  // Apply role-based filtering
  if (req.user.role === 'LAWYER') {
    whereClause.assignedLawyerId = req.user.id;
  }

  // Apply filters
  if (search) {
    whereClause.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { phone: { contains: search, mode: 'insensitive' } },
      { clientId: { contains: search, mode: 'insensitive' } }
    ];
  }

  if (clientType && clientType !== 'ALL') {
    whereClause.clientType = clientType.toUpperCase();
  }

  if (kycStatus && kycStatus !== 'ALL') {
    whereClause.kycStatus = kycStatus.toUpperCase();
  }

  if (priority && priority !== 'ALL') {
    whereClause.priority = priority.toUpperCase();
  }

  if (assignedLawyerId && assignedLawyerId !== 'ALL') {
    whereClause.assignedLawyerId = assignedLawyerId;
  }

  // Build orderBy clause
  const orderBy = {};
  orderBy[sortBy] = sortOrder;

  // Get clients with pagination
  const [clients, totalCount] = await Promise.all([
    prisma.client.findMany({
      where: whereClause,
      include: {
        assignedLawyer: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            role: true
          }
        }
      },
      orderBy,
      skip,
      take: parseInt(limit)
    }),
    prisma.client.count({ where: whereClause })
  ]);

  // Calculate pagination info
  const totalPages = Math.ceil(totalCount / parseInt(limit));
  const hasNextPage = parseInt(page) < totalPages;
  const hasPrevPage = parseInt(page) > 1;

  res.json({
    status: 'success',
    data: {
      clients,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalCount,
        limit: parseInt(limit),
        hasNextPage,
        hasPrevPage
      }
    }
  });
});

/**
 * Get client by ID
 */
const getClientById = catchAsync(async (req, res) => {
  const { id } = req.params;

  const client = await prisma.client.findUnique({
    where: { id },
    include: {
      assignedLawyer: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true
        }
      },
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true
        }
      }
    }
  });

  if (!client) {
    throw new AppError('Client not found', 404);
  }

  // Check permissions
  if (req.user.role === 'LAWYER' && client.assignedLawyerId !== req.user.id) {
    throw new AppError('You can only view clients assigned to you', 403);
  }

  res.json({
    status: 'success',
    data: {
      client
    }
  });
});

/**
 * Update client
 */
const updateClient = catchAsync(async (req, res) => {
  const { id } = req.params;
  const updateData = { ...req.body };

  // Remove fields that shouldn't be updated directly
  delete updateData.id;
  delete updateData.clientId;
  delete updateData.createdById;
  delete updateData.createdAt;

  // Check if client exists
  const existingClient = await prisma.client.findUnique({
    where: { id }
  });

  if (!existingClient) {
    throw new AppError('Client not found', 404);
  }

  // Check permissions
  if (req.user.role === 'LAWYER' && existingClient.assignedLawyerId !== req.user.id) {
    throw new AppError('You can only update clients assigned to you', 403);
  }

  // Sanitize string inputs
  const stringFields = ['name', 'email', 'phone', 'alternatePhone', 'address', 'city', 'state', 'pincode', 'country', 'panNumber', 'citizenshipNo', 'nationalId', 'passportNo', 'companyName', 'companyType', 'cinNumber', 'notes'];
  
  stringFields.forEach(field => {
    if (updateData[field]) {
      updateData[field] = sanitizeInput(updateData[field]);
      if (field === 'email') {
        updateData[field] = updateData[field].toLowerCase();
      }
    }
  });

  // Validate assigned lawyer if being updated
  if (updateData.assignedLawyerId) {
    const lawyer = await prisma.user.findUnique({
      where: { id: updateData.assignedLawyerId }
    });
    
    if (!lawyer || !['ADMIN', 'LAWYER'].includes(lawyer.role)) {
      throw new AppError('Invalid assigned lawyer', 400);
    }
  }

  // Check for duplicate email/phone if being updated
  if (updateData.email && updateData.email !== existingClient.email) {
    const duplicateEmail = await prisma.client.findFirst({
      where: { 
        email: updateData.email,
        isActive: true,
        id: { not: id }
      }
    });
    
    if (duplicateEmail) {
      throw new AppError('Client with this email already exists', 400);
    }
  }

  if (updateData.phone && updateData.phone !== existingClient.phone) {
    const duplicatePhone = await prisma.client.findFirst({
      where: { 
        phone: updateData.phone,
        isActive: true,
        id: { not: id }
      }
    });
    
    if (duplicatePhone) {
      throw new AppError('Client with this phone number already exists', 400);
    }
  }

  // Update client
  const updatedClient = await prisma.client.update({
    where: { id },
    data: {
      ...updateData,
      updatedAt: new Date()
    },
    include: {
      assignedLawyer: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true
        }
      },
      createdBy: {
        select: {
          id: true,
          name: true,
          role: true
        }
      }
    }
  });

  res.json({
    status: 'success',
    message: 'Client updated successfully',
    data: {
      client: updatedClient
    }
  });
});

/**
 * Delete (deactivate) client
 */
const deleteClient = catchAsync(async (req, res) => {
  const { id } = req.params;

  // Check if client exists
  const client = await prisma.client.findUnique({
    where: { id }
  });

  if (!client) {
    throw new AppError('Client not found', 404);
  }

  // Only admins can delete clients
  if (req.user.role !== 'ADMIN') {
    throw new AppError('Only administrators can delete clients', 403);
  }

  // Soft delete (deactivate) client
  await prisma.client.update({
    where: { id },
    data: {
      isActive: false,
      updatedAt: new Date()
    }
  });

  res.json({
    status: 'success',
    message: 'Client deleted successfully'
  });
});

/**
 * Get client statistics
 */
const getClientStats = catchAsync(async (req, res) => {
  const whereClause = { isActive: true };
  
  // Apply role-based filtering
  if (req.user.role === 'LAWYER') {
    whereClause.assignedLawyerId = req.user.id;
  }

  const [
    totalClients,
    activeClients,
    pendingKyc,
    verifiedKyc,
    individualClients,
    companyClients
  ] = await Promise.all([
    prisma.client.count({ where: whereClause }),
    prisma.client.count({ where: { ...whereClause, isActive: true } }),
    prisma.client.count({ where: { ...whereClause, kycStatus: 'PENDING' } }),
    prisma.client.count({ where: { ...whereClause, kycStatus: 'VERIFIED' } }),
    prisma.client.count({ where: { ...whereClause, clientType: 'INDIVIDUAL' } }),
    prisma.client.count({ where: { ...whereClause, clientType: 'COMPANY' } })
  ]);

  res.json({
    status: 'success',
    data: {
      stats: {
        totalClients,
        activeClients,
        pendingKyc,
        verifiedKyc,
        individualClients,
        companyClients
      }
    }
  });
});

module.exports = {
  createClient,
  getAllClients,
  getClientById,
  updateClient,
  deleteClient,
  getClientStats
};