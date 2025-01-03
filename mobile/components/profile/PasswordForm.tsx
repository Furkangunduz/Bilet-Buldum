import { Eye, EyeOff, Lock, X } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Text, TextInput, TouchableOpacity, View } from 'react-native';

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

interface PasswordInputProps {
  label: string;
  value: string;
  onChange: (text: string) => void;
  placeholder: string;
  showPassword: boolean;
  toggleShow: () => void;
  isFirst?: boolean;
}

export function PasswordForm({
  passwordForm,
  onClose,
  onSubmit,
  onChangePassword,
  isLoading,
  error
}: PasswordFormProps) {
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  const PasswordInput = ({ 
    label, 
    value, 
    onChange, 
    placeholder,
    showPassword,
    toggleShow,
    isFirst
  }: PasswordInputProps) => (
    <View className='mb-6' >
      <Text className="text-sm font-semibold text-foreground/80 mb-2">{label}</Text>
      <View className="relative">
        <View className="absolute left-3 top-3 z-10">
          <Lock size={20} color="#666" />
        </View>
        <TextInput
          className="bg-card border border-input rounded-xl pl-11 pr-12 h-12 text-foreground"
          value={value}
          onChangeText={onChange}
          placeholder={placeholder}
          placeholderTextColor="#666"
          secureTextEntry={!showPassword}
        />
        <TouchableOpacity 
          onPress={toggleShow}
          className="absolute right-3 top-3 z-10"
        >
          {showPassword ? (
            <EyeOff size={20} color="#666" />
          ) : (
            <Eye size={20} color="#666" />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <Animated.View 
      style={{ 
        opacity: fadeAnim,
        transform: [{ scale: scaleAnim }]
      }} 
      className="p-4"
    >
      <View className="flex-row justify-between items-center mb-6">
        <Text className="text-2xl font-bold text-foreground">Change Password</Text>
        <TouchableOpacity 
          onPress={onClose}
          className="p-2 rounded-full bg-muted/10 active:bg-muted/20"
        >
          <X size={20} color="#666" />
        </TouchableOpacity>
      </View>

      <View>
        <PasswordInput
          label="Current Password"
          value={passwordForm.currentPassword}
          onChange={(text: string) => onChangePassword({ ...passwordForm, currentPassword: text })}
          placeholder="Enter current password"
          showPassword={showPasswords.current}
          toggleShow={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
          isFirst={true}
        />

        <PasswordInput
          label="New Password"
          value={passwordForm.newPassword}
          onChange={(text: string) => onChangePassword({ ...passwordForm, newPassword: text })}
          placeholder="Enter new password"
          showPassword={showPasswords.new}
          toggleShow={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
          isFirst={false}
        />

        <PasswordInput
          label="Confirm New Password"
          value={passwordForm.confirmPassword}
          onChange={(text: string) => onChangePassword({ ...passwordForm, confirmPassword: text })}
          placeholder="Confirm new password"
          showPassword={showPasswords.confirm}
          toggleShow={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
          isFirst={false}
        />

        {error && (
          <View className="bg-red-500/10 p-3 rounded-lg mb-5">
            <Text className="text-red-500 text-sm">{error}</Text>
          </View>
        )}

        <TouchableOpacity
          onPress={onSubmit}
          disabled={isLoading}
          className={`h-12 rounded-xl items-center justify-center ${
            isLoading ? 'bg-primary/70' : 'bg-primary active:bg-primary/90'
          }`}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-primary-foreground font-semibold">Update Password</Text>
          )}
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
} 