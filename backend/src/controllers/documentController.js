const { prisma } = require('../config/database');
const { catchAsync, AppError } = require('../middleware/errorHandler');
const { sanitizeInput } = require('../utils/validation');
const { logDataModification } = require('../utils/auditLogger');

/**
 * Get all documents with filters
 */
const getAllDocuments = catchAsync(async (req, res) => {
  const {
    page = 1,
    limit = 50,
    search = '',
    caseId = '',
    clientId = '',
    uploadedById = '',
    type = '',
    isConfidential = '',
    sortBy = 'uploadedAt',
    sortOrder = 'desc'
  } = req.query;

  // Build where clause
  const where = {};

  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { fileName: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (caseId) where.caseId = caseId;
  if (clientId) where.clientId = clientId;
  if (uploadedById) where.uploadedById = uploadedById;
  if (type) where.type = type.toUpperCase();
  if (isConfidential !== '') where.isConfidential = isConfidential === 'true';

  // Get total count
  const total = await prisma.document.count({ where });

  // Get documents
  const documents = await prisma.document.findMany({
    where,
    include: {
      case: {
        select: {
          id: true,
          caseNumber: true,
          title: true,
        },
      },
      client: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      uploadedBy: {
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
      documents,
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
 * Get document by ID
 */
const getDocumentById = catchAsync(async (req, res) => {
  const { id } = req.params;

  const document = await prisma.document.findUnique({
    where: { id },
    include: {
      case: {
        select: {
          id: true,
          caseNumber: true,
          title: true,
          type: true,
        },
      },
      client: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },
      uploadedBy: {
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

  if (!document) {
    throw new AppError('Document not found', 404);
  }

  // Check access permissions
  if (document.isConfidential) {
    const canAccess = 
      req.user.role === 'ADMIN' ||
      req.user.id === document.uploadedById ||
      document.sharedWith.includes(req.user.id);

    if (!canAccess) {
      throw new AppError('You do not have permission to access this document', 403);
    }
  }

  res.status(200).json({
    status: 'success',
    data: { document },
  });
});

/**
 * Upload new document
 * Note: In production, integrate with file storage service (AWS S3, Cloudinary, etc.)
 */
const uploadDocument = catchAsync(async (req, res) => {
  const {
    title,
    type = 'OTHER',
    fileName,
    fileSize,
    mimeType,
    fileUrl,
    caseId,
    clientId,
    tags = [],
    description,
    isConfidential = false,
    sharedWith = [],
  } = req.body;

  // Validate required fields
  if (!title || !fileName || !fileSize || !mimeType || !fileUrl) {
    throw new AppError('Title, fileName, fileSize, mimeType, and fileUrl are required', 400);
  }

  // Validate at least one association (case or client)
  if (!caseId && !clientId) {
    throw new AppError('Document must be associated with a case or client', 400);
  }

  // If caseId provided, verify it exists
  if (caseId) {
    const caseExists = await prisma.case.findUnique({
      where: { id: caseId },
    });
    if (!caseExists) {
      throw new AppError('Case not found', 404);
    }
  }

  // If clientId provided, verify it exists
  if (clientId) {
    const clientExists = await prisma.client.findUnique({
      where: { id: clientId },
    });
    if (!clientExists) {
      throw new AppError('Client not found', 404);
    }
  }

  // Create document
  const document = await prisma.document.create({
    data: {
      title: sanitizeInput(title),
      type: type.toUpperCase(),
      fileName: sanitizeInput(fileName),
      fileSize: parseInt(fileSize),
      mimeType: sanitizeInput(mimeType),
      fileUrl: sanitizeInput(fileUrl),
      caseId: caseId || null,
      clientId: clientId || null,
      uploadedById: req.user.id,
      tags: Array.isArray(tags) ? tags.map(tag => sanitizeInput(tag)) : [],
      description: description ? sanitizeInput(description) : null,
      isConfidential,
      sharedWith: Array.isArray(sharedWith) ? sharedWith : [],
    },
    include: {
      case: {
        select: {
          id: true,
          caseNumber: true,
          title: true,
        },
      },
      client: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      uploadedBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  // Log document upload
  await logDataModification(
    req.user.id,
    'DOCUMENT_UPLOAD',
    'document',
    document.id,
    { title, fileName, type, caseId, clientId },
    req
  );

  res.status(201).json({
    status: 'success',
    message: 'Document uploaded successfully',
    data: { document },
  });
});

/**
 * Update document
 */
const updateDocument = catchAsync(async (req, res) => {
  const { id } = req.params;
  const {
    title,
    type,
    tags,
    description,
    isConfidential,
    sharedWith,
  } = req.body;

  // Check if document exists
  const existingDocument = await prisma.document.findUnique({
    where: { id },
  });

  if (!existingDocument) {
    throw new AppError('Document not found', 404);
  }

  // Check permissions
  const canUpdate = 
    req.user.role === 'ADMIN' ||
    req.user.id === existingDocument.uploadedById;

  if (!canUpdate) {
    throw new AppError('You do not have permission to update this document', 403);
  }

  // Build update data
  const updateData = {};
  if (title) updateData.title = sanitizeInput(title);
  if (type) updateData.type = type.toUpperCase();
  if (tags !== undefined) updateData.tags = Array.isArray(tags) ? tags.map(tag => sanitizeInput(tag)) : [];
  if (description !== undefined) updateData.description = description ? sanitizeInput(description) : null;
  if (isConfidential !== undefined) updateData.isConfidential = isConfidential;
  if (sharedWith !== undefined) updateData.sharedWith = Array.isArray(sharedWith) ? sharedWith : [];

  // Update document
  const document = await prisma.document.update({
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
      client: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      uploadedBy: {
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
    'document',
    id,
    updateData,
    req
  );

  res.status(200).json({
    status: 'success',
    message: 'Document updated successfully',
    data: { document },
  });
});

/**
 * Delete document
 */
const deleteDocument = catchAsync(async (req, res) => {
  const { id } = req.params;

  // Check if document exists
  const document = await prisma.document.findUnique({
    where: { id },
  });

  if (!document) {
    throw new AppError('Document not found', 404);
  }

  // Check permissions
  const canDelete = 
    req.user.role === 'ADMIN' ||
    req.user.id === document.uploadedById;

  if (!canDelete) {
    throw new AppError('You do not have permission to delete this document', 403);
  }

  // Delete document
  // Note: In production, also delete the file from storage service
  await prisma.document.delete({
    where: { id },
  });

  // Log deletion
  await logDataModification(
    req.user.id,
    'DOCUMENT_DELETE',
    'document',
    id,
    { documentId: id, fileName: document.fileName },
    req
  );

  res.status(200).json({
    status: 'success',
    message: 'Document deleted successfully',
  });
});

/**
 * Get document statistics
 */
const getDocumentStats = catchAsync(async (req, res) => {
  const { caseId, clientId } = req.query;

  const where = {};
  if (caseId) where.caseId = caseId;
  if (clientId) where.clientId = clientId;

  const [
    totalDocuments,
    confidentialDocuments,
    documentsByType,
    recentUploads,
    totalSize,
  ] = await Promise.all([
    prisma.document.count({ where }),
    prisma.document.count({ where: { ...where, isConfidential: true } }),
    prisma.document.groupBy({
      by: ['type'],
      where,
      _count: { type: true },
    }),
    prisma.document.count({
      where: {
        ...where,
        uploadedAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
        },
      },
    }),
    prisma.document.aggregate({
      where,
      _sum: { fileSize: true },
    }),
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      stats: {
        totalDocuments,
        confidentialDocuments,
        publicDocuments: totalDocuments - confidentialDocuments,
        documentsByType: documentsByType.map(item => ({
          type: item.type,
          count: item._count.type,
        })),
        recentUploads,
        totalSize: totalSize._sum.fileSize || 0,
      },
    },
  });
});

/**
 * Share document with users
 */
const shareDocument = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { userIds } = req.body;

  if (!Array.isArray(userIds) || userIds.length === 0) {
    throw new AppError('User IDs array is required', 400);
  }

  // Check if document exists
  const document = await prisma.document.findUnique({
    where: { id },
  });

  if (!document) {
    throw new AppError('Document not found', 404);
  }

  // Check permissions
  const canShare = 
    req.user.role === 'ADMIN' ||
    req.user.id === document.uploadedById;

  if (!canShare) {
    throw new AppError('You do not have permission to share this document', 403);
  }

  // Add users to sharedWith array
  const updatedSharedWith = [...new Set([...document.sharedWith, ...userIds])];

  const updatedDocument = await prisma.document.update({
    where: { id },
    data: { sharedWith: updatedSharedWith },
  });

  res.status(200).json({
    status: 'success',
    message: 'Document shared successfully',
    data: { document: updatedDocument },
  });
});

module.exports = {
  getAllDocuments,
  getDocumentById,
  uploadDocument,
  updateDocument,
  deleteDocument,
  getDocumentStats,
  shareDocument,
};
