import React, { createContext, useState, useEffect, useCallback, useRef } from 'react';
import type { AuthUser, LoginPayload, RegisterPayload } from '../../types/auth';
import { authService } from '../../services/authService';

export interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Token stored in module-level variable (not localStorage) for security.
// A ref in the provider keeps it across renders.
let moduleToken: string | null = null;

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const initialized = useRef(false);

  const setToken = useCallback((newToken: string | null) => {
    moduleToken = newToken;
    setTokenState(newToken);
  }, []);

  // On mount, try to restore session from sessionStorage (survives page refresh within tab)
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const savedToken = sessionStorage.getItem('gc_token');
    if (savedToken) {
      setToken(savedToken);
      authService.getMe()
        .then((userData) => {
          setUser(userData);
        })
        .catch(() => {
          setToken(null);
          sessionStorage.removeItem('gc_token');
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [setToken]);

  const login = useCallback(async (payload: LoginPayload) => {
    const response = await authService.login(payload);
    setToken(response.token);
    sessionStorage.setItem('gc_token', response.token);
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
    sessionStorage.setItem('gc_token', response.token);
    setUser({
      id: response.id,
      fullName: response.fullName,
      email: response.email,
      phone: response.phone,
      role: response.role as 'CUSTOMER' | 'ADMIN',
    });
  }, [setToken]);

  const logout = useCallback(() => {
    authService.logout().catch(() => {});
    setToken(null);
    setUser(null);
    sessionStorage.removeItem('gc_token');
  }, [setToken]);

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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Exported for the axios interceptor to read
export function getAuthToken(): string | null {
  return moduleToken;
}
