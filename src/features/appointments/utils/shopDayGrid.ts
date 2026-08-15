/** Shop working-day helpers — mirrors BE availability grid. */

export const DEFAULT_OPEN_TIME = '09:00';
export const DEFAULT_CLOSE_TIME = '18:00';
export const DEFAULT_SLOT_MINUTES = 30;

export function parseClockToMinutes(value?: string | null): number | null {
  if (!value) {
    return null;
  }
  const match = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
  if (!match) {
    return null;
  }
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (
    !Number.isFinite(hour) ||
    !Number.isFinite(minute) ||
    hour < 0 ||
    hour > 24 ||
    minute < 0 ||
    minute > 59 ||
    (hour === 24 && minute !== 0)
  ) {
    return null;
  }
  return hour * 60 + minute;
}

export function formatMinutesAsClock(minuteOfDay: number): string {
  const clamped = Math.max(0, Math.min(24 * 60, Math.floor(minuteOfDay)));
  const h = Math.floor(clamped / 60);
  const m = clamped % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function normalizeClockInput(raw: string): string | null {
  const trimmed = raw.trim();
  const minutes = parseClockToMinutes(trimmed);
  if (minutes === null) {
    return null;
  }
  return formatMinutesAsClock(minutes);
}

export function resolveWorkingMinutes(openTime?: string, closeTime?: string) {
  const open =
    parseClockToMinutes(openTime) ?? parseClockToMinutes(DEFAULT_OPEN_TIME)!;
  const close =
    parseClockToMinutes(closeTime) ?? parseClockToMinutes(DEFAULT_CLOSE_TIME)!;
  if (close <= open) {
    return {
      openMinute: parseClockToMinutes(DEFAULT_OPEN_TIME)!,
      closeMinute: parseClockToMinutes(DEFAULT_CLOSE_TIME)!,
    };
  }
  return { openMinute: open, closeMinute: close };
}

export function buildDaySlotStarts(
  dayKey: string,
  options?: {
    openTime?: string;
    closeTime?: string;
    slotMinutes?: number;
  },
): Date[] {
  const { openMinute, closeMinute } = resolveWorkingMinutes(
    options?.openTime,
    options?.closeTime,
  );
  const slotMinutes = Math.max(5, options?.slotMinutes ?? DEFAULT_SLOT_MINUTES);
  const [y, m, d] = dayKey.split('-').map(Number);
  const slots: Date[] = [];
  for (
    let minute = openMinute;
    minute + slotMinutes <= closeMinute;
    minute += slotMinutes
  ) {
    slots.push(
      new Date(y, m - 1, d, Math.floor(minute / 60), minute % 60, 0, 0),
    );
  }
  return slots;
}

export function formatSlotClock(date: Date): string {
  return new Intl.DateTimeFormat('tr-TR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);
}

export function dayKeyFromDate(date: Date, timeZone?: string): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

/** Active bookings that occupy the chair for overlap display. */
export function occupiesSlot(status: string): boolean {
  return (
    status === 'pending' ||
    status === 'confirmed' ||
    status === 'completed' ||
    status === 'no_show'
  );
}

export function isActionableAppointment(status: string): boolean {
  return status === 'pending' || status === 'confirmed';
}

export type AgendaTone = 'free' | 'upcoming' | 'completed' | 'no_show';

export function resolveAgendaTone(
  status: string | undefined,
  startsAt: string | undefined,
  now: Date = new Date(),
): AgendaTone {
  if (!status) {
    return 'free';
  }
  if (status === 'no_show') {
    return 'no_show';
  }
  if (status === 'completed') {
    return 'completed';
  }
  if (status === 'pending' || status === 'confirmed') {
    if (startsAt && new Date(startsAt).getTime() > now.getTime()) {
      return 'upcoming';
    }
    return 'upcoming';
  }
  return 'free';
}

export function appointmentOverlapsSlot(
  startsAt: string,
  endsAt: string,
  slotStart: Date,
  slotMinutes: number = DEFAULT_SLOT_MINUTES,
): boolean {
  const start = new Date(startsAt).getTime();
  const end = new Date(endsAt).getTime();
  const slotEnd = slotStart.getTime() + slotMinutes * 60 * 1000;
  return start < slotEnd && end > slotStart.getTime();
}

export function phoneFromNotes(notes?: string): string | undefined {
  if (!notes) {
    return undefined;
  }
  const match = notes.match(/Tel:\s*([+\d\s()-]{7,})/i);
  return match?.[1]?.replace(/\s+/g, '') || undefined;
}

export function dialablePhone(raw?: string): string | undefined {
  if (!raw) {
    return undefined;
  }
  const digits = raw.replace(/[^\d+]/g, '');
  return digits.length >= 7 ? digits : undefined;
}

/** Grid step for manager agenda: shortest active service, default 30. */
export function resolveAgendaSlotMinutes(
  durations: number[],
  fallback: number = DEFAULT_SLOT_MINUTES,
): number {
  const valid = durations.filter((d) => Number.isFinite(d) && d >= 5);
  if (valid.length === 0) {
    return fallback;
  }
  return Math.min(...valid);
}
