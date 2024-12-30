import { Ionicons } from '@expo/vector-icons';
import { BottomSheetBackdrop, BottomSheetModal } from '@gorhom/bottom-sheet';
import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useMemo, useRef } from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useAuth } from '../../lib/auth';

export default function Home() {
  const { user } = useAuth();
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ['50%', '75%'], []);

  const handlePresentPress = useCallback(() => {
    bottomSheetModalRef.current?.present();
  }, []);

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
      />
    ),
    []
  );

  return (
    <View className="flex-1 bg-background">
      <ScrollView className="flex-1">
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
              <TouchableOpacity 
                className="bg-primary/10 px-3 py-1 rounded-full"
                onPress={handlePresentPress}
              >
                <Text className="text-primary font-medium">+ New Alert</Text>
              </TouchableOpacity>
            </View>

            <View className="space-y-4">
              <TouchableOpacity className="bg-white/95 p-4 rounded-2xl shadow-lg border border-gray-100">
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <View className="flex-row items-center">
                      <View className="bg-primary/10 w-10 h-10 rounded-full items-center justify-center">
                        <Ionicons name="train-outline" size={24} color="#4c669f" />
                      </View>
                      <View className="ml-3">
                        <Text className="text-lg font-medium text-foreground">
                          Istanbul - Ankara
                        </Text>
                        <Text className="text-sm text-muted-foreground">
                          Jan 15, 2024 • Waiting for tickets
                        </Text>
                      </View>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#4c669f" />
                </View>
              </TouchableOpacity>

              <TouchableOpacity className="bg-white/95 p-4 rounded-2xl shadow-lg border border-gray-100">
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <View className="flex-row items-center">
                      <View className="bg-primary/10 w-10 h-10 rounded-full items-center justify-center">
                        <Ionicons name="train-outline" size={24} color="#4c669f" />
                      </View>
                      <View className="ml-3">
                        <Text className="text-lg font-medium text-foreground">
                          Izmir - Ankara
                        </Text>
                        <Text className="text-sm text-muted-foreground">
                          Jan 20, 2024 • Waiting for tickets
                        </Text>
                      </View>
                    </View>
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
              <TouchableOpacity className="bg-primary/10 px-3 py-1 rounded-full">
                <Text className="text-primary font-medium">View All</Text>
              </TouchableOpacity>
            </View>

            <View className="space-y-4">
              <TouchableOpacity className="bg-white/95 p-4 rounded-2xl shadow-lg border border-gray-100">
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <View className="flex-row items-center">
                      <View className="bg-primary/10 w-10 h-10 rounded-full items-center justify-center">
                        <Ionicons name="flash-outline" size={24} color="#4c669f" />
                      </View>
                      <View className="ml-3">
                        <Text className="text-lg font-medium text-foreground">
                          Istanbul - Ankara
                        </Text>
                        <Text className="text-sm text-muted-foreground">
                          High-speed train • 4h 30m
                        </Text>
                      </View>
                    </View>
                  </View>
                  <View className="bg-primary/10 px-3 py-1 rounded-full">
                    <Text className="text-primary font-medium">Popular</Text>
                  </View>
                </View>
              </TouchableOpacity>

              <TouchableOpacity className="bg-white/95 p-4 rounded-2xl shadow-lg border border-gray-100">
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <View className="flex-row items-center">
                      <View className="bg-primary/10 w-10 h-10 rounded-full items-center justify-center">
                        <Ionicons name="flash-outline" size={24} color="#4c669f" />
                      </View>
                      <View className="ml-3">
                        <Text className="text-lg font-medium text-foreground">
                          Ankara - Konya
                        </Text>
                        <Text className="text-sm text-muted-foreground">
                          High-speed train • 1h 45m
                        </Text>
                      </View>
                    </View>
                  </View>
                  <View className="bg-primary/10 px-3 py-1 rounded-full">
                    <Text className="text-primary font-medium">Fast</Text>
                  </View>
                </View>
              </TouchableOpacity>

              <TouchableOpacity className="bg-white/95 p-4 rounded-2xl shadow-lg border border-gray-100">
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <View className="flex-row items-center">
                      <View className="bg-primary/10 w-10 h-10 rounded-full items-center justify-center">
                        <Ionicons name="flash-outline" size={24} color="#4c669f" />
                      </View>
                      <View className="ml-3">
                        <Text className="text-lg font-medium text-foreground">
                          Istanbul - Izmir
                        </Text>
                        <Text className="text-sm text-muted-foreground">
                          High-speed train • 3h 30m
                        </Text>
                      </View>
                    </View>
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

      <BottomSheetModal
        ref={bottomSheetModalRef}
        index={0}
        snapPoints={snapPoints}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
      >
        <View className="flex-1 p-6">
          <Text className="text-2xl font-bold text-foreground mb-6">
            Create New Alert
          </Text>
          
          <View className="space-y-4">
            <View className="space-y-2">
              <Text className="text-sm font-medium text-foreground">From</Text>
              <View className="flex-row items-center bg-card border border-input rounded-xl px-4">
                <Ionicons name="location-outline" size={20} color="#666" />
                <TextInput
                  className="flex-1 h-12 ml-2 text-base"
                  placeholder="Departure station"
                  placeholderTextColor="#666"
                />
              </View>
            </View>

            <View className="space-y-2">
              <Text className="text-sm font-medium text-foreground">To</Text>
              <View className="flex-row items-center bg-card border border-input rounded-xl px-4">
                <Ionicons name="location-outline" size={20} color="#666" />
                <TextInput
                  className="flex-1 h-12 ml-2 text-base"
                  placeholder="Arrival station"
                  placeholderTextColor="#666"
                />
              </View>
            </View>

            <View className="space-y-2">
              <Text className="text-sm font-medium text-foreground">Date</Text>
              <TouchableOpacity className="flex-row items-center bg-card border border-input rounded-xl px-4 h-12">
                <Ionicons name="calendar-outline" size={20} color="#666" />
                <Text className="flex-1 ml-2 text-base text-muted-foreground">
                  Select date
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity className="bg-primary h-12 rounded-xl items-center justify-center mt-4">
              <Text className="text-primary-foreground font-semibold text-base">
                Create Alert
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </BottomSheetModal>
    </View>
  );
} 