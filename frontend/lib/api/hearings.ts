import { api, ApiError } from './client';

export interface CreateHearingData {
  caseId: string;
  title: string;
  type?: 'PRELIMINARY' | 'EVIDENCE' | 'ARGUMENTS' | 'FINAL' | 'INTERIM' | 'URGENT';
  hearingDate: string | Date;
  startTime: string;
  endTime?: string;
  duration?: number;
  court: string;
  courtroom?: string;
  judge?: string;
  notes?: string;
  reminderDate?: string | Date;
}

export interface UpdateHearingData extends Partial<CreateHearingData> {
  status?: 'SCHEDULED' | 'COMPLETED' | 'POSTPONED' | 'CANCELLED';
  outcome?: string;
  nextHearingDate?: string | Date;
  reminderSent?: boolean;
}

export interface HearingFilters {
  page?: number;
  limit?: number;
  search?: string;
  caseId?: string;
  lawyerId?: string;
  status?: string;
  type?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface Hearing {
  id: string;
  caseId: string;
  title: string;
  type: 'PRELIMINARY' | 'EVIDENCE' | 'ARGUMENTS' | 'FINAL' | 'INTERIM' | 'URGENT';
  status: 'SCHEDULED' | 'COMPLETED' | 'POSTPONED' | 'CANCELLED';
  hearingDate: string;
  startTime: string;
  endTime?: string;
  duration?: number;
  court: string;
  courtroom?: string;
  judge?: string;
  caseName: string;
  lawyerId: string;
  lawyerName: string;
  notes?: string;
  outcome?: string;
  nextHearingDate?: string;
  reminderSent: boolean;
  reminderDate?: string;
  createdAt: string;
  updatedAt: string;
  case?: {
    id: string;
    caseNumber: string;
    title: string;
    status: string;
    client?: {
      id: string;
      name: string;
      email?: string;
      phone: string;
    };
  };
  lawyer?: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    role: string;
  };
}

export interface HearingStats {
  totalHearings: number;
  scheduledHearings: number;
  completedHearings: number;
  postponedHearings: number;
  cancelledHearings: number;
  upcomingHearings: number;
}

/**
 * Fetch all hearings with optional filters
 */
export async function getHearings(filters?: HearingFilters): Promise<{
  hearings: Hearing[];
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

    const response = await api.get(`/hearings?${params.toString()}`);
    return response.data as { hearings: Hearing[]; pagination: { page: number; limit: number; total: number; totalPages: number; } };
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Failed to fetch hearings', 500);
  }
}

/**
 * Fetch a single hearing by ID
 */
export async function getHearingById(id: string): Promise<Hearing> {
  try {
    const response = await api.get(`/hearings/${id}`);
    return (response.data as { hearing: Hearing }).hearing;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Failed to fetch hearing', 500);
  }
}

/**
 * Create a new hearing
 */
export async function createHearing(data: CreateHearingData): Promise<Hearing> {
  try {
    console.log('🔵 createHearing called with:', data);
    const response = await api.post('/hearings', data);
    console.log('✅ createHearing response:', response);
    return (response.data as { hearing: Hearing }).hearing;
  } catch (error) {
    console.error('❌ createHearing error:', error);
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Failed to create hearing', 500);
  }
}

/**
 * Update an existing hearing
 */
export async function updateHearing(id: string, data: UpdateHearingData): Promise<Hearing> {
  try {
    const response = await api.put(`/hearings/${id}`, data);
    return (response.data as { hearing: Hearing }).hearing;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Failed to update hearing', 500);
  }
}

/**
 * Delete a hearing
 */
export async function deleteHearing(id: string): Promise<void> {
  try {
    await api.delete(`/hearings/${id}`);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Failed to delete hearing', 500);
  }
}

/**
 * Get upcoming hearings (next 7 days)
 */
export async function getUpcomingHearings(lawyerId?: string): Promise<Hearing[]> {
  try {
    const params = new URLSearchParams();
    if (lawyerId) {
      params.append('lawyerId', lawyerId);
    }

    const response = await api.get(`/hearings/upcoming?${params.toString()}`);
    return (response.data as { hearings: Hearing[] }).hearings;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Failed to fetch upcoming hearings', 500);
  }
}

/**
 * Get hearing statistics
 */
export async function getHearingStats(filters?: { lawyerId?: string; startDate?: string; endDate?: string }): Promise<HearingStats> {
  try {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });
    }

    const response = await api.get(`/hearings/stats?${params.toString()}`);
    return (response.data as { stats: HearingStats }).stats;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Failed to fetch hearing statistics', 500);
  }
}
