import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
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
import { useCustomerSession } from '../features/customer/session/CustomerSessionContext';
import type { CustomerStackParamList, RootStackParamList } from './types';

const Stack = createNativeStackNavigator<CustomerStackParamList>();

type PortalProps = NativeStackScreenProps<
  RootStackParamList,
  typeof StackRoute.Customer
>;

export function CustomerPortalScreen({ route }: PortalProps) {
  const shopSlug = route.params?.shopSlug ?? 'acme-barber';
  const { isAuthenticated, isBootstrapping } = useCustomerSession();

  useEffect(() => {
    if (isAuthenticated) {
      authPortal.set('customer');
    }
  }, [isAuthenticated]);

  if (isBootstrapping) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colors.paper,
        }}
      >
        <ActivityIndicator size="large" color={colors.ink} />
      </View>
    );
  }

  return (
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
        initialParams={{ shopSlug }}
      />
      <Stack.Screen
        name={CustomerRoute.Services}
        component={CustomerServicesScreen}
        initialParams={{ shopSlug }}
      />
      <Stack.Screen
        name={CustomerRoute.Schedule}
        component={CustomerScheduleScreen}
        initialParams={{ shopSlug, serviceId: '' }}
      />
      <Stack.Screen
        name={CustomerRoute.Success}
        component={CustomerSuccessScreen}
        initialParams={{
          shopSlug,
          appointmentId: '',
          startsAt: new Date().toISOString(),
          serviceName: '',
        }}
      />
    </Stack.Navigator>
  );
}
