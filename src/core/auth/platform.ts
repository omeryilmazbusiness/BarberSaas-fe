import type { Tenant } from '../types/domain';

export const PLATFORM_TENANT_SLUG = 'platform';

export function isPlatformTenant(tenant: Tenant | null | undefined): boolean {
  return tenant?.slug === PLATFORM_TENANT_SLUG;
}
