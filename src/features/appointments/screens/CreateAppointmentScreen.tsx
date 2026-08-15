import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAuth } from '../../../core/auth/AuthContext';
import type { CatalogService, StaffMember, User } from '../../../core/types/domain';
import { UserRole } from '../../../shared/constants/roles';
import { StackRoute } from '../../../shared/constants/routes';
import type { RootStackParamList } from '../../../navigation/types';
import { tr } from '../../../shared/i18n/tr';
import { colors, spacing, typography } from '../../../shared/theme';
import { Button } from '../../../shared/ui/Button';
import { Input } from '../../../shared/ui/Input';
import { Screen } from '../../../shared/ui/Screen';
import { ScreenHeader } from '../../../shared/ui/ScreenHeader';
import { errorMessage } from '../../../shared/ui/format';

type Props = NativeStackScreenProps<
  RootStackParamList,
  typeof StackRoute.CreateAppointment
>;

export function CreateAppointmentScreen({ navigation }: Props) {
  const { services } = useAuth();
  const [customers, setCustomers] = useState<User[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [catalog, setCatalog] = useState<CatalogService[]>([]);
  const [customerId, setCustomerId] = useState('');
  const [staffId, setStaffId] = useState('');
  const [serviceId, setServiceId] = useState('');
  const [startsAt, setStartsAt] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(11, 0, 0, 0);
    return d.toISOString().slice(0, 16);
  });
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [bootLoading, setBootLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [users, staffList, servicesList] = await Promise.all([
          services.users.list().catch(() => []),
          services.staff.list(),
          services.catalog.list(),
        ]);
        const customerList = users.filter((u) => u.role === UserRole.Customer);
        setCustomers(customerList);
        setStaff(staffList.filter((s) => s.is_bookable));
        setCatalog(servicesList);
        if (customerList[0]) setCustomerId(customerList[0].id);
        if (staffList[0]) setStaffId(staffList[0].id);
        if (servicesList[0]) setServiceId(servicesList[0].id);
      } finally {
        setBootLoading(false);
      }
    })().catch((err) => setError(errorMessage(err)));
  }, [services]);

  const onSubmit = async () => {
    setError(null);
    setLoading(true);
    try {
      const iso = new Date(startsAt).toISOString();
      await services.appointments.create({
        customer_id: customerId,
        staff_id: staffId,
        service_id: serviceId,
        starts_at: iso,
        notes: notes.trim() || undefined,
      });
      navigation.goBack();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen loading={bootLoading}>
      <ScreenHeader
        title={tr.createAppointment.title}
        subtitle={tr.createAppointment.subtitle}
        onBack={() => navigation.goBack()}
      />
      <View style={styles.form}>
        <SelectField
          label={tr.createAppointment.customer}
          value={customerId}
          options={customers.map((c) => ({ id: c.id, label: c.full_name }))}
          onChange={setCustomerId}
          empty={tr.createAppointment.customerEmpty}
        />
        <SelectField
          label={tr.createAppointment.barber}
          value={staffId}
          options={staff.map((s) => ({ id: s.id, label: s.display_name }))}
          onChange={setStaffId}
        />
        <SelectField
          label={tr.createAppointment.service}
          value={serviceId}
          options={catalog.map((s) => ({
            id: s.id,
            label: `${s.name} · ${tr.duration.minutes(s.duration_minutes)}`,
          }))}
          onChange={setServiceId}
        />
        <Input
          label={tr.createAppointment.startsAtLocal}
          value={startsAt}
          onChangeText={setStartsAt}
          placeholder="YYYY-MM-DDTHH:mm"
          autoCapitalize="none"
        />
        <Input
          label={tr.createAppointment.notes}
          value={notes}
          onChangeText={setNotes}
          placeholder={tr.common.optional}
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Button
          label={tr.createAppointment.submit}
          onPress={onSubmit}
          loading={loading}
          disabled={!customerId || !staffId || !serviceId}
        />
      </View>
    </Screen>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
  empty,
}: {
  label: string;
  value: string;
  options: { id: string; label: string }[];
  onChange: (id: string) => void;
  empty?: string;
}) {
  if (options.length === 0) {
    return (
      <View style={styles.select}>
        <Text style={styles.selectLabel}>{label}</Text>
        <Text style={styles.empty}>{empty ?? tr.common.nothingAvailable}</Text>
      </View>
    );
  }
  return (
    <View style={styles.select}>
      <Text style={styles.selectLabel}>{label}</Text>
      <View style={styles.chips}>
        {options.map((opt) => {
          const active = opt.id === value;
          return (
            <Text
              key={opt.id}
              onPress={() => onChange(opt.id)}
              style={[styles.chip, active && styles.chipActive]}
            >
              {opt.label}
            </Text>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: spacing.md,
  },
  select: {
    gap: spacing.sm,
  },
  selectLabel: {
    ...typography.label,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    ...typography.label,
    fontSize: 13,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    overflow: 'hidden',
    color: colors.ink,
  },
  chipActive: {
    backgroundColor: colors.accentSoft,
    borderColor: colors.accent,
    color: colors.accent,
  },
  empty: {
    ...typography.caption,
  },
  error: {
    ...typography.caption,
    color: colors.danger,
  },
});
