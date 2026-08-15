import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { DayAvailability, TimeSlot } from '../../../core/types/domain';
import { CustomerRoute } from '../../../shared/constants/routes';
import type { CustomerStackParamList } from '../../../navigation/types';
import { tr } from '../../../shared/i18n/tr';
import { colors, spacing, typography } from '../../../shared/theme';
import { Button } from '../../../shared/ui/Button';
import { Screen } from '../../../shared/ui/Screen';
import { errorMessage, formatPrice } from '../../../shared/ui/format';
import { DayAccordion } from '../components/DayAccordion';
import { useCustomerSession } from '../session/CustomerSessionContext';

type Props = NativeStackScreenProps<
  CustomerStackParamList,
  typeof CustomerRoute.Schedule
>;

export function CustomerScheduleScreen({ route, navigation }: Props) {
  const { shopSlug, serviceId } = route.params;
  const { services, session, selectedService, setSelectedService, isAuthenticated } =
    useCustomerSession();
  const [days, setDays] = useState<DayAvailability[]>([]);
  const [expandedDate, setExpandedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigation.replace(CustomerRoute.Login, { shopSlug });
    }
  }, [isAuthenticated, navigation, shopSlug]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (!selectedService || selectedService.id !== serviceId) {
        const catalog = await services.catalog.list();
        const found = catalog.find((s) => s.id === serviceId) ?? null;
        setSelectedService(found);
      }
      const week = await services.availability.getWeek({
        shop_slug: shopSlug,
        service_id: serviceId,
        days: 7,
      });
      setDays(week);
      setExpandedDate(week[0]?.date ?? null);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [
    selectedService,
    serviceId,
    services.catalog,
    services.availability,
    shopSlug,
    setSelectedService,
  ]);

  useEffect(() => {
    if (isAuthenticated) {
      void load();
    }
  }, [load, isAuthenticated]);

  const onToggleDay = (date: string) => {
    setExpandedDate((current) => (current === date ? null : date));
    setSelectedSlot(null);
  };

  const onBook = async () => {
    if (!session || !selectedSlot) {
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const staff = await services.staff.list();
      const bookable = staff.find((s) => s.is_bookable) ?? staff[0];
      if (!bookable) {
        throw new Error(tr.customer.noBookableStaff);
      }
      const service =
        selectedService ??
        (await services.catalog.list()).find((s) => s.id === serviceId);
      const duration = service?.duration_minutes ?? 30;
      const ends = new Date(
        new Date(selectedSlot.starts_at).getTime() + duration * 60 * 1000,
      );
      const appointment = await services.appointments.create({
        customer_id: session.customer.id,
        staff_id: bookable.id,
        service_id: serviceId,
        starts_at: selectedSlot.starts_at,
        ends_at: ends.toISOString(),
        notes: `Tel: ${session.customer.phone ?? session.customer.email ?? ''}`,
      });
      navigation.replace(CustomerRoute.Success, {
        shopSlug,
        appointmentId: appointment.id,
        startsAt: appointment.starts_at,
        serviceName: service?.name ?? tr.customer.serviceFallback,
      });
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return <Screen loading>{null}</Screen>;
  }

  return (
    <Screen scroll padded loading={loading}>
      <View style={styles.header}>
        <Text style={styles.title}>{tr.customer.scheduleTitle}</Text>
        <Text style={styles.subtitle}>{tr.customer.scheduleSubtitle}</Text>
        {selectedService ? (
          <Text style={styles.serviceLine}>
            {selectedService.name} ·{' '}
            {formatPrice(selectedService.price_cents, selectedService.currency)}
          </Text>
        ) : null}
      </View>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.dot, styles.dotGreen]} />
          <Text style={styles.legendText}>{tr.customer.available}</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.dot, styles.dotRed]} />
          <Text style={styles.legendText}>{tr.customer.busy}</Text>
        </View>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.list}>
        {days.map((day) => (
          <DayAccordion
            key={day.date}
            day={day}
            expanded={expandedDate === day.date}
            selectedStartsAt={selectedSlot?.starts_at ?? null}
            onToggle={() => onToggleDay(day.date)}
            onSelectSlot={setSelectedSlot}
          />
        ))}
      </View>

      <Text style={styles.cancelNote}>{tr.customer.cancelPolicy}</Text>

      <View style={styles.footer}>
        <Button
          label={tr.customer.book}
          onPress={onBook}
          loading={submitting}
          disabled={!selectedSlot}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: spacing.sm,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  title: {
    ...typography.title,
  },
  subtitle: {
    ...typography.subtitle,
  },
  serviceLine: {
    ...typography.label,
    marginTop: spacing.xs,
  },
  legend: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginBottom: spacing.md,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotGreen: {
    backgroundColor: colors.available,
  },
  dotRed: {
    backgroundColor: colors.unavailable,
  },
  legendText: {
    ...typography.caption,
  },
  list: {
    gap: spacing.sm,
  },
  cancelNote: {
    ...typography.caption,
    marginTop: spacing.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 10,
    color: colors.ink,
    lineHeight: 18,
  },
  footer: {
    marginTop: spacing.lg,
    paddingBottom: spacing.lg,
  },
  error: {
    ...typography.caption,
    color: colors.danger,
    marginBottom: spacing.md,
  },
});
