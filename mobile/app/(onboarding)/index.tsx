import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { FlatList, Image, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { ONBOARDING_STEPS } from '../../lib/constants';

export default function Onboarding() {
  const { width } = useWindowDimensions();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const renderItem = ({ item }: { item: typeof ONBOARDING_STEPS[0] }) => (
    <View style={{ width }} className="items-center justify-center px-4">
      <Image source={item.image} className="w-64 h-64 mb-8" resizeMode="contain" />
      <Text className="text-2xl font-bold text-foreground mb-2">{item.title}</Text>
      <Text className="text-muted-foreground text-center">{item.description}</Text>
    </View>
  );

  const handleNext = () => {
    if (currentIndex === ONBOARDING_STEPS.length - 1) {
      handleFinish();
    } else {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    }
  };

  const handleFinish = async () => {
    await AsyncStorage.setItem('has_seen_onboarding', 'true');
    router.replace('/(auth)/sign-in');
  };

  return (
    <View className="flex-1 bg-background">
      <FlatList
        ref={flatListRef}
        data={ONBOARDING_STEPS}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);
        }}
      />

      <View className="p-4 gap-4">
        <View className="flex-row justify-center gap-2">
          {ONBOARDING_STEPS.map((_, index) => (
            <View
              key={index}
              className={`h-2 rounded-full ${
                index === currentIndex ? 'w-4 bg-primary' : 'w-2 bg-muted'
              }`}
            />
          ))}
        </View>

        <TouchableOpacity
          className="bg-primary h-10 rounded-md items-center justify-center"
          onPress={handleNext}
        >
          <Text className="text-primary-foreground font-medium">
            {currentIndex === ONBOARDING_STEPS.length - 1 ? 'Get Started' : 'Next'}
          </Text>
        </TouchableOpacity>

        {currentIndex < ONBOARDING_STEPS.length - 1 && (
          <TouchableOpacity onPress={handleFinish}>
            <Text className="text-muted-foreground text-center">Skip</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
} 