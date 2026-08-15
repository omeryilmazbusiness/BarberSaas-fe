import { ApiPath } from '../../../core/api/endpoints';
import type { HttpClient } from '../../../core/api/httpClient';
import type { CustomerAppointment } from '../../../core/types/domain';
import type { CustomerAppointmentService } from './CustomerAppointmentService';

export class HttpCustomerAppointmentService
  implements CustomerAppointmentService
{
  constructor(private readonly http: HttpClient) {}

  listMine(): Promise<CustomerAppointment[]> {
    return this.http.request<CustomerAppointment[]>({
      path: ApiPath.CustomerAppointments,
    });
  }
}
