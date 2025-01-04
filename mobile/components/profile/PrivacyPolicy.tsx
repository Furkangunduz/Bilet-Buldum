import { X } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { useEffect, useRef } from 'react';
import { Animated, ScrollView, Text, TouchableOpacity, View } from 'react-native';

const PRIVACY_POLICY = `# Privacy Policy for Bilet Buldum

Last updated: January 4, 2024

## 1. Information We Collect

### 1.1 Personal Information
- Email address
- Name and surname
- Profile information
- Location data (when permitted)
- Device information

### 1.2 Usage Data
- App usage statistics
- Search history
- Ticket preferences
- Notification settings

## 2. How We Use Your Information

- To provide and maintain our Service
- To notify you about ticket availability
- To provide customer support
- To provide personalized search results
- To improve our services

## 3. Data Storage and Security

We implement appropriate security measures to protect your personal information. Your data is stored securely and only accessed when necessary to provide our services.

## 4. Third-Party Services

We use third-party services that may collect information:
- Google Mobile Ads
- Authentication services
- Analytics services

## 5. Your Rights

You have the right to:
- Access your personal data
- Correct your personal data
- Delete your account
- Opt-out of marketing communications

## 6. Children's Privacy

Our service is not intended for use by children under 13. We do not knowingly collect personal information from children under 13.

## 7. Changes to This Policy

We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page.

## 8. Contact Us

If you have questions about this Privacy Policy, please contact us at:
support@biletbuldum.com`;

interface PrivacyPolicyProps {
  onClose?: () => void;
}

export function PrivacyPolicy({ onClose }: PrivacyPolicyProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

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
        <Text className="text-2xl font-bold text-foreground">Privacy Policy</Text>
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
        {PRIVACY_POLICY.split('\n\n').map((paragraph, index) => (
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