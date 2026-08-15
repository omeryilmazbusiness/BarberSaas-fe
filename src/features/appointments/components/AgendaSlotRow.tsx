import React from 'react';
import {
  ActivityIndicator,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Appointment } from '../../../core/types/domain';
import { tr } from '../../../shared/i18n/tr';
import { colors, radius, spacing, typography } from '../../../shared/theme';
import {
  dialablePhone,
  isActionableAppointment,
  resolveAgendaTone,
  type AgendaTone,
} from '../utils/shopDayGrid';

interface AgendaSlotProps {
  timeLabel: string;
  appointment?: Appointment;
  customerName?: string;
  serviceName?: string;
  staffName?: string;
  phone?: string;
  actionBusy?: boolean;
  onComplete?: () => void;
  onNoShow?: () => void;
}

export function AgendaSlotRow({
  timeLabel,
  appointment,
  customerName,
  serviceName,
  staffName,
  phone,
  actionBusy = false,
  onComplete,
  onNoShow,
}: AgendaSlotProps) {
  const booked = Boolean(appointment);
  const tone = resolveAgendaTone(appointment?.status, appointment?.starts_at);
  const dial = dialablePhone(phone);
  const actionable =
    booked &&
    appointment &&
    isActionableAppointment(appointment.status) &&
    !actionBusy;
  const showPhone = booked && Boolean(dial) && tone !== 'no_show';
  const showActions = Boolean(actionable);
  const showControls = showActions || showPhone;
  const palette = tonePalette(tone);

  return (
    <View
      style={[
        styles.row,
        booked ? null : styles.rowFree,
        { borderColor: palette.border, backgroundColor: palette.bg },
      ]}
    >
      <Text style={[styles.time, booked && { color: palette.fg }]}>
        {timeLabel}
      </Text>

      <View style={styles.body}>
        {booked ? (
          <>
            <View style={styles.nameRow}>
              <Text style={styles.customer} numberOfLines={1}>
                {customerName ?? tr.appointments.customerFallback}
              </Text>
              <View style={styles.nameSpacer} />
              {showControls ? (
                <View style={styles.controls}>
                  {showActions ? (
                    <>
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={tr.appointments.completeA11y}
                        disabled={actionBusy}
                        onPress={onComplete}
                        hitSlop={4}
                        style={({ pressed }) => [
                          styles.actionBtn,
                          styles.completeBtn,
                          pressed && styles.pressed,
                        ]}
                      >
                        {actionBusy ? (
                          <ActivityIndicator
                            size="small"
                            color={colors.white}
                          />
                        ) : (
                          <Ionicons
                            name="checkmark"
                            size={14}
                            color={colors.white}
                          />
                        )}
                      </Pressable>
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={tr.appointments.noShowA11y}
                        disabled={actionBusy}
                        onPress={onNoShow}
                        hitSlop={4}
                        style={({ pressed }) => [
                          styles.actionBtn,
                          styles.noShowBtn,
                          pressed && styles.pressed,
                        ]}
                      >
                        <Ionicons name="close" size={14} color={colors.white} />
                      </Pressable>
                    </>
                  ) : null}
                  {showActions && showPhone ? (
                    <View style={styles.divider} />
                  ) : null}
                  {showPhone ? (
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={tr.appointments.callA11y}
                      onPress={() => {
                        void Linking.openURL(`tel:${dial}`);
                      }}
                      hitSlop={4}
                      style={({ pressed }) => [
                        styles.actionBtn,
                        styles.callBtn,
                        { backgroundColor: palette.fg },
                        pressed && styles.pressed,
                      ]}
                    >
                      <Ionicons name="call" size={14} color={colors.white} />
                    </Pressable>
                  ) : null}
                </View>
              ) : null}
              {tone === 'completed' || tone === 'no_show' ? (
                <Text
                  style={[styles.stateHint, { color: palette.fg }]}
                  numberOfLines={1}
                >
                  {tone === 'completed'
                    ? tr.status.completed
                    : tr.status.no_show}
                </Text>
              ) : null}
            </View>
            <Text style={styles.meta} numberOfLines={1}>
              {serviceName ?? tr.appointments.serviceFallback}
              {' · '}
              {staffName ?? tr.appointments.barberFallback}
            </Text>
          </>
        ) : (
          <Text style={styles.freeLabel}>{tr.appointments.slotFree}</Text>
        )}
      </View>
    </View>
  );
}

function tonePalette(tone: AgendaTone) {
  switch (tone) {
    case 'upcoming':
      return {
        border: colors.agenda.upcoming,
        bg: colors.agenda.upcomingSoft,
        fg: colors.agenda.upcoming,
      };
    case 'completed':
      return {
        border: colors.agenda.completed,
        bg: colors.agenda.completedSoft,
        fg: colors.agenda.completed,
      };
    case 'no_show':
      return {
        border: colors.agenda.noShow,
        bg: colors.agenda.noShowSoft,
        fg: colors.agenda.noShow,
      };
    default:
      return {
        border: colors.line,
        bg: colors.surface,
        fg: colors.muted,
      };
  }
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: 44,
    paddingVertical: 6,
    paddingLeft: spacing.sm,
    paddingRight: spacing.sm,
    borderWidth: 1,
    borderRadius: radius.sm,
  },
  rowFree: {
    opacity: 0.7,
  },
  time: {
    ...typography.label,
    width: 44,
    fontSize: 13,
    fontVariant: ['tabular-nums'],
    color: colors.muted,
  },
  body: {
    flex: 1,
    minWidth: 0,
    gap: 1,
    justifyContent: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minWidth: 0,
  },
  customer: {
    ...typography.label,
    flexShrink: 1,
    maxWidth: '48%',
    fontSize: 14,
    color: colors.ink,
  },
  nameSpacer: {
    flex: 1,
    minWidth: spacing.md,
  },
  meta: {
    ...typography.caption,
    fontSize: 11,
    color: colors.muted,
  },
  stateHint: {
    ...typography.caption,
    fontSize: 11,
    fontWeight: '700',
    flexShrink: 0,
  },
  freeLabel: {
    ...typography.caption,
    fontSize: 12,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexShrink: 0,
  },
  divider: {
    width: StyleSheet.hairlineWidth,
    height: 18,
    backgroundColor: colors.ink,
    opacity: 0.28,
    marginHorizontal: 2,
  },
  actionBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completeBtn: {
    backgroundColor: colors.agenda.upcoming,
  },
  noShowBtn: {
    backgroundColor: colors.agenda.noShow,
  },
  callBtn: {},
  pressed: {
    opacity: 0.85,
  },
});
