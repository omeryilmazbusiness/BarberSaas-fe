import React, { useCallback, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../../../core/auth/AuthContext';
import type { User } from '../../../core/types/domain';
import {
  isAdminRole,
  isCustomerUserRole,
  isStaffUserRole,
} from '../../../shared/constants/roles';
import { StackRoute } from '../../../shared/constants/routes';
import type { RootStackParamList } from '../../../navigation/types';
import { tr } from '../../../shared/i18n/tr';
import { colors, radius, spacing, typography } from '../../../shared/theme';
import { Screen } from '../../../shared/ui/Screen';
import { ScreenHeader } from '../../../shared/ui/ScreenHeader';
import { IconButton } from '../../../shared/ui/IconButton';
import { ListRow } from '../../../shared/ui/ListRow';
import { EmptyState } from '../../../shared/ui/EmptyState';
import { roleLabel } from '../../../shared/ui/roleLabel';

type UsersTab = 'staff' | 'customers';

export function UsersScreen() {
  const { services, user } = useAuth();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [items, setItems] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);
  const [tab, setTab] = useState<UsersTab>('staff');
  const canManage = user ? isAdminRole(user.role) : false;

  useFocusEffect(
    useCallback(() => {
      if (!canManage) {
        setForbidden(true);
        setLoading(false);
        return;
      }
      let active = true;
      setLoading(true);
      setForbidden(false);
      services.users
        .list()
        .then((list) => {
          if (active) setItems(list);
        })
        .catch(() => {
          if (active) setForbidden(true);
        })
        .finally(() => {
          if (active) setLoading(false);
        });
      return () => {
        active = false;
      };
    }, [services.users, canManage]),
  );

  const staff = useMemo(
    () => items.filter((u) => isStaffUserRole(u.role)),
    [items],
  );
  const customers = useMemo(
    () => items.filter((u) => isCustomerUserRole(u.role)),
    [items],
  );
  const visible = tab === 'staff' ? staff : customers;

  return (
    <Screen loading={loading} tabInset>
      <ScreenHeader
        title={tr.users.title}
        subtitle={tr.users.subtitle}
        rightAction={
          canManage ? (
            <IconButton
              name="add"
              accessibilityLabel={tr.users.add}
              tone="accent"
              onPress={() => navigation.navigate(StackRoute.CreateUser)}
            />
          ) : undefined
        }
      />

      {forbidden ? (
        <EmptyState
          icon="lock-closed-outline"
          title={tr.users.adminOnly}
          message={tr.users.adminOnlyMessage}
        />
      ) : (
        <>
          <View style={styles.tabs}>
            <TabChip
              label={tr.users.tabStaff}
              count={staff.length}
              active={tab === 'staff'}
              onPress={() => setTab('staff')}
            />
            <TabChip
              label={tr.users.tabCustomers}
              count={customers.length}
              active={tab === 'customers'}
              onPress={() => setTab('customers')}
            />
          </View>

          {visible.length === 0 ? (
            <EmptyState
              icon={tab === 'staff' ? 'briefcase-outline' : 'people-outline'}
              title={
                tab === 'staff' ? tr.users.emptyStaff : tr.users.emptyCustomers
              }
              message={
                tab === 'staff'
                  ? tr.users.emptyStaffMessage
                  : tr.users.emptyCustomersMessage
              }
            />
          ) : (
            <View style={styles.list}>
              {visible.map((item) => (
                <ListRow
                  key={item.id}
                  title={item.full_name}
                  subtitle={item.email || item.phone || undefined}
                  meta={roleLabel(item.role)}
                  leading={
                    <View style={styles.avatar}>
                      <Ionicons
                        name={
                          tab === 'staff' ? 'briefcase-outline' : 'person-outline'
                        }
                        size={18}
                        color={colors.accent}
                      />
                    </View>
                  }
                />
              ))}
            </View>
          )}
        </>
      )}
    </Screen>
  );
}

function TabChip({
  label,
  count,
  active,
  onPress,
}: {
  label: string;
  count: number;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.tab,
        active && styles.tabActive,
        pressed && styles.pressed,
      ]}
    >
      <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>
        {label}
      </Text>
      <View style={[styles.count, active && styles.countActive]}>
        <Text style={[styles.countText, active && styles.countTextActive]}>
          {count}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tabs: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    minHeight: 44,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
  },
  tabActive: {
    borderColor: colors.ink,
    backgroundColor: colors.ink,
  },
  tabLabel: {
    ...typography.label,
    fontSize: 14,
  },
  tabLabelActive: {
    color: colors.white,
  },
  count: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accentSoft,
  },
  countActive: {
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  countText: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.ink,
  },
  countTextActive: {
    color: colors.white,
  },
  pressed: {
    opacity: 0.9,
  },
  list: {
    gap: spacing.sm,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
