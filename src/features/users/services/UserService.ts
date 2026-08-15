import type { User } from '../../../core/types/domain';
import type { UserRole } from '../../../shared/constants/roles';

export interface CreateUserInput {
  email: string;
  password: string;
  full_name: string;
  role: UserRole;
}

export interface UserService {
  list(): Promise<User[]>;
  create(input: CreateUserInput): Promise<User>;
}
