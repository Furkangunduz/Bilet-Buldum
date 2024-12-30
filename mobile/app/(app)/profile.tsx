import { LogOut } from 'lucide-react-native';
import { SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../lib/auth';

export default function Profile() {
  const { user, signOut } = useAuth();

  return (
    <SafeAreaView className='flex-1 bg-background'>
      <ScrollView className="flex-1 bg-background">
        <View className="p-4">
          <View className="space-y-2 mb-6">
            <Text className="text-2xl font-bold text-foreground">{user?.name}</Text>
            <Text className="text-muted-foreground">{user?.email}</Text>
          </View>

         
          <TouchableOpacity
            onPress={signOut}
            className="flex-row items-center space-x-2 mt-8 p-4"
          >
            <LogOut color="#EF4444" size={20} />
            <Text className="text-destructive font-medium">Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
} 