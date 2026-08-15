import React, { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../../../core/auth/AuthContext';
import type { CatalogService } from '../../../core/types/domain';
import { isAdminRole } from '../../../shared/constants/roles';
import { StackRoute } from '../../../shared/constants/routes';
import type { RootStackParamList } from '../../../navigation/types';
import { colors, spacing } from '../../../shared/theme';
import { Screen } from '../../../shared/ui/Screen';
import { ScreenHeader } from '../../../shared/ui/ScreenHeader';
import { IconButton } from '../../../shared/ui/IconButton';
import { ListRow } from '../../../shared/ui/ListRow';
import { EmptyState } from '../../../shared/ui/EmptyState';
import { formatDuration, formatPrice } from '../../../shared/ui/format';

export function ServicesScreen() {
  const { services, user } = useAuth();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [items, setItems] = useState<CatalogService[]>([]);
  const [loading, setLoading] = useState(true);
  const canCreate = user ? isAdminRole(user.role) : false;

  useFocusEffect(
    useCallback(() => {
      let active = true;
      setLoading(true);
      services.catalog
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
    }, [services.catalog]),
  );

  return (
    <Screen loading={loading}>
      <ScreenHeader
        title="Services"
        subtitle="Price and duration catalog"
        rightAction={
          canCreate ? (
            <IconButton
              name="add"
              accessibilityLabel="Add service"
              tone="accent"
              onPress={() => navigation.navigate(StackRoute.CreateService)}
            />
          ) : undefined
        }
      />
      {items.length === 0 ? (
        <EmptyState
          icon="pricetag-outline"
          title="No services"
          message="Add haircut and beard offerings to start booking."
        />
      ) : (
        <View style={styles.list}>
          {items.map((item) => (
            <ListRow
              key={item.id}
              title={item.name}
              subtitle={formatDuration(item.duration_minutes)}
              meta={formatPrice(item.price_cents, item.currency)}
              leading={
                <View style={styles.icon}>
                  <Ionicons name="pricetag" size={18} color={colors.accent} />
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
  icon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
