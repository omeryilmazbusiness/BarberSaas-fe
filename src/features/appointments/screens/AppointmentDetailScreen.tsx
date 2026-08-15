import React, { useCallback, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAuth } from '../../../core/auth/AuthContext';
import type { Appointment } from '../../../core/types/domain';
import { AppointmentStatus } from '../../../shared/constants/statuses';
import { StackRoute } from '../../../shared/constants/routes';
import type { RootStackParamList } from '../../../navigation/types';
import { tr } from '../../../shared/i18n/tr';
import { colors, radius, spacing, typography } from '../../../shared/theme';
import { Screen } from '../../../shared/ui/Screen';
import { ScreenHeader } from '../../../shared/ui/ScreenHeader';
import { Button } from '../../../shared/ui/Button';
import { StatusBadge } from '../../../shared/ui/StatusBadge';
import { errorMessage, formatDateTime } from '../../../shared/ui/format';

type Props = NativeStackScreenProps<
  RootStackParamList,
  typeof StackRoute.AppointmentDetail
>;

function isActive(status: Appointment['status']): boolean {
  return (
    status === AppointmentStatus.Pending ||
    status === AppointmentStatus.Confirmed
  );
}

export function AppointmentDetailScreen({ route, navigation }: Props) {
  const { appointmentId } = route.params;
  const { services, tenant } = useAuth();
  const [item, setItem] = useState<Appointment | null>(null);
  const [customerName, setCustomerName] = useState('');
  const [staffName, setStaffName] = useState('');
  const [serviceName, setServiceName] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [appointments, staff, catalog, users] = await Promise.all([
        services.appointments.list(),
        services.staff.list(),
        services.catalog.list(),
        services.users.list().catch(() => []),
      ]);
      const found = appointments.find((a) => a.id === appointmentId) ?? null;
      setItem(found);
      if (found) {
        setStaffName(
          staff.find((s) => s.id === found.staff_id)?.display_name ??
            tr.appointments.barberFallback,
        );
        setServiceName(
          catalog.find((s) => s.id === found.service_id)?.name ??
            tr.appointments.serviceFallback,
        );
        setCustomerName(
          users.find((u) => u.id === found.customer_id)?.full_name ??
            tr.appointments.customerFallback,
        );
      }
    } finally {
      setLoading(false);
    }
  }, [appointmentId, services]);

  useFocusEffect(
    useCallback(() => {
      load().catch(() => undefined);
    }, [load]),
  );

  const run = async (
    action: () => Promise<Appointment>,
    failTitle: string,
  ) => {
    setBusy(true);
    try {
      const next = await action();
      setItem(next);
    } catch (err) {
      Alert.alert(failTitle, errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  if (!loading && !item) {
    return (
      <Screen>
        <ScreenHeader
          title={tr.appointments.detailTitle}
          onBack={() => navigation.goBack()}
        />
        <Text style={styles.missing}>{tr.appointments.empty}</Text>
      </Screen>
    );
  }

  const active = item ? isActive(item.status) : false;

  return (
    <Screen loading={loading}>
      <ScreenHeader
        title={tr.appointments.detailTitle}
        subtitle={tr.appointments.detailSubtitle}
        onBack={() => navigation.goBack()}
      />

      {item ? (
        <View style={styles.body}>
          <View style={styles.card}>
            <Text style={styles.when}>
              {formatDateTime(item.starts_at, tenant?.timezone)}
            </Text>
            <StatusBadge status={item.status} />
          </View>

          <DetailRow
            label={tr.appointments.customerLabel}
            value={customerName}
          />
          <DetailRow label={tr.appointments.serviceLabel} value={serviceName} />
          <DetailRow label={tr.appointments.barberLabel} value={staffName} />
          <DetailRow
            label={tr.appointments.notesLabel}
            value={item.notes?.trim() ? item.notes : tr.appointments.noNotes}
          />

          <Text style={styles.hint}>{tr.appointments.actionsHint}</Text>

          {active ? (
            <View style={styles.actions}>
              <Button
                label={tr.appointments.complete}
                onPress={() =>
                  run(
                    () => services.appointments.complete(item.id),
                    tr.appointments.cannotComplete,
                  )
                }
                loading={busy}
              />
              <Button
                label={tr.appointments.noShow}
                variant="secondary"
                onPress={() =>
                  run(
                    () => services.appointments.markNoShow(item.id),
                    tr.appointments.cannotNoShow,
                  )
                }
                disabled={busy}
              />
              {item.status === AppointmentStatus.Pending ? (
                <Button
                  label={tr.appointments.confirm}
                  variant="secondary"
                  onPress={() =>
                    run(
                      () => services.appointments.confirm(item.id),
                      tr.appointments.cannotConfirm,
                    )
                  }
                  disabled={busy}
                />
              ) : null}
              <Button
                label={tr.appointments.cancel}
                variant="ghost"
                onPress={() =>
                  run(
                    () => services.appointments.cancel(item.id),
                    tr.appointments.cannotCancel,
                  )
                }
                disabled={busy}
              />
            </View>
          ) : null}
        </View>
      ) : null}
    </Screen>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detail}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  body: {
    gap: spacing.md,
    paddingBottom: spacing.xxl,
  },
  card: {
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.ink,
    backgroundColor: colors.accentSoft,
  },
  when: {
    ...typography.title,
    fontSize: 20,
    textTransform: 'capitalize',
  },
  detail: {
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.line,
  },
  detailLabel: {
    ...typography.caption,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  detailValue: {
    ...typography.body,
    fontSize: 16,
  },
  hint: {
    ...typography.caption,
    color: colors.muted,
    lineHeight: 18,
    marginTop: spacing.sm,
  },
  actions: {
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  missing: {
    ...typography.body,
    color: colors.muted,
  },
});
