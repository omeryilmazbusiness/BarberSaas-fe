import type { Tenant } from '../../../core/types/domain';
import type { CreateShopInput, CreateShopResult } from '../../auth/services/AuthService';

export interface UpdateWorkingHoursInput {
  open_time: string;
  close_time: string;
  slot_minutes: number;
}

export interface TenantService {
  list(): Promise<Tenant[]>;
  getById(id: string): Promise<Tenant>;
  getBySlug(slug: string): Promise<Tenant>;
  create(input: CreateShopInput): Promise<CreateShopResult>;
  getMe(): Promise<Tenant>;
  updateWorkingHours(input: UpdateWorkingHoursInput): Promise<Tenant>;
}
