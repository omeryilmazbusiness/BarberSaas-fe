import React, { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../../../core/auth/AuthContext';
import { setPendingManagerLogin } from '../../../core/auth/pendingManagerLogin';
import { isAdminRole } from '../../../shared/constants/roles';
import { StackRoute } from '../../../shared/constants/routes';
import type { RootStackParamList } from '../../../navigation/types';
import { tr } from '../../../shared/i18n/tr';
import { colors, radius, spacing, typography } from '../../../shared/theme';
import { Screen } from '../../../shared/ui/Screen';
import { ScreenHeader } from '../../../shared/ui/ScreenHeader';
import { Button } from '../../../shared/ui/Button';
import { needsShopSetup } from '../../tenants/setup/shopSetup';
import { roleLabel } from '../../../shared/ui/roleLabel';

interface QuickAction {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  hint: string;
  route:
    | typeof StackRoute.CreateAppointment
    | typeof StackRoute.CreateStaff
    | typeof StackRoute.CreateService
    | typeof StackRoute.CreateUser
    | typeof StackRoute.ShopSettings;
  adminOnly?: boolean;
}

const actions: QuickAction[] = [
  {
    icon: 'calendar-outline',
    label: tr.home.book,
    hint: tr.home.bookHint,
    route: StackRoute.CreateAppointment,
  },
  {
    icon: 'time-outline',
    label: tr.home.workingHours,
    hint: tr.home.workingHoursHint,
    route: StackRoute.ShopSettings,
    adminOnly: true,
  },
  {
    icon: 'person-add-outline',
    label: tr.home.addBarber,
    hint: tr.home.addBarberHint,
    route: StackRoute.CreateStaff,
    adminOnly: true,
  },
  {
    icon: 'pricetag-outline',
    label: tr.home.addService,
    hint: tr.home.addServiceHint,
    route: StackRoute.CreateService,
    adminOnly: true,
  },
  {
    icon: 'people-outline',
    label: tr.home.addUser,
    hint: tr.home.addUserHint,
    route: StackRoute.CreateUser,
    adminOnly: true,
  },
];

export function HomeScreen() {
  const { user, tenant, logout, services } = useAuth();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [counts, setCounts] = useState({
    appointments: 0,
    staff: 0,
    services: 0,
  });
  const [setupNeeded, setSetupNeeded] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => {
        const [appointments, staff, catalog] = await Promise.all([
          services.appointments.list(),
          services.staff.list(),
          services.catalog.list(),
        ]);
        if (!active) return;
        const bookable = staff.filter((s) => s.is_bookable).length;
        const serviceCount = catalog.filter((s) => s.is_active !== false).length;
        setCounts({
          appointments: appointments.filter((a) => a.status !== 'cancelled')
            .length,
          staff: bookable,
          services: serviceCount,
        });
        setSetupNeeded(
          Boolean(user && isAdminRole(user.role)) &&
            needsShopSetup({
              bookableStaff: bookable,
              services: serviceCount,
            }),
        );
      })().catch(() => undefined);
      return () => {
        active = false;
      };
    }, [services, user]),
  );

  const visibleActions = actions.filter(
    (a) => !a.adminOnly || (user && isAdminRole(user.role)),
  );

  return (
    <Screen tabInset>
      <ScreenHeader
        subtitle={
          user ? `${user.full_name} · ${roleLabel(user.role)}` : undefined
        }
        rightAction={
          <Pressable
            onPress={async () => {
              const slug = tenant?.slug;
              if (slug) {
                setPendingManagerLogin(slug);
              }
              await logout();
            }}
            style={styles.logout}
            accessibilityLabel={tr.common.signOut}
          >
            <Ionicons name="log-out-outline" size={20} color={colors.ink} />
          </Pressable>
        }
      />

      {setupNeeded ? (
        <View style={styles.setupCard}>
          <View style={styles.setupIcon}>
            <Ionicons name="rocket-outline" size={22} color={colors.accent} />
          </View>
          <Text style={styles.setupTitle}>{tr.home.setupBannerTitle}</Text>
          <Text style={styles.setupBody}>{tr.home.setupBannerBody}</Text>
          <Button
            label={tr.home.setupBannerCta}
            onPress={() => navigation.navigate(StackRoute.ShopSetup)}
          />
        </View>
      ) : null}

      <View style={styles.metrics}>
        <Metric
          icon="calendar"
          label={tr.home.bookings}
          value={String(counts.appointments)}
        />
        <Metric icon="cut" label={tr.home.staff} value={String(counts.staff)} />
        <Metric
          icon="pricetag"
          label={tr.home.services}
          value={String(counts.services)}
        />
      </View>

      <Text style={styles.section}>{tr.home.today}</Text>
      <View style={styles.actions}>
        {visibleActions.map((action) => (
          <Pressable
            key={action.label}
            style={({ pressed }) => [styles.action, pressed && styles.pressed]}
            onPress={() => navigation.navigate(action.route)}
          >
            <View style={styles.actionIcon}>
              <Ionicons name={action.icon} size={20} color={colors.accent} />
            </View>
            <View style={styles.actionBody}>
              <Text style={styles.actionLabel}>{action.label}</Text>
              <Text style={styles.actionHint}>{action.hint}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.muted} />
          </Pressable>
        ))}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          {tr.common.shop} · {tenant?.slug} · {tenant?.open_time ?? '09:00'}–
          {tenant?.close_time ?? '18:00'} · {tenant?.slot_minutes ?? 30} dk
        </Text>
        {services.useMockApi ? (
          <Button
            label={tr.home.mockApiActive}
            variant="ghost"
            onPress={() => undefined}
            disabled
          />
        ) : null}
      </View>
    </Screen>
  );
}

function Metric({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.metric}>
      <Ionicons name={icon} size={16} color={colors.accent} />
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  logout: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  setupCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: colors.ink,
    padding: spacing.lg,
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  setupIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  setupTitle: {
    ...typography.title,
    fontSize: 20,
  },
  setupBody: {
    ...typography.body,
    color: colors.muted,
    marginBottom: spacing.sm,
  },
  metrics: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  metric: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: 4,
  },
  metricValue: {
    ...typography.title,
    fontSize: 24,
  },
  metricLabel: {
    ...typography.caption,
  },
  section: {
    ...typography.label,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    fontSize: 11,
    color: colors.muted,
    marginBottom: spacing.sm,
  },
  actions: {
    gap: spacing.sm,
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
  },
  pressed: {
    opacity: 0.9,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBody: {
    flex: 1,
    gap: 2,
  },
  actionLabel: {
    ...typography.label,
  },
  actionHint: {
    ...typography.caption,
  },
  footer: {
    marginTop: spacing.xl,
    gap: spacing.sm,
  },
  footerText: {
    ...typography.caption,
    textAlign: 'center',
  },
});
