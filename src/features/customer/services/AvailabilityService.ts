import type { DayAvailability } from '../../../core/types/domain';

export interface GetAvailabilityInput {
  shop_slug: string;
  service_id: string;
  days?: number;
}

export interface AvailabilityService {
  getWeek(input: GetAvailabilityInput): Promise<DayAvailability[]>;
}
