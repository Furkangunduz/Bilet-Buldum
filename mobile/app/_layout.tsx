import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import mobileAds from 'react-native-google-mobile-ads';
import '../global.css';
import { AuthProvider } from '../lib/auth';
import { ThemeProvider } from '../lib/theme-provider';

// Initialize mobile ads SDK
mobileAds()
  .initialize()
  .then(adapterStatuses => {
    console.log('Mobile Ads SDK initialized');
  }).catch(error => {
    console.error('Mobile Ads SDK initialization error:', error);
  });

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <ThemeProvider>
          <AuthProvider>
            <Stack
              screenOptions={{
                headerShown: false,
              }}
            />
          </AuthProvider>
        </ThemeProvider>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}
