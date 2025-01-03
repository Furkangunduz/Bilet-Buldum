import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import mobileAds from 'react-native-google-mobile-ads';
import '../global.css';
import { AuthProvider } from '../lib/auth';

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
        <AuthProvider>
          <Stack
            screenOptions={{
              headerShown: false,
            }}
          />
        </AuthProvider>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}
