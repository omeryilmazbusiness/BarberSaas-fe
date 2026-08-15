import { ApiPath } from '../../../core/api/endpoints';
import type { HttpClient } from '../../../core/api/httpClient';
import type { Tenant } from '../../../core/types/domain';
import type { CreateShopInput, CreateShopResult } from '../../auth/services/AuthService';
import type { TenantService, UpdateWorkingHoursInput } from './TenantService';

export class HttpTenantService implements TenantService {
  constructor(private readonly http: HttpClient) {}

  list(): Promise<Tenant[]> {
    return this.http.request<Tenant[]>({ path: ApiPath.Tenants, auth: false });
  }

  getById(id: string): Promise<Tenant> {
    return this.http.request<Tenant>({
      path: ApiPath.TenantById(id),
      auth: false,
    });
  }

  getBySlug(slug: string): Promise<Tenant> {
    return this.http.request<Tenant>({
      path: ApiPath.TenantBySlug(slug),
      auth: false,
    });
  }

  create(input: CreateShopInput): Promise<CreateShopResult> {
    return this.http.request<CreateShopResult>({
      method: 'POST',
      path: ApiPath.Tenants,
      body: input,
      auth: false,
    });
  }

  getMe(): Promise<Tenant> {
    return this.http.request<Tenant>({ path: ApiPath.TenantMe });
  }

  updateWorkingHours(input: UpdateWorkingHoursInput): Promise<Tenant> {
    return this.http.request<Tenant>({
      method: 'PUT',
      path: ApiPath.TenantWorkingHours,
      body: input,
    });
  }
}
