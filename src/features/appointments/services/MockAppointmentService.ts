import { AppointmentStatus } from '../../../shared/constants/statuses';
import type { Appointment } from '../../../core/types/domain';
import { mockCatalogFixtures } from '../../catalog/services/MockCatalogService';
import { mockStaffFixtures } from '../../staff/services/MockStaffService';
import { mockUserFixtures } from '../../users/services/MockUserService';
import type {
  AppointmentService,
  CreateAppointmentInput,
} from './AppointmentService';

function atTomorrow(hour: number, minute = 0): Date {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(hour, minute, 0, 0);
  return d;
}

const appointments: Appointment[] = [
  {
    id: '66666666-6666-6666-6666-666666666661',
    customer_id: mockUserFixtures[2].id,
    staff_id: mockStaffFixtures[0].id,
    service_id: mockCatalogFixtures[0].id,
    starts_at: atTomorrow(10).toISOString(),
    ends_at: atTomorrow(10, 30).toISOString(),
    status: AppointmentStatus.Pending,
    notes: 'First visit',
  },
  {
    id: '66666666-6666-6666-6666-666666666662',
    customer_id: mockUserFixtures[2].id,
    staff_id: mockStaffFixtures[1].id,
    service_id: mockCatalogFixtures[2].id,
    starts_at: atTomorrow(14).toISOString(),
    ends_at: atTomorrow(14, 45).toISOString(),
    status: AppointmentStatus.Confirmed,
    notes: '',
  },
];

export class MockAppointmentService implements AppointmentService {
  async list(): Promise<Appointment[]> {
    await delay(250);
    return [...appointments].sort(
      (a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime(),
    );
  }

  async create(input: CreateAppointmentInput): Promise<Appointment> {
    await delay(350);
    const starts = new Date(input.starts_at);
    const ends = input.ends_at
      ? new Date(input.ends_at)
      : new Date(starts.getTime() + 30 * 60 * 1000);
    const created: Appointment = {
      id: randomId(),
      customer_id: input.customer_id,
      staff_id: input.staff_id,
      service_id: input.service_id,
      starts_at: starts.toISOString(),
      ends_at: ends.toISOString(),
      status: AppointmentStatus.Pending,
      notes: input.notes ?? '',
    };
    appointments.unshift(created);
    return created;
  }

  async confirm(id: string): Promise<Appointment> {
    await delay(250);
    const item = appointments.find((a) => a.id === id);
    if (!item) {
      throw new Error('Appointment not found');
    }
    if (item.status !== AppointmentStatus.Pending) {
      throw new Error('Only pending appointments can be confirmed');
    }
    item.status = AppointmentStatus.Confirmed;
    return { ...item };
  }

  async cancel(id: string): Promise<Appointment> {
    await delay(250);
    const item = appointments.find((a) => a.id === id);
    if (!item) {
      throw new Error('Appointment not found');
    }
    if (
      item.status === AppointmentStatus.Cancelled ||
      item.status === AppointmentStatus.Completed
    ) {
      throw new Error('Appointment cannot be cancelled');
    }
    item.status = AppointmentStatus.Cancelled;
    return { ...item };
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
