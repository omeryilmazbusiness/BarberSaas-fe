import { TenantStatus } from '../../../shared/constants/statuses';
import type { CustomerSession, Tenant } from '../../../core/types/domain';
import { mockAuthFixtures } from '../../auth/services/MockAuthService';
import type {
  CustomerAuthService,
  CustomerGoogleLoginInput,
  CustomerLoginInput,
} from './CustomerAuthService';

function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, '');
}

function isValidPhone(digits: string): boolean {
  return digits.length >= 10 && digits.length <= 15;
}

function resolveTenant(slug: string): Tenant {
  const normalized = slug.trim().toLowerCase();
  if (normalized === mockAuthFixtures.mockTenant.slug) {
    return mockAuthFixtures.mockTenant;
  }
  return {
    id: '11111111-1111-1111-1111-111111111111',
    slug: normalized,
    name: normalized
      .split('-')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' '),
    status: TenantStatus.Trial,
    timezone: 'Europe/Istanbul',
    open_time: '09:00',
    close_time: '18:00',
    slot_minutes: 30,
  };
}

export class MockCustomerAuthService implements CustomerAuthService {
  async login(input: CustomerLoginInput): Promise<CustomerSession> {
    await delay(300);
    const digits = normalizePhone(input.phone);
    if (!isValidPhone(digits)) {
      throw new Error('Geçerli bir telefon numarası girin');
    }
    const tenant = resolveTenant(input.shop_slug);
    return {
      access_token: `mock-customer-${digits}`,
      expires_at: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
      customer: {
        id: `cust-${digits}`,
        phone: digits,
        full_name: 'Müşteri',
      },
      tenant,
    };
  }

  async loginWithGoogle(input: CustomerGoogleLoginInput): Promise<CustomerSession> {
    await delay(350);
    if (!input.id_token.trim()) {
      throw new Error('Google kimlik jetonu eksik');
    }
    const tenant = resolveTenant(input.shop_slug);
    return {
      access_token: 'mock-customer-google',
      expires_at: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
      customer: {
        id: 'cust-google-demo',
        full_name: 'Google Müşteri',
        email: 'demo.musteri@gmail.com',
        phone: '',
      },
      tenant,
    };
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
