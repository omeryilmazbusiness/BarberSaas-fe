import type { AppointmentStatus, TenantStatus } from '../../shared/constants/statuses';
import type { UserRole } from '../../shared/constants/roles';

export interface Tenant {
  id: string;
  slug: string;
  name: string;
  status: TenantStatus;
  timezone: string;
}

export interface User {
  id: string;
  tenant_id: string;
  email: string;
  full_name: string;
  role: UserRole;
  is_active?: boolean;
}

export interface StaffMember {
  id: string;
  display_name: string;
  title: string;
  is_bookable: boolean;
}

export interface CatalogService {
  id: string;
  name: string;
  description?: string;
  duration_minutes: number;
  price_cents: number;
  currency: string;
  is_active?: boolean;
}

export interface Appointment {
  id: string;
  customer_id: string;
  staff_id: string;
  service_id: string;
  starts_at: string;
  ends_at: string;
  status: AppointmentStatus;
  notes: string;
}

export interface AuthSession {
  access_token: string;
  token_type: string;
  expires_at: string;
  user: User;
  tenant: Tenant;
}
