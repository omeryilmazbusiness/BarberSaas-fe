import * as Linking from 'expo-linking';
import type { LinkingOptions } from '@react-navigation/native';
import { CustomerRoute, StackRoute } from '../shared/constants/routes';
import type { RootStackParamList } from './types';

/**
 * Public portal paths:
 * - /admin/login
 * - /:shopSlug/manager
 * - /:shopSlug/login | /services | /schedule | /success
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
        screens: {
          [CustomerRoute.Login]: 'login',
          [CustomerRoute.Services]: 'services',
          [CustomerRoute.Schedule]: 'schedule',
          [CustomerRoute.Success]: 'success',
        },
      },
      [StackRoute.Auth]: 'staff',
      [StackRoute.Shop]: 'shop',
    },
  },
} as LinkingOptions<RootStackParamList>;
