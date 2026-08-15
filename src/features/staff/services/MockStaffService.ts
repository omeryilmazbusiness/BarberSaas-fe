import type { StaffMember } from '../../../core/types/domain';
import type { CreateStaffInput, StaffService } from './StaffService';

const staff: StaffMember[] = [
  {
    id: '33333333-3333-3333-3333-333333333331',
    display_name: 'Ali Demir',
    title: 'Senior Barber',
    is_bookable: true,
  },
  {
    id: '33333333-3333-3333-3333-333333333332',
    display_name: 'Mert Kaya',
    title: 'Barber',
    is_bookable: true,
  },
];

export class MockStaffService implements StaffService {
  async list(): Promise<StaffMember[]> {
    await delay(250);
    return [...staff];
  }

  async create(input: CreateStaffInput): Promise<StaffMember> {
    await delay(300);
    const member: StaffMember = {
      id: randomId(),
      display_name: input.display_name,
      title: input.title ?? '',
      is_bookable: input.is_bookable ?? true,
    };
    staff.unshift(member);
    return member;
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

export const mockStaffFixtures = staff;
