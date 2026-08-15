import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type {
  CatalogService,
  DayAvailability,
  TimeSlot,
} from '../../../core/types/domain';
import { CustomerRoute } from '../../../shared/constants/routes';
import type { CustomerStackParamList } from '../../../navigation/types';
import { tr } from '../../../shared/i18n/tr';
import { colors, spacing, typography } from '../../../shared/theme';
import { Button } from '../../../shared/ui/Button';
import { Screen } from '../../../shared/ui/Screen';
import {
  errorMessage,
  formatDuration,
  formatPrice,
} from '../../../shared/ui/format';
import { DayAccordion } from '../components/DayAccordion';
import { useCustomerSession } from '../session/CustomerSessionContext';
import { useCustomerShop } from '../session/CustomerShopContext';

type Props = NativeStackScreenProps<
  CustomerStackParamList,
  typeof CustomerRoute.Schedule
>;

function parseServiceIds(raw: string): string[] {
  return raw
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean);
}

export function CustomerScheduleScreen({ route, navigation }: Props) {
  const serviceIds = useMemo(
    () => parseServiceIds(route.params.serviceIds ?? ''),
    [route.params.serviceIds],
  );
  const primaryServiceId = serviceIds[0] ?? '';
  const { shopSlug } = useCustomerShop();
  const {
    services,
    session,
    selectedServices,
    setSelectedServices,
    isAuthenticated,
  } = useCustomerSession();
  const [bundle, setBundle] = useState<CatalogService[]>(selectedServices);
  const [days, setDays] = useState<DayAvailability[]>([]);
  const [expandedDate, setExpandedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigation.replace(CustomerRoute.Login);
    }
  }, [isAuthenticated, navigation]);

  const totals = useMemo(() => {
    const minutes = bundle.reduce((sum, s) => sum + s.duration_minutes, 0);
    const cents = bundle.reduce((sum, s) => sum + s.price_cents, 0);
    const currency = bundle[0]?.currency ?? 'TRY';
    const names = bundle.map((s) => s.name).join(' + ');
    return { minutes: Math.max(minutes, 5), cents, currency, names };
  }, [bundle]);

  const load = useCallback(async () => {
    if (!primaryServiceId) {
      setError(tr.customer.serviceMissing);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      let nextBundle = selectedServices.filter((s) =>
        serviceIds.includes(s.id),
      );
      if (
        nextBundle.length !== serviceIds.length ||
        nextBundle.length === 0
      ) {
        const catalog = await services.catalog.list();
        nextBundle = serviceIds
          .map((id) => catalog.find((s) => s.id === id))
          .filter((s): s is CatalogService => Boolean(s));
        setSelectedServices(nextBundle);
      }
      setBundle(nextBundle);

      const durationMinutes = Math.max(
        5,
        nextBundle.reduce((sum, s) => sum + s.duration_minutes, 0),
      );
      const week = await services.availability.getWeek({
        shop_slug: shopSlug,
        service_id: primaryServiceId,
        duration_minutes: durationMinutes,
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
    primaryServiceId,
    selectedServices,
    serviceIds,
    services.catalog,
    services.availability,
    shopSlug,
    setSelectedServices,
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
    if (!session || !selectedSlot || !primaryServiceId || bundle.length === 0) {
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
      const ends = new Date(
        new Date(selectedSlot.starts_at).getTime() +
          totals.minutes * 60 * 1000,
      );
      const contact = session.customer.phone ?? session.customer.email ?? '';
      const servicesNote =
        bundle.length > 1
          ? `Hizmetler: ${bundle.map((s) => s.name).join(', ')}`
          : '';
      const notes = [contact ? `Tel: ${contact}` : '', servicesNote]
        .filter(Boolean)
        .join(' · ');

      const appointment = await services.appointments.create({
        customer_id: session.customer.id,
        staff_id: bookable.id,
        service_id: primaryServiceId,
        starts_at: selectedSlot.starts_at,
        ends_at: ends.toISOString(),
        notes: notes || undefined,
      });
      navigation.replace(CustomerRoute.Success, {
        appointmentId: appointment.id,
        startsAt: appointment.starts_at,
        serviceName: totals.names || tr.customer.serviceFallback,
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
        {bundle.length > 0 ? (
          <Text style={styles.serviceLine}>
            {totals.names}
            {' · '}
            {formatDuration(totals.minutes)}
            {' · '}
            {formatPrice(totals.cents, totals.currency)}
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
          disabled={!selectedSlot || bundle.length === 0}
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
