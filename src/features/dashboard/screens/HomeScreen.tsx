import React, { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../../../core/auth/AuthContext';
import { isAdminRole } from '../../../shared/constants/roles';
import { StackRoute } from '../../../shared/constants/routes';
import type { RootStackParamList } from '../../../navigation/types';
import { colors, radius, spacing, typography } from '../../../shared/theme';
import { Screen } from '../../../shared/ui/Screen';
import { ScreenHeader } from '../../../shared/ui/ScreenHeader';
import { Button } from '../../../shared/ui/Button';

interface QuickAction {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  hint: string;
  route: typeof StackRoute.CreateAppointment | typeof StackRoute.CreateStaff | typeof StackRoute.CreateService | typeof StackRoute.CreateUser;
  adminOnly?: boolean;
}

const actions: QuickAction[] = [
  {
    icon: 'calendar-outline',
    label: 'Book appointment',
    hint: 'Pick customer, barber, service, time',
    route: StackRoute.CreateAppointment,
  },
  {
    icon: 'person-add-outline',
    label: 'Add barber',
    hint: 'Create a bookable staff member',
    route: StackRoute.CreateStaff,
    adminOnly: true,
  },
  {
    icon: 'pricetag-outline',
    label: 'Add service',
    hint: 'Catalog price and duration',
    route: StackRoute.CreateService,
    adminOnly: true,
  },
  {
    icon: 'people-outline',
    label: 'Add user',
    hint: 'Manager, staff, or customer',
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
        setCounts({
          appointments: appointments.filter((a) => a.status !== 'cancelled').length,
          staff: staff.filter((s) => s.is_bookable).length,
          services: catalog.length,
        });
      })().catch(() => undefined);
      return () => {
        active = false;
      };
    }, [services]),
  );

  const visibleActions = actions.filter(
    (a) => !a.adminOnly || (user && isAdminRole(user.role)),
  );

  return (
    <Screen>
      <ScreenHeader
        title={tenant?.name ?? 'Shop'}
        subtitle={user ? `${user.full_name} · ${user.role}` : undefined}
        rightAction={
          <Pressable onPress={logout} style={styles.logout} accessibilityLabel="Sign out">
            <Ionicons name="log-out-outline" size={20} color={colors.ink} />
          </Pressable>
        }
      />

      <View style={styles.metrics}>
        <Metric icon="calendar" label="Bookings" value={String(counts.appointments)} />
        <Metric icon="cut" label="Barbers" value={String(counts.staff)} />
        <Metric icon="pricetag" label="Services" value={String(counts.services)} />
      </View>

      <Text style={styles.section}>Today’s flow</Text>
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
          Tenant · {tenant?.slug} · {tenant?.status} · {tenant?.timezone}
        </Text>
        {services.useMockApi ? (
          <Button
            label="Mock API active"
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
