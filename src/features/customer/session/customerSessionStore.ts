import AsyncStorage from '@react-native-async-storage/async-storage';
import { StorageKey } from '../../../shared/constants/storage';
import type { CustomerSession } from '../../../core/types/domain';

export const customerSessionStore = {
  async save(session: CustomerSession): Promise<void> {
    await AsyncStorage.setItem(StorageKey.CustomerSession, JSON.stringify(session));
  },

  async load(): Promise<CustomerSession | null> {
    const raw = await AsyncStorage.getItem(StorageKey.CustomerSession);
    if (!raw) {
      return null;
    }
    const session = JSON.parse(raw) as CustomerSession;
    if (new Date(session.expires_at).getTime() <= Date.now()) {
      await customerSessionStore.clear();
      return null;
    }
    return session;
  },

  async clear(): Promise<void> {
    await AsyncStorage.removeItem(StorageKey.CustomerSession);
  },
};
