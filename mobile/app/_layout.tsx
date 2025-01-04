import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { Stack } from 'expo-router';
import { ActivityIndicator, Image, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import mobileAds from 'react-native-google-mobile-ads';
import '../global.css';
import { AuthProvider, useAuth } from '../lib/auth';
import { ThemeProvider } from '../lib/theme-provider';

mobileAds()
  .initialize()
  .then(() => {
    console.log('Mobile Ads SDK initialized');
  })
  .catch((error) => {
    console.error('Mobile Ads SDK initialization error:', error);
  });

function SplashScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-[#B9D2EC]">
      <View className="items-center">
        <Image
          source={require('../assets/biletbuldum-icon.png')}
          className="w-32 h-32 mb-4"
          resizeMode="cover"
        />
        <Text className="text-2xl font-bold text-foreground mb-8">
          Bilet Buldum
        </Text>
        <ActivityIndicator size="large" className="text-primary" />
      </View>
    </View>
  );
}

function RootLayoutNav() {
  const { isLoading } = useAuth();
  
  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(app)" options={{ headerShown: false }} />
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
