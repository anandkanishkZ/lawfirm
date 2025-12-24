const { prisma } = require('../config/database');
const { catchAsync, AppError } = require('../middleware/errorHandler');
const { sanitizeInput } = require('../utils/validation');
const { logDataModification } = require('../utils/auditLogger');

/**
 * Generate unique invoice number
 */
const generateInvoiceNumber = async () => {
  const year = new Date().getFullYear();
  const lastInvoice = await prisma.invoice.findFirst({
    where: {
      invoiceNumber: {
        startsWith: `INV-${year}-`,
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  let nextNumber = 1;
  if (lastInvoice) {
    const lastNumber = parseInt(lastInvoice.invoiceNumber.split('-')[2]);
    nextNumber = lastNumber + 1;
  }

  return `INV-${year}-${String(nextNumber).padStart(3, '0')}`;
};

/**
 * Get all invoices with filters
 */
const getAllInvoices = catchAsync(async (req, res) => {
  const {
    page = 1,
    limit = 50,
    search = '',
    clientId = '',
    caseId = '',
    status = '',
    startDate = '',
    endDate = '',
    sortBy = 'issueDate',
    sortOrder = 'desc'
  } = req.query;

  // Build where clause
  const where = {};

  if (search) {
    where.OR = [
      { invoiceNumber: { contains: search, mode: 'insensitive' } },
      { clientName: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (clientId) where.clientId = clientId;
  if (caseId) where.caseId = caseId;
  if (status) where.status = status.toUpperCase();

  if (startDate || endDate) {
    where.issueDate = {};
    if (startDate) where.issueDate.gte = new Date(startDate);
    if (endDate) where.issueDate.lte = new Date(endDate);
  }

  // Get total count
  const total = await prisma.invoice.count({ where });

  // Get invoices
  const invoices = await prisma.invoice.findMany({
    where,
    include: {
      client: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },
      case: {
        select: {
          id: true,
          caseNumber: true,
          title: true,
        },
      },
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
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
      invoices,
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
 * Get invoice by ID
 */
const getInvoiceById = catchAsync(async (req, res) => {
  const { id } = req.params;

  const invoice = await prisma.invoice.findUnique({
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
          pincode: true,
          country: true,
        },
      },
      case: {
        select: {
          id: true,
          caseNumber: true,
          title: true,
          type: true,
          court: true,
        },
      },
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
        },
      },
    },
  });

  if (!invoice) {
    throw new AppError('Invoice not found', 404);
  }

  res.status(200).json({
    status: 'success',
    data: { invoice },
  });
});

/**
 * Create new invoice
 */
const createInvoice = catchAsync(async (req, res) => {
  const {
    clientId,
    caseId,
    items,
    taxAmount = 0,
    discountAmount = 0,
    dueDate,
    notes,
    terms,
  } = req.body;

  // Validate required fields
  if (!clientId || !items || !Array.isArray(items) || items.length === 0) {
    throw new AppError('Client ID and invoice items are required', 400);
  }

  // Get client details
  const client = await prisma.client.findUnique({
    where: { id: clientId },
  });

  if (!client) {
    throw new AppError('Client not found', 404);
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

  // Calculate amounts
  const amount = items.reduce((sum, item) => {
    return sum + (parseFloat(item.rate) * parseInt(item.quantity));
  }, 0);

  const totalAmount = amount + parseFloat(taxAmount) - parseFloat(discountAmount);

  // Generate invoice number
  const invoiceNumber = await generateInvoiceNumber();

  // Set due date (default 30 days from now)
  const dueDateValue = dueDate 
    ? new Date(dueDate)
    : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  // Create invoice
  const invoice = await prisma.invoice.create({
    data: {
      invoiceNumber,
      clientId,
      caseId: caseId || null,
      clientName: client.name,
      amount,
      taxAmount: parseFloat(taxAmount),
      discountAmount: parseFloat(discountAmount),
      totalAmount,
      paidAmount: 0,
      status: 'DRAFT',
      dueDate: dueDateValue,
      items: items,
      notes: notes ? sanitizeInput(notes) : null,
      terms: terms ? sanitizeInput(terms) : null,
      createdById: req.user.id,
    },
    include: {
      client: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      case: {
        select: {
          id: true,
          caseNumber: true,
          title: true,
        },
      },
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  // Log invoice creation
  await logDataModification(
    req.user.id,
    'CASE_CREATE',
    'invoice',
    invoice.id,
    { invoiceNumber, clientId, totalAmount },
    req
  );

  res.status(201).json({
    status: 'success',
    message: 'Invoice created successfully',
    data: { invoice },
  });
});

/**
 * Update invoice
 */
const updateInvoice = catchAsync(async (req, res) => {
  const { id } = req.params;
  const {
    items,
    taxAmount,
    discountAmount,
    status,
    dueDate,
    notes,
    terms,
  } = req.body;

  // Check if invoice exists
  const existingInvoice = await prisma.invoice.findUnique({
    where: { id },
  });

  if (!existingInvoice) {
    throw new AppError('Invoice not found', 404);
  }

  // Prevent editing paid invoices
  if (existingInvoice.status === 'PAID' && status !== 'CANCELLED') {
    throw new AppError('Cannot modify a paid invoice', 400);
  }

  // Build update data
  const updateData = {};

  if (items) {
    const amount = items.reduce((sum, item) => {
      return sum + (parseFloat(item.rate) * parseInt(item.quantity));
    }, 0);
    updateData.items = items;
    updateData.amount = amount;
  }

  if (taxAmount !== undefined) {
    updateData.taxAmount = parseFloat(taxAmount);
  }

  if (discountAmount !== undefined) {
    updateData.discountAmount = parseFloat(discountAmount);
  }

  // Recalculate total amount if any component changed
  if (items || taxAmount !== undefined || discountAmount !== undefined) {
    const finalAmount = (updateData.amount || existingInvoice.amount);
    const finalTax = (updateData.taxAmount !== undefined ? updateData.taxAmount : existingInvoice.taxAmount);
    const finalDiscount = (updateData.discountAmount !== undefined ? updateData.discountAmount : existingInvoice.discountAmount);
    updateData.totalAmount = finalAmount + finalTax - finalDiscount;
  }

  if (status) {
    updateData.status = status.toUpperCase();
    
    // Check if status is overdue based on due date
    if (status.toUpperCase() === 'SENT' && new Date() > existingInvoice.dueDate) {
      updateData.status = 'OVERDUE';
    }
  }

  if (dueDate) updateData.dueDate = new Date(dueDate);
  if (notes !== undefined) updateData.notes = notes ? sanitizeInput(notes) : null;
  if (terms !== undefined) updateData.terms = terms ? sanitizeInput(terms) : null;

  // Update invoice
  const invoice = await prisma.invoice.update({
    where: { id },
    data: updateData,
    include: {
      client: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      case: {
        select: {
          id: true,
          caseNumber: true,
          title: true,
        },
      },
      createdBy: {
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
    'invoice',
    id,
    updateData,
    req
  );

  res.status(200).json({
    status: 'success',
    message: 'Invoice updated successfully',
    data: { invoice },
  });
});

/**
 * Record payment
 */
const recordPayment = catchAsync(async (req, res) => {
  const { id } = req.params;
  const {
    amount,
    paymentMethod,
    paymentReference,
    paidDate,
  } = req.body;

  if (!amount || parseFloat(amount) <= 0) {
    throw new AppError('Valid payment amount is required', 400);
  }

  // Check if invoice exists
  const invoice = await prisma.invoice.findUnique({
    where: { id },
  });

  if (!invoice) {
    throw new AppError('Invoice not found', 404);
  }

  if (invoice.status === 'CANCELLED') {
    throw new AppError('Cannot record payment for cancelled invoice', 400);
  }

  const paymentAmount = parseFloat(amount);
  const newPaidAmount = parseFloat(invoice.paidAmount) + paymentAmount;
  const totalAmount = parseFloat(invoice.totalAmount);

  // Determine new status
  let newStatus = invoice.status;
  if (newPaidAmount >= totalAmount) {
    newStatus = 'PAID';
  } else if (newPaidAmount > 0) {
    newStatus = 'PARTIALLY_PAID';
  }

  // Update invoice
  const updatedInvoice = await prisma.invoice.update({
    where: { id },
    data: {
      paidAmount: newPaidAmount,
      status: newStatus,
      paidDate: newPaidAmount >= totalAmount ? (paidDate ? new Date(paidDate) : new Date()) : null,
      paymentMethod: paymentMethod || invoice.paymentMethod,
      paymentReference: paymentReference || invoice.paymentReference,
    },
    include: {
      client: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      case: {
        select: {
          id: true,
          caseNumber: true,
          title: true,
        },
      },
    },
  });

  // Log payment
  await logDataModification(
    req.user.id,
    'CASE_UPDATE',
    'invoice',
    id,
    { paymentAmount, newPaidAmount, newStatus },
    req
  );

  res.status(200).json({
    status: 'success',
    message: 'Payment recorded successfully',
    data: { invoice: updatedInvoice },
  });
});

/**
 * Delete invoice
 */
const deleteInvoice = catchAsync(async (req, res) => {
  const { id } = req.params;

  // Check if invoice exists
  const invoice = await prisma.invoice.findUnique({
    where: { id },
  });

  if (!invoice) {
    throw new AppError('Invoice not found', 404);
  }

  // Prevent deleting paid invoices
  if (invoice.status === 'PAID' || invoice.status === 'PARTIALLY_PAID') {
    throw new AppError('Cannot delete paid or partially paid invoices', 400);
  }

  // Delete invoice
  await prisma.invoice.delete({
    where: { id },
  });

  // Log deletion
  await logDataModification(
    req.user.id,
    'CASE_DELETE',
    'invoice',
    id,
    { invoiceNumber: invoice.invoiceNumber },
    req
  );

  res.status(200).json({
    status: 'success',
    message: 'Invoice deleted successfully',
  });
});

/**
 * Get invoice statistics
 */
const getInvoiceStats = catchAsync(async (req, res) => {
  const { clientId, startDate, endDate } = req.query;

  const where = {};
  if (clientId) where.clientId = clientId;
  if (startDate || endDate) {
    where.issueDate = {};
    if (startDate) where.issueDate.gte = new Date(startDate);
    if (endDate) where.issueDate.lte = new Date(endDate);
  }

  const [
    totalInvoices,
    paidInvoices,
    pendingInvoices,
    overdueInvoices,
    totalRevenue,
    totalPending,
  ] = await Promise.all([
    prisma.invoice.count({ where }),
    prisma.invoice.count({ where: { ...where, status: 'PAID' } }),
    prisma.invoice.count({
      where: {
        ...where,
        status: { in: ['SENT', 'PARTIALLY_PAID'] },
      },
    }),
    prisma.invoice.count({ where: { ...where, status: 'OVERDUE' } }),
    prisma.invoice.aggregate({
      where: { ...where, status: 'PAID' },
      _sum: { totalAmount: true },
    }),
    prisma.invoice.aggregate({
      where: {
        ...where,
        status: { in: ['SENT', 'PARTIALLY_PAID', 'OVERDUE'] },
      },
      _sum: { totalAmount: true, paidAmount: true },
    }),
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      stats: {
        totalInvoices,
        paidInvoices,
        pendingInvoices,
        overdueInvoices,
        draftInvoices: totalInvoices - paidInvoices - pendingInvoices - overdueInvoices,
        totalRevenue: totalRevenue._sum.totalAmount || 0,
        totalPending: (totalPending._sum.totalAmount || 0) - (totalPending._sum.paidAmount || 0),
      },
    },
  });
});

module.exports = {
  getAllInvoices,
  getInvoiceById,
  createInvoice,
  updateInvoice,
  recordPayment,
  deleteInvoice,
  getInvoiceStats,
};
