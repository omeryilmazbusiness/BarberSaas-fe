import { UserRole } from '../../../shared/constants/roles';
import { TenantStatus } from '../../../shared/constants/statuses';
import type { AuthSession, Tenant, User } from '../../../core/types/domain';
import type { AuthService, LoginInput } from './AuthService';

const mockTenant: Tenant = {
  id: '11111111-1111-1111-1111-111111111111',
  slug: 'acme-barber',
  name: 'Acme Barber',
  status: TenantStatus.Trial,
  timezone: 'Europe/Istanbul',
  open_time: '09:00',
  close_time: '18:00',
  slot_minutes: 30,
};

const mockUser: User = {
  id: '22222222-2222-2222-2222-222222222222',
  tenant_id: mockTenant.id,
  email: 'owner@acme.com',
  full_name: 'Jane Owner',
  role: UserRole.Owner,
  is_active: true,
};

/** Demo credentials for mock mode: any password, tenant_slug `acme-barber`. */
export class MockAuthService implements AuthService {
  async login(input: LoginInput): Promise<AuthSession> {
    await delay(350);
    if (!input.email.trim()) {
      throw new Error('Email is required');
    }
    const slug = input.tenant_slug ?? mockTenant.slug;
    return {
      access_token: 'mock-access-token',
      token_type: 'Bearer',
      expires_at: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
      user: { ...mockUser, email: input.email.toLowerCase() },
      tenant: { ...mockTenant, slug },
    };
  }

  async me(): Promise<{ user: User; tenant: Tenant }> {
    await delay(200);
    return { user: mockUser, tenant: mockTenant };
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const mockAuthFixtures = { mockTenant, mockUser };
