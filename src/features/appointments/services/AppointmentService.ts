import type { Appointment } from '../../../core/types/domain';

export interface CreateAppointmentInput {
  customer_id: string;
  staff_id: string;
  service_id: string;
  starts_at: string;
  ends_at?: string;
  notes?: string;
}

export interface AppointmentService {
  list(): Promise<Appointment[]>;
  create(input: CreateAppointmentInput): Promise<Appointment>;
  confirm(id: string): Promise<Appointment>;
  cancel(id: string): Promise<Appointment>;
  complete(id: string): Promise<Appointment>;
  markNoShow(id: string): Promise<Appointment>;
}
