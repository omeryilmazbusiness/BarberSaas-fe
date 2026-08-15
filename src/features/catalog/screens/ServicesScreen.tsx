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
import { tr } from '../../../shared/i18n/tr';
import { colors, spacing } from '../../../shared/theme';
import { Screen } from '../../../shared/ui/Screen';
import { ScreenHeader } from '../../../shared/ui/ScreenHeader';
import { IconButton } from '../../../shared/ui/IconButton';
import { ListRow } from '../../../shared/ui/ListRow';
import { EmptyState } from '../../../shared/ui/EmptyState';
import { formatDuration, formatPrice } from '../../../shared/ui/format';
import { serviceBarberIcon } from '../../../shared/ui/serviceIcon';

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
    <Screen loading={loading} tabInset>
      <ScreenHeader
        title={tr.services.title}
        subtitle={tr.services.subtitle}
        rightAction={
          canCreate ? (
            <IconButton
              name="add"
              accessibilityLabel={tr.services.add}
              tone="accent"
              onPress={() => navigation.navigate(StackRoute.CreateService)}
            />
          ) : undefined
        }
      />
      {items.length === 0 ? (
        <EmptyState
          icon="pricetag-outline"
          title={tr.services.empty}
          message={tr.services.emptyMessage}
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
                  <Ionicons
                    name={serviceBarberIcon(item.id || item.name)}
                    size={18}
                    color={colors.accent}
                  />
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
