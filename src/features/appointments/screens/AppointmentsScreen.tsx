import React, { useCallback, useMemo, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../../../core/auth/AuthContext';
import type { Appointment } from '../../../core/types/domain';
import { AppointmentStatus } from '../../../shared/constants/statuses';
import { StackRoute } from '../../../shared/constants/routes';
import type { RootStackParamList } from '../../../navigation/types';
import { colors, spacing, typography } from '../../../shared/theme';
import { Screen } from '../../../shared/ui/Screen';
import { ScreenHeader } from '../../../shared/ui/ScreenHeader';
import { IconButton } from '../../../shared/ui/IconButton';
import { ListRow } from '../../../shared/ui/ListRow';
import { StatusBadge } from '../../../shared/ui/StatusBadge';
import { EmptyState } from '../../../shared/ui/EmptyState';
import { errorMessage, formatDateTime } from '../../../shared/ui/format';

export function AppointmentsScreen() {
  const { services, tenant } = useAuth();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [items, setItems] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [staffMap, setStaffMap] = useState<Record<string, string>>({});
  const [serviceMap, setServiceMap] = useState<Record<string, string>>({});
  const [userMap, setUserMap] = useState<Record<string, string>>({});

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
    } finally {
      setLoading(false);
    }
  }, [services]);

  useFocusEffect(
    useCallback(() => {
      load().catch(() => undefined);
    }, [load]),
  );

  const onConfirm = async (id: string) => {
    try {
      await services.appointments.confirm(id);
      await load();
    } catch (err) {
      Alert.alert('Cannot confirm', errorMessage(err));
    }
  };

  const onCancel = async (id: string) => {
    try {
      await services.appointments.cancel(id);
      await load();
    } catch (err) {
      Alert.alert('Cannot cancel', errorMessage(err));
    }
  };

  const sorted = useMemo(
    () =>
      [...items].sort(
        (a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime(),
      ),
    [items],
  );

  return (
    <Screen loading={loading}>
      <ScreenHeader
        title="Appointments"
        subtitle="Confirm pending · cancel when needed"
        rightAction={
          <IconButton
            name="add"
            accessibilityLabel="Book appointment"
            tone="accent"
            onPress={() => navigation.navigate(StackRoute.CreateAppointment)}
          />
        }
      />

      {sorted.length === 0 ? (
        <EmptyState
          icon="calendar-outline"
          title="No appointments"
          message="Book the first visit from the plus button."
        />
      ) : (
        <View style={styles.list}>
          {sorted.map((item) => (
            <ListRow
              key={item.id}
              title={formatDateTime(item.starts_at, tenant?.timezone)}
              subtitle={`${staffMap[item.staff_id] ?? 'Barber'} · ${serviceMap[item.service_id] ?? 'Service'}`}
              meta={userMap[item.customer_id] ?? item.customer_id.slice(0, 8)}
              trailing={
                <View style={styles.trailing}>
                  <StatusBadge status={item.status} />
                  <View style={styles.actions}>
                    {item.status === AppointmentStatus.Pending ? (
                      <IconButton
                        name="checkmark"
                        accessibilityLabel="Confirm"
                        tone="accent"
                        onPress={() => onConfirm(item.id)}
                      />
                    ) : null}
                    {item.status === AppointmentStatus.Pending ||
                    item.status === AppointmentStatus.Confirmed ? (
                      <IconButton
                        name="close"
                        accessibilityLabel="Cancel"
                        tone="danger"
                        onPress={() => onCancel(item.id)}
                      />
                    ) : null}
                  </View>
                </View>
              }
            />
          ))}
        </View>
      )}
      <Text style={styles.hint}>Overlap is blocked for the same barber.</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.sm,
  },
  trailing: {
    alignItems: 'flex-end',
    gap: spacing.sm,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  hint: {
    ...typography.caption,
    textAlign: 'center',
    marginTop: spacing.lg,
    color: colors.muted,
  },
});
