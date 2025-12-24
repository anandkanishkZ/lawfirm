'use client';

import { useState, useEffect, createContext, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@/types';
import { authApi } from '@/lib/api/auth';
import { ApiError } from '@/lib/api/client';
import { toast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string, role: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  error: string | null;
  updateProfile: (data: { name?: string; avatar?: string }) => Promise<boolean>;
  changePassword: (currentPassword: string, newPassword: string, confirmPassword: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Function to handle logout with redirect
  const handleLogoutAndRedirect = (message?: string) => {
    localStorage.removeItem('auth-token');
    setUser(null);
    setError(null);
    
    if (message) {
      // Store message in sessionStorage to show after redirect
      sessionStorage.setItem('auth-message', message);
    }
    
    router.push('/');
  };

  useEffect(() => {
    // Check if user is logged in on page load
    const initializeAuth = async () => {
      const token = localStorage.getItem('auth-token');
      if (token) {
        try {
          const userData = await authApi.getMe();
          // Convert role to lowercase to match frontend expectations
          const normalizedUser = {
            ...userData,
            role: userData.role.toLowerCase() as User['role'],
          };
          setUser(normalizedUser);
        } catch (error) {
          // Token is invalid or expired, remove it and redirect
          if (error instanceof ApiError && error.status === 401) {
            handleLogoutAndRedirect('Your session has expired. Please log in again.');
          } else {
            localStorage.removeItem('auth-token');
            console.warn('Failed to authenticate with stored token:', error);
          }
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await authApi.login({ email, password });
      // Convert role to lowercase to match frontend expectations
      const normalizedUser = {
        ...response.user,
        role: response.user.role.toLowerCase() as User['role'],
      };
      setUser(normalizedUser);
      setIsLoading(false);
      return true;
    } catch (error) {
      setIsLoading(false);
      if (error instanceof ApiError) {
        setError(error.message);
      } else {
        setError('Login failed. Please try again.');
      }
      console.error('Login error:', error);
      return false;
    }
  };

  const register = async (email: string, password: string, name: string, role: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await authApi.register({
        email,
        password,
        name,
        role: role.toUpperCase() as 'ADMIN' | 'LAWYER' | 'STAFF' | 'CLIENT',
      });
      // Convert role to lowercase to match frontend expectations
      const normalizedUser = {
        ...response.user,
        role: response.user.role.toLowerCase() as User['role'],
      };
      setUser(normalizedUser);
      setIsLoading(false);
      return true;
    } catch (error) {
      setIsLoading(false);
      if (error instanceof ApiError) {
        setError(error.message);
      } else {
        setError('Registration failed. Please try again.');
      }
      console.error('Registration error:', error);
      return false;
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authApi.logout();
    } catch (error) {
      console.warn('Logout API error:', error);
    } finally {
      handleLogoutAndRedirect('You have been logged out successfully.');
      setIsLoading(false);
    }
  };

  const updateProfile = async (data: { name?: string; avatar?: string }): Promise<boolean> => {
    if (!user) return false;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const updatedUser = await authApi.updateProfile(data);
      // Convert role to lowercase to match frontend expectations
      const normalizedUser = {
        ...updatedUser,
        role: updatedUser.role.toLowerCase() as User['role'],
      };
      setUser(normalizedUser);
      setIsLoading(false);
      return true;
    } catch (error) {
      setIsLoading(false);
      if (error instanceof ApiError) {
        setError(error.message);
      } else {
        setError('Profile update failed. Please try again.');
      }
      console.error('Profile update error:', error);
      return false;
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string, confirmPassword: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      await authApi.changePassword({ currentPassword, newPassword, confirmPassword });
      setIsLoading(false);
      return true;
    } catch (error) {
      setIsLoading(false);
      if (error instanceof ApiError) {
        setError(error.message);
      } else {
        setError('Password change failed. Please try again.');
      }
      console.error('Password change error:', error);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      register, 
      logout, 
      isLoading, 
      error,
      updateProfile,
      changePassword 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};