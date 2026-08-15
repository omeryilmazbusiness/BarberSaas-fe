import { ApiPath } from '../../../core/api/endpoints';
import type { HttpClient } from '../../../core/api/httpClient';
import type { User } from '../../../core/types/domain';
import type { CreateUserInput, UserService } from './UserService';

export class HttpUserService implements UserService {
  constructor(private readonly http: HttpClient) {}

  list(): Promise<User[]> {
    return this.http.request<User[]>({ path: ApiPath.Users });
  }

  create(input: CreateUserInput): Promise<User> {
    return this.http.request<User>({
      method: 'POST',
      path: ApiPath.Users,
      body: input,
    });
  }
}
