import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../core/auth/AuthContext';
import { StackRoute } from '../shared/constants/routes';
import { colors } from '../shared/theme';
import { AuthNavigator } from './AuthNavigator';
import { ShopTabNavigator } from './ShopTabNavigator';
import { CustomerPortalScreen } from './CustomerNavigator';
import { linking } from './linking';
import { AdminLoginScreen } from '../features/auth/screens/AdminLoginScreen';
import { ManagerLoginScreen } from '../features/auth/screens/ManagerLoginScreen';
import { CreateAppointmentScreen } from '../features/appointments/screens/CreateAppointmentScreen';
import { CreateStaffScreen } from '../features/staff/screens/CreateStaffScreen';
import { CreateServiceScreen } from '../features/catalog/screens/CreateServiceScreen';
import { CreateUserScreen } from '../features/users/screens/CreateUserScreen';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const { isAuthenticated, isBootstrapping } = useAuth();

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
      linking={linking}
      documentTitle={{ formatter: () => 'BarberSaas' }}
    >
      <Stack.Navigator
        initialRouteName={StackRoute.AdminLogin}
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.paper },
        }}
      >
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

        {isAuthenticated ? (
          <>
            <Stack.Screen name={StackRoute.Shop} component={ShopTabNavigator} />
            <Stack.Screen
              name={StackRoute.CreateAppointment}
              component={CreateAppointmentScreen}
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
          </>
        ) : (
          <Stack.Screen name={StackRoute.Auth} component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
