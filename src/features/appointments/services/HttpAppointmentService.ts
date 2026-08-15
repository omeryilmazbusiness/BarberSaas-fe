import { ApiPath } from '../../../core/api/endpoints';
import type { HttpClient } from '../../../core/api/httpClient';
import type { Appointment } from '../../../core/types/domain';
import type {
  AppointmentService,
  CreateAppointmentInput,
} from './AppointmentService';

export class HttpAppointmentService implements AppointmentService {
  constructor(private readonly http: HttpClient) {}

  list(): Promise<Appointment[]> {
    return this.http.request<Appointment[]>({ path: ApiPath.Appointments });
  }

  create(input: CreateAppointmentInput): Promise<Appointment> {
    return this.http.request<Appointment>({
      method: 'POST',
      path: ApiPath.Appointments,
      body: input,
    });
  }

  confirm(id: string): Promise<Appointment> {
    return this.http.request<Appointment>({
      method: 'POST',
      path: ApiPath.ConfirmAppointment(id),
    });
  }

  cancel(id: string): Promise<Appointment> {
    return this.http.request<Appointment>({
      method: 'POST',
      path: ApiPath.CancelAppointment(id),
    });
  }

  complete(id: string): Promise<Appointment> {
    return this.http.request<Appointment>({
      method: 'POST',
      path: ApiPath.CompleteAppointment(id),
    });
  }

  markNoShow(id: string): Promise<Appointment> {
    return this.http.request<Appointment>({
      method: 'POST',
      path: ApiPath.NoShowAppointment(id),
    });
  }
}
