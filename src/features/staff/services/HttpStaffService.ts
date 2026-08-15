import { ApiPath } from '../../../core/api/endpoints';
import type { HttpClient } from '../../../core/api/httpClient';
import type { StaffMember } from '../../../core/types/domain';
import type { CreateStaffInput, StaffService } from './StaffService';

export class HttpStaffService implements StaffService {
  constructor(private readonly http: HttpClient) {}

  list(): Promise<StaffMember[]> {
    return this.http.request<StaffMember[]>({ path: ApiPath.Staff });
  }

  create(input: CreateStaffInput): Promise<StaffMember> {
    return this.http.request<StaffMember>({
      method: 'POST',
      path: ApiPath.Staff,
      body: input,
    });
  }
}
