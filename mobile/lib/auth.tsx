import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useSegments } from 'expo-router';
import { createContext, useContext, useEffect, useState } from 'react';
import { authApi } from './api';

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
}

const AuthContext = createContext<AuthContextType>({
  signIn: async () => {},
  signOut: async () => {},
  signUp: async () => {},
  user: null,
  updateUser: () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}
// This hook will protect the route access based on user authentication.
function useProtectedRoute(user: User | null) {
  const segments = useSegments();

  useEffect(() => {
    const inAuthGroup = segments[0] === '(auth)';
    const inOnboardingGroup = segments[0] === '(onboarding)';

    if (!user && !inAuthGroup && !inOnboardingGroup) {
      // Redirect to the sign-in page.
      router.replace('/(auth)/sign-in');
    } else if (user && (inAuthGroup || inOnboardingGroup)) {
      // Redirect away from the sign-in page.
      router.replace('/(app)');
    }
  }, [user, segments]);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useProtectedRoute(user);

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
        // Clear invalid token if we get an auth error
        if (error?.response?.status === 401) {
          console.log('🗑️ Clearing invalid token');
          await AsyncStorage.removeItem('token');
        }
      }
    };

    loadUser();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const response = await authApi.login(email, password);
      await AsyncStorage.setItem('token', response.data.token);
      const userProfile = await authApi.getProfile();
      setUser(userProfile.data);
    } catch (error) {
      throw error;
    }
  };

  const signOut = async () => {
    await AsyncStorage.removeItem('token');
    setUser(null);
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
    <AuthContext.Provider value={{ signIn, signOut, signUp, user, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
} 