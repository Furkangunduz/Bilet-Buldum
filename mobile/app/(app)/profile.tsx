import BottomSheet, { BottomSheetBackdrop, BottomSheetBackdropProps, BottomSheetView } from '@gorhom/bottom-sheet';
import { Bell, ChevronRight, LogOut, Settings, User } from 'lucide-react-native';
import { useCallback, useRef, useState } from 'react';
import { SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { NotificationsForm } from '../../components/profile/NotificationsForm';
import { PasswordForm } from '../../components/profile/PasswordForm';
import { PersonalInfoForm } from '../../components/profile/PersonalInfoForm';
import { authApi } from '../../lib/api';
import { useAuth } from '../../lib/auth';

interface ProfileItem {
  icon: any;
  label: string;
  color: string;
  onPress: () => void;
}

interface ProfileSectionData {
  title: string;
  items: ProfileItem[];
}

export default function Profile() {
  const { user, signOut, updateUser } = useAuth();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [activeSheet, setActiveSheet] = useState<'personal' | 'notifications' | 'password' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [personalInfo, setPersonalInfo] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || ''
  });

  const [notificationPrefs, setNotificationPrefs] = useState({
    email: user?.notificationPreferences?.email || false,
    push: user?.notificationPreferences?.push || false
  });
  
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleUpdatePersonalInfo = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await authApi.updateProfile(personalInfo);
      updateUser(response.data);
      bottomSheetRef.current?.close();
    } catch (err) {
      setError('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateNotifications = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await authApi.updateNotificationPreferences(notificationPrefs);
      updateUser(response.data);
      bottomSheetRef.current?.close();
    } catch (err) {
      setError('Failed to update notification preferences');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      await authApi.updatePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      bottomSheetRef.current?.close();
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setError('Failed to update password');
    } finally {
      setIsLoading(false);
    }
  };

  const sections: ProfileSectionData[] = [
    {
      title: 'Account',
      items: [
        {
          icon: User,
          label: 'Personal Information',
          color: '#3B82F6',
          onPress: () => {
            setActiveSheet('personal');
            bottomSheetRef.current?.expand();
          }
        },
        {
          icon: Bell,
          label: 'Notifications',
          color: '#8B5CF6',
          onPress: () => {
            setActiveSheet('notifications');
            bottomSheetRef.current?.expand();
          }
        },
        {
          icon: Settings,
          label: 'Change Password',
          color: '#10B981',
          onPress: () => {
            setActiveSheet('password');
            bottomSheetRef.current?.expand();
          }
        },
      ]
    }
  ];

  const renderBottomSheetContent = () => {
    switch (activeSheet) {
      case 'personal':
        return (
          <PersonalInfoForm
            personalInfo={personalInfo}
            onClose={() => bottomSheetRef.current?.close()}
            onSubmit={handleUpdatePersonalInfo}
            onChangeInfo={setPersonalInfo}
            isLoading={isLoading}
            error={error}
          />
        );

      case 'notifications':
        return (
          <NotificationsForm
            preferences={notificationPrefs}
            onClose={() => bottomSheetRef.current?.close()}
            onSubmit={handleUpdateNotifications}
            onChangePreferences={setNotificationPrefs}
            isLoading={isLoading}
            error={error}
          />
        );

      case 'password':
        return (
          <PasswordForm
            passwordForm={passwordForm}
            onClose={() => bottomSheetRef.current?.close()}
            onSubmit={handleUpdatePassword}
            onChangePassword={setPasswordForm}
            isLoading={isLoading}
            error={error}
          />
        );

      default:
        return null;
    }
  };

  const ProfileSection = ({ title, items }: ProfileSectionData) => (
    <View className="mb-8">
      <Text className="text-lg font-semibold text-foreground mb-4">{title}</Text>
      <View className="bg-card rounded-lg overflow-hidden">
        {items.map((item, index) => (
          <TouchableOpacity
            key={item.label}
            onPress={item.onPress}
            className={`flex-row items-center p-4 ${
              index !== items.length - 1 ? 'border-b border-border' : ''
            }`}
          >
            <View className="w-8 h-8 rounded-full bg-opacity-10 items-center justify-center" style={{ backgroundColor: `${item.color}20` }}>
              <item.icon size={18} color={item.color} />
            </View>
            <Text className="flex-1 ml-3 text-foreground">{item.label}</Text>
            <ChevronRight size={20} className="text-muted-foreground" />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        pressBehavior="close"
      />
    ),
    []
  );

  return (
    <SafeAreaView className='flex-1 bg-background'>
      <ScrollView className="flex-1 bg-background">
        <View className="p-4">
          <View className="bg-card p-6 rounded-lg mb-8">
            <View className="items-center gap-2 mb-4">
              <View className="w-20 h-20 rounded-full bg-primary/10 items-center justify-center mb-2">
                <Text className="text-2xl text-primary font-bold">
                  {user?.firstName?.charAt(0) || 'U'}
                </Text>
              </View>
              <Text className="text-2xl font-bold text-foreground">{`${user?.firstName} ${user?.lastName}`}</Text>
              <Text className="text-muted-foreground">{user?.email}</Text>
            </View>
          </View>

          {sections.map((section) => (
            <ProfileSection key={section.title} {...section} />
          ))}

          <TouchableOpacity
            onPress={signOut}
            className="flex-row items-center justify-center gap-2 mt-4 p-4 bg-destructive/10 rounded-lg"
          >
            <LogOut color="#EF4444" size={20} />
            <Text className="text-destructive font-medium">Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <BottomSheet
        ref={bottomSheetRef}
        snapPoints={['80%']}
        index={-1}
        enablePanDownToClose={true}
        onClose={() => {
          setActiveSheet(null);
          setError(null);
        }}
        backdropComponent={renderBackdrop}
        backgroundStyle={{
          backgroundColor: 'hsl(0 0% 100%)',
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          borderTopWidth: 1,
          borderTopColor: 'hsl(240 5.9% 90%)',
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: -4,
          },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 16,
        }}
        handleIndicatorStyle={{
          backgroundColor: 'hsl(240 5.9% 90%)',
          width: 32,
          height: 4,
          borderRadius: 2,
        }}
      >
        <BottomSheetView className="flex-1">
          {renderBottomSheetContent()}
        </BottomSheetView>
      </BottomSheet>
    </SafeAreaView>
  );
} 