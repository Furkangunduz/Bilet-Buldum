import { X } from 'lucide-react-native';
import { ActivityIndicator, Text, TextInput, TouchableOpacity, View } from 'react-native';

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
  return (
    <View className="p-4 space-y-4">
      <View className="flex-row justify-between items-center">
        <Text className="text-xl font-semibold text-foreground">Personal Information</Text>
        <TouchableOpacity onPress={onClose}>
          <X size={24} color="#666" />
        </TouchableOpacity>
      </View>

      <View className="space-y-4">
        <View>
          <Text className="text-sm font-medium text-foreground mb-1">First Name</Text>
          <TextInput
            className="bg-card border border-input rounded-lg px-4 h-12 text-foreground"
            value={personalInfo.firstName}
            onChangeText={(text) => onChangeInfo({ ...personalInfo, firstName: text })}
            placeholder="Enter your first name"
            placeholderTextColor="#666"
          />
        </View>

        <View>
          <Text className="text-sm font-medium text-foreground mb-1">Last Name</Text>
          <TextInput
            className="bg-card border border-input rounded-lg px-4 h-12 text-foreground"
            value={personalInfo.lastName}
            onChangeText={(text) => onChangeInfo({ ...personalInfo, lastName: text })}
            placeholder="Enter your last name"
            placeholderTextColor="#666"
          />
        </View>

        {error && (
          <Text className="text-red-500 text-sm">{error}</Text>
        )}

        <TouchableOpacity
          onPress={onSubmit}
          disabled={isLoading}
          className="bg-primary h-12 rounded-lg items-center justify-center"
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-primary-foreground font-medium">Save Changes</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
} 