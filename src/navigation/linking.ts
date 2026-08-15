import * as Linking from 'expo-linking';
import {
  getStateFromPath as rnGetStateFromPath,
  type LinkingOptions,
} from '@react-navigation/native';
import { CustomerRoute, StackRoute } from '../shared/constants/routes';
import type { RootStackParamList } from './types';

function rewriteLegacyCustomerLogin(path: string): string {
  const raw = path.startsWith('/') ? path : `/${path}`;
  let url: URL;
  try {
    url = new URL(raw, 'http://barbersaas.local');
  } catch {
    return path;
  }

  const pathname = url.pathname.replace(/\/+$/, '') || '/';
  if (pathname === '/login') {
    const slug = url.searchParams.get('shopSlug')?.trim();
    if (slug) {
      return `/${encodeURIComponent(slug)}/login`;
    }
  }
  return path;
}

/**
 * Public portal paths (path params only — never ?shopSlug=):
 * - /admin/login
 * - /:shopSlug/manager
 * - /:shopSlug/login | /services | /schedule/:serviceId | /success | /profile
 */
export const linking: LinkingOptions<RootStackParamList> = {
  prefixes: [
    Linking.createURL('/'),
    'http://localhost:8081',
    'http://localhost:8084',
    'http://localhost:19006',
  ],
  config: {
    screens: {
      [StackRoute.AdminLogin]: 'admin/login',
      [StackRoute.ManagerLogin]: ':shopSlug/manager',
      [StackRoute.Customer]: {
        path: ':shopSlug',
        parse: {
          shopSlug: (value: string) => decodeURIComponent(value),
        },
        screens: {
          [CustomerRoute.Login]: 'login',
          [CustomerRoute.Services]: 'services',
          [CustomerRoute.Schedule]: 'schedule/:serviceId',
          [CustomerRoute.Success]: 'success',
          [CustomerRoute.Profile]: 'profile',
        },
      },
      [StackRoute.Auth]: 'staff',
      [StackRoute.Shop]: 'shop',
    },
  },
  getStateFromPath(path, options) {
    return rnGetStateFromPath(rewriteLegacyCustomerLogin(path), options);
  },
} as LinkingOptions<RootStackParamList>;
