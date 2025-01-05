import { Tabs } from 'expo-router';
import { Home, User } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { useTranslation } from 'react-i18next';

export default function AppLayout() {
  const { colorScheme } = useColorScheme();
  const { t } = useTranslation();
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
          title: t('navigation.tabs.home'),
          tabBarIcon: ({ color }) => <Home size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('navigation.tabs.profile'),
          tabBarIcon: ({ color }) => <User size={24} color={color} />,
        }}
      />
    </Tabs>
  );
} 