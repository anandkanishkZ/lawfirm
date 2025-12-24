import { api, ApiError } from './client';

export interface CreateClientData {
  name: string;
  email?: string;
  phone: string;
  alternatePhone?: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  country?: string;
  panNumber?: string;
  citizenshipNo?: string;
  nationalId?: string;
  passportNo?: string;
  companyName?: string;
  companyType?: string;
  cinNumber?: string;
  clientType?: 'INDIVIDUAL' | 'COMPANY' | 'PARTNERSHIP' | 'TRUST' | 'SOCIETY';
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  assignedLawyerId?: string;
  notes?: string;
  tags?: string[];
}

export interface UpdateClientData extends Partial<CreateClientData> {
  kycStatus?: 'PENDING' | 'UNDER_REVIEW' | 'VERIFIED' | 'REJECTED' | 'INCOMPLETE';
  isActive?: boolean;
}

export interface ClientFilters {
  page?: number;
  limit?: number;
  search?: string;
  clientType?: string;
  kycStatus?: string;
  priority?: string;
  assignedLawyerId?: string;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface Client {
  id: string;
  clientId: string;
  name: string;
  email?: string;
  phone: string;
  alternatePhone?: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  panNumber?: string;
  citizenshipNo?: string;
  nationalId?: string;
  passportNo?: string;
  companyName?: string;
  companyType?: string;
  cinNumber?: string;
  clientType: 'INDIVIDUAL' | 'COMPANY' | 'PARTNERSHIP' | 'TRUST' | 'SOCIETY';
  kycStatus: 'PENDING' | 'UNDER_REVIEW' | 'VERIFIED' | 'REJECTED' | 'INCOMPLETE';
  isActive: boolean;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  assignedLawyerId?: string;
  createdById: string;
  notes?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  assignedLawyer?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  createdBy?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export interface ClientStats {
  totalClients: number;
  activeClients: number;
  pendingKyc: number;
  verifiedKyc: number;
  individualClients: number;
  companyClients: number;
}

/**
 * Create a new client
 */
export const createClient = async (clientData: CreateClientData): Promise<{ client: Client }> => {
  try {
    const response = await api.post<{ client: Client }>('/clients', clientData);
    return response.data!;
  } catch (error) {
    if (error instanceof ApiError) {
      throw new Error(error.message);
    }
    throw new Error('Failed to create client');
  }
};

/**
 * Get all clients with filters and pagination
 */
export const getAllClients = async (filters: ClientFilters = {}): Promise<{
  clients: Client[];
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
      clients: Client[];
      pagination: {
        currentPage: number;
        totalPages: number;
        totalCount: number;
        limit: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
      };
    }>(`/clients?${queryParams.toString()}`);
    
    // Debug logging
    console.log('🔍 getAllClients API Response:', response);
    console.log('🔍 Response.data:', response.data);
    console.log('🔍 Clients array:', response.data?.clients);
    console.log('🔍 Clients count:', response.data?.clients?.length);
    
    // The response structure is { status: 'success', data: { clients, pagination } }
    // So we need to access response.data to get the actual data
    return response.data!;
  } catch (error) {
    if (error instanceof ApiError) {
      throw new Error(error.message);
    }
    throw new Error('Failed to fetch clients');
  }
};

/**
 * Get client by ID
 */
export const getClientById = async (id: string): Promise<{ client: Client }> => {
  try {
    const response = await api.get<{ client: Client }>(`/clients/${id}`);
    return response.data!;
  } catch (error) {
    if (error instanceof ApiError) {
      throw new Error(error.message);
    }
    throw new Error('Failed to fetch client');
  }
};

/**
 * Update client
 */
export const updateClient = async (id: string, updateData: UpdateClientData): Promise<{ client: Client }> => {
  try {
    const response = await api.put<{ client: Client }>(`/clients/${id}`, updateData);
    return response.data!;
  } catch (error) {
    if (error instanceof ApiError) {
      throw new Error(error.message);
    }
    throw new Error('Failed to update client');
  }
};

/**
 * Delete client (soft delete)
 */
export const deleteClient = async (id: string): Promise<void> => {
  try {
    await api.delete(`/clients/${id}`);
  } catch (error) {
    if (error instanceof ApiError) {
      throw new Error(error.message);
    }
    throw new Error('Failed to delete client');
  }
};

/**
 * Get client statistics
 */
export const getClientStats = async (): Promise<{ stats: ClientStats }> => {
  try {
    const response = await api.get<{ stats: ClientStats }>('/clients/stats');
    return response.data!;
  } catch (error) {
    if (error instanceof ApiError) {
      throw new Error(error.message);
    }
    throw new Error('Failed to fetch client statistics');
  }
};