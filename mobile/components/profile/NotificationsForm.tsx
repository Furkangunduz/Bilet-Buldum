import { X } from 'lucide-react-native';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';

interface NotificationsFormProps {
  preferences: {
    email: boolean;
    push: boolean;
  };
  onClose: () => void;
  onSubmit: () => Promise<void>;
  onChangePreferences: (prefs: { email: boolean; push: boolean }) => void;
  isLoading: boolean;
  error: string | null;
}

export function NotificationsForm({
  preferences,
  onClose,
  onSubmit,
  onChangePreferences,
  isLoading,
  error
}: NotificationsFormProps) {
  return (
    <View className="p-4 space-y-4">
      <View className="flex-row justify-between items-center">
        <Text className="text-xl font-semibold text-foreground">Notification Preferences</Text>
        <TouchableOpacity onPress={onClose}>
          <X size={24} color="#666" />
        </TouchableOpacity>
      </View>

      <View className="space-y-4">
        <TouchableOpacity
          onPress={() => onChangePreferences({ ...preferences, email: !preferences.email })}
          className="flex-row items-center justify-between p-4 bg-card border border-input rounded-lg"
        >
          <Text className="text-foreground font-medium">Email Notifications</Text>
          <View className={`w-6 h-6 rounded-full ${preferences.email ? 'bg-primary' : 'bg-muted'}`} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => onChangePreferences({ ...preferences, push: !preferences.push })}
          className="flex-row items-center justify-between p-4 bg-card border border-input rounded-lg"
        >
          <Text className="text-foreground font-medium">Push Notifications</Text>
          <View className={`w-6 h-6 rounded-full ${preferences.push ? 'bg-primary' : 'bg-muted'}`} />
        </TouchableOpacity>

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