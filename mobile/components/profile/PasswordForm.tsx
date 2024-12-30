import { X } from 'lucide-react-native';
import { ActivityIndicator, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface PasswordFormProps {
  passwordForm: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  };
  onClose: () => void;
  onSubmit: () => Promise<void>;
  onChangePassword: (form: { currentPassword: string; newPassword: string; confirmPassword: string }) => void;
  isLoading: boolean;
  error: string | null;
}

export function PasswordForm({
  passwordForm,
  onClose,
  onSubmit,
  onChangePassword,
  isLoading,
  error
}: PasswordFormProps) {
  return (
    <View className="p-4 space-y-4">
      <View className="flex-row justify-between items-center">
        <Text className="text-xl font-semibold text-foreground">Change Password</Text>
        <TouchableOpacity onPress={onClose}>
          <X size={24} color="#666" />
        </TouchableOpacity>
      </View>

      <View className="space-y-4">
        <View>
          <Text className="text-sm font-medium text-foreground mb-1">Current Password</Text>
          <TextInput
            className="bg-card border border-input rounded-lg px-4 h-12 text-foreground"
            value={passwordForm.currentPassword}
            onChangeText={(text) => onChangePassword({ ...passwordForm, currentPassword: text })}
            placeholder="Enter current password"
            placeholderTextColor="#666"
            secureTextEntry
          />
        </View>

        <View>
          <Text className="text-sm font-medium text-foreground mb-1">New Password</Text>
          <TextInput
            className="bg-card border border-input rounded-lg px-4 h-12 text-foreground"
            value={passwordForm.newPassword}
            onChangeText={(text) => onChangePassword({ ...passwordForm, newPassword: text })}
            placeholder="Enter new password"
            placeholderTextColor="#666"
            secureTextEntry
          />
        </View>

        <View>
          <Text className="text-sm font-medium text-foreground mb-1">Confirm New Password</Text>
          <TextInput
            className="bg-card border border-input rounded-lg px-4 h-12 text-foreground"
            value={passwordForm.confirmPassword}
            onChangeText={(text) => onChangePassword({ ...passwordForm, confirmPassword: text })}
            placeholder="Confirm new password"
            placeholderTextColor="#666"
            secureTextEntry
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
            <Text className="text-primary-foreground font-medium">Update Password</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
} 