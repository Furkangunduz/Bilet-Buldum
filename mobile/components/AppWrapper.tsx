import * as SplashScreen from 'expo-splash-screen';
import React, { ReactNode, useEffect } from 'react';
import { View } from 'react-native';
import { useNotifications } from '../hooks/useNotifications';
import '../lib/i18n'; // Import i18n configuration

interface AppWrapperProps {
  children: ReactNode;
}

export function AppWrapper({ children }: AppWrapperProps) {
  // Initialize notifications
  useNotifications();

  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return <View style={{ flex: 1 }}>{children}</View>;
} 