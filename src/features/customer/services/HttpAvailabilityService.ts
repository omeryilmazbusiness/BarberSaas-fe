import { ApiPath } from '../../../core/api/endpoints';
import type { HttpClient } from '../../../core/api/httpClient';
import type { DayAvailability } from '../../../core/types/domain';
import type {
  AvailabilityService,
  GetAvailabilityInput,
} from './AvailabilityService';

export class HttpAvailabilityService implements AvailabilityService {
  constructor(private readonly http: HttpClient) {}

  getWeek(input: GetAvailabilityInput): Promise<DayAvailability[]> {
    const params = new URLSearchParams({
      service_id: input.service_id,
      days: String(input.days ?? 7),
    });
    return this.http.request<DayAvailability[]>({
      path: `${ApiPath.Availability}?${params.toString()}`,
    });
  }
}
