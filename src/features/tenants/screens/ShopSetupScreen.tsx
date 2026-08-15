import React, { useCallback, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAuth } from '../../../core/auth/AuthContext';
import { StackRoute } from '../../../shared/constants/routes';
import type { RootStackParamList } from '../../../navigation/types';
import { tr } from '../../../shared/i18n/tr';
import { colors, radius, spacing, typography } from '../../../shared/theme';
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
import {
  buildSetupPlan,
  type SetupStepId,
} from '../setup/shopSetup';

type Props = NativeStackScreenProps<
  RootStackParamList,
  typeof StackRoute.ShopSetup
>;

export function ShopSetupScreen({ navigation }: Props) {
  const { services, tenant, refreshMe } = useAuth();
  const [plan, setPlan] = useState<SetupStepId[]>([]);
  const [stepIndex, setStepIndex] = useState(0);
  const [booting, setBooting] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [barberName, setBarberName] = useState(tenant?.name ?? '');
  const [barberTitle, setBarberTitle] = useState('Berber');
  const [openTime, setOpenTime] = useState(
    tenant?.open_time ?? DEFAULT_OPEN_TIME,
  );
  const [closeTime, setCloseTime] = useState(
    tenant?.close_time ?? DEFAULT_CLOSE_TIME,
  );
  const [slotMinutes, setSlotMinutes] = useState(
    String(tenant?.slot_minutes ?? DEFAULT_SLOT_MINUTES),
  );
  const [serviceName, setServiceName] = useState('Saç kesimi');
  const [duration, setDuration] = useState('30');
  const [price, setPrice] = useState('250');

  const refreshPlan = useCallback(async () => {
    const [staff, catalog, shop] = await Promise.all([
      services.staff.list(),
      services.catalog.list(),
      services.tenants.getMe().catch(() => tenant),
    ]);
    if (shop) {
      setOpenTime(shop.open_time ?? DEFAULT_OPEN_TIME);
      setCloseTime(shop.close_time ?? DEFAULT_CLOSE_TIME);
      setSlotMinutes(String(shop.slot_minutes ?? DEFAULT_SLOT_MINUTES));
    }
    const next = buildSetupPlan({
      bookableStaff: staff.filter((s) => s.is_bookable).length,
      services: catalog.filter((s) => s.is_active !== false).length,
    });
    setPlan(next);
    setStepIndex(0);
    return next;
  }, [services, tenant]);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      setBooting(true);
      refreshPlan()
        .then((next) => {
          if (!active) return;
          if (next.length === 0) {
            navigation.goBack();
          }
        })
        .catch(() => undefined)
        .finally(() => {
          if (active) setBooting(false);
        });
      return () => {
        active = false;
      };
    }, [refreshPlan, navigation]),
  );

  const step = plan[stepIndex] ?? 'done';
  const total = Math.max(plan.length, 1);
  const progressLabel = tr.setup.stepOf(Math.min(stepIndex + 1, total), total);

  const openMinutes = parseClockToMinutes(openTime);
  const closeMinutes = parseClockToMinutes(closeTime);
  const slotNum = Number(slotMinutes);
  const durationNum = Number(duration);
  const priceNum = Number(price);

  const canContinue = useMemo(() => {
    if (step === 'staff') {
      return barberName.trim().length >= 2;
    }
    if (step === 'hours') {
      return (
        openMinutes !== null &&
        closeMinutes !== null &&
        closeMinutes - openMinutes >= 30 &&
        Number.isFinite(slotNum) &&
        slotNum >= 5 &&
        slotNum <= 240
      );
    }
    if (step === 'service') {
      return (
        serviceName.trim().length >= 2 &&
        Number.isFinite(durationNum) &&
        durationNum >= 5 &&
        Number.isFinite(priceNum) &&
        priceNum >= 0
      );
    }
    return true;
  }, [
    step,
    barberName,
    openMinutes,
    closeMinutes,
    slotNum,
    serviceName,
    durationNum,
    priceNum,
  ]);

  const advance = async () => {
    setError(null);
    setLoading(true);
    try {
      if (step === 'staff') {
        await services.staff.create({
          display_name: barberName.trim(),
          title: barberTitle.trim() || 'Berber',
          is_bookable: true,
        });
      } else if (step === 'hours') {
        const open = normalizeClockInput(openTime);
        const close = normalizeClockInput(closeTime);
        if (!open || !close) {
          setError(tr.settings.invalidTime);
          return;
        }
        if (parseClockToMinutes(close)! - parseClockToMinutes(open)! < 30) {
          setError(tr.settings.rangeTooShort);
          return;
        }
        if (!Number.isFinite(slotNum) || slotNum < 5 || slotNum > 240) {
          setError(tr.settings.invalidSlot);
          return;
        }
        await services.tenants.updateWorkingHours({
          open_time: open,
          close_time: close,
          slot_minutes: Math.round(slotNum),
        });
        await refreshMe();
      } else if (step === 'service') {
        await services.catalog.create({
          name: serviceName.trim(),
          duration_minutes: Math.round(durationNum),
          price_cents: Math.round(priceNum * 100),
          currency: 'TRY',
        });
      }

      if (stepIndex >= plan.length - 1) {
        setPlan(['done']);
        setStepIndex(0);
        return;
      }
      setStepIndex((i) => i + 1);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  if (booting) {
    return (
      <Screen loading>
        <View />
      </Screen>
    );
  }

  if (step === 'done' || plan.length === 0) {
    return (
      <Screen>
        <ScreenHeader title={tr.setup.doneTitle} subtitle={tr.setup.doneSubtitle} />
        <View style={styles.done}>
          <View style={styles.doneIcon}>
            <Ionicons name="checkmark-circle" size={48} color={colors.ink} />
          </View>
          <Text style={styles.doneBody}>{tr.setup.doneBody}</Text>
          <Button
            label={tr.setup.doneCta}
            onPress={() => navigation.goBack()}
          />
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScreenHeader
        title={tr.setup.title}
        subtitle={progressLabel}
        onBack={() => navigation.goBack()}
      />

      <View style={styles.progress}>
        {plan.map((id, index) => (
          <View
            key={id}
            style={[
              styles.progressSeg,
              index <= stepIndex && styles.progressSegActive,
            ]}
          />
        ))}
      </View>

      <View style={styles.form}>
        {step === 'staff' ? (
          <>
            <StepIntro
              icon="cut-outline"
              title={tr.setup.staffTitle}
              body={tr.setup.staffBody}
            />
            <Input
              label={tr.staff.name}
              value={barberName}
              onChangeText={setBarberName}
              placeholder="Ali Demir"
            />
            <Input
              label={tr.staff.roleTitle}
              value={barberTitle}
              onChangeText={setBarberTitle}
              placeholder="Berber"
            />
          </>
        ) : null}

        {step === 'hours' ? (
          <>
            <StepIntro
              icon="time-outline"
              title={tr.setup.hoursTitle}
              body={tr.setup.hoursBody}
            />
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
          </>
        ) : null}

        {step === 'service' ? (
          <>
            <StepIntro
              icon="pricetag-outline"
              title={tr.setup.serviceTitle}
              body={tr.setup.serviceBody}
            />
            <Input
              label={tr.services.name}
              value={serviceName}
              onChangeText={setServiceName}
              placeholder="Saç kesimi"
            />
            <Input
              label={tr.services.duration}
              value={duration}
              onChangeText={setDuration}
              keyboardType="number-pad"
            />
            <Input
              label={tr.services.priceMajor}
              value={price}
              onChangeText={setPrice}
              keyboardType="decimal-pad"
            />
          </>
        ) : null}

        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Button
          label={
            stepIndex >= plan.length - 1
              ? tr.setup.finish
              : tr.setup.continue
          }
          onPress={advance}
          loading={loading}
          disabled={!canContinue}
        />
      </View>
    </Screen>
  );
}

function StepIntro({
  icon,
  title,
  body,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  body: string;
}) {
  return (
    <View style={styles.intro}>
      <View style={styles.introIcon}>
        <Ionicons name={icon} size={22} color={colors.accent} />
      </View>
      <Text style={styles.introTitle}>{title}</Text>
      <Text style={styles.introBody}>{body}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  progress: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  progressSeg: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.line,
  },
  progressSegActive: {
    backgroundColor: colors.ink,
  },
  form: {
    gap: spacing.md,
  },
  intro: {
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  introIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  introTitle: {
    ...typography.title,
    fontSize: 22,
  },
  introBody: {
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
  done: {
    gap: spacing.lg,
    alignItems: 'stretch',
    paddingTop: spacing.xl,
  },
  doneIcon: {
    alignItems: 'center',
  },
  doneBody: {
    ...typography.body,
    color: colors.muted,
    textAlign: 'center',
  },
});
