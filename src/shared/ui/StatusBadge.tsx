import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { AppointmentStatus } from '../constants/statuses';
import { tr } from '../i18n/tr';
import { colors, radius, spacing, typography } from '../theme';

const labels: Record<AppointmentStatus, string> = {
  pending: tr.status.pending,
  confirmed: tr.status.confirmed,
  cancelled: tr.status.cancelled,
  completed: tr.status.completed,
  no_show: tr.status.no_show,
};

interface StatusBadgeProps {
  status: AppointmentStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const color = colors.status[status] ?? colors.muted;
  return (
    <View style={[styles.badge, { backgroundColor: `${color}18` }]}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={[styles.text, { color }]}>{labels[status]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.sm,
    alignSelf: 'flex-start',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  text: {
    ...typography.caption,
    fontWeight: '600',
  },
});
