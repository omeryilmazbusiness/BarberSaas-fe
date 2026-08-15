import React from 'react';
import { Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { ShopTabRoute } from '../shared/constants/routes';
import { HomeScreen } from '../features/dashboard/screens/HomeScreen';
import { AppointmentsScreen } from '../features/appointments/screens/AppointmentsScreen';
import { StaffScreen } from '../features/staff/screens/StaffScreen';
import { ServicesScreen } from '../features/catalog/screens/ServicesScreen';
import { UsersScreen } from '../features/users/screens/UsersScreen';
import type { ShopTabParamList } from './types';
import { colors } from '../shared/theme';
import { useAuth } from '../core/auth/AuthContext';
import { isAdminRole } from '../shared/constants/roles';

const Tab = createBottomTabNavigator<ShopTabParamList>();

export function ShopTabNavigator() {
  const { user } = useAuth();
  const showUsers = user ? isAdminRole(user.role) : false;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.line,
          height: Platform.OS === 'web' ? 64 : undefined,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
        tabBarIcon: ({ color, size }) => {
          const icon = iconForRoute(route.name);
          return <Ionicons name={icon} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name={ShopTabRoute.Home} component={HomeScreen} />
      <Tab.Screen name={ShopTabRoute.Appointments} component={AppointmentsScreen} />
      <Tab.Screen name={ShopTabRoute.Staff} component={StaffScreen} />
      <Tab.Screen name={ShopTabRoute.Services} component={ServicesScreen} />
      {showUsers ? (
        <Tab.Screen name={ShopTabRoute.Users} component={UsersScreen} />
      ) : null}
    </Tab.Navigator>
  );
}

function iconForRoute(
  route: keyof ShopTabParamList,
): keyof typeof Ionicons.glyphMap {
  switch (route) {
    case ShopTabRoute.Home:
      return 'home-outline';
    case ShopTabRoute.Appointments:
      return 'calendar-outline';
    case ShopTabRoute.Staff:
      return 'cut-outline';
    case ShopTabRoute.Services:
      return 'pricetag-outline';
    case ShopTabRoute.Users:
      return 'people-outline';
    default:
      return 'ellipse-outline';
  }
}
