import type { CustomerMe } from '../../../core/types/domain';

export interface UpdateCustomerProfileInput {
  full_name: string;
  phone?: string;
  preferred_service_ids: string[];
  notes: string;
}

export interface CustomerProfileService {
  getMe(): Promise<CustomerMe>;
  updateMe(input: UpdateCustomerProfileInput): Promise<CustomerMe>;
}
