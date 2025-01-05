import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Keyboard, KeyboardAvoidingView, Platform, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useColorScheme } from '~/lib/useColorScheme';
import { ThemeToggle } from '../../components/ThemeToggle';
import { api } from '../../lib/api';

export default function ResetPasswordScreen() {
  const { token: initialToken } = useLocalSearchParams<{ token: string }>();
  const [resetCode, setResetCode] = useState(initialToken || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const handleResetPassword = async () => {
    if (!resetCode || !newPassword || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (resetCode.length !== 6) {
      setError('Please enter the 6-digit reset code');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    Keyboard.dismiss();
    try {
      setLoading(true);
      setError('');
      await api.post('/auth/reset-password', {
        resetToken: resetCode,
        newPassword,
      });
      router.replace('/sign-in' as any);
    } catch (error: any) {
      if (error?.response?.status === 400) {
        setError('Invalid or expired reset code. Please request a new one.');
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
            <Text className="text-3xl font-bold text-foreground">Reset Password</Text>
            <Text className="text-base text-muted-foreground mt-1 text-center">
              Enter the 6-digit code we sent to your email and choose a new password.
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
              <Text className="text-sm font-medium text-foreground ml-1">Reset Code</Text>
              <TextInput
                placeholder="Enter 6-digit code"
                value={resetCode}
                onChangeText={(text) => setResetCode(text.replace(/[^0-9]/g, '').slice(0, 6))}
                keyboardType="number-pad"
                maxLength={6}
                className="bg-card text-foreground px-4 py-3 rounded-lg border border-border"
                placeholderTextColor="#666"
                editable={!loading}
              />
            </Animated.View>

            <Animated.View
              entering={FadeInDown.delay(600).duration(1000)}
              className="gap-2"
            >
              <Text className="text-sm font-medium text-foreground ml-1">New Password</Text>
              <TextInput
                placeholder="Enter new password"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
                className="bg-card text-foreground px-4 py-3 rounded-lg border border-border"
                placeholderTextColor="#666"
                editable={!loading}
              />
            </Animated.View>

            <Animated.View
              entering={FadeInDown.delay(800).duration(1000)}
              className="gap-2"
            >
              <Text className="text-sm font-medium text-foreground ml-1">Confirm Password</Text>
              <TextInput
                placeholder="Confirm new password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                className="bg-card text-foreground px-4 py-3 rounded-lg border border-border"
                placeholderTextColor="#666"
                editable={!loading}
              />
            </Animated.View>

            <Animated.View
              entering={FadeInDown.delay(1000).duration(1000)}
            >
              <TouchableOpacity
                onPress={handleResetPassword}
                disabled={loading}
                className={`bg-primary h-12 rounded-lg items-center justify-center mt-4 flex-row ${loading ? 'opacity-70' : ''}`}
              >
                {loading ? (
                  <>
                    <ActivityIndicator color={isDark ? '#000' : '#fff'} size="small" />
                    <Text className="text-primary-foreground text-lg font-semibold ml-2">Resetting...</Text>
                  </>
                ) : (
                  <Text className="text-primary-foreground text-lg font-semibold">Reset Password</Text>
                )}
              </TouchableOpacity>
            </Animated.View>

            <Animated.View
              entering={FadeInDown.delay(1200).duration(1000)}
              className="flex-row justify-center mt-4"
            >
              <TouchableOpacity onPress={() => router.replace('/sign-in')} disabled={loading}>
                <Text className={`text-primary font-semibold ${loading ? 'opacity-50' : ''}`}>Back to Login</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </Animated.View>
      </View>
    </KeyboardAvoidingView>
  );
} 