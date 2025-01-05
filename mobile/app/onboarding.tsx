import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  FadeInRight,
  FadeOutLeft,
  SlideInRight,
  SlideOutLeft
} from 'react-native-reanimated';
import { authApi } from '~/lib/api';
import { useAuth } from '~/lib/auth';
import { ONBOARDING_STEPS } from '~/lib/constants';


const COLORS = {
  step1: ['rgba(59, 130, 246, 0.1)', 'transparent'] as const,
  step2: ['rgba(139, 92, 246, 0.1)', 'transparent'] as const,
  step3: ['rgba(236, 72, 153, 0.1)', 'transparent'] as const,
};

export default function OnboardingScreen() {
  const [currentStep, setCurrentStep] = useState(0);
  const router = useRouter();
  const { updateUser } = useAuth();

  const progress = ((currentStep + 1) / ONBOARDING_STEPS.length) * 100;

  const handleNext = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      try {
        const response = await authApi.completeOnboarding();
        updateUser(response.data);
        router.replace('/(app)');
      } catch (error) {
        console.error('Error completing onboarding:', error);
      }
    }
  };

  const handleSkip = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      const response = await authApi.completeOnboarding();
      updateUser(response.data);
      router.replace('/(app)');
    } catch (error) {
      console.error('Error completing onboarding:', error);
    }
  };

  const step = ONBOARDING_STEPS[currentStep];
  const gradientColors = COLORS[`step${currentStep + 1}` as keyof typeof COLORS];

  return (
    <View className="flex-1 bg-background">
      <LinearGradient
        colors={gradientColors}
        className="absolute top-0 left-0 right-0 h-96"
      />
      
      <TouchableOpacity
        onPress={handleSkip}
        className="absolute top-12 right-6 z-10"
      >
        <Text className="text-primary font-medium text-base">Skip</Text>
      </TouchableOpacity>

      <View className="flex-1 justify-center items-center px-6">
        <Animated.View 
          key={step.id}
          entering={FadeInRight.springify().damping(15)}
          exiting={FadeOutLeft.springify().damping(15)}
          className="items-center w-full"
        >
          {/* Emoji or Icon Container */}
          <Animated.View 
            entering={SlideInRight.delay(200)}
            exiting={SlideOutLeft}
            className="w-24 h-24 rounded-3xl bg-primary/10 items-center justify-center mb-8"
          >
            <Text className="text-4xl">
              {currentStep === 0 ? '🚂' : currentStep === 1 ? '🔔' : '✨'}
            </Text>
          </Animated.View>

          {/* Title with animated container */}
          <Animated.View
            entering={SlideInRight.delay(300)}
            exiting={SlideOutLeft}
            className="w-full"
          >
            <Text className="text-4xl font-bold text-foreground text-center">
              {step.title}
            </Text>
          </Animated.View>

          {/* Description with animated container */}
          <Animated.View
            entering={SlideInRight.delay(400)}
            exiting={SlideOutLeft}
            className="mt-6"
          >
            <Text className="text-xl text-muted-foreground text-center leading-7 px-4">
              {step.description}
            </Text>
          </Animated.View>
        </Animated.View>
      </View>

      <View className="px-6 pb-12">
        {/* Progress Bar */}
        <View className="h-1 bg-muted rounded-full mb-12 overflow-hidden">
          <Animated.View
            className="h-full bg-primary rounded-full"
            style={{ width: `${progress}%` }}
          />
        </View>

        <TouchableOpacity
          onPress={handleNext}
          className="bg-primary h-14 rounded-2xl items-center justify-center shadow-lg shadow-primary/20"
          style={{
            transform: [{ scale: 1.02 }],
          }}
        >
          <Text className="text-primary-foreground text-lg font-semibold">
            {currentStep === ONBOARDING_STEPS.length - 1 ? 'Get Started' : 'Continue'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
} 