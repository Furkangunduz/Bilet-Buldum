import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useAuth } from '../../lib/auth';

export default function Home() {
  const { user } = useAuth();

  return (
    <ScrollView className="flex-1 bg-background">
      <LinearGradient
        colors={['#4c669f', '#3b5998', '#192f6a']}
        className="absolute h-64 w-full"
      />
      <View className="p-4">
        <Animated.View entering={FadeInUp.delay(100)} className="space-y-2">
          <Text className="text-3xl font-bold text-white">
            Welcome back,
          </Text>
          <Text className="text-2xl font-semibold text-white/90">
            {user?.email.split('@')[0]}
          </Text>
          <Text className="text-base text-white/80">
            Find and track your train tickets easily
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(200)} className="mt-8">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-lg font-semibold text-foreground">
              Your Active Alerts
            </Text>
            <TouchableOpacity>
              <Text className="text-primary">See All</Text>
            </TouchableOpacity>
          </View>

          <View className="space-y-4">
            <TouchableOpacity className="bg-white/90 p-4 rounded-2xl shadow-lg">
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <View className="flex-row items-center">
                    <Ionicons name="train-outline" size={24} color="#4c669f" />
                    <Text className="text-lg font-medium text-foreground ml-2">
                      Istanbul - Ankara
                    </Text>
                  </View>
                  <Text className="text-sm text-muted-foreground mt-1">
                    Jan 15, 2024 • Waiting for tickets
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#4c669f" />
              </View>
            </TouchableOpacity>

            <TouchableOpacity className="bg-white/90 p-4 rounded-2xl shadow-lg">
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <View className="flex-row items-center">
                    <Ionicons name="train-outline" size={24} color="#4c669f" />
                    <Text className="text-lg font-medium text-foreground ml-2">
                      Izmir - Ankara
                    </Text>
                  </View>
                  <Text className="text-sm text-muted-foreground mt-1">
                    Jan 20, 2024 • Waiting for tickets
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#4c669f" />
              </View>
            </TouchableOpacity>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(300)} className="mt-8">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-lg font-semibold text-foreground">
              Popular Routes
            </Text>
            <TouchableOpacity>
              <Text className="text-primary">View All</Text>
            </TouchableOpacity>
          </View>

          <View className="space-y-4">
            <TouchableOpacity className="bg-white/90 p-4 rounded-2xl shadow-lg">
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <View className="flex-row items-center">
                    <Ionicons name="flash-outline" size={24} color="#4c669f" />
                    <Text className="text-lg font-medium text-foreground ml-2">
                      Istanbul - Ankara
                    </Text>
                  </View>
                  <Text className="text-sm text-muted-foreground mt-1">
                    High-speed train • 4h 30m
                  </Text>
                </View>
                <View className="bg-primary/10 px-3 py-1 rounded-full">
                  <Text className="text-primary font-medium">Popular</Text>
                </View>
              </View>
            </TouchableOpacity>

            <TouchableOpacity className="bg-white/90 p-4 rounded-2xl shadow-lg">
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <View className="flex-row items-center">
                    <Ionicons name="flash-outline" size={24} color="#4c669f" />
                    <Text className="text-lg font-medium text-foreground ml-2">
                      Ankara - Konya
                    </Text>
                  </View>
                  <Text className="text-sm text-muted-foreground mt-1">
                    High-speed train • 1h 45m
                  </Text>
                </View>
                <View className="bg-primary/10 px-3 py-1 rounded-full">
                  <Text className="text-primary font-medium">Fast</Text>
                </View>
              </View>
            </TouchableOpacity>

            <TouchableOpacity className="bg-white/90 p-4 rounded-2xl shadow-lg">
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <View className="flex-row items-center">
                    <Ionicons name="flash-outline" size={24} color="#4c669f" />
                    <Text className="text-lg font-medium text-foreground ml-2">
                      Istanbul - Izmir
                    </Text>
                  </View>
                  <Text className="text-sm text-muted-foreground mt-1">
                    High-speed train • 3h 30m
                  </Text>
                </View>
                <View className="bg-primary/10 px-3 py-1 rounded-full">
                  <Text className="text-primary font-medium">New</Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </ScrollView>
  );
} 