import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { CatalogService } from '../../../core/types/domain';
import { CustomerRoute } from '../../../shared/constants/routes';
import type { CustomerStackParamList } from '../../../navigation/types';
import { tr } from '../../../shared/i18n/tr';
import { colors, radius, spacing, typography } from '../../../shared/theme';
import { Button } from '../../../shared/ui/Button';
import { Screen } from '../../../shared/ui/Screen';
import { errorMessage } from '../../../shared/ui/format';
import { ServiceCard } from '../components/ServiceCard';
import { useCustomerSession } from '../session/CustomerSessionContext';
import { useCustomerShop } from '../session/CustomerShopContext';

type Props = NativeStackScreenProps<
  CustomerStackParamList,
  typeof CustomerRoute.Services
>;

export function CustomerServicesScreen({ navigation }: Props) {
  const { shopSlug } = useCustomerShop();
  const {
    services,
    session,
    selectedService,
    setSelectedService,
    isAuthenticated,
  } = useCustomerSession();
  const [items, setItems] = useState<CatalogService[]>([]);
  const [preferredIds, setPreferredIds] = useState<string[]>([]);
  const [preferenceNotes, setPreferenceNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigation.replace(CustomerRoute.Login);
    }
  }, [isAuthenticated, navigation]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [list, me] = await Promise.all([
        services.catalog.list(),
        services.customerProfile.getMe().catch(() => null),
      ]);
      const active = list.filter((s) => s.is_active !== false);
      setItems(active);
      const preferred = (me?.preferences?.preferred_service_ids ?? []).filter(
        (id) => active.some((s) => s.id === id),
      );
      setPreferredIds(preferred);
      setPreferenceNotes(me?.preferences?.notes ?? '');
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [services.catalog, services.customerProfile]);

  useFocusEffect(
    useCallback(() => {
      if (isAuthenticated) {
        void load();
      }
    }, [isAuthenticated, load]),
  );

  const usualService = useMemo(() => {
    if (preferredIds.length === 0) {
      return null;
    }
    return items.find((s) => s.id === preferredIds[0]) ?? null;
  }, [items, preferredIds]);

  const goSchedule = (service: CatalogService) => {
    setSelectedService(service);
    navigation.navigate(CustomerRoute.Schedule, {
      serviceId: service.id,
    });
  };

  const onContinue = () => {
    if (!selectedService) {
      return;
    }
    goSchedule(selectedService);
  };

  const onUsual = () => {
    if (!usualService) {
      return;
    }
    goSchedule(usualService);
  };

  if (!isAuthenticated) {
    return <Screen loading>{null}</Screen>;
  }

  return (
    <Screen scroll padded loading={loading}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View style={styles.headerText}>
            <Text style={styles.eyebrow}>
              {session?.tenant.name ?? shopSlug}
            </Text>
            <Text style={styles.title}>{tr.customer.servicesTitle}</Text>
          </View>
          <Pressable
            accessibilityRole="button"
            onPress={() =>
              navigation.navigate(CustomerRoute.Profile)
            }
            style={({ pressed }) => [
              styles.profileBtn,
              pressed && styles.pressed,
            ]}
          >
            <Ionicons name="person-outline" size={18} color={colors.ink} />
            <Text style={styles.profileLabel}>{tr.customer.profileCta}</Text>
          </Pressable>
        </View>
        <Text style={styles.subtitle}>{tr.customer.servicesSubtitle}</Text>
      </View>

      {usualService ? (
        <View style={styles.usualBlock}>
          <Button label={tr.customer.usualCta} onPress={onUsual} />
          <Text style={styles.usualHint}>
            {tr.customer.usualHint}
            {preferenceNotes ? ` · ${preferenceNotes}` : ''}
          </Text>
        </View>
      ) : (
        <Pressable
          accessibilityRole="button"
          onPress={() =>
            navigation.navigate(CustomerRoute.Profile)
          }
          style={({ pressed }) => [
            styles.setupCard,
            pressed && styles.pressed,
          ]}
        >
          <View style={styles.setupText}>
            <Text style={styles.setupTitle}>{tr.customer.setupUsualTitle}</Text>
            <Text style={styles.setupBody}>{tr.customer.setupUsualBody}</Text>
          </View>
          <Text style={styles.setupCta}>{tr.customer.setupUsualCta} →</Text>
        </Pressable>
      )}

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.list}>
        {items.map((service) => (
          <ServiceCard
            key={service.id}
            service={service}
            selected={selectedService?.id === service.id}
            onPress={() => setSelectedService(service)}
          />
        ))}
      </View>

      <View style={styles.footer}>
        <Button
          label={tr.common.continue}
          onPress={onContinue}
          disabled={!selectedService}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: spacing.sm,
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  headerText: {
    flex: 1,
    gap: spacing.xs,
  },
  profileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
  },
  profileLabel: {
    ...typography.label,
    fontSize: 12,
  },
  pressed: {
    opacity: 0.85,
  },
  eyebrow: {
    ...typography.caption,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  title: {
    ...typography.title,
  },
  subtitle: {
    ...typography.subtitle,
  },
  usualBlock: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  usualHint: {
    ...typography.caption,
  },
  setupCard: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.ink,
    borderRadius: radius.md,
    backgroundColor: colors.accentSoft,
  },
  setupText: {
    gap: spacing.xs,
  },
  setupTitle: {
    ...typography.label,
    fontSize: 14,
  },
  setupBody: {
    ...typography.caption,
    lineHeight: 17,
  },
  setupCta: {
    ...typography.label,
    fontSize: 13,
  },
  list: {
    gap: spacing.sm,
  },
  footer: {
    marginTop: spacing.xl,
    paddingBottom: spacing.lg,
  },
  error: {
    ...typography.caption,
    color: colors.danger,
    marginBottom: spacing.md,
  },
});
