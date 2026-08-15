import type { DayAvailability } from '../../../core/types/domain';

export interface GetAvailabilityInput {
  shop_slug: string;
  service_id: string;
  /** Total block length when booking multiple services. */
  duration_minutes?: number;
  days?: number;
}

export interface AvailabilityService {
  getWeek(input: GetAvailabilityInput): Promise<DayAvailability[]>;
}
