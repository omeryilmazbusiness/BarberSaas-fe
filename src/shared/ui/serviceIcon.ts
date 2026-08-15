import type { ComponentProps } from 'react';
import { Ionicons } from '@expo/vector-icons';

type IconName = ComponentProps<typeof Ionicons>['name'];

/** Barber / grooming themed icons for catalog services. */
const BARBER_SERVICE_ICONS: IconName[] = [
  'cut',
  'cut-outline',
  'sparkles-outline',
  'man-outline',
  'happy-outline',
  'brush-outline',
  'color-wand-outline',
  'water-outline',
  'beaker-outline',
  'shirt-outline',
  'diamond-outline',
  'flower-outline',
  'flame-outline',
  'leaf-outline',
  'ribbon-outline',
  'ellipse-outline',
];

function hashSeed(value: string): number {
  let h = 0;
  for (let i = 0; i < value.length; i += 1) {
    h = (h * 31 + value.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

/**
 * Stable “random” icon per service id (or name fallback).
 * Same service always gets the same icon across reloads.
 */
export function serviceBarberIcon(seed: string): IconName {
  const index = hashSeed(seed || 'service') % BARBER_SERVICE_ICONS.length;
  return BARBER_SERVICE_ICONS[index];
}
