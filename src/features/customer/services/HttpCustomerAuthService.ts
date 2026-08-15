import { ApiPath } from '../../../core/api/endpoints';
import type { HttpClient } from '../../../core/api/httpClient';
import type { CustomerSession } from '../../../core/types/domain';
import type {
  CustomerAuthService,
  CustomerGoogleLoginInput,
  CustomerLoginInput,
} from './CustomerAuthService';

export class HttpCustomerAuthService implements CustomerAuthService {
  constructor(private readonly http: HttpClient) {}

  login(input: CustomerLoginInput): Promise<CustomerSession> {
    return this.http.request<CustomerSession>({
      method: 'POST',
      path: ApiPath.CustomerLogin,
      body: input,
      auth: false,
    });
  }

  loginWithGoogle(input: CustomerGoogleLoginInput): Promise<CustomerSession> {
    return this.http.request<CustomerSession>({
      method: 'POST',
      path: ApiPath.CustomerGoogleLogin,
      body: input,
      auth: false,
    });
  }
}
