import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import api from './services/api';

// --- Interfaces ---
interface User {
  id: number;
  documentId: string;
  username: string;
  email: string;
  rol?: { id: number; documentId: string; nombre: string };
  empresa?: { id: number; documentId: string; nombre: string };
  solicitud?: { id: number; documentId: string; aprobado: boolean };
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  status: 'authenticated' | 'unauthenticated' | 'pending_approval' | 'admin';
  signUp: (data: any) => Promise<void>;
  login: (identifier: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: (isInitial?: boolean) => Promise<void>;
}

// --- Context & Hook ---
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

// --- Provider ---
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // 1. Refresh User Data
  const refreshUser = useCallback(async (isInitial = false) => {
    const token = localStorage.getItem('jwt');
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      if (!isInitial) setLoading(true);
      console.log('[Auth] Refreshing user...');
      const { data } = await api.get('/users/me?populate[rol][populate]=*&populate[empresa][populate]=*&populate[solicitud][populate]=*');
      setUser(data);
      console.log('[Auth] User loaded:', data.username);
    } catch (error) {
      console.error('[Auth] Refresh failed:', error);
      localStorage.removeItem('jwt');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // 2. Initial Auth Check
  useEffect(() => {
    refreshUser(true);
  }, [refreshUser]);

  // 3. Logout (Simple and robust)
  const logout = useCallback(async () => {
    console.log('[Auth] Logout initiated');
    try {
      // Intentamos avisar al backend, pero no bloqueamos el proceso local
      api.post('/auth/logout').catch(() => {});
    } catch (e) {}

    localStorage.removeItem('jwt');
    setUser(null);
    setLoading(false);
    console.log('[Auth] Local state cleared');
  }, []);

  // 4. Registration
  const signUp = useCallback(async (registrationData: any) => {
    const { data } = await api.post('/auth/local/register', registrationData);
    localStorage.setItem('jwt', data.jwt);
    
    // Crear la solicitud automáticamente para el nuevo usuario
    try {
      await api.post('/solicitudes', {
        data: {
          aprobado: false,
          users_permissions_user: data.user.id
        }
      });
      console.log('[Auth] Solicitud creada para:', data.user.username);
    } catch (err) {
      console.error('[Auth] Error creando solicitud:', err);
    }

    setUser(data.user);
    await refreshUser();
  }, [refreshUser]);

  // 5. Login
  const login = useCallback(async (identifier: string, password: string) => {
    const { data } = await api.post('/auth/local', { identifier, password });
    localStorage.setItem('jwt', data.jwt);
    setUser(data.user);
    await refreshUser();
  }, [refreshUser]);

  // 6. RBAC Logic
  const status = useMemo((): AuthContextType['status'] => {
    if (!user) return 'unauthenticated';

    const isAdmin = user.rol?.nombre.toLowerCase() === 'administrador';
    const isApproved = user.solicitud?.aprobado === true;
    const hasCompany = !!user.empresa;

    if (isAdmin) return 'admin';
    if (hasCompany && isApproved) return 'authenticated';
    
    return 'pending_approval';
  }, [user]);

  const value = useMemo(() => ({
    user,
    loading,
    status,
    signUp,
    login,
    logout,
    refreshUser
  }), [user, loading, status, signUp, login, logout, refreshUser]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
