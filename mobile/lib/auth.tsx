import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { useRouter, useSegments } from 'expo-router';
import { createContext, useContext, useEffect, useState } from 'react';
import { authApi, updatePushToken } from './api';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  onboardingCompletedAt: string;
  notificationPreferences: {
    email: boolean;
    push: boolean;
  };
}

interface AuthContextType {
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  signUp: (email: string, password: string, name: string, lastName: string) => Promise<void>;
  user: User | null;
  updateUser: (user: User) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  signIn: async () => {},
  signOut: async () => {},
  signUp: async () => {},
  user: null,
  updateUser: () => {},
  isLoading: true,
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inOnboarding = segments[0] === 'onboarding';
    const inProtectedRoute = segments[0] === '(app)';

    if (!user && inProtectedRoute) {
      router.replace('/(auth)/sign-in');
      return;
    } else if (user && !user.onboardingCompletedAt && !inOnboarding) {
      router.replace('/onboarding');
      return;
    } else if (user && user.onboardingCompletedAt && (inAuthGroup || inOnboarding)) {
      router.replace('/(app)');
      return;
    }
  }, [user, segments, isLoading]);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = await AsyncStorage.getItem('token');

        if (token) {
          const response = await authApi.getProfile();
          setUser(response.data);
        } else {
          setUser(null);
        }
      } catch (error: any) {
        if (error?.response?.status === 401) {
          await AsyncStorage.removeItem('token');
          setUser(null);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      let pushToken;

      if (Device.isDevice) {
        const { status } = await Notifications.getPermissionsAsync();
        if (status === 'granted') {
          const tokenData = await Notifications.getExpoPushTokenAsync({
            projectId: Constants.expoConfig?.extra?.eas?.projectId,
          });
          pushToken = tokenData.data;
        }
      }

      const response = await authApi.login(email, password, pushToken);
      await AsyncStorage.setItem('token', response.data.token);
      const userProfile = await authApi.getProfile();
      setUser(userProfile.data);
    } catch (error) {
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await updatePushToken('');
      await AsyncStorage.removeItem('token');
      setUser(null);
      router.replace('/(auth)/sign-in');
    } catch (error) {
      throw error;
    }
  };

  const signUp = async (email: string, password: string, name: string, lastName: string) => {
    try {
      const response = await authApi.register(email, password, name, lastName);
      await AsyncStorage.setItem('token', response.data.token);
      const userProfile = await authApi.getProfile();
      setUser(userProfile.data);
    } catch (error) {
      throw error;
    }
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  return <AuthContext.Provider value={{ signIn, signOut, signUp, user, updateUser, isLoading }}>{children}</AuthContext.Provider>;
}
