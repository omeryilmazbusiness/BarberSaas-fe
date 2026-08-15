import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../theme';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  rightAction?: React.ReactNode;
}

export function ScreenHeader({
  title,
  subtitle,
  onBack,
  rightAction,
}: ScreenHeaderProps) {
  return (
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
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
      </View>
      {rightAction}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
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
  subtitle: {
    ...typography.subtitle,
    fontSize: 14,
  },
});
