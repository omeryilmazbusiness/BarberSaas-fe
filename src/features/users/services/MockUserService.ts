import { UserRole } from '../../../shared/constants/roles';
import type { User } from '../../../core/types/domain';
import { mockAuthFixtures } from '../../auth/services/MockAuthService';
import type { CreateUserInput, UserService } from './UserService';

const users: User[] = [
  { ...mockAuthFixtures.mockUser },
  {
    id: '55555555-5555-5555-5555-555555555551',
    tenant_id: mockAuthFixtures.mockTenant.id,
    email: 'ali@acme.com',
    full_name: 'Ali Demir',
    role: UserRole.Staff,
    is_active: true,
  },
  {
    id: '55555555-5555-5555-5555-555555555552',
    tenant_id: mockAuthFixtures.mockTenant.id,
    email: 'customer@example.com',
    phone: '05321234567',
    full_name: 'Can Yılmaz',
    role: UserRole.Customer,
    is_active: true,
  },
];

export class MockUserService implements UserService {
  async list(): Promise<User[]> {
    await delay(250);
    return [...users];
  }

  async create(input: CreateUserInput): Promise<User> {
    await delay(300);
    const created: User = {
      id: randomId(),
      tenant_id: mockAuthFixtures.mockTenant.id,
      email: input.email.toLowerCase(),
      full_name: input.full_name,
      role: input.role,
      is_active: true,
    };
    users.unshift(created);
    return created;
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function randomId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export const mockUserFixtures = users;
