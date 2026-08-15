import type { CustomerAppointment } from '../../../core/types/domain';
import { AppointmentStatus } from '../../../shared/constants/statuses';
import type { CustomerAppointmentService } from './CustomerAppointmentService';

const seed: CustomerAppointment[] = [
  {
    id: 'mock-appt-1',
    customer_id: 'mock-customer',
    staff_id: 'mock-staff-1',
    service_id: 'svc-1',
    service_name: 'Klasik Traş',
    staff_name: 'Ali Usta',
    starts_at: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    ends_at: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000).toISOString(),
    status: AppointmentStatus.Confirmed,
    notes: '',
  },
];

export class MockCustomerAppointmentService
  implements CustomerAppointmentService
{
  async listMine(): Promise<CustomerAppointment[]> {
    return seed.map((item) => ({ ...item }));
  }
}
