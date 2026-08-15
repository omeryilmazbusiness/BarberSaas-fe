import type { CustomerSession } from '../../../core/types/domain';

export interface CustomerLoginInput {
  shop_slug: string;
  phone: string;
}

export interface CustomerGoogleLoginInput {
  shop_slug: string;
  id_token: string;
}

export interface CustomerAuthService {
  login(input: CustomerLoginInput): Promise<CustomerSession>;
  loginWithGoogle(input: CustomerGoogleLoginInput): Promise<CustomerSession>;
}
