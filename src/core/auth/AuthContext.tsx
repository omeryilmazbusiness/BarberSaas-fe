import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { AuthSession, Tenant, User } from '../types/domain';
import { sessionStore } from './sessionStore';
import type { AppServices } from '../di/container';
import type { LoginInput } from '../../features/auth/services/AuthService';

interface AuthContextValue {
  user: User | null;
  tenant: Tenant | null;
  isAuthenticated: boolean;
  isBootstrapping: boolean;
  services: AppServices;
  login: (input: LoginInput) => Promise<void>;
  logout: () => Promise<void>;
  refreshMe: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
  services: AppServices;
  children: React.ReactNode;
}

export function AuthProvider({ services, children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const session = await sessionStore.load();
        if (cancelled || !session) {
          return;
        }
        setUser(session.user);
        setTenant(session.tenant);
      } finally {
        if (!cancelled) {
          setIsBootstrapping(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const applySession = useCallback((session: AuthSession) => {
    setUser(session.user);
    setTenant(session.tenant);
  }, []);

  const login = useCallback(
    async (input: LoginInput) => {
      const session = await services.auth.login(input);
      await sessionStore.save(session);
      applySession(session);
    },
    [services.auth, applySession],
  );

  const logout = useCallback(async () => {
    await sessionStore.clear();
    setUser(null);
    setTenant(null);
  }, []);

  const refreshMe = useCallback(async () => {
    const me = await services.auth.me();
    setUser(me.user);
    setTenant(me.tenant);
    const token = await sessionStore.getAccessToken();
    if (token) {
      await sessionStore.save({
        access_token: token,
        token_type: 'Bearer',
        expires_at:
          (await sessionStore.load())?.expires_at ??
          new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
        user: me.user,
        tenant: me.tenant,
      });
    }
  }, [services.auth]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      tenant,
      isAuthenticated: Boolean(user && tenant),
      isBootstrapping,
      services,
      login,
      logout,
      refreshMe,
    }),
    [user, tenant, isBootstrapping, services, login, logout, refreshMe],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
