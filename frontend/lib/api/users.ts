import { api, ApiError } from './client';

export interface CreateUserData {
  email: string;
  password: string;
  name: string;
  role?: 'ADMIN' | 'LAWYER' | 'STAFF' | 'CLIENT';
  avatar?: string;
}

export interface UpdateUserData {
  name?: string;
  avatar?: string;
  role?: 'ADMIN' | 'LAWYER' | 'STAFF' | 'CLIENT';
  isActive?: boolean;
}

export interface UserFilters {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  isActive?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'LAWYER' | 'STAFF' | 'CLIENT';
  avatar?: string;
  isActive: boolean;
  lastLoginSuccess?: string;
  lastLoginAttempt?: string;
  failedLoginAttempts: number;
  lockedUntil?: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    assignedClients: number;
    assignedCases: number;
    createdClients: number;
    createdCases: number;
  };
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  roles: {
    admin: number;
    lawyer: number;
    staff: number;
    client: number;
  };
  lockedAccounts: number;
  recentlyCreated: number;
}

/**
 * Fetch all users with optional filters
 */
export async function getUsers(filters?: UserFilters): Promise<{
  users: User[];
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

    const response = await api.get(`/users?${params.toString()}`);
    return (response.data as {
      users: User[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    });
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Failed to fetch users', 500);
  }
}

/**
 * Fetch a single user by ID
 */
export async function getUserById(id: string): Promise<User> {
  try {
    const response = await api.get(`/users/${id}`);
    return (response.data as { user: User }).user;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Failed to fetch user', 500);
  }
}

/**
 * Create a new user
 */
export async function createUser(data: CreateUserData): Promise<User> {
  try {
    console.log('🔵 createUser called with:', data);
    const response = await api.post('/users', data);
    console.log('✅ createUser response:', response);
    return (response.data as { user: User }).user;
  } catch (error) {
    console.error('❌ createUser error:', error);
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Failed to create user', 500);
  }
}

/**
 * Update an existing user
 */
export async function updateUser(id: string, data: UpdateUserData): Promise<User> {
  try {
    const response = await api.put(`/users/${id}`, data);
    return (response.data as { user: User }).user;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Failed to update user', 500);
  }
}

/**
 * Delete a user (soft delete)
 */
export async function deleteUser(id: string): Promise<void> {
  try {
    await api.delete(`/users/${id}`);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Failed to delete user', 500);
  }
}

/**
 * Get user statistics
 */
export async function getUserStats(): Promise<UserStats> {
  try {
    const response = await api.get('/users/stats');
    return (response.data as { stats: UserStats }).stats;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Failed to fetch user statistics', 500);
  }
}
