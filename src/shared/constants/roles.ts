export const UserRole = {
  Owner: 'owner',
  Manager: 'manager',
  Staff: 'staff',
  Customer: 'customer',
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const AdminRoles: readonly UserRole[] = [UserRole.Owner, UserRole.Manager];

export const ShopRoles: readonly UserRole[] = [
  UserRole.Owner,
  UserRole.Manager,
  UserRole.Staff,
];

export function isAdminRole(role: UserRole): boolean {
  return AdminRoles.includes(role);
}

export function canShopLogin(role: UserRole): boolean {
  return ShopRoles.includes(role);
}
