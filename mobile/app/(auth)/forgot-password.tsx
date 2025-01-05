import { router } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Keyboard, KeyboardAvoidingView, Platform, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useColorScheme } from '~/lib/useColorScheme';
import { ThemeToggle } from '../../components/ThemeToggle';
import { api } from '../../lib/api';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    Keyboard.dismiss();
    try {
      setLoading(true);
      setError('');
      const response = await api.post('/auth/forgot-password', { email });
      
      // In development, show the code in a more user-friendly way
      if (__DEV__) {
        alert(`Your reset code is: ${response.data.resetToken}\n\nIn production, this will be sent to your email.`);
      }
      router.replace(`/reset-password?token=${response.data.resetToken}` as any);
    } catch (error: any) {
      if (error?.response?.status === 404) {
        setError('No account found with this email address');
      } else {
        setError('Something went wrong. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-background"
    >
      <View className="absolute top-28 right-10 z-10">
        <ThemeToggle />
      </View>

      <View className="flex-1 px-6">
        <Animated.View
          entering={FadeInUp.delay(200).duration(1000)}
          className="flex-1 justify-center"
        >
          <View className="items-center mb-8">
            <Text className="text-3xl font-bold text-foreground">Forgot Password</Text>
            <Text className="text-base text-muted-foreground mt-1 text-center">
              Enter your email address and we'll send you a 6-digit code to reset your password.
            </Text>
          </View>

          {error ? (
            <Animated.View
              entering={FadeInDown.duration(400)}
              className="bg-destructive/10 p-3 rounded-lg mb-4"
            >
              <Text className="text-destructive text-center">{error}</Text>
            </Animated.View>
          ) : null}

          <View className="gap-5">
            <Animated.View
              entering={FadeInDown.delay(400).duration(1000)}
              className="gap-2"
            >
              <Text className="text-sm font-medium text-foreground ml-1">Email</Text>
              <TextInput
                placeholder="Enter your email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                className="bg-card text-foreground px-4 py-3 rounded-lg border border-border"
                placeholderTextColor="#666"
                editable={!loading}
              />
            </Animated.View>

            <Animated.View
              entering={FadeInDown.delay(800).duration(1000)}
            >
              <TouchableOpacity
                onPress={handleForgotPassword}
                disabled={loading}
                className={`bg-primary h-12 rounded-lg items-center justify-center mt-4 flex-row ${loading ? 'opacity-70' : ''}`}
              >
                {loading ? (
                  <>
                    <ActivityIndicator color={isDark ? '#000' : '#fff'} size="small" />
                    <Text className="text-primary-foreground text-lg font-semibold ml-2">Sending...</Text>
                  </>
                ) : (
                  <Text className="text-primary-foreground text-lg font-semibold">Send Reset Code</Text>
                )}
              </TouchableOpacity>
            </Animated.View>

            <Animated.View
              entering={FadeInDown.delay(1000).duration(1000)}
              className="flex-row justify-center mt-4"
            >
              <TouchableOpacity onPress={() => router.back()} disabled={loading}>
                <Text className={`text-primary font-semibold ${loading ? 'opacity-50' : ''}`}>Back to Login</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </Animated.View>
      </View>
    </KeyboardAvoidingView>
  );
} 