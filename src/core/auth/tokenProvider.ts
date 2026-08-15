import type { TokenProvider } from '../api/httpClient';
import { sessionStore } from './sessionStore';
import { customerSessionStore } from '../../features/customer/session/customerSessionStore';

export type AuthPortal = 'shop' | 'customer' | 'none';

let activePortal: AuthPortal = 'none';

/**
 * Which portal owns the active Bearer token.
 * Prevents customer JWT from leaking into shop/manager API calls (and vice versa).
 */
export const authPortal = {
  get(): AuthPortal {
    return activePortal;
  },
  set(portal: AuthPortal): void {
    activePortal = portal;
  },
};

export const appTokenProvider: TokenProvider = {
  async getAccessToken() {
    switch (authPortal.get()) {
      case 'shop':
        return sessionStore.getAccessToken();
      case 'customer': {
        const customer = await customerSessionStore.load();
        return customer?.access_token ?? null;
      }
      default: {
        // Bootstrap / unknown: prefer shop session, then customer.
        const shopToken = await sessionStore.getAccessToken();
        if (shopToken) {
          return shopToken;
        }
        const customer = await customerSessionStore.load();
        return customer?.access_token ?? null;
      }
    }
  },
};
