import { User, X } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { useEffect, useRef } from 'react';
import { ActivityIndicator, Animated, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface PersonalInfoFormProps {
  personalInfo: {
    firstName: string;
    lastName: string;
  };
  onClose: () => void;
  onSubmit: () => Promise<void>;
  onChangeInfo: (info: { firstName: string; lastName: string }) => void;
  isLoading: boolean;
  error: string | null;
}

export function PersonalInfoForm({
  personalInfo,
  onClose,
  onSubmit,
  onChangeInfo,
  isLoading,
  error
}: PersonalInfoFormProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View style={{ opacity: fadeAnim }} className="p-4 bg-background">
      <View className="flex-row justify-between items-center mb-6">
        <Text className="text-2xl font-bold text-foreground">Personal Information</Text>
        <TouchableOpacity 
          onPress={onClose}
          className="p-2 rounded-full bg-muted/10 active:bg-muted/20"
        >
          <X size={20} color={isDark ? '#A1A1AA' : '#71717A'} />
        </TouchableOpacity>
      </View>

      <View>
        <View className="mb-5">
          <Text className="text-sm font-semibold text-muted-foreground mb-2">First Name</Text>
          <View className="relative">
            <View className="absolute left-3 top-3 z-10">
              <User size={20} color={isDark ? '#A1A1AA' : '#71717A'} />
            </View>
            <TextInput
              className="bg-card border border-input rounded-xl pl-11 pr-4 h-12 text-foreground"
              value={personalInfo.firstName}
              onChangeText={(text) => onChangeInfo({ ...personalInfo, firstName: text })}
              placeholder="Enter your first name"
              placeholderTextColor={isDark ? '#A1A1AA' : '#71717A'}
            />
          </View>
        </View>

        <View className="mb-5">
          <Text className="text-sm font-semibold text-muted-foreground mb-2">Last Name</Text>
          <View className="relative">
            <View className="absolute left-3 top-3 z-10">
              <User size={20} color={isDark ? '#A1A1AA' : '#71717A'} />
            </View>
            <TextInput
              className="bg-card border border-input rounded-xl pl-11 pr-4 h-12 text-foreground"
              value={personalInfo.lastName}
              onChangeText={(text) => onChangeInfo({ ...personalInfo, lastName: text })}
              placeholder="Enter your last name"
              placeholderTextColor={isDark ? '#A1A1AA' : '#71717A'}
            />
          </View>
        </View>

        {error && (
          <View className="bg-destructive/10 p-3 rounded-lg mb-5">
            <Text className="text-destructive text-sm">{error}</Text>
          </View>
        )}

        <TouchableOpacity
          onPress={onSubmit}
          disabled={isLoading}
          className={`h-12 rounded-xl items-center justify-center ${isLoading ? 'bg-primary/70' : 'bg-primary active:bg-primary/90'}`}
        >
          {isLoading ? (
            <ActivityIndicator color={isDark ? '#000' : '#fff'} />
          ) : (
            <Text className="text-primary-foreground font-semibold">Save Changes</Text>
          )}
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
} 