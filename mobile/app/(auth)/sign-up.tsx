import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Keyboard, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useAuth } from '../../lib/auth';

export default function SignUp() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signUp } = useAuth();

  async function handleSignUp() {
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }
    
    Keyboard.dismiss();
    setIsLoading(true);
    try {
      setError('');
      await signUp(email, password);
    } catch (err) {
      setError('Registration failed. Please try again.');
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
          <Text className="text-3xl font-bold text-foreground">Join Us</Text>
          <Text className="text-base text-muted-foreground mt-1">Create your account</Text>
        </View>

        {error ? (
          <Animated.View 
            entering={FadeInDown.duration(400)}
            className="bg-destructive/10 p-3 rounded-lg mb-4"
          >
            <Text className="text-destructive text-center">{error}</Text>
          </Animated.View>
        ) : null}

        <View className="space-y-5">
          <Animated.View 
            entering={FadeInDown.delay(400).duration(1000)}
            className="space-y-2"
          >
            <Text className="text-sm font-medium text-foreground ml-1">Name</Text>
            <View className="flex-row items-center bg-card border border-input rounded-xl px-4">
              <Ionicons name="person-outline" size={20} color="#666" />
              <TextInput
                className="flex-1 h-12 ml-2 text-base"
                placeholder="Enter your name"
                value={name}
                onChangeText={setName}
                placeholderTextColor="#666"
              />
            </View>
          </Animated.View>

          <Animated.View 
            entering={FadeInDown.delay(600).duration(1000)}
            className="space-y-2"
          >
            <Text className="text-sm font-medium text-foreground ml-1">Email</Text>
            <View className="flex-row items-center bg-card border border-input rounded-xl px-4">
              <Ionicons name="mail-outline" size={20} color="#666" />
              <TextInput
                className="flex-1 h-12 ml-2 text-base"
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
            entering={FadeInDown.delay(800).duration(1000)}
            className="space-y-2"
          >
            <Text className="text-sm font-medium text-foreground ml-1">Password</Text>
            <View className="flex-row items-center bg-card border border-input rounded-xl px-4">
              <Ionicons name="lock-closed-outline" size={20} color="#666" />
              <TextInput
                className="flex-1 h-12 ml-2 text-base"
                placeholder="Create a password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                placeholderTextColor="#666"
              />
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(1000).duration(1000)}>
            <TouchableOpacity
              className="bg-primary h-12 rounded-xl items-center justify-center mt-4"
              onPress={handleSignUp}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-primary-foreground font-semibold text-base">Create Account</Text>
              )}
            </TouchableOpacity>
          </Animated.View>

          <Animated.View 
            entering={FadeInDown.delay(1200).duration(1000)}
            className="flex-row justify-center space-x-1 mt-4"
          >
            <Text className="text-muted-foreground">Already have an account?</Text>
            <Link href="/(auth)/sign-in" className="text-primary font-medium">
              Sign in
            </Link>
          </Animated.View>
        </View>
      </Animated.View>
    </View>
  );
} 