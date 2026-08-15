import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../core/auth/AuthContext';
import { StackRoute } from '../shared/constants/routes';
import { colors } from '../shared/theme';
import { AuthNavigator } from './AuthNavigator';
import { ShopTabNavigator } from './ShopTabNavigator';
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
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.paper },
        }}
      >
        {isAuthenticated ? (
          <>
            <Stack.Screen name={StackRoute.Shop} component={ShopTabNavigator} />
            <Stack.Screen
              name={StackRoute.CreateAppointment}
              component={CreateAppointmentScreen}
            />
            <Stack.Screen name={StackRoute.CreateStaff} component={CreateStaffScreen} />
            <Stack.Screen
              name={StackRoute.CreateService}
              component={CreateServiceScreen}
            />
            <Stack.Screen name={StackRoute.CreateUser} component={CreateUserScreen} />
          </>
        ) : (
          <Stack.Screen name={StackRoute.Auth} component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
