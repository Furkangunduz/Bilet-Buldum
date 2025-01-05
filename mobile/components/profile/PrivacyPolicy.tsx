import { X } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Animated, ScrollView, Text, TouchableOpacity, View } from 'react-native';

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

  const privacyPolicyText = t('profile.privacyPolicy.content', { returnObjects: true }) as string[];

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

      <ScrollView className="flex-1 p-4">
        {privacyPolicyText.map((paragraph, index) => (
          <View key={index} className="mb-4">
            {paragraph.startsWith('#') ? (
              <Text className="text-2xl font-bold text-foreground mb-2">
                {paragraph.replace(/^#+ /, '')}
              </Text>
            ) : paragraph.startsWith('##') ? (
              <Text className="text-xl font-semibold text-foreground mb-2 mt-4">
                {paragraph.replace(/^##+ /, '')}
              </Text>
            ) : paragraph.startsWith('###') ? (
              <Text className="text-lg font-semibold text-foreground mb-2 mt-3">
                {paragraph.replace(/^###+ /, '')}
              </Text>
            ) : paragraph.startsWith('-') ? (
              <Text className="text-foreground ml-4 mb-1">
                {paragraph}
              </Text>
            ) : (
              <Text className="text-foreground">
                {paragraph}
              </Text>
            )}
          </View>
        ))}
      </ScrollView>
    </Animated.View>
  );
} 