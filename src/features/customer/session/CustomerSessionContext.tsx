import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type {
  CatalogService as CatalogServiceEntity,
  CustomerSession,
} from '../../../core/types/domain';
import type { AppServices } from '../../../core/di/container';
import { sessionStore } from '../../../core/auth/sessionStore';
import { authPortal } from '../../../core/auth/tokenProvider';
import { portalSessionEvents } from '../../../core/auth/portalSessionEvents';
import { customerSessionStore } from './customerSessionStore';

interface CustomerSessionContextValue {
  session: CustomerSession | null;
  isAuthenticated: boolean;
  isBootstrapping: boolean;
  selectedService: CatalogServiceEntity | null;
  services: AppServices;
  loginWithPhone: (shopSlug: string, phone: string) => Promise<void>;
  loginWithGoogle: (shopSlug: string) => Promise<void>;
  logout: () => Promise<void>;
  setSelectedService: (service: CatalogServiceEntity | null) => void;
}

const CustomerSessionContext = createContext<CustomerSessionContextValue | null>(
  null,
);

interface ProviderProps {
  services: AppServices;
  children: React.ReactNode;
}

export function CustomerSessionProvider({ services, children }: ProviderProps) {
  const [session, setSession] = useState<CustomerSession | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [selectedService, setSelectedService] =
    useState<CatalogServiceEntity | null>(null);

  useEffect(() => {
    return portalSessionEvents.onShopLogin(() => {
      setSession(null);
      setSelectedService(null);
    });
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const shopSession = await sessionStore.load();
        if (cancelled) {
          return;
        }
        if (shopSession) {
          // Manager/shop session wins — clear stale customer portal state.
          await customerSessionStore.clear();
          return;
        }
        const stored = await customerSessionStore.load();
        if (!cancelled && stored) {
          authPortal.set('customer');
          setSession(stored);
        }
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

  const loginWithPhone = useCallback(
    async (shopSlug: string, phone: string) => {
      const next = await services.customerAuth.login({
        shop_slug: shopSlug,
        phone,
      });
      // Isolate portals: customer JWT must not ride shop/manager requests.
      await sessionStore.clear();
      await customerSessionStore.save(next);
      authPortal.set('customer');
      portalSessionEvents.emitCustomerLogin();
      setSession(next);
    },
    [services.customerAuth],
  );

  const loginWithGoogle = useCallback(
    async (shopSlug: string) => {
      const { idToken } = await services.googleSignIn.signIn();
      const next = await services.customerAuth.loginWithGoogle({
        shop_slug: shopSlug,
        id_token: idToken,
      });
      await sessionStore.clear();
      await customerSessionStore.save(next);
      authPortal.set('customer');
      portalSessionEvents.emitCustomerLogin();
      setSession(next);
    },
    [services.customerAuth, services.googleSignIn],
  );

  const logout = useCallback(async () => {
    await customerSessionStore.clear();
    if (authPortal.get() === 'customer') {
      authPortal.set('none');
    }
    setSession(null);
    setSelectedService(null);
  }, []);

  const value = useMemo<CustomerSessionContextValue>(
    () => ({
      session,
      isAuthenticated: Boolean(session),
      isBootstrapping,
      selectedService,
      services,
      loginWithPhone,
      loginWithGoogle,
      logout,
      setSelectedService,
    }),
    [
      session,
      isBootstrapping,
      selectedService,
      services,
      loginWithPhone,
      loginWithGoogle,
      logout,
    ],
  );

  return (
    <CustomerSessionContext.Provider value={value}>
      {children}
    </CustomerSessionContext.Provider>
  );
}

export function useCustomerSession(): CustomerSessionContextValue {
  const ctx = useContext(CustomerSessionContext);
  if (!ctx) {
    throw new Error('useCustomerSession must be used within CustomerSessionProvider');
  }
  return ctx;
}
