import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { DayAvailability, TimeSlot } from '../../../core/types/domain';
import { tr } from '../../../shared/i18n/tr';
import { colors, radius, spacing, typography } from '../../../shared/theme';
import { formatDayLabel } from '../utils/format';
import { TimeSlotGrid } from './TimeSlotGrid';

interface DayAccordionProps {
  day: DayAvailability;
  expanded: boolean;
  selectedStartsAt: string | null;
  onToggle: () => void;
  onSelectSlot: (slot: TimeSlot) => void;
}

export function DayAccordion({
  day,
  expanded,
  selectedStartsAt,
  onToggle,
  onSelectSlot,
}: DayAccordionProps) {
  const availableCount = day.slots.filter((s) => s.available).length;

  return (
    <View style={[styles.wrap, expanded && styles.wrapExpanded]}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        onPress={onToggle}
        style={({ pressed }) => [styles.header, pressed && styles.pressed]}
      >
        <View style={styles.headerText}>
          <Text style={styles.day}>{formatDayLabel(day.date)}</Text>
          <Text style={styles.count}>
            {availableCount} {tr.customer.availableHours}
          </Text>
        </View>
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={colors.ink}
        />
      </Pressable>
      {expanded ? (
        <TimeSlotGrid
          slots={day.slots}
          selectedStartsAt={selectedStartsAt}
          onSelect={onSelectSlot}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
  },
  wrapExpanded: {
    borderColor: colors.ink,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 48,
  },
  pressed: {
    opacity: 0.85,
  },
  headerText: {
    gap: 2,
    flex: 1,
  },
  day: {
    ...typography.label,
    fontSize: 15,
    textTransform: 'capitalize',
  },
  count: {
    ...typography.caption,
  },
});
