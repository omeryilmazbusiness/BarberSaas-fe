import type { CustomerAppointment } from '../../../core/types/domain';

export interface CustomerAppointmentService {
  listMine(): Promise<CustomerAppointment[]>;
}
