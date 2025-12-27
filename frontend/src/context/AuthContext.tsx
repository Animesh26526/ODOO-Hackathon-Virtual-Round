import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { User, UserRole, AuthState } from '@/types';
import { authLogin, authRegister } from '@/services/api';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string, role?: string) => Promise<boolean>;
  logout: () => void;
  hasRole: (roles: UserRole[]) => boolean;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Role permissions map
const rolePermissions: Record<UserRole, string[]> = {
  ADMIN: ['*'], // All permissions
  MANAGER: [
    'dashboard.view',
    'equipment.view', 'equipment.create', 'equipment.edit',
    'requests.view', 'requests.create', 'requests.assign', 'requests.schedule',
    'teams.view', 'teams.manage',
    'reports.view',
  ],
  TECHNICIAN: [
    'dashboard.view',
    'equipment.view',
    'requests.view', 'requests.update-status',
  ],
  USER: [
    'dashboard.view',
    'equipment.view',
    'requests.view', 'requests.create',
  ],
};

export function AuthProvider({ children }: { children: ReactNode }) {
  // initialize auth state from localStorage so UI permissions are available on first render
  const getInitialAuth = (): AuthState => {
    try {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      const user = userStr ? (JSON.parse(userStr) as User) : null;
      return { user, isAuthenticated: !!token && !!user, token: token || null };
    } catch (err) {
      return { user: null, isAuthenticated: false, token: null };
    }
  };

  const [authState, setAuthState] = useState<AuthState>(getInitialAuth);

  const login = useCallback(async (email: string, _password: string): Promise<boolean> => {
    try {
      const res = await authLogin(email, _password);
      if (res && res.token) {
        const { token, user } = res;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        setAuthState({ user, isAuthenticated: true, token });
        return true;
      }
      return false;
    } catch (err) {
      console.error('Login failed', err);
      return false;
    }
  }, []);

  const register = useCallback(async (name: string, email: string, password: string, role?: string): Promise<boolean> => {
    try {
      const res = await authRegister({ name, email, password, role });
      // if registration succeeded, attempt to login to get token
      if (res) {
        try {
          const loginRes: unknown = await authLogin(email, password);
          if (loginRes && typeof loginRes === 'object' && 'token' in (loginRes as any)) {
            const { token, user } = loginRes as { token: string; user: User };
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            setAuthState({ user, isAuthenticated: true, token });
          }
        } catch (e) {
          // ignore login-after-register errors
        }
        return true;
      }
      return false;
    } catch (err) {
      console.error('Register failed', err);
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setAuthState({ user: null, isAuthenticated: false, token: null });
  }, []);

  const hasRole = useCallback((roles: UserRole[]): boolean => {
    if (!authState.user) return false;
    return roles.includes(authState.user.role);
  }, [authState.user]);

  const hasPermission = useCallback((permission: string): boolean => {
    if (!authState.user) return false;
    const permissions = rolePermissions[authState.user.role];
    return permissions.includes('*') || permissions.includes(permission);
  }, [authState.user]);

  return (
    <AuthContext.Provider value={{ ...authState, login, register, logout, hasRole, hasPermission }}>
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
