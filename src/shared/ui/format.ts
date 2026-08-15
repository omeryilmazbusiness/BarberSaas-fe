import { tr } from '../i18n/tr';

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

export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return tr.duration.minutes(minutes);
  }
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? tr.duration.hours(h) : tr.duration.hoursMinutes(h, m);
}

export function errorMessage(err: unknown): string {
  if (err instanceof Error) {
    return err.message;
  }
  return tr.common.somethingWrong;
}
