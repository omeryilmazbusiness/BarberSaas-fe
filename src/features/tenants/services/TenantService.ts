import type { Tenant } from '../../../core/types/domain';
import type { CreateShopInput, CreateShopResult } from '../../auth/services/AuthService';

export interface TenantService {
  list(): Promise<Tenant[]>;
  getById(id: string): Promise<Tenant>;
  create(input: CreateShopInput): Promise<CreateShopResult>;
}
