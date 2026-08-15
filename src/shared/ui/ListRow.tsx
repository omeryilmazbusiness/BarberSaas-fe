import React from 'react';
import { StyleSheet, Text, View, type ViewProps } from 'react-native';
import { colors, radius, spacing, typography } from '../theme';

interface ListRowProps extends ViewProps {
  title: string;
  subtitle?: string;
  meta?: string;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
}

/** Interaction container for list items — not decorative card chrome. */
export function ListRow({
  title,
  subtitle,
  meta,
  leading,
  trailing,
  style,
  ...rest
}: ListRowProps) {
  return (
    <View style={[styles.row, style]} {...rest}>
      {leading}
      <View style={styles.body}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        {meta ? <Text style={styles.meta}>{meta}</Text> : null}
      </View>
      {trailing}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
  },
  body: {
    flex: 1,
    gap: 2,
  },
  title: {
    ...typography.label,
    fontSize: 15,
  },
  subtitle: {
    ...typography.subtitle,
    fontSize: 13,
  },
  meta: {
    ...typography.caption,
    marginTop: 2,
  },
});
