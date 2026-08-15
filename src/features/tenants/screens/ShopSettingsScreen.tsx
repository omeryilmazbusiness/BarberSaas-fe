import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAuth } from '../../../core/auth/AuthContext';
import { StackRoute } from '../../../shared/constants/routes';
import type { RootStackParamList } from '../../../navigation/types';
import { tr } from '../../../shared/i18n/tr';
import { colors, spacing, typography } from '../../../shared/theme';
import { Button } from '../../../shared/ui/Button';
import { Input } from '../../../shared/ui/Input';
import { Screen } from '../../../shared/ui/Screen';
import { ScreenHeader } from '../../../shared/ui/ScreenHeader';
import { errorMessage } from '../../../shared/ui/format';
import {
  DEFAULT_CLOSE_TIME,
  DEFAULT_OPEN_TIME,
  DEFAULT_SLOT_MINUTES,
  normalizeClockInput,
  parseClockToMinutes,
} from '../../appointments/utils/shopDayGrid';

type Props = NativeStackScreenProps<
  RootStackParamList,
  typeof StackRoute.ShopSettings
>;

export function ShopSettingsScreen({ navigation }: Props) {
  const { services, tenant, refreshMe } = useAuth();
  const [openTime, setOpenTime] = useState(
    tenant?.open_time ?? DEFAULT_OPEN_TIME,
  );
  const [closeTime, setCloseTime] = useState(
    tenant?.close_time ?? DEFAULT_CLOSE_TIME,
  );
  const [slotMinutes, setSlotMinutes] = useState(
    String(tenant?.slot_minutes ?? DEFAULT_SLOT_MINUTES),
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let active = true;
    services.tenants
      .getMe()
      .then((shop) => {
        if (!active) return;
        setOpenTime(shop.open_time ?? DEFAULT_OPEN_TIME);
        setCloseTime(shop.close_time ?? DEFAULT_CLOSE_TIME);
        setSlotMinutes(String(shop.slot_minutes ?? DEFAULT_SLOT_MINUTES));
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [services.tenants]);

  const openMinutes = parseClockToMinutes(openTime);
  const closeMinutes = parseClockToMinutes(closeTime);
  const slotNum = Number(slotMinutes);
  const canSave =
    openMinutes !== null &&
    closeMinutes !== null &&
    closeMinutes - openMinutes >= 30 &&
    Number.isFinite(slotNum) &&
    slotNum >= 5 &&
    slotNum <= 240;

  const onSubmit = async () => {
    setError(null);
    setSaved(false);
    const open = normalizeClockInput(openTime);
    const close = normalizeClockInput(closeTime);
    if (!open || !close) {
      setError(tr.settings.invalidTime);
      return;
    }
    const openMin = parseClockToMinutes(open)!;
    const closeMin = parseClockToMinutes(close)!;
    if (closeMin - openMin < 30) {
      setError(tr.settings.rangeTooShort);
      return;
    }
    if (!Number.isFinite(slotNum) || slotNum < 5 || slotNum > 240) {
      setError(tr.settings.invalidSlot);
      return;
    }

    setLoading(true);
    try {
      await services.tenants.updateWorkingHours({
        open_time: open,
        close_time: close,
        slot_minutes: Math.round(slotNum),
      });
      setOpenTime(open);
      setCloseTime(close);
      setSlotMinutes(String(Math.round(slotNum)));
      await refreshMe();
      setSaved(true);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <ScreenHeader
        title={tr.settings.title}
        subtitle={tr.settings.subtitle}
        onBack={() => navigation.goBack()}
      />
      <View style={styles.form}>
        <Text style={styles.hint}>{tr.settings.hoursHint}</Text>
        <Input
          label={tr.settings.openTime}
          value={openTime}
          onChangeText={setOpenTime}
          placeholder="09:00"
          autoCapitalize="none"
          keyboardType="numbers-and-punctuation"
        />
        <Input
          label={tr.settings.closeTime}
          value={closeTime}
          onChangeText={setCloseTime}
          placeholder="18:00"
          autoCapitalize="none"
          keyboardType="numbers-and-punctuation"
        />
        <Input
          label={tr.settings.slotMinutes}
          value={slotMinutes}
          onChangeText={setSlotMinutes}
          placeholder="30"
          keyboardType="number-pad"
        />
        <Text style={styles.slotHint}>{tr.settings.slotHint}</Text>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        {saved ? <Text style={styles.success}>{tr.settings.saved}</Text> : null}
        <Button
          label={tr.settings.save}
          onPress={onSubmit}
          loading={loading}
          disabled={!canSave}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: spacing.md,
  },
  hint: {
    ...typography.body,
    color: colors.muted,
  },
  slotHint: {
    ...typography.caption,
    marginTop: -spacing.sm,
  },
  error: {
    ...typography.caption,
    color: colors.danger,
  },
  success: {
    ...typography.caption,
    color: colors.ink,
  },
});
