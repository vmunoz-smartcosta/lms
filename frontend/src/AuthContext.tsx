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
  certificados?: any[];
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  status: 'authenticated' | 'unauthenticated' | 'pending_approval' | 'admin';
  isAdmin: boolean;
  /** documentId de la empresa que acota los datos, o null si el alcance es global. */
  empresaScopeId: string | null;
  /** true solo para un administrador sin empresa asignada: ve todas las empresas. */
  hasGlobalScope: boolean;
  signUp: (data: any) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: (isInitial?: boolean) => Promise<void>;
}

export const ROL_ADMINISTRADOR = 'administrador';

export const esAdministrador = (nombreRol?: string | null) =>
  nombreRol?.toLowerCase() === ROL_ADMINISTRADOR;

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
      const { data } = await api.get('/users/me?populate[rol][populate]=*&populate[empresa][populate]=*&populate[solicitud][populate]=*&populate[certificados][populate]=*');
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
  // Strapi espera el campo "identifier", que acepta email o username; aqui siempre
  // se manda el correo.
  const login = useCallback(async (email: string, password: string) => {
    const { data } = await api.post('/auth/local', { identifier: email, password });
    localStorage.setItem('jwt', data.jwt);
    setUser(data.user);
    await refreshUser();
  }, [refreshUser]);

  // 6. RBAC Logic
  const isAdmin = useMemo(() => esAdministrador(user?.rol?.nombre), [user]);

  // La empresa asignada acota los datos que se ven, y lo hace tambien para un
  // administrador. Solo un administrador SIN empresa tiene alcance global.
  const empresaScopeId = useMemo(() => user?.empresa?.documentId ?? null, [user]);
  const hasGlobalScope = isAdmin && !empresaScopeId;

  const status = useMemo((): AuthContextType['status'] => {
    if (!user) return 'unauthenticated';

    const isApproved = user.solicitud?.aprobado === true;
    const hasCompany = !!user.empresa;

    if (isAdmin) return 'admin';
    if (hasCompany && isApproved) return 'authenticated';

    return 'pending_approval';
  }, [user, isAdmin]);

  const value = useMemo(() => ({
    user,
    loading,
    status,
    isAdmin,
    empresaScopeId,
    hasGlobalScope,
    signUp,
    login,
    logout,
    refreshUser
  }), [user, loading, status, isAdmin, empresaScopeId, hasGlobalScope, signUp, login, logout, refreshUser]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
