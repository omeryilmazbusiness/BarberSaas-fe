export const TenantStatus = {
  Trial: 'trial',
  Active: 'active',
  Suspended: 'suspended',
} as const;

export type TenantStatus = (typeof TenantStatus)[keyof typeof TenantStatus];

export const AppointmentStatus = {
  Pending: 'pending',
  Confirmed: 'confirmed',
  Cancelled: 'cancelled',
  Completed: 'completed',
  NoShow: 'no_show',
} as const;

export type AppointmentStatus =
  (typeof AppointmentStatus)[keyof typeof AppointmentStatus];
