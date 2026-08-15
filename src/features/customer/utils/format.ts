import type { ComponentProps } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { serviceBarberIcon } from '../../../shared/ui/serviceIcon';

type IconName = ComponentProps<typeof Ionicons>['name'];

const NAMED_SERVICE_ICONS: Record<string, IconName> = {
  'classic haircut': 'cut-outline',
  'beard trim': 'man-outline',
  'cut + beard': 'sparkles-outline',
};

export function serviceIcon(name: string, id?: string): IconName {
  const known = NAMED_SERVICE_ICONS[name.trim().toLowerCase()];
  if (known) {
    return known;
  }
  return serviceBarberIcon(id || name);
}

export function formatPhoneDisplay(digits: string): string {
  if (digits.length === 10) {
    return `0${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
  }
  if (digits.length === 11 && digits.startsWith('0')) {
    return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
  }
  return digits;
}

export function formatDayLabel(dateKey: string): string {
  const [y, m, d] = dateKey.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return new Intl.DateTimeFormat('tr-TR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(date);
}

export function formatSlotTime(iso: string): string {
  return new Intl.DateTimeFormat('tr-TR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(iso));
}

export function formatBookingWhen(iso: string): string {
  return new Intl.DateTimeFormat('tr-TR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(iso));
}
