import type { StaffMember } from '../../../core/types/domain';

export interface CreateStaffInput {
  user_id?: string;
  display_name: string;
  title?: string;
  is_bookable?: boolean;
}

export interface StaffService {
  list(): Promise<StaffMember[]>;
  create(input: CreateStaffInput): Promise<StaffMember>;
}
