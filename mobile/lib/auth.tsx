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
  user: User | null;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType>({
  signIn: async () => {},
  signOut: async () => {},
  user: null,
  updateUser: () => {},
});

// This hook can be used to access the user info.
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
        const token = await AsyncStorage.getItem('token');
        if (token) {
          const response = await authApi.getProfile();
          setUser(response.data);
        }
      } catch (error) {
        console.error('Error loading user:', error);
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

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{ signIn, signOut, user, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
} 