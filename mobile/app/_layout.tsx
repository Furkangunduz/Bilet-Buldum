import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { Slot } from 'expo-router';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import '../global.css';
import { AuthProvider } from '../lib/auth';

export default function RootLayout() {
  return (
    <View style={{ flex: 1 }}>
      <GestureHandlerRootView>
        <BottomSheetModalProvider>
          <AuthProvider>
            <Slot />
          </AuthProvider>
        </BottomSheetModalProvider>
      </GestureHandlerRootView>
    </View>
  );
}
