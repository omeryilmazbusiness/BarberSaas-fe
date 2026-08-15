import React, { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../../../core/auth/AuthContext';
import type { User } from '../../../core/types/domain';
import { isAdminRole } from '../../../shared/constants/roles';
import { StackRoute } from '../../../shared/constants/routes';
import type { RootStackParamList } from '../../../navigation/types';
import { tr } from '../../../shared/i18n/tr';
import { colors, spacing } from '../../../shared/theme';
import { Screen } from '../../../shared/ui/Screen';
import { ScreenHeader } from '../../../shared/ui/ScreenHeader';
import { IconButton } from '../../../shared/ui/IconButton';
import { ListRow } from '../../../shared/ui/ListRow';
import { EmptyState } from '../../../shared/ui/EmptyState';

export function UsersScreen() {
  const { services, user } = useAuth();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [items, setItems] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);
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

  return (
    <Screen loading={loading}>
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
      ) : items.length === 0 ? (
        <EmptyState
          icon="people-outline"
          title={tr.users.empty}
          message={tr.users.emptyMessage}
        />
      ) : (
        <View style={styles.list}>
          {items.map((item) => (
            <ListRow
              key={item.id}
              title={item.full_name}
              subtitle={item.email}
              meta={item.role}
              leading={
                <View style={styles.avatar}>
                  <Ionicons name="person-outline" size={18} color={colors.accent} />
                </View>
              }
            />
          ))}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
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
