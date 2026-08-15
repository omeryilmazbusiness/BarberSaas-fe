import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthRoute } from '../shared/constants/routes';
import { LoginScreen } from '../features/auth/screens/LoginScreen';
import { SignupShopScreen } from '../features/auth/screens/SignupShopScreen';
import type { AuthStackParamList } from './types';
import { colors } from '../shared/theme';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export function AuthNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.paper },
      }}
    >
      <Stack.Screen name={AuthRoute.Login} component={LoginScreen} />
      <Stack.Screen name={AuthRoute.SignupShop} component={SignupShopScreen} />
    </Stack.Navigator>
  );
}
