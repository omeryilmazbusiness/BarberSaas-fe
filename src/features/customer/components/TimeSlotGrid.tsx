import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { TimeSlot } from '../../../core/types/domain';
import { colors, radius, spacing, typography } from '../../../shared/theme';
import { formatSlotTime } from '../utils/format';

interface TimeSlotGridProps {
  slots: TimeSlot[];
  selectedStartsAt: string | null;
  onSelect: (slot: TimeSlot) => void;
}

export function TimeSlotGrid({
  slots,
  selectedStartsAt,
  onSelect,
}: TimeSlotGridProps) {
  return (
    <View style={styles.grid}>
      {slots.map((slot) => {
        const selected = selectedStartsAt === slot.starts_at;
        const available = slot.available;
        return (
          <Pressable
            key={slot.starts_at}
            disabled={!available}
            accessibilityRole="button"
            accessibilityState={{ selected, disabled: !available }}
            onPress={() => onSelect(slot)}
            style={({ pressed }) => [
              styles.slot,
              available ? styles.available : styles.unavailable,
              selected && styles.selected,
              pressed && available && styles.pressed,
            ]}
          >
            <Text
              style={[
                styles.time,
                !available && styles.timeUnavailable,
                selected && styles.timeSelected,
              ]}
            >
              {formatSlotTime(slot.starts_at)}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    paddingTop: spacing.sm,
  },
  slot: {
    minWidth: 72,
    paddingVertical: 10,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.sm,
    borderWidth: 1,
    alignItems: 'center',
  },
  available: {
    borderColor: colors.available,
    backgroundColor: '#F0FDF4',
  },
  unavailable: {
    borderColor: colors.unavailable,
    backgroundColor: '#FEF2F2',
    opacity: 0.7,
  },
  selected: {
    backgroundColor: colors.ink,
    borderColor: colors.ink,
  },
  pressed: {
    opacity: 0.85,
  },
  time: {
    ...typography.label,
    fontSize: 13,
    color: colors.available,
  },
  timeUnavailable: {
    color: colors.unavailable,
    textDecorationLine: 'line-through',
  },
  timeSelected: {
    color: colors.white,
  },
});
