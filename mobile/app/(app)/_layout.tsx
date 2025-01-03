import { Tabs } from 'expo-router';
import { Home, User } from 'lucide-react-native';

export default function AppLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: 'hsl(240 5.9% 90%)',
          backgroundColor: 'hsl(0 0% 100%)',
        },
        tabBarActiveTintColor: 'hsl(240 5.9% 10%)',
        tabBarInactiveTintColor: 'hsl(240 3.8% 46.1%)',
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