import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '../services/api';
import { User, DemoUser } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  demoUsers: DemoUser[];
  login: (email: string, password?: string) => Promise<void>;
  switchDemoUser: (email: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('certiflow_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('certiflow_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [demoUsers, setDemoUsers] = useState<DemoUser[]>([]);

  const fetchDemoUsers = async () => {
    try {
      const res = await api.get('/auth/demo-users');
      if (res.data.success) {
        setDemoUsers(res.data.demoUsers);
      }
    } catch (e) {
      console.warn('Could not fetch demo users list:', e);
    }
  };

  const refreshUser = async () => {
    if (!token) {
      setIsLoading(false);
      return;
    }
    try {
      const res = await api.get('/auth/me');
      if (res.data.success) {
        setUser(res.data.user);
        localStorage.setItem('certiflow_user', JSON.stringify(res.data.user));
      }
    } catch (e) {
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDemoUsers();
    refreshUser();
  }, []);

  const login = async (email: string, password = 'Password123!') => {
    setIsLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data.success) {
        const { token: newToken, user: newUser } = res.data;
        setToken(newToken);
        setUser(newUser);
        localStorage.setItem('certiflow_token', newToken);
        localStorage.setItem('certiflow_user', JSON.stringify(newUser));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const switchDemoUser = async (email: string) => {
    setIsLoading(true);
    try {
      const res = await api.post('/auth/demo-switch', { email });
      if (res.data.success) {
        const { token: newToken, user: newUser } = res.data;
        setToken(newToken);
        setUser(newUser);
        localStorage.setItem('certiflow_token', newToken);
        localStorage.setItem('certiflow_user', JSON.stringify(newUser));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('certiflow_token');
    localStorage.removeItem('certiflow_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        demoUsers,
        login,
        switchDemoUser,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
