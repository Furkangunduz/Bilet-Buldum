import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Keyboard, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useAuth } from '../../lib/auth';

export default function SignIn() {
  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('yourpassword');
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

  return (
    <View className="flex-1 bg-background px-6">
      <Animated.View 
        entering={FadeInUp.delay(200).duration(1000)}
        className="flex-1 justify-center"
      >
        <View className="items-center mb-8">
          <View className="w-20 h-20 bg-primary rounded-2xl items-center justify-center mb-4">
            <Ionicons name="train-outline" size={40} color="white" />
          </View>
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
            <View className="flex-row items-center bg-card border border-input rounded-xl px-4">
              <Ionicons name="mail-outline" size={20} color="#666" />
              <TextInput
                className="flex-1 h-12 ml-4 text-base pb-2.5"
                placeholder="Enter your email"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                placeholderTextColor="#666"
              />
            </View>
          </Animated.View>

          <Animated.View 
            entering={FadeInDown.delay(600).duration(1000)}
            className="gap-2"
          >
            <Text className="text-sm font-medium text-foreground ml-1">Password</Text>
            <View className="flex-row items-center bg-card border border-input rounded-xl px-4">
              <Ionicons name="lock-closed-outline" size={20} color="#666" />
              <TextInput
                className="flex-1 h-12 ml-4 text-base pb-2.5"
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                placeholderTextColor="#666"
              />
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(800).duration(1000)}>
            <TouchableOpacity
              className="bg-primary h-12 rounded-xl items-center justify-center mt-4"
              onPress={handleSignIn}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-primary-foreground font-semibold text-base">Sign In</Text>
              )}
            </TouchableOpacity>
          </Animated.View>

          <Animated.View 
            entering={FadeInDown.delay(1000).duration(1000)}
            className="flex-row justify-center gap-1 mt-4"
          >
            <Text className="text-muted-foreground">Don't have an account?</Text>
            <Link href="/(auth)/sign-up" className="text-primary font-medium">
              Sign up
            </Link>
          </Animated.View>
        </View>
      </Animated.View>
    </View>
  );
} 