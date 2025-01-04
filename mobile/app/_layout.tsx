import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { Stack } from 'expo-router';
import * as ExpoSplashScreen from 'expo-splash-screen';
import { useCallback, useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import mobileAds from 'react-native-google-mobile-ads';
import '../global.css';
import { AuthProvider, useAuth } from '../lib/auth';
import { ThemeProvider } from '../lib/theme-provider';

// Prevent the splash screen from auto-hiding
ExpoSplashScreen.preventAutoHideAsync();

mobileAds()
  .initialize()
  .then(() => {
    console.log('Mobile Ads SDK initialized');
  })
  .catch((error) => {
    console.error('Mobile Ads SDK initialization error:', error);
  });

function RootLayoutNav() {
  const { isLoading, user } = useAuth();
  
  const onLayoutRootView = useCallback(async () => {
    if (!isLoading) {
      await ExpoSplashScreen.hideAsync();
    }
  }, [isLoading]);

  useEffect(() => {
    onLayoutRootView();
  }, [onLayoutRootView]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="onboarding" options={{ headerShown: false, gestureEnabled: false }} />
      <Stack.Screen name="(app)" options={{ headerShown: false, gestureEnabled: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <ThemeProvider>
          <AuthProvider>
            <RootLayoutNav />
          </AuthProvider>
        </ThemeProvider>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}
