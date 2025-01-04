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
  notificationPreferences: {
    email: boolean;
    push: boolean;
  };
}

interface AuthContextType {
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  signUp: (email: string, password: string,name:string,lastName:string) => Promise<void>;
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
    const inOnboardingGroup = segments[0] === '(onboarding)';

    if (!user && !inAuthGroup && !inOnboardingGroup) {
      router.replace('/(auth)/sign-in');
    } else if (user && (inAuthGroup || inOnboardingGroup)) {
      router.replace('/(app)');
    }
  }, [user, segments, isLoading]);

  useEffect(() => {
    const loadUser = async () => {
      try {
        console.log('🔍 Checking for auth token...');
        const token = await AsyncStorage.getItem('token');
        console.log('Token exists:', !!token);
        
        if (token) {
          console.log('🔄 Fetching user profile...');
          const response = await authApi.getProfile();
          console.log('✅ Profile loaded successfully:', response.data);
          setUser(response.data);
        } else {
          console.log('ℹ️ No token found, user is not authenticated');
        }
      } catch (error: any) {
        console.error('❌ Error loading user:', {
          name: error?.name,
          message: error?.message,
          response: error?.response?.data,
          status: error?.response?.status
        });
        if (error?.response?.status === 401) {
          console.log('🗑️ Clearing invalid token');
          await AsyncStorage.removeItem('token');
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
      
      // Get push token if available
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
      // Clear push token from the server before logging out
      await updatePushToken('');
      await AsyncStorage.removeItem('token');
      setUser(null);
    } catch (error) {
      console.error('Error during logout:', error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string,name:string,lastName:string) => {
    try {
      const response = await authApi.register(email, password,name,lastName);
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

  return (
    <AuthContext.Provider value={{ signIn, signOut, signUp, user, updateUser, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
} 