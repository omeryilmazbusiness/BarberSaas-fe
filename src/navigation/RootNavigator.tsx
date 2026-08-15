import React, { useEffect, useRef } from 'react';
import { ActivityIndicator, View } from 'react-native';
import {
  NavigationContainer,
  createNavigationContainerRef,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../core/auth/AuthContext';
import { consumePendingManagerLogin } from '../core/auth/pendingManagerLogin';
import { isPlatformTenant } from '../core/auth/platform';
import { StackRoute } from '../shared/constants/routes';
import { colors } from '../shared/theme';
import { AuthNavigator } from './AuthNavigator';
import { ShopTabNavigator } from './ShopTabNavigator';
import { CustomerPortalScreen } from './CustomerNavigator';
import { linking } from './linking';
import { ShopDirectoryScreen } from '../features/directory/screens/ShopDirectoryScreen';
import { AdminLoginScreen } from '../features/auth/screens/AdminLoginScreen';
import { AdminConsoleScreen } from '../features/admin/screens/AdminConsoleScreen';
import { ManagerLoginScreen } from '../features/auth/screens/ManagerLoginScreen';
import { CreateAppointmentScreen } from '../features/appointments/screens/CreateAppointmentScreen';
import { AppointmentDetailScreen } from '../features/appointments/screens/AppointmentDetailScreen';
import { CreateStaffScreen } from '../features/staff/screens/CreateStaffScreen';
import { CreateServiceScreen } from '../features/catalog/screens/CreateServiceScreen';
import { CreateUserScreen } from '../features/users/screens/CreateUserScreen';
import { ShopSettingsScreen } from '../features/tenants/screens/ShopSettingsScreen';
import { ShopSetupScreen } from '../features/tenants/screens/ShopSetupScreen';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();
const navigationRef = createNavigationContainerRef<RootStackParamList>();

export function RootNavigator() {
  const { isAuthenticated, isBootstrapping, tenant } = useAuth();
  const platformAdmin = isAuthenticated && isPlatformTenant(tenant);
  const wasAuthenticated = useRef(isAuthenticated);

  useEffect(() => {
    if (isBootstrapping) {
      return;
    }
    const justLoggedOut = wasAuthenticated.current && !isAuthenticated;
    wasAuthenticated.current = isAuthenticated;

    if (!justLoggedOut || !navigationRef.isReady()) {
      return;
    }
    const slug = consumePendingManagerLogin();
    if (!slug) {
      return;
    }
    navigationRef.reset({
      index: 0,
      routes: [
        {
          name: StackRoute.ManagerLogin,
          params: { shopSlug: slug },
        },
      ],
    });
  }, [isAuthenticated, isBootstrapping]);

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
    <NavigationContainer
      ref={navigationRef}
      linking={linking}
      documentTitle={{ formatter: () => 'BarberSaas' }}
    >
      <Stack.Navigator
        initialRouteName={
          platformAdmin
            ? StackRoute.Admin
            : isAuthenticated
              ? StackRoute.Shop
              : StackRoute.ShopDirectory
        }
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.paper },
        }}
      >
        <Stack.Screen
          name={StackRoute.ShopDirectory}
          component={ShopDirectoryScreen}
        />
        <Stack.Screen
          name={StackRoute.AdminLogin}
          component={AdminLoginScreen}
        />
        <Stack.Screen
          name={StackRoute.ManagerLogin}
          component={ManagerLoginScreen}
        />
        <Stack.Screen
          name={StackRoute.Customer}
          component={CustomerPortalScreen}
          initialParams={{ shopSlug: 'acme-barber' }}
        />

        {platformAdmin ? (
          <Stack.Screen
            name={StackRoute.Admin}
            component={AdminConsoleScreen}
          />
        ) : null}

        {isAuthenticated && !platformAdmin ? (
          <>
            <Stack.Screen name={StackRoute.Shop} component={ShopTabNavigator} />
            <Stack.Screen
              name={StackRoute.CreateAppointment}
              component={CreateAppointmentScreen}
            />
            <Stack.Screen
              name={StackRoute.AppointmentDetail}
              component={AppointmentDetailScreen}
            />
            <Stack.Screen
              name={StackRoute.CreateStaff}
              component={CreateStaffScreen}
            />
            <Stack.Screen
              name={StackRoute.CreateService}
              component={CreateServiceScreen}
            />
            <Stack.Screen
              name={StackRoute.CreateUser}
              component={CreateUserScreen}
            />
            <Stack.Screen
              name={StackRoute.ShopSettings}
              component={ShopSettingsScreen}
            />
            <Stack.Screen
              name={StackRoute.ShopSetup}
              component={ShopSetupScreen}
            />
          </>
        ) : null}

        {!isAuthenticated ? (
          <Stack.Screen name={StackRoute.Auth} component={AuthNavigator} />
        ) : null}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
