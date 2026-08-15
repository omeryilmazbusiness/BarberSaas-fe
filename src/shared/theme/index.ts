const ink = '#111111';
const paper = '#F5F3EF';
const muted = '#6B6B6B';
const line = '#E4E0D8';
const accent = '#1C4A3E';
const accentSoft = '#E8F0ED';
const danger = '#8B2E2E';
const warning = '#8A5A12';
const success = '#1C4A3E';

export const colors = {
  ink,
  paper,
  muted,
  line,
  accent,
  accentSoft,
  danger,
  warning,
  success,
  white: '#FFFFFF',
  surface: '#FFFFFF',
  overlay: 'rgba(17, 17, 17, 0.45)',
  status: {
    pending: '#8A5A12',
    confirmed: '#1C4A3E',
    cancelled: '#8B2E2E',
    completed: '#3D3D3D',
    no_show: '#6B6B6B',
  },
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const radius = {
  sm: 6,
  md: 10,
  lg: 16,
} as const;

export const typography = {
  brand: {
    fontSize: 28,
    fontWeight: '700' as const,
    letterSpacing: -0.8,
    color: ink,
  },
  title: {
    fontSize: 22,
    fontWeight: '700' as const,
    letterSpacing: -0.4,
    color: ink,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '500' as const,
    color: muted,
  },
  body: {
    fontSize: 15,
    fontWeight: '400' as const,
    color: ink,
  },
  caption: {
    fontSize: 12,
    fontWeight: '500' as const,
    color: muted,
    letterSpacing: 0.2,
  },
  label: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: ink,
  },
};
