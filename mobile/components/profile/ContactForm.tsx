import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface ContactFormProps {
  contactForm: {
    subject: string;
    message: string;
  };
  setContactForm: (form: { subject: string; message: string }) => void;
  onClose: () => void;
  onSubmit: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export function ContactForm({
  contactForm,
  setContactForm,
  onClose,
  onSubmit,
  isLoading,
  error
}: ContactFormProps) {
  const { t } = useTranslation();

  return (
    <View className="p-6">
      <View className="flex-row justify-between items-center mb-6">
        <Text className="text-xl font-semibold text-foreground">{t('profile.contact.title')}</Text>
        <TouchableOpacity onPress={onClose}>
          <Text className="text-primary">{t('common.close')}</Text>
        </TouchableOpacity>
      </View>

      <View className="gap-6">
        <View>
          <Text className="text-sm font-medium text-foreground mb-2">{t('profile.contact.subject')}</Text>
          <TextInput
            className="p-3 rounded-md bg-input border border-border text-foreground"
            placeholder={t('profile.contact.subjectPlaceholder')}
            placeholderTextColor="#666"
            value={contactForm.subject}
            onChangeText={(text) => setContactForm({ ...contactForm, subject: text })}
          />
        </View>

        <View>
          <Text className="text-sm font-medium text-foreground mb-2">{t('profile.contact.message')}</Text>
          <TextInput
            className="p-3 rounded-md bg-input border border-border text-foreground"
            placeholder={t('profile.contact.messagePlaceholder')}
            placeholderTextColor="#666"
            multiline
            numberOfLines={10}
            textAlignVertical="top"
            value={contactForm.message}
            onChangeText={(text) => setContactForm({ ...contactForm, message: text })}
          />
        </View>

        {error && (
          <Text className="text-destructive text-sm">{error}</Text>
        )}

        <TouchableOpacity
          className="bg-primary p-4 rounded-md"
          onPress={onSubmit}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-primary-foreground text-center font-semibold">
              {t('profile.contact.sendMessage')}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
} 