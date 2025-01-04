import { X } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { useEffect, useRef } from 'react';
import { Animated, ScrollView, Text, TouchableOpacity, View } from 'react-native';

const TERMS_OF_SERVICE = `# Terms of Service for Bilet Buldum

Last updated: January 4, 2024

## 1. Acceptance of Terms

By accessing and using the Bilet Buldum application, you agree to be bound by these Terms of Service.

## 2. Description of Service

Bilet Buldum is a ticket search and notification service that helps users find available tickets for various events.

## 3. User Accounts

### 3.1 Registration
- You must provide accurate information when creating an account
- You are responsible for maintaining the security of your account
- You must be at least 13 years old to use this service

### 3.2 Account Termination
We reserve the right to terminate accounts that violate these terms or engage in fraudulent activity.

## 4. User Conduct

Users agree not to:
- Violate any laws or regulations
- Impersonate others
- Share false or misleading information
- Attempt to access unauthorized areas of the service
- Use automated systems to access the service

## 5. Intellectual Property

All content and materials available in Bilet Buldum are protected by intellectual property rights.

## 6. Disclaimer of Warranties

The service is provided "as is" without any warranties, express or implied.

## 7. Limitation of Liability

We shall not be liable for any indirect, incidental, special, or consequential damages.

## 8. Changes to Terms

We reserve the right to modify these terms at any time. Users will be notified of significant changes.

## 9. Governing Law

These terms shall be governed by and construed in accordance with the laws of Turkey.

## 10. Contact Information

For questions about these Terms, please contact:
support@biletbuldum.com`;

interface TermsOfServiceProps {
  onClose?: () => void;
}

export function TermsOfService({ onClose }: TermsOfServiceProps) {
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
        <Text className="text-2xl font-bold text-foreground">Terms of Service</Text>
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
        {TERMS_OF_SERVICE.split('\n\n').map((paragraph, index) => (
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