import { Link } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Keyboard, KeyboardAvoidingView, Platform, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useColorScheme } from '~/lib/useColorScheme';
import { ThemeToggle } from '../../components/ThemeToggle';
import { useAuth } from '../../lib/auth';

export default function SignIn() {
  const [email, setEmail] = useState('kral@kral.com');
  const [password, setPassword] = useState('123123');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useAuth();

  async function handleSignIn() {
    Keyboard.dismiss();
    setIsLoading(true);
    try {
      setError('');
      await signIn(email, password);
    } catch (err) {
      console.log(err);
      setError('Invalid email or password');
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
      <View className="absolute top-28 right-10 z-10">
        <ThemeToggle />
      </View>
      
      <View className="flex-1 px-6">
        <Animated.View 
          entering={FadeInUp.delay(200).duration(1000)}
          className="flex-1 justify-center"
        >
          <View className="items-center mb-8">
            <Text className="text-3xl font-bold text-foreground">Bilet Buldum</Text>
            <Text className="text-base text-muted-foreground mt-1">Sign in to your account</Text>
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
                editable={!isLoading}
              />
            </Animated.View>

            <Animated.View 
              entering={FadeInDown.delay(600).duration(1000)}
              className="gap-2"
            >
              <Text className="text-sm font-medium text-foreground ml-1">Password</Text>
              <TextInput
                placeholder="Enter your password"
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
                    <Text className="text-primary-foreground text-lg font-semibold ml-2">Signing in...</Text>
                  </>
                ) : (
                  <Text className="text-primary-foreground text-lg font-semibold">Sign In</Text>
                )}
              </TouchableOpacity>
            </Animated.View>

            <Animated.View 
              entering={FadeInDown.delay(1000).duration(1000)}
              className="flex-row justify-center mt-4"
            >
              <Link href="/forgot-password" asChild>
              <TouchableOpacity>
                <Text className="text-center text-primary">Forgot Password?</Text>
              </TouchableOpacity>
            </Link>
            </Animated.View>
            <Animated.View 
              entering={FadeInDown.delay(1000).duration(1000)}
              className="flex-row justify-center mt-4"
            >
              <Text className="text-muted-foreground">Don't have an account?</Text>
              <Link href="/sign-up" asChild>
                <TouchableOpacity disabled={isLoading}>
                  <Text className={`text-primary font-semibold ml-1 ${isLoading ? 'opacity-50' : ''}`}>Sign Up</Text>
                </TouchableOpacity>
              </Link>
            </Animated.View>
          </View>
        </Animated.View>
      </View>
    </KeyboardAvoidingView>
  );
} 