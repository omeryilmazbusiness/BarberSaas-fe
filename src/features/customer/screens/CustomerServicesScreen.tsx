import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { CatalogService } from '../../../core/types/domain';
import { CustomerRoute } from '../../../shared/constants/routes';
import type { CustomerStackParamList } from '../../../navigation/types';
import { tr } from '../../../shared/i18n/tr';
import { colors, spacing, typography } from '../../../shared/theme';
import { Button } from '../../../shared/ui/Button';
import { Screen } from '../../../shared/ui/Screen';
import { errorMessage } from '../../../shared/ui/format';
import { ServiceCard } from '../components/ServiceCard';
import { useCustomerSession } from '../session/CustomerSessionContext';

type Props = NativeStackScreenProps<
  CustomerStackParamList,
  typeof CustomerRoute.Services
>;

export function CustomerServicesScreen({ route, navigation }: Props) {
  const shopSlug = route.params.shopSlug;
  const {
    services,
    session,
    selectedService,
    setSelectedService,
    isAuthenticated,
  } = useCustomerSession();
  const [items, setItems] = useState<CatalogService[]>([]);
  const [loading, setLoading] = useState(true);
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
      const list = await services.catalog.list();
      setItems(list.filter((s) => s.is_active !== false));
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [services.catalog]);

  useEffect(() => {
    if (isAuthenticated) {
      void load();
    }
  }, [load, isAuthenticated]);

  const onContinue = () => {
    if (!selectedService) {
      return;
    }
    navigation.navigate(CustomerRoute.Schedule, {
      shopSlug,
      serviceId: selectedService.id,
    });
  };

  if (!isAuthenticated) {
    return <Screen loading>{null}</Screen>;
  }

  return (
    <Screen scroll padded loading={loading}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>
          {session?.tenant.name ?? shopSlug}
        </Text>
        <Text style={styles.title}>{tr.customer.servicesTitle}</Text>
        <Text style={styles.subtitle}>{tr.customer.servicesSubtitle}</Text>
      </View>

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
