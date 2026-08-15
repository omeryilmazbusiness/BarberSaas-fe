import { UserRole } from '../../../shared/constants/roles';
import { TenantStatus } from '../../../shared/constants/statuses';
import type { Tenant, User } from '../../../core/types/domain';
import type { CreateShopInput, CreateShopResult } from '../../auth/services/AuthService';
import { mockAuthFixtures } from '../../auth/services/MockAuthService';
import type { TenantService } from './TenantService';

const tenants: Tenant[] = [mockAuthFixtures.mockTenant];

export class MockTenantService implements TenantService {
  async list(): Promise<Tenant[]> {
    await delay(200);
    return [...tenants];
  }

  async getById(id: string): Promise<Tenant> {
    await delay(150);
    const found = tenants.find((t) => t.id === id);
    if (!found) {
      throw new Error('Tenant not found');
    }
    return found;
  }

  async create(input: CreateShopInput): Promise<CreateShopResult> {
    await delay(400);
    const tenant: Tenant = {
      id: cryptoRandom(),
      slug: input.slug,
      name: input.name,
      status: TenantStatus.Trial,
      timezone: input.timezone || 'UTC',
    };
    const owner: User = {
      id: cryptoRandom(),
      tenant_id: tenant.id,
      email: input.owner.email.toLowerCase(),
      full_name: input.owner.full_name,
      role: UserRole.Owner,
      is_active: true,
    };
    tenants.unshift(tenant);
    return { tenant, owner };
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function cryptoRandom(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
