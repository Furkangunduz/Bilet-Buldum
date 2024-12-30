import { User, X } from 'lucide-react-native';
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

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View style={{ opacity: fadeAnim }} className="p-4">
      <View className="flex-row justify-between items-center mb-6">
        <Text className="text-2xl font-bold text-foreground">Personal Information</Text>
        <TouchableOpacity 
          onPress={onClose}
          className="p-2 rounded-full bg-muted/10 active:bg-muted/20"
        >
          <X size={20} color="#666" />
        </TouchableOpacity>
      </View>

      <View>
        <View className="mb-5">
          <Text className="text-sm font-semibold text-foreground/80 mb-2">First Name</Text>
          <View className="relative">
            <View className="absolute left-3 top-3 z-10">
              <User size={20} color="#666" />
            </View>
            <TextInput
              className="bg-card border border-input rounded-xl pl-11 pr-4 h-12 text-foreground"
              value={personalInfo.firstName}
              onChangeText={(text) => onChangeInfo({ ...personalInfo, firstName: text })}
              placeholder="Enter your first name"
              placeholderTextColor="#666"
            />
          </View>
        </View>

        <View className="mb-5">
          <Text className="text-sm font-semibold text-foreground/80 mb-2">Last Name</Text>
          <View className="relative">
            <View className="absolute left-3 top-3 z-10">
              <User size={20} color="#666" />
            </View>
            <TextInput
              className="bg-card border border-input rounded-xl pl-11 pr-4 h-12 text-foreground"
              value={personalInfo.lastName}
              onChangeText={(text) => onChangeInfo({ ...personalInfo, lastName: text })}
              placeholder="Enter your last name"
              placeholderTextColor="#666"
            />
          </View>
        </View>

        {error && (
          <View className="bg-red-500/10 p-3 rounded-lg mb-5">
            <Text className="text-red-500 text-sm">{error}</Text>
          </View>
        )}

        <TouchableOpacity
          onPress={onSubmit}
          disabled={isLoading}
          className={`h-12 rounded-xl items-center justify-center ${isLoading ? 'bg-primary/70' : 'bg-primary active:bg-primary/90'}`}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-primary-foreground font-semibold">Save Changes</Text>
          )}
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
} 