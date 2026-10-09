import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, ApiError } from '../lib/api';
import { User, UserRole } from '../types';
import { useToast } from './ToastContext';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  hasRole: (roles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { success, error } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const data = await api.get<{ user: User }>('/auth/me');
        if (data?.user) {
          setUser(data.user);
        }
      } catch (err) {
        localStorage.removeItem('auth_token');
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const data = await api.post<{ user: User; token: string }>('/auth/login', {
        email,
        password: pass,
      });

      if (data?.token) {
        localStorage.setItem('auth_token', data.token);
      }
      setUser(data.user);
      success(`Welcome back, ${data.user.name}`);
    } catch (err: any) {
      const msg = err instanceof ApiError ? err.message : 'Invalid login credentials';
      error(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      // Ignore logout API failures
    } finally {
      localStorage.removeItem('auth_token');
      setUser(null);
      success('Logged out successfully');
    }
  };

  const hasRole = (roles: UserRole[]): boolean => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
