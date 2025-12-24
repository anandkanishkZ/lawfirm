// API Configuration and utilities
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface ApiResponse<T> {
  status: 'success' | 'error';
  message: string;
  data?: T;
  errors?: Array<{
    field: string;
    message: string;
    value?: any;
  }>;
}

class ApiError extends Error {
  status: number;
  errors?: Array<{ field: string; message: string; value?: any }>;

  constructor(message: string, status: number, errors?: Array<{ field: string; message: string; value?: any }>) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
  }
}

// Function to handle token expiration
function handleTokenExpiration() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth-token');
    sessionStorage.setItem('auth-message', 'Your session has expired. Please log in again.');
    window.location.href = '/';
  }
}

/**
 * Make HTTP request to API
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
  };

  // Get token from localStorage for now (we'll improve this later)
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth-token') : null;
  if (token) {
    defaultHeaders.Authorization = `Bearer ${token}`;
  }

  const config: RequestInit = {
    credentials: 'include', // Include cookies
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    
    // Check if response is JSON
    let data;
    try {
      data = await response.json();
    } catch (parseError) {
      throw new ApiError(
        'Invalid server response. Please try again.',
        response.status || 500
      );
    }

    if (!response.ok) {
      const apiError = new ApiError(
        data.message || `HTTP Error ${response.status}`,
        response.status,
        data.errors
      );
      
      // Handle 401 Unauthorized - token expired
      if (response.status === 401 && !endpoint.includes('/auth/login')) {
        handleTokenExpiration();
      }
      
      throw apiError;
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    // Handle different types of network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new ApiError(
        'Unable to connect to server. Please check if the backend is running.',
        0
      );
    }

    // Generic network or other errors
    throw new ApiError(
      'Network error. Please check your internet connection and try again.',
      0
    );
  }
}

/**
 * API request methods
 */
export const api = {
  get: <T>(endpoint: string, options?: RequestInit) => 
    apiRequest<T>(endpoint, { method: 'GET', ...options }),

  post: <T>(endpoint: string, data?: any, options?: RequestInit) => 
    apiRequest<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    }),

  put: <T>(endpoint: string, data?: any, options?: RequestInit) => 
    apiRequest<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    }),

  delete: <T>(endpoint: string, options?: RequestInit) => 
    apiRequest<T>(endpoint, { method: 'DELETE', ...options }),
};

export { ApiError };
export type { ApiResponse };