import { api, ApiError } from './client';

export interface InvoiceItem {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface CreateInvoiceData {
  clientId: string;
  caseId?: string;
  items: InvoiceItem[];
  taxAmount?: number;
  discountAmount?: number;
  dueDate?: string | Date;
  notes?: string;
  terms?: string;
}

export interface UpdateInvoiceData {
  items?: InvoiceItem[];
  taxAmount?: number;
  discountAmount?: number;
  status?: 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE' | 'CANCELLED' | 'PARTIALLY_PAID';
  dueDate?: string | Date;
  notes?: string;
  terms?: string;
}

export interface RecordPaymentData {
  amount: number;
  paymentMethod?: string;
  paymentReference?: string;
  paidDate?: string | Date;
}

export interface InvoiceFilters {
  page?: number;
  limit?: number;
  search?: string;
  clientId?: string;
  caseId?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  clientId: string;
  caseId?: string;
  clientName: string;
  amount: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  paidAmount: number;
  status: 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE' | 'CANCELLED' | 'PARTIALLY_PAID';
  issueDate: string;
  dueDate: string;
  paidDate?: string;
  paymentMethod?: string;
  paymentReference?: string;
  items: InvoiceItem[];
  notes?: string;
  terms?: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  client?: {
    id: string;
    clientId: string;
    name: string;
    email?: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
  case?: {
    id: string;
    caseNumber: string;
    title: string;
    type: string;
    court: string;
  };
  createdBy?: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
}

export interface InvoiceStats {
  totalInvoices: number;
  paidInvoices: number;
  pendingInvoices: number;
  overdueInvoices: number;
  draftInvoices: number;
  totalRevenue: number;
  totalPending: number;
}

/**
 * Fetch all invoices with optional filters
 */
export async function getInvoices(filters?: InvoiceFilters): Promise<{
  invoices: Invoice[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}> {
  try {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });
    }

    const response = await api.get(`/invoices?${params.toString()}`);
    return response.data as {
      invoices: Invoice[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    };
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Failed to fetch invoices', 500);
  }
}

/**
 * Fetch a single invoice by ID
 */
export async function getInvoiceById(id: string): Promise<Invoice> {
  try {
    const response = await api.get(`/invoices/${id}`);
    return (response.data as { invoice: Invoice }).invoice;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Failed to fetch invoice', 500);
  }
}

/**
 * Create a new invoice
 */
export async function createInvoice(data: CreateInvoiceData): Promise<Invoice> {
  try {
    const response = await api.post('/invoices', data);
    return (response.data as { invoice: Invoice }).invoice;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Failed to create invoice', 500);
  }
}

/**
 * Update an existing invoice
 */
export async function updateInvoice(id: string, data: UpdateInvoiceData): Promise<Invoice> {
  try {
    const response = await api.put(`/invoices/${id}`, data);
    return (response.data as { invoice: Invoice }).invoice;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Failed to update invoice', 500);
  }
}

/**
 * Record a payment for an invoice
 */
export async function recordPayment(id: string, data: RecordPaymentData): Promise<Invoice> {
  try {
    const response = await api.post(`/invoices/${id}/payment`, data);
    return (response.data as { invoice: Invoice }).invoice;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Failed to record payment', 500);
  }
}

/**
 * Delete an invoice
 */
export async function deleteInvoice(id: string): Promise<void> {
  try {
    await api.delete(`/invoices/${id}`);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Failed to delete invoice', 500);
  }
}

/**
 * Get invoice statistics
 */
export async function getInvoiceStats(filters?: { clientId?: string; startDate?: string; endDate?: string }): Promise<InvoiceStats> {
  try {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });
    }

    const response = await api.get(`/invoices/stats?${params.toString()}`);
    return (response.data as { stats: InvoiceStats }).stats;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Failed to fetch invoice statistics', 500);
  }
}
