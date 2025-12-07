'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI, tokenManager } from '../lib/api/auth';
import { useRouter } from 'next/navigation';

interface User {
  uuid: string;
  email?: string;
  displayName: string;
  roles: string[];
  status: string;
  accountType: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user is already authenticated on mount
    checkAuth();

    // Add event listeners for tab focus and storage changes
    const handleFocus = () => {
      console.log('Tab focused, rechecking auth...');
      checkAuth();
    };

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'authToken') {
        console.log('Auth token changed in storage, rechecking auth...');
        checkAuth();
      }
    };

    window.addEventListener('focus', handleFocus);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const checkAuth = () => {
    setIsLoading(true);
    const storedToken = tokenManager.getToken();
    
    if (storedToken) {
      // Validate token format and expiry
      try {
        const parts = storedToken.split('.');
        if (parts.length === 3 && parts[1]) {
          const payload = JSON.parse(atob(parts[1]));
          
          // Check if token is expired
          const currentTime = Math.floor(Date.now() / 1000);
          if (payload.exp && payload.exp < currentTime) {
            console.warn('Token expired, clearing auth state');
            tokenManager.removeToken();
            setToken(null);
            setUser(null);
            setIsLoading(false);
            return;
          }

          setToken(storedToken);
          setUser({
            uuid: payload.userId,
            email: payload.email,
            displayName: payload.email || payload.name || 'Admin',
            roles: payload.roles || [],
            status: 'active',
            accountType: 'individual',
          });
          console.log('Auth state restored from token');
        } else {
          throw new Error('Invalid token format');
        }
      } catch (error) {
        console.error('Failed to decode token:', error);
        tokenManager.removeToken();
        setToken(null);
        setUser(null);
      }
    } else {
      console.log('No stored token found');
      setToken(null);
      setUser(null);
    }
    
    setIsLoading(false);
  };

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      console.log('AuthContext: Attempting login...');
      const response = await authAPI.login(email, password);
      console.log('AuthContext: Login response received', { hasToken: !!response.token, hasUser: !!response.user });

      // Validate the response
      if (!response.token || !response.user) {
        throw new Error('Invalid response from server');
      }

      // Token is already stored in localStorage by authAPI.login
      // Now update the state immediately
      setToken(response.token);
      setUser({
        uuid: response.user.uuid,
        email: response.user.email,
        displayName: response.user.displayName || response.user.name || response.user.email || 'Admin',
        roles: response.user.roles || [],
        status: response.user.status || 'active',
        accountType: response.user.accountType || 'individual',
      });
      
      setIsLoading(false);
      console.log('AuthContext: State updated successfully');
    } catch (error: any) {
      setIsLoading(false);
      console.error('AuthContext: Login error', error);
      throw new Error(error.message || 'Login failed');
    }
  };

  const logout = () => {
    console.log('AuthContext: Logging out...');
    authAPI.logout();
    setToken(null);
    setUser(null);
    router.push('/admin/login');
  };

  // Use state-based authentication status instead of computed property
  const isAuthenticated = !!token && !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated,
        login,
        logout,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
