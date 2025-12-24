import { api, ApiError } from './client';

export interface CreateCaseData {
  title: string;
  type?: 'CIVIL' | 'CRIMINAL' | 'PROPERTY' | 'COMMERCIAL' | 'FAMILY' | 'CORPORATE';
  status?: 'ACTIVE' | 'PENDING' | 'CLOSED' | 'ON_HOLD';
  clientId: string;
  assignedLawyerId?: string;
  court: string;
  filingDate: string | Date;
  nextHearing?: string | Date;
  description?: string;
  plaintiff?: string[];
  defendant?: string[];
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  tags?: string[];
}

export interface UpdateCaseData extends Partial<CreateCaseData> {
  isActive?: boolean;
}

export interface CaseFilters {
  page?: number;
  limit?: number;
  search?: string;
  type?: string;
  status?: string;
  priority?: string;
  clientId?: string;
  assignedLawyerId?: string;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface Case {
  id: string;
  caseNumber: string;
  title: string;
  type: 'CIVIL' | 'CRIMINAL' | 'PROPERTY' | 'COMMERCIAL' | 'FAMILY' | 'CORPORATE';
  status: 'ACTIVE' | 'PENDING' | 'CLOSED' | 'ON_HOLD';
  clientId: string;
  clientName: string;
  assignedLawyerId?: string;
  assignedLawyer?: string;
  court: string;
  filingDate: string;
  nextHearing?: string;
  description?: string;
  plaintiff: string[];
  defendant: string[];
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  tags: string[];
  isActive: boolean;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  client?: {
    id: string;
    clientId: string;
    name: string;
    email?: string;
    phone: string;
    address?: string;
    city?: string;
    state?: string;
  };
  assignedLawyerUser?: {
    id: string;
    name: string;
    email: string;
    role: string;
    avatar?: string;
  };
  createdBy?: {
    id: string;
    name: string;
    role: string;
  };
}

export interface CaseStats {
  totalCases: number;
  activeCases: number;
  pendingCases: number;
  closedCases: number;
  highPriorityCases: number;
  urgentCases: number;
  casesWithUpcomingHearings: number;
}

/**
 * Create a new case
 */
export const createCase = async (caseData: CreateCaseData): Promise<{ case: Case }> => {
  try {
    const response = await api.post<{ case: Case }>('/cases', caseData);
    return response.data!;
  } catch (error) {
    if (error instanceof ApiError) {
      throw new Error(error.message);
    }
    throw new Error('Failed to create case');
  }
};

/**
 * Get all cases with filters and pagination
 */
export const getAllCases = async (filters: CaseFilters = {}): Promise<{
  cases: Case[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    limit: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}> => {
  try {
    const queryParams = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });

    const response = await api.get<{
      cases: Case[];
      pagination: {
        currentPage: number;
        totalPages: number;
        totalCount: number;
        limit: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
      };
    }>(`/cases?${queryParams.toString()}`);
    
    return response.data!;
  } catch (error) {
    if (error instanceof ApiError) {
      throw new Error(error.message);
    }
    throw new Error('Failed to fetch cases');
  }
};

/**
 * Get case by ID
 */
export const getCaseById = async (id: string): Promise<{ case: Case }> => {
  try {
    const response = await api.get<{ case: Case }>(`/cases/${id}`);
    return response.data!;
  } catch (error) {
    if (error instanceof ApiError) {
      throw new Error(error.message);
    }
    throw new Error('Failed to fetch case');
  }
};

/**
 * Update case
 */
export const updateCase = async (id: string, updateData: UpdateCaseData): Promise<{ case: Case }> => {
  try {
    const response = await api.put<{ case: Case }>(`/cases/${id}`, updateData);
    return response.data!;
  } catch (error) {
    if (error instanceof ApiError) {
      throw new Error(error.message);
    }
    throw new Error('Failed to update case');
  }
};

/**
 * Delete case (soft delete)
 */
export const deleteCase = async (id: string): Promise<void> => {
  try {
    await api.delete(`/cases/${id}`);
  } catch (error) {
    if (error instanceof ApiError) {
      throw new Error(error.message);
    }
    throw new Error('Failed to delete case');
  }
};

/**
 * Get case statistics
 */
export const getCaseStats = async (): Promise<{ stats: CaseStats }> => {
  try {
    const response = await api.get<{ stats: CaseStats }>('/cases/stats');
    return response.data!;
  } catch (error) {
    if (error instanceof ApiError) {
      throw new Error(error.message);
    }
    throw new Error('Failed to fetch case statistics');
  }
};
