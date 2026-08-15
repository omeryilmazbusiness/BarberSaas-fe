import type { CustomerMe } from '../../../core/types/domain';
import type {
  CustomerProfileService,
  UpdateCustomerProfileInput,
} from './CustomerProfileService';

const store = new Map<string, CustomerMe>();

function keyFromTokenHint(): string {
  return 'default';
}

export class MockCustomerProfileService implements CustomerProfileService {
  async getMe(): Promise<CustomerMe> {
    await delay(200);
    const key = keyFromTokenHint();
    const existing = store.get(key);
    if (existing) {
      return { ...existing, preferences: { ...existing.preferences } };
    }
    const fresh: CustomerMe = {
      id: 'cust-mock',
      full_name: 'Müşteri',
      phone: '',
      email: 'demo.musteri@gmail.com',
      preferences: { preferred_service_ids: [], notes: '' },
    };
    store.set(key, fresh);
    return fresh;
  }

  async updateMe(input: UpdateCustomerProfileInput): Promise<CustomerMe> {
    await delay(250);
    const key = keyFromTokenHint();
    const current = await this.getMe();
    const next: CustomerMe = {
      ...current,
      full_name: input.full_name.trim() || current.full_name,
      phone: input.phone?.trim() || current.phone,
      preferences: {
        preferred_service_ids: [...input.preferred_service_ids],
        notes: input.notes.trim(),
        updated_at: new Date().toISOString(),
      },
    };
    store.set(key, next);
    return next;
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
