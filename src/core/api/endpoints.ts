export const ApiPath = {
  Health: '/healthz',
  Login: '/auth/login',
  Me: '/auth/me',
  Tenants: '/tenants/',
  TenantById: (id: string) => `/tenants/${id}`,
  CustomersRegister: '/customers/register',
  CustomerLogin: '/customers/login',
  CustomerGoogleLogin: '/customers/login/google',
  TenantBySlug: (slug: string) => `/tenants/by-slug/${slug}`,
  Availability: '/availability',
  Users: '/users',
  Staff: '/staff',
  CatalogServices: '/catalog/services',
  Appointments: '/appointments',
  ConfirmAppointment: (id: string) => `/appointments/${id}/confirm`,
  CancelAppointment: (id: string) => `/appointments/${id}/cancel`,
} as const;

export const HeaderName = {
  Authorization: 'Authorization',
  ContentType: 'Content-Type',
  TenantId: 'X-Tenant-ID',
} as const;
