import { X } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Animated, Text, TouchableOpacity, View } from 'react-native';
import WebView from 'react-native-webview';

interface PrivacyPolicyProps {
  onClose?: () => void;
}

export function PrivacyPolicy({ onClose }: PrivacyPolicyProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { t } = useTranslation();

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  return (
    <Animated.View 
      style={{ 
        opacity: fadeAnim,
        transform: [{ scale: scaleAnim }]
      }} 
      className="flex-1 bg-background"
    >
      <View className="flex-row justify-between items-center p-4 border-b border-border">
        <Text className="text-2xl font-bold text-foreground">{t('profile.privacyPolicy.title')}</Text>
        {onClose && (
          <TouchableOpacity 
            onPress={onClose}
            className="p-2 rounded-full bg-muted/10 active:bg-muted/20"
          >
            <X size={20} color={isDark ? '#A1A1AA' : '#71717A'} />
          </TouchableOpacity>
        )}
      </View>

      <View className="flex-1">
        <WebView
          source={{ uri: 'https://policies-two.vercel.app/biletbuldum/privacy-policy' }}
          startInLoadingState={true}
          renderLoading={() => (
            <View className="absolute inset-0 items-center justify-center">
              <ActivityIndicator size="large" />
            </View>
          )}
          style={{ flex: 1 }}
        />
      </View>
    </Animated.View>
  );
} 