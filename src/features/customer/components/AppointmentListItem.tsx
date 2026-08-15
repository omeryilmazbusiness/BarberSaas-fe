import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { CustomerAppointment } from '../../../core/types/domain';
import { tr } from '../../../shared/i18n/tr';
import { colors, radius, spacing, typography } from '../../../shared/theme';
import { formatBookingWhen } from '../utils/format';

interface AppointmentListItemProps {
  appointment: CustomerAppointment;
}

export function AppointmentListItem({ appointment }: AppointmentListItemProps) {
  const statusLabel =
    tr.status[appointment.status as keyof typeof tr.status] ??
    appointment.status;
  const isCancelled = appointment.status === 'cancelled';

  return (
    <View style={[styles.row, isCancelled && styles.rowMuted]}>
      <View style={styles.body}>
        <Text style={styles.title}>
          {appointment.service_name || tr.customer.serviceFallback}
        </Text>
        <Text style={styles.when}>
          {formatBookingWhen(appointment.starts_at)}
        </Text>
        {appointment.staff_name ? (
          <Text style={styles.meta}>{appointment.staff_name}</Text>
        ) : null}
      </View>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{statusLabel}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },
  rowMuted: {
    opacity: 0.55,
  },
  body: {
    flex: 1,
    gap: 4,
  },
  title: {
    ...typography.label,
    fontSize: 15,
  },
  when: {
    ...typography.body,
    fontSize: 14,
    textTransform: 'capitalize',
  },
  meta: {
    ...typography.caption,
  },
  badge: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: colors.accentSoft,
  },
  badgeText: {
    ...typography.caption,
    color: colors.ink,
    fontSize: 11,
  },
});
