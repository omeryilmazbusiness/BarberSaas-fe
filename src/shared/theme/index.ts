const ink = '#0A0A0A';
const paper = '#FFFFFF';
const muted = '#737373';
const line = '#E5E5E5';
const accent = '#0A0A0A';
const accentSoft = '#F5F5F5';
const danger = '#DC2626';
const warning = '#A3A3A3';
const success = '#16A34A';

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
  overlay: 'rgba(10, 10, 10, 0.45)',
  available: success,
  unavailable: danger,
  status: {
    pending: '#525252',
    confirmed: ink,
    cancelled: danger,
    completed: '#404040',
    no_show: muted,
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
