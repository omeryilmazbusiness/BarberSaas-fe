import React, { useMemo } from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/core/auth/AuthContext';
import { createAppServices } from './src/core/di/container';
import { CustomerSessionProvider } from './src/features/customer/session/CustomerSessionContext';
import { RootNavigator } from './src/navigation/RootNavigator';

export default function App() {
  const services = useMemo(() => createAppServices(), []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider services={services}>
          <CustomerSessionProvider services={services}>
            <StatusBar style="dark" />
            <RootNavigator />
          </CustomerSessionProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
