import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Dimensions, Image, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInRight, FadeOutLeft } from 'react-native-reanimated';
import { authApi } from '~/lib/api';
import { useAuth } from '~/lib/auth';
import { ONBOARDING_STEPS } from '~/lib/constants';

const { width } = Dimensions.get('window');

export default function OnboardingScreen() {
  const [currentStep, setCurrentStep] = useState(0);
  const router = useRouter();
  const { updateUser } = useAuth();

  const handleNext = async () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      try {
        const response = await authApi.completeOnboarding();
        console.log(response.data);
        updateUser(response.data);
        router.replace('/(app)');
      } catch (error) {
        console.error('Error completing onboarding:', error);
      }
    }
  };

  const step = ONBOARDING_STEPS[currentStep];

  return (
    <View className="flex-1 bg-background">
      <View className="flex-1 justify-center items-center px-6">
        <Animated.View 
          key={step.id}
          entering={FadeInRight}
          exiting={FadeOutLeft}
          className="items-center"
        >
          <Image
            source={step.image}
            style={{ width: width * 0.8, height: width * 0.8 }}
            resizeMode="contain"
          />
          <Text className="text-2xl font-bold text-foreground mt-8 text-center">
            {step.title}
          </Text>
          <Text className="text-base text-muted-foreground mt-4 text-center px-4">
            {step.description}
          </Text>
        </Animated.View>
      </View>

      <View className="px-6 pb-12">
        <View className="flex-row justify-center mb-8">
          {ONBOARDING_STEPS.map((_, index) => (
            <View
              key={index}
              className={`h-2 w-2 rounded-full mx-1 ${
                index === currentStep ? 'bg-primary' : 'bg-muted'
              }`}
            />
          ))}
        </View>

        <TouchableOpacity
          onPress={handleNext}
          className="bg-primary h-12 rounded-lg items-center justify-center"
        >
          <Text className="text-primary-foreground text-lg font-semibold">
            {currentStep === ONBOARDING_STEPS.length - 1 ? 'Get Started' : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
} 