import React, { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../../../core/auth/AuthContext';
import type { StaffMember } from '../../../core/types/domain';
import { isAdminRole } from '../../../shared/constants/roles';
import { StackRoute } from '../../../shared/constants/routes';
import type { RootStackParamList } from '../../../navigation/types';
import { colors, spacing } from '../../../shared/theme';
import { Screen } from '../../../shared/ui/Screen';
import { ScreenHeader } from '../../../shared/ui/ScreenHeader';
import { IconButton } from '../../../shared/ui/IconButton';
import { ListRow } from '../../../shared/ui/ListRow';
import { EmptyState } from '../../../shared/ui/EmptyState';

export function StaffScreen() {
  const { services, user } = useAuth();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [items, setItems] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const canCreate = user ? isAdminRole(user.role) : false;

  useFocusEffect(
    useCallback(() => {
      let active = true;
      setLoading(true);
      services.staff
        .list()
        .then((list) => {
          if (active) setItems(list);
        })
        .finally(() => {
          if (active) setLoading(false);
        });
      return () => {
        active = false;
      };
    }, [services.staff]),
  );

  return (
    <Screen loading={loading}>
      <ScreenHeader
        title="Barbers"
        subtitle="Bookable staff members"
        rightAction={
          canCreate ? (
            <IconButton
              name="add"
              accessibilityLabel="Add barber"
              tone="accent"
              onPress={() => navigation.navigate(StackRoute.CreateStaff)}
            />
          ) : undefined
        }
      />
      {items.length === 0 ? (
        <EmptyState
          icon="cut-outline"
          title="No barbers yet"
          message="Owners and managers can add bookable staff."
        />
      ) : (
        <View style={styles.list}>
          {items.map((item) => (
            <ListRow
              key={item.id}
              title={item.display_name}
              subtitle={item.title || 'Barber'}
              meta={item.is_bookable ? 'Bookable' : 'Not bookable'}
              leading={
                <View style={styles.avatar}>
                  <Ionicons name="person" size={18} color={colors.accent} />
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
