import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { AuthUser, LoginPayload, RegisterPayload } from '../../types/auth';
import { authService } from '../../services/authService';
import { getAuthToken, setAuthToken } from './tokenStorage';
import { AuthContext } from './authContextDef';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setTokenState] = useState<string | null>(() => getAuthToken());
  const [isLoading, setIsLoading] = useState<boolean>(() => !!getAuthToken());
  const initialized = useRef(false);

  const setToken = useCallback((newToken: string | null) => {
    setAuthToken(newToken);
    setTokenState(newToken);
  }, []);

  const logout = useCallback(() => {
    authService.logout().catch(() => {});
    setToken(null);
    setUser(null);
  }, [setToken]);

  // Listen for global auth-expired event from API client
  useEffect(() => {
    const handleAuthExpired = () => {
      logout();
    };
    window.addEventListener('gathercart:auth-expired', handleAuthExpired);
    return () => window.removeEventListener('gathercart:auth-expired', handleAuthExpired);
  }, [logout]);

  // On mount, verify existing session token
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const savedToken = getAuthToken();
    if (savedToken) {
      authService.getMe()
        .then((userData) => {
          setUser(userData);
        })
        .catch(() => {
          setToken(null);
        })
        .finally(() => setIsLoading(false));
    }
  }, [setToken]);

  const login = useCallback(async (payload: LoginPayload) => {
    const response = await authService.login(payload);
    setToken(response.token);
    setUser({
      id: response.id,
      fullName: response.fullName,
      email: response.email,
      phone: response.phone,
      role: response.role as 'CUSTOMER' | 'ADMIN',
    });
  }, [setToken]);

  const register = useCallback(async (payload: RegisterPayload) => {
    const response = await authService.register(payload);
    setToken(response.token);
    setUser({
      id: response.id,
      fullName: response.fullName,
      email: response.email,
      phone: response.phone,
      role: response.role as 'CUSTOMER' | 'ADMIN',
    });
  }, [setToken]);

  const updateUser = useCallback((updatedUser: AuthUser) => {
    setUser(updatedUser);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
