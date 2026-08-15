import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAuth } from '../../../core/auth/AuthContext';
import type { CatalogService, StaffMember, User } from '../../../core/types/domain';
import { UserRole } from '../../../shared/constants/roles';
import { StackRoute } from '../../../shared/constants/routes';
import type { RootStackParamList } from '../../../navigation/types';
import { tr } from '../../../shared/i18n/tr';
import { colors, radius, spacing, typography } from '../../../shared/theme';
import { Button } from '../../../shared/ui/Button';
import { Input } from '../../../shared/ui/Input';
import { Screen } from '../../../shared/ui/Screen';
import { ScreenHeader } from '../../../shared/ui/ScreenHeader';
import {
  errorMessage,
  formatLocalDateInput,
  formatLocalDateTimeLong,
  formatLocalTimeInput,
  parseLocalDateTime,
} from '../../../shared/ui/format';

type Props = NativeStackScreenProps<
  RootStackParamList,
  typeof StackRoute.CreateAppointment
>;

function defaultStart(): Date {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(11, 0, 0, 0);
  return d;
}

export function CreateAppointmentScreen({ navigation }: Props) {
  const { services } = useAuth();
  const [customers, setCustomers] = useState<User[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [catalog, setCatalog] = useState<CatalogService[]>([]);
  const [customerId, setCustomerId] = useState('');
  const [staffId, setStaffId] = useState('');
  const [serviceId, setServiceId] = useState('');
  const initial = defaultStart();
  const [dateText, setDateText] = useState(() => formatLocalDateInput(initial));
  const [timeText, setTimeText] = useState(() => formatLocalTimeInput(initial));
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [bootLoading, setBootLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const parsedStart = useMemo(
    () => parseLocalDateTime(dateText, timeText),
    [dateText, timeText],
  );

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
    if (!parsedStart) {
      setError(tr.createAppointment.startsAtInvalid);
      return;
    }
    setLoading(true);
    try {
      await services.appointments.create({
        customer_id: customerId,
        staff_id: staffId,
        service_id: serviceId,
        starts_at: parsedStart.toISOString(),
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

        <Text style={styles.sectionLabel}>{tr.createAppointment.startsAtLocal}</Text>
        <Text style={styles.hint}>{tr.createAppointment.startsAtHint}</Text>
        <View style={styles.row}>
          <View style={styles.half}>
            <Input
              label={tr.createAppointment.startsAtDate}
              value={dateText}
              onChangeText={setDateText}
              placeholder="15.08.2026"
              keyboardType="numbers-and-punctuation"
              autoCapitalize="none"
            />
          </View>
          <View style={styles.half}>
            <Input
              label={tr.createAppointment.startsAtTime}
              value={timeText}
              onChangeText={setTimeText}
              placeholder="11:00"
              keyboardType="numbers-and-punctuation"
              autoCapitalize="none"
            />
          </View>
        </View>
        <View
          style={[
            styles.preview,
            !parsedStart && styles.previewInvalid,
          ]}
        >
          <Text style={styles.previewLabel}>
            {tr.createAppointment.startsAtPreview}
          </Text>
          <Text style={styles.previewValue}>
            {parsedStart
              ? formatLocalDateTimeLong(parsedStart)
              : tr.createAppointment.startsAtInvalid}
          </Text>
        </View>

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
          disabled={!customerId || !staffId || !serviceId || !parsedStart}
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
  sectionLabel: {
    ...typography.label,
  },
  hint: {
    ...typography.caption,
    marginTop: -spacing.sm,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  half: {
    flex: 1,
  },
  preview: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    backgroundColor: colors.accentSoft,
    padding: spacing.md,
    gap: 4,
  },
  previewInvalid: {
    borderColor: colors.danger,
    backgroundColor: '#FEF2F2',
  },
  previewLabel: {
    ...typography.caption,
  },
  previewValue: {
    ...typography.label,
    fontSize: 15,
    textTransform: 'capitalize',
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
