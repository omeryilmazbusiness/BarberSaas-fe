import React, { useCallback, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../../../core/auth/AuthContext';
import type { Appointment } from '../../../core/types/domain';
import { StackRoute } from '../../../shared/constants/routes';
import type { RootStackParamList } from '../../../navigation/types';
import { tr } from '../../../shared/i18n/tr';
import { colors, layout, radius, spacing, typography } from '../../../shared/theme';
import { Screen } from '../../../shared/ui/Screen';
import { ScreenHeader } from '../../../shared/ui/ScreenHeader';
import { IconButton } from '../../../shared/ui/IconButton';
import { EmptyState } from '../../../shared/ui/EmptyState';
import { AgendaSlotRow } from '../components/AgendaSlotRow';
import {
  appointmentOverlapsSlot,
  buildDaySlotStarts,
  dayKeyFromDate,
  DEFAULT_CLOSE_TIME,
  DEFAULT_OPEN_TIME,
  DEFAULT_SLOT_MINUTES,
  formatMinutesAsClock,
  formatSlotClock,
  occupiesSlot,
  phoneFromNotes,
  resolveWorkingMinutes,
} from '../utils/shopDayGrid';

type DayGroup = {
  key: string;
  title: string;
  isToday: boolean;
  items: Appointment[];
};

function formatDayTitle(key: string, isToday: boolean, isTomorrow: boolean): string {
  if (isToday) {
    return tr.appointments.today;
  }
  if (isTomorrow) {
    return tr.appointments.tomorrow;
  }
  const [y, m, d] = key.split('-').map(Number);
  return new Intl.DateTimeFormat('tr-TR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date(y, m - 1, d));
}

function formatTime(iso: string, timeZone?: string): string {
  return new Intl.DateTimeFormat('tr-TR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone,
  }).format(new Date(iso));
}

function addDaysKey(base: Date, days: number, timeZone?: string): string {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return dayKeyFromDate(d, timeZone);
}

export function AppointmentsScreen() {
  const { services, tenant } = useAuth();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [items, setItems] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [staffMap, setStaffMap] = useState<Record<string, string>>({});
  const [serviceMap, setServiceMap] = useState<Record<string, string>>({});
  const [userMap, setUserMap] = useState<Record<string, string>>({});
  const [phoneMap, setPhoneMap] = useState<Record<string, string>>({});
  const [expandedDays, setExpandedDays] = useState<Record<string, boolean>>({});
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [appointments, staff, catalog, users] = await Promise.all([
        services.appointments.list(),
        services.staff.list(),
        services.catalog.list(),
        services.users.list().catch(() => []),
      ]);
      setItems(appointments);
      setStaffMap(Object.fromEntries(staff.map((s) => [s.id, s.display_name])));
      setServiceMap(Object.fromEntries(catalog.map((s) => [s.id, s.name])));
      setUserMap(Object.fromEntries(users.map((u) => [u.id, u.full_name])));
      setPhoneMap(
        Object.fromEntries(
          users
            .filter((u) => Boolean(u.phone))
            .map((u) => [u.id, u.phone as string]),
        ),
      );
    } finally {
      setLoading(false);
    }
  }, [services]);

  useFocusEffect(
    useCallback(() => {
      load().catch(() => undefined);
    }, [load]),
  );

  const tz = tenant?.timezone;
  const openTime = tenant?.open_time ?? DEFAULT_OPEN_TIME;
  const closeTime = tenant?.close_time ?? DEFAULT_CLOSE_TIME;
  const { openMinute, closeMinute } = resolveWorkingMinutes(openTime, closeTime);
  const slotMinutes = Math.max(
    5,
    tenant?.slot_minutes ?? DEFAULT_SLOT_MINUTES,
  );
  const todayKey = dayKeyFromDate(new Date(), tz);
  const tomorrowKey = addDaysKey(new Date(), 1, tz);

  const groups = useMemo(() => {
    const byDay = new Map<string, Appointment[]>();
    for (const item of items) {
      if (item.status === 'cancelled') {
        continue;
      }
      const key = dayKeyFromDate(new Date(item.starts_at), tz);
      const list = byDay.get(key) ?? [];
      list.push(item);
      byDay.set(key, list);
    }
    for (const list of byDay.values()) {
      list.sort(
        (a, b) =>
          new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime(),
      );
    }

    const weekKeys: string[] = [];
    for (let i = 0; i < 7; i += 1) {
      weekKeys.push(addDaysKey(new Date(), i, tz));
    }

    return weekKeys.map((key) => ({
      key,
      isToday: key === todayKey,
      title: formatDayTitle(key, key === todayKey, key === tomorrowKey),
      items: byDay.get(key) ?? [],
    })) as DayGroup[];
  }, [items, tz, todayKey, tomorrowKey]);

  const todayGroup = groups.find((g) => g.isToday) ?? groups[0];
  const otherGroups = groups.filter((g) => !g.isToday);

  const resolvePhone = (item: Appointment) =>
    phoneMap[item.customer_id] || phoneFromNotes(item.notes);

  const patchAppointment = (updated: Appointment) => {
    setItems((prev) =>
      prev.map((item) => (item.id === updated.id ? updated : item)),
    );
  };

  const onComplete = async (id: string) => {
    setBusyId(id);
    try {
      const updated = await services.appointments.complete(id);
      patchAppointment(updated);
    } catch {
      // keep list as-is; user can retry
    } finally {
      setBusyId(null);
    }
  };

  const onNoShow = async (id: string) => {
    setBusyId(id);
    try {
      const updated = await services.appointments.markNoShow(id);
      patchAppointment(updated);
    } catch {
      // keep list as-is
    } finally {
      setBusyId(null);
    }
  };

  const isExpanded = (key: string, isToday: boolean) =>
    isToday || Boolean(expandedDays[key]);

  const toggleDay = (key: string) => {
    setExpandedDays((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const renderBookingRow = (
    item: Appointment,
    timeLabel: string,
    key: string,
  ) => (
    <AgendaSlotRow
      key={key}
      timeLabel={timeLabel}
      appointment={item}
      customerName={
        userMap[item.customer_id] ?? tr.appointments.customerFallback
      }
      serviceName={
        serviceMap[item.service_id] ?? tr.appointments.serviceFallback
      }
      staffName={staffMap[item.staff_id] ?? tr.appointments.barberFallback}
      phone={resolvePhone(item)}
      actionBusy={busyId === item.id}
      onComplete={() => {
        void onComplete(item.id);
      }}
      onNoShow={() => {
        void onNoShow(item.id);
      }}
    />
  );

  return (
    <Screen loading={loading} tabInset>
      <ScreenHeader
        title={tr.appointments.title}
        subtitle={tr.appointments.subtitle}
        rightAction={
          <IconButton
            name="add"
            accessibilityLabel={tr.appointments.bookA11y}
            tone="accent"
            onPress={() => navigation.navigate(StackRoute.CreateAppointment)}
          />
        }
      />

      {!todayGroup ? (
        <EmptyState
          icon="calendar-outline"
          title={tr.appointments.empty}
          message={tr.appointments.emptyMessage}
        />
      ) : (
        <View style={styles.agenda}>
          <View style={styles.day}>
            <View style={styles.dayHeader}>
              <Text style={styles.dayTitle}>{todayGroup.title}</Text>
              <Text style={styles.dayCount}>
                {tr.appointments.todaySlotSummary(
                  todayGroup.items.filter((i) => occupiesSlot(i.status)).length,
                  formatMinutesAsClock(openMinute),
                  formatMinutesAsClock(closeMinute),
                )}
              </Text>
            </View>
            <View style={styles.slots}>
              {buildDaySlotStarts(todayGroup.key, {
                openTime,
                closeTime,
                slotMinutes,
              }).map((slotStart) => {
                const booking =
                  todayGroup.items.find(
                    (item) =>
                      occupiesSlot(item.status) &&
                      appointmentOverlapsSlot(
                        item.starts_at,
                        item.ends_at,
                        slotStart,
                        slotMinutes,
                      ),
                  ) ?? undefined;
                if (booking) {
                  return renderBookingRow(
                    booking,
                    formatSlotClock(slotStart),
                    slotStart.toISOString(),
                  );
                }
                return (
                  <AgendaSlotRow
                    key={slotStart.toISOString()}
                    timeLabel={formatSlotClock(slotStart)}
                  />
                );
              })}
            </View>
          </View>

          <Text style={styles.weekLabel}>{tr.appointments.weekSection}</Text>
          <View style={styles.weekList}>
            {otherGroups.map((group) => {
              const open = isExpanded(group.key, false);
              const count = group.items.filter((i) =>
                occupiesSlot(i.status),
              ).length;
              return (
                <View key={group.key} style={styles.collapse}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={
                      open
                        ? tr.appointments.collapseDay
                        : tr.appointments.expandDay
                    }
                    onPress={() => toggleDay(group.key)}
                    style={({ pressed }) => [
                      styles.collapseHeader,
                      pressed && styles.pressed,
                    ]}
                  >
                    <View style={styles.collapseTitleWrap}>
                      <Text style={styles.collapseTitle}>{group.title}</Text>
                      <Text style={styles.collapseCount}>
                        {tr.appointments.slotCount(count)}
                      </Text>
                    </View>
                    <Ionicons
                      name={open ? 'chevron-up' : 'chevron-down'}
                      size={18}
                      color={colors.muted}
                    />
                  </Pressable>
                  {open ? (
                    <View style={styles.collapseBody}>
                      {group.items.length === 0 ? (
                        <Text style={styles.emptyDay}>
                          {tr.appointments.empty}
                        </Text>
                      ) : (
                        group.items.map((item) =>
                          renderBookingRow(
                            item,
                            formatTime(item.starts_at, tz),
                            item.id,
                          ),
                        )
                      )}
                    </View>
                  ) : null}
                </View>
              );
            })}
          </View>
        </View>
      )}
      <Text style={styles.hint}>{tr.appointments.actionsHint}</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  agenda: {
    gap: spacing.lg,
  },
  day: {
    gap: spacing.sm,
  },
  dayHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  dayTitle: {
    ...typography.label,
    fontSize: 16,
    textTransform: 'capitalize',
  },
  dayCount: {
    ...typography.caption,
  },
  slots: {
    gap: spacing.sm,
  },
  weekLabel: {
    ...typography.label,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    fontSize: 11,
    color: colors.muted,
    marginTop: spacing.sm,
  },
  weekList: {
    gap: spacing.sm,
  },
  collapse: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  collapseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  collapseTitleWrap: {
    flex: 1,
    gap: 2,
  },
  collapseTitle: {
    ...typography.label,
    fontSize: 15,
    textTransform: 'capitalize',
  },
  collapseCount: {
    ...typography.caption,
  },
  collapseBody: {
    gap: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.sm,
  },
  emptyDay: {
    ...typography.caption,
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.sm,
  },
  pressed: {
    opacity: 0.9,
  },
  hint: {
    ...typography.caption,
    textAlign: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    color: colors.muted,
    paddingBottom: layout.floatingTabBarContentInset / 4,
  },
});
