import { tr } from '../i18n/tr';
import { ApiClientError } from '../../core/api/types';

export function formatPrice(cents: number, currency: string): string {
  const amount = cents / 100;
  try {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${amount.toFixed(0)} ${currency}`;
  }
}

export function formatDateTime(iso: string, timeZone?: string): string {
  const date = new Date(iso);
  return new Intl.DateTimeFormat('tr-TR', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone,
  }).format(date);
}

/** Human-readable local appointment time, e.g. "Cumartesi, 15 Ağustos 2026 · 11:00". */
export function formatLocalDateTimeLong(date: Date): string {
  const day = new Intl.DateTimeFormat('tr-TR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
  const time = new Intl.DateTimeFormat('tr-TR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);
  return `${day} · ${time}`;
}

export function formatLocalDateInput(date: Date): string {
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const y = date.getFullYear();
  return `${d}.${m}.${y}`;
}

export function formatLocalTimeInput(date: Date): string {
  const h = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  return `${h}:${min}`;
}

/** Parse GG.AA.YYYY + SS:DD into a local Date, or null if invalid. */
export function parseLocalDateTime(
  dateText: string,
  timeText: string,
): Date | null {
  const dateMatch = /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/.exec(dateText.trim());
  const timeMatch = /^(\d{1,2}):(\d{2})$/.exec(timeText.trim());
  if (!dateMatch || !timeMatch) {
    return null;
  }
  const day = Number(dateMatch[1]);
  const month = Number(dateMatch[2]);
  const year = Number(dateMatch[3]);
  const hour = Number(timeMatch[1]);
  const minute = Number(timeMatch[2]);
  if (
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > 31 ||
    hour < 0 ||
    hour > 23 ||
    minute < 0 ||
    minute > 59
  ) {
    return null;
  }
  const date = new Date(year, month - 1, day, hour, minute, 0, 0);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day ||
    date.getHours() !== hour ||
    date.getMinutes() !== minute
  ) {
    return null;
  }
  return date;
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return tr.duration.minutes(minutes);
  }
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? tr.duration.hours(h) : tr.duration.hoursMinutes(h, m);
}

export function errorMessage(err: unknown): string {
  if (err instanceof ApiClientError) {
    const msg = err.message.toLowerCase();
    if (msg.includes('no bookable staff')) {
      return tr.customer.noBookableStaff;
    }
    if (msg.includes('catalog service not found')) {
      return tr.customer.serviceMissing;
    }
    return err.message;
  }
  if (err instanceof Error) {
    return err.message;
  }
  return tr.common.somethingWrong;
}
