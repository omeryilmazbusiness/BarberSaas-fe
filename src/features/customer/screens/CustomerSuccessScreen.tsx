import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CustomerRoute } from '../../../shared/constants/routes';
import type { CustomerStackParamList } from '../../../navigation/types';
import { tr } from '../../../shared/i18n/tr';
import { colors, radius, spacing, typography } from '../../../shared/theme';
import { Button } from '../../../shared/ui/Button';
import { Screen } from '../../../shared/ui/Screen';
import { formatBookingWhen } from '../utils/format';

type Props = NativeStackScreenProps<
  CustomerStackParamList,
  typeof CustomerRoute.Success
>;

export function CustomerSuccessScreen({ route, navigation }: Props) {
  const { serviceName, startsAt } = route.params;

  return (
    <Screen scroll padded>
      <View style={styles.wrap}>
        <View style={styles.icon}>
          <Ionicons name="checkmark" size={28} color={colors.white} />
        </View>
        <Text style={styles.title}>{tr.customer.successTitle}</Text>
        <Text style={styles.subtitle}>{serviceName}</Text>
        <Text style={styles.when}>{formatBookingWhen(startsAt)}</Text>

        <Text style={styles.cancelNote}>{tr.customer.cancelPolicy}</Text>
        <Text style={styles.hint}>{tr.customer.successDoneHint}</Text>

        <Button
          label={tr.customer.done}
          onPress={() => navigation.replace(CustomerRoute.Profile)}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing.md,
    paddingTop: spacing.xxl,
  },
  icon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  title: {
    ...typography.title,
  },
  subtitle: {
    ...typography.subtitle,
  },
  when: {
    ...typography.label,
    fontSize: 16,
    textTransform: 'capitalize',
  },
  cancelNote: {
    ...typography.caption,
    marginTop: spacing.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    color: colors.ink,
    lineHeight: 18,
  },
  hint: {
    ...typography.caption,
    marginBottom: spacing.sm,
    lineHeight: 18,
  },
});
