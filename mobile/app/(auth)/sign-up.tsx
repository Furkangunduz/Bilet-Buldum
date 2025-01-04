import { Link } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Keyboard, KeyboardAvoidingView, Platform, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { ThemeToggle } from '../../components/ThemeToggle';
import { useAuth } from '../../lib/auth';

export default function SignUp() {
  const [name, setName] = useState('kral');
  const [lastName, setLastName] = useState('kral');
  const [email, setEmail] = useState('kral@kral.com');
  const [password, setPassword] = useState('123123');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signUp } = useAuth();

  async function handleSignUp() {
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }
    
    if (!lastName.trim()) {
      setError('Please enter your last name');
      return;
    }

    if (!email.trim()) {
      setError('Please enter your email');
      return;
    }

    if (!password.trim()) {
      setError('Please enter your password');
      return;
    }
    
    Keyboard.dismiss();
    setIsLoading(true);
    try {
      setError('');
      await signUp(email, password, name, lastName);
    } catch (err: any) {
      if (err?.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError('Registration failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView 
      key="sign-up-screen"
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

          <View className="gap-5">
            <Animated.View 
              entering={FadeInDown.delay(400).duration(1000)}
              className="gap-2"
            >
              <Text className="text-sm font-medium text-foreground ml-1">First Name</Text>
              <TextInput
                placeholder="Enter your first name"
                value={name}
                onChangeText={setName}
                className="bg-card text-foreground px-4 py-3 rounded-lg border border-border"
                placeholderTextColor="#666"
                editable={!isLoading}
              />
            </Animated.View>

            <Animated.View 
              entering={FadeInDown.delay(600).duration(1000)}
              className="gap-2"
            >
              <Text className="text-sm font-medium text-foreground ml-1">Last Name</Text>
              <TextInput
                placeholder="Enter your last name"
                value={lastName}
                onChangeText={setLastName}
                className="bg-card text-foreground px-4 py-3 rounded-lg border border-border"
                placeholderTextColor="#666"
                editable={!isLoading}
              />
            </Animated.View>

            <Animated.View 
              entering={FadeInDown.delay(800).duration(1000)}
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
              entering={FadeInDown.delay(1000).duration(1000)}
              className="gap-2"
            >
              <Text className="text-sm font-medium text-foreground ml-1">Password</Text>
              <TextInput
                placeholder="Create a password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                className="bg-card text-foreground px-4 py-3 rounded-lg border border-border"
                placeholderTextColor="#666"
                editable={!isLoading}
              />
            </Animated.View>

            <Animated.View 
              entering={FadeInDown.delay(1200).duration(1000)}
            >
              <TouchableOpacity
                onPress={handleSignUp}
                disabled={isLoading}
                className={`bg-primary h-12 rounded-lg items-center justify-center mt-4 flex-row ${isLoading ? 'opacity-70' : ''}`}
              >
                {isLoading ? (
                  <>
                    <ActivityIndicator color="hsl(var(--primary-foreground))" size="small" />
                    <Text className="text-primary-foreground text-lg font-semibold ml-2">Creating account...</Text>
                  </>
                ) : (
                  <Text className="text-primary-foreground text-lg font-semibold">Create Account</Text>
                )}
              </TouchableOpacity>
            </Animated.View>

            <Animated.View 
              entering={FadeInDown.delay(1400).duration(1000)}
              className="flex-row justify-center mt-4"
            >
              <Text className="text-muted-foreground">Already have an account?</Text>
              <Link href="/sign-in" asChild>
                <TouchableOpacity disabled={isLoading}>
                  <Text className={`text-primary font-semibold ml-1 ${isLoading ? 'opacity-50' : ''}`}>Sign In</Text>
                </TouchableOpacity>
              </Link>
            </Animated.View>
          </View>
        </Animated.View>
      </View>
    </KeyboardAvoidingView>
  );
} 