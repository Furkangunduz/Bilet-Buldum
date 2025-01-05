import BottomSheet, { BottomSheetBackdrop, BottomSheetBackdropProps, BottomSheetView } from '@gorhom/bottom-sheet';
import { Bell, ChevronRight, FileText, Globe, LogOut, Mail, Palette, Settings, Shield, User } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Alert, Pressable, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { ContactForm } from '~/components/profile/ContactForm';
import { PrivacyPolicy } from '~/components/profile/PrivacyPolicy';
import { TermsOfService } from '~/components/profile/TermsOfService';
import { ThemeToggle } from '~/components/ThemeToggle';
import { LanguageToggle } from '../../components/LanguageToggle';
import { NotificationsForm } from '../../components/profile/NotificationsForm';
import { PasswordForm } from '../../components/profile/PasswordForm';
import { PersonalInfoForm } from '../../components/profile/PersonalInfoForm';
import { authApi, contactApi } from '../../lib/api';
import { useAuth } from '../../lib/auth';

interface ProfileItem {
  icon: any;
  label: string;
  color: string;
  onPress: () => void;
  rightContent?: () => React.ReactNode;
}

interface SectionData {
  title: string;
  items: ProfileItem[];
}

export default function Profile() {
  const { t } = useTranslation();
  const { user, signOut, updateUser } = useAuth();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [activeSheet, setActiveSheet] = useState<'personal' | 'notifications' | 'password' | 'privacyPolicy' | 'termsOfService' | 'contact' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
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

  const [contactForm, setContactForm] = useState({
    subject: '',
    message: ''
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

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
    } catch (error) {
      console.error('Error during logout:', error);
      setIsSigningOut(false);
      Alert.alert('Error', 'Failed to sign out. Please try again.');
    }
  };

  const handleContactSubmit = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await contactApi.sendMessage({
        ...contactForm,
        email: user?.email || ''
      });
      bottomSheetRef.current?.close();
      Alert.alert('Success', 'Your message has been sent. We will get back to you soon.');
      setContactForm({ subject: '', message: '' });
    } catch (err) {
      setError('Failed to send message');
    } finally {
      setIsLoading(false);
    }
  };

  const sections: SectionData[] = [
    {
      title: t('profile.sections.account'),
      items: [
        {
          icon: User,
          label: t('profile.items.personalInfo'),
          color: '#3B82F6',
          onPress: () => {
            setActiveSheet('personal');
            bottomSheetRef.current?.expand();
          }
        },
        {
          icon: Bell,
          label: t('profile.items.notifications'),
          color: '#8B5CF6',
          onPress: () => {
            setActiveSheet('notifications');
            bottomSheetRef.current?.expand();
          }
        },
        {
          icon: Settings,
          label: t('profile.items.changePassword'),
          color: '#10B981',
          onPress: () => {
            setActiveSheet('password');
            bottomSheetRef.current?.expand();
          }
        },
       
        {
          icon: Globe,
          label: t('profile.items.language'),
          color: '#EC4899',
          rightContent: () => <LanguageToggle />,
          onPress: () => {}
        },
        {
          icon: Palette,
          label: t('profile.items.theme'),
          color: '#F59E0B',
          rightContent: () => <ThemeToggle />,
          onPress: () => {}
        },
      ]
    },
    {
      title: t('profile.sections.support'),
      items: [
        // {
        //   icon: Coffee,
        //   label: t('profile.items.buyMeCoffee'),
        //   color: '#FFDD00',
        //   onPress: () => {
        //     Linking.openURL('https://www.buymeacoffee.com/furkangunduz');
        //   }
        // },
        {
          icon: Mail,
          label: t('profile.items.contactUs'),
          color: '#0EA5E9',
          onPress: () => {
            setActiveSheet('contact');
            bottomSheetRef.current?.expand();
          }
        }
      ]
    },
    {
      title: t('profile.sections.legal'),
      items: [
        {
          icon: Shield,
          label: t('profile.items.privacyPolicy'),
          color: '#EF4444',
          onPress: () => {
            setActiveSheet('privacyPolicy');
            bottomSheetRef.current?.expand();
          }
        },
        {
          icon: FileText,
          label: t('profile.items.termsOfService'),
          color: '#6366F1',
          onPress: () => {
            setActiveSheet('termsOfService');
            bottomSheetRef.current?.expand();
          }
        }
      ]
    },
    {
      title: t('profile.sections.dangerZone'),
      items: [
        {
          icon: LogOut,
          label: t('profile.items.deleteAccount'),
          color: '#DC2626',
          onPress: () => {
            Alert.alert(
              t('profile.deleteAccount.title'),
              t('profile.deleteAccount.message'),
              [
                {
                  text: t('profile.deleteAccount.cancel'),
                  style: 'cancel',
                },
                {
                  text: t('profile.deleteAccount.confirm'),
                  style: 'destructive',
                  onPress: async () => {
                    try {
                      await authApi.deleteAccount();
                      await signOut();
                    } catch (error) {
                      Alert.alert('Error', 'Failed to delete account. Please try again.');
                    }
                  },
                },
              ],
              { cancelable: true }
            );
          }
        }
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
      case 'privacyPolicy':
        return <PrivacyPolicy />;

      case 'termsOfService':
        return <TermsOfService />;

      case 'contact':
        return (
         <ContactForm 
         contactForm={contactForm}
         setContactForm={setContactForm}
         onClose={() => bottomSheetRef.current?.close()}
         onSubmit={handleContactSubmit}
         isLoading={isLoading}
         error={error}
         />
        );

      default:
        return null;
    }
  };

  const Section = ({ title, items }: SectionData) => (
    <View className="mb-8">
      <Text className="text-lg font-semibold text-foreground mb-4">{title}</Text>
      <View className="bg-card rounded-lg overflow-hidden">
        {items.map((item, index) => (
          <Pressable
            key={item.label}
            onPress={item.onPress}
            className={`flex-row w-[100%] justify-between items-center py-4 ${
              index !== items.length - 1 ? 'border-b border-border' : ''
            }`}
          >
           <View className="flex-row items-center flex-1 justify-between">
            <View className="flex-row items-center">
              <View className="w-8 h-8 rounded-full bg-opacity-10 items-center justify-center mr-3" style={{ backgroundColor: `${item.color}20` }}>
                <item.icon size={18} color={item.color} />
              </View>
              <Text className="text-foreground">{item.label}</Text>
            </View>
              {item.rightContent ? item.rightContent() : (
              <ChevronRight size={20} className="text-muted-foreground" />
            )}
           </View>
          </Pressable>
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
        opacity={0.5}
      />
    ),
    []
  );

  return (
  isSigningOut ? <View className="flex-1 items-center justify-center" style={{ backgroundColor: isDark ? 'hsl(224 71% 4%)' : 'hsl(0 0% 100%)' }}>
    <ActivityIndicator size="large" className="text-primary" />
  </View> :
    <SafeAreaView className='flex-1 bg-background'>
      <View className="flex-row justify-between items-center px-10 pb-1">
        <Text className="text-xl font-semibold text-foreground">{t('profile.title')}</Text>
        <TouchableOpacity
          onPress={handleSignOut}
          className="p-2 rounded-full bg-destructive/10 active:bg-destructive/20"
        >
          <LogOut size={20} color={isDark ? 'hsl(0 0% 100%)' : 'hsl(220.9 76.2% 48%)'} />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 bg-background">
        <View className="p-4">
          <View className="bg-card p-6 rounded-lg mb-8">
            <View className="items-center gap-2 mb-4">
              <View className="w-20 h-20 rounded-full bg-primary/10 items-center justify-center mb-2">
                <Text className="text-2xl text-primary font-bold">
                  {user?.firstName?.charAt(0) || 'U'}
                </Text>
              </View>
              <Text className="text-2xl font-bold text-foreground">{user ? `${user.firstName} ${user.lastName}` : ''}</Text>
              <Text className="text-muted-foreground">{user?.email}</Text>
            </View>
          </View>

          <View className="px-4 ">
          {sections.map((section) => (
            <Section key={section.title} {...section} />
          ))}
          </View>

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
          backgroundColor: isDark ? 'hsl(224 71% 4%)' : 'hsl(0 0% 100%)',
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          borderTopWidth: 1,
          borderTopColor: isDark ? 'hsl(240 3.7% 15.9%)' : 'hsl(240 5.9% 90%)',
          shadowColor: isDark ? 'hsl(240 3.7% 15.9%)' : '#000',
          shadowOffset: {
            width: 0,
            height: -4,
          },
          shadowOpacity: isDark ? 0.5 : 0.1,
          shadowRadius: 8,
          elevation: 16,
        }}
        handleIndicatorStyle={{
          backgroundColor: isDark ? 'hsl(240 5% 64.9%)' : 'hsl(240 3.8% 46.1%)',
          width: 32,
          height: 4,
          borderRadius: 2,
        }}
      >
        <BottomSheetView className="flex-1 bg-background">
          {renderBottomSheetContent()}
        </BottomSheetView>
      </BottomSheet>
    </SafeAreaView>
  );
} 