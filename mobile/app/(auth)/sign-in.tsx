import { Link } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Keyboard, KeyboardAvoidingView, Platform, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useColorScheme } from '~/lib/useColorScheme';

import { LanguageSwitch } from '~/components/LanguageSwitch';
import { ThemeToggle } from '../../components/ThemeToggle';
import { useAuth } from '../../lib/auth';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useAuth();
  const { t } = useTranslation();

  async function handleSignIn() {
    Keyboard.dismiss();
    setIsLoading(true);
    try {
      setError('');
      await signIn(email, password);
    } catch (err) {
      console.log(err);
      setError(t('auth.errors.invalidCredentials'));
    } finally {
      setIsLoading(false);
    }
  }

  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <KeyboardAvoidingView 
      key="sign-in-screen"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-background"
    >
      <View className="absolute top-28 right-10 z-10 flex-row items-center gap-4">
        <LanguageSwitch />
        <ThemeToggle />
      </View>
      
      <View className="flex-1 px-6">
        <Animated.View 
          entering={FadeInUp.delay(200).duration(1000)}
          className="flex-1 justify-center"
        >
          <View className="items-center mb-8">
            <Text className="text-3xl font-bold text-foreground">Bilet Buldum</Text>
            <Text className="text-base text-muted-foreground mt-1">{t('auth.signInToAccount')}</Text>
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
              <Text className="text-sm font-medium text-foreground ml-1">{t('auth.email')}</Text>
              <TextInput
                placeholder={t('auth.enterEmail')}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                className="bg-card text-foreground px-4 py-3 rounded-lg border border-border"
                placeholderTextColor="#666"
                editable={!isLoading}
              />
            </Animated.View>

            <Animated.View 
              entering={FadeInDown.delay(600).duration(1000)}
              className="gap-2"
            >
              <Text className="text-sm font-medium text-foreground ml-1">{t('auth.password')}</Text>
              <TextInput
                placeholder={t('auth.enterPassword')}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                className="bg-card text-foreground px-4 py-3 rounded-lg border border-border"
                placeholderTextColor="#666"
                editable={!isLoading}
              />
            </Animated.View>

            <Animated.View 
              entering={FadeInDown.delay(800).duration(1000)}
            >
              <TouchableOpacity
                onPress={handleSignIn}
                disabled={isLoading}
                className={`bg-primary h-12 rounded-lg items-center justify-center mt-4 flex-row ${isLoading ? 'opacity-70' : ''}`}
              >
                {isLoading ? (
                  <>
                    <ActivityIndicator color={isDark ? '#000' : '#fff'} size="small" />
                    <Text className="text-primary-foreground text-lg font-semibold ml-2">{t('auth.signingIn')}</Text>
                  </>
                ) : (
                  <Text className="text-primary-foreground text-lg font-semibold">{t('auth.signIn')}</Text>
                )}
              </TouchableOpacity>
            </Animated.View>

            {/* <Animated.View 
              entering={FadeInDown.delay(1000).duration(1000)}
              className="flex-row justify-center mt-4"
            >
              <Link href="/forgot-password" asChild>
                <TouchableOpacity>
                  <Text className="text-center text-primary">{t('auth.forgotPassword')}</Text>
                </TouchableOpacity>
              </Link>
            </Animated.View> */}
            <Animated.View 
              entering={FadeInDown.delay(1000).duration(1000)}
              className="flex-row justify-center mt-4"
            >
              <Text className="text-muted-foreground">{t('auth.noAccount')}</Text>
              <Link href="/sign-up" asChild>
                <TouchableOpacity disabled={isLoading}>
                  <Text className={`text-primary font-semibold ml-1 ${isLoading ? 'opacity-50' : ''}`}>{t('auth.signUp')}</Text>
                </TouchableOpacity>
              </Link>
            </Animated.View>
          </View>
        </Animated.View>
      </View>
    </KeyboardAvoidingView>
  );
} 