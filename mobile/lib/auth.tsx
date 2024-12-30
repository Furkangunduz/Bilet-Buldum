import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useSegments } from 'expo-router';
import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';
import { authApi } from './api';

interface User {
  id: string;
  email: string;
  name?: string;
  subscription?: {
    status: 'active' | 'inactive';
    expiresAt: string;
  };
}

interface AuthContextType {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

// This hook can be used to access the user info.
export function useAuth() {
  return useContext(AuthContext);
}

// This hook will protect the route access based on user authentication.
function useProtectedRoute(user: User | null) {
  const segments = useSegments();

  useEffect(() => {
    const inAuthGroup = segments[0] === '(auth)';

    if (
      // If the user is not signed in and the initial segment is not anything in the auth group.
      !user &&
      !inAuthGroup
    ) {
      // Redirect to the sign-in page.
      router.replace('/(auth)/sign-in');
    } else if (user && inAuthGroup) {
      // Redirect away from the sign-in page.
      router.replace('/(app)');
    }
  }, [user, segments]);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  async function loadUser() {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        const response = await authApi.getProfile();
        setUser(response.data);
      }
    } catch (err) {
      await AsyncStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  }

  async function signIn(email: string, password: string) {
    try {
      const response = await authApi.login(email, password);
      await AsyncStorage.setItem('token', response.data.token);
      setUser(response.data.user);
      console.log(response.data);
    } catch (err) {
      console.log(err); 
      throw new Error('Invalid email or password');
    }
  }

  async function signUp(email: string, password: string) {
    try {
      const response = await authApi.register(email, password);
      await AsyncStorage.setItem('token', response.data.token);
      setUser(response.data.user);
    } catch (err) {
      throw new Error('Registration failed');
    }
  }

  async function signOut() {
    await AsyncStorage.removeItem('token');
    setUser(null);
  }

  useProtectedRoute(user);

  return (
    <AuthContext.Provider
      value={{
        signIn,
        signUp,
        signOut,
        user,
        loading,
      }}>
      {children}
    </AuthContext.Provider>
  );
} 