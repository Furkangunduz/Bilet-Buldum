import { Tabs } from 'expo-router';
import { Home, User } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';

export default function AppLayout() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          borderTopWidth: 1,
          backgroundColor: isDark ? '#09090B' : '#FFFFFF',
          borderTopColor: isDark ? '#27272A' : '#E4E4E7',
        },
        tabBarActiveTintColor: isDark ? '#FAFAFA' : '#09090B',
        tabBarInactiveTintColor: isDark ? '#71717A' : '#A1A1AA',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Home size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <User size={24} color={color} />,
        }}
      />
    </Tabs>
  );
} 