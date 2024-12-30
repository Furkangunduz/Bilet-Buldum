import { Link } from 'expo-router';
import { useState } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../lib/auth';

export default function SignUp() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { signUp } = useAuth();

  async function handleSignUp() {
    try {
      setError('');
      await signUp(email, password, name);
    } catch (err) {
      setError('Registration failed. Please try again.');
    }
  }

  return (
    <View className="flex-1 bg-background p-4 justify-center">
      <View className="space-y-6">
        <View className="space-y-2">
          <Text className="text-2xl font-bold text-foreground">Create account</Text>
          <Text className="text-muted-foreground">Enter your details below</Text>
        </View>

        {error ? (
          <Text className="text-destructive">{error}</Text>
        ) : null}

        <View className="space-y-4">
          <View className="space-y-2">
            <Text className="text-sm font-medium text-foreground">Name</Text>
            <TextInput
              className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="Enter your name"
              value={name}
              onChangeText={setName}
            />
          </View>

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
              placeholder="Create a password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity
            className="bg-primary h-10 rounded-md items-center justify-center"
            onPress={handleSignUp}
          >
            <Text className="text-primary-foreground font-medium">Sign Up</Text>
          </TouchableOpacity>

          <View className="flex-row justify-center space-x-1">
            <Text className="text-muted-foreground">Already have an account?</Text>
            <Link href="/(auth)/sign-in" className="text-primary font-medium">
              Sign in
            </Link>
          </View>
        </View>
      </View>
    </View>
  );
} 