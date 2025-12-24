import { api, ApiError } from './client';
import { User } from '@/types';

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  role?: 'ADMIN' | 'LAWYER' | 'STAFF' | 'CLIENT';
}

interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface UpdateProfileRequest {
  name?: string;
  avatar?: string;
}

interface AuthResponse {
  user: User;
  token: string;
}

/**
 * Authentication API service
 */
export const authApi = {
  /**
   * Login user
   */
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    
    if (response.data) {
      // Store token in localStorage
      localStorage.setItem('auth-token', response.data.token);
      return response.data;
    }
    
    throw new ApiError('Login failed', 401);
  },

  /**
   * Register new user
   */
  async register(userData: RegisterRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register', userData);
    
    if (response.data) {
      // Store token in localStorage
      localStorage.setItem('auth-token', response.data.token);
      return response.data;
    }
    
    throw new ApiError('Registration failed', 400);
  },

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      // Continue with logout even if API call fails
      console.warn('Logout API call failed:', error);
    } finally {
      // Always clear local storage
      localStorage.removeItem('auth-token');
    }
  },

  /**
   * Get current user profile
   */
  async getMe(): Promise<User> {
    const response = await api.get<{ user: User }>('/auth/me');
    
    if (response.data) {
      return response.data.user;
    }
    
    throw new ApiError('Failed to get user profile', 401);
  },

  /**
   * Update user profile
   */
  async updateProfile(data: UpdateProfileRequest): Promise<User> {
    const response = await api.put<{ user: User }>('/auth/profile', data);
    
    if (response.data) {
      return response.data.user;
    }
    
    throw new ApiError('Failed to update profile', 400);
  },

  /**
   * Change password
   */
  async changePassword(data: ChangePasswordRequest): Promise<void> {
    await api.put('/auth/change-password', data);
  },

  /**
   * Check if email exists
   */
  async checkEmail(email: string): Promise<boolean> {
    const response = await api.get<{ exists: boolean }>(`/auth/check-email?email=${encodeURIComponent(email)}`);
    
    if (response.data) {
      return response.data.exists;
    }
    
    return false;
  },

  /**
   * Refresh token
   */
  async refreshToken(): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/refresh-token');
    
    if (response.data) {
      // Update token in localStorage
      localStorage.setItem('auth-token', response.data.token);
      return response.data;
    }
    
    throw new ApiError('Token refresh failed', 401);
  },
};