import type { DayAvailability, TimeSlot } from '../../../core/types/domain';
import type {
  AvailabilityService,
  GetAvailabilityInput,
} from './AvailabilityService';

const OPEN_MINUTE = 9 * 60;
const CLOSE_MINUTE = 18 * 60;
/** Mock has no catalog lookup — assume classic 30 min service. */
const SLOT_MINUTES = 30;

/**
 * Deterministic mock: some slots marked unavailable so UI can show red/green.
 * Same day+hour always yields the same availability (stable across reloads).
 */
export class MockAvailabilityService implements AvailabilityService {
  async getWeek(input: GetAvailabilityInput): Promise<DayAvailability[]> {
    await delay(280);
    const days = input.days ?? 7;
    const result: DayAvailability[] = [];
    const today = startOfLocalDay(new Date());

    for (let i = 0; i < days; i += 1) {
      const day = new Date(today);
      day.setDate(today.getDate() + i);
      result.push({
        date: toDateKey(day),
        slots: buildSlots(day, input.service_id),
      });
    }

    return result;
  }
}

function buildSlots(day: Date, serviceId: string): TimeSlot[] {
  const slots: TimeSlot[] = [];
  for (
    let minute = OPEN_MINUTE;
    minute + SLOT_MINUTES <= CLOSE_MINUTE;
    minute += SLOT_MINUTES
  ) {
    const starts = new Date(day);
    starts.setHours(Math.floor(minute / 60), minute % 60, 0, 0);
    const ends = new Date(starts.getTime() + SLOT_MINUTES * 60 * 1000);
    const seed = hash(`${toDateKey(day)}-${minute}-${serviceId}`);
    const available = seed % 5 !== 0; // ~80% available
    slots.push({
      starts_at: starts.toISOString(),
      ends_at: ends.toISOString(),
      available,
    });
  }
  return slots;
}

function startOfLocalDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function hash(value: string): number {
  let h = 0;
  for (let i = 0; i < value.length; i += 1) {
    h = (h * 31 + value.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
