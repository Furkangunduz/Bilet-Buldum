import * as Haptics from 'expo-haptics';
import { useCallback } from 'react';
import { Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useLanguage } from '../lib/i18n/useLanguage';

export function LanguageToggle() {
  const { isTurkish, changeLanguage } = useLanguage();
  const translateX = useSharedValue(isTurkish ? 0 : 44);
  const isPressed = useSharedValue(false);

  const handleLanguageChange = useCallback((toTurkish: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    changeLanguage(toTurkish ? 'tr' : 'en');
    translateX.value = withSpring(toTurkish ? 0 : 44, {
      damping: 15,
      stiffness: 150,
    });
  }, [changeLanguage, translateX]);

  const tap = Gesture.Tap()
    .onBegin((event) => {
      'worklet';
      isPressed.value = true;
      if (event.x < 44 && !isTurkish) {
        runOnJS(handleLanguageChange)(true);
      } else if (event.x >= 44 && isTurkish) {
        runOnJS(handleLanguageChange)(false);
      }
    })
    .onFinalize(() => {
      'worklet';
      isPressed.value = false;
    });

  const pan = Gesture.Pan()
    .onChange((event) => {
      'worklet';
      const newX = translateX.value + event.changeX;
      if (newX >= 0 && newX <= 44) {
        translateX.value = newX;
      }
    })
    .onEnd((event) => {
      'worklet';
      if (event.velocityX < -100 && isTurkish) {
        runOnJS(handleLanguageChange)(false);
      } else if (event.velocityX > 100 && !isTurkish) {
        runOnJS(handleLanguageChange)(true);
      } else {
        // Determine position based on where the pill is
        const shouldBeTurkish = translateX.value < 22;
        if (shouldBeTurkish !== isTurkish) {
          runOnJS(handleLanguageChange)(shouldBeTurkish);
        } else {
          translateX.value = withSpring(isTurkish ? 0 : 44, {
            damping: 15,
            stiffness: 150,
          });
        }
      }
    });

  const gesture = Gesture.Race(tap, pan);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <GestureDetector gesture={gesture}>
      <View className="flex-row bg-muted/20 rounded-lg p-0.5 relative">
        <Animated.View 
          className="absolute w-[44px] h-[28px] bg-primary rounded"
          style={animatedStyle}
        />
        <View className="flex-row">
          <View className="w-[44px] h-[28px] items-center justify-center">
            <Text className={`text-sm font-medium ${isTurkish ? 'text-primary-foreground' : 'text-muted-foreground'}`}>
              TR
            </Text>
          </View>
          <View className="w-[44px] h-[28px] items-center justify-center">
            <Text className={`text-sm font-medium ${!isTurkish ? 'text-primary-foreground' : 'text-muted-foreground'}`}>
              EN
            </Text>
          </View>
        </View>
      </View>
    </GestureDetector>
  );
} 