import type { UserRole } from '../constants/roles';
import { tr } from '../i18n/tr';

export function roleLabel(role: UserRole | string): string {
  switch (role) {
    case 'owner':
      return tr.roles.owner;
    case 'manager':
      return tr.roles.manager;
    case 'staff':
      return tr.roles.staff;
    case 'customer':
      return tr.roles.customer;
    default:
      return String(role);
  }
}
