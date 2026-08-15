import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import {
  createNativeStackNavigator,
  type NativeStackScreenProps,
} from '@react-navigation/native-stack';
import { CustomerRoute, StackRoute } from '../shared/constants/routes';
import { colors } from '../shared/theme';
import { authPortal } from '../core/auth/tokenProvider';
import { CustomerLoginScreen } from '../features/customer/screens/CustomerLoginScreen';
import { CustomerServicesScreen } from '../features/customer/screens/CustomerServicesScreen';
import { CustomerScheduleScreen } from '../features/customer/screens/CustomerScheduleScreen';
import { CustomerSuccessScreen } from '../features/customer/screens/CustomerSuccessScreen';
import { CustomerProfileScreen } from '../features/customer/screens/CustomerProfileScreen';
import { useCustomerSession } from '../features/customer/session/CustomerSessionContext';
import { CustomerShopProvider } from '../features/customer/session/CustomerShopContext';
import type { CustomerStackParamList, RootStackParamList } from './types';

const Stack = createNativeStackNavigator<CustomerStackParamList>();

type PortalProps = NativeStackScreenProps<
  RootStackParamList,
  typeof StackRoute.Customer
>;

export function CustomerPortalScreen({ route }: PortalProps) {
  const shopSlug = route.params?.shopSlug?.trim() || 'acme-barber';
  const { isAuthenticated, isBootstrapping } = useCustomerSession();

  useEffect(() => {
    if (isAuthenticated) {
      authPortal.set('customer');
    }
  }, [isAuthenticated]);

  return (
    <CustomerShopProvider shopSlug={shopSlug}>
      <View style={styles.root}>
        {isBootstrapping ? (
          <View style={styles.boot}>
            <ActivityIndicator size="large" color={colors.ink} />
          </View>
        ) : null}
        <Stack.Navigator
          initialRouteName={
            isAuthenticated ? CustomerRoute.Services : CustomerRoute.Login
          }
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.paper },
            animation: 'fade',
          }}
        >
          <Stack.Screen
            name={CustomerRoute.Login}
            component={CustomerLoginScreen}
          />
          <Stack.Screen
            name={CustomerRoute.Services}
            component={CustomerServicesScreen}
          />
          <Stack.Screen
            name={CustomerRoute.Schedule}
            component={CustomerScheduleScreen}
            initialParams={{ serviceId: '' }}
          />
          <Stack.Screen
            name={CustomerRoute.Success}
            component={CustomerSuccessScreen}
            initialParams={{
              appointmentId: '',
              startsAt: new Date().toISOString(),
              serviceName: '',
            }}
          />
          <Stack.Screen
            name={CustomerRoute.Profile}
            component={CustomerProfileScreen}
          />
        </Stack.Navigator>
      </View>
    </CustomerShopProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  boot: {
    ...StyleSheet.absoluteFill,
    zIndex: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.paper,
  },
});
