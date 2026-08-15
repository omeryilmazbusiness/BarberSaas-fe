import React, { useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { ShopTabRoute } from '../shared/constants/routes';
import { HomeScreen } from '../features/dashboard/screens/HomeScreen';
import { AppointmentsScreen } from '../features/appointments/screens/AppointmentsScreen';
import { StaffScreen } from '../features/staff/screens/StaffScreen';
import { ServicesScreen } from '../features/catalog/screens/ServicesScreen';
import { UsersScreen } from '../features/users/screens/UsersScreen';
import type { ShopTabParamList } from './types';
import { tr } from '../shared/i18n/tr';
import { colors } from '../shared/theme';
import { useAuth } from '../core/auth/AuthContext';
import { authPortal } from '../core/auth/tokenProvider';
import { isAdminRole } from '../shared/constants/roles';
import { GlassTabBar } from './GlassTabBar';

const Tab = createBottomTabNavigator<ShopTabParamList>();

export function ShopTabNavigator() {
  const { user } = useAuth();
  const showUsers = user ? isAdminRole(user.role) : false;

  useEffect(() => {
    authPortal.set('shop');
  }, []);

  return (
    <Tab.Navigator
      tabBar={(props) => <GlassTabBar {...props} />}
      screenOptions={({ route }) => ({
        headerShown: false,
        title: tr.tabs[route.name as keyof typeof tr.tabs] ?? route.name,
        tabBarLabel: tr.tabs[route.name as keyof typeof tr.tabs] ?? route.name,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.muted,
        tabBarIcon: ({ color, size }) => {
          const icon = iconForRoute(route.name);
          return <Ionicons name={icon} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name={ShopTabRoute.Home} component={HomeScreen} />
      <Tab.Screen
        name={ShopTabRoute.Appointments}
        component={AppointmentsScreen}
      />
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
