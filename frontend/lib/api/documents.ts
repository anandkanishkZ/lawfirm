import { api, ApiError } from './client';

export interface UploadDocumentData {
  title: string;
  type?: 'CONTRACT' | 'AGREEMENT' | 'PLEADING' | 'EVIDENCE' | 'CORRESPONDENCE' | 'COURT_ORDER' | 'JUDGMENT' | 'NOTICE' | 'PETITION' | 'AFFIDAVIT' | 'OTHER';
  fileName: string;
  fileSize: number;
  mimeType: string;
  fileUrl: string;
  caseId?: string;
  clientId?: string;
  tags?: string[];
  description?: string;
  isConfidential?: boolean;
  sharedWith?: string[];
}

export interface UpdateDocumentData {
  title?: string;
  type?: 'CONTRACT' | 'AGREEMENT' | 'PLEADING' | 'EVIDENCE' | 'CORRESPONDENCE' | 'COURT_ORDER' | 'JUDGMENT' | 'NOTICE' | 'PETITION' | 'AFFIDAVIT' | 'OTHER';
  tags?: string[];
  description?: string;
  isConfidential?: boolean;
  sharedWith?: string[];
}

export interface DocumentFilters {
  page?: number;
  limit?: number;
  search?: string;
  caseId?: string;
  clientId?: string;
  uploadedById?: string;
  type?: string;
  isConfidential?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface Document {
  id: string;
  title: string;
  type: 'CONTRACT' | 'AGREEMENT' | 'PLEADING' | 'EVIDENCE' | 'CORRESPONDENCE' | 'COURT_ORDER' | 'JUDGMENT' | 'NOTICE' | 'PETITION' | 'AFFIDAVIT' | 'OTHER';
  fileName: string;
  fileSize: number;
  mimeType: string;
  fileUrl: string;
  caseId?: string;
  clientId?: string;
  uploadedById: string;
  tags: string[];
  description?: string;
  isConfidential: boolean;
  sharedWith: string[];
  uploadedAt: string;
  updatedAt: string;
  case?: {
    id: string;
    caseNumber: string;
    title: string;
    type: string;
  };
  client?: {
    id: string;
    name: string;
    email?: string;
    phone: string;
  };
  uploadedBy?: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    role: string;
  };
}

export interface DocumentStats {
  totalDocuments: number;
  confidentialDocuments: number;
  publicDocuments: number;
  documentsByType: { type: string; count: number }[];
  recentUploads: number;
  totalSize: number;
}

/**
 * Fetch all documents with optional filters
 */
export async function getDocuments(filters?: DocumentFilters): Promise<{
  documents: Document[];
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

    const response = await api.get(`/documents?${params.toString()}`);
    return response.data as {
      documents: Document[];
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
    throw new ApiError('Failed to fetch documents', 500);
  }
}

/**
 * Fetch a single document by ID
 */
export async function getDocumentById(id: string): Promise<Document> {
  try {
    const response = await api.get(`/documents/${id}`);
    return (response.data as { document: Document }).document;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Failed to fetch document', 500);
  }
}

/**
 * Upload a new document
 */
export async function uploadDocument(data: UploadDocumentData): Promise<Document> {
  try {
    const response = await api.post('/documents', data);
    return (response.data as { document: Document }).document;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Failed to upload document', 500);
  }
}

/**
 * Update an existing document
 */
export async function updateDocument(id: string, data: UpdateDocumentData): Promise<Document> {
  try {
    const response = await api.put(`/documents/${id}`, data);
    return (response.data as { document: Document }).document;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Failed to update document', 500);
  }
}

/**
 * Delete a document
 */
export async function deleteDocument(id: string): Promise<void> {
  try {
    await api.delete(`/documents/${id}`);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Failed to delete document', 500);
  }
}

/**
 * Get document statistics
 */
export async function getDocumentStats(filters?: { caseId?: string; clientId?: string }): Promise<DocumentStats> {
  try {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });
    }

    const response = await api.get(`/documents/stats?${params.toString()}`);
    return (response.data as { stats: DocumentStats }).stats;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Failed to fetch document statistics', 500);
  }
}

/**
 * Share a document with users
 */
export async function shareDocument(id: string, userIds: string[]): Promise<Document> {
  try {
    const response = await api.post(`/documents/${id}/share`, { userIds });
    return (response.data as { document: Document }).document;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Failed to share document', 500);
  }
}
