import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { StorageKey } from '../../shared/constants/storage';
import type { AuthSession, Tenant, User } from '../types/domain';

async function setItem(key: string, value: string): Promise<void> {
  if (Platform.OS === 'web') {
    await AsyncStorage.setItem(key, value);
    return;
  }
  try {
    const SecureStore = await import('expo-secure-store');
    await SecureStore.setItemAsync(key, value);
  } catch {
    await AsyncStorage.setItem(key, value);
  }
}

async function getItem(key: string): Promise<string | null> {
  if (Platform.OS === 'web') {
    return AsyncStorage.getItem(key);
  }
  try {
    const SecureStore = await import('expo-secure-store');
    return SecureStore.getItemAsync(key);
  } catch {
    return AsyncStorage.getItem(key);
  }
}

async function deleteItem(key: string): Promise<void> {
  if (Platform.OS === 'web') {
    await AsyncStorage.removeItem(key);
    return;
  }
  try {
    const SecureStore = await import('expo-secure-store');
    await SecureStore.deleteItemAsync(key);
  } catch {
    await AsyncStorage.removeItem(key);
  }
}

export interface SessionStore {
  save(session: AuthSession): Promise<void>;
  load(): Promise<AuthSession | null>;
  clear(): Promise<void>;
  getAccessToken(): Promise<string | null>;
}

export const sessionStore: SessionStore = {
  async save(session) {
    await Promise.all([
      setItem(StorageKey.AccessToken, session.access_token),
      setItem(StorageKey.TokenExpiresAt, session.expires_at),
      setItem(StorageKey.SessionUser, JSON.stringify(session.user)),
      setItem(StorageKey.SessionTenant, JSON.stringify(session.tenant)),
    ]);
  },

  async load() {
    const [token, expiresAt, userRaw, tenantRaw] = await Promise.all([
      getItem(StorageKey.AccessToken),
      getItem(StorageKey.TokenExpiresAt),
      getItem(StorageKey.SessionUser),
      getItem(StorageKey.SessionTenant),
    ]);
    if (!token || !expiresAt || !userRaw || !tenantRaw) {
      return null;
    }
    if (new Date(expiresAt).getTime() <= Date.now()) {
      await sessionStore.clear();
      return null;
    }
    return {
      access_token: token,
      token_type: 'Bearer',
      expires_at: expiresAt,
      user: JSON.parse(userRaw) as User,
      tenant: JSON.parse(tenantRaw) as Tenant,
    };
  },

  async clear() {
    await Promise.all([
      deleteItem(StorageKey.AccessToken),
      deleteItem(StorageKey.TokenExpiresAt),
      deleteItem(StorageKey.SessionUser),
      deleteItem(StorageKey.SessionTenant),
    ]);
  },

  getAccessToken() {
    return getItem(StorageKey.AccessToken);
  },
};
