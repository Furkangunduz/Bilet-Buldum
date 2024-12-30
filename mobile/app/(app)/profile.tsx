import { Bell, ChevronRight, CreditCard, LogOut, Settings, User } from 'lucide-react-native';
import { SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../lib/auth';

interface ProfileItem {
  icon: any; // Using 'any' for Lucide icons as they don't have a specific type
  label: string;
  color: string;
}

interface ProfileSectionData {
  title: string;
  items: ProfileItem[];
}

export default function Profile() {
  const { user, signOut } = useAuth();

  const sections: ProfileSectionData[] = [
    {
      title: 'Account',
      items: [
        { icon: User, label: 'Personal Information', color: '#3B82F6' },
        { icon: Bell, label: 'Notifications', color: '#8B5CF6' },
        { icon: Settings, label: 'Preferences', color: '#10B981' },
      ]
    },
    {
      title: 'Memberships',
      items: [
        { icon: CreditCard, label: 'Active Subscriptions', color: '#F59E0B' },
        { icon: CreditCard, label: 'Payment Methods', color: '#F59E0B' },
      ]
    }
  ];

  const ProfileSection = ({ title, items }: ProfileSectionData) => (
    <View className="mb-8">
      <Text className="text-lg font-semibold text-foreground mb-4">{title}</Text>
      <View className="bg-card rounded-lg overflow-hidden">
        {items.map((item, index) => (
          <TouchableOpacity
            key={item.label}
            className={`flex-row items-center p-4 ${
              index !== items.length - 1 ? 'border-b border-border' : ''
            }`}
          >
            <View className="w-8 h-8 rounded-full bg-opacity-10 items-center justify-center" style={{ backgroundColor: `${item.color}20` }}>
              <item.icon size={18} color={item.color} />
            </View>
            <Text className="flex-1 ml-3 text-foreground">{item.label}</Text>
            <ChevronRight size={20} className="text-muted-foreground" />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView className='flex-1 bg-background'>
      <ScrollView className="flex-1 bg-background">
        <View className="p-4">
          <View className="bg-card p-6 rounded-lg mb-8">
            <View className="items-center space-y-2 mb-4">
              <View className="w-20 h-20 rounded-full bg-primary/10 items-center justify-center mb-2">
                <Text className="text-2xl text-primary font-bold">
                  {user?.name?.charAt(0) || 'U'}
                </Text>
              </View>
              <Text className="text-2xl font-bold text-foreground">{user?.name}</Text>
              <Text className="text-muted-foreground">{user?.email}</Text>
            </View>
          </View>

          {sections.map((section) => (
            <ProfileSection key={section.title} {...section} />
          ))}

          <TouchableOpacity
            onPress={signOut}
            className="flex-row items-center justify-center space-x-2 mt-4 p-4 bg-destructive/10 rounded-lg"
          >
            <LogOut color="#EF4444" size={20} />
            <Text className="text-destructive font-medium">Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
} 