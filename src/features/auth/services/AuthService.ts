import type { AuthSession, Tenant, User } from '../../../core/types/domain';

export interface LoginInput {
  tenant_slug?: string;
  tenant_id?: string;
  email: string;
  password: string;
}

export interface CreateShopInput {
  slug: string;
  name: string;
  timezone: string;
  owner: {
    email: string;
    password: string;
    full_name: string;
  };
}

export interface CreateShopResult {
  tenant: Tenant;
  owner: User;
}

export interface AuthService {
  login(input: LoginInput): Promise<AuthSession>;
  me(): Promise<{ user: User; tenant: Tenant }>;
}
