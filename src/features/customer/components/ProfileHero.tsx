import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '../../../shared/theme';

interface ProfileHeroProps {
  shopName: string;
  displayName: string;
  subtitle?: string;
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return 'M';
  }
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

/** Premium header: black band for brand only; identity sits fully below it. */
export function ProfileHero({
  shopName,
  displayName,
  subtitle,
}: ProfileHeroProps) {
  return (
    <View style={styles.wrap}>
      <View style={styles.band}>
        <Text style={styles.bandLabel} numberOfLines={1}>
          {shopName}
        </Text>
      </View>
      <View style={styles.body}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials(displayName)}</Text>
        </View>
        <View style={styles.text}>
          <Text style={styles.name} numberOfLines={2}>
            {displayName}
          </Text>
          {subtitle ? (
            <Text style={styles.subtitle} numberOfLines={2}>
              {subtitle}
            </Text>
          ) : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginHorizontal: -spacing.md,
    marginBottom: spacing.lg,
  },
  band: {
    backgroundColor: colors.ink,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  bandLabel: {
    ...typography.caption,
    color: colors.white,
    textTransform: 'uppercase',
    letterSpacing: 1.4,
  },
  body: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
    backgroundColor: colors.paper,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: radius.lg,
    backgroundColor: colors.accentSoft,
    borderWidth: 1,
    borderColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    ...typography.label,
    fontSize: 18,
    letterSpacing: 0.4,
  },
  text: {
    flex: 1,
    gap: 4,
  },
  name: {
    ...typography.title,
    fontSize: 22,
  },
  subtitle: {
    ...typography.caption,
    lineHeight: 16,
  },
});
