import React, { useCallback, useMemo, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAuth } from '../../../core/auth/AuthContext';
import type { Tenant } from '../../../core/types/domain';
import { TenantStatus } from '../../../shared/constants/statuses';
import { CustomerRoute, StackRoute } from '../../../shared/constants/routes';
import type { RootStackParamList } from '../../../navigation/types';
import { tr } from '../../../shared/i18n/tr';
import { colors, radius, spacing, typography } from '../../../shared/theme';
import { Screen } from '../../../shared/ui/Screen';
import { errorMessage } from '../../../shared/ui/format';

type Props = NativeStackScreenProps<
  RootStackParamList,
  typeof StackRoute.ShopDirectory
>;

export function ShopDirectoryScreen({ navigation }: Props) {
  const { services } = useAuth();
  const [shops, setShops] = useState<Tenant[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await services.tenants.list();
      setShops(
        list.filter(
          (t) =>
            t.slug !== 'platform' &&
            (t.status === TenantStatus.Active || t.status === TenantStatus.Trial),
        ),
      );
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [services.tenants]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return shops;
    }
    return shops.filter(
      (s) =>
        s.name.toLowerCase().includes(q) || s.slug.toLowerCase().includes(q),
    );
  }, [shops, query]);

  const openShop = (slug: string) => {
    navigation.navigate(StackRoute.Customer, {
      shopSlug: slug,
      screen: CustomerRoute.Login,
    });
  };

  return (
    <Screen scroll padded loading={loading}>
      <View style={styles.hero}>
        <Text style={styles.brand}>{tr.shopDirectory.brand}</Text>
        <Text style={styles.title}>{tr.shopDirectory.title}</Text>
        <Text style={styles.subtitle}>{tr.shopDirectory.subtitle}</Text>
      </View>

      <View style={styles.searchWrap}>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder={tr.shopDirectory.searchPlaceholder}
          placeholderTextColor={colors.muted}
          autoCapitalize="none"
          autoCorrect={false}
          style={styles.search}
        />
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.list}>
        {filtered.length === 0 ? (
          <Text style={styles.empty}>{tr.shopDirectory.empty}</Text>
        ) : (
          filtered.map((shop) => (
            <Pressable
              key={shop.id}
              accessibilityRole="button"
              onPress={() => openShop(shop.slug)}
              style={({ pressed }) => [
                styles.card,
                pressed && styles.cardPressed,
              ]}
            >
              <View style={styles.cardText}>
                <Text style={styles.shopName}>{shop.name}</Text>
                <Text style={styles.shopSlug}>/{shop.slug}</Text>
              </View>
              <Text style={styles.cta}>{tr.shopDirectory.openCta} →</Text>
            </Pressable>
          ))
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    gap: spacing.sm,
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
  },
  brand: {
    ...typography.caption,
    textTransform: 'uppercase',
    letterSpacing: 1.4,
  },
  title: {
    ...typography.brand,
  },
  subtitle: {
    ...typography.subtitle,
    maxWidth: 360,
  },
  searchWrap: {
    marginBottom: spacing.lg,
  },
  search: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: colors.ink,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.accentSoft,
    color: colors.ink,
    fontSize: 15,
  },
  list: {
    gap: spacing.sm,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },
  cardPressed: {
    backgroundColor: colors.accentSoft,
    borderColor: colors.ink,
  },
  cardText: {
    flex: 1,
    gap: 2,
  },
  shopName: {
    ...typography.label,
    fontSize: 16,
  },
  shopSlug: {
    ...typography.caption,
  },
  cta: {
    ...typography.label,
    fontSize: 13,
  },
  empty: {
    ...typography.body,
    color: colors.muted,
    paddingVertical: spacing.lg,
  },
  error: {
    ...typography.caption,
    color: colors.danger,
    marginBottom: spacing.md,
  },
});
