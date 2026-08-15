import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../core/auth/AuthContext';
import { isPlatformTenant } from '../../core/auth/platform';
import { colors, spacing, typography } from '../theme';

interface ScreenHeaderProps {
  /** Section label under the shop name (optional). */
  title?: string;
  subtitle?: string;
  onBack?: () => void;
  rightAction?: React.ReactNode;
  /**
   * Shop logo title. `true` (default) uses tenant name.
   * Pass a string to override, or `false` to hide.
   */
  brand?: string | boolean;
}

/** Prefer real shop name; never show raw slug hyphens as the logo. */
export function formatShopBrand(
  name?: string | null,
  slug?: string | null,
): string {
  const trimmed = name?.trim();
  if (trimmed) {
    return trimmed;
  }
  if (!slug?.trim()) {
    return '';
  }
  return slug
    .trim()
    .split(/[-_]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function ScreenHeader({
  title,
  subtitle,
  onBack,
  rightAction,
  brand = true,
}: ScreenHeaderProps) {
  const { tenant } = useAuth();
  const brandName =
    brand === false || isPlatformTenant(tenant)
      ? undefined
      : typeof brand === 'string'
        ? brand
        : formatShopBrand(tenant?.name, tenant?.slug);

  return (
    <View style={styles.wrap}>
      {brandName ? <Text style={styles.brand}>{brandName}</Text> : null}
      <View style={styles.row}>
        <View style={styles.left}>
          {onBack ? (
            <Pressable
              accessibilityRole="button"
              onPress={onBack}
              style={styles.back}
              hitSlop={8}
            >
              <Ionicons name="chevron-back" size={22} color={colors.ink} />
            </Pressable>
          ) : null}
          <View style={styles.titles}>
            {title ? (
              <Text
                style={[styles.title, brandName ? styles.titleUnderBrand : null]}
              >
                {title}
              </Text>
            ) : null}
            {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          </View>
        </View>
        {rightAction}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    gap: spacing.xs,
  },
  brand: {
    ...typography.brand,
    fontSize: 30,
    letterSpacing: 0,
    marginBottom: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  left: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
  },
  back: {
    marginTop: 2,
    padding: 2,
  },
  titles: {
    flex: 1,
    gap: 2,
  },
  title: {
    ...typography.title,
  },
  titleUnderBrand: {
    ...typography.label,
    fontSize: 14,
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    fontWeight: '600',
  },
  subtitle: {
    ...typography.subtitle,
    fontSize: 14,
  },
});
