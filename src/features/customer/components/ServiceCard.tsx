import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { CatalogService } from '../../../core/types/domain';
import { colors, radius, spacing, typography } from '../../../shared/theme';
import { formatDuration, formatPrice } from '../../../shared/ui/format';
import { serviceIcon } from '../utils/format';

interface ServiceCardProps {
  service: CatalogService;
  selected: boolean;
  onPress: () => void;
}

export function ServiceCard({ service, selected, onPress }: ServiceCardProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        selected && styles.cardSelected,
        pressed && styles.pressed,
      ]}
    >
      <View style={[styles.iconWrap, selected && styles.iconWrapSelected]}>
        <Ionicons
          name={serviceIcon(service.name)}
          size={22}
          color={selected ? colors.white : colors.ink}
        />
      </View>
      <View style={styles.body}>
        <Text style={styles.name}>{service.name}</Text>
        <Text style={styles.meta}>
          {formatDuration(service.duration_minutes)}
          {service.description ? ` · ${service.description}` : ''}
        </Text>
      </View>
      <Text style={styles.price}>
        {formatPrice(service.price_cents, service.currency)}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
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
  cardSelected: {
    borderColor: colors.ink,
    backgroundColor: colors.accentSoft,
  },
  pressed: {
    opacity: 0.9,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.paper,
  },
  iconWrapSelected: {
    backgroundColor: colors.ink,
    borderColor: colors.ink,
  },
  body: {
    flex: 1,
    gap: 2,
  },
  name: {
    ...typography.label,
    fontSize: 15,
  },
  meta: {
    ...typography.caption,
  },
  price: {
    ...typography.label,
    fontSize: 15,
  },
});
