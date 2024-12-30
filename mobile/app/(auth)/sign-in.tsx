import { Link } from 'expo-router';
import { useState } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../lib/auth';

export default function SignIn() {
  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('yourpassword');
  const [error, setError] = useState('');
  const { signIn } = useAuth();

  async function handleSignIn() {
    try {
      setError('');
      await signIn(email, password);
    } catch (err) {
      console.log(err)
      setError('Invalid email or password');
    }
  }

  return (
    <View className="flex-1 bg-background p-4 justify-center">
      <View className="space-y-6">
        <View className="space-y-2">
          <Text className="text-2xl font-bold text-foreground">Welcome back</Text>
          <Text className="text-muted-foreground">Sign in to your account</Text>
        </View>

        {error ? (
          <Text className="text-destructive">{error}</Text>
        ) : null}

        <View className="space-y-4">
          <View className="space-y-2">
            <Text className="text-sm font-medium text-foreground">Email</Text>
            <TextInput
              className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <View className="space-y-2">
            <Text className="text-sm font-medium text-foreground">Password</Text>
            <TextInput
              className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity
            className="bg-primary h-10 rounded-md items-center justify-center"
            onPress={handleSignIn}
          >
            <Text className="text-primary-foreground font-medium">Sign In</Text>
          </TouchableOpacity>

          <View className="flex-row justify-center space-x-1">
            <Text className="text-muted-foreground">Don't have an account?</Text>
            <Link href="/(auth)/sign-up" className="text-primary font-medium">
              Sign up
            </Link>
          </View>
        </View>
      </View>
    </View>
  );
} 