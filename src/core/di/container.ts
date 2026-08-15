import { env } from '../config/env';
import { FetchHttpClient } from '../api/httpClient';
import { appTokenProvider } from '../auth/tokenProvider';
import type { AuthService } from '../../features/auth/services/AuthService';
import { HttpAuthService } from '../../features/auth/services/HttpAuthService';
import { MockAuthService } from '../../features/auth/services/MockAuthService';
import type { TenantService } from '../../features/tenants/services/TenantService';
import { HttpTenantService } from '../../features/tenants/services/HttpTenantService';
import { MockTenantService } from '../../features/tenants/services/MockTenantService';
import type { StaffService } from '../../features/staff/services/StaffService';
import { HttpStaffService } from '../../features/staff/services/HttpStaffService';
import { MockStaffService } from '../../features/staff/services/MockStaffService';
import type { CatalogService } from '../../features/catalog/services/CatalogService';
import { HttpCatalogService } from '../../features/catalog/services/HttpCatalogService';
import { MockCatalogService } from '../../features/catalog/services/MockCatalogService';
import type { UserService } from '../../features/users/services/UserService';
import { HttpUserService } from '../../features/users/services/HttpUserService';
import { MockUserService } from '../../features/users/services/MockUserService';
import type { AppointmentService } from '../../features/appointments/services/AppointmentService';
import { HttpAppointmentService } from '../../features/appointments/services/HttpAppointmentService';
import { MockAppointmentService } from '../../features/appointments/services/MockAppointmentService';
import type { CustomerAuthService } from '../../features/customer/services/CustomerAuthService';
import { HttpCustomerAuthService } from '../../features/customer/services/HttpCustomerAuthService';
import { MockCustomerAuthService } from '../../features/customer/services/MockCustomerAuthService';
import type { AvailabilityService } from '../../features/customer/services/AvailabilityService';
import { HttpAvailabilityService } from '../../features/customer/services/HttpAvailabilityService';
import { MockAvailabilityService } from '../../features/customer/services/MockAvailabilityService';
import type { GoogleSignInService } from '../../features/customer/services/GoogleSignInService';
import { ExpoGoogleSignInService } from '../../features/customer/services/ExpoGoogleSignInService';
import { MockGoogleSignInService } from '../../features/customer/services/MockGoogleSignInService';

/**
 * Composition root — single place that wires concrete adapters.
 * Screens depend on AppServices interfaces only (DIP).
 */
export interface AppServices {
  auth: AuthService;
  customerAuth: CustomerAuthService;
  googleSignIn: GoogleSignInService;
  availability: AvailabilityService;
  tenants: TenantService;
  staff: StaffService;
  catalog: CatalogService;
  users: UserService;
  appointments: AppointmentService;
  useMockApi: boolean;
}

function createHttpServices(): AppServices {
  const http = new FetchHttpClient(env.apiBaseUrl, env.apiPrefix, appTokenProvider);
  return {
    auth: new HttpAuthService(http),
    customerAuth: new HttpCustomerAuthService(http),
    googleSignIn: new ExpoGoogleSignInService(),
    availability: new HttpAvailabilityService(http),
    tenants: new HttpTenantService(http),
    staff: new HttpStaffService(http),
    catalog: new HttpCatalogService(http),
    users: new HttpUserService(http),
    appointments: new HttpAppointmentService(http),
    useMockApi: false,
  };
}

function createMockServices(): AppServices {
  return {
    auth: new MockAuthService(),
    customerAuth: new MockCustomerAuthService(),
    googleSignIn: new MockGoogleSignInService(),
    availability: new MockAvailabilityService(),
    tenants: new MockTenantService(),
    staff: new MockStaffService(),
    catalog: new MockCatalogService(),
    users: new MockUserService(),
    appointments: new MockAppointmentService(),
    useMockApi: true,
  };
}

export function createAppServices(): AppServices {
  return env.useMockApi ? createMockServices() : createHttpServices();
}
