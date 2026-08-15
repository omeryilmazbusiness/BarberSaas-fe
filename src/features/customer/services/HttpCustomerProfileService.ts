import { ApiPath } from '../../../core/api/endpoints';
import type { HttpClient } from '../../../core/api/httpClient';
import type { CustomerMe } from '../../../core/types/domain';
import type {
  CustomerProfileService,
  UpdateCustomerProfileInput,
} from './CustomerProfileService';

export class HttpCustomerProfileService implements CustomerProfileService {
  constructor(private readonly http: HttpClient) {}

  getMe(): Promise<CustomerMe> {
    return this.http.request<CustomerMe>({ path: ApiPath.CustomerMe });
  }

  updateMe(input: UpdateCustomerProfileInput): Promise<CustomerMe> {
    return this.http.request<CustomerMe>({
      method: 'PUT',
      path: ApiPath.CustomerMe,
      body: input,
    });
  }
}
