import { ApiPath } from '../../../core/api/endpoints';
import type { HttpClient } from '../../../core/api/httpClient';
import type { AuthSession, Tenant, User } from '../../../core/types/domain';
import type { AuthService, LoginInput } from './AuthService';

export class HttpAuthService implements AuthService {
  constructor(private readonly http: HttpClient) {}

  login(input: LoginInput): Promise<AuthSession> {
    return this.http.request<AuthSession>({
      method: 'POST',
      path: ApiPath.Login,
      body: input,
      auth: false,
    });
  }

  me(): Promise<{ user: User; tenant: Tenant }> {
    return this.http.request<{ user: User; tenant: Tenant }>({
      path: ApiPath.Me,
    });
  }
}
